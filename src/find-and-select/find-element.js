// mostly copied from selenium-ide
// Look for BrowserBot.filterFunctions inside selenium-browserbots.js
// And selenium-api.js

function filterByName(name, elements) {
  let selectedElements = [];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].name === name) {
      selectedElements.push(elements[i]);
    }
  }
  return selectedElements;
}

function filterByValue(value, elements) {
  let selectedElements = [];
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].value === value) {
      selectedElements.push(elements[i]);
    }
  }
  return selectedElements;
}

function filterByIndex(index, elements) {
  index = Number(index);
  if (isNaN(index) || index < 0) {
    throw new Error("Illegaj Index: " + index);
  }
  if (elements.length <= index) {
    throw new Error("Index out of range: " + index);
  }

  return [elements[index]];
}

function selectElementsBy(filterType, filter, elements) {
  switch (filterType) {
    case "name":
      return filterByName(filter, elements);
    case "value":
      return filterByValue(filter, elements);
    case "index":
      return filterByIndex(filter, elements);
    default:
      return null;
  }
}

function selectElements(filterExpr, elements, defaultFilterType) {
  let filterType = defaultFilterType || "value";

  // If there is a filter prefix, use the specified strategy
  let result = filterExpr.match(/^([A-Za-z]+)=(.+)/);
  if (result) {
    filterType = result[1].toLowerCase();
    filterExpr = result[2];
  }

  return selectElementsBy(filterType, filterExpr, elements);
}

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
  elements = selectElements(filter, elements, "value");

  if (elements.length > 0) {
    return elements[0];
  }

  console.log("locateElementByName: selectElements did not find any element");
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
