/* eslint no-unused-vars: off, no-useless-escape: off */
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

// import browser from "webextension-polyfill";
const LocatorBuilders = require("./locator-builders");
const { isTest, isFirefox } = require("./utils");

const locatorBuilders = new LocatorBuilders(window);
const handlers = [];
const observers = [];

function eventIsTrusted(event) {
  return isTest ? true : event.isTrusted;
}

handlers.push([
  "type",
  "change",
  function (event) {
    // © Chen-Chieh Ping, SideeX Team
    if (
      event.target.tagName &&
      !this.recordingState.preventType &&
      this.recordingState.typeLock == 0 &&
      (this.recordingState.typeLock = 1)
    ) {
      // END
      let tagName = event.target.tagName.toLowerCase();
      let type = event.target.type;
      if ("input" == tagName && this.inputTypes.indexOf(type) >= 0) {
        if (event.target.value.length > 0) {
          this.record(
            "type",
            locatorBuilders.buildAll(event.target),
            event.target.value
          );

          // © Chen-Chieh Ping, SideeX Team
          if (this.recordingState.enterTarget != null) {
            let tempTarget = event.target.parentElement;
            let formChk = tempTarget.tagName.toLowerCase();
            while (formChk != "form" && formChk != "body") {
              tempTarget = tempTarget.parentElement;
              formChk = tempTarget.tagName.toLowerCase();
            }

            this.record(
              "sendKeys",
              locatorBuilders.buildAll(this.recordingState.enterTarget),
              "${KEY_ENTER}"
            );
            this.recordingState.enterTarget = null;
          }
          // END
        } else {
          this.record(
            "type",
            locatorBuilders.buildAll(event.target),
            event.target.value
          );
        }
      } else if ("textarea" == tagName) {
        this.record(
          "type",
          locatorBuilders.buildAll(event.target),
          event.target.value
        );
      }
    }
    this.recordingState.typeLock = 0;
  },
]);

handlers.push([
  "type",
  "input",
  function (event) {
    this.recordingState.typeTarget = event.target;
  },
]);

// © Jie-Lin You, SideeX Team
handlers.push([
  "clickAt",
  "click",
  function (event) {
    if (
      event.button == 0 &&
      !this.recordingState.preventClick &&
      eventIsTrusted(event)
    ) {
      if (!this.recordingState.preventClickTwice) {
        this.record("click", locatorBuilders.buildAll(event.target), "");
        this.recordingState.preventClickTwice = true;
      }
      setTimeout(() => {
        this.recordingState.preventClickTwice = false;
      }, 30);
    }
  },
  true,
]);
// END

// © Chen-Chieh Ping, SideeX Team
handlers.push([
  "doubleClickAt",
  "dblclick",
  function (event) {
    this.record("doubleClick", locatorBuilders.buildAll(event.target), "");
  },
  true,
]);
// END

