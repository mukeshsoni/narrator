function locateElementById(id) {
  return document.getElementById(id);
}

function locateElementByCss(selector) {
  return document.querySelector(selector);
}

function locateElementByXPath(xpath) {
  const xpathObj = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );

  if (xpathObj) {
    return xpathObj.singleNodeValue;
  }

  return null;
}

function locateElementByName(locator) {
  let elements = document.getElementsByTagName("*");
  //UnnamedWinIFrameExt, Jie-Lin You, SELAB, CSIE, NCKU, 2016/11/23
  /*
        var filters = locator.split(' ');
        filters[0] = 'name=' + filters[0];

        while (filters.length) {
            var filter = filters.shift();
            elements = this.selectElements(filter, elements, 'value');
        }
        */
  let filter = "name=" + locator;
  elements = this.selectElements(filter, elements, "value");

  if (elements.length > 0) {
    return elements[0];
  }
  return null;
}

function locateElementByLinkText(linkText) {
  let links = document.getElementsByTagName("a");

  for (let i = 0; i < links.length; i++) {
    let element = links[i];
    if (PatternMatcher.matches(linkText, bot.dom.getVisibleText(element))) {
      return element;
    }
  }

  return null;
}

export function findElement(locator) {
  const { type, string } = locator;

  switch (type) {
    case "css":
      return locateElementByCss(string);
    case "id":
      return locateElementById(string);
    case "xpath":
      return locateElementByXPath(string);
    case "name":
      return locateElementByName(string);
    case "linkText":
      return locateElementByLinkText(string);
    default:
      return locateElementByCss(string);
  }
}
