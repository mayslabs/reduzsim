(function initReduzSimCalculo(root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ReduzSimCalculo = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function buildReduzSimCalculo() {
  const DESTINATION_LABELS = {
    RES: "Residencial unifamiliar",
    RMUL: "Residencial multifamiliar",
    COM: "Comercial - salas e lojas",
    GALP: "Galpão industrial",
    RPOP: "Casa popular",
    CHAB: "Conjunto habitacional popular",
    EGAR: "Edifício de garagens",
  };

  const TYPE_LABELS = {
    ALV: "Alvenaria",
    MAD: "Madeira ou mista",
  };

  const AREA_KEYS = [
    "areaConstrucao",
    "areaReforma",
    "areaDemolicao",
    "areaCoberta",
    "areaDescoberta",
  ];

  function roundMoney(value) {
    return Math.round(((Number(value) || 0) + Number.EPSILON) * 100) / 100;
  }

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

  function monthKey(dateValue) {
    return String(dateValue || "").slice(0, 7);
  }

  function addMonths(key, amount) {
    const [year, month] = String(key || "").split("-").map(Number);
    if (!year || !month) return "";
    const date = new Date(year, month - 1 + amount, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function listMonths(startValue, endValue) {
    const start = monthKey(startValue);
    const end = monthKey(endValue);
    if (!/^\d{4}-\d{2}$/.test(start) || !/^\d{4}-\d{2}$/.test(end) || start > end) return [];

    const months = [];
    for (let current = start; current <= end; current = addMonths(current, 1)) {
      months.push(current);
    }
    return months;
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatLocalISO(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function calculateProposalValidity(referenceDateValue = new Date()) {
    const referenceDate = referenceDateValue instanceof Date
      ? new Date(referenceDateValue)
      : parseDate(referenceDateValue);
    const start = referenceDate && !Number.isNaN(referenceDate.getTime())
      ? referenceDate
      : new Date();
    start.setHours(0, 0, 0, 0);

    const validity = new Date(start);
    let businessDays = 0;
    while (businessDays < 5) {
      validity.setDate(validity.getDate() + 1);
      if (validity.getDay() !== 0 && validity.getDay() !== 6) businessDays += 1;
    }

    const endOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    return formatLocalISO(validity > endOfMonth ? endOfMonth : validity);
  }

  function calculateCommercialComparison(inssWithoutDecay, reducedInss) {
    const baseline = roundMoney(Math.max(toNumber(inssWithoutDecay), 0));
    const reduced = roundMoney(Math.max(toNumber(reducedInss), 0));
    const grossSavings = roundMoney(Math.max(baseline - reduced, 0));
    const savingsPercent = baseline > 0
      ? roundMoney((grossSavings / baseline) * 100)
      : 0;

    return { baseline, reduced, grossSavings, savingsPercent };
  }

  function calculateDecay(startValue, endValue, assessmentDateValue) {
    const months = listMonths(startValue, endValue);
    const assessmentDate = parseDate(assessmentDateValue) || new Date();
    const firstNonDecadentMonth = `${assessmentDate.getFullYear() - 5}-01`;
    const decadentMonths = months.filter((month) => month < firstNonDecadentMonth);
    const nonDecadentMonths = months.filter((month) => month >= firstNonDecadentMonth);
    const nonDecadentRatio = months.length ? nonDecadentMonths.length / months.length : 1;

    return {
      assessmentDate: formatLocalISO(assessmentDate),
      firstNonDecadentMonth,
      lastDecadentMonth: addMonths(firstNonDecadentMonth, -1),
      totalMonths: months.length,
      decadentMonths,
      nonDecadentMonths,
      decadentCount: decadentMonths.length,
      nonDecadentCount: nonDecadentMonths.length,
      nonDecadentRatio,
      nonDecadentPercent: nonDecadentRatio * 100,
      fullyDecadent: months.length > 0 && nonDecadentMonths.length === 0,
      partiallyDecadent: decadentMonths.length > 0 && nonDecadentMonths.length > 0,
    };
  }

  function normalizeDestination(item, index = 0) {
    const normalized = {
      id: String(item?.id || `dest-${index + 1}`),
      destinacao: DESTINATION_LABELS[item?.destinacao] ? item.destinacao : "RES",
      tipoObra: TYPE_LABELS[item?.tipoObra] ? item.tipoObra : "ALV",
    };
    AREA_KEYS.forEach((key) => {
      normalized[key] = Math.max(toNumber(item?.[key]), 0);
    });
    return normalized;
  }

  function normalizeDestinations(items) {
    if (!Array.isArray(items) || !items.length) return [normalizeDestination({}, 0)];
    return items.map(normalizeDestination);
  }

  function getEquivalenceFactor(destination, totalMainArea) {
    if (destination === "RES") return totalMainArea <= 1000 ? 0.89 : 0.85;
    if (destination === "RMUL") return totalMainArea <= 1000 ? 0.90 : 0.86;
    if (destination === "COM" || destination === "EGAR") return totalMainArea <= 3000 ? 0.86 : 0.83;
    if (destination === "GALP") return 0.95;
    if (destination === "RPOP" || destination === "CHAB") return 0.98;
    return 1;
  }

  function getSocialFactor(categoryArea, responsibleType) {
    if (responsibleType !== "PF" && responsibleType !== "PJ") return 1;
    if (categoryArea <= 100) return 0.20;
    if (categoryArea <= 200) return 0.40;
    if (categoryArea <= 300) return 0.55;
    if (categoryArea <= 400) return 0.70;
    return 0.90;
  }

  function getLaborRate(destination, constructionType) {
    if (destination === "RPOP" || destination === "CHAB") {
      return constructionType === "ALV" ? 0.12 : 0.07;
    }
    return constructionType === "ALV" ? 0.20 : 0.15;
  }

  function getDestinationReduction(destination) {
    return destination === "EGAR" ? 0.80 : 1;
  }

  function getCategoryTotals(destinations) {
    return destinations.reduce((totals, item) => ({
      construcao: totals.construcao + item.areaConstrucao + item.areaCoberta + item.areaDescoberta,
      reforma: totals.reforma + item.areaReforma,
      demolicao: totals.demolicao + item.areaDemolicao,
    }), { construcao: 0, reforma: 0, demolicao: 0 });
  }

  function buildAreaLines(destination, vau) {
    const totalMainArea = destination.areaConstrucao + destination.areaReforma + destination.areaDemolicao;
    const equivalence = getEquivalenceFactor(destination.destinacao, totalMainArea);
    return [
      {
        key: "construcao",
        label: "Construção / obra nova",
        area: destination.areaConstrucao,
        equivalentArea: destination.areaConstrucao * equivalence,
        categoryFactor: 1,
        concreteCategoryFactor: 1,
      },
      {
        key: "reforma",
        label: "Reforma",
        area: destination.areaReforma,
        equivalentArea: destination.areaReforma * equivalence,
        categoryFactor: 0.35,
        concreteCategoryFactor: 0.35,
      },
      {
        key: "demolicao",
        label: "Demolição",
        area: destination.areaDemolicao,
        equivalentArea: destination.areaDemolicao * equivalence,
        categoryFactor: 0.10,
        concreteCategoryFactor: 0,
      },
      {
        key: "construcao",
        label: "Área complementar coberta",
        area: destination.areaCoberta,
        equivalentArea: destination.areaCoberta * 0.50,
        categoryFactor: 1,
        concreteCategoryFactor: 1,
      },
      {
        key: "construcao",
        label: "Área complementar descoberta",
        area: destination.areaDescoberta,
        equivalentArea: destination.areaDescoberta * 0.25,
        categoryFactor: 1,
        concreteCategoryFactor: 1,
      },
    ].map((line) => ({
      ...line,
      cod: roundMoney(line.equivalentArea * vau),
    }));
  }

  function calculateConstruction(data, vauRows, concreteRows) {
    const destinations = normalizeDestinations(data?.destinacoes);
    const categoryTotals = getCategoryTotals(destinations);
    const decay = calculateDecay(data?.dataInicioObra, data?.dataFimObra, data?.dataAfericao);
    const lines = [];
    let areaTotal = 0;
    let codTotal = 0;
    let rmtIntegral = 0;
    let concreteCreditIntegral = 0;

    destinations.forEach((destination) => {
      AREA_KEYS.forEach((key) => { areaTotal += destination[key]; });
      const vauRow = (vauRows || []).find((row) => row.UF === data.UF);
      const concreteRow = (concreteRows || []).find((row) => row.UF === data.UF);
      const vau = toNumber(vauRow?.[destination.destinacao]);
      const concretePercent = data.isUsoConcreto ? toNumber(concreteRow?.[destination.destinacao]) : 0;
      const socialByCategory = {
        construcao: getSocialFactor(categoryTotals.construcao, data.responsavelObra),
        reforma: getSocialFactor(categoryTotals.reforma, data.responsavelObra),
        demolicao: getSocialFactor(categoryTotals.demolicao, data.responsavelObra),
      };
      const laborRate = getLaborRate(destination.destinacao, destination.tipoObra);
      const destinationReduction = getDestinationReduction(destination.destinacao);

      buildAreaLines(destination, vau).forEach((line) => {
        if (line.area <= 0) return;
        const rmt = roundMoney(
          line.cod
          * socialByCategory[line.key]
          * line.categoryFactor
          * laborRate
          * destinationReduction,
        );
        const concreteCredit = roundMoney(
          line.cod * concretePercent * 0.05 * line.concreteCategoryFactor,
        );
        codTotal = roundMoney(codTotal + line.cod);
        rmtIntegral = roundMoney(rmtIntegral + rmt);
        concreteCreditIntegral = roundMoney(concreteCreditIntegral + concreteCredit);
        lines.push({
          ...line,
          destinationId: destination.id,
          destination: destination.destinacao,
          destinationLabel: DESTINATION_LABELS[destination.destinacao],
          constructionType: destination.tipoObra,
          constructionTypeLabel: TYPE_LABELS[destination.tipoObra],
          vau,
          rmt,
          concreteCredit,
          concreteCategoryPercent: line.concreteCategoryFactor * 100,
        });
      });
    });

    const rmtNonDecadent = roundMoney(rmtIntegral * decay.nonDecadentRatio);
    const concreteCreditNonDecadent = roundMoney(concreteCreditIntegral * decay.nonDecadentRatio);
    const taxableRmt = roundMoney(Math.max(rmtNonDecadent - concreteCreditNonDecadent, 0));
    const taxableRmtWithoutDecay = roundMoney(Math.max(rmtIntegral - concreteCreditIntegral, 0));
    const estimatedContribution = roundMoney(taxableRmt * 0.368);
    const estimatedContributionWithoutDecay = roundMoney(taxableRmtWithoutDecay * 0.368);
    const adjustmentRate = areaTotal <= 350 ? 0.50 : 0.70;
    const adjustmentTarget = roundMoney(rmtNonDecadent * adjustmentRate);

    return {
      destinations,
      lines,
      categoryTotals,
      areaTotal: roundMoney(areaTotal),
      codTotal,
      rmtIntegral,
      rmtNonDecadent,
      concreteCreditIntegral,
      concreteCreditNonDecadent,
      taxableRmt,
      taxableRmtWithoutDecay,
      estimatedContribution,
      estimatedContributionWithoutDecay,
      decaySavings: roundMoney(estimatedContributionWithoutDecay - estimatedContribution),
      adjustmentRate,
      adjustmentTarget,
      decay,
    };
  }

  function previousBusinessDay(date) {
    const adjusted = new Date(date);
    while (adjusted.getDay() === 0 || adjusted.getDay() === 6) {
      adjusted.setDate(adjusted.getDate() - 1);
    }
    return adjusted;
  }

  function nextMonthDate(month, day) {
    const [year, itemMonth] = String(month || "").split("-").map(Number);
    if (!year || !itemMonth) return null;
    return new Date(year, itemMonth, day);
  }

  function paymentDueDate(month) {
    const date = nextMonthDate(month, 20);
    return date ? previousBusinessDay(date) : null;
  }

  function lastBusinessDayOfNextMonth(month) {
    const [year, itemMonth] = String(month || "").split("-").map(Number);
    if (!year || !itemMonth) return null;
    return previousBusinessDay(new Date(year, itemMonth + 1, 0));
  }

  function dctfDueDate(month) {
    if (month === "2021-10") return new Date(2021, 10, 19);
    if (month === "2025-01") return new Date(2025, 2, 31);
    if (month >= "2025-02") return lastBusinessDayOfNextMonth(month);

    const [year, itemMonth] = String(month || "").split("-").map(Number);
    if (!year || !itemMonth) return null;
    const due = new Date(year, itemMonth, 15);
    if (month >= "2023-10") {
      while (due.getDay() === 0 || due.getDay() === 6) due.setDate(due.getDate() + 1);
      return due;
    }
    return previousBusinessDay(due);
  }

  function daysBetween(startDate, endDate) {
    const dayMs = 24 * 60 * 60 * 1000;
    return Math.max(Math.floor((endDate.getTime() - startDate.getTime()) / dayMs), 0);
  }

  function calculateLatePaymentFine(month, paymentDateValue, contribution) {
    const dueDate = paymentDueDate(month);
    const paymentDate = parseDate(paymentDateValue);
    if (!dueDate || !paymentDate || paymentDate <= dueDate) {
      return { dueDate, daysLate: 0, rate: 0, value: 0 };
    }
    const daysLate = daysBetween(dueDate, paymentDate);
    const rate = Math.min(daysLate * 0.0033, 0.20);
    return {
      dueDate,
      daysLate,
      rate,
      value: roundMoney(toNumber(contribution) * rate),
    };
  }

  function calculateLatePaymentInterest(contribution, selicPercent, daysLate) {
    if (toNumber(daysLate) <= 0) return 0;
    return roundMoney(toNumber(contribution) * (Math.max(toNumber(selicPercent), 0) / 100));
  }

  function calculateMaed(month, transmissionDateValue, declaredTaxes, options = {}) {
    if (month < "2021-10") return { dueDate: null, monthsLate: 0, rate: 0, value: 0 };
    const dueDate = dctfDueDate(month);
    const transmissionDate = parseDate(transmissionDateValue);
    if (!dueDate || !transmissionDate || transmissionDate <= dueDate) {
      return { dueDate, monthsLate: 0, rate: 0, value: 0 };
    }

    const firstLateDay = new Date(dueDate);
    firstLateDay.setDate(firstLateDay.getDate() + 1);
    const monthsLate = (
      (transmissionDate.getFullYear() - firstLateDay.getFullYear()) * 12
      + transmissionDate.getMonth()
      - firstLateDay.getMonth()
      + 1
    );
    const rate = Math.min(Math.max(monthsLate, 1) * 0.02, 0.20);
    const minimum = options.withMovement === false ? 200 : 500;
    const spontaneousReduction = options.spontaneous === false ? 1 : 0.50;
    const calculatedValue = roundMoney(Math.max(toNumber(declaredTaxes) * rate, minimum) * spontaneousReduction);
    const value = roundMoney(options.fixedValue ?? 100);
    return { dueDate, monthsLate, rate, calculatedValue, value, policy: "fixed" };
  }

  return {
    AREA_KEYS,
    DESTINATION_LABELS,
    TYPE_LABELS,
    addMonths,
    calculateCommercialComparison,
    calculateConstruction,
    calculateDecay,
    calculateLatePaymentFine,
    calculateLatePaymentInterest,
    calculateMaed,
    calculateProposalValidity,
    dctfDueDate,
    formatLocalISO,
    getEquivalenceFactor,
    getLaborRate,
    getSocialFactor,
    lastBusinessDayOfNextMonth,
    listMonths,
    monthKey,
    normalizeDestination,
    normalizeDestinations,
    paymentDueDate,
    roundMoney,
    toNumber,
  };
});
