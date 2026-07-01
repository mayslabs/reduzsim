const calc = window.ReduzSimCalculo;
const clienteNome = document.getElementById("cliente-nome");
const clienteTelefone = document.getElementById("cliente-telefone");
const responsavelObra = document.getElementById("responsavel-obra");
const isUsoConcreto = document.getElementById("uso-concreto");
const UF = document.getElementById("UF");
const dataInicioObra = document.getElementById("data-inicio-obra");
const dataFimObra = document.getElementById("data-fim-obra");
const dataAfericao = document.getElementById("data-afericao");
const tipoAfericao = document.getElementById("tipo-afericao");
const mudancaResponsabilidade = document.getElementById("mudanca-responsabilidade");
const usoPreMoldado = document.getElementById("uso-pre-moldado");
const dataFimAfericaoAnterior = document.getElementById("data-fim-afericao-anterior");
const dataTransferencia = document.getElementById("data-transferencia");
const inicioAfericaoOpcao = document.getElementById("inicio-afericao-opcao");
const laudoData = document.getElementById("laudo-data");
const laudoConselho = document.getElementById("laudo-conselho");
const laudoRegistro = document.getElementById("laudo-registro");
const laudoArtRrt = document.getElementById("laudo-art-rrt");
const laudoMedida = document.getElementById("laudo-medida");
const laudoValor = document.getElementById("laudo-valor");
const destinationList = document.getElementById("destination-list");
const destinationTemplate = document.getElementById("destination-template");
const HISTORY_KEY = "reduzsim_simulation_history_v1";
const DATABASE_VERSION = 2;
const NUMERIC_DESTINATION_KEYS = new Set([
  ...calc.AREA_KEYS,
  ...calc.PROJECT_AREA_KEYS,
  "preMoldadoValor",
]);

let destinations = [];

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

function legacyDestination(data = {}) {
  return {
    id: "dest-1",
    destinacao: data.destinacao || "RES",
    tipoObra: data.tipoObra || "ALV",
    areaConstrucao: calc.toNumber(data.areaConstrucao),
    areaReforma: calc.toNumber(data.areaReforma),
    areaDemolicao: calc.toNumber(data.areaDemolicao),
    areaCoberta: calc.toNumber(data.areaCoberta),
    areaDescoberta: calc.toNumber(data.areaDescoberta),
    projetoAreaConstrucao: calc.toNumber(data.projetoAreaConstrucao),
    projetoAreaReforma: calc.toNumber(data.projetoAreaReforma),
    projetoAreaDemolicao: calc.toNumber(data.projetoAreaDemolicao),
    projetoAreaCoberta: calc.toNumber(data.projetoAreaCoberta),
    projetoAreaDescoberta: calc.toNumber(data.projetoAreaDescoberta),
    preMoldadoValor: calc.toNumber(data.preMoldadoValor),
  };
}

function getStoredFormData() {
  try {
    return JSON.parse(localStorage.getItem("formData")) || null;
  } catch (error) {
    return null;
  }
}

function readHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(history) ? history : [];
  } catch (error) {
    return [];
  }
}

function destinationAreaTotal(destination) {
  return calc.AREA_KEYS.reduce((sum, key) => sum + calc.toNumber(destination[key]), 0);
}

function syncDestinationsFromDOM() {
  destinations = Array.from(destinationList.querySelectorAll("[data-destination-item]")).map((item, index) => {
    const value = { id: item.dataset.destinationId || `dest-${index + 1}` };
    item.querySelectorAll("[data-destination-field]").forEach((field) => {
      const key = field.dataset.destinationField;
      value[key] = NUMERIC_DESTINATION_KEYS.has(key) ? calc.toNumber(field.value) : field.value;
    });
    return calc.normalizeDestination(value, index);
  });
  return destinations;
}

