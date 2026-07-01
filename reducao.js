const SELIC_ACUMULADA = {
  "2018-01": 73.59, "2018-02": 73.06, "2018-03": 72.54,
  "2018-04": 72.02, "2018-05": 71.50, "2018-06": 70.96,
  "2018-07": 70.39, "2018-08": 69.92, "2018-09": 69.38,
  "2018-10": 68.89, "2018-11": 68.40, "2018-12": 67.86,
  "2019-01": 67.37, "2019-02": 66.90, "2019-03": 66.38,
  "2019-04": 65.84, "2019-05": 65.37, "2019-06": 64.80,
  "2019-07": 64.30, "2019-08": 63.84, "2019-09": 63.36,
  "2019-10": 62.98, "2019-11": 62.61, "2019-12": 62.23,
  "2020-01": 61.94, "2020-02": 61.60, "2020-03": 61.32,
  "2020-04": 61.08, "2020-05": 60.87, "2020-06": 60.68,
  "2020-07": 60.52, "2020-08": 60.36, "2020-09": 60.20,
  "2020-10": 60.05, "2020-11": 59.89, "2020-12": 59.74,
  "2021-01": 59.61, "2021-02": 59.41, "2021-03": 59.20,
  "2021-04": 58.93, "2021-05": 58.62, "2021-06": 58.26,
  "2021-07": 57.83, "2021-08": 57.39, "2021-09": 56.90,
  "2021-10": 56.31, "2021-11": 55.54, "2021-12": 54.81,
  "2022-01": 54.05, "2022-02": 53.12, "2022-03": 52.29,
  "2022-04": 51.26, "2022-05": 50.24, "2022-06": 49.21,
  "2022-07": 48.04, "2022-08": 46.97, "2022-09": 45.95,
  "2022-10": 44.93, "2022-11": 43.81, "2022-12": 42.69,
  "2023-01": 41.77, "2023-02": 40.60, "2023-03": 39.68,
  "2023-04": 38.56, "2023-05": 37.49, "2023-06": 36.42,
  "2023-07": 35.28, "2023-08": 34.31, "2023-09": 33.31,
  "2023-10": 32.39, "2023-11": 31.50, "2023-12": 30.53,
  "2024-01": 29.73, "2024-02": 28.90, "2024-03": 28.01,
  "2024-04": 27.18, "2024-05": 26.39, "2024-06": 25.48,
  "2024-07": 24.61, "2024-08": 23.77, "2024-09": 22.84,
  "2024-10": 22.05, "2024-11": 21.12, "2024-12": 20.11,
  "2025-01": 19.12, "2025-02": 18.16, "2025-03": 17.10,
  "2025-04": 15.96, "2025-05": 14.86, "2025-06": 13.58,
  "2025-07": 12.42, "2025-08": 11.20, "2025-09": 9.92,
  "2025-10": 8.87, "2025-11": 7.65, "2025-12": 6.49,
  "2026-01": 5.49, "2026-02": 4.28, "2026-03": 3.19,
  "2026-04": 2.12, "2026-05": 1.00, "2026-06": 0.00,
  "2026-07": 0.00,
};

const INDICES_UPDATED_AT = "01/07/2026 às 10:41";
const PARALISACOES_STORAGE_KEY = "reducaoParalisacoes";
const calculoCore = window.ReduzSimCalculo;

let formData = {};
let receitaResult = {};
let reducaoResult = {};
let paralisacoes = [];
let currentMonthFilter = "active";

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

function fmtRate(value) {
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
  return listMonths(
    receitaResult.dateInitial || formData.dataInicioAfericao || formData.dataInicioObra,
    receitaResult.dateFinal || formData.dataFimObra,
  );
}

function getDecayData() {
  return receitaResult.decadencia || calculoCore.calculateDecay(
    formData.dataInicioObra,
    formData.dataFimObra,
    formData.dataAfericao,
  );
}

function getDecadentMonths() {
  return new Set(getDecayData().decadentMonths || []);
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
    isDecadente: row.dataset.decadente === "true",
    remOriginal: parseLocaleNumber(row.querySelector("[data-field='remOriginal']").value),
    selic: parseLocaleNumber(row.querySelector("[data-field='selic']").value),
    maedInput: parseLocaleNumber(row.querySelector("[data-field='maedInput']").value),
  }));
}

