const typeResponsavel = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

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
  { data: "05/2026", UF: "AC", RPOP: 2086.46, COM: 3865.27, CHAB: 2086.46, EGAR: 3865.27, GALP: 1786.91, RMUL: 3490.36, RES: 4129.57 },
  { data: "05/2026", UF: "AL", RPOP: 1326.26, COM: 2400.63, CHAB: 1326.26, EGAR: 2400.63, GALP: 1121.31, RMUL: 2146.17, RES: 2490.35 },
  { data: "05/2026", UF: "AP", RPOP: 1851.74, COM: 3296.17, CHAB: 1851.74, EGAR: 3296.17, GALP: 1566.86, RMUL: 2903.45, RES: 3287.40 },
  { data: "05/2026", UF: "AM", RPOP: 2086.46, COM: 3865.27, CHAB: 2086.46, EGAR: 3865.27, GALP: 1786.91, RMUL: 3490.36, RES: 4129.57 },
  { data: "05/2026", UF: "BA", RPOP: 1448.29, COM: 2572.22, CHAB: 1448.29, EGAR: 2572.22, GALP: 1167.02, RMUL: 2245.86, RES: 2679.67 },
  { data: "05/2026", UF: "CE", RPOP: 1650.76, COM: 2769.59, CHAB: 1650.76, EGAR: 2769.59, GALP: 1312.04, RMUL: 2433.20, RES: 2801.99 },
  { data: "05/2026", UF: "DF", RPOP: 1546.41, COM: 2803.27, CHAB: 1546.41, EGAR: 2803.27, GALP: 1253.78, RMUL: 2449.56, RES: 2826.93 },
  { data: "05/2026", UF: "ES", RPOP: 1865.69, COM: 3140.88, CHAB: 1865.69, EGAR: 3140.88, GALP: 1423.27, RMUL: 2818.57, RES: 3312.94 },
  { data: "05/2026", UF: "GO", RPOP: 1477.94, COM: 2633.19, CHAB: 1477.94, EGAR: 2633.19, GALP: 1230.56, RMUL: 2312.98, RES: 2770.41 },
  { data: "05/2026", UF: "MA", RPOP: 1277.75, COM: 2233.21, CHAB: 1277.75, EGAR: 2233.21, GALP: 1065.62, RMUL: 2186.92, RES: 2286.30 },
  { data: "05/2026", UF: "MT", RPOP: 2163.37, COM: 3852.54, CHAB: 2163.37, EGAR: 3852.54, GALP: 1694.16, RMUL: 3390.30, RES: 3901.07 },
  { data: "05/2026", UF: "MS", RPOP: 1258.32, COM: 2283.21, CHAB: 1258.32, EGAR: 2283.21, GALP: 1029.23, RMUL: 1836.95, RES: 2193.11 },
  { data: "05/2026", UF: "MG", RPOP: 1680.14, COM: 2912.20, CHAB: 1680.14, EGAR: 2912.20, GALP: 1281.12, RMUL: 2593.71, RES: 2989.71 },
  { data: "05/2026", UF: "PA", RPOP: 1611.44, COM: 2793.12, CHAB: 1611.44, EGAR: 2793.12, GALP: 1320.85, RMUL: 2480.80, RES: 2839.89 },
  { data: "05/2026", UF: "PB", RPOP: 1105.26, COM: 2034.41, CHAB: 1105.26, EGAR: 2034.41, GALP: 935.03, RMUL: 1809.84, RES: 2042.34 },
  { data: "05/2026", UF: "PR", RPOP: 1778.84, COM: 3166.84, CHAB: 1778.84, EGAR: 3166.84, GALP: 1419.42, RMUL: 2769.46, RES: 3251.41 },
  { data: "05/2026", UF: "PE", RPOP: 1511.88, COM: 2586.33, CHAB: 1511.88, EGAR: 2586.33, GALP: 1183.59, RMUL: 2278.99, RES: 2725.06 },
  { data: "05/2026", UF: "PI", RPOP: 1277.75, COM: 2233.21, CHAB: 1277.75, EGAR: 2233.21, GALP: 1065.62, RMUL: 1971.74, RES: 2286.30 },
  { data: "05/2026", UF: "RJ", RPOP: 1685.83, COM: 2955.88, CHAB: 1685.83, EGAR: 2955.88, GALP: 1342.15, RMUL: 2598.80, RES: 3018.81 },
  { data: "05/2026", UF: "RN", RPOP: 1490.31, COM: 2465.68, CHAB: 1490.31, EGAR: 2465.68, GALP: 1185.36, RMUL: 2215.72, RES: 2580.83 },
  { data: "05/2026", UF: "RS", RPOP: 1805.49, COM: 3543.36, CHAB: 1805.49, EGAR: 3543.36, GALP: 1374.90, RMUL: 2987.99, RES: 3375.12 },
  { data: "05/2026", UF: "RO", RPOP: 1692.90, COM: 2964.04, CHAB: 1692.90, EGAR: 2964.04, GALP: 1321.58, RMUL: 2620.71, RES: 2880.01 },
  { data: "05/2026", UF: "RR", RPOP: 1862.65, COM: 3500.38, CHAB: 1862.65, EGAR: 3500.38, GALP: 1677.86, RMUL: 3072.41, RES: 3584.71 },
  { data: "05/2026", UF: "SC", RPOP: 1942.00, COM: 3320.29, CHAB: 1942.00, EGAR: 3320.29, GALP: 1535.94, RMUL: 2889.50, RES: 3405.28 },
  { data: "05/2026", UF: "SP", RPOP: 1476.87, COM: 2614.71, CHAB: 1476.87, EGAR: 2614.71, GALP: 1231.83, RMUL: 2296.89, RES: 2633.50 },
  { data: "05/2026", UF: "SE", RPOP: 1359.52, COM: 2516.85, CHAB: 1359.52, EGAR: 2516.85, GALP: 1157.20, RMUL: 2247.24, RES: 2480.88 },
  { data: "05/2026", UF: "TO", RPOP: 1477.94, COM: 2633.19, CHAB: 1477.94, EGAR: 2633.19, GALP: 1230.56, RMUL: 2312.98, RES: 2770.41 },
];

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

