let formData = {};
let reducaoResult = {};

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
  const normalized = String(value || "").replace(/[^\d,.-]/g, "").trim();
  if (!normalized) return 0;
  const parsed = normalized.includes(",")
    ? Number(normalized.replace(/\./g, "").replace(",", "."))
    : Number(normalized);
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
  el.style.setProperty("--value", `${value}%`);
}

function fmtDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "-";
}

(() => {
  try {
    formData = JSON.parse(localStorage.getItem("formData"));
    reducaoResult = JSON.parse(localStorage.getItem("reducaoResult"));
  } catch (error) {
    formData = null;
    reducaoResult = null;
  }

  if (!formData || !reducaoResult) {
    window.location.href = "index.html";
    return;
  }

  const totals = reducaoResult.totals || {};
  const totalComHonorarios = toNumber(totals.totalReducao) + toNumber(totals.honorarios);

  setText("final-date", new Date(reducaoResult.calculatedAt || Date.now()).toLocaleString("pt-BR"));
  setText("percentual-reducao", `${fmtPercentInt(totals.percentualReducao)}%`);
  setText("sem-reducao", fmt(totals.receita));
  setText("com-reducao", fmt(totals.totalReducao));
  setText("economia-bruta", fmt(totals.economiaBruta));
  setText("honorarios", fmt(totals.honorarios));
  setText("economia-liquida", fmt(totals.economiaLiquida));
  setText("total-com-honorarios", fmt(totalComHonorarios));
  setText("honorarios-percent", fmtPercent(totals.honorariosPercent));
  setText("cliente-nome", formData.clienteNome || "-");
  setText("cliente-telefone", formData.clienteTelefone || "-");
  setText("uf", ufNames[formData.UF] || formData.UF || "-");
  setText("area-total", fmt(formData.areaTotal));
  setText("responsavel-obra", typeResponsavel[formData.responsavelObra] || "-");
  setText("destinacao", typeDestinacao[formData.destinacao] || "-");
  setText("tipo-obra", typeTipoObra[formData.tipoObra] || "-");
  setText("data-inicio-obra", fmtDate(formData.dataInicioObra));
  setText("data-fim-obra", fmtDate(formData.dataFimObra));

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

  document.getElementById("print-btn").addEventListener("click", () => window.print());
})();
