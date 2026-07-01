let formData = {};
let receitaResult = {};
let reducaoResult = {};
const HISTORY_KEY = "reduzsim_simulation_history_v1";

const typeResponsavel = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

const typeDestinacao = {
  RES: "Residencial unifamiliar",
  RMUL: "Residencial multifamiliar",
  COM: "Comercial salas e lojas",
  EGAR: "Edifício de garagens",
  GALP: "Galpão industrial",
  RPOP: "Casa popular",
  CHAB: "Conjunto habitacional popular",
};

const typeTipoObra = {
  ALV: "Alvenaria",
  MAD: "Madeira ou mista",
};

const typeAfericao = {
  TOTAL: "Obra total",
  PARCIAL_HABITESE: "Aferição parcial com habite-se",
  PARCIAL_DECLARADA: "Aferição parcial declarada",
  INACABADA: "Obra inacabada com laudo",
};

const ufNames = {
  AC: "Acre",
  AL: "Alagoas",
  AM: "Amazonas",
  AP: "Amapá",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MG: "Minas Gerais",
  MS: "Mato Grosso do Sul",
  MT: "Mato Grosso",
  PA: "Pará",
  PB: "Paraíba",
  PE: "Pernambuco",
  PI: "Piauí",
  PR: "Paraná",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RO: "Rondônia",
  RR: "Roraima",
  RS: "Rio Grande do Sul",
  SC: "Santa Catarina",
  SE: "Sergipe",
  SP: "São Paulo",
  TO: "Tocantins",
};