function calcCOD(data, VAU) {
  const destinacao = data.destinacao;

  let areaConstrucao = Number.parseFloat(data.areaConstrucao) || 0;
  let areaReforma = Number.parseFloat(data.areaReforma) || 0;
  let areaDemolicao = Number.parseFloat(data.areaDemolicao) || 0;
  let areaCoberta = Number.parseFloat(data.areaCoberta) || 0;
  let areaDescoberta = Number.parseFloat(data.areaDescoberta) || 0;

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

function buildAreaLabel() {
  const labels = [];

  if (formData.areaConstrucao > 0) labels.push(`Construção ${fmt(formData.areaConstrucao)} m²`);
  if (formData.areaReforma > 0) labels.push(`Reforma ${fmt(formData.areaReforma)} m²`);
  if (formData.areaDemolicao > 0) labels.push(`Demolição ${fmt(formData.areaDemolicao)} m²`);
  if (formData.areaCoberta > 0) labels.push(`Área comp. coberta ${fmt(formData.areaCoberta)} m²`);
  if (formData.areaDescoberta > 0) labels.push(`Área comp. descoberta ${fmt(formData.areaDescoberta)} m²`);

  return labels.join(" | ");
}

function renderRemuneracaoRows(rows) {
  const card = document.getElementById("remuneracao-card");
  const body = document.getElementById("remuneracao-rows");
  if (!card || !body) return;

  const validRows = rows.filter((row) => row.valor > 0 || row.competencia);
  card.hidden = validRows.length === 0;
  body.innerHTML = "";

  validRows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.competencia || "-"}</td>
      <td>${row.origem || "-"}</td>
      <td>R$ ${fmt(row.valor || 0)}</td>
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

function updateValues() {
  const totalAreaFatorSocial = formData.areaConstrucao + formData.areaCoberta + formData.areaDescoberta;
  const areaRef = formData.areaReforma;
  const areaDem = formData.areaDemolicao;

  const UF = formData.UF;
  const vauRow = VAU_DATA.find((row) => row.UF === UF);
  const concretoRow = CONCRETO_DATA.find((row) => row.UF === UF);

  if (!vauRow || !concretoRow || !vauRow[formData.destinacao]) {
    window.location.href = "index.html";
    return;
  }

  const VAU = vauRow[formData.destinacao];
  const COD = calcCOD(formData, VAU);
  const CODSum = COD.reduce((sum, current) => sum + current, 0);

  const rmtRows = [
    {
      label: "Construção / obra nova",
      area: formData.areaConstrucao,
      cod: COD[0],
      rmt: calcRMT(COD[0], formData.areaConstrucao, totalAreaFatorSocial, formData.responsavelObra, 1),
    },
    {
      label: "Reforma",
      area: formData.areaReforma,
      cod: COD[1],
      rmt: calcRMT(COD[1], formData.areaReforma, areaRef, formData.responsavelObra, 0.35),
    },
    {
      label: "Demolição",
      area: formData.areaDemolicao,
      cod: COD[2],
      rmt: calcRMT(COD[2], formData.areaDemolicao, areaDem, formData.responsavelObra, 0.1),
    },
    {
      label: "Área complementar coberta",
      area: formData.areaCoberta,
      cod: COD[3],
      rmt: calcRMT(COD[3], formData.areaCoberta, totalAreaFatorSocial, formData.responsavelObra, 1),
    },
    {
      label: "Área complementar descoberta",
      area: formData.areaDescoberta,
      cod: COD[4],
      rmt: calcRMT(COD[4], formData.areaDescoberta, totalAreaFatorSocial, formData.responsavelObra, 1),
    },
  ];

  const rmtBeforeConcreto = rmtRows.reduce((sum, row) => sum + row.rmt, 0);
  const percentConcreto = formData.isUsoConcreto ? concretoRow[formData.destinacao] : 0;
  const ajusteAreaReforma = formData.areaReforma > 0 ? 0.35 : 1;
  const concretoCredit = round(calcAjusteConcreto(CODSum, percentConcreto, ajusteAreaReforma));
  const RMT = round(Math.max(rmtBeforeConcreto - concretoCredit, 0));
  const total = calcTotal(RMT);
  const receitaResult = {
    calculatedAt: formData.calculatedAt,
    cod: CODSum,
    rmt: RMT,
    inssEstimado: total,
    areaTotal: formData.areaTotal,
    dateInitial: formData.dataInicioObra,
    dateFinal: formData.dataFimObra,
    vauPeriodo: vauRow.data,
  };
  localStorage.setItem("receitaResult", JSON.stringify(receitaResult));

  setText("date", vauRow.data);
  setText("date-hero", vauRow.data);
  setText("calc-date", fmtDate(formData.calculatedAt));
  setText("data-inicio-obra", fmtInputDate(formData.dataInicioObra));
  setText("data-fim-obra", fmtInputDate(formData.dataFimObra));
  setOptionalBlock("cliente-nome-block", "cliente-nome", formData.clienteNome);
  setOptionalBlock("cliente-telefone-block", "cliente-telefone", formData.clienteTelefone);
  setText("responsavel-obra", typeResponsavel[formData.responsavelObra]);
  setText("tipo-obra", typeTipoObra[formData.tipoObra]);
  setText("concreto-str", formData.isUsoConcreto ? "Sim" : "Não");
  setText("total-area-str", buildAreaLabel());
  setText("destinacao", typeDestinacao[formData.destinacao]);
  setText("UF", UF);
  setText("VAU", fmt(VAU));
  setText("COD", fmt(CODSum));
  setText("RMT", fmt(RMT));
  setText("parcela-60", fmt(total / 60));
  setText("total", fmt(total));
  setText("total-2", fmt(total));

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

  const printBtn = document.getElementById("print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());
  }
})();
