const typeResponsavel = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

const calculoCore = window.ReduzSimCalculo;

const typeDestinacao = {
  RES: "Residencial unifamiliar",
  RMUL: "Residencial multifamiliar",
  COM: "Comercial salas e lojas",
  GALP: "Galpão industrial",
  RPOP: "Casa popular",
  CHAB: "Conjunto habitacional popular",
  EGAR: "Edifício de garagens",
};

const typeTipoObra = {
  ALV: "Alvenaria",
  MAD: "Madeira ou mista",
};

const typeAfericao = {
  TOTAL: "Obra total",
  PARCIAL_HABITESE: "Parte com habite-se parcial",
  PARCIAL_DECLARADA: "Parte declarada sem habite-se",
  INACABADA: "Obra inacabada com laudo",
};

const VAU_DATA = [
  { data: "07/2026", UF: "AC", RPOP: 2108.41, COM: 3905.95, CHAB: 2108.41, EGAR: 3905.95, GALP: 1805.72, RMUL: 3527.09, RES: 4173.03 },
  { data: "07/2026", UF: "AL", RPOP: 1340.22, COM: 2425.89, CHAB: 1340.22, EGAR: 2425.89, GALP: 1133.11, RMUL: 2168.76, RES: 2516.56 },
  { data: "07/2026", UF: "AP", RPOP: 1871.23, COM: 3330.86, CHAB: 1871.23, EGAR: 3330.86, GALP: 1583.35, RMUL: 2934.00, RES: 3322.00 },
  { data: "07/2026", UF: "AM", RPOP: 2108.41, COM: 3905.95, CHAB: 2108.41, EGAR: 3905.95, GALP: 1805.72, RMUL: 3527.09, RES: 4173.03 },
  { data: "07/2026", UF: "BA", RPOP: 1463.53, COM: 2599.29, CHAB: 1463.53, EGAR: 2599.29, GALP: 1179.31, RMUL: 2269.50, RES: 2707.88 },
  { data: "07/2026", UF: "CE", RPOP: 1668.13, COM: 2798.73, CHAB: 1668.13, EGAR: 2798.73, GALP: 1325.85, RMUL: 2458.81, RES: 2831.47 },
  { data: "07/2026", UF: "DF", RPOP: 1562.69, COM: 2832.77, CHAB: 1562.69, EGAR: 2832.77, GALP: 1266.97, RMUL: 2475.34, RES: 2856.68 },
  { data: "07/2026", UF: "ES", RPOP: 1885.33, COM: 3173.93, CHAB: 1885.33, EGAR: 3173.93, GALP: 1438.25, RMUL: 2848.23, RES: 3347.80 },
  { data: "07/2026", UF: "GO", RPOP: 1493.49, COM: 2660.91, CHAB: 1493.49, EGAR: 2660.91, GALP: 1243.51, RMUL: 2337.32, RES: 2799.57 },
  { data: "07/2026", UF: "MA", RPOP: 1291.20, COM: 2256.72, CHAB: 1291.20, EGAR: 2256.72, GALP: 1076.84, RMUL: 2209.94, RES: 2310.36 },
  { data: "07/2026", UF: "MT", RPOP: 2186.14, COM: 3893.08, CHAB: 2186.14, EGAR: 3893.08, GALP: 1711.99, RMUL: 3425.98, RES: 3942.13 },
  { data: "07/2026", UF: "MS", RPOP: 1271.56, COM: 2307.24, CHAB: 1271.56, EGAR: 2307.24, GALP: 1040.06, RMUL: 1856.28, RES: 2216.19 },
  { data: "07/2026", UF: "MG", RPOP: 1697.82, COM: 2942.85, CHAB: 1697.82, EGAR: 2942.85, GALP: 1294.61, RMUL: 2621.01, RES: 3021.18 },
  { data: "07/2026", UF: "PA", RPOP: 1628.40, COM: 2822.51, CHAB: 1628.40, EGAR: 2822.51, GALP: 1334.75, RMUL: 2506.90, RES: 2869.77 },
  { data: "07/2026", UF: "PB", RPOP: 1116.89, COM: 2055.82, CHAB: 1116.89, EGAR: 2055.82, GALP: 944.87, RMUL: 1828.89, RES: 2063.83 },
  { data: "07/2026", UF: "PR", RPOP: 1797.56, COM: 3200.16, CHAB: 1797.56, EGAR: 3200.16, GALP: 1434.36, RMUL: 2798.60, RES: 3285.63 },
  { data: "07/2026", UF: "PE", RPOP: 1527.79, COM: 2613.55, CHAB: 1527.79, EGAR: 2613.55, GALP: 1196.04, RMUL: 2302.97, RES: 2753.74 },
  { data: "07/2026", UF: "PI", RPOP: 1291.20, COM: 2256.72, CHAB: 1291.20, EGAR: 2256.72, GALP: 1076.84, RMUL: 1992.49, RES: 2310.36 },
  { data: "07/2026", UF: "RJ", RPOP: 1703.57, COM: 2986.99, CHAB: 1703.57, EGAR: 2986.99, GALP: 1356.28, RMUL: 2626.15, RES: 3050.58 },
  { data: "07/2026", UF: "RN", RPOP: 1505.99, COM: 2491.63, CHAB: 1505.99, EGAR: 2491.63, GALP: 1197.84, RMUL: 2239.04, RES: 2607.99 },
  { data: "07/2026", UF: "RS", RPOP: 1824.49, COM: 3580.65, CHAB: 1824.49, EGAR: 3580.65, GALP: 1389.37, RMUL: 3019.43, RES: 3410.64 },
  { data: "07/2026", UF: "RO", RPOP: 1710.72, COM: 2995.23, CHAB: 1710.72, EGAR: 2995.23, GALP: 1335.49, RMUL: 2648.29, RES: 2910.32 },
  { data: "07/2026", UF: "RR", RPOP: 1882.25, COM: 3537.22, CHAB: 1882.25, EGAR: 3537.22, GALP: 1695.52, RMUL: 3104.74, RES: 3622.43 },
  { data: "07/2026", UF: "SC", RPOP: 1962.44, COM: 3355.23, CHAB: 1962.44, EGAR: 3355.23, GALP: 1552.11, RMUL: 2919.91, RES: 3441.12 },
  { data: "07/2026", UF: "SP", RPOP: 1492.42, COM: 2642.22, CHAB: 1492.42, EGAR: 2642.22, GALP: 1244.80, RMUL: 2321.06, RES: 2661.22 },
  { data: "07/2026", UF: "SE", RPOP: 1373.83, COM: 2543.34, CHAB: 1373.83, EGAR: 2543.34, GALP: 1169.38, RMUL: 2270.89, RES: 2506.98 },
  { data: "07/2026", UF: "TO", RPOP: 1493.49, COM: 2660.91, CHAB: 1493.49, EGAR: 2660.91, GALP: 1243.51, RMUL: 2337.32, RES: 2799.57 },
];
const VAU_BASE_DATA = VAU_DATA.map((row) => ({ ...row }));

