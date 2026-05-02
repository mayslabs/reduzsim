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

function fmt(value) {
  return (Number(value) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPercent(value) {
  return (Number(value) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setBar(id, value, max) {
  const el = document.getElementById(id);
  if (!el) return;
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 2;
  el.style.width = `${Math.min(width, 100)}%`;
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

  setText("final-date", new Date(reducaoResult.calculatedAt || Date.now()).toLocaleString("pt-BR"));
  setText("percentual-reducao", `${fmtPercent(totals.percentualReducao)}%`);
  setText("sem-reducao", fmt(totals.receita));
  setText("com-reducao", fmt(totals.totalReducao));
  setText("economia-bruta", fmt(totals.economiaBruta));
  setText("honorarios", fmt(totals.honorarios));
  setText("economia-liquida", fmt(totals.economiaLiquida));
  setText("honorarios-percent", fmtPercent(totals.honorariosPercent));
  setText("cliente-nome", formData.clienteNome || "-");
  setText("cliente-telefone", formData.clienteTelefone || "-");
  setText("uf", formData.UF || "-");
  setText("area-total", fmt(formData.areaTotal));
  setText("responsavel-obra", typeResponsavel[formData.responsavelObra] || "-");
  setText("destinacao", typeDestinacao[formData.destinacao] || "-");
  setText("tipo-obra", typeTipoObra[formData.tipoObra] || "-");
  setText("data-inicio-obra", fmtDate(formData.dataInicioObra));
  setText("data-fim-obra", fmtDate(formData.dataFimObra));

  setBar("bar-sem-reducao", totals.receita || 0, totals.receita || 0);
  setBar("bar-com-reducao", totals.totalReducao || 0, totals.receita || 0);

  document.getElementById("print-btn").addEventListener("click", () => window.print());
})();
