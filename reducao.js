const SELIC_ACUMULADA = {
  "2021-10": 55.19, "2021-11": 54.42, "2021-12": 53.69,
  "2022-01": 52.93, "2022-02": 52.00, "2022-03": 51.17,
  "2022-04": 50.14, "2022-05": 49.12, "2022-06": 48.09,
  "2022-07": 46.92, "2022-08": 45.85, "2022-09": 44.83,
  "2022-10": 43.81, "2022-11": 42.69, "2022-12": 41.57,
  "2023-01": 40.65, "2023-02": 39.48, "2023-03": 38.56,
  "2023-04": 37.44, "2023-05": 36.37, "2023-06": 35.30,
  "2023-07": 34.16, "2023-08": 33.19, "2023-09": 32.19,
  "2023-10": 31.27, "2023-11": 30.38, "2023-12": 29.41,
  "2024-01": 28.61, "2024-02": 27.78, "2024-03": 26.89,
  "2024-04": 26.06, "2024-05": 25.27, "2024-06": 24.36,
  "2024-07": 23.49, "2024-08": 22.65, "2024-09": 21.72,
  "2024-10": 20.93, "2024-11": 20.00, "2024-12": 18.99,
  "2025-01": 18.00, "2025-02": 17.04, "2025-03": 15.98,
  "2025-04": 14.84, "2025-05": 13.74, "2025-06": 12.46,
  "2025-07": 11.30, "2025-08": 10.08, "2025-09": 8.80,
  "2025-10": 7.75, "2025-11": 6.53, "2025-12": 5.37,
  "2026-01": 4.37, "2026-02": 3.16, "2026-03": 2.07,
  "2026-04": 1.00, "2026-05": 1.00, "2026-06": 0.00,
};

const INDICES_UPDATED_AT = "19/06/2026 às 18:12";
const PARALISACOES_STORAGE_KEY = "reducaoParalisacoes";

