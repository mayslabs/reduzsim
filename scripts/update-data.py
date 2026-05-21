from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
RESULT_JS = ROOT / "result.js"
REDUCAO_JS = ROOT / "reducao.js"
REDUCAO_HTML = ROOT / "reducao.html"

UF_ORDER = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

VAU_LABELS = {
    "Casa Popular": "RPOP",
    "Comercial": "COM",
    "Conjunto Habitacional Popular": "CHAB",
    "Edifício de Garagens": "EGAR",
    "Galpão Industrial": "GALP",
    "Residencial Multifamiliar": "RMUL",
    "Residencial Unifamiliar": "RES",
}

VAU_KEY_ORDER = ["RPOP", "COM", "CHAB", "EGAR", "GALP", "RMUL", "RES"]


def today_brasilia() -> dt.date:
    # GitHub Actions runs in UTC. This fixed offset is enough for Brazil, which
    # currently does not observe daylight saving time.
    return (dt.datetime.now(dt.UTC) - dt.timedelta(hours=3)).date()


def now_brasilia() -> dt.datetime:
    return dt.datetime.now(dt.UTC) - dt.timedelta(hours=3)


def add_month(year: int, month: int, delta: int) -> tuple[int, int]:
    index = (year * 12 + (month - 1)) + delta
    return index // 12, index % 12 + 1


def iter_months(start: tuple[int, int], end: tuple[int, int]):
    year, month = start
    while (year, month) <= end:
        yield year, month
        year, month = add_month(year, month, 1)


def month_key(year: int, month: int) -> str:
    return f"{year:04d}-{month:02d}"


def br_money_to_float(value: str) -> float:
    return float(value.replace(".", "").replace(",", "."))


