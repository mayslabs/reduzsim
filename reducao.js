const SELIC_ACUMULADA = {
  "2021-10": 54.12, "2021-11": 53.35, "2021-12": 52.62,
  "2022-01": 51.86, "2022-02": 50.93, "2022-03": 50.10,
  "2022-04": 49.07, "2022-05": 48.05, "2022-06": 47.02,
  "2022-07": 45.85, "2022-08": 44.78, "2022-09": 43.76,
  "2022-10": 42.74, "2022-11": 41.62, "2022-12": 40.50,
  "2023-01": 39.58, "2023-02": 38.41, "2023-03": 37.49,
  "2023-04": 36.37, "2023-05": 35.30, "2023-06": 34.23,
  "2023-07": 33.09, "2023-08": 32.12, "2023-09": 31.12,
  "2023-10": 30.20, "2023-11": 29.31, "2023-12": 28.34,
  "2024-01": 27.54, "2024-02": 26.71, "2024-03": 25.82,
  "2024-04": 24.99, "2024-05": 24.20, "2024-06": 23.29,
  "2024-07": 22.42, "2024-08": 21.58, "2024-09": 20.65,
  "2024-10": 19.86, "2024-11": 18.93, "2024-12": 17.92,
  "2025-01": 16.93, "2025-02": 15.97, "2025-03": 14.91,
  "2025-04": 13.77, "2025-05": 12.67, "2025-06": 11.39,
  "2025-07": 10.23, "2025-08": 9.01, "2025-09": 7.73,
  "2025-10": 6.68, "2025-11": 5.46, "2025-12": 4.30,
  "2026-01": 3.30, "2026-02": 2.09, "2026-03": 1.00,
  "2026-04": 0.00, "2026-05": 0.00,
};

let formData = {};
let receitaResult = {};

function round(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function fmt(value) {
  return (Number(value) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
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
    remAtualizada: Number.parseFloat(row.querySelector("[data-field='remAtualizada']").value || "0") || 0,
    selic: Number.parseFloat(row.querySelector("[data-field='selic']").value || "0") || 0,
  }));
}

function calculateRows(baseRows) {
  const applyMaed = document.getElementById("aplicar-maed").value === "true";
  const referenceDate = document.getElementById("data-referencia").value || new Date().toISOString().slice(0, 10);

  return baseRows.map((row) => {
    const noDelay = isCurrentOrFuture(row.month, referenceDate) || isPreviousMonthWithinGrace(row.month, referenceDate);
    const remOriginal = round(row.remAtualizada * 100 / (row.selic + 100));
    const cpp = round(remOriginal * 0.20);
    const multaMora = noDelay ? 0 : round(cpp * 0.20);
    const juros = noDelay ? 0 : round(cpp * (row.selic / 100));
    const maed = applyMaed && !noDelay ? 100 : 0;
    const total = round(cpp + multaMora + juros + maed);
    return { ...row, remOriginal, cpp, multaMora, juros, maed, total };
  });
}

function renderRows(rows) {
  const body = document.getElementById("monthly-rows");
  body.innerHTML = "";

  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "rs-monthly-row";
    item.dataset.monthRow = row.month;
    item.innerHTML = `
      <div class="rs-monthly-competencia">
        <span>Competência</span>
        <strong>${row.month}</strong>
      </div>
      <label>
        <span>Rem. atualizada</span>
        <input class="rs-table-input" data-field="remAtualizada" type="number" step="0.01" value="${row.remAtualizada}">
      </label>
      <div class="rs-monthly-money">
        <span>Rem. original</span>
        <strong>R$ ${fmt(row.remOriginal)}</strong>
      </div>
      <div class="rs-monthly-money">
        <span>CPP 20%</span>
        <strong>R$ ${fmt(row.cpp)}</strong>
      </div>
      <div class="rs-monthly-money">
        <span>Multa 20%</span>
        <strong>R$ ${fmt(row.multaMora)}</strong>
      </div>
      <label>
        <span>SELIC acum. (%)</span>
        <input class="rs-table-input" data-field="selic" type="number" step="0.01" value="${row.selic}">
      </label>
      <div class="rs-monthly-money">
        <span>Juros mora</span>
        <strong>R$ ${fmt(row.juros)}</strong>
      </div>
      <div class="rs-monthly-money">
        <span>MAED</span>
        <strong>R$ ${fmt(row.maed)}</strong>
      </div>
      <div class="rs-monthly-total">
        <span>Total</span>
        <strong>R$ ${fmt(row.total)}</strong>
      </div>
    `;
    body.appendChild(item);
  });
}