let formData = {};
let receitaResult = {};
let reducaoResult = {};
let paralisacoes = [];

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function parseLocaleNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value || "").replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned;

  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "");
  } else if (lastComma >= 0) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmt(value) {
  return (Number(value) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR");
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setWidth(id, value) {
  const el = document.getElementById(id);
  if (el) el.style.width = `${Math.max(0, Math.min(value, 100))}%`;
}

function setPrintTitle(prefix, clientName) {
  const safeClientName = (clientName || "").trim().replace(/[\\/:*?"<>|]/g, " ");
  document.title = safeClientName ? `${prefix} - ${safeClientName}` : prefix;
}

function monthKey(dateValue) {
  return (dateValue || "").slice(0, 7);
}

function listMonths(start, end) {
  const [startYear, startMonth] = monthKey(start).split("-").map(Number);
  const [endYear, endMonth] = monthKey(end).split("-").map(Number);
  if (!startYear || !startMonth || !endYear || !endMonth) return [];

  const months = [];
  let year = startYear;
  let month = startMonth;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
}

function monthLabel(month) {
  const [year, itemMonth] = (month || "").split("-");
  return year && itemMonth ? `${itemMonth}/${year}` : month;
}

function periodLabel(period) {
  return period.start === period.end
    ? monthLabel(period.start)
    : `${monthLabel(period.start)} a ${monthLabel(period.end)}`;
}

function getWorkMonths() {
  return listMonths(formData.dataInicioObra, formData.dataFimObra);
}

function getParalisacaoMonths() {
  const pausedMonths = new Set();

  paralisacoes.forEach((period) => {
    listMonths(period.start, period.end).forEach((month) => pausedMonths.add(month));
  });

  return pausedMonths;
}

function sortParalisacoes() {
  paralisacoes.sort((first, second) => first.start.localeCompare(second.start) || first.end.localeCompare(second.end));
}

function setParalisacaoError(message = "") {
  const error = document.getElementById("paralisacao-error");
  if (!error) return;
  error.textContent = message;
  error.hidden = !message;
}

function validateParalisacao(start, end) {
  const workMonths = getWorkMonths();
  const firstMonth = workMonths[0];
  const lastMonth = workMonths[workMonths.length - 1];

  if (!start || !end) return "Informe a competência inicial e final da paralisação.";
  if (start > end) return "A competência final deve ser igual ou posterior à inicial.";
  if (!firstMonth || start < firstMonth || end > lastMonth) {
    return `Informe um período dentro da obra: ${monthLabel(firstMonth)} a ${monthLabel(lastMonth)}.`;
  }

  const pauseMonths = new Set(getParalisacaoMonths());
  listMonths(start, end).forEach((month) => pauseMonths.add(month));
  if (pauseMonths.size >= workMonths.length) return "Deixe ao menos uma competência ativa para distribuir a remuneração.";
  return "";
}

function saveParalisacoes() {
  localStorage.setItem(PARALISACOES_STORAGE_KEY, JSON.stringify(paralisacoes));
}

function loadParalisacoes() {
  try {
    const storedPeriods = JSON.parse(localStorage.getItem(PARALISACOES_STORAGE_KEY));
    if (!Array.isArray(storedPeriods)) return [];

    const workMonths = getWorkMonths();
    const firstMonth = workMonths[0];
    const lastMonth = workMonths[workMonths.length - 1];

    return storedPeriods.filter((period) => period
      && typeof period.start === "string"
      && typeof period.end === "string"
      && period.start <= period.end
      && firstMonth
      && period.start >= firstMonth
      && period.end <= lastMonth);
  } catch (error) {
    return [];
  }
}

function renderParalisacoes() {
  const list = document.getElementById("paralisacao-list");
  const summary = document.getElementById("paralisacao-summary");
  if (!list || !summary) return;

  list.innerHTML = "";
  sortParalisacoes();

  paralisacoes.forEach((period, index) => {
    const item = document.createElement("div");
    item.className = "rs-stop-item";
    item.innerHTML = `
      <strong>${periodLabel(period)}</strong>
      <button class="rs-btn-outline" type="button" data-remove-paralisacao="${index}">Remover</button>
    `;
    list.appendChild(item);
  });

  const text = paralisacoes.length
    ? `Paralisações consideradas: ${paralisacoes.map(periodLabel).join("; ")}. Meses paralisados ficam sem remuneração, encargos e MAED.`
    : "";
  summary.textContent = text;
  summary.hidden = !text;
}

function setParalisacaoInputRange() {
  const workMonths = getWorkMonths();
  const firstMonth = workMonths[0] || "";
  const lastMonth = workMonths[workMonths.length - 1] || "";

  ["paralisacao-inicio", "paralisacao-fim"].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.min = firstMonth;
    input.max = lastMonth;
  });
}

function addParalisacao() {
  const startInput = document.getElementById("paralisacao-inicio");
  const endInput = document.getElementById("paralisacao-fim");
  const start = startInput.value;
  const end = endInput.value;
  const error = validateParalisacao(start, end);
  if (error) {
    setParalisacaoError(error);
    return;
  }

  paralisacoes.push({ start, end });
  startInput.value = "";
  endInput.value = "";
  setParalisacaoError();
  saveParalisacoes();
  renderParalisacoes();
  recalculate(false);
}

function removeParalisacao(index) {
  paralisacoes.splice(index, 1);
  setParalisacaoError();
  saveParalisacoes();
  renderParalisacoes();
  recalculate(false);
}

function isCurrentOrFuture(month, referenceDate) {
  const ref = new Date(`${referenceDate}T00:00:00`);
  const [year, itemMonth] = month.split("-").map(Number);
  const refYear = ref.getFullYear();
  const refMonth = ref.getMonth() + 1;
  return year > refYear || (year === refYear && itemMonth >= refMonth);
}

function isPreviousMonthWithinGrace(month, referenceDate) {
  const ref = new Date(`${referenceDate}T00:00:00`);
  const previous = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  const key = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}`;
  return month === key && ref.getDate() <= 15;
}

function readMonthlyRows() {
  return Array.from(document.querySelectorAll("[data-month-row]")).map((row) => ({
    month: row.dataset.monthRow,
    isParalisacao: row.dataset.paralisacao === "true",
    remOriginal: parseLocaleNumber(row.querySelector("[data-field='remOriginal']").value),
    selic: parseLocaleNumber(row.querySelector("[data-field='selic']").value),
  }));
}

function calculateRows(baseRows) {
  const applyMaed = document.getElementById("aplicar-maed").value === "true";
  const referenceDate = document.getElementById("data-referencia").value || new Date().toISOString().slice(0, 10);

  return baseRows.map((row) => {
    if (row.isParalisacao) {
      return {
        ...row,
        remOriginal: 0,
        remAtualizada: 0,
        cpp: 0,
        multaMora: 0,
        juros: 0,
        maed: 0,
        total: 0,
      };
    }

    const noDelay = isCurrentOrFuture(row.month, referenceDate) || isPreviousMonthWithinGrace(row.month, referenceDate);
    const remOriginal = round(row.remOriginal || 0);
    const remAtualizada = round(remOriginal * (1 + (row.selic / 100)));
    const cpp = round(remOriginal * 0.20);
    const multaMora = noDelay ? 0 : round(cpp * 0.20);
    const juros = noDelay ? 0 : round(cpp * (row.selic / 100));
    const maed = applyMaed && !noDelay ? 100 : 0;
    const total = round(cpp + multaMora + juros + maed);
    return { ...row, remOriginal, remAtualizada, cpp, multaMora, juros, maed, total };
  });
}

function renderRows(rows) {
  const body = document.getElementById("monthly-rows");
  body.innerHTML = "";

  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = `rs-monthly-row${row.isParalisacao ? " rs-monthly-row--paused" : ""}`;
    item.dataset.monthRow = row.month;
    item.dataset.paralisacao = row.isParalisacao ? "true" : "false";
    item.innerHTML = `
      <div class="rs-monthly-competencia">
        <span>Competência</span>
        <strong>${row.month}</strong>
        ${row.isParalisacao ? '<small>Paralisação</small>' : ""}
      </div>
      <label>
        <span>Rem. atualizada</span>
        <strong data-output="remAtualizada">R$ ${fmt(row.remAtualizada)}</strong>
      </label>
      <label>
        <span>Rem. original</span>
        <input class="rs-table-input" data-field="remOriginal" type="number" step="0.01" value="${row.remOriginal}" ${row.isParalisacao ? "disabled" : ""}>
      </label>
      <div class="rs-monthly-money">
        <span>CPP 20%</span>
        <strong data-output="cpp">R$ ${fmt(row.cpp)}</strong>
      </div>
      <div class="rs-monthly-money">
        <span>Multa 20%</span>
        <strong data-output="multaMora">R$ ${fmt(row.multaMora)}</strong>
      </div>
      <label>
        <span>SELIC acum. (%)</span>
        <input class="rs-table-input" data-field="selic" type="number" step="0.01" value="${row.selic}" ${row.isParalisacao ? "disabled" : ""}>
      </label>
      <div class="rs-monthly-money">
        <span>Juros mora</span>
        <strong data-output="juros">R$ ${fmt(row.juros)}</strong>
      </div>
      <div class="rs-monthly-money">
        <span>MAED</span>
        <strong data-output="maed">R$ ${fmt(row.maed)}</strong>
      </div>
      <div class="rs-monthly-total">
        <span>Total</span>
        <strong data-output="total">R$ ${fmt(row.total)}</strong>
      </div>
    `;
    body.appendChild(item);
  });
}

function buildInitialRows() {
  const months = getWorkMonths();
  const pausedMonths = getParalisacaoMonths();
  const activeMonths = months.filter((month) => !pausedMonths.has(month));
  const metaPercentual = (receitaResult.areaTotal || 0) <= 350 ? 0.5 : 0.7;
  const rmtMeta = round((receitaResult.rmt || 0) * metaPercentual);
  const selicFactors = activeMonths.map((month) => 1 + ((SELIC_ACUMULADA[month] ?? 0) / 100));
  const totalFactor = selicFactors.reduce((sum, factor) => sum + factor, 0);
  const remMensalOriginal = totalFactor > 0 ? round(rmtMeta / totalFactor) : 0;

  const rows = months.map((month) => ({
    month,
    selic: SELIC_ACUMULADA[month] ?? 0,
    isParalisacao: pausedMonths.has(month),
    remOriginal: pausedMonths.has(month) ? 0 : remMensalOriginal,
  }));

  const activeRows = rows.filter((row) => !row.isParalisacao);
  if (activeRows.length) {
    const totalAtualizado = activeRows.reduce((sum, row) => sum + round(row.remOriginal * (1 + (row.selic / 100))), 0);
    const diff = round(rmtMeta - totalAtualizado);
    const lastRow = activeRows[activeRows.length - 1];
    const lastFactor = 1 + (lastRow.selic / 100);
    lastRow.remOriginal = round(lastRow.remOriginal + (diff / lastFactor));
  }

  return rows;
}

function getStoredRows() {
  const storedRows = reducaoResult && reducaoResult.rows;
  if (!Array.isArray(storedRows)) return null;

  const initialRows = buildInitialRows();
  if (storedRows.length !== initialRows.length) return null;

  const isCompatible = storedRows.every((row, index) => row
    && row.month === initialRows[index].month
    && Boolean(row.isParalisacao) === Boolean(initialRows[index].isParalisacao));
  if (!isCompatible) return null;

  const mappedRows = storedRows.map((row, index) => ({
    month: initialRows[index].month,
    isParalisacao: initialRows[index].isParalisacao,
    remOriginal: parseLocaleNumber(row.remOriginal),
    selic: parseLocaleNumber(row.selic),
  }));

  const storedBasis = reducaoResult && reducaoResult.basis;
  const currentBasis = getCurrentCalculationBasis();
  if (storedBasis && !isSameCalculationBasis(storedBasis, currentBasis)) return null;
  if (!storedBasis && !isRowsCompatibleWithRmtGoal(mappedRows)) return null;

  return mappedRows;
}

function getCurrentCalculationBasis() {
  return {
    receitaCalculatedAt: receitaResult.calculatedAt || "",
    rmt: round(receitaResult.rmt || 0),
    areaTotal: round(receitaResult.areaTotal || 0),
    dateInitial: receitaResult.dateInitial || formData.dataInicioObra || "",
    dateFinal: receitaResult.dateFinal || formData.dataFimObra || "",
  };
}

function isSameCalculationBasis(a, b) {
  return a
    && b
    && a.receitaCalculatedAt === b.receitaCalculatedAt
    && round(a.rmt || 0) === round(b.rmt || 0)
    && round(a.areaTotal || 0) === round(b.areaTotal || 0)
    && a.dateInitial === b.dateInitial
    && a.dateFinal === b.dateFinal;
}

function getRmtGoal() {
  const metaPercentual = (receitaResult.areaTotal || 0) <= 350 ? 0.5 : 0.7;
  return round((receitaResult.rmt || 0) * metaPercentual);
}

function getUpdatedRemunerationTotal(rows) {
  return round(rows.reduce((sum, row) => (
    row.isParalisacao ? sum : sum + round(row.remOriginal * (1 + (row.selic / 100)))
  ), 0));
}

function isRowsCompatibleWithRmtGoal(rows) {
  const goal = getRmtGoal();
  if (goal <= 0) return true;
  const total = getUpdatedRemunerationTotal(rows);
  const tolerance = Math.max(1, goal * 0.005);
  return Math.abs(total - goal) <= tolerance;
}

function updateHonorariosMode() {
  const mode = document.getElementById("honorarios-mode")?.value || "percentual";
  const percentBlock = document.getElementById("honorarios-percent-block");
  const baseBlock = document.getElementById("honorarios-base-block");
  const fixedBlock = document.getElementById("honorarios-fixed-block");
  if (percentBlock) percentBlock.hidden = mode === "fixo";
  if (baseBlock) baseBlock.hidden = mode === "fixo";
  if (fixedBlock) fixedBlock.hidden = mode !== "fixo";
}

function getHonorariosBaseValue(base, values) {
  if (base === "debito-original") return values.receita;
  if (base === "debito-reduzido") return values.totalReducao;
  return values.economiaBruta;
}

function getHonorariosBaseLabel(base) {
  if (base === "debito-original") return "o débito original";
  if (base === "debito-reduzido") return "o débito com redução";
  return "a economia obtida";
}

function getHonorariosConfig(values) {
  const mode = document.getElementById("honorarios-mode")?.value || "percentual";
  if (mode === "fixo") {
    const fixedValue = round(Math.max(parseLocaleNumber(document.getElementById("honorarios-fixed")?.value), 0));
    return {
      value: fixedValue,
      mode: "fixo",
      base: "valor-fixo",
      percent: values.economiaBruta > 0 ? round((fixedValue / values.economiaBruta) * 100) : 0,
      description: `Honorários fixos: R$ ${fmt(fixedValue)}`,
    };
  }

  const base = document.getElementById("honorarios-base")?.value || "economia";
  const percent = Math.max(parseLocaleNumber(document.getElementById("honorarios-percent")?.value), 0);
  const baseValue = getHonorariosBaseValue(base, values);
  const baseLabel = getHonorariosBaseLabel(base);
  return {
    value: round(baseValue * (percent / 100)),
    mode: "percentual",
    base,
    percent,
    description: `${percent.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% sobre ${baseLabel}`,
  };
}

function updateTotals(rows) {
  const totalReducao = round(rows.reduce((sum, row) => sum + row.total, 0));
  const totalRemOriginal = round(rows.reduce((sum, row) => sum + row.remOriginal, 0));
  const totalRemAtualizada = round(rows.reduce((sum, row) => sum + row.remAtualizada, 0));
  const receita = round(receitaResult.inssEstimado || 0);
  const rmtSero = round(receitaResult.rmt || 0);
  const metaPercentual = (receitaResult.areaTotal || 0) <= 350 ? 50 : 70;
  const rmtMeta = round(rmtSero * (metaPercentual / 100));
  const percentualAtingido = rmtSero > 0 ? round((totalRemAtualizada / rmtSero) * 100) : 0;
  const faltaMeta = round(Math.max(rmtMeta - totalRemAtualizada, 0));
  const economiaBruta = round(Math.max(receita - totalReducao, 0));
  updateHonorariosMode();
  const honorariosConfig = getHonorariosConfig({ receita, totalReducao, economiaBruta });
  const honorarios = honorariosConfig.value;
  const economiaLiquida = round(Math.max(economiaBruta - honorarios, 0));
  const percentualReducao = receita > 0 ? round((economiaBruta / receita) * 100) : 0;

  setText("inss-receita", fmt(receita));
  setText("receita-total", fmt(receita));
  setText("reducao-total", fmt(totalReducao));
  setText("economia-bruta", fmt(economiaBruta));
  setText("honorarios", fmt(honorarios));
  setText("economia-liquida", fmt(economiaLiquida));
  setText("percentual-reducao", percentualReducao.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  setText("rmt-sero", fmt(rmtSero));
  setText("rmt-meta", fmt(rmtMeta));
  setText("rmt-meta-percent", metaPercentual.toLocaleString("pt-BR"));
  setText("rmt-percentual-atingido", percentualAtingido.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  setText("rmt-comprovado", fmt(totalRemAtualizada));
  setText("rmt-falta", fmt(faltaMeta));
  setWidth("rmt-progress-bar", rmtMeta > 0 ? (totalRemAtualizada / rmtMeta) * 100 : 0);

  return {
    receita,
    totalReducao,
    totalRemOriginal,
    totalRemAtualizada,
    rmtSero,
    rmtMeta,
    metaPercentual,
    percentualAtingido,
    economiaBruta,
    honorarios,
    honorariosMode: honorariosConfig.mode,
    honorariosBase: honorariosConfig.base,
    honorariosDescription: honorariosConfig.description,
    economiaLiquida,
    honorariosPercent: honorariosConfig.percent,
    percentualReducao,
  };
}

function recalculate(fromInputs = true) {
  const baseRows = fromInputs ? readMonthlyRows() : buildInitialRows();
  const rows = calculateRows(baseRows);
  renderRows(rows);
  return { rows, totals: updateTotals(rows) };
}

function restoreMonthlyCalculation() {
  const storedRows = getStoredRows();
  if (!storedRows) return recalculate(false);

  const rows = calculateRows(storedRows);
  renderRows(rows);
  return { rows, totals: updateTotals(rows) };
}

function updateRenderedMonthlyValues(rows) {
  const rowElements = Array.from(document.querySelectorAll("[data-month-row]"));

  rows.forEach((row, index) => {
    const rowElement = rowElements[index];
    if (!rowElement || rowElement.dataset.monthRow !== row.month) return;

    ["remAtualizada", "cpp", "multaMora", "juros", "maed", "total"].forEach((field) => {
      const output = rowElement.querySelector(`[data-output="${field}"]`);
      if (output) output.textContent = `R$ ${fmt(row[field])}`;
    });
  });
}

function updateMonthlyCalculation() {
  const rows = calculateRows(readMonthlyRows());
  updateRenderedMonthlyValues(rows);
  return { rows, totals: updateTotals(rows) };
}

function copyFirstRemuneracaoToAll() {
  const firstInput = document.querySelector("[data-month-row]:not([data-paralisacao='true']) [data-field='remOriginal']");
  if (!firstInput) return;

  document.querySelectorAll("[data-month-row]:not([data-paralisacao='true']) [data-field='remOriginal']").forEach((input) => {
    input.value = firstInput.value;
  });

  updateMonthlyCalculation();
}

function getIndicesMeta() {
  const status = window.ReduzSimIndices?.getStatus?.();
  const selic = status?.cache?.selic || {};
  const receitaIndices = receitaResult.indices || {};
  return {
    selic: {
      updatedAt: selic.updatedAt || "",
      source: selic.source || "Tabela local do sistema",
      referenceDate: document.getElementById("data-referencia")?.value || "",
    },
    vau: receitaIndices.vau || {
      period: receitaResult.vauPeriodo || "",
      source: "Tabela local do sistema",
      updatedAt: "",
    },
    jurosMora: {
      source: "Receita Federal - juros de mora",
      rule: "Selic do mês seguinte ao vencimento até o mês anterior ao pagamento, mais 1% no mês do pagamento.",
      url: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/pagamentos-e-parcelamentos/pagamento-em-atraso",
    },
    sero: {
      source: "Receita Federal - Sero",
      rule: "A aferição oficial da obra é feita no Sero e a confissão do débito segue pela DCTFWeb Aferição de Obras.",
      url: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/sero-servico-eletronico-para-afericao-de-obras",
    },
  };
}

function updateIndicesNote(message) {
  const note = document.getElementById("indices-update-note");
  if (!note) return;
  const meta = getIndicesMeta();
  const selicUpdated = fmtDateTime(meta.selic.updatedAt);
  const vauUpdated = fmtDateTime(meta.vau.updatedAt);
  note.innerHTML = `
    <strong>${message}</strong><br>
    SELIC: ${selicUpdated ? `índice atualizado em ${selicUpdated}` : "último índice válido/tabela local"}.
    Fonte utilizada: ${meta.selic.source}.<br>
    VAU: ${meta.vau.period || "período local"}${vauUpdated ? `, atualizado em ${vauUpdated}` : ""}.
    Fonte utilizada: ${meta.vau.source}.<br>
    Juros de mora: ${meta.jurosMora.rule} Fonte: ${meta.jurosMora.source}.
  `;
}

function applyCurrentSelicToRows() {
  const baseRows = readMonthlyRows().map((row) => ({
    ...row,
    selic: row.isParalisacao ? 0 : (SELIC_ACUMULADA[row.month] ?? row.selic),
  }));
  const rows = calculateRows(baseRows);
  renderRows(rows);
  return { rows, totals: updateTotals(rows) };
}

async function refreshSelic() {
  if (!window.ReduzSimIndices) {
    updateIndicesNote(`Os índices foram atualizados pela última vez no dia ${INDICES_UPDATED_AT}.`);
    return;
  }

  try {
    await window.ReduzSimIndices.fetchSelicRates();
    const months = typeof getWorkMonths === "function" ? getWorkMonths() : Object.keys(SELIC_ACUMULADA);
    const reference = document.getElementById("data-referencia")?.value;
    Object.assign(SELIC_ACUMULADA, window.ReduzSimIndices.calculateSelicMap(months, reference));
    applyCurrentSelicToRows();
    updateIndicesNote("Índices atualizados para este cálculo.");
  } catch (error) {
    console.warn("Falha ao atualizar SELIC.", error);
    updateIndicesNote("Não foi possível buscar a SELIC agora; usando último índice válido como fallback.");
  }
}

function defaultValidityDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
}

function initCommercialFields() {
  const commercial = reducaoResult?.commercial || {};
  const consultor = document.getElementById("consultor-nome");
  const validade = document.getElementById("proposta-validade");
  const observacoes = document.getElementById("observacoes-comerciais");
  if (consultor) consultor.value = commercial.consultor || "";
  if (validade) validade.value = commercial.validade || defaultValidityDate();
  if (observacoes) observacoes.value = commercial.observacoes || "";
}

function getCommercialData() {
  return {
    consultor: document.getElementById("consultor-nome")?.value.trim() || "",
    validade: document.getElementById("proposta-validade")?.value || "",
    observacoes: document.getElementById("observacoes-comerciais")?.value.trim() || "",
  };
}

function finalizeCalculation() {
  const result = recalculate(true);
  localStorage.setItem("reducaoResult", JSON.stringify({
    calculatedAt: new Date().toISOString(),
    basis: getCurrentCalculationBasis(),
    commercial: getCommercialData(),
    indices: getIndicesMeta(),
    rows: result.rows,
    totals: result.totals,
  }));
  window.location.href = "final.html";
}

(() => {
  try {
    formData = JSON.parse(localStorage.getItem("formData"));
    receitaResult = JSON.parse(localStorage.getItem("receitaResult"));
    reducaoResult = JSON.parse(localStorage.getItem("reducaoResult"));
  } catch (error) {
    formData = null;
    receitaResult = null;
    reducaoResult = null;
  }

  if (!formData || !receitaResult) {
    window.location.href = "index.html";
    return;
  }

  setPrintTitle("Cálculo de redução", formData.clienteNome);
  setParalisacaoInputRange();
  paralisacoes = loadParalisacoes();
  renderParalisacoes();
  document.getElementById("data-referencia").value = new Date().toISOString().slice(0, 10);
  initCommercialFields();
  updateHonorariosMode();
  updateIndicesNote(`Os índices foram atualizados pela última vez no dia ${INDICES_UPDATED_AT}.`);
  document.getElementById("recalc-btn").addEventListener("click", finalizeCalculation);
  document.getElementById("print-reducao-btn").addEventListener("click", () => window.print());
  document.getElementById("refresh-indices-btn").addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = "Atualizando...";
    try {
      await window.ReduzSimIndices?.refreshAll([]);
      await refreshSelic();
    } finally {
      event.currentTarget.disabled = false;
      event.currentTarget.textContent = "Atualizar índices";
    }
  });
  document.getElementById("copy-first-remuneracao").addEventListener("click", copyFirstRemuneracaoToAll);
  document.getElementById("add-paralisacao-btn").addEventListener("click", addParalisacao);
  document.getElementById("paralisacao-list").addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-paralisacao]");
    if (removeButton) removeParalisacao(Number.parseInt(removeButton.dataset.removeParalisacao, 10));
  });
  document.getElementById("monthly-rows").addEventListener("input", (event) => {
    if (event.target.matches("[data-field='remOriginal'], [data-field='selic']")) {
      updateMonthlyCalculation();
    }
  });
  document.getElementById("honorarios-percent").addEventListener("input", updateMonthlyCalculation);
  document.getElementById("honorarios-mode").addEventListener("change", () => {
    updateHonorariosMode();
    updateMonthlyCalculation();
  });
  document.getElementById("honorarios-base")?.addEventListener("change", updateMonthlyCalculation);
  document.getElementById("honorarios-fixed").addEventListener("input", updateMonthlyCalculation);
  document.getElementById("aplicar-maed").addEventListener("change", updateMonthlyCalculation);
  document.getElementById("data-referencia").addEventListener("change", refreshSelic);

  restoreMonthlyCalculation();
  refreshSelic();
  window.ReduzSimIndices?.scheduleAutoUpdates([], refreshSelic);
})();