handlers.push([
  "sendKeys",
  "keydown",
  function (event) {
    if (event.target.tagName) {
      let key = event.keyCode;
      let tagName = event.target.tagName.toLowerCase();
      let type = event.target.type;
      if (tagName == "input" && this.inputTypes.indexOf(type) >= 0) {
        if (key == 13) {
          this.recordingState.enterTarget = event.target;
          this.recordingState.enterValue = this.recordingState.enterTarget.value;
          let tempTarget = event.target.parentElement;
          let formChk = tempTarget.tagName.toLowerCase();
          if (
            this.recordingState.tempValue ==
              this.recordingState.enterTarget.value &&
            this.recordingState.tabCheck == this.recordingState.enterTarget
          ) {
            this.record(
              "sendKeys",
              locatorBuilders.buildAll(this.recordingState.enterTarget),
              "${KEY_ENTER}"
            );
            this.recordingState.enterTarget = null;
            this.recordingState.preventType = true;
          } else if (
            this.recordingState.focusValue == this.recordingState.enterValue
          ) {
            while (formChk != "form" && formChk != "body") {
              tempTarget = tempTarget.parentElement;
              formChk = tempTarget.tagName.toLowerCase();
            }
            this.record(
              "sendKeys",
              locatorBuilders.buildAll(this.recordingState.enterTarget),
              "${KEY_ENTER}"
            );
            this.recordingState.enterTarget = null;
          }
          if (
            this.recordingState.typeTarget &&
            this.recordingState.typeTarget.tagName &&
            !this.recordingState.preventType &&
            (this.recordingState.typeLock = 1)
          ) {
            // END
            tagName = this.recordingState.typeTarget.tagName.toLowerCase();
            type = this.recordingState.typeTarget.type;
            if ("input" == tagName && this.inputTypes.indexOf(type) >= 0) {
              if (this.recordingState.typeTarget.value.length > 0) {
                this.record(
                  "type",
                  locatorBuilders.buildAll(this.recordingState.typeTarget),
                  this.recordingState.typeTarget.value
                );

                // © Chen-Chieh Ping, SideeX Team
                if (this.recordingState.enterTarget != null) {
                  tempTarget = this.recordingState.typeTarget.parentElement;
                  formChk = tempTarget.tagName.toLowerCase();
                  while (formChk != "form" && formChk != "body") {
                    tempTarget = tempTarget.parentElement;
                    formChk = tempTarget.tagName.toLowerCase();
                  }
                  this.record(
                    "sendKeys",
                    locatorBuilders.buildAll(this.recordingState.enterTarget),
                    "${KEY_ENTER}"
                  );
                  this.recordingState.enterTarget = null;
                }
                // END
              } else {
                this.record(
                  "type",
                  locatorBuilders.buildAll(this.recordingState.typeTarget),
                  this.recordingState.typeTarget.value
                );
              }
            } else if ("textarea" == tagName) {
              this.record(
                "type",
                locatorBuilders.buildAll(this.recordingState.typeTarget),
                this.recordingState.typeTarget.value
              );
            }
          }
          this.recordingState.preventClick = true;
          setTimeout(() => {
            this.recordingState.preventClick = false;
          }, 500);
          setTimeout(() => {
            if (this.recordingState.enterValue != event.target.value)
              this.recordingState.enterTarget = null;
          }, 50);
        }

        let tempbool = false;
        if ((key == 38 || key == 40) && event.target.value != "") {
          if (
            this.recordingState.focusTarget != null &&
            this.recordingState.focusTarget.value !=
              this.recordingState.tempValue
          ) {
            tempbool = true;
            this.recordingState.tempValue = this.recordingState.focusTarget.value;
          }
          if (tempbool) {
            this.record(
              "type",
              locatorBuilders.buildAll(event.target),
              this.recordingState.tempValue
            );
          }

          setTimeout(() => {
            this.recordingState.tempValue = this.recordingState.focusTarget.value;
          }, 250);

          if (key == 38)
            this.record(
              "sendKeys",
              locatorBuilders.buildAll(event.target),
              "${KEY_UP}"
            );
          else
            this.record(
              "sendKeys",
              locatorBuilders.buildAll(event.target),
              "${KEY_DOWN}"
            );
          this.recordingState.tabCheck = event.target;
        }
        if (key == 9) {
          if (this.recordingState.tabCheck == event.target) {
            this.record(
              "sendKeys",
              locatorBuilders.buildAll(event.target),
              "${KEY_TAB}"
            );
            this.recordingState.preventType = true;
          }
        }
      }
    }
  },
  true,
]);
// END

let mousedown,
  mouseup,
  selectMouseup,
  selectMousedown,
  mouseoverQ,
  clickLocator;
// © Shuo-Heng Shih, SideeX Team
handlers.push([
  "dragAndDrop",
  "mousedown",
  function (event) {
    if (
      event.clientX < window.document.documentElement.clientWidth &&
      event.clientY < window.document.documentElement.clientHeight
    ) {
      mousedown = event;
      mouseup = setTimeout(() => {
        mousedown = undefined;
      }, 200);

      selectMouseup = setTimeout(() => {
        selectMousedown = event;
      }, 200);
    }
    mouseoverQ = [];

    if (event.target.nodeName) {
      let tagName = event.target.nodeName.toLowerCase();
      if ("option" == tagName) {
        let parent = event.target.parentNode;
        if (parent.multiple) {
          let options = parent.options;
          for (let i = 0; i < options.length; i++) {
            options[i]._wasSelected = options[i].selected;
          }
        }
      }
    }
  },
  true,
]);
// END

