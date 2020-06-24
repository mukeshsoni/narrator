/* eslint-disable */
// GENERATED CODE - DO NOT EDIT
module.exports = function () {
  return function () {
    var k = this;
    function l(a) {
      return void 0 !== a;
    }
    function n(a) {
      return "string" == typeof a;
    }
    function aa(a, b) {
      a = a.split(".");
      var c = k;
      a[0] in c || !c.execScript || c.execScript("var " + a[0]);
      for (var d; a.length && (d = a.shift()); )
        !a.length && l(b)
          ? (c[d] = b)
          : c[d] && c[d] !== Object.prototype[d]
          ? (c = c[d])
          : (c = c[d] = {});
    }
    function ba(a) {
      var b = typeof a;
      if ("object" == b)
        if (a) {
          if (a instanceof Array) return "array";
          if (a instanceof Object) return b;
          var c = Object.prototype.toString.call(a);
          if ("[object Window]" == c) return "object";
          if (
            "[object Array]" == c ||
            ("number" == typeof a.length &&
              "undefined" != typeof a.splice &&
              "undefined" != typeof a.propertyIsEnumerable &&
              !a.propertyIsEnumerable("splice"))
          )
            return "array";
          if (
            "[object Function]" == c ||
            ("undefined" != typeof a.call &&
              "undefined" != typeof a.propertyIsEnumerable &&
              !a.propertyIsEnumerable("call"))
          )
            return "function";
        } else return "null";
      else if ("function" == b && "undefined" == typeof a.call) return "object";
      return b;
    }
    function ca(a) {
      return "function" == ba(a);
    }
    function da(a) {
      var b = typeof a;
      return ("object" == b && null != a) || "function" == b;
    }
    function fa(a, b, c) {
      return a.call.apply(a.bind, arguments);
    }
    function ha(a, b, c) {
      if (!a) throw Error();
      if (2 < arguments.length) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function () {
          var c = Array.prototype.slice.call(arguments);
          Array.prototype.unshift.apply(c, d);
          return a.apply(b, c);
        };
      }
      return function () {
        return a.apply(b, arguments);
      };
    }
    function ia(a, b, c) {
      Function.prototype.bind &&
      -1 != Function.prototype.bind.toString().indexOf("native code")
        ? (ia = fa)
        : (ia = ha);
      return ia.apply(null, arguments);
    }
    function ja(a, b) {
      var c = Array.prototype.slice.call(arguments, 1);
      return function () {
        var b = c.slice();
        b.push.apply(b, arguments);
        return a.apply(this, b);
      };
    }
    function p(a, b) {
      function c() {}
      c.prototype = b.prototype;
      a.U = b.prototype;
      a.prototype = new c();
      a.prototype.constructor = a;
      a.T = function (a, c, f) {
        for (
          var d = Array(arguments.length - 2), e = 2;
          e < arguments.length;
          e++
        )
          d[e - 2] = arguments[e];
        return b.prototype[c].apply(a, d);
      };
    }
    var ka = window;
    function q(a, b) {
      this.code = a;
      this.a = r[a] || la;
      this.message = b || "";
      a = this.a.replace(/((?:^|\s+)[a-z])/g, function (a) {
        return a.toUpperCase().replace(/^[\s\xa0]+/g, "");
      });
      b = a.length - 5;
      if (0 > b || a.indexOf("Error", b) != b) a += "Error";
      this.name = a;
      a = Error(this.message);
      a.name = this.name;
      this.stack = a.stack || "";
    }
    p(q, Error);
    var la = "unknown error",
      r = { 15: "element not selectable", 11: "element not visible" };
    r[31] = la;
    r[30] = la;
    r[24] = "invalid cookie domain";
    r[29] = "invalid element coordinates";
    r[12] = "invalid element state";
    r[32] = "invalid selector";
    r[51] = "invalid selector";
    r[52] = "invalid selector";
    r[17] = "javascript error";
    r[405] = "unsupported operation";
    r[34] = "move target out of bounds";
    r[27] = "no such alert";
    r[7] = "no such element";
    r[8] = "no such frame";
    r[23] = "no such window";
    r[28] = "script timeout";
    r[33] = "session not created";
    r[10] = "stale element reference";
    r[21] = "timeout";
    r[25] = "unable to set cookie";
    r[26] = "unexpected alert open";
    r[13] = la;
    r[9] = "unknown command";
    q.prototype.toString = function () {
      return this.name + ": " + this.message;
    };
    var ma = {
      aliceblue: "#f0f8ff",
      antiquewhite: "#faebd7",
      aqua: "#00ffff",
      aquamarine: "#7fffd4",
      azure: "#f0ffff",
      beige: "#f5f5dc",
      bisque: "#ffe4c4",
      black: "#000000",
      blanchedalmond: "#ffebcd",
      blue: "#0000ff",
      blueviolet: "#8a2be2",
      brown: "#a52a2a",
      burlywood: "#deb887",
      cadetblue: "#5f9ea0",
      chartreuse: "#7fff00",
      chocolate: "#d2691e",
      coral: "#ff7f50",
      cornflowerblue: "#6495ed",
      cornsilk: "#fff8dc",
      crimson: "#dc143c",
      cyan: "#00ffff",
      darkblue: "#00008b",
      darkcyan: "#008b8b",
      darkgoldenrod: "#b8860b",
      darkgray: "#a9a9a9",
      darkgreen: "#006400",
      darkgrey: "#a9a9a9",
      darkkhaki: "#bdb76b",
      darkmagenta: "#8b008b",
      darkolivegreen: "#556b2f",
      darkorange: "#ff8c00",
      darkorchid: "#9932cc",
      darkred: "#8b0000",
      darksalmon: "#e9967a",
      darkseagreen: "#8fbc8f",
      darkslateblue: "#483d8b",
      darkslategray: "#2f4f4f",
      darkslategrey: "#2f4f4f",
      darkturquoise: "#00ced1",
      darkviolet: "#9400d3",
      deeppink: "#ff1493",
      deepskyblue: "#00bfff",
      dimgray: "#696969",
      dimgrey: "#696969",
      dodgerblue: "#1e90ff",
      firebrick: "#b22222",
      floralwhite: "#fffaf0",
      forestgreen: "#228b22",
      fuchsia: "#ff00ff",
      gainsboro: "#dcdcdc",
      ghostwhite: "#f8f8ff",
      gold: "#ffd700",
      goldenrod: "#daa520",
      gray: "#808080",
      green: "#008000",
      greenyellow: "#adff2f",
      grey: "#808080",
      honeydew: "#f0fff0",
      hotpink: "#ff69b4",
      indianred: "#cd5c5c",
      indigo: "#4b0082",
      ivory: "#fffff0",
      khaki: "#f0e68c",
      lavender: "#e6e6fa",
      lavenderblush: "#fff0f5",
      lawngreen: "#7cfc00",
      lemonchiffon: "#fffacd",
      lightblue: "#add8e6",
      lightcoral: "#f08080",
      lightcyan: "#e0ffff",
      lightgoldenrodyellow: "#fafad2",
      lightgray: "#d3d3d3",
      lightgreen: "#90ee90",
      lightgrey: "#d3d3d3",
      lightpink: "#ffb6c1",
      lightsalmon: "#ffa07a",
      lightseagreen: "#20b2aa",
      lightskyblue: "#87cefa",
      lightslategray: "#778899",
      lightslategrey: "#778899",
      lightsteelblue: "#b0c4de",
      lightyellow: "#ffffe0",
      lime: "#00ff00",
      limegreen: "#32cd32",
      linen: "#faf0e6",
      magenta: "#ff00ff",
      maroon: "#800000",
      mediumaquamarine: "#66cdaa",
      mediumblue: "#0000cd",
      mediumorchid: "#ba55d3",
      mediumpurple: "#9370db",
      mediumseagreen: "#3cb371",
      mediumslateblue: "#7b68ee",
      mediumspringgreen: "#00fa9a",
      mediumturquoise: "#48d1cc",
      mediumvioletred: "#c71585",
      midnightblue: "#191970",
      mintcream: "#f5fffa",
      mistyrose: "#ffe4e1",
      moccasin: "#ffe4b5",
      navajowhite: "#ffdead",
      navy: "#000080",
      oldlace: "#fdf5e6",
      olive: "#808000",
      olivedrab: "#6b8e23",
      orange: "#ffa500",
      orangered: "#ff4500",
      orchid: "#da70d6",
      palegoldenrod: "#eee8aa",
      palegreen: "#98fb98",
      paleturquoise: "#afeeee",
      palevioletred: "#db7093",
      papayawhip: "#ffefd5",
      peachpuff: "#ffdab9",
      peru: "#cd853f",
      pink: "#ffc0cb",
      plum: "#dda0dd",
      powderblue: "#b0e0e6",
      purple: "#800080",
      red: "#ff0000",
      rosybrown: "#bc8f8f",
      royalblue: "#4169e1",
      saddlebrown: "#8b4513",
      salmon: "#fa8072",
      sandybrown: "#f4a460",
      seagreen: "#2e8b57",
      seashell: "#fff5ee",
      sienna: "#a0522d",
      silver: "#c0c0c0",
      skyblue: "#87ceeb",
      slateblue: "#6a5acd",
      slategray: "#708090",
      slategrey: "#708090",
      snow: "#fffafa",
      springgreen: "#00ff7f",
      steelblue: "#4682b4",
      tan: "#d2b48c",
      teal: "#008080",
      thistle: "#d8bfd8",
      tomato: "#ff6347",
      turquoise: "#40e0d0",
      violet: "#ee82ee",
      wheat: "#f5deb3",
      white: "#ffffff",
      whitesmoke: "#f5f5f5",
      yellow: "#ffff00",
      yellowgreen: "#9acd32",
    };
    var na;
    function oa(a, b) {
      this.width = a;
      this.height = b;
    }
    oa.prototype.toString = function () {
      return "(" + this.width + " x " + this.height + ")";
    };
    oa.prototype.aspectRatio = function () {
      return this.width / this.height;
    };
    oa.prototype.ceil = function () {
      this.width = Math.ceil(this.width);
      this.height = Math.ceil(this.height);
      return this;
    };
    oa.prototype.floor = function () {
      this.width = Math.floor(this.width);
      this.height = Math.floor(this.height);
      return this;
    };
    oa.prototype.round = function () {
      this.width = Math.round(this.width);
      this.height = Math.round(this.height);
      return this;
    };
    function pa(a, b) {
      var c = qa;
      return Object.prototype.hasOwnProperty.call(c, a) ? c[a] : (c[a] = b(a));
    }
    function ra(a) {
      var b = a.length - 1;
      return 0 <= b && a.indexOf(" ", b) == b;
    }
    var sa = String.prototype.trim
      ? function (a) {
          return a.trim();
        }
      : function (a) {
          return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
        };
    function ta(a, b) {
      var c = 0;
      a = sa(String(a)).split(".");
      b = sa(String(b)).split(".");
      for (var d = Math.max(a.length, b.length), e = 0; 0 == c && e < d; e++) {
        var f = a[e] || "",
          g = b[e] || "";
        do {
          f = /(\d*)(\D*)(.*)/.exec(f) || ["", "", "", ""];
          g = /(\d*)(\D*)(.*)/.exec(g) || ["", "", "", ""];
          if (0 == f[0].length && 0 == g[0].length) break;
          c =
            ua(
              0 == f[1].length ? 0 : parseInt(f[1], 10),
              0 == g[1].length ? 0 : parseInt(g[1], 10)
            ) ||
            ua(0 == f[2].length, 0 == g[2].length) ||
            ua(f[2], g[2]);
          f = f[3];
          g = g[3];
        } while (0 == c);
      }
      return c;
    }
    function ua(a, b) {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    function va(a) {
      return String(a).replace(/\-([a-z])/g, function (a, c) {
        return c.toUpperCase();
      });
    } /*

 The MIT License

 Copyright (c) 2007 Cybozu Labs, Inc.
 Copyright (c) 2012 Google Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/
    function wa(a, b, c) {
      this.a = a;
      this.b = b || 1;
      this.f = c || 1;
    }
    function xa(a) {
      this.b = a;
      this.a = 0;
    }
    function ya(a) {
      a = a.match(za);
      for (var b = 0; b < a.length; b++) Ba.test(a[b]) && a.splice(b, 1);
      return new xa(a);
    }
    var za = /\$?(?:(?![0-9-\.])(?:\*|[\w-\.]+):)?(?![0-9-\.])(?:\*|[\w-\.]+)|\/\/|\.\.|::|\d+(?:\.\d*)?|\.\d+|"[^"]*"|'[^']*'|[!<>]=|\s+|./g,
      Ba = /^\s/;
    function u(a, b) {
      return a.b[a.a + (b || 0)];
    }
    function w(a) {
      return a.b[a.a++];
    }
    function Ca(a) {
      return a.b.length <= a.a;
    }
    var Da = {
      o: function (a, b) {
        if ("" === a)
          throw new q(32, 'Unable to locate an element with the tagName ""');
        return b.getElementsByTagName(a)[0] || null;
      },
      s: function (a, b) {
        if ("" === a)
          throw new q(32, 'Unable to locate an element with the tagName ""');
        return b.getElementsByTagName(a);
      },
    };
    var x;
    a: {
      var Ea = k.navigator;
      if (Ea) {
        var Fa = Ea.userAgent;
        if (Fa) {
          x = Fa;
          break a;
        }
      }
      x = "";
    }
    function y(a) {
      return -1 != x.indexOf(a);
    }
    function z(a, b) {
      this.h = a;
      this.c = l(b) ? b : null;
      this.b = null;
      switch (a) {
        case "comment":
          this.b = 8;
          break;
        case "text":
          this.b = 3;
          break;
        case "processing-instruction":
          this.b = 7;
          break;
        case "node":
          break;
        default:
          throw Error("Unexpected argument");
      }
    }
    function Ga(a) {
      return (
        "comment" == a ||
        "text" == a ||
        "processing-instruction" == a ||
        "node" == a
      );
    }
    z.prototype.a = function (a) {
      return null === this.b || this.b == a.nodeType;
    };
    z.prototype.f = function () {
      return this.h;
    };
    z.prototype.toString = function () {
      var a = "Kind Test: " + this.h;
      null === this.c || (a += A(this.c));
      return a;
    };
    function Ha(a, b) {
      this.j = a.toLowerCase();
      a = "*" == this.j ? "*" : "http://www.w3.org/1999/xhtml";
      this.c = b ? b.toLowerCase() : a;
    }
    Ha.prototype.a = function (a) {
      var b = a.nodeType;
      if (1 != b && 2 != b) return !1;
      b = l(a.localName) ? a.localName : a.nodeName;
      return "*" != this.j && this.j != b.toLowerCase()
        ? !1
        : "*" == this.c
        ? !0
        : this.c ==
          (a.namespaceURI
            ? a.namespaceURI.toLowerCase()
            : "http://www.w3.org/1999/xhtml");
    };
    Ha.prototype.f = function () {
      return this.j;
    };
    Ha.prototype.toString = function () {
      return (
        "Name Test: " +
        ("http://www.w3.org/1999/xhtml" == this.c ? "" : this.c + ":") +
        this.j
      );
    };
    function Ia(a) {
      switch (a.nodeType) {
        case 1:
          return ja(Ja, a);
        case 9:
          return Ia(a.documentElement);
        case 11:
        case 10:
        case 6:
        case 12:
          return Ka;
        default:
          return a.parentNode ? Ia(a.parentNode) : Ka;
      }
    }
    function Ka() {
      return null;
    }
    function Ja(a, b) {
      if (a.prefix == b)
        return a.namespaceURI || "http://www.w3.org/1999/xhtml";
      var c = a.getAttributeNode("xmlns:" + b);
      return c && c.specified
        ? c.value || null
        : a.parentNode && 9 != a.parentNode.nodeType
        ? Ja(a.parentNode, b)
        : null;
    }
    function La(a, b) {
      if (n(a)) return n(b) && 1 == b.length ? a.indexOf(b, 0) : -1;
      for (var c = 0; c < a.length; c++) if (c in a && a[c] === b) return c;
      return -1;
    }
    function B(a, b) {
      for (var c = a.length, d = n(a) ? a.split("") : a, e = 0; e < c; e++)
        e in d && b.call(void 0, d[e], e, a);
    }
    function Ma(a, b) {
      for (
        var c = a.length, d = [], e = 0, f = n(a) ? a.split("") : a, g = 0;
        g < c;
        g++
      )
        if (g in f) {
          var h = f[g];
          b.call(void 0, h, g, a) && (d[e++] = h);
        }
      return d;
    }
    function Na(a, b, c) {
      var d = c;
      B(a, function (c, f) {
        d = b.call(void 0, d, c, f, a);
      });
      return d;
    }
    function Oa(a, b) {
      for (var c = a.length, d = n(a) ? a.split("") : a, e = 0; e < c; e++)
        if (e in d && b.call(void 0, d[e], e, a)) return !0;
      return !1;
    }
    function Pa(a, b) {
      for (var c = a.length, d = n(a) ? a.split("") : a, e = 0; e < c; e++)
        if (e in d && !b.call(void 0, d[e], e, a)) return !1;
      return !0;
    }
    function Qa(a, b) {
      a: {
        for (var c = a.length, d = n(a) ? a.split("") : a, e = 0; e < c; e++)
          if (e in d && b.call(void 0, d[e], e, a)) {
            b = e;
            break a;
          }
        b = -1;
      }
      return 0 > b ? null : n(a) ? a.charAt(b) : a[b];
    }
    function Ra(a) {
      return Array.prototype.concat.apply([], arguments);
    }
    function Sa(a, b, c) {
      return 2 >= arguments.length
        ? Array.prototype.slice.call(a, b)
        : Array.prototype.slice.call(a, b, c);
    }
    function Ta() {
      return y("iPhone") && !y("iPod") && !y("iPad");
    }
    var Ua = "backgroundColor borderTopColor borderRightColor borderBottomColor borderLeftColor color outlineColor".split(
        " "
      ),
      Va = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/,
      Wa = /^#(?:[0-9a-f]{3}){1,2}$/i,
      Xa = /^(?:rgba)?\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3}),\s?(0|1|0\.\d*)\)$/i,
      Ya = /^(?:rgb)?\((0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2}),\s?(0|[1-9]\d{0,2})\)$/i;
    function Za() {
      return (y("Chrome") || y("CriOS")) && !y("Edge");
    }
    function $a(a, b) {
      this.x = l(a) ? a : 0;
      this.y = l(b) ? b : 0;
    }
    $a.prototype.toString = function () {
      return "(" + this.x + ", " + this.y + ")";
    };
    $a.prototype.ceil = function () {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      return this;
    };
    $a.prototype.floor = function () {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      return this;
    };
    $a.prototype.round = function () {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      return this;
    };
    var ab = y("Opera"),
      C = y("Trident") || y("MSIE"),
      bb = y("Edge"),
      cb =
        y("Gecko") &&
        !(-1 != x.toLowerCase().indexOf("webkit") && !y("Edge")) &&
        !(y("Trident") || y("MSIE")) &&
        !y("Edge"),
      db = -1 != x.toLowerCase().indexOf("webkit") && !y("Edge");
    function eb() {
      var a = k.document;
      return a ? a.documentMode : void 0;
    }
    var fb;
    a: {
      var gb = "",
        hb = (function () {
          var a = x;
          if (cb) return /rv:([^\);]+)(\)|;)/.exec(a);
          if (bb) return /Edge\/([\d\.]+)/.exec(a);
          if (C) return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);
          if (db) return /WebKit\/(\S+)/.exec(a);
          if (ab) return /(?:Version)[ \/]?(\S+)/.exec(a);
        })();
      hb && (gb = hb ? hb[1] : "");
      if (C) {
        var ib = eb();
        if (null != ib && ib > parseFloat(gb)) {
          fb = String(ib);
          break a;
        }
      }
      fb = gb;
    }
    var qa = {};
    function jb(a) {
      return pa(a, function () {
        return 0 <= ta(fb, a);
      });
    }
    var D;
    var kb = k.document;
    D =
      kb && C
        ? eb() || ("CSS1Compat" == kb.compatMode ? parseInt(fb, 10) : 5)
        : void 0;
    function lb(a, b, c, d) {
      this.c = a;
      this.a = b;
      this.b = c;
      this.f = d;
    }
    lb.prototype.toString = function () {
      return (
        "(" + this.c + "t, " + this.a + "r, " + this.b + "b, " + this.f + "l)"
      );
    };
    lb.prototype.ceil = function () {
      this.c = Math.ceil(this.c);
      this.a = Math.ceil(this.a);
      this.b = Math.ceil(this.b);
      this.f = Math.ceil(this.f);
      return this;
    };
    lb.prototype.floor = function () {
      this.c = Math.floor(this.c);
      this.a = Math.floor(this.a);
      this.b = Math.floor(this.b);
      this.f = Math.floor(this.f);
      return this;
    };
    lb.prototype.round = function () {
      this.c = Math.round(this.c);
      this.a = Math.round(this.a);
      this.b = Math.round(this.b);
      this.f = Math.round(this.f);
      return this;
    };
    var mb = y("Firefox"),
      nb = Ta() || y("iPod"),
      ob = y("iPad"),
      pb = y("Android") && !(Za() || y("Firefox") || y("Opera") || y("Silk")),
      qb = Za(),
      rb =
        y("Safari") &&
        !(
          Za() ||
          y("Coast") ||
          y("Opera") ||
          y("Edge") ||
          y("Silk") ||
          y("Android")
        ) &&
        !(Ta() || y("iPad") || y("iPod"));
    var F = C && !(9 <= Number(D)),
      sb = C && !(8 <= Number(D));
    function G(a, b, c, d) {
      this.a = a;
      this.b = b;
      this.width = c;
      this.height = d;
    }
    G.prototype.toString = function () {
      return (
        "(" +
        this.a +
        ", " +
        this.b +
        " - " +
        this.width +
        "w x " +
        this.height +
        "h)"
      );
    };
    G.prototype.ceil = function () {
      this.a = Math.ceil(this.a);
      this.b = Math.ceil(this.b);
      this.width = Math.ceil(this.width);
      this.height = Math.ceil(this.height);
      return this;
    };
    G.prototype.floor = function () {
      this.a = Math.floor(this.a);
      this.b = Math.floor(this.b);
      this.width = Math.floor(this.width);
      this.height = Math.floor(this.height);
      return this;
    };
    G.prototype.round = function () {
      this.a = Math.round(this.a);
      this.b = Math.round(this.b);
      this.width = Math.round(this.width);
      this.height = Math.round(this.height);
      return this;
    };
    function tb(a) {
      return (a = a.exec(x)) ? a[1] : "";
    }
    (function () {
      if (mb) return tb(/Firefox\/([0-9.]+)/);
      if (C || bb || ab) return fb;
      if (qb)
        return Ta() || y("iPad") || y("iPod")
          ? tb(/CriOS\/([0-9.]+)/)
          : tb(/Chrome\/([0-9.]+)/);
      if (rb && !(Ta() || y("iPad") || y("iPod")))
        return tb(/Version\/([0-9.]+)/);
      if (nb || ob) {
        var a = /Version\/(\S+).*Mobile\/(\S+)/.exec(x);
        if (a) return a[1] + "." + a[2];
      } else if (pb)
        return (a = tb(/Android\s+([0-9.]+)/)) ? a : tb(/Version\/([0-9.]+)/);
      return "";
    })();
    function ub(a, b, c, d) {
      this.a = a;
      this.nodeName = c;
      this.nodeValue = d;
      this.nodeType = 2;
      this.parentNode = this.ownerElement = b;
    }
    function vb(a, b) {
      var c =
        sb && "href" == b.nodeName
          ? a.getAttribute(b.nodeName, 2)
          : b.nodeValue;
      return new ub(b, a, b.nodeName, c);
    }
    var wb,
      xb,
      yb = (function () {
        if (!cb) return !1;
        var a = k.Components;
        if (!a) return !1;
        try {
          if (!a.classes) return !1;
        } catch (f) {
          return !1;
        }
        var b = a.classes;
        a = a.interfaces;
        var c = b["@mozilla.org/xpcom/version-comparator;1"].getService(
          a.nsIVersionComparator
        );
        b = b["@mozilla.org/xre/app-info;1"].getService(a.nsIXULAppInfo);
        var d = b.platformVersion,
          e = b.version;
        wb = function () {
          return 0 <= c.compare(d, "8");
        };
        xb = function (a) {
          c.compare(e, "" + a);
        };
        return !0;
      })(),
      zb = C && !(8 <= Number(D)),
      Ab = C && !(9 <= Number(D));
    pb && yb && xb(2.3);
    pb && yb && xb(4);
    rb && yb && xb(6);
    function H(a) {
      return a ? new Bb(I(a)) : na || (na = new Bb());
    }
    function Cb(a) {
      for (; a && 1 != a.nodeType; ) a = a.previousSibling;
      return a;
    }
    function Db(a, b) {
      if (!a || !b) return !1;
      if (a.contains && 1 == b.nodeType) return a == b || a.contains(b);
      if ("undefined" != typeof a.compareDocumentPosition)
        return a == b || !!(a.compareDocumentPosition(b) & 16);
      for (; b && a != b; ) b = b.parentNode;
      return b == a;
    }
    function Eb(a, b) {
      if (a == b) return 0;
      if (a.compareDocumentPosition)
        return a.compareDocumentPosition(b) & 2 ? 1 : -1;
      if (C && !(9 <= Number(D))) {
        if (9 == a.nodeType) return -1;
        if (9 == b.nodeType) return 1;
      }
      if (
        "sourceIndex" in a ||
        (a.parentNode && "sourceIndex" in a.parentNode)
      ) {
        var c = 1 == a.nodeType,
          d = 1 == b.nodeType;
        if (c && d) return a.sourceIndex - b.sourceIndex;
        var e = a.parentNode,
          f = b.parentNode;
        return e == f
          ? Fb(a, b)
          : !c && Db(e, b)
          ? -1 * Gb(a, b)
          : !d && Db(f, a)
          ? Gb(b, a)
          : (c ? a.sourceIndex : e.sourceIndex) -
            (d ? b.sourceIndex : f.sourceIndex);
      }
      d = I(a);
      c = d.createRange();
      c.selectNode(a);
      c.collapse(!0);
      a = d.createRange();
      a.selectNode(b);
      a.collapse(!0);
      return c.compareBoundaryPoints(k.Range.START_TO_END, a);
    }
    function Gb(a, b) {
      var c = a.parentNode;
      if (c == b) return -1;
      for (; b.parentNode != c; ) b = b.parentNode;
      return Fb(b, a);
    }
    function Fb(a, b) {
      for (; (b = b.previousSibling); ) if (b == a) return -1;
      return 1;
    }
    function I(a) {
      return 9 == a.nodeType ? a : a.ownerDocument || a.document;
    }
    function Hb(a, b) {
      a && (a = a.parentNode);
      for (var c = 0; a; ) {
        if (b(a)) return a;
        a = a.parentNode;
        c++;
      }
      return null;
    }
    function Bb(a) {
      this.a = a || k.document || document;
    }
    Bb.prototype.getElementsByTagName = function (a, b) {
      return (b || this.a).getElementsByTagName(String(a));
    };
    function Ib(a, b, c, d) {
      a = d || a.a;
      var e = b && "*" != b ? String(b).toUpperCase() : "";
      if (a.querySelectorAll && a.querySelector && (e || c))
        c = a.querySelectorAll(e + (c ? "." + c : ""));
      else if (c && a.getElementsByClassName)
        if (((b = a.getElementsByClassName(c)), e)) {
          a = {};
          for (var f = (d = 0), g; (g = b[f]); f++)
            e == g.nodeName && (a[d++] = g);
          a.length = d;
          c = a;
        } else c = b;
      else if (((b = a.getElementsByTagName(e || "*")), c)) {
        a = {};
        for (f = d = 0; (g = b[f]); f++) {
          e = g.className;
          var h;
          if ((h = "function" == typeof e.split))
            h = 0 <= La(e.split(/\s+/), c);
          h && (a[d++] = g);
        }
        a.length = d;
        c = a;
      } else c = b;
      return c;
    }
    function J(a) {
      var b = null,
        c = a.nodeType;
      1 == c &&
        ((b = a.textContent),
        (b = void 0 == b || null == b ? a.innerText : b),
        (b = void 0 == b || null == b ? "" : b));
      if ("string" != typeof b)
        if (F && "title" == a.nodeName.toLowerCase() && 1 == c) b = a.text;
        else if (9 == c || 1 == c) {
          a = 9 == c ? a.documentElement : a.firstChild;
          c = 0;
          var d = [];
          for (b = ""; a; ) {
            do
              1 != a.nodeType && (b += a.nodeValue),
                F && "title" == a.nodeName.toLowerCase() && (b += a.text),
                (d[c++] = a);
            while ((a = a.firstChild));
            for (; c && !(a = d[--c].nextSibling); );
          }
        } else b = a.nodeValue;
      return b;
    }
    function Jb(a, b, c) {
      if (null === b) return !0;
      try {
        if (!a.getAttribute) return !1;
      } catch (d) {
        return !1;
      }
      sb && "class" == b && (b = "className");
      return null == c ? !!a.getAttribute(b) : a.getAttribute(b, 2) == c;
    }
    function Kb(a, b, c, d, e) {
      return (F ? Lb : Mb).call(
        null,
        a,
        b,
        n(c) ? c : null,
        n(d) ? d : null,
        e || new K()
      );
    }
    function Lb(a, b, c, d, e) {
      if (a instanceof Ha || 8 == a.b || (c && null === a.b)) {
        var f = b.all;
        if (!f) return e;
        a = Nb(a);
        if ("*" != a && ((f = b.getElementsByTagName(a)), !f)) return e;
        if (c) {
          for (var g = [], h = 0; (b = f[h++]); ) Jb(b, c, d) && g.push(b);
          f = g;
        }
        for (h = 0; (b = f[h++]); ) ("*" == a && "!" == b.tagName) || e.add(b);
        return e;
      }
      Ob(a, b, c, d, e);
      return e;
    }
    function Mb(a, b, c, d, e) {
      b.getElementsByName && d && "name" == c && !C
        ? ((b = b.getElementsByName(d)),
          B(b, function (b) {
            a.a(b) && e.add(b);
          }))
        : b.getElementsByClassName && d && "class" == c
        ? ((b = b.getElementsByClassName(d)),
          B(b, function (b) {
            b.className == d && a.a(b) && e.add(b);
          }))
        : a instanceof z
        ? Ob(a, b, c, d, e)
        : b.getElementsByTagName &&
          ((b = b.getElementsByTagName(a.f())),
          B(b, function (a) {
            Jb(a, c, d) && e.add(a);
          }));
      return e;
    }
    function Pb(a, b, c, d, e) {
      var f;
      if (
        (a instanceof Ha || 8 == a.b || (c && null === a.b)) &&
        (f = b.childNodes)
      ) {
        var g = Nb(a);
        if (
          "*" != g &&
          ((f = Ma(f, function (a) {
            return a.tagName && a.tagName.toLowerCase() == g;
          })),
          !f)
        )
          return e;
        c &&
          (f = Ma(f, function (a) {
            return Jb(a, c, d);
          }));
        B(f, function (a) {
          ("*" == g && ("!" == a.tagName || ("*" == g && 1 != a.nodeType))) ||
            e.add(a);
        });
        return e;
      }
      return Qb(a, b, c, d, e);
    }
    function Qb(a, b, c, d, e) {
      for (b = b.firstChild; b; b = b.nextSibling)
        Jb(b, c, d) && a.a(b) && e.add(b);
      return e;
    }
    function Ob(a, b, c, d, e) {
      for (b = b.firstChild; b; b = b.nextSibling)
        Jb(b, c, d) && a.a(b) && e.add(b), Ob(a, b, c, d, e);
    }
    function Nb(a) {
      if (a instanceof z) {
        if (8 == a.b) return "!";
        if (null === a.b) return "*";
      }
      return a.f();
    }
    function Rb(a, b) {
      b = b.toLowerCase();
      return "style" == b
        ? Sb(a.style.cssText)
        : zb && "value" == b && L(a, "INPUT")
        ? a.value
        : Ab && !0 === a[b]
        ? String(a.getAttribute(b))
        : (a = a.getAttributeNode(b)) && a.specified
        ? a.value
        : null;
    }
    var Tb = /[;]+(?=(?:(?:[^"]*"){2})*[^"]*$)(?=(?:(?:[^']*'){2})*[^']*$)(?=(?:[^()]*\([^()]*\))*[^()]*$)/;
    function Sb(a) {
      var b = [];
      B(a.split(Tb), function (a) {
        var c = a.indexOf(":");
        0 < c &&
          ((a = [a.slice(0, c), a.slice(c + 1)]),
          2 == a.length && b.push(a[0].toLowerCase(), ":", a[1], ";"));
      });
      b = b.join("");
      return (b = ";" == b.charAt(b.length - 1) ? b : b + ";");
    }
    function L(a, b) {
      b && "string" !== typeof b && (b = b.toString());
      return !!a && 1 == a.nodeType && (!b || a.tagName.toUpperCase() == b);
    }
    var Ub = {
      A: function (a) {
        return !(!a.querySelectorAll || !a.querySelector);
      },
      o: function (a, b) {
        if (!a) throw new q(32, "No class name specified");
        a = sa(a);
        if (-1 !== a.indexOf(" "))
          throw new q(32, "Compound class names not permitted");
        if (Ub.A(b))
          try {
            return b.querySelector("." + a.replace(/\./g, "\\.")) || null;
          } catch (c) {
            throw new q(32, "An invalid or illegal class name was specified");
          }
        a = Ib(H(b), "*", a, b);
        return a.length ? a[0] : null;
      },
      s: function (a, b) {
        if (!a) throw new q(32, "No class name specified");
        a = sa(a);
        if (-1 !== a.indexOf(" "))
          throw new q(32, "Compound class names not permitted");
        if (Ub.A(b))
          try {
            return b.querySelectorAll("." + a.replace(/\./g, "\\."));
          } catch (c) {
            throw new q(32, "An invalid or illegal class name was specified");
          }
        return Ib(H(b), "*", a, b);
      },
    };
    var Vb = {
      o: function (a, b) {
        if (
          !ca(b.querySelector) &&
          C &&
          (yb ? wb() : C ? 0 <= ta(D, 8) : jb(8)) &&
          !da(b.querySelector)
        )
          throw Error("CSS selection is not supported");
        if (!a) throw new q(32, "No selector specified");
        a = sa(a);
        try {
          var c = b.querySelector(a);
        } catch (d) {
          throw new q(32, "An invalid or illegal selector was specified");
        }
        return c && 1 == c.nodeType ? c : null;
      },
      s: function (a, b) {
        if (
          !ca(b.querySelectorAll) &&
          C &&
          (yb ? wb() : C ? 0 <= ta(D, 8) : jb(8)) &&
          !da(b.querySelector)
        )
          throw Error("CSS selection is not supported");
        if (!a) throw new q(32, "No selector specified");
        a = sa(a);
        try {
          return b.querySelectorAll(a);
        } catch (c) {
          throw new q(32, "An invalid or illegal selector was specified");
        }
      },
    };
    function K() {
      this.b = this.a = null;
      this.l = 0;
    }
    function Wb(a) {
      this.f = a;
      this.a = this.b = null;
    }
    function Xb(a, b) {
      if (!a.a) return b;
      if (!b.a) return a;
      var c = a.a;
      b = b.a;
      for (var d = null, e, f = 0; c && b; ) {
        e = c.f;
        var g = b.f;
        e == g || (e instanceof ub && g instanceof ub && e.a == g.a)
          ? ((e = c), (c = c.a), (b = b.a))
          : 0 < Eb(c.f, b.f)
          ? ((e = b), (b = b.a))
          : ((e = c), (c = c.a));
        (e.b = d) ? (d.a = e) : (a.a = e);
        d = e;
        f++;
      }
      for (e = c || b; e; ) (e.b = d), (d = d.a = e), f++, (e = e.a);
      a.b = d;
      a.l = f;
      return a;
    }
    function Yb(a, b) {
      b = new Wb(b);
      b.a = a.a;
      a.b ? (a.a.b = b) : (a.a = a.b = b);
      a.a = b;
      a.l++;
    }
    K.prototype.add = function (a) {
      a = new Wb(a);
      a.b = this.b;
      this.a ? (this.b.a = a) : (this.a = this.b = a);
      this.b = a;
      this.l++;
    };
    function Zb(a) {
      return (a = a.a) ? a.f : null;
    }
    function $b(a) {
      return (a = Zb(a)) ? J(a) : "";
    }
    function ac(a, b) {
      return new bc(a, !!b);
    }
    function bc(a, b) {
      this.f = a;
      this.b = (this.v = b) ? a.b : a.a;
      this.a = null;
    }
    function M(a) {
      var b = a.b;
      if (null == b) return null;
      var c = (a.a = b);
      a.b = a.v ? b.b : b.a;
      return c.f;
    }
    function N(a) {
      this.i = a;
      this.b = this.g = !1;
      this.f = null;
    }
    function A(a) {
      return "\n  " + a.toString().split("\n").join("\n  ");
    }
    function cc(a, b) {
      a.g = b;
    }
    function dc(a, b) {
      a.b = b;
    }
    function O(a, b) {
      a = a.a(b);
      return a instanceof K ? +$b(a) : +a;
    }
    function Q(a, b) {
      a = a.a(b);
      return a instanceof K ? $b(a) : "" + a;
    }
    function ec(a, b) {
      a = a.a(b);
      return a instanceof K ? !!a.l : !!a;
    }
    function fc(a, b, c) {
      N.call(this, a.i);
      this.c = a;
      this.h = b;
      this.u = c;
      this.g = b.g || c.g;
      this.b = b.b || c.b;
      this.c == gc &&
        (c.b || c.g || 4 == c.i || 0 == c.i || !b.f
          ? b.b ||
            b.g ||
            4 == b.i ||
            0 == b.i ||
            !c.f ||
            (this.f = { name: c.f.name, w: b })
          : (this.f = { name: b.f.name, w: c }));
    }
    p(fc, N);
    function hc(a, b, c, d, e) {
      b = b.a(d);
      c = c.a(d);
      var f;
      if (b instanceof K && c instanceof K) {
        b = ac(b);
        for (d = M(b); d; d = M(b))
          for (e = ac(c), f = M(e); f; f = M(e)) if (a(J(d), J(f))) return !0;
        return !1;
      }
      if (b instanceof K || c instanceof K) {
        b instanceof K ? ((e = b), (d = c)) : ((e = c), (d = b));
        f = ac(e);
        for (var g = typeof d, h = M(f); h; h = M(f)) {
          switch (g) {
            case "number":
              h = +J(h);
              break;
            case "boolean":
              h = !!J(h);
              break;
            case "string":
              h = J(h);
              break;
            default:
              throw Error("Illegal primitive type for comparison.");
          }
          if ((e == b && a(h, d)) || (e == c && a(d, h))) return !0;
        }
        return !1;
      }
      return e
        ? "boolean" == typeof b || "boolean" == typeof c
          ? a(!!b, !!c)
          : "number" == typeof b || "number" == typeof c
          ? a(+b, +c)
          : a(b, c)
        : a(+b, +c);
    }
    fc.prototype.a = function (a) {
      return this.c.m(this.h, this.u, a);
    };
    fc.prototype.toString = function () {
      var a = "Binary Expression: " + this.c;
      a += A(this.h);
      return (a += A(this.u));
    };
    function ic(a, b, c, d) {
      this.R = a;
      this.K = b;
      this.i = c;
      this.m = d;
    }
    ic.prototype.toString = function () {
      return this.R;
    };
    var jc = {};
    function R(a, b, c, d) {
      if (jc.hasOwnProperty(a))
        throw Error("Binary operator already created: " + a);
      a = new ic(a, b, c, d);
      return (jc[a.toString()] = a);
    }
    R("div", 6, 1, function (a, b, c) {
      return O(a, c) / O(b, c);
    });
    R("mod", 6, 1, function (a, b, c) {
      return O(a, c) % O(b, c);
    });
    R("*", 6, 1, function (a, b, c) {
      return O(a, c) * O(b, c);
    });
    R("+", 5, 1, function (a, b, c) {
      return O(a, c) + O(b, c);
    });
    R("-", 5, 1, function (a, b, c) {
      return O(a, c) - O(b, c);
    });
    R("<", 4, 2, function (a, b, c) {
      return hc(
        function (a, b) {
          return a < b;
        },
        a,
        b,
        c
      );
    });
    R(">", 4, 2, function (a, b, c) {
      return hc(
        function (a, b) {
          return a > b;
        },
        a,
        b,
        c
      );
    });
    R("<=", 4, 2, function (a, b, c) {
      return hc(
        function (a, b) {
          return a <= b;
        },
        a,
        b,
        c
      );
    });
    R(">=", 4, 2, function (a, b, c) {
      return hc(
        function (a, b) {
          return a >= b;
        },
        a,
        b,
        c
      );
    });
    var gc = R("=", 3, 2, function (a, b, c) {
      return hc(
        function (a, b) {
          return a == b;
        },
        a,
        b,
        c,
        !0
      );
    });
    R("!=", 3, 2, function (a, b, c) {
      return hc(
        function (a, b) {
          return a != b;
        },
        a,
        b,
        c,
        !0
      );
    });
    R("and", 2, 2, function (a, b, c) {
      return ec(a, c) && ec(b, c);
    });
    R("or", 1, 2, function (a, b, c) {
      return ec(a, c) || ec(b, c);
    });
    function kc(a, b) {
      if (b.a.length && 4 != a.i)
        throw Error(
          "Primary expression must evaluate to nodeset if filter has predicate(s)."
        );
      N.call(this, a.i);
      this.c = a;
      this.h = b;
      this.g = a.g;
      this.b = a.b;
    }
    p(kc, N);
    kc.prototype.a = function (a) {
      a = this.c.a(a);
      return lc(this.h, a);
    };
    kc.prototype.toString = function () {
      var a = "Filter:" + A(this.c);
      return (a += A(this.h));
    };
    function mc(a, b) {
      if (b.length < a.J)
        throw Error(
          "Function " +
            a.j +
            " expects at least" +
            a.J +
            " arguments, " +
            b.length +
            " given"
        );
      if (null !== a.D && b.length > a.D)
        throw Error(
          "Function " +
            a.j +
            " expects at most " +
            a.D +
            " arguments, " +
            b.length +
            " given"
        );
      a.P &&
        B(b, function (b, d) {
          if (4 != b.i)
            throw Error(
              "Argument " +
                d +
                " to function " +
                a.j +
                " is not of type Nodeset: " +
                b
            );
        });
      N.call(this, a.i);
      this.B = a;
      this.c = b;
      cc(
        this,
        a.g ||
          Oa(b, function (a) {
            return a.g;
          })
      );
      dc(
        this,
        (a.O && !b.length) ||
          (a.N && !!b.length) ||
          Oa(b, function (a) {
            return a.b;
          })
      );
    }
    p(mc, N);
    mc.prototype.a = function (a) {
      return this.B.m.apply(null, Ra(a, this.c));
    };
    mc.prototype.toString = function () {
      var a = "Function: " + this.B;
      if (this.c.length) {
        var b = Na(
          this.c,
          function (a, b) {
            return a + A(b);
          },
          "Arguments:"
        );
        a += A(b);
      }
      return a;
    };
    function nc(a, b, c, d, e, f, g, h) {
      this.j = a;
      this.i = b;
      this.g = c;
      this.O = d;
      this.N = !1;
      this.m = e;
      this.J = f;
      this.D = l(g) ? g : f;
      this.P = !!h;
    }
    nc.prototype.toString = function () {
      return this.j;
    };
    var oc = {};
    function S(a, b, c, d, e, f, g, h) {
      if (oc.hasOwnProperty(a))
        throw Error("Function already created: " + a + ".");
      oc[a] = new nc(a, b, c, d, e, f, g, h);
    }
    S(
      "boolean",
      2,
      !1,
      !1,
      function (a, b) {
        return ec(b, a);
      },
      1
    );
    S(
      "ceiling",
      1,
      !1,
      !1,
      function (a, b) {
        return Math.ceil(O(b, a));
      },
      1
    );
    S(
      "concat",
      3,
      !1,
      !1,
      function (a, b) {
        return Na(
          Sa(arguments, 1),
          function (b, d) {
            return b + Q(d, a);
          },
          ""
        );
      },
      2,
      null
    );
    S(
      "contains",
      2,
      !1,
      !1,
      function (a, b, c) {
        b = Q(b, a);
        a = Q(c, a);
        return -1 != b.indexOf(a);
      },
      2
    );
    S(
      "count",
      1,
      !1,
      !1,
      function (a, b) {
        return b.a(a).l;
      },
      1,
      1,
      !0
    );
    S(
      "false",
      2,
      !1,
      !1,
      function () {
        return !1;
      },
      0
    );
    S(
      "floor",
      1,
      !1,
      !1,
      function (a, b) {
        return Math.floor(O(b, a));
      },
      1
    );
    S(
      "id",
      4,
      !1,
      !1,
      function (a, b) {
        function c(a) {
          if (F) {
            var b = e.all[a];
            if (b) {
              if (b.nodeType && a == b.id) return b;
              if (b.length)
                return Qa(b, function (b) {
                  return a == b.id;
                });
            }
            return null;
          }
          return e.getElementById(a);
        }
        var d = a.a,
          e = 9 == d.nodeType ? d : d.ownerDocument;
        a = Q(b, a).split(/\s+/);
        var f = [];
        B(a, function (a) {
          a = c(a);
          !a || 0 <= La(f, a) || f.push(a);
        });
        f.sort(Eb);
        var g = new K();
        B(f, function (a) {
          g.add(a);
        });
        return g;
      },
      1
    );
    S(
      "lang",
      2,
      !1,
      !1,
      function () {
        return !1;
      },
      1
    );
    S(
      "last",
      1,
      !0,
      !1,
      function (a) {
        if (1 != arguments.length) throw Error("Function last expects ()");
        return a.f;
      },
      0
    );
    S(
      "local-name",
      3,
      !1,
      !0,
      function (a, b) {
        return (a = b ? Zb(b.a(a)) : a.a)
          ? a.localName || a.nodeName.toLowerCase()
          : "";
      },
      0,
      1,
      !0
    );
    S(
      "name",
      3,
      !1,
      !0,
      function (a, b) {
        return (a = b ? Zb(b.a(a)) : a.a) ? a.nodeName.toLowerCase() : "";
      },
      0,
      1,
      !0
    );
    S(
      "namespace-uri",
      3,
      !0,
      !1,
      function () {
        return "";
      },
      0,
      1,
      !0
    );
    S(
      "normalize-space",
      3,
      !1,
      !0,
      function (a, b) {
        return (b ? Q(b, a) : J(a.a))
          .replace(/[\s\xa0]+/g, " ")
          .replace(/^\s+|\s+$/g, "");
      },
      0,
      1
    );
    S(
      "not",
      2,
      !1,
      !1,
      function (a, b) {
        return !ec(b, a);
      },
      1
    );
    S(
      "number",
      1,
      !1,
      !0,
      function (a, b) {
        return b ? O(b, a) : +J(a.a);
      },
      0,
      1
    );
    S(
      "position",
      1,
      !0,
      !1,
      function (a) {
        return a.b;
      },
      0
    );
    S(
      "round",
      1,
      !1,
      !1,
      function (a, b) {
        return Math.round(O(b, a));
      },
      1
    );
    S(
      "starts-with",
      2,
      !1,
      !1,
      function (a, b, c) {
        b = Q(b, a);
        a = Q(c, a);
        return 0 == b.lastIndexOf(a, 0);
      },
      2
    );
    S(
      "string",
      3,
      !1,
      !0,
      function (a, b) {
        return b ? Q(b, a) : J(a.a);
      },
      0,
      1
    );
    S(
      "string-length",
      1,
      !1,
      !0,
      function (a, b) {
        return (b ? Q(b, a) : J(a.a)).length;
      },
      0,
      1
    );
    S(
      "substring",
      3,
      !1,
      !1,
      function (a, b, c, d) {
        c = O(c, a);
        if (isNaN(c) || Infinity == c || -Infinity == c) return "";
        d = d ? O(d, a) : Infinity;
        if (isNaN(d) || -Infinity === d) return "";
        c = Math.round(c) - 1;
        var e = Math.max(c, 0);
        a = Q(b, a);
        return Infinity == d
          ? a.substring(e)
          : a.substring(e, c + Math.round(d));
      },
      2,
      3
    );
    S(
      "substring-after",
      3,
      !1,
      !1,
      function (a, b, c) {
        b = Q(b, a);
        a = Q(c, a);
        c = b.indexOf(a);
        return -1 == c ? "" : b.substring(c + a.length);
      },
      2
    );
    S(
      "substring-before",
      3,
      !1,
      !1,
      function (a, b, c) {
        b = Q(b, a);
        a = Q(c, a);
        a = b.indexOf(a);
        return -1 == a ? "" : b.substring(0, a);
      },
      2
    );
    S(
      "sum",
      1,
      !1,
      !1,
      function (a, b) {
        a = ac(b.a(a));
        b = 0;
        for (var c = M(a); c; c = M(a)) b += +J(c);
        return b;
      },
      1,
      1,
      !0
    );
    S(
      "translate",
      3,
      !1,
      !1,
      function (a, b, c, d) {
        b = Q(b, a);
        c = Q(c, a);
        var e = Q(d, a);
        a = {};
        for (d = 0; d < c.length; d++) {
          var f = c.charAt(d);
          f in a || (a[f] = e.charAt(d));
        }
        c = "";
        for (d = 0; d < b.length; d++)
          (f = b.charAt(d)), (c += f in a ? a[f] : f);
        return c;
      },
      3
    );
    S(
      "true",
      2,
      !1,
      !1,
      function () {
        return !0;
      },
      0
    );
    function pc(a) {
      N.call(this, 3);
      this.c = a.substring(1, a.length - 1);
    }
    p(pc, N);
    pc.prototype.a = function () {
      return this.c;
    };
    pc.prototype.toString = function () {
      return "Literal: " + this.c;
    };
    function qc(a) {
      N.call(this, 1);
      this.c = a;
    }
    p(qc, N);
    qc.prototype.a = function () {
      return this.c;
    };
    qc.prototype.toString = function () {
      return "Number: " + this.c;
    };
    function rc(a, b) {
      N.call(this, a.i);
      this.h = a;
      this.c = b;
      this.g = a.g;
      this.b = a.b;
      1 == this.c.length &&
        ((a = this.c[0]),
        a.C ||
          a.c != sc ||
          ((a = a.u), "*" != a.f() && (this.f = { name: a.f(), w: null })));
    }
    p(rc, N);
    function tc() {
      N.call(this, 4);
    }
    p(tc, N);
    tc.prototype.a = function (a) {
      var b = new K();
      a = a.a;
      9 == a.nodeType ? b.add(a) : b.add(a.ownerDocument);
      return b;
    };
    tc.prototype.toString = function () {
      return "Root Helper Expression";
    };
    function uc() {
      N.call(this, 4);
    }
    p(uc, N);
    uc.prototype.a = function (a) {
      var b = new K();
      b.add(a.a);
      return b;
    };
    uc.prototype.toString = function () {
      return "Context Helper Expression";
    };
    function vc(a) {
      return "/" == a || "//" == a;
    }
    rc.prototype.a = function (a) {
      var b = this.h.a(a);
      if (!(b instanceof K))
        throw Error("Filter expression must evaluate to nodeset.");
      a = this.c;
      for (var c = 0, d = a.length; c < d && b.l; c++) {
        var e = a[c],
          f = ac(b, e.c.v);
        if (e.g || e.c != wc)
          if (e.g || e.c != xc) {
            var g = M(f);
            for (b = e.a(new wa(g)); null != (g = M(f)); )
              (g = e.a(new wa(g))), (b = Xb(b, g));
          } else (g = M(f)), (b = e.a(new wa(g)));
        else {
          for (
            g = M(f);
            (b = M(f)) &&
            (!g.contains || g.contains(b)) &&
            b.compareDocumentPosition(g) & 8;
            g = b
          );
          b = e.a(new wa(g));
        }
      }
      return b;
    };
    rc.prototype.toString = function () {
      var a = "Path Expression:" + A(this.h);
      if (this.c.length) {
        var b = Na(
          this.c,
          function (a, b) {
            return a + A(b);
          },
          "Steps:"
        );
        a += A(b);
      }
      return a;
    };
    function yc(a, b) {
      this.a = a;
      this.v = !!b;
    }
    function lc(a, b, c) {
      for (c = c || 0; c < a.a.length; c++)
        for (var d = a.a[c], e = ac(b), f = b.l, g, h = 0; (g = M(e)); h++) {
          var v = a.v ? f - h : h + 1;
          g = d.a(new wa(g, v, f));
          if ("number" == typeof g) v = v == g;
          else if ("string" == typeof g || "boolean" == typeof g) v = !!g;
          else if (g instanceof K) v = 0 < g.l;
          else throw Error("Predicate.evaluate returned an unexpected type.");
          if (!v) {
            v = e;
            g = v.f;
            var t = v.a;
            if (!t)
              throw Error("Next must be called at least once before remove.");
            var m = t.b;
            t = t.a;
            m ? (m.a = t) : (g.a = t);
            t ? (t.b = m) : (g.b = m);
            g.l--;
            v.a = null;
          }
        }
      return b;
    }
    yc.prototype.toString = function () {
      return Na(
        this.a,
        function (a, b) {
          return a + A(b);
        },
        "Predicates:"
      );
    };
    function zc(a) {
      N.call(this, 1);
      this.c = a;
      this.g = a.g;
      this.b = a.b;
    }
    p(zc, N);
    zc.prototype.a = function (a) {
      return -O(this.c, a);
    };
    zc.prototype.toString = function () {
      return "Unary Expression: -" + A(this.c);
    };
    function Ac(a) {
      N.call(this, 4);
      this.c = a;
      cc(
        this,
        Oa(this.c, function (a) {
          return a.g;
        })
      );
      dc(
        this,
        Oa(this.c, function (a) {
          return a.b;
        })
      );
    }
    p(Ac, N);
    Ac.prototype.a = function (a) {
      var b = new K();
      B(this.c, function (c) {
        c = c.a(a);
        if (!(c instanceof K))
          throw Error("Path expression must evaluate to NodeSet.");
        b = Xb(b, c);
      });
      return b;
    };
    Ac.prototype.toString = function () {
      return Na(
        this.c,
        function (a, b) {
          return a + A(b);
        },
        "Union Expression:"
      );
    };
    function Bc(a, b, c, d) {
      N.call(this, 4);
      this.c = a;
      this.u = b;
      this.h = c || new yc([]);
      this.C = !!d;
      b = this.h;
      b = 0 < b.a.length ? b.a[0].f : null;
      a.S &&
        b &&
        ((a = b.name),
        (a = F ? a.toLowerCase() : a),
        (this.f = { name: a, w: b.w }));
      a: {
        a = this.h;
        for (b = 0; b < a.a.length; b++)
          if (((c = a.a[b]), c.g || 1 == c.i || 0 == c.i)) {
            a = !0;
            break a;
          }
        a = !1;
      }
      this.g = a;
    }
    p(Bc, N);
    Bc.prototype.a = function (a) {
      var b = a.a,
        c = this.f,
        d = null,
        e = null,
        f = 0;
      c && ((d = c.name), (e = c.w ? Q(c.w, a) : null), (f = 1));
      if (this.C)
        if (this.g || this.c != Cc)
          if (((b = ac(new Bc(Dc, new z("node")).a(a))), (c = M(b))))
            for (a = this.m(c, d, e, f); null != (c = M(b)); )
              a = Xb(a, this.m(c, d, e, f));
          else a = new K();
        else (a = Kb(this.u, b, d, e)), (a = lc(this.h, a, f));
      else a = this.m(a.a, d, e, f);
      return a;
    };
    Bc.prototype.m = function (a, b, c, d) {
      a = this.c.B(this.u, a, b, c);
      return (a = lc(this.h, a, d));
    };
    Bc.prototype.toString = function () {
      var a = "Step:" + A("Operator: " + (this.C ? "//" : "/"));
      this.c.j && (a += A("Axis: " + this.c));
      a += A(this.u);
      if (this.h.a.length) {
        var b = Na(
          this.h.a,
          function (a, b) {
            return a + A(b);
          },
          "Predicates:"
        );
        a += A(b);
      }
      return a;
    };
    function Ec(a, b, c, d) {
      this.j = a;
      this.B = b;
      this.v = c;
      this.S = d;
    }
    Ec.prototype.toString = function () {
      return this.j;
    };
    var Fc = {};
    function T(a, b, c, d) {
      if (Fc.hasOwnProperty(a)) throw Error("Axis already created: " + a);
      b = new Ec(a, b, c, !!d);
      return (Fc[a] = b);
    }
    T(
      "ancestor",
      function (a, b) {
        for (var c = new K(); (b = b.parentNode); ) a.a(b) && Yb(c, b);
        return c;
      },
      !0
    );
    T(
      "ancestor-or-self",
      function (a, b) {
        var c = new K();
        do a.a(b) && Yb(c, b);
        while ((b = b.parentNode));
        return c;
      },
      !0
    );
    var sc = T(
        "attribute",
        function (a, b) {
          var c = new K(),
            d = a.f();
          if ("style" == d && F && b.style)
            return c.add(new ub(b.style, b, "style", b.style.cssText)), c;
          var e = b.attributes;
          if (e)
            if ((a instanceof z && null === a.b) || "*" == d)
              for (a = 0; (d = e[a]); a++)
                F ? d.nodeValue && c.add(vb(b, d)) : c.add(d);
            else
              (d = e.getNamedItem(d)) &&
                (F ? d.nodeValue && c.add(vb(b, d)) : c.add(d));
          return c;
        },
        !1
      ),
      Cc = T(
        "child",
        function (a, b, c, d, e) {
          return (F ? Pb : Qb).call(
            null,
            a,
            b,
            n(c) ? c : null,
            n(d) ? d : null,
            e || new K()
          );
        },
        !1,
        !0
      );
    T("descendant", Kb, !1, !0);
    var Dc = T(
        "descendant-or-self",
        function (a, b, c, d) {
          var e = new K();
          Jb(b, c, d) && a.a(b) && e.add(b);
          return Kb(a, b, c, d, e);
        },
        !1,
        !0
      ),
      wc = T(
        "following",
        function (a, b, c, d) {
          var e = new K();
          do
            for (var f = b; (f = f.nextSibling); )
              Jb(f, c, d) && a.a(f) && e.add(f), (e = Kb(a, f, c, d, e));
          while ((b = b.parentNode));
          return e;
        },
        !1,
        !0
      );
    T(
      "following-sibling",
      function (a, b) {
        for (var c = new K(); (b = b.nextSibling); ) a.a(b) && c.add(b);
        return c;
      },
      !1
    );
    T(
      "namespace",
      function () {
        return new K();
      },
      !1
    );
    var Gc = T(
        "parent",
        function (a, b) {
          var c = new K();
          if (9 == b.nodeType) return c;
          if (2 == b.nodeType) return c.add(b.ownerElement), c;
          b = b.parentNode;
          a.a(b) && c.add(b);
          return c;
        },
        !1
      ),
      xc = T(
        "preceding",
        function (a, b, c, d) {
          var e = new K(),
            f = [];
          do f.unshift(b);
          while ((b = b.parentNode));
          for (var g = 1, h = f.length; g < h; g++) {
            var v = [];
            for (b = f[g]; (b = b.previousSibling); ) v.unshift(b);
            for (var t = 0, m = v.length; t < m; t++)
              (b = v[t]),
                Jb(b, c, d) && a.a(b) && e.add(b),
                (e = Kb(a, b, c, d, e));
          }
          return e;
        },
        !0,
        !0
      );
    T(
      "preceding-sibling",
      function (a, b) {
        for (var c = new K(); (b = b.previousSibling); ) a.a(b) && Yb(c, b);
        return c;
      },
      !0
    );
    var Hc = T(
      "self",
      function (a, b) {
        var c = new K();
        a.a(b) && c.add(b);
        return c;
      },
      !1
    );
    function Ic(a, b) {
      this.a = a;
      this.b = b;
    }
    function Jc(a) {
      for (var b, c = []; ; ) {
        U(a, "Missing right hand side of binary expression.");
        b = Kc(a);
        var d = w(a.a);
        if (!d) break;
        var e = (d = jc[d] || null) && d.K;
        if (!e) {
          a.a.a--;
          break;
        }
        for (; c.length && e <= c[c.length - 1].K; )
          b = new fc(c.pop(), c.pop(), b);
        c.push(b, d);
      }
      for (; c.length; ) b = new fc(c.pop(), c.pop(), b);
      return b;
    }
    function U(a, b) {
      if (Ca(a.a)) throw Error(b);
    }
    function Lc(a, b) {
      a = w(a.a);
      if (a != b) throw Error("Bad token, expected: " + b + " got: " + a);
    }
    function Mc(a) {
      a = w(a.a);
      if (")" != a) throw Error("Bad token: " + a);
    }
    function Nc(a) {
      a = w(a.a);
      if (2 > a.length) throw Error("Unclosed literal string");
      return new pc(a);
    }
    function Oc(a) {
      var b = [];
      if (vc(u(a.a))) {
        var c = w(a.a);
        var d = u(a.a);
        if (
          "/" == c &&
          (Ca(a.a) ||
            ("." != d &&
              ".." != d &&
              "@" != d &&
              "*" != d &&
              !/(?![0-9])[\w]/.test(d)))
        )
          return new tc();
        d = new tc();
        U(a, "Missing next location step.");
        c = Pc(a, c);
        b.push(c);
      } else {
        a: {
          c = u(a.a);
          d = c.charAt(0);
          switch (d) {
            case "$":
              throw Error("Variable reference not allowed in HTML XPath");
            case "(":
              w(a.a);
              c = Jc(a);
              U(a, 'unclosed "("');
              Lc(a, ")");
              break;
            case '"':
            case "'":
              c = Nc(a);
              break;
            default:
              if (isNaN(+c))
                if (!Ga(c) && /(?![0-9])[\w]/.test(d) && "(" == u(a.a, 1)) {
                  c = w(a.a);
                  c = oc[c] || null;
                  w(a.a);
                  for (d = []; ")" != u(a.a); ) {
                    U(a, "Missing function argument list.");
                    d.push(Jc(a));
                    if ("," != u(a.a)) break;
                    w(a.a);
                  }
                  U(a, "Unclosed function argument list.");
                  Mc(a);
                  c = new mc(c, d);
                } else {
                  c = null;
                  break a;
                }
              else c = new qc(+w(a.a));
          }
          "[" == u(a.a) && ((d = new yc(Qc(a))), (c = new kc(c, d)));
        }
        if (c)
          if (vc(u(a.a))) d = c;
          else return c;
        else (c = Pc(a, "/")), (d = new uc()), b.push(c);
      }
      for (; vc(u(a.a)); )
        (c = w(a.a)),
          U(a, "Missing next location step."),
          (c = Pc(a, c)),
          b.push(c);
      return new rc(d, b);
    }
    function Pc(a, b) {
      if ("/" != b && "//" != b) throw Error('Step op should be "/" or "//"');
      if ("." == u(a.a)) {
        var c = new Bc(Hc, new z("node"));
        w(a.a);
        return c;
      }
      if (".." == u(a.a)) return (c = new Bc(Gc, new z("node"))), w(a.a), c;
      if ("@" == u(a.a)) {
        var d = sc;
        w(a.a);
        U(a, "Missing attribute name");
      } else if ("::" == u(a.a, 1)) {
        if (!/(?![0-9])[\w]/.test(u(a.a).charAt(0)))
          throw Error("Bad token: " + w(a.a));
        var e = w(a.a);
        d = Fc[e] || null;
        if (!d) throw Error("No axis with name: " + e);
        w(a.a);
        U(a, "Missing node name");
      } else d = Cc;
      e = u(a.a);
      if (/(?![0-9])[\w\*]/.test(e.charAt(0)))
        if ("(" == u(a.a, 1)) {
          if (!Ga(e)) throw Error("Invalid node type: " + e);
          e = w(a.a);
          if (!Ga(e)) throw Error("Invalid type name: " + e);
          Lc(a, "(");
          U(a, "Bad nodetype");
          var f = u(a.a).charAt(0),
            g = null;
          if ('"' == f || "'" == f) g = Nc(a);
          U(a, "Bad nodetype");
          Mc(a);
          e = new z(e, g);
        } else if (((e = w(a.a)), (f = e.indexOf(":")), -1 == f)) e = new Ha(e);
        else {
          g = e.substring(0, f);
          if ("*" == g) var h = "*";
          else if (((h = a.b(g)), !h))
            throw Error("Namespace prefix not declared: " + g);
          e = e.substr(f + 1);
          e = new Ha(e, h);
        }
      else throw Error("Bad token: " + w(a.a));
      a = new yc(Qc(a), d.v);
      return c || new Bc(d, e, a, "//" == b);
    }
    function Qc(a) {
      for (var b = []; "[" == u(a.a); ) {
        w(a.a);
        U(a, "Missing predicate expression.");
        var c = Jc(a);
        b.push(c);
        U(a, "Unclosed predicate expression.");
        Lc(a, "]");
      }
      return b;
    }
    function Kc(a) {
      if ("-" == u(a.a)) return w(a.a), new zc(Kc(a));
      var b = Oc(a);
      if ("|" != u(a.a)) a = b;
      else {
        for (b = [b]; "|" == w(a.a); )
          U(a, "Missing next union location path."), b.push(Oc(a));
        a.a.a--;
        a = new Ac(b);
      }
      return a;
    }
    function Rc(a, b) {
      if (!a.length) throw Error("Empty XPath expression.");
      a = ya(a);
      if (Ca(a)) throw Error("Invalid XPath expression.");
      b
        ? ca(b) || (b = ia(b.lookupNamespaceURI, b))
        : (b = function () {
            return null;
          });
      var c = Jc(new Ic(a, b));
      if (!Ca(a)) throw Error("Bad token: " + w(a));
      this.evaluate = function (a, b) {
        a = c.a(new wa(a));
        return new V(a, b);
      };
    }
    function V(a, b) {
      if (0 == b)
        if (a instanceof K) b = 4;
        else if ("string" == typeof a) b = 2;
        else if ("number" == typeof a) b = 1;
        else if ("boolean" == typeof a) b = 3;
        else throw Error("Unexpected evaluation result.");
      if (2 != b && 1 != b && 3 != b && !(a instanceof K))
        throw Error("value could not be converted to the specified type");
      this.resultType = b;
      switch (b) {
        case 2:
          this.stringValue = a instanceof K ? $b(a) : "" + a;
          break;
        case 1:
          this.numberValue = a instanceof K ? +$b(a) : +a;
          break;
        case 3:
          this.booleanValue = a instanceof K ? 0 < a.l : !!a;
          break;
        case 4:
        case 5:
        case 6:
        case 7:
          var c = ac(a);
          var d = [];
          for (var e = M(c); e; e = M(c)) d.push(e instanceof ub ? e.a : e);
          this.snapshotLength = a.l;
          this.invalidIteratorState = !1;
          break;
        case 8:
        case 9:
          a = Zb(a);
          this.singleNodeValue = a instanceof ub ? a.a : a;
          break;
        default:
          throw Error("Unknown XPathResult type.");
      }
      var f = 0;
      this.iterateNext = function () {
        if (4 != b && 5 != b)
          throw Error("iterateNext called with wrong result type");
        return f >= d.length ? null : d[f++];
      };
      this.snapshotItem = function (a) {
        if (6 != b && 7 != b)
          throw Error("snapshotItem called with wrong result type");
        return a >= d.length || 0 > a ? null : d[a];
      };
    }
    V.ANY_TYPE = 0;
    V.NUMBER_TYPE = 1;
    V.STRING_TYPE = 2;
    V.BOOLEAN_TYPE = 3;
    V.UNORDERED_NODE_ITERATOR_TYPE = 4;
    V.ORDERED_NODE_ITERATOR_TYPE = 5;
    V.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
    V.ORDERED_NODE_SNAPSHOT_TYPE = 7;
    V.ANY_UNORDERED_NODE_TYPE = 8;
    V.FIRST_ORDERED_NODE_TYPE = 9;
    function Sc(a) {
      this.lookupNamespaceURI = Ia(a);
    }
    function Tc(a, b) {
      a = a || k;
      var c = (a.Document && a.Document.prototype) || a.document;
      if (!c.evaluate || b)
        (a.XPathResult = V),
          (c.evaluate = function (a, b, c, g) {
            return new Rc(a, c).evaluate(b, g);
          }),
          (c.createExpression = function (a, b) {
            return new Rc(a, b);
          }),
          (c.createNSResolver = function (a) {
            return new Sc(a);
          });
    }
    aa("wgxpath.install", Tc);
    var W = {};
    W.F = (function () {
      var a = { V: "http://www.w3.org/2000/svg" };
      return function (b) {
        return a[b] || null;
      };
    })();
    W.m = function (a, b, c) {
      var d = I(a);
      if (!d.documentElement) return null;
      (C || pb) && Tc(d ? d.parentWindow || d.defaultView : window);
      try {
        var e = d.createNSResolver
          ? d.createNSResolver(d.documentElement)
          : W.F;
        if (C && !jb(7)) return d.evaluate.call(d, b, a, e, c, null);
        if (!C || 9 <= Number(D)) {
          for (
            var f = {}, g = d.getElementsByTagName("*"), h = 0;
            h < g.length;
            ++h
          ) {
            var v = g[h],
              t = v.namespaceURI;
            if (t && !f[t]) {
              var m = v.lookupPrefix(t);
              if (!m) {
                var E = t.match(".*/(\\w+)/?$");
                m = E ? E[1] : "xhtml";
              }
              f[t] = m;
            }
          }
          var P = {},
            ea;
          for (ea in f) P[f[ea]] = ea;
          e = function (a) {
            return P[a] || null;
          };
        }
        try {
          return d.evaluate(b, a, e, c, null);
        } catch (Aa) {
          if ("TypeError" === Aa.name)
            return (
              (e = d.createNSResolver
                ? d.createNSResolver(d.documentElement)
                : W.F),
              d.evaluate(b, a, e, c, null)
            );
          throw Aa;
        }
      } catch (Aa) {
        if (!cb || "NS_ERROR_ILLEGAL_VALUE" != Aa.name)
          throw new q(
            32,
            "Unable to locate an element with the xpath expression " +
              b +
              " because of the following error:\n" +
              Aa
          );
      }
    };
    W.G = function (a, b) {
      if (!a || 1 != a.nodeType)
        throw new q(
          32,
          'The result of the xpath expression "' +
            b +
            '" is: ' +
            a +
            ". It should be an element."
        );
    };
    W.o = function (a, b) {
      var c = (function () {
        var c = W.m(b, a, 9);
        return c
          ? c.singleNodeValue || null
          : b.selectSingleNode
          ? ((c = I(b)),
            c.setProperty && c.setProperty("SelectionLanguage", "XPath"),
            b.selectSingleNode(a))
          : null;
      })();
      null === c || W.G(c, a);
      return c;
    };
    W.s = function (a, b) {
      var c = (function () {
        var c = W.m(b, a, 7);
        if (c) {
          for (var e = c.snapshotLength, f = [], g = 0; g < e; ++g)
            f.push(c.snapshotItem(g));
          return f;
        }
        return b.selectNodes
          ? ((c = I(b)),
            c.setProperty && c.setProperty("SelectionLanguage", "XPath"),
            b.selectNodes(a))
          : [];
      })();
      B(c, function (b) {
        W.G(b, a);
      });
      return c;
    };
    var Uc = "function" === typeof ShadowRoot;
    function Vc(a) {
      for (
        a = a.parentNode;
        a && 1 != a.nodeType && 9 != a.nodeType && 11 != a.nodeType;

      )
        a = a.parentNode;
      return L(a) ? a : null;
    }
    function X(a, b) {
      b = va(b);
      if ("float" == b || "cssFloat" == b || "styleFloat" == b)
        b = Ab ? "styleFloat" : "cssFloat";
      a: {
        var c = b;
        var d = I(a);
        if (
          d.defaultView &&
          d.defaultView.getComputedStyle &&
          (d = d.defaultView.getComputedStyle(a, null))
        ) {
          c = d[c] || d.getPropertyValue(c) || "";
          break a;
        }
        c = "";
      }
      a = c || Wc(a, b);
      if (null === a) a = null;
      else if (0 <= La(Ua, b)) {
        b: {
          var e = a.match(Xa);
          if (
            e &&
            ((b = Number(e[1])),
            (c = Number(e[2])),
            (d = Number(e[3])),
            (e = Number(e[4])),
            0 <= b &&
              255 >= b &&
              0 <= c &&
              255 >= c &&
              0 <= d &&
              255 >= d &&
              0 <= e &&
              1 >= e)
          ) {
            b = [b, c, d, e];
            break b;
          }
          b = null;
        }
        if (!b)
          b: {
            if ((d = a.match(Ya)))
              if (
                ((b = Number(d[1])),
                (c = Number(d[2])),
                (d = Number(d[3])),
                0 <= b && 255 >= b && 0 <= c && 255 >= c && 0 <= d && 255 >= d)
              ) {
                b = [b, c, d, 1];
                break b;
              }
            b = null;
          }
        if (!b)
          b: {
            b = a.toLowerCase();
            c = ma[b.toLowerCase()];
            if (
              !c &&
              ((c = "#" == b.charAt(0) ? b : "#" + b),
              4 == c.length && (c = c.replace(Va, "#$1$1$2$2$3$3")),
              !Wa.test(c))
            ) {
              b = null;
              break b;
            }
            b = [
              parseInt(c.substr(1, 2), 16),
              parseInt(c.substr(3, 2), 16),
              parseInt(c.substr(5, 2), 16),
              1,
            ];
          }
        a = b ? "rgba(" + b.join(", ") + ")" : a;
      }
      return a;
    }
    function Wc(a, b) {
      var c = a.currentStyle || a.style,
        d = c[b];
      !l(d) && ca(c.getPropertyValue) && (d = c.getPropertyValue(b));
      return "inherit" != d ? (l(d) ? d : null) : (a = Vc(a)) ? Wc(a, b) : null;
    }
    function Xc(a, b, c) {
      function d(a) {
        var b = Yc(a);
        return 0 < b.height && 0 < b.width
          ? !0
          : L(a, "PATH") && (0 < b.height || 0 < b.width)
          ? ((a = X(a, "stroke-width")), !!a && 0 < parseInt(a, 10))
          : "hidden" != X(a, "overflow") &&
            Oa(a.childNodes, function (a) {
              return 3 == a.nodeType || (L(a) && d(a));
            });
      }
      function e(a) {
        return (
          Zc(a) == Y &&
          Pa(a.childNodes, function (a) {
            return !L(a) || e(a) || !d(a);
          })
        );
      }
      if (!L(a)) throw Error("Argument to isShown must be of type Element");
      if (L(a, "BODY")) return !0;
      if (L(a, "OPTION") || L(a, "OPTGROUP"))
        return (
          (a = Hb(a, function (a) {
            return L(a, "SELECT");
          })),
          !!a && Xc(a, !0, c)
        );
      var f = $c(a);
      if (f)
        return !!f.H && 0 < f.rect.width && 0 < f.rect.height && Xc(f.H, b, c);
      if (
        (L(a, "INPUT") && "hidden" == a.type.toLowerCase()) ||
        L(a, "NOSCRIPT")
      )
        return !1;
      f = X(a, "visibility");
      return "collapse" != f &&
        "hidden" != f &&
        c(a) &&
        (b || 0 != ad(a)) &&
        d(a)
        ? !e(a)
        : !1;
    }
    function bd(a) {
      function b(a) {
        if (L(a) && "none" == X(a, "display")) return !1;
        var c;
        (c = a.parentNode) && c.shadowRoot && void 0 !== a.assignedSlot
          ? (c = a.assignedSlot ? a.assignedSlot.parentNode : null)
          : a.getDestinationInsertionPoints &&
            ((a = a.getDestinationInsertionPoints()),
            0 < a.length && (c = a[a.length - 1]));
        if (Uc && c instanceof ShadowRoot) {
          if (c.host.shadowRoot !== c) return !1;
          c = c.host;
        }
        return !c || (9 != c.nodeType && 11 != c.nodeType) ? c && b(c) : !0;
      }
      return Xc(a, !1, b);
    }
    var Y = "hidden";
    function Zc(a) {
      function b(a) {
        function b(a) {
          return a == g
            ? !0
            : 0 == X(a, "display").lastIndexOf("inline", 0) ||
              ("absolute" == c && "static" == X(a, "position"))
            ? !1
            : !0;
        }
        var c = X(a, "position");
        if ("fixed" == c) return (t = !0), a == g ? null : g;
        for (a = Vc(a); a && !b(a); ) a = Vc(a);
        return a;
      }
      function c(a) {
        var b = a;
        if ("visible" == v)
          if (a == g && h) b = h;
          else if (a == h) return { x: "visible", y: "visible" };
        b = { x: X(b, "overflow-x"), y: X(b, "overflow-y") };
        a == g &&
          ((b.x = "visible" == b.x ? "auto" : b.x),
          (b.y = "visible" == b.y ? "auto" : b.y));
        return b;
      }
      function d(a) {
        if (a == g) {
          var b = new Bb(f).a;
          a = b.scrollingElement
            ? b.scrollingElement
            : db || "CSS1Compat" != b.compatMode
            ? b.body || b.documentElement
            : b.documentElement;
          b = b.parentWindow || b.defaultView;
          a =
            C && jb("10") && b.pageYOffset != a.scrollTop
              ? new $a(a.scrollLeft, a.scrollTop)
              : new $a(
                  b.pageXOffset || a.scrollLeft,
                  b.pageYOffset || a.scrollTop
                );
        } else a = new $a(a.scrollLeft, a.scrollTop);
        return a;
      }
      var e = cd(a),
        f = I(a),
        g = f.documentElement,
        h = f.body,
        v = X(g, "overflow"),
        t;
      for (a = b(a); a; a = b(a)) {
        var m = c(a);
        if ("visible" != m.x || "visible" != m.y) {
          var E = Yc(a);
          if (0 == E.width || 0 == E.height) return Y;
          var P = e.a < E.a,
            ea = e.b < E.b;
          if ((P && "hidden" == m.x) || (ea && "hidden" == m.y)) return Y;
          if ((P && "visible" != m.x) || (ea && "visible" != m.y)) {
            P = d(a);
            ea = e.b < E.b - P.y;
            if (
              (e.a < E.a - P.x && "visible" != m.x) ||
              (ea && "visible" != m.x)
            )
              return Y;
            e = Zc(a);
            return e == Y ? Y : "scroll";
          }
          P = e.f >= E.a + E.width;
          E = e.c >= E.b + E.height;
          if ((P && "hidden" == m.x) || (E && "hidden" == m.y)) return Y;
          if ((P && "visible" != m.x) || (E && "visible" != m.y)) {
            if (
              t &&
              ((m = d(a)),
              e.f >= g.scrollWidth - m.x || e.a >= g.scrollHeight - m.y)
            )
              return Y;
            e = Zc(a);
            return e == Y ? Y : "scroll";
          }
        }
      }
      return "none";
    }
    function Yc(a) {
      var b = $c(a);
      if (b) return b.rect;
      if (L(a, "HTML"))
        return (
          (a = I(a)),
          (a = ((a ? a.parentWindow || a.defaultView : window) || window)
            .document),
          (a = "CSS1Compat" == a.compatMode ? a.documentElement : a.body),
          (a = new oa(a.clientWidth, a.clientHeight)),
          new G(0, 0, a.width, a.height)
        );
      try {
        var c = a.getBoundingClientRect();
      } catch (d) {
        return new G(0, 0, 0, 0);
      }
      b = new G(c.left, c.top, c.right - c.left, c.bottom - c.top);
      C &&
        a.ownerDocument.body &&
        ((a = I(a)),
        (b.a -= a.documentElement.clientLeft + a.body.clientLeft),
        (b.b -= a.documentElement.clientTop + a.body.clientTop));
      return b;
    }
    function $c(a) {
      var b = L(a, "MAP");
      if (!b && !L(a, "AREA")) return null;
      var c = b ? a : L(a.parentNode, "MAP") ? a.parentNode : null,
        d = null,
        e = null;
      c &&
        c.name &&
        (d = W.o('/descendant::*[@usemap = "#' + c.name + '"]', I(c))) &&
        ((e = Yc(d)),
        b ||
          "default" == a.shape.toLowerCase() ||
          ((a = dd(a)),
          (b = Math.min(Math.max(a.a, 0), e.width)),
          (c = Math.min(Math.max(a.b, 0), e.height)),
          (e = new G(
            b + e.a,
            c + e.b,
            Math.min(a.width, e.width - b),
            Math.min(a.height, e.height - c)
          ))));
      return { H: d, rect: e || new G(0, 0, 0, 0) };
    }
    function dd(a) {
      var b = a.shape.toLowerCase();
      a = a.coords.split(",");
      if ("rect" == b && 4 == a.length) {
        b = a[0];
        var c = a[1];
        return new G(b, c, a[2] - b, a[3] - c);
      }
      if ("circle" == b && 3 == a.length)
        return (b = a[2]), new G(a[0] - b, a[1] - b, 2 * b, 2 * b);
      if ("poly" == b && 2 < a.length) {
        b = a[0];
        c = a[1];
        for (var d = b, e = c, f = 2; f + 1 < a.length; f += 2)
          (b = Math.min(b, a[f])),
            (d = Math.max(d, a[f])),
            (c = Math.min(c, a[f + 1])),
            (e = Math.max(e, a[f + 1]));
        return new G(b, c, d - b, e - c);
      }
      return new G(0, 0, 0, 0);
    }
    function cd(a) {
      a = Yc(a);
      return new lb(a.b, a.a + a.width, a.b + a.height, a.a);
    }
    function ed(a) {
      return a.replace(/^[^\S\xa0]+|[^\S\xa0]+$/g, "");
    }
    function fd(a) {
      var b = [];
      Uc ? gd(a, b) : hd(a, b);
      var c = b;
      a = c.length;
      b = Array(a);
      c = n(c) ? c.split("") : c;
      for (var d = 0; d < a; d++) d in c && (b[d] = ed.call(void 0, c[d]));
      return ed(b.join("\n")).replace(/\xa0/g, " ");
    }
    function id(a, b, c) {
      if (L(a, "BR")) b.push("");
      else {
        var d = L(a, "TD"),
          e = X(a, "display"),
          f = !d && !(0 <= La(jd, e)),
          g = l(a.previousElementSibling)
            ? a.previousElementSibling
            : Cb(a.previousSibling);
        g = g ? X(g, "display") : "";
        var h = X(a, "float") || X(a, "cssFloat") || X(a, "styleFloat");
        !f ||
          ("run-in" == g && "none" == h) ||
          /^[\s\xa0]*$/.test(b[b.length - 1] || "") ||
          b.push("");
        var v = bd(a),
          t = null,
          m = null;
        v && ((t = X(a, "white-space")), (m = X(a, "text-transform")));
        B(a.childNodes, function (a) {
          c(a, b, v, t, m);
        });
        a = b[b.length - 1] || "";
        (!d && "table-cell" != e) || !a || ra(a) || (b[b.length - 1] += " ");
        f && "run-in" != e && !/^[\s\xa0]*$/.test(a) && b.push("");
      }
    }
    function hd(a, b) {
      id(a, b, function (a, b, e, f, g) {
        3 == a.nodeType && e ? kd(a, b, f, g) : L(a) && hd(a, b);
      });
    }
    var jd = "inline inline-block inline-table none table-cell table-column table-column-group".split(
      " "
    );
    function kd(a, b, c, d) {
      a = a.nodeValue.replace(/[\u200b\u200e\u200f]/g, "");
      a = a.replace(/(\r\n|\r|\n)/g, "\n");
      if ("normal" == c || "nowrap" == c) a = a.replace(/\n/g, " ");
      a =
        "pre" == c || "pre-wrap" == c
          ? a.replace(/[ \f\t\v\u2028\u2029]/g, "\u00a0")
          : a.replace(/[ \f\t\v\u2028\u2029]+/g, " ");
      "capitalize" == d
        ? (a = a.replace(/(^|\s)(\S)/g, function (a, b, c) {
            return b + c.toUpperCase();
          }))
        : "uppercase" == d
        ? (a = a.toUpperCase())
        : "lowercase" == d && (a = a.toLowerCase());
      c = b.pop() || "";
      ra(c) && 0 == a.lastIndexOf(" ", 0) && (a = a.substr(1));
      b.push(c + a);
    }
    function ad(a) {
      if (Ab) {
        if ("relative" == X(a, "position")) return 1;
        a = X(a, "filter");
        return (a =
          a.match(/^alpha\(opacity=(\d*)\)/) ||
          a.match(/^progid:DXImageTransform.Microsoft.Alpha\(Opacity=(\d*)\)/))
          ? Number(a[1]) / 100
          : 1;
      }
      return ld(a);
    }
    function ld(a) {
      var b = 1,
        c = X(a, "opacity");
      c && (b = Number(c));
      (a = Vc(a)) && (b *= ld(a));
      return b;
    }
    function md(a, b, c, d, e) {
      if (3 == a.nodeType && c) kd(a, b, d, e);
      else if (L(a))
        if (L(a, "CONTENT") || L(a, "SLOT")) {
          for (var f = a; f.parentNode; ) f = f.parentNode;
          f instanceof ShadowRoot
            ? ((a = L(a, "CONTENT")
                ? a.getDistributedNodes()
                : a.assignedNodes()),
              B(a, function (a) {
                md(a, b, c, d, e);
              }))
            : gd(a, b);
        } else if (L(a, "SHADOW")) {
          for (f = a; f.parentNode; ) f = f.parentNode;
          if (f instanceof ShadowRoot && (a = f))
            for (a = a.olderShadowRoot; a; )
              B(a.childNodes, function (a) {
                md(a, b, c, d, e);
              }),
                (a = a.olderShadowRoot);
        } else gd(a, b);
    }
    function gd(a, b) {
      a.shadowRoot &&
        B(a.shadowRoot.childNodes, function (a) {
          md(a, b, !0, null, null);
        });
      id(a, b, function (a, b, e, f, g) {
        var c = null;
        1 == a.nodeType ? (c = a) : 3 == a.nodeType && (c = a);
        (null != c &&
          (null != c.assignedSlot ||
            (c.getDestinationInsertionPoints &&
              0 < c.getDestinationInsertionPoints().length))) ||
          md(a, b, e, f, g);
      });
    }
    var nd = {
      A: function (a, b) {
        return !(!a.querySelectorAll || !a.querySelector) && !/^\d.*/.test(b);
      },
      o: function (a, b) {
        var c = H(b),
          d = n(a) ? c.a.getElementById(a) : a;
        return d
          ? Rb(d, "id") == a && b != d && Db(b, d)
            ? d
            : Qa(Ib(c, "*"), function (c) {
                return Rb(c, "id") == a && b != c && Db(b, c);
              })
          : null;
      },
      s: function (a, b) {
        if (!a) return [];
        if (nd.A(b, a))
          try {
            return b.querySelectorAll("#" + nd.M(a));
          } catch (c) {
            return [];
          }
        b = Ib(H(b), "*", null, b);
        return Ma(b, function (b) {
          return Rb(b, "id") == a;
        });
      },
      M: function (a) {
        return a.replace(
          /([\s'"\\#.:;,!?+<>=~*^$|%&@`{}\-\/\[\]\(\)])/g,
          "\\$1"
        );
      },
    };
    var Z = {},
      od = {};
    Z.L = function (a, b, c) {
      try {
        var d = Vb.s("a", b);
      } catch (e) {
        d = Ib(H(b), "A", null, b);
      }
      return Qa(d, function (b) {
        b = fd(b);
        b = b.replace(/^[\s]+|[\s]+$/g, "");
        return (c && -1 != b.indexOf(a)) || b == a;
      });
    };
    Z.I = function (a, b, c) {
      try {
        var d = Vb.s("a", b);
      } catch (e) {
        d = Ib(H(b), "A", null, b);
      }
      return Ma(d, function (b) {
        b = fd(b);
        b = b.replace(/^[\s]+|[\s]+$/g, "");
        return (c && -1 != b.indexOf(a)) || b == a;
      });
    };
    Z.o = function (a, b) {
      return Z.L(a, b, !1);
    };
    Z.s = function (a, b) {
      return Z.I(a, b, !1);
    };
    od.o = function (a, b) {
      return Z.L(a, b, !0);
    };
    od.s = function (a, b) {
      return Z.I(a, b, !0);
    };
    var pd = {
      className: Ub,
      "class name": Ub,
      css: Vb,
      "css selector": Vb,
      id: nd,
      linkText: Z,
      "link text": Z,
      name: {
        o: function (a, b) {
          b = Ib(H(b), "*", null, b);
          return Qa(b, function (b) {
            return Rb(b, "name") == a;
          });
        },
        s: function (a, b) {
          b = Ib(H(b), "*", null, b);
          return Ma(b, function (b) {
            return Rb(b, "name") == a;
          });
        },
      },
      partialLinkText: od,
      "partial link text": od,
      tagName: Da,
      "tag name": Da,
      xpath: W,
    };
    aa("_", function (a, b) {
      a: {
        for (c in a) if (a.hasOwnProperty(c)) break a;
        var c = null;
      }
      if (c) {
        var d = pd[c];
        if (d && ca(d.o)) return d.o(a[c], b || ka.document);
      }
      throw new q(61, "Unsupported locator strategy: " + c);
    });
    return this._.apply(null, arguments);
  }.apply(
    {
      navigator: typeof window != "undefined" ? window.navigator : null,
      document: typeof window != "undefined" ? window.document : null,
    },
    arguments
  );
};
