function locateElementById(id) {
  return document.getElementById(id);
}

function locateElementByCss(selector) {
  return document.querySelector(selector);
}

export function findElement(locator) {
  const { type, string } = locator;

  switch (type) {
    case "css":
      return locateElementByCss(string);
    case "id":
      return locateElementById(string);
    default:
      return locateElementByCss(string);
  }
}
