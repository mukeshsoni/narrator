function selectorPart(command) {
  const [selectorType, ...selectorParts] = command.target.split("=");
  const selector = selectorParts.join("=");

  switch (selectorType) {
    case "name":
      return `cy.get("[${selectorType}='${selector}']")`;
    case "id":
      return `cy.get("#${selector}")`;
    case "xpath":
      return `cy.xpath("${selector}")`;
  }

  return `cy.get("${selector}")`;
}

function generateCode(commands) {
  return commands
    .map((command) => {
      switch (command.name) {
        case "click":
          return `${selectorPart(command)}.click()`;
        case "type":
          return `${selectorPart(command)}.type("${command.value}")`;
        case "GOTO":
          return `cy.visit("${command.href}")`;
        default:
          return "something something";
      }
    })
    .filter((codeString) => codeString)
    .join("\n");
}

module.exports = generateCode;