function calculateRows(baseRows) {
  const applyMaed = document.getElementById("aplicar-maed").value === "true";
  const paymentDate = document.getElementById("data-referencia").value || calculoCore.formatLocalISO();
  const transmissionDate = document.getElementById("data-transmissao").value || paymentDate;

  return baseRows.map((row) => {
    if (row.isParalisacao || row.isDecadente) {
      return {
        ...row,
        remOriginal: 0,
        remAtualizada: 0,
        cpp: 0,
        multaMora: 0,
        juros: 0,
        maedInput: 0,
        maed: 0,
        maedApplicable: false,
        total: 0,
      };
    }

    const remOriginal = round(row.remOriginal || 0);
    const remAtualizada = round(remOriginal * (1 + (row.selic / 100)));
    const cpp = round(remOriginal * 0.20);
    const latePayment = calculoCore.calculateLatePaymentFine(row.month, paymentDate, cpp);
    const multaMora = latePayment.value;
    const jurosPercent = latePayment.daysLate > 0 ? row.selic : 0;
    const juros = calculoCore.calculateLatePaymentInterest(cpp, jurosPercent, latePayment.daysLate);
    const calculatedMaed = calculoCore.calculateMaed(row.month, transmissionDate, cpp, {
      withMovement: true,
      spontaneous: true,
      fixedValue: 100,
    });
    const maedApplicable = applyMaed && calculatedMaed.value > 0;
    const maedInput = round(Math.max(row.maedInput ?? 100, 0));
    const maed = maedApplicable ? maedInput : 0;
    const total = round(cpp + multaMora + juros + maed);
    return {
      ...row,
      remOriginal,
      remAtualizada,
      cpp,
      multaMora,
      multaMoraPercent: latePayment.rate * 100,
      diasAtraso: latePayment.daysLate,
      juros,
      jurosPercent,
      maedInput,
      maed,
      maedApplicable,
      total,
    };
  });
}

function renderRows(rows) {
  const body = document.getElementById("monthly-rows");
  body.innerHTML = "";

  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = `rs-monthly-row${row.isParalisacao ? " rs-monthly-row--paused" : ""}${row.isDecadente ? " rs-monthly-row--decadent" : ""}`;
    item.dataset.monthRow = row.month;
    item.dataset.paralisacao = row.isParalisacao ? "true" : "false";
    item.dataset.decadente = row.isDecadente ? "true" : "false";
    item.dataset.active = !row.isParalisacao && !row.isDecadente ? "true" : "false";
    const isBlocked = row.isParalisacao || row.isDecadente;
    const status = [
      row.isDecadente ? "Decadente" : "",
      row.isParalisacao ? "Paralisação" : "",
    ].filter(Boolean).join(" · ");
    item.innerHTML = `
      <div class="rs-monthly-competencia">
        <span>Competência</span>
        <strong>${row.month}</strong>
        ${status ? `<small>${status}</small>` : ""}
      </div>
      <label>
        <span>Rem. atualizada</span>
        <strong data-output="remAtualizada">R$ ${fmt(row.remAtualizada)}</strong>
      </label>
      <label>
        <span>Rem. original</span>
        <input class="rs-table-input" data-field="remOriginal" type="number" step="0.01" value="${row.remOriginal}" ${isBlocked ? "disabled" : ""}>
      </label>
      <div class="rs-monthly-money">
        <span>CPP 20%</span>
        <strong data-output="cpp">R$ ${fmt(row.cpp)}</strong>
      </div>
      <div class="rs-monthly-money">
        <span>Multa mora</span>
        <strong data-output="multaMora">R$ ${fmt(row.multaMora)}</strong>
        <small data-detail="multaMora">${row.diasAtraso || 0} dias · ${fmtRate(row.multaMoraPercent)}%</small>
      </div>
      <label>
        <span>SELIC acum. (%)</span>
        <input class="rs-table-input" data-field="selic" type="number" step="0.01" value="${isBlocked ? 0 : row.selic}" ${isBlocked ? "disabled" : ""}>
      </label>
      <div class="rs-monthly-money">
        <span>Juros mora</span>
        <strong data-output="juros">R$ ${fmt(row.juros)}</strong>
        <small data-detail="juros">SELIC ${fmtRate(row.jurosPercent)}%</small>
      </div>
      <label class="rs-monthly-money">
        <span>MAED (R$)</span>
        <input class="rs-table-input" data-field="maedInput" type="number" min="0" step="0.01" value="${isBlocked ? 0 : row.maedInput}" ${isBlocked || !row.maedApplicable ? "disabled" : ""}>
        <small data-detail="maed">${row.maedApplicable ? "Valor editável" : "Não aplicável"}</small>
      </label>
      <div class="rs-monthly-total">
        <span>Total</span>
        <strong data-output="total">R$ ${fmt(row.total)}</strong>
      </div>
    `;
    body.appendChild(item);
  });
  updateMonthFilters(rows);
}

