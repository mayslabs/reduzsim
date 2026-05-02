const SELIC_ACUMULADA = {
  "2021-10": 53.03, "2021-11": 52.26, "2021-12": 51.53,
  "2022-01": 50.77, "2022-02": 49.84, "2022-03": 49.01, "2022-04": 47.98, "2022-05": 46.96, "2022-06": 45.93,
  "2022-07": 44.76, "2022-08": 43.69, "2022-09": 42.67, "2022-10": 41.65, "2022-11": 40.53, "2022-12": 39.41,
  "2023-01": 38.49, "2023-02": 37.32, "2023-03": 36.40, "2023-04": 35.28, "2023-05": 34.21, "2023-06": 33.14,
  "2023-07": 32.00, "2023-08": 31.03, "2023-09": 30.03, "2023-10": 29.11, "2023-11": 28.22, "2023-12": 27.25,
  "2024-01": 26.45, "2024-02": 25.62, "2024-03": 24.73, "2024-04": 23.90, "2024-05": 23.11, "2024-06": 22.20,
  "2024-07": 21.33, "2024-08": 20.49, "2024-09": 19.56, "2024-10": 18.77, "2024-11": 17.84, "2024-12": 16.83,
  "2025-01": 15.84, "2025-02": 14.88, "2025-03": 13.82, "2025-04": 12.68, "2025-05": 11.58, "2025-06": 10.30,
  "2025-07": 9.14, "2025-08": 7.92, "2025-09": 6.64, "2025-10": 5.59, "2025-11": 4.37, "2025-12": 3.21,
  "2026-01": 2.21, "2026-02": 1.00, "2026-03": 0.00, "2026-04": 0.00,
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
    const tr = document.createElement("tr");
    tr.dataset.monthRow = row.month;
    tr.innerHTML = `
      <td>${row.month}</td>
      <td><input class="rs-table-input" data-field="selic" type="number" step="0.01" value="${row.selic}"></td>
      <td><input class="rs-table-input" data-field="remAtualizada" type="number" step="0.01" value="${row.remAtualizada}"></td>
      <td>R$ ${fmt(row.remOriginal)}</td>
      <td>R$ ${fmt(row.cpp)}</td>
      <td>R$ ${fmt(row.multaMora)}</td>
      <td>R$ ${fmt(row.juros)}</td>
      <td>R$ ${fmt(row.maed)}</td>
      <td>R$ ${fmt(row.total)}</td>
    `;
    body.appendChild(tr);
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
