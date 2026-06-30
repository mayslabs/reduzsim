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

const VAU_DATA = [
  { data: "06/2026", UF: "AC", RPOP: 2101.27, COM: 3892.71, CHAB: 2101.27, EGAR: 3892.71, GALP: 1799.60, RMUL: 3515.14, RES: 4158.89 },
  { data: "06/2026", UF: "AL", RPOP: 1335.68, COM: 2417.67, CHAB: 1335.68, EGAR: 2417.67, GALP: 1129.27, RMUL: 2161.41, RES: 2508.03 },
  { data: "06/2026", UF: "AP", RPOP: 1864.89, COM: 3319.57, CHAB: 1864.89, EGAR: 3319.57, GALP: 1577.98, RMUL: 2924.06, RES: 3310.74 },
  { data: "06/2026", UF: "AM", RPOP: 2101.27, COM: 3892.71, CHAB: 2101.27, EGAR: 3892.71, GALP: 1799.60, RMUL: 3515.14, RES: 4158.89 },
  { data: "06/2026", UF: "BA", RPOP: 1458.57, COM: 2590.48, CHAB: 1458.57, EGAR: 2590.48, GALP: 1175.31, RMUL: 2261.81, RES: 2698.70 },
  { data: "06/2026", UF: "CE", RPOP: 1662.48, COM: 2789.25, CHAB: 1662.48, EGAR: 2789.25, GALP: 1321.36, RMUL: 2450.48, RES: 2821.88 },
  { data: "06/2026", UF: "DF", RPOP: 1557.39, COM: 2823.17, CHAB: 1557.39, EGAR: 2823.17, GALP: 1262.68, RMUL: 2466.95, RES: 2847.00 },
  { data: "06/2026", UF: "ES", RPOP: 1878.94, COM: 3163.18, CHAB: 1878.94, EGAR: 3163.18, GALP: 1433.38, RMUL: 2838.58, RES: 3336.46 },
  { data: "06/2026", UF: "GO", RPOP: 1488.43, COM: 2651.89, CHAB: 1488.43, EGAR: 2651.89, GALP: 1239.30, RMUL: 2329.40, RES: 2790.08 },
  { data: "06/2026", UF: "MA", RPOP: 1286.82, COM: 2249.07, CHAB: 1286.82, EGAR: 2249.07, GALP: 1073.19, RMUL: 2202.45, RES: 2302.53 },
  { data: "06/2026", UF: "MT", RPOP: 2178.73, COM: 3879.89, CHAB: 2178.73, EGAR: 3879.89, GALP: 1706.19, RMUL: 3414.37, RES: 3928.77 },
  { data: "06/2026", UF: "MS", RPOP: 1267.25, COM: 2299.42, CHAB: 1267.25, EGAR: 2299.42, GALP: 1036.54, RMUL: 1849.99, RES: 2208.68 },
  { data: "06/2026", UF: "MG", RPOP: 1692.07, COM: 2932.88, CHAB: 1692.07, EGAR: 2932.88, GALP: 1290.22, RMUL: 2612.13, RES: 3010.94 },
  { data: "06/2026", UF: "PA", RPOP: 1622.88, COM: 2812.95, CHAB: 1622.88, EGAR: 2812.95, GALP: 1330.23, RMUL: 2498.41, RES: 2860.05 },
  { data: "06/2026", UF: "PB", RPOP: 1113.11, COM: 2048.85, CHAB: 1113.11, EGAR: 2048.85, GALP: 941.67, RMUL: 1822.69, RES: 2056.84 },
  { data: "06/2026", UF: "PR", RPOP: 1791.47, COM: 3189.32, CHAB: 1791.47, EGAR: 3189.32, GALP: 1429.50, RMUL: 2789.12, RES: 3274.50 },
  { data: "06/2026", UF: "PE", RPOP: 1522.61, COM: 2604.69, CHAB: 1522.61, EGAR: 2604.69, GALP: 1191.99, RMUL: 2295.17, RES: 2744.41 },
  { data: "06/2026", UF: "PI", RPOP: 1286.82, COM: 2249.07, CHAB: 1286.82, EGAR: 2249.07, GALP: 1073.19, RMUL: 1985.74, RES: 2302.53 },
  { data: "06/2026", UF: "RJ", RPOP: 1697.80, COM: 2976.87, CHAB: 1697.80, EGAR: 2976.87, GALP: 1351.68, RMUL: 2617.25, RES: 3040.24 },
  { data: "06/2026", UF: "RN", RPOP: 1500.89, COM: 2483.19, CHAB: 1500.89, EGAR: 2483.19, GALP: 1193.78, RMUL: 2231.45, RES: 2599.15 },
  { data: "06/2026", UF: "RS", RPOP: 1818.31, COM: 3568.52, CHAB: 1818.31, EGAR: 3568.52, GALP: 1384.66, RMUL: 3009.20, RES: 3399.08 },
  { data: "06/2026", UF: "RO", RPOP: 1704.92, COM: 2985.08, CHAB: 1704.92, EGAR: 2985.08, GALP: 1330.96, RMUL: 2639.32, RES: 2900.46 },
  { data: "06/2026", UF: "RR", RPOP: 1875.87, COM: 3525.23, CHAB: 1875.87, EGAR: 3525.23, GALP: 1689.77, RMUL: 3094.22, RES: 3610.16 },
  { data: "06/2026", UF: "SC", RPOP: 1955.79, COM: 3343.86, CHAB: 1955.79, EGAR: 3343.86, GALP: 1546.85, RMUL: 2910.02, RES: 3429.46 },
  { data: "06/2026", UF: "SP", RPOP: 1487.36, COM: 2633.27, CHAB: 1487.36, EGAR: 2633.27, GALP: 1240.58, RMUL: 2313.20, RES: 2652.20 },
  { data: "06/2026", UF: "SE", RPOP: 1369.17, COM: 2534.72, CHAB: 1369.17, EGAR: 2534.72, GALP: 1165.42, RMUL: 2263.20, RES: 2498.49 },
  { data: "06/2026", UF: "TO", RPOP: 1488.43, COM: 2651.89, CHAB: 1488.43, EGAR: 2651.89, GALP: 1239.30, RMUL: 2329.40, RES: 2790.08 },
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
  normalized.areaTotal = calculoCore.roundMoney(normalized.destinacoes.reduce((sum, destination) => (
    sum + calculoCore.AREA_KEYS.reduce((areaSum, key) => areaSum + destination[key], 0)
  ), 0));
  return normalized;
}