function updateDestinationControls() {
  const items = Array.from(destinationList.querySelectorAll("[data-destination-item]"));
  const showProjectAreas = tipoAfericao.value !== "TOTAL";
  items.forEach((item, index) => {
    const select = item.querySelector("[data-destination-field='destinacao']");
    const constructionType = item.querySelector("[data-destination-field='tipoObra']");
    const title = item.querySelector("[data-destination-title]");
    const removeButton = item.querySelector("[data-remove-destination]");
    const precastField = item.querySelector("[data-precast-field]");
    const precastInput = item.querySelector("[data-destination-field='preMoldadoValor']");
    const projectAreas = item.querySelector("[data-project-areas]");
    title.textContent = `${index + 1}. ${calc.DESTINATION_LABELS[select.value] || "Destinação"}`;
    removeButton.hidden = items.length === 1;
    projectAreas.hidden = !showProjectAreas;
    precastField.hidden = usoPreMoldado.value !== "true" || constructionType.value !== "ALV";
    if (precastField.hidden) precastInput.value = "0";
  });
}

function updateSpecialControls() {
  const isPartial = tipoAfericao.value !== "TOTAL";
  const isUnfinished = tipoAfericao.value === "INACABADA";
  const hasTransfer = mudancaResponsabilidade.value === "true" || isUnfinished;
  if (isUnfinished) mudancaResponsabilidade.value = "true";
  mudancaResponsabilidade.disabled = isUnfinished;

  const transferOption = inicioAfericaoOpcao.querySelector("option[value='TRANSFERENCIA']");
  transferOption.hidden = !hasTransfer;
  transferOption.disabled = !hasTransfer;
  if (!hasTransfer && inicioAfericaoOpcao.value === "TRANSFERENCIA") {
    inicioAfericaoOpcao.value = "OBRA";
  }

  const needsPreviousEnd = inicioAfericaoOpcao.value === "APOS_ULTIMA";
  document.querySelector("[data-special-field='previous-end']").hidden = !needsPreviousEnd;
  document.querySelector("[data-special-field='transfer-date']").hidden = !hasTransfer;
  document.querySelector("[data-special-field='start-option']").hidden = !isPartial && !hasTransfer;
  document.getElementById("laudo-panel").hidden = !isUnfinished;
  document.getElementById("special-case-note").hidden = !isPartial && !hasTransfer;
  updateDestinationControls();
}

function createDestinationItem(destination, index) {
  const normalized = calc.normalizeDestination(destination, index);
  const fragment = destinationTemplate.content.cloneNode(true);
  const item = fragment.querySelector("[data-destination-item]");
  item.dataset.destinationId = normalized.id;

  item.querySelectorAll("[data-destination-field]").forEach((field) => {
    const key = field.dataset.destinationField;
    const id = `destination-${index}-${key}`;
    field.id = id;
    const label = field.closest("[class*='col-']")?.querySelector("label");
    if (label) label.htmlFor = id;
    field.value = normalized[key];
  });
  return fragment;
}

function renderDestinations(items) {
  destinationList.innerHTML = "";
  destinations = calc.normalizeDestinations(items);
  destinations.forEach((destination, index) => {
    destinationList.appendChild(createDestinationItem(destination, index));
  });
  updateDestinationControls();
}

function addDestination() {
  syncDestinationsFromDOM();
  destinations.push(calc.normalizeDestination({
    id: `dest-${Date.now().toString(36)}`,
    destinacao: destinations[destinations.length - 1]?.destinacao || "RES",
    tipoObra: destinations[destinations.length - 1]?.tipoObra || "ALV",
  }, destinations.length));
  renderDestinations(destinations);
}

function removeDestination(id) {
  syncDestinationsFromDOM();
  if (destinations.length <= 1) return;
  renderDestinations(destinations.filter((item) => item.id !== id));
  clearAreaErrors();
}

function clearAreaErrors() {
  destinationList.querySelectorAll("[data-destination-field]").forEach((field) => {
    field.classList.remove("is-invalid");
  });
}

