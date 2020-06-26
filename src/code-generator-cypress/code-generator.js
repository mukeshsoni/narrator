function selectorPart(command) {
  const selector = command.target[command.selectedTarget];

  if (selector[1] === "name") {
    return `cy.get("[${selector[0]}]")`;
  } else if (selector[1] === "id") {
    return `cy.get("#${selector[0].split("=")[1]}")`;
  } else if (selector[1].startsWith("xpath")) {
    return `cy.xpath("${selector[0].slice(6)}")`;
  }

  return `cy.get("${selector[0]}")`;
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
