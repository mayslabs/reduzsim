const ReduzSimIndices = (() => {
  const AUTO_UPDATE_HOURS = [8];
  const STORAGE_KEY = "reduzsim_indices_cache_v3";
  const ATTEMPT_KEY = "reduzsim_indices_attempts_v3";
  const BCB_SELIC_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados";
  const SIDRA_SINAPI_URL = "https://apisidra.ibge.gov.br/values/t/6586/n1/1/v/all/p/last%201/h/y";

  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function todayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  function parseNumberBR(value) {
    if (typeof value === "number") return value;
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
    } else if ((cleaned.match(/\./g) || []).length > 1) {
      const parts = cleaned.split(".");
      normalized = `${parts.slice(0, -1).join("")}.${parts.at(-1)}`;
    }

    return Number.parseFloat(normalized) || 0;
  }

  function round(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
  }

  function monthKeyFromBR(value) {
    const [day, month, year] = String(value || "").split("/");
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}`;
  }

  function periodToKey(period) {
    const [month, year] = String(period || "").split("/");
    if (!month || !year) return "";
    return `${year}-${month.padStart(2, "0")}`;
  }

  function keyToPeriod(key) {
    const [year, month] = String(key || "").split("-");
    if (!year || !month) return "";
    return `${month}/${year}`;
  }

  function currentPeriodKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function addMonths(monthKey, count) {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year, month - 1 + count, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function getCache() {
    return readJSON(STORAGE_KEY, {
      selic: { rates: [], updatedAt: "", source: "" },
      vau: { rows: [], period: "", updatedAt: "", source: "" },
      sinapi: { variation: null, period: "", updatedAt: "", source: "" },
    });
  }

  function setCache(cache) {
    writeJSON(STORAGE_KEY, cache);
  }

  function markAttempt(kind) {
    const now = new Date();
    const attempts = readJSON(ATTEMPT_KEY, {});
    attempts[`${kind}:${todayKey()}:${now.getHours()}`] = new Date().toISOString();
    writeJSON(ATTEMPT_KEY, attempts);
  }

  function wasAttemptedThisHour(kind) {
    const now = new Date();
    const attempts = readJSON(ATTEMPT_KEY, {});
    return Boolean(attempts[`${kind}:${todayKey()}:${now.getHours()}`]);
  }

  function canAttemptNow(kind) {
    const hour = new Date().getHours();
    return hour >= AUTO_UPDATE_HOURS[0] && !wasAttemptedThisHour(kind);
  }

  function nextAttemptDelay() {
    const now = new Date();
    const next = new Date(now);
    const nextHour = AUTO_UPDATE_HOURS.find((hour) => hour > now.getHours());

    if (now.getHours() < AUTO_UPDATE_HOURS[0]) {
      next.setHours(AUTO_UPDATE_HOURS[0], 0, 0, 0);
    } else if (nextHour === undefined) {
      next.setDate(next.getDate() + 1);
      next.setHours(AUTO_UPDATE_HOURS[0], 0, 0, 0);
    } else {
      next.setHours(nextHour, 0, 0, 0);
    }

    return Math.max(next.getTime() - now.getTime(), 60_000);
  }

  async function fetchSelicRates() {
    const end = new Date();
    const start = new Date(end);
    start.setFullYear(start.getFullYear() - 8);
    const fmt = (date) => [
      String(date.getDate()).padStart(2, "0"),
      String(date.getMonth() + 1).padStart(2, "0"),
      date.getFullYear(),
    ].join("/");
    const params = new URLSearchParams({
      formato: "json",
      dataInicial: fmt(start),
      dataFinal: fmt(end),
    });

    const response = await fetch(`${BCB_SELIC_URL}?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`BCB respondeu ${response.status}`);

    const rates = (await response.json())
      .map((row) => ({
        month: monthKeyFromBR(row.data),
        date: row.data,
        value: parseNumberBR(row.valor),
      }))
      .filter((row) => row.month && Number.isFinite(row.value));

    if (!rates.length) throw new Error("BCB não retornou SELIC válida");

    const cache = getCache();
    cache.selic = {
      rates,
      updatedAt: new Date().toISOString(),
      source: "Banco Central SGS 4390",
    };
    setCache(cache);
    return cache.selic;
  }

  function calculateSelicMap(months, referenceDateValue) {
    const cache = getCache();
    const rates = cache.selic?.rates || [];
    const rateMap = Object.fromEntries(rates.map((rate) => [rate.month, rate.value]));
    const referenceDate = referenceDateValue ? new Date(`${referenceDateValue}T00:00:00`) : new Date();
    const paymentMonth = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
    const previousMonth = addMonths(paymentMonth, -1);
    const previousParts = previousMonth.split("-").map(Number);
    const previousDueDate = new Date(previousParts[0], previousParts[1], 20);
    while (previousDueDate.getDay() === 0 || previousDueDate.getDay() === 6) {
      previousDueDate.setDate(previousDueDate.getDate() - 1);
    }

    return Object.fromEntries(months.map((month) => {
      if (month >= paymentMonth || (month === previousMonth && referenceDate <= previousDueDate)) {
        return [month, 0];
      }

      let sum = 1;
      const interestEnd = addMonths(paymentMonth, -1);
      for (let current = addMonths(month, 2); current <= interestEnd; current = addMonths(current, 1)) {
        sum += rateMap[current] || 0;
      }
      return [month, round(sum)];
    }));
  }

  async function fetchSinapiVariation() {
    const response = await fetch(SIDRA_SINAPI_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`IBGE respondeu ${response.status}`);

    const rows = (await response.json()).slice(1);
    const variationRow = rows.find((row) => {
      const text = Object.values(row).join(" ").toLowerCase();
      return text.includes("variação percentual no mês") || text.includes("variacao percentual no mes");
    });

    if (!variationRow) throw new Error("IBGE/SIDRA não retornou variação mensal do SINAPI");

    const value = parseNumberBR(variationRow.V);
    if (!Number.isFinite(value)) throw new Error("Variação mensal do SINAPI inválida");

    const cache = getCache();
    cache.sinapi = {
      variation: value,
      period: String(variationRow.D2C || variationRow["Mês (Código)"] || ""),
      updatedAt: new Date().toISOString(),
      source: "IBGE SIDRA/SINAPI tabela 6586",
    };
    setCache(cache);
    return cache.sinapi;
  }

  function projectVauRows(fallbackRows, sinapi) {
    const currentKey = currentPeriodKey();
    const fallbackKey = periodToKey(fallbackRows?.[0]?.data);

    if (!sinapi || !Number.isFinite(sinapi.variation) || !fallbackKey || currentKey <= fallbackKey) {
      return {
        rows: fallbackRows || [],
        period: fallbackRows?.[0]?.data || "",
        updatedAt: "",
        source: "Tabela local",
      };
    }

    const factor = 1 + (sinapi.variation / 100);
    return {
      rows: fallbackRows.map((row) => {
        const projected = { ...row, data: keyToPeriod(currentKey) };
        ["RPOP", "COM", "CHAB", "EGAR", "GALP", "RMUL", "RES"].forEach((key) => {
          projected[key] = round(row[key] * factor);
        });
        return projected;
      }),
      period: keyToPeriod(currentKey),
      updatedAt: new Date().toISOString(),
      source: `Projetado pelo SINAPI ${sinapi.period || ""} sobre a tabela local`,
    };
  }

  async function refreshVau(fallbackRows) {
    const sinapi = await fetchSinapiVariation();
    const cache = getCache();
    cache.vau = projectVauRows(fallbackRows, sinapi);
    setCache(cache);
    return cache.vau;
  }

  async function getVauData(fallbackRows) {
    const cache = getCache();
    const currentKey = currentPeriodKey();
    const cachedKey = periodToKey(cache.vau?.period);
    const fallbackKey = periodToKey(fallbackRows?.[0]?.data);

    if (cache.vau?.rows?.length && cachedKey >= fallbackKey && cachedKey >= currentKey) return cache.vau;

    if (Array.isArray(fallbackRows) && fallbackRows.length && canAttemptNow("vau")) {
      try {
        markAttempt("vau");
        return await refreshVau(fallbackRows);
      } catch (error) {
        return {
          rows: fallbackRows,
          period: fallbackRows[0]?.data || "",
          updatedAt: "",
          source: `Tabela local; atualização VAU falhou: ${error.message}`,
        };
      }
    }

    return {
      rows: fallbackRows || [],
      period: fallbackRows?.[0]?.data || "",
      updatedAt: "",
      source: "Tabela local",
    };
  }

  async function refreshAll(fallbackRows = []) {
    const result = { selic: null, vau: null, errors: [] };
    try {
      markAttempt("selic");
      result.selic = await fetchSelicRates();
    } catch (error) {
      result.errors.push(`SELIC: ${error.message}`);
    }

    if (fallbackRows.length) {
      try {
        markAttempt("vau");
        result.vau = await refreshVau(fallbackRows);
      } catch (error) {
        result.errors.push(`VAU: ${error.message}`);
      }
    }
    return result;
  }

  function getStatus() {
    const cache = getCache();
    return {
      cache,
      hours: AUTO_UPDATE_HOURS,
      nextDelayMs: nextAttemptDelay(),
    };
  }

  function scheduleAutoUpdates(fallbackRows, onStatus) {
    const run = async () => {
      const canUpdateVau = Array.isArray(fallbackRows) && fallbackRows.length && canAttemptNow("vau");
      const shouldRun = new Date().getHours() >= AUTO_UPDATE_HOURS[0]
        && (canAttemptNow("selic") || canUpdateVau);

      if (shouldRun) {
        const result = await refreshAll(fallbackRows);
        if (typeof onStatus === "function") onStatus(result);
      }
      window.setTimeout(run, nextAttemptDelay());
    };
    window.setTimeout(run, Math.min(nextAttemptDelay(), 60_000));
  }

  return {
    AUTO_UPDATE_HOURS,
    calculateSelicMap,
    fetchSelicRates,
    getStatus,
    getVauData,
    refreshAll,
    scheduleAutoUpdates,
  };
})();

window.ReduzSimIndices = ReduzSimIndices;