function paintInvalidAreas() {
  destinationList.querySelectorAll("[data-destination-item]").forEach((item) => {
    const hasArea = Array.from(item.querySelectorAll("[data-destination-field]")).some((field) => (
      calc.AREA_KEYS.includes(field.dataset.destinationField) && calc.toNumber(field.value) > 0
    ));
    item.querySelectorAll("[data-destination-field]").forEach((field) => {
      if (!hasArea && calc.AREA_KEYS.includes(field.dataset.destinationField)) field.classList.add("is-invalid");
    });
    if (tipoAfericao.value !== "TOTAL") {
      calc.AREA_KEYS.forEach((areaKey, index) => {
        const currentField = item.querySelector(`[data-destination-field='${areaKey}']`);
        const projectField = item.querySelector(`[data-destination-field='${calc.PROJECT_AREA_KEYS[index]}']`);
        if (calc.toNumber(projectField.value) < calc.toNumber(currentField.value)) {
          projectField.classList.add("is-invalid");
        }
      });
    }
  });
}

function validateAreas() {
  const items = syncDestinationsFromDOM();
  const hasCurrentAreas = items.length > 0 && items.every((destination) => destinationAreaTotal(destination) > 0);
  if (!hasCurrentAreas || tipoAfericao.value === "TOTAL") return hasCurrentAreas;

  return items.every((destination) => calc.AREA_KEYS.every((areaKey, index) => {
    const projectKey = calc.PROJECT_AREA_KEYS[index];
    const currentArea = calc.toNumber(destination[areaKey]);
    const projectArea = calc.toNumber(destination[projectKey]);
    return projectArea >= currentArea && (currentArea === 0 || projectArea > 0);
  }));
}

function validateDates() {
  dataFimObra.setCustomValidity("");
  dataAfericao.setCustomValidity("");
  if (dataInicioObra.value && dataFimObra.value && dataFimObra.value < dataInicioObra.value) {
    dataFimObra.setCustomValidity("A data final não pode ser anterior à data inicial.");
    return false;
  }
  if (dataAfericao.value && dataInicioObra.value && dataAfericao.value < dataInicioObra.value) {
    dataAfericao.setCustomValidity("A aferição não pode ser anterior ao início da obra.");
    return false;
  }
  return true;
}

function setRequired(element, required) {
  if (!element) return;
  element.required = required;
  if (!required) element.setCustomValidity("");
}

function validateSpecialCase() {
  const isPartial = tipoAfericao.value !== "TOTAL";
  const isUnfinished = tipoAfericao.value === "INACABADA";
  const hasTransfer = mudancaResponsabilidade.value === "true";
  const needsPreviousEnd = inicioAfericaoOpcao.value === "APOS_ULTIMA";

  setRequired(dataFimAfericaoAnterior, isPartial && needsPreviousEnd);
  setRequired(dataTransferencia, hasTransfer);
  [laudoData, laudoRegistro, laudoArtRrt, laudoValor].forEach((field) => {
    setRequired(field, isUnfinished);
  });

  if (dataFimAfericaoAnterior.value && dataFimAfericaoAnterior.value >= dataFimObra.value) {
    dataFimAfericaoAnterior.setCustomValidity("A aferição anterior deve terminar antes da aferição atual.");
    return false;
  }
  dataFimAfericaoAnterior.setCustomValidity("");

  if (hasTransfer && dataTransferencia.value) {
    const outsideWork = dataTransferencia.value < dataInicioObra.value
      || dataTransferencia.value > dataFimObra.value;
    dataTransferencia.setCustomValidity(outsideWork ? "Informe uma transferência dentro do período da obra." : "");
    if (outsideWork) return false;
  }

  if (isUnfinished && laudoMedida.value === "PERCENTUAL") {
    const percentage = calc.toNumber(laudoValor.value);
    laudoValor.setCustomValidity(
      percentage <= 0 || percentage > 100 ? "Informe um percentual entre 0 e 100." : "",
    );
    if (percentage <= 0 || percentage > 100) return false;
  } else {
    laudoValor.setCustomValidity("");
  }
  return true;
}

