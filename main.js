const clienteNome = document.getElementById("cliente-nome");
const clienteTelefone = document.getElementById("cliente-telefone");
const responsavelObra = document.getElementById("responsavel-obra");
const destinacao = document.getElementById("destinacao");
const tipoObra = document.getElementById("tipo-obra");
const isUsoConcreto = document.getElementById("uso-concreto");
const UF = document.getElementById("UF");
const dataInicioObra = document.getElementById("data-inicio-obra");
const dataFimObra = document.getElementById("data-fim-obra");

const areaConstrucao = document.getElementById("area-construcao");
const areaReforma = document.getElementById("area-reforma");
const areaDemolicao = document.getElementById("area-demolicao");
const areaCoberta = document.getElementById("area-comp-coberta");
const areaDescoberta = document.getElementById("area-comp-descoberta");
const areaFields = [areaConstrucao, areaReforma, areaDemolicao, areaCoberta, areaDescoberta];
const HISTORY_KEY = "reduzsim_simulation_history_v1";

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

function parseArea(input) {
  return parseLocaleNumber(input.value);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const area = digits.slice(0, 2);
  const ninthDigit = digits.slice(2, 3);
  const middle = digits.slice(3, 7);
  const last = digits.slice(7, 11);

  if (!area) return "";

  let formatted = `(${area}`;
  if (area.length === 2) formatted += ")";
  if (ninthDigit) formatted += ` ${ninthDigit}`;
  if (middle) formatted += ` ${middle}`;
  if (last) formatted += `-${last}`;

  return formatted;
}

function isDataInvalid() {
  return areaFields.every((field) => parseArea(field) === 0);
}

function paintInvalidAreas() {
  areaFields.forEach((field) => {
    field.classList.remove("valid");
    field.classList.add("is-invalid");
  });
}

function clearAreaErrors() {
  areaFields.forEach((field) => {
    field.classList.remove("is-invalid");
  });
}

function buildFormData() {
  const formData = {
    clienteNome: clienteNome.value.trim(),
    clienteTelefone: clienteTelefone.value.trim(),
    calculatedAt: new Date().toISOString(),
    responsavelObra: responsavelObra.value,
    destinacao: destinacao.value,
    tipoObra: tipoObra.value,
    isUsoConcreto: isUsoConcreto.value === "true",
    UF: UF.value,
    dataInicioObra: dataInicioObra.value,
    dataFimObra: dataFimObra.value,
    areaConstrucao: parseArea(areaConstrucao),
    areaReforma: parseArea(areaReforma),
    areaDemolicao: parseArea(areaDemolicao),
    areaCoberta: parseArea(areaCoberta),
    areaDescoberta: parseArea(areaDescoberta),
  };

  formData.areaTotal = formData.areaConstrucao
    + formData.areaReforma
    + formData.areaDemolicao
    + formData.areaCoberta
    + formData.areaDescoberta;

  localStorage.setItem("formData", JSON.stringify(formData));
  localStorage.removeItem("receitaResult");
  localStorage.removeItem("reducaoResult");
  localStorage.removeItem("reducaoParalisacoes");
}

function validateDates() {
  dataFimObra.setCustomValidity("");
  if (dataInicioObra.value && dataFimObra.value && new Date(dataFimObra.value) < new Date(dataInicioObra.value)) {
    dataFimObra.setCustomValidity("A data final não pode ser anterior à data inicial.");
    return false;
  }
  return true;
}

function readHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(history) ? history : [];
  } catch (error) {
    return [];
  }
}

function renderHistory() {
  const card = document.getElementById("history-card");
  const list = document.getElementById("history-list");
  if (!card || !list) return;

  const history = readHistory();
  card.hidden = history.length === 0;
  list.innerHTML = "";

  history.slice(0, 12).forEach((item) => {
    const form = item.formData || {};
    const totals = item.reducaoResult?.totals || {};
    const row = document.createElement("div");
    row.className = "rs-history-item";
    row.innerHTML = `
      <div>
        <strong>${form.clienteNome || "Cliente sem nome"}</strong>
        <span>${new Date(item.savedAt || item.calculatedAt || Date.now()).toLocaleString("pt-BR")}</span>
        <small>${form.UF || "-"} | ${Number(form.areaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m² | economia líquida R$ ${Number(totals.economiaLiquida || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</small>
      </div>
      <div class="rs-history-item-actions">
        <button class="rs-btn-outline" type="button" data-history-load="${item.id}">Abrir</button>
        <button class="rs-btn-outline" type="button" data-history-delete="${item.id}">Excluir</button>
      </div>
    `;
    list.appendChild(row);
  });
}

function bindHistoryActions() {
  const list = document.getElementById("history-list");
  if (!list) return;

  list.addEventListener("click", (event) => {
    const loadId = event.target.dataset.historyLoad;
    const deleteId = event.target.dataset.historyDelete;
    if (!loadId && !deleteId) return;

    const history = readHistory();
    const item = history.find((entry) => entry.id === (loadId || deleteId));
    if (!item) return;

    if (loadId) {
      localStorage.setItem("formData", JSON.stringify(item.formData || {}));
      if (item.receitaResult) localStorage.setItem("receitaResult", JSON.stringify(item.receitaResult));
      if (item.reducaoResult) localStorage.setItem("reducaoResult", JSON.stringify(item.reducaoResult));
      window.location.href = item.reducaoResult ? "final.html" : "result.html";
      return;
    }

    if (deleteId) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.filter((entry) => entry.id !== deleteId)));
      renderHistory();
    }
  });

  document.getElementById("clear-history-btn")?.addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  });
}

(() => {
  "use strict";

  const form = document.getElementById("form");
  const errorMessage = document.getElementById("msg-erro");

  dataFimObra.value = dataFimObra.value || todayISO();
  clienteTelefone.value = formatPhone(clienteTelefone.value);
  renderHistory();
  bindHistoryActions();

  clienteTelefone.addEventListener("input", () => {
    clienteTelefone.value = formatPhone(clienteTelefone.value);
  });

  areaFields.forEach((field) => {
    field.addEventListener("input", () => {
      clearAreaErrors();
      errorMessage.hidden = true;
    });
  });
  dataInicioObra.addEventListener("change", validateDates);
  dataFimObra.addEventListener("change", validateDates);

  form.addEventListener("submit", (event) => {
    validateDates();
    buildFormData();

    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    } else if (isDataInvalid()) {
      event.preventDefault();
      event.stopPropagation();
      errorMessage.hidden = false;
      paintInvalidAreas();
    } else {
      errorMessage.hidden = true;
    }

    form.classList.add("was-validated");
  });
})();