function toNumber(value) {
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
  return toNumber(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPercent(value) {
  return toNumber(value).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function fmtPercentInt(value) {
  return Math.round(toNumber(value)).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setPrintTitle(prefix, clientName) {
  const safeClientName = (clientName || "").trim().replace(/[\\/:*?"<>|]/g, " ");
  document.title = safeClientName ? `${prefix} - ${safeClientName}` : prefix;
}

function hasDecadence() {
  return toNumber(receitaResult?.decadencia?.decadentCount) > 0;
}

function setBar(id, value, max) {
  const el = document.getElementById(id);
  if (!el) return;
  const numericValue = toNumber(value);
  const numericMax = toNumber(max);
  const width = numericMax > 0 ? Math.max((numericValue / numericMax) * 100, 2) : 2;
  el.style.width = `${Math.min(width, 100)}%`;
}

function setDonut(id, percent) {
  const el = document.getElementById(id);
  if (!el) return;
  const value = Math.max(0, Math.min(toNumber(percent), 100));
  el.style.setProperty("--value", `${value}`);
}

function fmtDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "-";
}

function fmtDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR");
}

function getSimulationRecord() {
  let paralisacoes = [];
  try {
    paralisacoes = JSON.parse(localStorage.getItem("reducaoParalisacoes")) || [];
  } catch (error) {
    paralisacoes = [];
  }
  return {
    id: reducaoResult.historyId || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
    formData,
    receitaResult,
    reducaoResult,
    paralisacoes,
  };
}

function readHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(history) ? history : [];
  } catch (error) {
    return [];
  }
}

function saveHistory(record) {
  const history = readHistory().filter((item) => item.reducaoResult?.calculatedAt !== reducaoResult.calculatedAt);
  history.unshift(record);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
}

function buildWhatsappSummary(totals, totalComHonorarios) {
  const commercial = reducaoResult.commercial || {};
  const baselineLines = hasDecadence()
    ? [
      `INSS sem decadência: R$ ${fmt(totals.receita)}`,
      `INSS após decadência: R$ ${fmt(totals.receitaAposDecadencia)}`,
    ]
    : [`INSS estimado: R$ ${fmt(totals.receita)}`];
  return [
    `Resumo ReduzSim - ${formData.clienteNome || "cliente"}`,
    ...baselineLines,
    `INSS com redução: R$ ${fmt(totals.totalReducao)}`,
    `Economia bruta: R$ ${fmt(totals.economiaBruta)} (${fmtPercent(totals.percentualReducao)}%)`,
    `Honorários: R$ ${fmt(totals.honorarios)} (${totals.honorariosDescription || `${fmtPercent(totals.honorariosPercent)}% sobre economia obtida`})`,
    `Total com honorários: R$ ${fmt(totalComHonorarios)}`,
    `Economia líquida estimada: R$ ${fmt(totals.economiaLiquida)}`,
    commercial.validade ? `Validade da proposta: ${fmtDate(commercial.validade)}` : "",
    commercial.consultor ? `Consultor/atendente: ${commercial.consultor}` : "",
    "Observação: simulação prévia sujeita à aferição oficial no Sero/DCTFWeb Aferição de Obras.",
  ].filter(Boolean).join("\n");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function renderCommercialAndLegal(totals) {
  const commercial = reducaoResult.commercial || {};
  const honorariosDescription = totals.honorariosDescription || `${fmtPercent(totals.honorariosPercent)}% sobre a economia obtida`;

  const honorariosLabel = document.getElementById("honorarios-label");
  if (honorariosLabel) {
    honorariosLabel.textContent = totals.honorariosMode === "fixo" ? "fixos" : honorariosDescription;
  }

  if (commercial.validade) {
    setText("proposal-validity", `Validade da proposta: ${fmtDate(commercial.validade)}. Valores sujeitos à atualização de índices, dados da obra e documentação apresentada.`);
  }
  if (formData.responsavelObra === "PJ") {
    const current = document.getElementById("proposal-validity")?.textContent || "";
    setText("proposal-validity", `${current} Para pessoa jurídica, o fator social não se aplica; a meta comercial de comprovação considera 50%/70% da RMT.`);
  }
  if ((formData.tipoAfericao || "TOTAL") !== "TOTAL") {
    const current = document.getElementById("proposal-validity")?.textContent || "";
    setText("proposal-validity", `${current} Caso especial sujeito à conferência dos documentos e das aferições anteriores no Sero.`);
  }
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

  if (!formData || !reducaoResult) {
    window.location.href = "index.html";
    return;
  }
  receitaResult = receitaResult || {};

  const totals = reducaoResult.totals || {};
  const totalComHonorarios = toNumber(totals.totalReducao) + toNumber(totals.honorarios);
  const hasDecay = hasDecadence();

  setPrintTitle("Redução de INSS de obra", formData.clienteNome);
  setText("final-date", new Date(reducaoResult.calculatedAt || Date.now()).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }));
  setText("percentual-reducao", `${fmtPercentInt(totals.percentualReducao)}%`);
  setText("economia-bruta-percent", `${fmtPercentInt(totals.percentualReducao)}%`);
  setText("proposal-baseline-label", hasDecay ? "INSS sem decadência" : "INSS estimado");
  setText("economia-baseline-label", hasDecay ? "do INSS sem decadência" : "do INSS estimado");
  setText("sem-reducao", fmt(totals.receita));
  setText("com-reducao", fmt(totals.totalReducao));
  setText("economia-bruta", fmt(totals.economiaBruta));
  setText("honorarios", fmt(totals.honorarios));
  setText("economia-liquida", fmt(totals.economiaLiquida));
  setText("total-com-honorarios", fmt(totalComHonorarios));
  setText("cliente-nome", formData.clienteNome || "-");
  setText("cliente-telefone", formData.clienteTelefone || "-");
  setText("uf", ufNames[formData.UF] || formData.UF || "-");
  setText("area-total", fmt(formData.areaTotal));
  setText("responsavel-obra", typeResponsavel[formData.responsavelObra] || "-");
  const destinationsWithArea = formData.destinacoes?.filter((item) => [
    "areaConstrucao",
    "areaReforma",
    "areaDemolicao",
    "areaCoberta",
    "areaDescoberta",
  ].some((field) => toNumber(item[field]) > 0));
  const destinations = destinationsWithArea?.length
    ? destinationsWithArea
    : [{ destinacao: formData.destinacao, tipoObra: formData.tipoObra }];
  setText("destinacao", [...new Set(destinations.map((item) => typeDestinacao[item.destinacao]).filter(Boolean))].join(" · ") || "-");
  setText("tipo-obra", [...new Set(destinations.map((item) => typeTipoObra[item.tipoObra]).filter(Boolean))].join(" · ") || "-");
  const assessmentType = formData.tipoAfericao || "TOTAL";
  const assessmentTypeElement = document.getElementById("afericao-tipo");
  assessmentTypeElement.hidden = assessmentType === "TOTAL";
  assessmentTypeElement.textContent = typeAfericao[assessmentType] || "";
  setText("data-inicio-obra", fmtDate(receitaResult.dateInitial || formData.dataInicioObra));
  setText("data-fim-obra", fmtDate(receitaResult.dateFinal || formData.dataFimObra));
  renderCommercialAndLegal(totals);

  const chartMax = Math.max(
    toNumber(totals.receita),
    toNumber(totals.economiaBruta),
    toNumber(totals.totalReducao),
    toNumber(totals.honorarios),
    totalComHonorarios,
  );

  setDonut("economia-donut", totals.percentualReducao);
  setBar("bar-sem-reducao", totals.receita || 0, chartMax);
  setBar("bar-com-reducao", totals.totalReducao || 0, chartMax);
  setBar("bar-economia-bruta", totals.economiaBruta || 0, chartMax);
  setBar("bar-honorarios", totals.honorarios || 0, chartMax);
  setBar("bar-total-com-honorarios", totalComHonorarios, chartMax);

  const record = getSimulationRecord();
  saveHistory(record);
  document.getElementById("print-btn").addEventListener("click", () => window.print());
  document.getElementById("copy-whatsapp-btn").addEventListener("click", async (event) => {
    await copyText(buildWhatsappSummary(totals, totalComHonorarios));
    event.currentTarget.textContent = "Resumo copiado";
    window.setTimeout(() => {
      event.currentTarget.textContent = "Copiar resumo para WhatsApp";
    }, 1800);
  });
  document.getElementById("new-simulation-btn").addEventListener("click", () => {
    localStorage.removeItem("formData");
    localStorage.removeItem("receitaResult");
    localStorage.removeItem("reducaoResult");
    localStorage.removeItem("reducaoParalisacoes");
    window.location.href = "index.html";
  });
})();