function buildFormData() {
  const normalizedDestinations = syncDestinationsFromDOM();
  const areaTotal = normalizedDestinations.reduce((sum, item) => sum + destinationAreaTotal(item), 0);
  return {
    schemaVersion: 3,
    clienteNome: clienteNome.value.trim(),
    clienteTelefone: clienteTelefone.value.trim(),
    calculatedAt: new Date().toISOString(),
    responsavelObra: responsavelObra.value,
    isUsoConcreto: isUsoConcreto.value === "true",
    UF: UF.value,
    dataInicioObra: dataInicioObra.value,
    dataFimObra: dataFimObra.value,
    dataAfericao: dataAfericao.value,
    tipoAfericao: tipoAfericao.value,
    isUsoPreMoldado: usoPreMoldado.value === "true",
    mudancaResponsabilidade: mudancaResponsabilidade.value === "true",
    dataFimAfericaoAnterior: dataFimAfericaoAnterior.value,
    dataTransferencia: dataTransferencia.value,
    inicioAfericaoOpcao: inicioAfericaoOpcao.value,
    laudo: {
      data: laudoData.value,
      conselho: laudoConselho.value,
      registro: laudoRegistro.value.trim(),
      artRrt: laudoArtRrt.value.trim(),
      medida: laudoMedida.value,
      valor: calc.toNumber(laudoValor.value),
    },
    destinacoes: normalizedDestinations,
    areaTotal: calc.roundMoney(areaTotal),
  };
}

function saveFormData() {
  localStorage.setItem("formData", JSON.stringify(buildFormData()));
  localStorage.removeItem("receitaResult");
  localStorage.removeItem("reducaoResult");
  localStorage.removeItem("reducaoParalisacoes");
}

function restoreFormData(data) {
  if (!data) {
    dataFimObra.value = calc.formatLocalISO();
    dataAfericao.value = calc.formatLocalISO();
    tipoAfericao.value = "TOTAL";
    mudancaResponsabilidade.value = "false";
    usoPreMoldado.value = "false";
    renderDestinations([legacyDestination()]);
    updateSpecialControls();
    return;
  }

  clienteNome.value = data.clienteNome || "";
  clienteTelefone.value = formatPhone(data.clienteTelefone || "");
  responsavelObra.value = data.responsavelObra || "PF";
  isUsoConcreto.value = data.isUsoConcreto ? "true" : "false";
  UF.value = data.UF || "";
  dataInicioObra.value = data.dataInicioObra || "";
  dataFimObra.value = data.dataFimObra || calc.formatLocalISO();
  dataAfericao.value = data.dataAfericao || calc.formatLocalISO();
  tipoAfericao.value = data.tipoAfericao || "TOTAL";
  mudancaResponsabilidade.value = data.mudancaResponsabilidade ? "true" : "false";
  usoPreMoldado.value = (
    data.isUsoPreMoldado
    || data.destinacoes?.some((item) => calc.toNumber(item.preMoldadoValor) > 0)
  )
    ? "true"
    : "false";
  dataFimAfericaoAnterior.value = data.dataFimAfericaoAnterior || "";
  dataTransferencia.value = data.dataTransferencia || "";
  inicioAfericaoOpcao.value = data.inicioAfericaoOpcao || "OBRA";
  laudoData.value = data.laudo?.data || "";
  laudoConselho.value = data.laudo?.conselho || "CREA";
  laudoRegistro.value = data.laudo?.registro || "";
  laudoArtRrt.value = data.laudo?.artRrt || "";
  laudoMedida.value = data.laudo?.medida || "AREA";
  laudoValor.value = data.laudo?.valor || "";
  renderDestinations(data.destinacoes?.length ? data.destinacoes : [legacyDestination(data)]);
  updateSpecialControls();
}

