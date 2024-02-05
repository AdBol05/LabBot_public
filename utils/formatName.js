const normalize = require('normalize');

module.exports = (input) => {

  let output = input.toLowerCase().trim();
  output = output.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").replaceAll(/[^\w\s]/g, "x").replaceAll(/[^ -~]+/g, "x");

  return output;
}

