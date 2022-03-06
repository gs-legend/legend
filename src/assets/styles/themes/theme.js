const path = require("path");
let themeVariables = require(path.join(__dirname, "./vars.json"));

function getThemeVariables() {
  let themeVar = [];
  Object.keys(themeVariables).forEach((key) => {
    themeVar.push(key);
  });
  return themeVar;
}

module.exports = {
  getThemeVariables,
};