const CONCRETO_DATA = [
  { UF: "AC", RES: 0.0743, RMUL: 0.0961, COM: 0.1333, EGAR: 0.1333, GALP: 0.0452, RPOP: 0.0469, CHAB: 0.0469 },
  { UF: "AL", RES: 0.0611, RMUL: 0.0812, COM: 0.1135, EGAR: 0.1135, GALP: 0.0382, RPOP: 0.0398, CHAB: 0.0398 },
  { UF: "AM", RES: 0.0743, RMUL: 0.0961, COM: 0.1333, EGAR: 0.1333, GALP: 0.0452, RPOP: 0.0469, CHAB: 0.0469 },
  { UF: "AP", RES: 0.0748, RMUL: 0.0941, COM: 0.1293, EGAR: 0.1293, GALP: 0.0438, RPOP: 0.0488, CHAB: 0.0488 },
  { UF: "BA", RES: 0.0553, RMUL: 0.0746, COM: 0.1031, EGAR: 0.1031, GALP: 0.0362, RPOP: 0.0373, CHAB: 0.0373 },
  { UF: "CE", RES: 0.0572, RMUL: 0.0769, COM: 0.1069, EGAR: 0.1069, GALP: 0.0344, RPOP: 0.0370, CHAB: 0.0370 },
  { UF: "DF", RES: 0.0524, RMUL: 0.0706, COM: 0.0962, EGAR: 0.0962, GALP: 0.0343, RPOP: 0.0353, CHAB: 0.0353 },
  { UF: "ES", RES: 0.0515, RMUL: 0.0685, COM: 0.0945, EGAR: 0.0945, GALP: 0.0326, RPOP: 0.0333, CHAB: 0.0333 },
  { UF: "GO", RES: 0.0578, RMUL: 0.0762, COM: 0.1027, EGAR: 0.1027, GALP: 0.0360, RPOP: 0.0388, CHAB: 0.0388 },
  { UF: "MA", RES: 0.0694, RMUL: 0.0873, COM: 0.1206, EGAR: 0.1206, GALP: 0.0407, RPOP: 0.0418, CHAB: 0.0418 },
  { UF: "MG", RES: 0.0468, RMUL: 0.0622, COM: 0.0866, EGAR: 0.0866, GALP: 0.0305, RPOP: 0.0315, CHAB: 0.0315 },
  { UF: "MS", RES: 0.0674, RMUL: 0.0874, COM: 0.1220, EGAR: 0.1220, GALP: 0.0428, RPOP: 0.0434, CHAB: 0.0434 },
  { UF: "MT", RES: 0.0622, RMUL: 0.0801, COM: 0.1096, EGAR: 0.1096, GALP: 0.0389, RPOP: 0.0402, CHAB: 0.0402 },
  { UF: "PA", RES: 0.0758, RMUL: 0.0977, COM: 0.1348, EGAR: 0.1348, GALP: 0.0445, RPOP: 0.0491, CHAB: 0.0491 },
  { UF: "PB", RES: 0.0632, RMUL: 0.0858, COM: 0.1181, EGAR: 0.1181, GALP: 0.0381, RPOP: 0.0412, CHAB: 0.0412 },
  { UF: "PE", RES: 0.0512, RMUL: 0.0689, COM: 0.0974, EGAR: 0.0974, GALP: 0.0342, RPOP: 0.0351, CHAB: 0.0351 },
  { UF: "PI", RES: 0.0533, RMUL: 0.0716, COM: 0.1000, EGAR: 0.1000, GALP: 0.0330, RPOP: 0.0353, CHAB: 0.0353 },
  { UF: "PR", RES: 0.0491, RMUL: 0.0650, COM: 0.0878, EGAR: 0.0878, GALP: 0.0308, RPOP: 0.0318, CHAB: 0.0318 },
  { UF: "RJ", RES: 0.0494, RMUL: 0.0652, COM: 0.0902, EGAR: 0.0902, GALP: 0.0308, RPOP: 0.0320, CHAB: 0.0320 },
  { UF: "RN", RES: 0.0596, RMUL: 0.0762, COM: 0.1041, EGAR: 0.1041, GALP: 0.0363, RPOP: 0.0401, CHAB: 0.0401 },
  { UF: "RO", RES: 0.0622, RMUL: 0.0801, COM: 0.1096, EGAR: 0.1096, GALP: 0.0389, RPOP: 0.0402, CHAB: 0.0402 },
  { UF: "RR", RES: 0.0743, RMUL: 0.0961, COM: 0.1333, EGAR: 0.1333, GALP: 0.0452, RPOP: 0.0469, CHAB: 0.0469 },
  { UF: "RS", RES: 0.0501, RMUL: 0.0654, COM: 0.0877, EGAR: 0.0877, GALP: 0.0323, RPOP: 0.0325, CHAB: 0.0325 },
  { UF: "SC", RES: 0.0479, RMUL: 0.0619, COM: 0.0836, EGAR: 0.0836, GALP: 0.0287, RPOP: 0.0293, CHAB: 0.0293 },
  { UF: "SE", RES: 0.0697, RMUL: 0.0905, COM: 0.1250, EGAR: 0.1250, GALP: 0.0418, RPOP: 0.0434, CHAB: 0.0434 },
  { UF: "SP", RES: 0.0490, RMUL: 0.0635, COM: 0.0869, EGAR: 0.0869, GALP: 0.0296, RPOP: 0.0315, CHAB: 0.0315 },
  { UF: "TO", RES: 0.0533, RMUL: 0.0716, COM: 0.1000, EGAR: 0.1000, GALP: 0.0330, RPOP: 0.0353, CHAB: 0.0353 },
];

