const test = require("node:test");
const assert = require("node:assert/strict");
const calc = require("../calculo-core.js");

const vauRows = [{
  UF: "TO",
  RES: 2790.08,
  RMUL: 2329.40,
  COM: 2651.89,
  GALP: 1239.30,
  RPOP: 1488.43,
  CHAB: 1488.43,
  EGAR: 2651.89,
}];

const concreteRows = [{
  UF: "TO",
  RES: 0.0533,
  RMUL: 0.0716,
  COM: 0.1000,
  GALP: 0.0330,
  RPOP: 0.0353,
  CHAB: 0.0353,
  EGAR: 0.1000,
}];

test("calcula decadencia parcial por meses completos", () => {
  const result = calc.calculateDecay("2018-05-01", "2023-05-31", "2026-06-30");
  assert.equal(result.totalMonths, 61);
  assert.equal(result.decadentCount, 32);
  assert.equal(result.nonDecadentCount, 29);
  assert.equal(result.lastDecadentMonth, "2020-12");
  assert.ok(Math.abs(result.nonDecadentRatio - (29 / 61)) < 1e-12);
});

test("usa a area principal total da destinacao para equivalencia", () => {
  const result = calc.calculateConstruction({
    UF: "TO",
    responsavelObra: "PF",
    isUsoConcreto: false,
    dataInicioObra: "2021-01-01",
    dataFimObra: "2023-01-01",
    dataAfericao: "2026-06-30",
    destinacoes: [{
      destinacao: "RES",
      tipoObra: "ALV",
      areaConstrucao: 900,
      areaReforma: 200,
    }],
  }, vauRows, concreteRows);

  const construction = result.lines.find((line) => line.label === "Construção / obra nova");
  const reform = result.lines.find((line) => line.label === "Reforma");
  assert.equal(construction.equivalentArea, 765);
  assert.equal(reform.equivalentArea, 170);
});

test("soma mais de uma destinacao na mesma obra", () => {
  const result = calc.calculateConstruction({
    UF: "TO",
    responsavelObra: "PF",
    isUsoConcreto: false,
    dataInicioObra: "2021-01-01",
    dataFimObra: "2021-12-31",
    dataAfericao: "2026-06-30",
    destinacoes: [
      { destinacao: "RES", tipoObra: "ALV", areaConstrucao: 100 },
      { destinacao: "COM", tipoObra: "MAD", areaConstrucao: 80 },
    ],
  }, vauRows, concreteRows);

  assert.equal(result.destinations.length, 2);
  assert.equal(result.lines.filter((line) => line.area > 0).length, 2);
  assert.ok(result.codTotal > 0);
  assert.equal(
    result.codTotal,
    calc.roundMoney(result.lines.reduce((total, line) => total + line.cod, 0)),
  );
});

test("separa concreto por categoria e aplica decadencia antes dos creditos", () => {
  const result = calc.calculateConstruction({
    UF: "TO",
    responsavelObra: "PF",
    isUsoConcreto: true,
    dataInicioObra: "2018-05-01",
    dataFimObra: "2023-05-31",
    dataAfericao: "2026-06-30",
    destinacoes: [{
      destinacao: "RES",
      tipoObra: "ALV",
      areaConstrucao: 150,
      areaReforma: 50,
    }],
  }, vauRows, concreteRows);

  assert.equal(result.rmtIntegral, 31536.27);
  assert.equal(result.concreteCreditIntegral, 1108.46);
  assert.equal(result.rmtNonDecadent, 14992.65);
  assert.equal(result.concreteCreditNonDecadent, 526.97);
  assert.equal(result.taxableRmt, 14465.68);
  assert.equal(result.estimatedContribution, 5323.37);
  assert.equal(result.adjustmentTarget, 7496.33);
});

test("aplica reducao de vinte por cento ao edificio de garagens", () => {
  const common = {
    UF: "TO",
    responsavelObra: "PF",
    isUsoConcreto: false,
    dataInicioObra: "2021-01-01",
    dataFimObra: "2021-12-31",
    dataAfericao: "2026-06-30",
  };
  const garage = calc.calculateConstruction({
    ...common,
    destinacoes: [{ destinacao: "EGAR", tipoObra: "ALV", areaConstrucao: 100 }],
  }, vauRows, concreteRows);
  const commercial = calc.calculateConstruction({
    ...common,
    destinacoes: [{ destinacao: "COM", tipoObra: "ALV", areaConstrucao: 100 }],
  }, vauRows, concreteRows);
  assert.equal(garage.rmtIntegral, calc.roundMoney(commercial.rmtIntegral * 0.8));
});

test("calcula multa de mora por dia, limitada a vinte por cento", () => {
  const shortDelay = calc.calculateLatePaymentFine("2026-01", "2026-03-02", 1000);
  assert.equal(shortDelay.daysLate, 10);
  assert.equal(shortDelay.value, 33);

  const longDelay = calc.calculateLatePaymentFine("2025-01", "2026-03-02", 1000);
  assert.equal(longDelay.rate, 0.20);
  assert.equal(longDelay.value, 200);
});

test("nao calcula MAED DCTFWeb para competencias anteriores a outubro de 2021", () => {
  assert.equal(calc.calculateMaed("2021-09", "2026-06-30", 100).value, 0);
  assert.equal(calc.calculateMaed("2021-10", "2026-06-30", 100).value, 250);
  assert.equal(calc.dctfDueDate("2021-10").toISOString().slice(0, 10), "2021-11-19");
  assert.equal(calc.dctfDueDate("2024-01").toISOString().slice(0, 10), "2024-02-15");
  assert.equal(calc.dctfDueDate("2025-01").toISOString().slice(0, 10), "2025-03-31");
});