// © Shuo-Heng Shih, SideeX Team
handlers.push([
  "dragAndDrop",
  "mouseup",
  function (event) {
    function getSelectionText() {
      let text = "";
      let activeEl = window.document.activeElement;
      let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
      if (activeElTagName == "textarea" || activeElTagName == "input") {
        text = activeEl.value.slice(
          activeEl.selectionStart,
          activeEl.selectionEnd
        );
      } else if (window.getSelection) {
        text = window.getSelection().toString();
      }
      return text.trim();
    }
    clearTimeout(selectMouseup);
    if (selectMousedown) {
      let x = event.clientX - selectMousedown.clientX;
      let y = event.clientY - selectMousedown.clientY;

      if (
        selectMousedown &&
        event.button === 0 &&
        x + y &&
        event.clientX < window.document.documentElement.clientWidth &&
        event.clientY < window.document.documentElement.clientHeight &&
        getSelectionText() === ""
      ) {
        let sourceRelateX =
          selectMousedown.pageX -
          selectMousedown.target.getBoundingClientRect().left -
          window.scrollX;
        let sourceRelateY =
          selectMousedown.pageY -
          selectMousedown.target.getBoundingClientRect().top -
          window.scrollY;
        let targetRelateX, targetRelateY;
        if (
          !!mouseoverQ.length &&
          mouseoverQ[1].relatedTarget == mouseoverQ[0].target &&
          mouseoverQ[0].target == event.target
        ) {
          targetRelateX =
            event.pageX -
            mouseoverQ[1].target.getBoundingClientRect().left -
            window.scrollX;
          targetRelateY =
            event.pageY -
            mouseoverQ[1].target.getBoundingClientRect().top -
            window.scrollY;
          this.record(
            "mouseDownAt",
            locatorBuilders.buildAll(selectMousedown.target),
            sourceRelateX + "," + sourceRelateY
          );
          this.record(
            "mouseMoveAt",
            locatorBuilders.buildAll(mouseoverQ[1].target),
            targetRelateX + "," + targetRelateY
          );
          this.record(
            "mouseUpAt",
            locatorBuilders.buildAll(mouseoverQ[1].target),
            targetRelateX + "," + targetRelateY
          );
        } else {
          targetRelateX =
            event.pageX -
            event.target.getBoundingClientRect().left -
            window.scrollX;
          targetRelateY =
            event.pageY -
            event.target.getBoundingClientRect().top -
            window.scrollY;
          this.record(
            "mouseDownAt",
            locatorBuilders.buildAll(event.target),
            targetRelateX + "," + targetRelateY
          );
          this.record(
            "mouseMoveAt",
            locatorBuilders.buildAll(event.target),
            targetRelateX + "," + targetRelateY
          );
          this.record(
            "mouseUpAt",
            locatorBuilders.buildAll(event.target),
            targetRelateX + "," + targetRelateY
          );
        }
      }
    } else {
      clickLocator = undefined;
      mouseup = undefined;
      let x = event.clientX - mousedown.clientX;
      let y = event.clientY - mousedown.clientY;

      if (mousedown && mousedown.target !== event.target && !(x + y)) {
        this.record(
          "mouseDown",
          locatorBuilders.buildAll(mousedown.target),
          ""
        );
        this.record("mouseUp", locatorBuilders.buildAll(event.target), "");
      } else if (mousedown && mousedown.target === event.target) {
        let target = locatorBuilders.buildAll(mousedown.target);
        // setTimeout(function() {
        //     if (!self.clickLocator)
        //         this.record("click", target, '');
        // }.bind(this), 100);
      }
    }
    mousedown = undefined;
    selectMousedown = undefined;
    mouseoverQ = undefined;
  },
  true,
]);
// END

let dropLocator, dragstartLocator;
// © Shuo-Heng Shih, SideeX Team
handlers.push([
  "dragAndDropToObject",
  "dragstart",
  function (event) {
    dropLocator = setTimeout(() => {
      dragstartLocator = event;
    }, 200);
  },
  true,
]);
// END