let formData = {};

function normalizeFormData(data) {
  const normalized = { ...data };
  const legacyDestination = {
    id: "dest-1",
    destinacao: normalized.destinacao || "RES",
    tipoObra: normalized.tipoObra || "ALV",
    areaConstrucao: normalized.areaConstrucao,
    areaReforma: normalized.areaReforma,
    areaDemolicao: normalized.areaDemolicao,
    areaCoberta: normalized.areaCoberta,
    areaDescoberta: normalized.areaDescoberta,
  };
  normalized.destinacoes = calculoCore.normalizeDestinations(
    normalized.destinacoes?.length ? normalized.destinacoes : [legacyDestination],
  );
  normalized.dataAfericao = normalized.dataAfericao || calculoCore.formatLocalISO();
  normalized.tipoAfericao = normalized.tipoAfericao || "TOTAL";
  normalized.areaTotal = calculoCore.roundMoney(normalized.destinacoes.reduce((sum, destination) => (
    sum + calculoCore.AREA_KEYS.reduce((areaSum, key) => areaSum + destination[key], 0)
  ), 0));
  return normalized;
}

function fmt(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR");
}

function setIndexStatus(meta) {
  const element = document.getElementById("indices-status");
  if (!element || !meta) return;
  const updatedAt = fmtDateTime(meta.updatedAt);
  const updatedText = updatedAt ? `Índice atualizado em ${updatedAt}.` : "Usando último índice válido disponível.";
  element.innerHTML = `
    <strong>VAU ${meta.period || VAU_BASE_DATA[0]?.data || ""}</strong><br>
    ${updatedText}<br>
    Fonte utilizada: ${meta.source || "Tabela local do sistema"}.
  `;
}

