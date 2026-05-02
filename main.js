const clienteNome = document.getElementById("cliente-nome");
const clienteTelefone = document.getElementById("cliente-telefone");
const responsavelObra = document.getElementById("responsavel-obra");
const destinacao = document.getElementById("destinacao");
const tipoObra = document.getElementById("tipo-obra");
const isUsoConcreto = document.getElementById("uso-concreto");
const UF = document.getElementById("UF");
const dataInicioObra = document.getElementById("data-inicio-obra");
const dataFimObra = document.getElementById("data-fim-obra");

const areaConstrucao = document.getElementById("area-construcao");
const areaReforma = document.getElementById("area-reforma");
const areaDemolicao = document.getElementById("area-demolicao");
const areaCoberta = document.getElementById("area-comp-coberta");
const areaDescoberta = document.getElementById("area-comp-descoberta");
const areaFields = [areaConstrucao, areaReforma, areaDemolicao, areaCoberta, areaDescoberta];

function parseArea(input) {
  return Number.parseFloat(input.value || "0") || 0;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const area = digits.slice(0, 2);
  const ninthDigit = digits.slice(2, 3);
  const middle = digits.slice(3, 7);
  const last = digits.slice(7, 11);

  if (!area) return "";

  let formatted = `(${area}`;
  if (area.length === 2) formatted += ")";
  if (ninthDigit) formatted += ` ${ninthDigit}`;
  if (middle) formatted += ` ${middle}`;
  if (last) formatted += `-${last}`;

  return formatted;
}

function isDataInvalid() {
  return areaFields.every((field) => parseArea(field) === 0);
}

function paintInvalidAreas() {
  areaFields.forEach((field) => {
    field.classList.remove("valid");
    field.classList.add("is-invalid");
  });
}

function clearAreaErrors() {
  areaFields.forEach((field) => {
    field.classList.remove("is-invalid");
  });
}

function buildFormData() {
  const formData = {
    clienteNome: clienteNome.value.trim(),
    clienteTelefone: clienteTelefone.value.trim(),
    calculatedAt: new Date().toISOString(),
    responsavelObra: responsavelObra.value,
    destinacao: destinacao.value,
    tipoObra: tipoObra.value,
    isUsoConcreto: isUsoConcreto.value === "true",
    UF: UF.value,
    dataInicioObra: dataInicioObra.value,
    dataFimObra: dataFimObra.value,
    areaConstrucao: parseArea(areaConstrucao),
    areaReforma: parseArea(areaReforma),
    areaDemolicao: parseArea(areaDemolicao),
    areaCoberta: parseArea(areaCoberta),
    areaDescoberta: parseArea(areaDescoberta),
  };

  formData.areaTotal = formData.areaConstrucao
    + formData.areaReforma
    + formData.areaDemolicao
    + formData.areaCoberta
    + formData.areaDescoberta;

  localStorage.setItem("formData", JSON.stringify(formData));
}

(() => {
  "use strict";

  const form = document.getElementById("form");
  const errorMessage = document.getElementById("msg-erro");

  dataFimObra.value = dataFimObra.value || todayISO();
  clienteTelefone.value = formatPhone(clienteTelefone.value);

  clienteTelefone.addEventListener("input", () => {
    clienteTelefone.value = formatPhone(clienteTelefone.value);
  });

  areaFields.forEach((field) => {
    field.addEventListener("input", () => {
      clearAreaErrors();
      errorMessage.hidden = true;
    });
  });

  form.addEventListener("submit", (event) => {
    buildFormData();

    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    } else if (isDataInvalid()) {
      event.preventDefault();
      event.stopPropagation();
      errorMessage.hidden = false;
      paintInvalidAreas();
    } else {
      errorMessage.hidden = true;
    }

    form.classList.add("was-validated");
  });
})();