function createHistoryRow(item) {
  const form = item.formData || {};
  const totals = item.reducaoResult?.totals || {};
  const row = document.createElement("div");
  const content = document.createElement("div");
  const name = document.createElement("strong");
  const date = document.createElement("span");
  const summary = document.createElement("small");
  const actions = document.createElement("div");
  const openButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  row.className = "rs-history-item";
  actions.className = "rs-history-item-actions";
  openButton.className = "rs-btn-outline";
  deleteButton.className = "rs-btn-outline";
  openButton.type = "button";
  deleteButton.type = "button";
  openButton.dataset.historyLoad = item.id;
  deleteButton.dataset.historyDelete = item.id;
  openButton.textContent = "Abrir";
  deleteButton.textContent = "Excluir";
  name.textContent = form.clienteNome || "Cliente sem nome";
  date.textContent = new Date(item.savedAt || item.calculatedAt || Date.now()).toLocaleString("pt-BR");
  summary.textContent = `${form.UF || "-"} | ${calc.toNumber(form.areaTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m² | economia líquida R$ ${calc.toNumber(totals.economiaLiquida).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  content.append(name, date, summary);
  actions.append(openButton, deleteButton);
  row.append(content, actions);
  return row;
}

function renderHistory() {
  const card = document.getElementById("history-card");
  const list = document.getElementById("history-list");
  const history = readHistory();
  card.hidden = false;
  list.innerHTML = "";
  history.slice(0, 12).forEach((item) => list.appendChild(createHistoryRow(item)));
  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "rs-hint";
    empty.textContent = "Nenhuma simulação salva neste navegador.";
    list.appendChild(empty);
  }
}

function bindHistoryActions() {
  document.getElementById("history-list").addEventListener("click", (event) => {
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
      if (item.paralisacoes) localStorage.setItem("reducaoParalisacoes", JSON.stringify(item.paralisacoes));
      window.location.href = item.reducaoResult ? "final.html" : "result.html";
      return;
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.filter((entry) => entry.id !== deleteId)));
    renderHistory();
  });

  document.getElementById("clear-history-btn").addEventListener("click", () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  });
}

function collectDatabase() {
  const readValue = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      return null;
    }
  };
  return {
    schemaVersion: DATABASE_VERSION,
    updatedAt: new Date().toISOString(),
    history: readHistory(),
    current: {
      formData: readValue("formData"),
      receitaResult: readValue("receitaResult"),
      reducaoResult: readValue("reducaoResult"),
      paralisacoes: readValue("reducaoParalisacoes") || [],
    },
  };
}

function downloadDatabase(contents) {
  const blob = new Blob([contents], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Base ReduzSim.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function saveDatabase() {
  const contents = JSON.stringify(collectDatabase(), null, 2);
  if (!window.showSaveFilePicker) {
    downloadDatabase(contents);
    return;
  }
  const handle = await window.showSaveFilePicker({
    id: "reduzsim-base",
    suggestedName: "Base ReduzSim.json",
    types: [{ description: "Base do ReduzSim", accept: { "application/json": [".json"] } }],
  });
  const writable = await handle.createWritable();
  await writable.write(contents);
  await writable.close();
}

function mergeHistory(importedHistory) {
  const byId = new Map();
  [...readHistory(), ...(Array.isArray(importedHistory) ? importedHistory : [])].forEach((item) => {
    if (!item?.id) return;
    const existing = byId.get(item.id);
    if (!existing || String(item.savedAt || "") > String(existing.savedAt || "")) byId.set(item.id, item);
  });
  return Array.from(byId.values())
    .sort((a, b) => String(b.savedAt || "").localeCompare(String(a.savedAt || "")))
    .slice(0, 100);
}

function importDatabase(database) {
  if (!database || !Array.isArray(database.history) || !database.current) {
    throw new Error("O arquivo selecionado não é uma base válida do ReduzSim.");
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(mergeHistory(database.history)));
  const current = database.current;
  if (current.formData) localStorage.setItem("formData", JSON.stringify(current.formData));
  if (current.receitaResult) localStorage.setItem("receitaResult", JSON.stringify(current.receitaResult));
  if (current.reducaoResult) localStorage.setItem("reducaoResult", JSON.stringify(current.reducaoResult));
  localStorage.setItem("reducaoParalisacoes", JSON.stringify(current.paralisacoes || []));
  restoreFormData(current.formData || getStoredFormData());
  renderHistory();
}

async function readDatabaseFile(file) {
  const database = JSON.parse(await file.text());
  importDatabase(database);
}

async function openDatabase() {
  if (!window.showOpenFilePicker) {
    document.getElementById("base-file-input").click();
    return;
  }
  const [handle] = await window.showOpenFilePicker({
    id: "reduzsim-base",
    multiple: false,
    types: [{ description: "Base do ReduzSim", accept: { "application/json": [".json"] } }],
  });
  await readDatabaseFile(await handle.getFile());
}

(() => {
  "use strict";
  const form = document.getElementById("form");
  const errorMessage = document.getElementById("msg-erro");

  restoreFormData(getStoredFormData());
  renderHistory();
  bindHistoryActions();

  clienteTelefone.addEventListener("input", () => {
    clienteTelefone.value = formatPhone(clienteTelefone.value);
  });
  destinationList.addEventListener("input", () => {
    clearAreaErrors();
    errorMessage.hidden = true;
  });
  destinationList.addEventListener("change", (event) => {
    if (event.target.matches("[data-destination-field='destinacao'], [data-destination-field='tipoObra']")) {
      updateDestinationControls();
    }
  });
  destinationList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-destination]");
    if (removeButton) removeDestination(removeButton.closest("[data-destination-item]").dataset.destinationId);
  });
  document.getElementById("add-destination-btn").addEventListener("click", addDestination);
  dataInicioObra.addEventListener("change", validateDates);
  dataFimObra.addEventListener("change", validateDates);
  dataAfericao.addEventListener("change", validateDates);
  tipoAfericao.addEventListener("change", updateSpecialControls);
  mudancaResponsabilidade.addEventListener("change", updateSpecialControls);
  usoPreMoldado.addEventListener("change", updateDestinationControls);
  inicioAfericaoOpcao.addEventListener("change", () => {
    updateSpecialControls();
    validateSpecialCase();
  });

  document.getElementById("save-base-btn").addEventListener("click", async () => {
    try {
      await saveDatabase();
    } catch (error) {
      if (error.name !== "AbortError") window.alert(error.message);
    }
  });
  document.getElementById("open-base-btn").addEventListener("click", async () => {
    try {
      await openDatabase();
    } catch (error) {
      if (error.name !== "AbortError") window.alert(error.message);
    }
  });
  document.getElementById("base-file-input").addEventListener("change", async (event) => {
    if (!event.target.files?.[0]) return;
    try {
      await readDatabaseFile(event.target.files[0]);
    } catch (error) {
      window.alert(error.message);
    } finally {
      event.target.value = "";
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    validateDates();
    const validSpecialCase = validateSpecialCase();
    const validAreas = validateAreas();
    if (!form.checkValidity() || !validAreas || !validSpecialCase) {
      event.stopPropagation();
      errorMessage.textContent = validAreas
        ? "Revise os campos obrigatórios da situação da aferição."
        : "Informe áreas atuais válidas e, nos casos parciais, áreas totais do projeto iguais ou superiores.";
      errorMessage.hidden = validAreas && validSpecialCase;
      if (!validAreas) paintInvalidAreas();
      form.classList.add("was-validated");
      return;
    }

    errorMessage.hidden = true;
    saveFormData();
    window.location.href = "result.html";
  });
})();