function updateMonthFilters(rows) {
  const counts = {
    active: rows.filter((row) => !row.isParalisacao && !row.isDecadente).length,
    paused: rows.filter((row) => row.isParalisacao).length,
    decadent: rows.filter((row) => row.isDecadente).length,
    all: rows.length,
  };
  Object.entries(counts).forEach(([key, value]) => setText(`${key}-month-count`, value));
  document.querySelectorAll("[data-month-row]").forEach((row) => {
    const visible = currentMonthFilter === "all"
      || (currentMonthFilter === "active" && row.dataset.active === "true")
      || (currentMonthFilter === "paused" && row.dataset.paralisacao === "true")
      || (currentMonthFilter === "decadent" && row.dataset.decadente === "true");
    row.hidden = !visible;
  });
  document.querySelectorAll("[data-month-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.monthFilter === currentMonthFilter ? "true" : "false");
  });
}

function setMonthFilter(filter) {
  currentMonthFilter = ["active", "paused", "decadent", "all"].includes(filter) ? filter : "active";
  updateMonthFilters(calculateRows(readMonthlyRows()));
}

function buildInitialRows() {
  const months = getWorkMonths();
  const pausedMonths = getParalisacaoMonths();
  const decadentMonths = getDecadentMonths();
  const activeMonths = months.filter((month) => !pausedMonths.has(month) && !decadentMonths.has(month));
  const rmtMeta = getRmtGoal();
  const selicFactors = activeMonths.map((month) => 1 + ((SELIC_ACUMULADA[month] ?? 0) / 100));
  const totalFactor = selicFactors.reduce((sum, factor) => sum + factor, 0);
  const remMensalOriginal = totalFactor > 0 ? round(rmtMeta / totalFactor) : 0;

  const rows = months.map((month) => ({
    month,
    selic: pausedMonths.has(month) || decadentMonths.has(month) ? 0 : (SELIC_ACUMULADA[month] ?? 0),
    isParalisacao: pausedMonths.has(month),
    isDecadente: decadentMonths.has(month),
    remOriginal: pausedMonths.has(month) || decadentMonths.has(month) ? 0 : remMensalOriginal,
    maedInput: pausedMonths.has(month) || decadentMonths.has(month) ? 0 : 100,
  }));

  const activeRows = rows.filter((row) => !row.isParalisacao && !row.isDecadente);
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
    && Boolean(row.isParalisacao) === Boolean(initialRows[index].isParalisacao)
    && Boolean(row.isDecadente) === Boolean(initialRows[index].isDecadente));
  if (!isCompatible) return null;

  const mappedRows = storedRows.map((row, index) => ({
    month: initialRows[index].month,
    isParalisacao: initialRows[index].isParalisacao,
    isDecadente: initialRows[index].isDecadente,
    remOriginal: parseLocaleNumber(row.remOriginal),
    selic: parseLocaleNumber(row.selic),
    maedInput: row.maedInput === undefined ? 100 : parseLocaleNumber(row.maedInput),
  }));

  const storedBasis = reducaoResult && reducaoResult.basis;
  const currentBasis = getCurrentCalculationBasis();
  if (storedBasis && !isSameCalculationBasis(storedBasis, currentBasis)) return null;
  if (!storedBasis && !isRowsCompatibleWithRmtGoal(mappedRows)) return null;

  return mappedRows;
}

function getCurrentCalculationBasis() {
  return {
    calculationVersion: 4,
    receitaCalculatedAt: receitaResult.calculatedAt || "",
    rmt: round(receitaResult.rmtNaoDecadente || receitaResult.rmt || 0),
    areaTotal: round(receitaResult.areaTotal || 0),
    dateInitial: receitaResult.dateInitial || formData.dataInicioObra || "",
    dateFinal: receitaResult.dateFinal || formData.dataFimObra || "",
    assessmentDate: receitaResult.assessmentDate || formData.dataAfericao || "",
  };
}

function isSameCalculationBasis(a, b) {
  return a
    && b
    && a.calculationVersion === b.calculationVersion
    && a.receitaCalculatedAt === b.receitaCalculatedAt
    && round(a.rmt || 0) === round(b.rmt || 0)
    && round(a.areaTotal || 0) === round(b.areaTotal || 0)
    && a.dateInitial === b.dateInitial
    && a.dateFinal === b.dateFinal
    && a.assessmentDate === b.assessmentDate;
}

