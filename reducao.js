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
  "2026-04": 1.00, "2026-05": 0.00,
};

const INDICES_UPDATED_AT = "28/05/2026 às 16:54";
const PARALISACOES_STORAGE_KEY = "reducaoParalisacoes";

let formData = {};
let receitaResult = {};
let reducaoResult = {};
let paralisacoes = [];

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
    remOriginal: Number.parseFloat(row.querySelector("[data-field='remOriginal']").value || "0") || 0,
    selic: Number.parseFloat(row.querySelector("[data-field='selic']").value || "0") || 0,
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

  return storedRows.map((row, index) => ({
    month: initialRows[index].month,
    isParalisacao: initialRows[index].isParalisacao,
    remOriginal: Number.parseFloat(row.remOriginal || "0") || 0,
    selic: Number.parseFloat(row.selic || "0") || 0,
  }));
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
  setText("indices-update-note", `Os índices foram atualizados pela última vez no dia ${INDICES_UPDATED_AT}.`);
  document.getElementById("recalc-btn").addEventListener("click", finalizeCalculation);
  document.getElementById("print-reducao-btn").addEventListener("click", () => window.print());
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
  document.getElementById("aplicar-maed").addEventListener("change", updateMonthlyCalculation);
  document.getElementById("data-referencia").addEventListener("change", updateMonthlyCalculation);

  restoreMonthlyCalculation();
})();