// © Shuo-Heng Shih, SideeX Team
handlers.push([
  "dragAndDropToObject",
  "drop",
  function (event) {
    clearTimeout(dropLocator);
    if (
      dragstartLocator &&
      event.button == 0 &&
      dragstartLocator.target !== event.target
    ) {
      //value no option
      this.record(
        "dragAndDropToObject",
        locatorBuilders.buildAll(dragstartLocator.target),
        locatorBuilders.buildAll(event.target)
      );
    }
    dragstartLocator = undefined;
    selectMousedown = undefined;
  },
  true,
]);
// END

// © Shuo-Heng Shih, SideeX Team
let prevTimeOut = null,
  scrollDetector;
handlers.push([
  "runScript",
  "scroll",
  function (event) {
    if (pageLoaded === true) {
      scrollDetector = event.target;
      clearTimeout(prevTimeOut);
      prevTimeOut = setTimeout(() => {
        scrollDetector = undefined;
      }, 500);
    }
  },
  true,
]);
// END

// © Shuo-Heng Shih, SideeX Team
let nowNode = 0,
  mouseoverLocator,
  nodeInsertedLocator,
  nodeInsertedAttrChange;
handlers.push([
  "mouseOver",
  "mouseover",
  function (event) {
    if (window.document.documentElement)
      nowNode = window.document.documentElement.getElementsByTagName("*")
        .length;
    if (pageLoaded === true) {
      let clickable = findClickableElement(event.target);
      if (clickable) {
        nodeInsertedLocator = event.target;
        nodeInsertedAttrChange = locatorBuilders.buildAll(event.target);
        setTimeout(() => {
          nodeInsertedLocator = undefined;
          nodeInsertedAttrChange = undefined;
        }, 500);
      }
      //drop target overlapping
      if (mouseoverQ) {
        //mouse keep down
        if (mouseoverQ.length >= 3) mouseoverQ.shift();
        mouseoverQ.push(event);
      }
    }
  },
  true,
]);
// END

let mouseoutLocator = undefined;
// © Shuo-Heng Shih, SideeX Team
handlers.push([
  "mouseOut",
  "mouseout",
  function (event) {
    if (mouseoutLocator !== null && event.target === mouseoutLocator) {
      this.record("mouseOut", locatorBuilders.buildAll(event.target), "");
    }
    mouseoutLocator = undefined;
  },
  true,
]);
// END

observers.push([
  "FrameDeleted",
  function (mutations) {
    mutations.forEach(async (mutation) => {
      const removedNodes = await mutation.removedNodes;
      if (removedNodes.length && removedNodes[0].nodeName === "IFRAME") {
        browser.runtime.sendMessage({ frameRemoved: true }).catch(() => {});
      }
    });
  },
  { childList: true },
]);

observers.push([
  "DOMNodeInserted",
  function (mutations) {
    if (
      pageLoaded === true &&
      window.document.documentElement.getElementsByTagName("*").length > nowNode
    ) {
      // Get list of inserted nodes from the mutations list to simulate 'DOMNodeInserted'.
      const insertedNodes = mutations.reduce((nodes, mutation) => {
        if (mutation.type === "childList") {
          nodes.push.apply(nodes, mutation.addedNodes);
        }
        return nodes;
      }, []);
      // If no nodes inserted, just bail.
      if (!insertedNodes.length) {
        return;
      }

      if (scrollDetector) {
        //TODO: fix target
        this.record(
          "runScript",
          "window.scrollTo(0," + window.scrollY + ")",
          ""
        );
        pageLoaded = false;
        setTimeout(() => {
          pageLoaded = true;
        }, 550);
        scrollDetector = undefined;
        nodeInsertedLocator = undefined;
      }
      if (nodeInsertedLocator) {
        this.record("mouseOver", nodeInsertedAttrChange, "");
        mouseoutLocator = nodeInsertedLocator;
        nodeInsertedLocator = undefined;
        nodeInsertedAttrChange = undefined;
        mouseoverLocator = undefined;
      }
    }
  },
  { childList: true, subtree: true },
]);

