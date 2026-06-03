(function () {
  const moneyFormatter = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
    return moneyFormatter.format(toNumber(value));
  }

  function round(value) {
    return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setWidth(id, value) {
    const element = document.getElementById(id);
    if (element) element.style.width = `${Math.max(0, Math.min(100, value || 0))}%`;
  }

  function parseMoney(value) {
    return toNumber(value);
  }

  function initIndexPage() {
    const form = document.getElementById("simForm");
    if (!form) return;

    try {
      window.parseArea = function (input) {
        return Number(String(input || "").replace(",", ".")) || 0;
      };
    } catch (error) {
      console.warn("Nao foi possivel ajustar parseArea.", error);
    }

    const inicio = document.getElementById("dataInicio");
    const fim = document.getElementById("dataFim");

    function validateDates() {
      if (!inicio || !fim) return true;
      fim.setCustomValidity("");
      if (inicio.value && fim.value && new Date(fim.value) < new Date(inicio.value)) {
        fim.setCustomValidity("A data final não pode ser anterior à data inicial.");
        return false;
      }
      return true;
    }

    inicio?.addEventListener("change", validateDates);
    fim?.addEventListener("change", validateDates);
    form.addEventListener("submit", (event) => {
      if (!validateDates()) {
        event.preventDefault();
        fim?.reportValidity();
      }
    }, true);
  }

  function describeIndexSource(vauMeta) {
    const status = document.getElementById("indices-status");
    if (!status || !vauMeta) return;
    const schedule = window.ReduzSimIndices?.AUTO_UPDATE_HOURS?.join("h, ");
    const source = String(vauMeta.source || "").toLowerCase();
    const prefix = source.includes("sinapi") || source.includes("projetado") ? "VAU atualizado" : "VAU local";
    status.textContent = `${prefix}: ${vauMeta.period || "período local"}. Tentativas automáticas a partir de 8h${schedule ? ` (${schedule}h)` : ""}.`;
  }

  function initResultPage() {
    if (!document.getElementById("indices-status") || typeof VAU_DATA === "undefined") return;

    async function refreshVauAndRecalculate() {
      if (!window.ReduzSimIndices) {
        describeIndexSource({ period: VAU_DATA[0]?.data, source: "Tabela local" });
        if (typeof updateValues === "function") updateValues();
        return;
      }

      try {
        const vauMeta = await window.ReduzSimIndices.getVauData(VAU_DATA);
        if (Array.isArray(vauMeta.rows) && vauMeta.rows.length) {
          VAU_DATA.splice(0, VAU_DATA.length, ...vauMeta.rows);
        }
        describeIndexSource(vauMeta);
      } catch (error) {
        console.warn("Falha ao atualizar VAU.", error);
        describeIndexSource({ period: VAU_DATA[0]?.data, source: "Tabela local" });
      }

      if (typeof updateValues === "function") updateValues();
    }

    const button = document.getElementById("refresh-indices-btn");
    button?.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Atualizando...";
      try {
        await window.ReduzSimIndices?.refreshAll(VAU_DATA);
        await refreshVauAndRecalculate();
      } finally {
        button.disabled = false;
        button.textContent = "Atualizar índices";
      }
    });

    refreshVauAndRecalculate();
    window.ReduzSimIndices?.scheduleAutoUpdates(VAU_DATA, refreshVauAndRecalculate);
  }

  function updateHonorariosMode() {
    const mode = document.getElementById("honorarios-mode")?.value || "percentual";
    const percentBlock = document.getElementById("honorarios-percent-block");
    const fixedBlock = document.getElementById("honorarios-fixed-block");
    if (percentBlock) percentBlock.hidden = mode === "fixo";
    if (fixedBlock) fixedBlock.hidden = mode !== "fixo";
  }

  function getHonorariosConfig(economiaBruta) {
    const mode = document.getElementById("honorarios-mode")?.value || "percentual";
    if (mode === "fixo") {
      const value = round(Math.max(parseMoney(document.getElementById("honorarios-fixed")?.value), 0));
      return {
        value,
        mode: "fixo",
        percent: economiaBruta > 0 ? round((value / economiaBruta) * 100) : 0,
        description: "valor fixo",
      };
    }

    const percent = Math.max(toNumber(document.getElementById("honorarios-percent")?.value), 0);
    return {
      value: round(economiaBruta * (percent / 100)),
      mode: "percentual",
      percent,
      description: `${percent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% sobre a economia obtida`,
    };
  }

  function overrideReductionTotals() {
    if (typeof updateTotals !== "function" || typeof receitaResult === "undefined") return;

    updateTotals = function (rows) {
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
      updateHonorariosMode();
      const honorariosConfig = getHonorariosConfig(economiaBruta);
      const honorarios = honorariosConfig.value;
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
        honorariosMode: honorariosConfig.mode,
        honorariosDescription: honorariosConfig.description,
        economiaLiquida,
        honorariosPercent: honorariosConfig.percent,
        percentualReducao,
      };
    };
  }

  function initReductionPage() {
    if (!document.getElementById("honorarios-mode")) return;

    overrideReductionTotals();
    updateHonorariosMode();
    document.getElementById("honorarios-mode")?.addEventListener("change", () => {
      updateHonorariosMode();
      if (typeof updateMonthlyCalculation === "function") updateMonthlyCalculation();
    });
    document.getElementById("honorarios-fixed")?.addEventListener("input", () => {
      if (typeof updateMonthlyCalculation === "function") updateMonthlyCalculation();
    });

    async function refreshSelic() {
      const note = document.getElementById("indices-update-note");
      if (!window.ReduzSimIndices || typeof SELIC_ACUMULADA === "undefined") {
        if (note) note.textContent = "Índices locais em uso.";
        return;
      }
      try {
        await window.ReduzSimIndices.fetchSelicRates();
        const months = typeof getWorkMonths === "function" ? getWorkMonths() : Object.keys(SELIC_ACUMULADA);
        const reference = document.getElementById("data-referencia")?.value;
        Object.assign(SELIC_ACUMULADA, window.ReduzSimIndices.calculateSelicMap(months, reference));
        if (typeof restoreMonthlyCalculation === "function") restoreMonthlyCalculation();
        if (note) note.textContent = "SELIC atualizada automaticamente com tentativas a partir de 8h.";
      } catch (error) {
        console.warn("Falha ao atualizar SELIC.", error);
        if (note) note.textContent = "SELIC local em uso; nova tentativa automática será feita a partir de 8h.";
      }
    }

    document.getElementById("refresh-indices-btn")?.addEventListener("click", async () => {
      await window.ReduzSimIndices?.refreshAll([]);
      await refreshSelic();
    });
    document.getElementById("data-referencia")?.addEventListener("change", refreshSelic);

    if (typeof updateMonthlyCalculation === "function") updateMonthlyCalculation();
    refreshSelic();
    window.ReduzSimIndices?.scheduleAutoUpdates([], refreshSelic);
  }

  function initFinalPage() {
    const label = document.getElementById("honorarios-label");
    if (!label) return;

    try {
      const stored = JSON.parse(localStorage.getItem("reducaoResult") || "{}");
      const totals = stored.totals || {};
      if (totals.honorariosMode === "fixo") {
        label.textContent = "(valor fixo)";
      } else if (Number.isFinite(Number(totals.honorariosPercent))) {
        label.textContent = `(${Number(totals.honorariosPercent).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%)`;
      }
      const note = document.getElementById("honorarios-note");
      if (note && totals.honorariosDescription) {
        note.textContent = `Observação: honorários calculados como ${totals.honorariosDescription}.`;
      }
    } catch (error) {
      console.warn("Nao foi possivel ajustar a exibicao dos honorarios.", error);
    }
  }

  initIndexPage();
  initResultPage();
  initReductionPage();
  initFinalPage();
})();
