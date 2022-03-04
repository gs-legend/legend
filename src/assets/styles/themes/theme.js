const path = require("path");
let themeVariables = require(path.join(__dirname, "./dark.json"));

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