function calcCOD(data, VAU) {
  const destinacao = data.destinacao;

  let areaConstrucao = parseLocaleNumber(data.areaConstrucao);
  let areaReforma = parseLocaleNumber(data.areaReforma);
  let areaDemolicao = parseLocaleNumber(data.areaDemolicao);
  let areaCoberta = parseLocaleNumber(data.areaCoberta);
  let areaDescoberta = parseLocaleNumber(data.areaDescoberta);

  switch (destinacao) {
    case "RES":
      areaConstrucao = areaConstrucao <= 1000 ? areaConstrucao * 0.89 : areaConstrucao * 0.85;
      areaReforma = areaReforma <= 1000 ? areaReforma * 0.89 : areaReforma * 0.85;
      areaDemolicao = areaDemolicao <= 1000 ? areaDemolicao * 0.89 : areaDemolicao * 0.85;
      break;
    case "RMUL":
      areaConstrucao = areaConstrucao <= 1000 ? areaConstrucao * 0.9 : areaConstrucao * 0.86;
      areaReforma = areaReforma <= 1000 ? areaReforma * 0.9 : areaReforma * 0.86;
      areaDemolicao = areaDemolicao <= 1000 ? areaDemolicao * 0.9 : areaDemolicao * 0.86;
      break;
    case "COM":
    case "EGAR":
      areaConstrucao = areaConstrucao <= 3000 ? areaConstrucao * 0.86 : areaConstrucao * 0.83;
      areaReforma = areaReforma <= 3000 ? areaReforma * 0.86 : areaReforma * 0.83;
      areaDemolicao = areaDemolicao <= 3000 ? areaDemolicao * 0.86 : areaDemolicao * 0.83;
      break;
    case "GALP":
      areaConstrucao *= 0.95;
      areaReforma *= 0.95;
      areaDemolicao *= 0.95;
      break;
    case "RPOP":
    case "CHAB":
      areaConstrucao *= 0.98;
      areaReforma *= 0.98;
      areaDemolicao *= 0.98;
      break;
  }

  areaCoberta *= 0.5;
  areaDescoberta *= 0.25;

  return [
    round(areaConstrucao * VAU),
    round(areaReforma * VAU),
    round(areaDemolicao * VAU),
    round(areaCoberta * VAU),
    round(areaDescoberta * VAU),
  ];
}