function getRmtGoal() {
  if (Number.isFinite(Number(receitaResult.metaFatorAjuste))) {
    return round(receitaResult.metaFatorAjuste);
  }
  const metaPercentual = formData.responsavelObra === "PF"
    ? ((receitaResult.areaTotal || 0) <= 350 ? 0.5 : 0.7)
    : 1;
  return round((receitaResult.rmtNaoDecadente || receitaResult.rmt || 0) * metaPercentual);
}

function getUpdatedRemunerationTotal(rows) {
  return round(rows.reduce((sum, row) => (
    row.isParalisacao || row.isDecadente ? sum : sum + round(row.remOriginal * (1 + (row.selic / 100)))
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
  const receitaAposDecadencia = round(receitaResult.inssEstimado || 0);
  const receitaSemDecadencia = round(
    receitaResult.inssSemDecadencia ?? receitaResult.inssEstimado ?? 0,
  );
  const comparison = calculoCore.calculateCommercialComparison(
    receitaSemDecadencia,
    totalReducao,
  );
  const receita = comparison.baseline;
  const rmtSero = round(receitaResult.rmtNaoDecadente || receitaResult.rmt || 0);
  const metaPercentual = Number(receitaResult.metaPercentual)
    || (formData.responsavelObra === "PF"
      ? ((receitaResult.areaTotal || 0) <= 350 ? 50 : 70)
      : 100);
  const rmtMeta = getRmtGoal();
  const percentualAtingido = rmtSero > 0 ? round((totalRemAtualizada / rmtSero) * 100) : 0;
  const faltaMeta = round(Math.max(rmtMeta - totalRemAtualizada, 0));
  const economiaBruta = comparison.grossSavings;
  updateHonorariosMode();
  const honorariosConfig = getHonorariosConfig({ receita, totalReducao, economiaBruta });
  const honorarios = honorariosConfig.value;
  const economiaLiquida = round(Math.max(economiaBruta - honorarios, 0));
  const percentualReducao = comparison.savingsPercent;

  setText("inss-receita", fmt(receita));
  setText("receita-total", fmt(receita));
  setText("receita-apos-decadencia", fmt(receitaAposDecadencia));
  setText("reducao-total", fmt(totalReducao));
  setText("economia-bruta", fmt(economiaBruta));
  setText("honorarios", fmt(honorarios));
  setText("economia-liquida", fmt(economiaLiquida));
  setText("percentual-reducao", percentualReducao.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  setText("rmt-sero", fmt(rmtSero));
  setText("rmt-meta", fmt(rmtMeta));
  setText("rmt-meta-label", formData.responsavelObra === "PJ" ? "Base integral a comprovar" : "Meta de comprovação");
  setText("rmt-meta-percent", metaPercentual.toLocaleString("pt-BR"));
  setText("rmt-percentual-atingido", percentualAtingido.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
  setText("rmt-comprovado", fmt(totalRemAtualizada));
  setText("rmt-falta", fmt(faltaMeta));
  setWidth("rmt-progress-bar", rmtMeta > 0 ? (totalRemAtualizada / rmtMeta) * 100 : 0);

  return {
    receita,
    receitaAposDecadencia,
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

    ["remAtualizada", "cpp", "multaMora", "juros", "total"].forEach((field) => {
      const output = rowElement.querySelector(`[data-output="${field}"]`);
      if (output) output.textContent = `R$ ${fmt(row[field])}`;
    });
    const fineDetail = rowElement.querySelector("[data-detail='multaMora']");
    const interestDetail = rowElement.querySelector("[data-detail='juros']");
    const maedDetail = rowElement.querySelector("[data-detail='maed']");
    const maedInput = rowElement.querySelector("[data-field='maedInput']");
    if (fineDetail) fineDetail.textContent = `${row.diasAtraso || 0} dias · ${fmtRate(row.multaMoraPercent)}%`;
    if (interestDetail) interestDetail.textContent = `SELIC ${fmtRate(row.jurosPercent)}%`;
    if (maedInput) {
      maedInput.value = row.isParalisacao || row.isDecadente ? 0 : row.maedInput;
      maedInput.disabled = row.isParalisacao || row.isDecadente || !row.maedApplicable;
    }
    if (maedDetail) maedDetail.textContent = row.maedApplicable ? "Valor editável" : "Não aplicável";
  });
}

function updateMonthlyCalculation() {
  const rows = calculateRows(readMonthlyRows());
  updateRenderedMonthlyValues(rows);
  return { rows, totals: updateTotals(rows) };
}

function copyFirstRemuneracaoToAll() {
  const selector = "[data-month-row]:not([data-paralisacao='true']):not([data-decadente='true']) [data-field='remOriginal']";
  const firstInput = document.querySelector(selector);
  if (!firstInput) return;

  document.querySelectorAll(selector).forEach((input) => {
    input.value = firstInput.value;
  });

  updateMonthlyCalculation();
}

function copyFirstMaedToAll() {
  const selector = "[data-field='maedInput']:not(:disabled)";
  const firstInput = document.querySelector(selector);
  if (!firstInput) return;

  document.querySelectorAll(selector).forEach((input) => {
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
    selic: row.isParalisacao || row.isDecadente ? 0 : (SELIC_ACUMULADA[row.month] ?? row.selic),
  }));
  const rows = calculateRows(baseRows);
  renderRows(rows);
  return { rows, totals: updateTotals(rows) };
}

async function refreshSelic(renderAfterRefresh = true) {
  if (!window.ReduzSimIndices) {
    updateIndicesNote(`Os índices foram atualizados pela última vez no dia ${INDICES_UPDATED_AT}.`);
    return;
  }

  try {
    await window.ReduzSimIndices.fetchSelicRates();
    const months = typeof getWorkMonths === "function" ? getWorkMonths() : Object.keys(SELIC_ACUMULADA);
    const reference = document.getElementById("data-referencia")?.value;
    Object.assign(SELIC_ACUMULADA, window.ReduzSimIndices.calculateSelicMap(months, reference));
    if (renderAfterRefresh && document.querySelector("[data-month-row]")) applyCurrentSelicToRows();
    updateIndicesNote("Índices atualizados para este cálculo.");
  } catch (error) {
    console.warn("Falha ao atualizar SELIC.", error);
    updateIndicesNote("Não foi possível buscar a SELIC agora; usando último índice válido como fallback.");
  }
}

function defaultValidityDate() {
  return calculoCore.calculateProposalValidity();
}

function initCommercialFields() {
  const commercial = reducaoResult?.commercial || {};
  const settings = reducaoResult?.settings || {};
  const consultor = document.getElementById("consultor-nome");
  const validade = document.getElementById("proposta-validade");
  const observacoes = document.getElementById("observacoes-comerciais");
  if (consultor) consultor.value = commercial.consultor || "";
  if (validade) validade.value = defaultValidityDate();
  if (observacoes) observacoes.value = commercial.observacoes || "";
  document.getElementById("data-referencia").value = settings.paymentDate || calculoCore.formatLocalISO();
  document.getElementById("data-transmissao").value = settings.transmissionDate || calculoCore.formatLocalISO();
  document.getElementById("aplicar-maed").value = settings.applyMaed === false ? "false" : "true";
  if (settings.honorariosMode) document.getElementById("honorarios-mode").value = settings.honorariosMode;
  if (settings.honorariosPercent !== undefined) document.getElementById("honorarios-percent").value = settings.honorariosPercent;
  if (settings.honorariosBase && document.getElementById("honorarios-base")) {
    document.getElementById("honorarios-base").value = settings.honorariosBase;
  }
  if (settings.honorariosFixed !== undefined) document.getElementById("honorarios-fixed").value = settings.honorariosFixed;
  currentMonthFilter = settings.monthFilter || "active";
}

function getCommercialData() {
  return {
    consultor: document.getElementById("consultor-nome")?.value.trim() || "",
    validade: document.getElementById("proposta-validade")?.value || "",
    observacoes: document.getElementById("observacoes-comerciais")?.value.trim() || "",
  };
}

function getCalculationSettings() {
  return {
    paymentDate: document.getElementById("data-referencia").value,
    transmissionDate: document.getElementById("data-transmissao").value,
    applyMaed: document.getElementById("aplicar-maed").value === "true",
    honorariosMode: document.getElementById("honorarios-mode").value,
    honorariosPercent: parseLocaleNumber(document.getElementById("honorarios-percent").value),
    honorariosBase: document.getElementById("honorarios-base")?.value || "economia",
    honorariosFixed: parseLocaleNumber(document.getElementById("honorarios-fixed").value),
    monthFilter: currentMonthFilter,
  };
}

function renderDecaySummary() {
  const decay = getDecayData();
  const summary = document.getElementById("decadencia-summary");
  if (!summary) return;
  const hasDecay = decay.decadentCount > 0;
  summary.hidden = !hasDecay;
  summary.textContent = hasDecay
    ? `Decadência automática: ${decay.decadentCount} de ${decay.totalMonths} competências decadentes até ${monthLabel(decay.lastDecadentMonth)}. Percentual não decadente: ${decay.nonDecadentPercent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%.`
    : "";
  document.getElementById("decadent-filter-button").hidden = !hasDecay;
  document.getElementById("receita-apos-decadencia-block").hidden = !hasDecay;
  setText("baseline-inss-label", hasDecay ? "INSS sem decadência" : "INSS estimado");
  setText("rmt-tracker-label", hasDecay ? "RMT não decadente" : "RMT da obra");
  setText(
    "maed-premise",
    hasDecay
      ? "Premissa comercial editável do simulador. Meses sem atraso, decadentes ou paralisados permanecem zerados."
      : "Premissa comercial editável do simulador. Meses sem atraso ou paralisados permanecem zerados.",
  );
  if (!hasDecay && currentMonthFilter === "decadent") currentMonthFilter = "active";
  document.getElementById("pj-premise-note").hidden = formData.responsavelObra !== "PJ";
}

function finalizeCalculation() {
  const result = recalculate(true);
  localStorage.setItem("reducaoResult", JSON.stringify({
    calculatedAt: new Date().toISOString(),
    basis: getCurrentCalculationBasis(),
    commercial: getCommercialData(),
    settings: getCalculationSettings(),
    indices: getIndicesMeta(),
    rows: result.rows,
    totals: result.totals,
  }));
  window.location.href = "final.html";
}

(async () => {
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

  formData.dataAfericao = formData.dataAfericao || receitaResult.assessmentDate || calculoCore.formatLocalISO();
  setPrintTitle("Cálculo de redução", formData.clienteNome);
  setParalisacaoInputRange();
  paralisacoes = loadParalisacoes();
  renderParalisacoes();
  initCommercialFields();
  updateHonorariosMode();
  renderDecaySummary();
  updateIndicesNote(`Os índices foram atualizados pela última vez no dia ${INDICES_UPDATED_AT}.`);
  document.getElementById("recalc-btn").addEventListener("click", finalizeCalculation);
  document.getElementById("print-reducao-btn").addEventListener("click", () => window.print());
  document.getElementById("refresh-indices-btn").addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = "Atualizando...";
    try {
      await window.ReduzSimIndices?.refreshAll([]);
      await refreshSelic(true);
    } finally {
      event.currentTarget.disabled = false;
      event.currentTarget.textContent = "Atualizar índices";
    }
  });
  document.getElementById("redistribute-remuneracao").addEventListener("click", () => recalculate(false));
  document.getElementById("copy-first-remuneracao").addEventListener("click", copyFirstRemuneracaoToAll);
  document.getElementById("copy-first-maed").addEventListener("click", copyFirstMaedToAll);
  document.getElementById("add-paralisacao-btn").addEventListener("click", addParalisacao);
  document.getElementById("paralisacao-list").addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-paralisacao]");
    if (removeButton) removeParalisacao(Number.parseInt(removeButton.dataset.removeParalisacao, 10));
  });
  document.getElementById("monthly-rows").addEventListener("input", (event) => {
    if (event.target.matches("[data-field='remOriginal'], [data-field='selic'], [data-field='maedInput']")) {
      updateMonthlyCalculation();
    }
  });
  document.getElementById("month-filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-month-filter]");
    if (button) setMonthFilter(button.dataset.monthFilter);
  });
  document.getElementById("honorarios-percent").addEventListener("input", updateMonthlyCalculation);
  document.getElementById("honorarios-mode").addEventListener("change", () => {
    updateHonorariosMode();
    updateMonthlyCalculation();
  });
  document.getElementById("honorarios-base")?.addEventListener("change", updateMonthlyCalculation);
  document.getElementById("honorarios-fixed").addEventListener("input", updateMonthlyCalculation);
  document.getElementById("aplicar-maed").addEventListener("change", updateMonthlyCalculation);
  document.getElementById("data-referencia").addEventListener("change", () => refreshSelic(true));
  document.getElementById("data-transmissao").addEventListener("change", updateMonthlyCalculation);

  try {
    await refreshSelic(false);
    restoreMonthlyCalculation();
  } finally {
    document.getElementById("calculation-loading").hidden = true;
  }
  window.ReduzSimIndices?.scheduleAutoUpdates([], () => refreshSelic(true));
})();