// © Shuo-Heng Shih, SideeX Team
let readyTimeOut = null;
let pageLoaded = true;
handlers.push([
  "checkPageLoaded",
  "readystatechange",
  function (event) {
    if (window.document.readyState === "loading") {
      pageLoaded = false;
    } else {
      pageLoaded = false;
      clearTimeout(readyTimeOut);
      readyTimeOut = setTimeout(() => {
        pageLoaded = true;
      }, 1500); //setReady after complete 1.5s
    }
  },
  true,
]);
// END

// © Yun-Wen Lin, SideeX Team
let getEle;
let checkFocus = 0;
let contentTest;
handlers.push([
  "editContent",
  "focus",
  function (event) {
    let editable = event.target.contentEditable;
    if (editable == "true") {
      getEle = event.target;
      contentTest = getEle.innerHTML;
      checkFocus = 1;
    }
  },
  true,
]);
// END

// © Yun-Wen Lin, SideeX Team
handlers.push([
  "editContent",
  "blur",
  function (event) {
    if (checkFocus == 1) {
      if (event.target == getEle) {
        if (getEle.innerHTML != contentTest) {
          this.record(
            "editContent",
            locatorBuilders.buildAll(event.target),
            getEle.innerHTML
          );
        }
        checkFocus = 0;
      }
    }
  },
  true,
]);
// END

function findClickableElement(e) {
  if (!e.tagName) return null;
  let tagName = e.tagName.toLowerCase();
  let type = e.type;
  if (
    e.hasAttribute("onclick") ||
    e.hasAttribute("href") ||
    tagName == "button" ||
    (tagName == "input" &&
      (type == "submit" ||
        type == "button" ||
        type == "image" ||
        type == "radio" ||
        type == "checkbox" ||
        type == "reset"))
  ) {
    return e;
  } else {
    if (e.parentNode != null) {
      return findClickableElement(e.parentNode);
    } else {
      return null;
    }
  }
}

//select / addSelect / removeSelect
handlers.push([
  "select",
  "focus",
  function (event) {
    if (event.target.nodeName) {
      let tagName = event.target.nodeName.toLowerCase();
      if ("select" == tagName && event.target.multiple) {
        let options = event.target.options;
        for (let i = 0; i < options.length; i++) {
          if (options[i]._wasSelected == null) {
            // is the focus was gained by mousedown event, _wasSelected would be already set
            options[i]._wasSelected = options[i].selected;
          }
        }
      }
    }
  },
  true,
]);

handlers.push([
  "select",
  "change",
  function (event) {
    if (event.target.tagName) {
      let tagName = event.target.tagName.toLowerCase();
      if ("select" == tagName) {
        if (!event.target.multiple) {
          let option = event.target.options[event.target.selectedIndex];
          this.record(
            "select",
            locatorBuilders.buildAll(event.target),
            getOptionLocator(option)
          );
        } else {
          let options = event.target.options;
          for (let i = 0; i < options.length; i++) {
            if (options[i]._wasSelected != options[i].selected) {
              let value = getOptionLocator(options[i]);
              if (options[i].selected) {
                this.record(
                  "addSelection",
                  locatorBuilders.buildAll(event.target),
                  value
                );
              } else {
                this.record(
                  "removeSelection",
                  locatorBuilders.buildAll(event.target),
                  value
                );
              }
              options[i]._wasSelected = options[i].selected;
            }
          }
        }
      }
    }
  },
]);

function getOptionLocator(option) {
  let label = option.text.replace(/^ *(.*?) *$/, "$1");
  if (label.match(/\xA0/)) {
    // if the text contains &nbsp;
    return (
      "label=regexp:" +
      label
        .replace(/[(\)\[\]\\\^\$\*\+\?\.\|\{\}]/g, function (str) {
          // eslint-disable-line no-useless-escape
          return "\\" + str;
        })
        .replace(/\s+/g, function (str) {
          if (str.match(/\xA0/)) {
            if (str.length > 1) {
              return "\\s+";
            } else {
              return "\\s";
            }
          } else {
            return str;
          }
        })
    );
  } else {
    return "label=" + label;
  }
}

module.exports = {
  handlers,
  observers,
};