function getFatorSocial(area, responsavelObra) {
  if (responsavelObra !== "PF") return 1;
  if (area <= 100) return 0.2;
  if (area <= 200) return 0.4;
  if (area <= 300) return 0.55;
  if (area <= 400) return 0.7;
  return 0.9;
}

function getMaoDeObraPercentual() {
  if (formData.destinacao === "RPOP" || formData.destinacao === "CHAB") {
    return formData.tipoObra === "ALV" ? 0.12 : 0.07;
  }

  return formData.tipoObra === "ALV" ? 0.20 : 0.15;
}

function calcRMT(COD, area, totalArea, tipoResponsavel, fatorAjuste) {
  if (area === 0) return 0;
  return round(COD * getFatorSocial(totalArea, tipoResponsavel) * fatorAjuste * getMaoDeObraPercentual());
}

function calcAjusteConcreto(COD, percentConcreto, ajusteAreaReforma) {
  return COD * percentConcreto * 0.05 * ajusteAreaReforma;
}

function calcTotal(RMT) {
  return round(RMT * 0.368);
}

function round(value) {
  return Math.round(value * 100) / 100;
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
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.destinationLabel || "-"}</td>
      <td>${row.label || "-"}</td>
      <td>${fmt(row.area || 0)} m²</td>
      <td>R$ ${fmt(row.cod || 0)}</td>
      <td>R$ ${fmt(row.rmt || 0)}</td>
      <td>R$ ${fmt(row.concreteCredit || 0)}</td>
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
  renderRemuneracaoRows(calculation.lines);

  const receitaResult = {
    calculatedAt: formData.calculatedAt,
    calculationVersion: 2,
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
    dateInitial: formData.dataInicioObra,
    dateFinal: formData.dataFimObra,
    assessmentDate: formData.dataAfericao,
    decadencia: calculation.decay,
    destinations: calculation.destinations,
    rmtRows: calculation.lines,
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
  setText("data-inicio-obra", fmtInputDate(formData.dataInicioObra));
  setText("data-fim-obra", fmtInputDate(formData.dataFimObra));
  setText("data-afericao", fmtInputDate(formData.dataAfericao));
  setOptionalBlock("cliente-nome-block", "cliente-nome", formData.clienteNome);
  setOptionalBlock("cliente-telefone-block", "cliente-telefone", formData.clienteTelefone);
  setText("responsavel-obra", typeResponsavel[formData.responsavelObra]);
  setText("concreto-str", formData.isUsoConcreto ? "Sim" : "Não");
  setText("total-area-str", buildAreaLabel());
  setText("UF", UF);
  setText("VAU", formData.destinacoes.filter((destination) => (
    getDestinationAreaTotal(destination) > 0
  )).map((destination) => (
    `${typeDestinacao[destination.destinacao]}: R$ ${fmt(vauRow[destination.destinacao])}`
  )).join(" | "));
  setText("COD", fmt(calculation.codTotal));
  setText("RMT", fmt(calculation.rmtIntegral));
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