function buildInitialRows() {
  const months = listMonths(formData.dataInicioObra, formData.dataFimObra);
  const fatorArea = (receitaResult.areaTotal || 0) <= 350 ? 0.5 : 0.7;
  const rmtEstrategica = round((receitaResult.rmt || 0) * fatorArea);
  const remMensalAtualizada = months.length ? round(rmtEstrategica / months.length) : 0;

  return months.map((month) => ({
    month,
    selic: SELIC_ACUMULADA[month] ?? 0,
    remAtualizada: remMensalAtualizada,
  }));
}

function updateTotals(rows) {
  const totalReducao = round(rows.reduce((sum, row) => sum + row.total, 0));
  const receita = round(receitaResult.inssEstimado || 0);
  const economiaBruta = round(Math.max(receita - totalReducao, 0));
  const honorariosPercent = Number.parseFloat(document.getElementById("honorarios-percent").value || "0") || 0;
  const honorarios = round(economiaBruta * (honorariosPercent / 100));
  const economiaLiquida = round(Math.max(economiaBruta - honorarios, 0));
  const percentualReducao = receita > 0 ? round((economiaBruta / receita) * 100) : 0;

  setText("inss-receita", fmt(receita));
  setText("receita-total", fmt(receita));
  setText("reducao-total", fmt(totalReducao));
  setText("economia-bruta", fmt(economiaBruta));
  setText("honorarios", fmt(honorarios));
  setText("economia-liquida", fmt(economiaLiquida));
  setText("percentual-reducao", percentualReducao.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

  return {
    receita,
    totalReducao,
    economiaBruta,
    honorarios,
    economiaLiquida,
    honorariosPercent,
    percentualReducao,
  };
}

function recalculate(fromInputs = true) {
  const baseRows = fromInputs ? readMonthlyRows() : buildInitialRows();
  const rows = calculateRows(baseRows);
  renderRows(rows);
  return { rows, totals: updateTotals(rows) };
}

function copyFirstRemuneracaoToAll() {
  const firstInput = document.querySelector("[data-month-row] [data-field='remAtualizada']");
  if (!firstInput) return;

  document.querySelectorAll("[data-month-row] [data-field='remAtualizada']").forEach((input) => {
    input.value = firstInput.value;
  });

  recalculate(true);
}

function finalizeCalculation() {
  const result = recalculate(true);
  localStorage.setItem("reducaoResult", JSON.stringify({
    calculatedAt: new Date().toISOString(),
    rows: result.rows,
    totals: result.totals,
  }));
  window.location.href = "final.html";
}

(() => {
  try {
    formData = JSON.parse(localStorage.getItem("formData"));
    receitaResult = JSON.parse(localStorage.getItem("receitaResult"));
  } catch (error) {
    formData = null;
    receitaResult = null;
  }

  if (!formData || !receitaResult) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("data-referencia").value = new Date().toISOString().slice(0, 10);
  document.getElementById("recalc-btn").addEventListener("click", finalizeCalculation);
  document.getElementById("copy-first-remuneracao").addEventListener("click", copyFirstRemuneracaoToAll);
  document.getElementById("honorarios-percent").addEventListener("input", () => recalculate(true));
  document.getElementById("aplicar-maed").addEventListener("change", () => recalculate(true));
  document.getElementById("data-referencia").addEventListener("change", () => recalculate(true));

  recalculate(false);
})();