def fetch_bytes(url: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 ReduzSim index updater"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def fetch_json(url: str):
    return json.loads(fetch_bytes(url).decode("utf-8"))


def replace_const(text: str, const_name: str, replacement: str, kind: str) -> str:
    opener = "[" if kind == "array" else "{"
    closer = "]" if kind == "array" else "}"
    pattern = rf"const {re.escape(const_name)} = \{opener}\n.*?\n\{closer};"
    updated, count = re.subn(pattern, replacement, text, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Não foi possível substituir {const_name} em JS.")
    return updated


def replace_string_const(text: str, const_name: str, value: str) -> str:
    replacement = f'const {const_name} = "{value}";'
    pattern = rf'const {re.escape(const_name)} = ".*?";'
    updated, count = re.subn(pattern, replacement, text, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Não foi possível substituir {const_name} em JS.")
    return updated


def fetch_selic_monthly(start: dt.date, end: dt.date) -> dict[str, float]:
    params = urllib.parse.urlencode({
        "formato": "json",
        "dataInicial": start.strftime("%d/%m/%Y"),
        "dataFinal": end.strftime("%d/%m/%Y"),
    })
    url = f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?{params}"
    data = fetch_json(url)
    monthly: dict[str, float] = {}

    for item in data:
        day, month, year = item["data"].split("/")
        monthly[f"{year}-{month}"] = float(str(item["valor"]).replace(",", "."))

    if not monthly:
        raise RuntimeError("A API do Banco Central não retornou dados de SELIC.")

    return monthly


def build_selic_accumulated(reference: dt.date) -> dict[str, float]:
    start = dt.date(2021, 10, 1)
    monthly = fetch_selic_monthly(start, reference)
    ref_month = (reference.year, reference.month)
    previous_month = add_month(reference.year, reference.month, -1)
    accumulated: dict[str, float] = {}

    for year, month in iter_months((2021, 10), ref_month):
        key = month_key(year, month)
        is_current_or_future = (year, month) >= ref_month
        is_previous_with_grace = (year, month) == previous_month and reference.day <= 15

        if is_current_or_future or is_previous_with_grace:
            accumulated[key] = 0.0
            continue

        # Critério do Sicalc: SELIC acumulada disponível até o mês anterior
        # ao pagamento, acrescida de 1% no mês do pagamento.
        # Ex.: referência 05/2026 usa SELIC até 04/2026 + 1%.
        due_month = add_month(year, month, 1)
        interest_start = add_month(*due_month, 1)
        interest_end = add_month(reference.year, reference.month, -1)
        total = 1.0

        if interest_start <= interest_end:
            for selic_year, selic_month in iter_months(interest_start, interest_end):
                total += monthly.get(month_key(selic_year, selic_month), 0.0)

        accumulated[key] = round(total, 2)

    return accumulated


def render_selic_js(data: dict[str, float]) -> str:
    entries = [f'"{key}": {value:.2f}' for key, value in data.items()]
    lines = ["const SELIC_ACUMULADA = {"]
    for index in range(0, len(entries), 3):
        suffix = "," if index + 3 < len(entries) else ","
        lines.append(f"  {', '.join(entries[index:index + 3])}{suffix}")
    lines.append("};")
    return "\n".join(lines)


def update_selic(reference: dt.date) -> None:
    data = build_selic_accumulated(reference)
    text = REDUCAO_JS.read_text(encoding="utf-8")
    text = replace_const(text, "SELIC_ACUMULADA", render_selic_js(data), "object")
    REDUCAO_JS.write_text(text, encoding="utf-8", newline="\n")
    print(f"SELIC atualizada até {reference:%d/%m/%Y}.")


def parse_existing_vau_month() -> str | None:
    text = RESULT_JS.read_text(encoding="utf-8")
    match = re.search(r'\{\s*data:\s*"(?P<month>\d{2}/\d{4})"', text)
    return match.group("month") if match else None


def parse_vau_pdf(pdf_bytes: bytes, uf: str, period_label: str) -> dict[str, float]:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    row = {"data": period_label, "UF": uf}

    for label, key in VAU_LABELS.items():
        match = re.search(rf"{re.escape(label)}:\s*R\$\s*([\d.]+,\d{{2}})", text)
        if not match:
            raise RuntimeError(f"VAU {uf}: campo não encontrado: {label}")
        row[key] = br_money_to_float(match.group(1))

    return row


def fetch_vau_table(reference: dt.date) -> list[dict[str, float | str]]:
    period = reference.replace(day=1)
    period_param = period.strftime("%Y-%m-%d")
    period_label = period.strftime("%m/%Y")
    rows = []

    for uf in UF_ORDER:
        url = f"https://www.tabelavau.seroassessoria.com.br/vau_visualizar_pdf.php?per={period_param}&uf={uf}"
        print(f"Baixando VAU {period_label} - {uf}...")
        rows.append(parse_vau_pdf(fetch_bytes(url), uf, period_label))

    return rows


def render_vau_js(rows: list[dict[str, float | str]]) -> str:
    lines = ["const VAU_DATA = ["]
    for row in rows:
        fields = [f'data: "{row["data"]}"', f'UF: "{row["UF"]}"']
        fields.extend(f"{key}: {float(row[key]):.2f}" for key in VAU_KEY_ORDER)
        lines.append(f"  {{ {', '.join(fields)} }},")
    lines.append("];")
    return "\n".join(lines)


def update_vau(reference: dt.date, force: bool = False) -> None:
    target_month = reference.strftime("%m/%Y")
    current_month = parse_existing_vau_month()

    if not force and current_month == target_month:
        print(f"VAU já está em {target_month}; nada a atualizar.")
        return

    rows = fetch_vau_table(reference)
    text = RESULT_JS.read_text(encoding="utf-8")
    text = replace_const(text, "VAU_DATA", render_vau_js(rows), "array")
    RESULT_JS.write_text(text, encoding="utf-8", newline="\n")
    print(f"VAU atualizado para {target_month}.")


def update_metadata(timestamp: dt.datetime) -> None:
    label = timestamp.strftime("%d/%m/%Y às %H:%M")
    version = timestamp.strftime("%Y%m%d%H%M")
    text = REDUCAO_JS.read_text(encoding="utf-8")
    text = replace_string_const(text, "INDICES_UPDATED_AT", label)
    REDUCAO_JS.write_text(text, encoding="utf-8", newline="\n")

    html = REDUCAO_HTML.read_text(encoding="utf-8")
    html, note_count = re.subn(
        r"Os índices foram atualizados pela última vez no dia .*?\.",
        f"Os índices foram atualizados pela última vez no dia {label}.",
        html,
        flags=re.S,
    )
    html, script_count = re.subn(
        r'<script src="reducao\.js(?:\?v=[^"]*)?"></script>',
        f'<script src="reducao.js?v={version}"></script>',
        html,
    )
    if note_count != 1 or script_count != 1:
        raise RuntimeError("Não foi possível atualizar a mensagem/cache bust da página de redução.")
    REDUCAO_HTML.write_text(html, encoding="utf-8", newline="\n")
    print(f"Metadados de atualização gravados: {label}.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force-vau", action="store_true", help="Atualiza o VAU mesmo se o mês já estiver igual.")
    args = parser.parse_args()

    reference = today_brasilia()
    update_selic(reference)
    update_vau(reference, force=args.force_vau)
    update_metadata(now_brasilia())
    return 0


if __name__ == "__main__":
    sys.exit(main())