async function getVauMeta(forceRefresh = false) {
  if (!window.ReduzSimIndices) {
    return { rows: VAU_BASE_DATA, period: VAU_BASE_DATA[0]?.data, source: "Tabela local do sistema", updatedAt: "" };
  }

  if (forceRefresh) await window.ReduzSimIndices.refreshAll(VAU_BASE_DATA);
  return window.ReduzSimIndices.getVauData(VAU_BASE_DATA);
}

function fmtPercent(value) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function fmtDate(value) {
  const date = value ? new Date(value) : new Date();

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtInputDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function getDestinationAreaTotal(destination) {
  return [
    "areaConstrucao",
    "areaReforma",
    "areaDemolicao",
    "areaCoberta",
    "areaDescoberta",
  ].reduce((total, field) => total + calculoCore.toNumber(destination[field]), 0);
}

function buildAreaLabel() {
  return formData.destinacoes.filter((destination) => getDestinationAreaTotal(destination) > 0).map((destination) => {
    const areas = [];
    if (destination.areaConstrucao > 0) areas.push(`obra nova ${fmt(destination.areaConstrucao)} m²`);
    if (destination.areaReforma > 0) areas.push(`reforma ${fmt(destination.areaReforma)} m²`);
    if (destination.areaDemolicao > 0) areas.push(`demolição ${fmt(destination.areaDemolicao)} m²`);
    if (destination.areaCoberta > 0) areas.push(`complementar coberta ${fmt(destination.areaCoberta)} m²`);
    if (destination.areaDescoberta > 0) areas.push(`complementar descoberta ${fmt(destination.areaDescoberta)} m²`);
    return `${typeDestinacao[destination.destinacao]}: ${areas.join(", ")}`;
  }).join(" | ");
}

function renderRemuneracaoRows(rows) {
  const card = document.getElementById("remuneracao-card");
  const body = document.getElementById("remuneracao-rows");
  if (!card || !body) return;

  const validRows = rows.filter((row) => row.area > 0 || row.cod > 0 || row.rmt > 0);
  card.hidden = validRows.length === 0;
  body.innerHTML = "";

  validRows.forEach((row) => {
    const concretePercent = calculoCore.toNumber(row.concreteCategoryPercent);
    const precastText = {
      REDUCAO_70: "Pré-moldado: RMT reduzida em 70%",
      CALCULO_MISTO: "Pré-moldado abaixo de 40% do COD: cálculo como tipo misto",
    }[row.precastStatus] || "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.destinationLabel || "-"}</td>
      <td>${row.label || "-"}</td>
      <td>${fmt(row.area || 0)} m²</td>
      <td>R$ ${fmt(row.cod || 0)}</td>
      <td>
        R$ ${fmt(row.rmt || 0)}
        ${precastText ? `<small class="rs-table-detail">${precastText}</small>` : ""}
      </td>
      <td>
        R$ ${fmt(row.concreteCredit || 0)}
        <small class="rs-table-detail">${fmt(concretePercent)}% da categoria</small>
      </td>
    `;
    body.appendChild(tr);
  });
}

function setOptionalBlock(blockId, valueId, value) {
  const block = document.getElementById(blockId);
  const safeValue = value && value.trim();

  if (block) block.hidden = !safeValue;
  setText(valueId, safeValue || "-");
}

function buildConcreteSummary(calculation) {
  if (!formData.isUsoConcreto) return "Não";
  const categoryLabels = {
    construcao: "obra nova/complementares 100%",
    reforma: "reforma 35%",
    demolicao: "demolição 0%",
  };
  const categories = [...new Set(
    calculation.lines
      .filter((line) => line.area > 0)
      .map((line) => categoryLabels[line.key])
      .filter(Boolean),
  )];
  return `Sim - ${categories.join("; ")}`;
}

function buildSpecialSummary() {
  const details = [];
  if (formData.mudancaResponsabilidade) details.push("mudança de responsável");
  if (formData.tipoAfericao === "INACABADA" && formData.laudo) {
    details.push(`${formData.laudo.conselho || "Conselho"} ${formData.laudo.registro || "-"}`);
    details.push(`ART/RRT ${formData.laudo.artRrt || "-"}`);
  }
  return details.join("; ");
}

async function updateValues(forceRefresh = false) {
  formData = normalizeFormData(formData);
  const UF = formData.UF;
  const vauMeta = await getVauMeta(forceRefresh);
  const vauRows = vauMeta.rows?.length ? vauMeta.rows : VAU_BASE_DATA;
  const vauRow = vauRows.find((row) => row.UF === UF);
  const concretoRow = CONCRETO_DATA.find((row) => row.UF === UF);

  const hasAllIndices = formData.destinacoes.every((destination) => (
    vauRow?.[destination.destinacao] && concretoRow?.[destination.destinacao] !== undefined
  ));
  if (!vauRow || !concretoRow || !hasAllIndices) {
    window.location.href = "index.html";
    return;
  }

  const calculation = calculoCore.calculateConstruction(formData, vauRows, CONCRETO_DATA);
  const hasDecay = calculation.decay.decadentCount > 0;
  renderRemuneracaoRows(calculation.lines);

  const receitaResult = {
    calculatedAt: formData.calculatedAt,
    calculationVersion: 4,
    cod: calculation.codTotal,
    rmt: calculation.rmtIntegral,
    rmtIntegral: calculation.rmtIntegral,
    rmtNaoDecadente: calculation.rmtNonDecadent,
    creditoConcretoIntegral: calculation.concreteCreditIntegral,
    creditoConcretoNaoDecadente: calculation.concreteCreditNonDecadent,
    rmtTributavel: calculation.taxableRmt,
    metaFatorAjuste: calculation.adjustmentTarget,
    metaPercentual: calculation.adjustmentRate * 100,
    inssEstimado: calculation.estimatedContribution,
    inssSemDecadencia: calculation.estimatedContributionWithoutDecay,
    economiaDecadencia: calculation.decaySavings,
    areaTotal: calculation.areaTotal,
    projectAreaTotal: calculation.projectAreaTotal,
    dateInitial: calculation.assessmentStartDate,
    dateFinal: formData.dataFimObra,
    assessmentDate: formData.dataAfericao,
    decadencia: calculation.decay,
    destinations: calculation.destinations,
    rmtRows: calculation.lines,
    tipoAfericao: formData.tipoAfericao || "TOTAL",
    specialCase: {
      mudancaResponsabilidade: Boolean(formData.mudancaResponsabilidade),
      dataTransferencia: formData.dataTransferencia || "",
      dataFimAfericaoAnterior: formData.dataFimAfericaoAnterior || "",
      laudo: formData.laudo || null,
    },
    precastSummaries: calculation.precastSummaries,
    vauPeriodo: vauRow.data,
    indices: {
      vau: {
        period: vauMeta.period || vauRow.data,
        source: vauMeta.source || "Tabela local do sistema",
        updatedAt: vauMeta.updatedAt || "",
      },
    },
  };
  localStorage.setItem("receitaResult", JSON.stringify(receitaResult));
  setIndexStatus(receitaResult.indices.vau);

  setText("date", vauRow.data);
  setText("date-hero", vauRow.data);
  setText("calc-date", fmtDate(formData.calculatedAt));
  setText("data-inicio-obra", fmtInputDate(calculation.assessmentStartDate));
  setText("data-fim-obra", fmtInputDate(formData.dataFimObra));
  setText("data-afericao", fmtInputDate(formData.dataAfericao));
  setOptionalBlock("cliente-nome-block", "cliente-nome", formData.clienteNome);
  setOptionalBlock("cliente-telefone-block", "cliente-telefone", formData.clienteTelefone);
  setText("responsavel-obra", typeResponsavel[formData.responsavelObra]);
  setText("concreto-str", buildConcreteSummary(calculation));
  setText("total-area-str", buildAreaLabel());
  setText("tipo-afericao-str", typeAfericao[formData.tipoAfericao || "TOTAL"]);
  const isSpecial = (formData.tipoAfericao || "TOTAL") !== "TOTAL";
  document.getElementById("area-projeto-block").hidden = !isSpecial;
  setText("area-projeto", fmt(calculation.projectAreaTotal));
  const specialSummary = buildSpecialSummary();
  document.getElementById("special-summary-block").hidden = !specialSummary;
  setText("special-summary", specialSummary || "-");
  setText("UF", UF);
  setText("VAU", formData.destinacoes.filter((destination) => (
    getDestinationAreaTotal(destination) > 0
  )).map((destination) => (
    `${typeDestinacao[destination.destinacao]}: R$ ${fmt(vauRow[destination.destinacao])}`
  )).join(" | "));
  setText("COD", fmt(calculation.codTotal));
  setText("RMT", fmt(calculation.rmtIntegral));
  setText("result-total-label", hasDecay ? "INSS estimado após decadência" : "INSS estimado");
  document.getElementById("total-sem-decadencia-block").hidden = !hasDecay;
  document.getElementById("rmt-nao-decadente-card").hidden = !hasDecay;
  document.getElementById("decay-summary").hidden = !hasDecay;
  document.querySelector(".rs-summary-grid").classList.toggle("rs-summary-grid--three", !hasDecay);
  setText("RMT-NAO-DECADENTE", fmt(calculation.rmtNonDecadent));
  setText("RMT-TRIBUTAVEL", fmt(calculation.taxableRmt));
  setText("concrete-credit", fmt(calculation.concreteCreditNonDecadent));
  setText("decay-savings", fmt(calculation.decaySavings));
  setText("decay-total-months", calculation.decay.totalMonths.toLocaleString("pt-BR"));
  setText("decay-months", calculation.decay.decadentCount.toLocaleString("pt-BR"));
  setText("non-decay-months", calculation.decay.nonDecadentCount.toLocaleString("pt-BR"));
  setText("non-decay-percent", fmtPercent(calculation.decay.nonDecadentPercent));
  setText("parcela-60", fmt(calculation.estimatedContribution / 60));
  setText("total", fmt(calculation.estimatedContribution));
  setText("total-2", fmt(calculation.estimatedContribution));
  setText("total-sem-decadencia", fmt(calculation.estimatedContributionWithoutDecay));
  const precastApplied = calculation.precastSummaries.filter((item) => item.invoiceValue > 0);
  const precastMeta = precastApplied.length
    ? ` Pré-moldados: ${precastApplied.map((item) => `${item.destinationLabel} ${fmt(item.ratio)}% do COD`).join("; ")}.`
    : "";
  const responsibleMeta = formData.responsavelObra === "PF"
    ? " Fator social aplicado por categoria (pessoa física)."
    : " Fator social não aplicado (pessoa jurídica).";
  setText(
    "calculation-meta",
    `VAU ${receitaResult.indices.vau.period || "-"}, cálculo v4, aferição em ${fmtInputDate(formData.dataAfericao)}.${responsibleMeta}${precastMeta}`,
  );

}

(() => {
  "use strict";

  try {
    formData = JSON.parse(localStorage.getItem("formData"));
  } catch (error) {
    formData = null;
  }

  if (!formData) {
    window.location.href = "index.html";
    return;
  }

  updateValues();
  document.getElementById("refresh-indices-btn")?.addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    event.currentTarget.textContent = "Atualizando...";
    try {
      await updateValues(true);
    } finally {
      event.currentTarget.disabled = false;
      event.currentTarget.textContent = "Atualizar índices";
    }
  });
  window.ReduzSimIndices?.scheduleAutoUpdates(VAU_BASE_DATA, () => updateValues());

})();
