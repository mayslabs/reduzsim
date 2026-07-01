const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("mantem o fluxo principal entre as quatro telas", () => {
  const index = read("index.html");
  const result = read("result.html");
  const reduction = read("reducao.html");
  const final = read("final.html");

  assert.match(index, /action="result\.html"/);
  assert.match(result, /href="reducao\.html"/);
  assert.match(reduction, /id="recalc-btn"/);
  assert.match(final, /href="reducao\.html"/);
});

test("expoe controles dos casos especiais e filtros mensais", () => {
  const index = read("index.html");
  const reduction = read("reducao.html");

  [
    "tipo-afericao",
    "mudanca-responsabilidade",
    "laudo-panel",
    "data-project-areas",
    "preMoldadoValor",
  ].forEach((token) => assert.ok(index.includes(token), `Ausente: ${token}`));

  ["active", "paused", "decadent", "all"].forEach((filter) => {
    assert.ok(reduction.includes(`data-month-filter="${filter}"`));
  });
  assert.match(reduction, /calculation-loading/);
});

test("preserva dados e paralisações no armazenamento local", () => {
  const main = read("main.js");
  const reduction = read("reducao.js");
  const final = read("final.js");

  assert.match(main, /localStorage\.setItem\("formData"/);
  assert.match(reduction, /reducaoParalisacoes/);
  assert.match(reduction, /localStorage\.setItem\("reducaoResult"/);
  assert.match(final, /reduzsim_simulation_history_v1/);
});

test("mantem ações de impressão e títulos personalizados", () => {
  const reduction = read("reducao.js");
  const final = read("final.js");

  assert.match(reduction, /print-reducao-btn/);
  assert.match(reduction, /window\.print\(\)/);
  assert.match(final, /print-btn/);
  assert.match(final, /setPrintTitle/);
});

test("declara premissas comerciais sem exibir período decadente no orçamento", () => {
  const reduction = read("reducao.html");
  const final = read("final.html");

  assert.match(reduction, /Premissa comercial/);
  assert.match(reduction, /MAED iniciada em R\$ 100,00/);
  assert.doesNotMatch(final, /Período não decadente/);
  assert.doesNotMatch(final, /class="rs-navbar/);
});

test("permite editar e replicar a MAED entre competências aplicáveis", () => {
  const reductionHtml = read("reducao.html");
  const reductionJs = read("reducao.js");

  assert.match(reductionHtml, /id="copy-first-maed"/);
  assert.match(reductionJs, /data-field='maedInput'/);
  assert.match(reductionJs, /function copyFirstMaedToAll/);
  assert.match(reductionJs, /maedInput: row\.maedInput === undefined \? 100/);
});

test("mostra decadência apenas quando existem competências decadentes", () => {
  const resultHtml = read("result.html");
  const resultJs = read("result.js");
  const reductionHtml = read("reducao.html");
  const reductionJs = read("reducao.js");
  const finalHtml = read("final.html");
  const finalJs = read("final.js");

  assert.match(resultHtml, /id="decay-summary"/);
  assert.match(resultJs, /const hasDecay = calculation\.decay\.decadentCount > 0/);
  assert.match(reductionHtml, /id="decadent-filter-button"/);
  assert.match(reductionJs, /summary\.hidden = !hasDecay/);
  assert.match(finalHtml, /id="proposal-baseline-label"/);
  assert.match(finalJs, /function hasDecadence/);
});
