(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.PuppeteerRecorder = factory());
}(this, (function () { 'use strict';

    var Limit;
    (function (Limit) {
        Limit[Limit["All"] = 0] = "All";
        Limit[Limit["Two"] = 1] = "Two";
        Limit[Limit["One"] = 2] = "One";
    })(Limit || (Limit = {}));
    let config;
    let rootDocument;
    function finder(input, options) {
        if (input.nodeType !== Node.ELEMENT_NODE) {
            throw new Error(`Can't generate CSS selector for non-element node type.`);
        }
        if ("html" === input.tagName.toLowerCase()) {
            return "html";
        }
        const defaults = {
            root: document.body,
            idName: (name) => true,
            className: (name) => true,
            tagName: (name) => true,
            attr: (name, value) => false,
            seedMinLength: 1,
            optimizedMinLength: 2,
            threshold: 1000,
            maxNumberOfTries: 10000,
        };
        config = Object.assign(Object.assign({}, defaults), options);
        rootDocument = findRootDocument(config.root, defaults);
        let path = bottomUpSearch(input, Limit.All, () => bottomUpSearch(input, Limit.Two, () => bottomUpSearch(input, Limit.One)));
        if (path) {
            const optimized = sort(optimize(path, input));
            if (optimized.length > 0) {
                path = optimized[0];
            }
            return selector(path);
        }
        else {
            throw new Error(`Selector was not found.`);
        }
    }
    function findRootDocument(rootNode, defaults) {
        if (rootNode.nodeType === Node.DOCUMENT_NODE) {
            return rootNode;
        }
        if (rootNode === defaults.root) {
            return rootNode.ownerDocument;
        }
        return rootNode;
    }
    function bottomUpSearch(input, limit, fallback) {
        let path = null;
        let stack = [];
        let current = input;
        let i = 0;
        while (current && current !== config.root.parentElement) {
            let level = maybe(id(current)) || maybe(...attr(current)) || maybe(...classNames(current)) || maybe(tagName(current)) || [any()];
            const nth = index(current);
            if (limit === Limit.All) {
                if (nth) {
                    level = level.concat(level.filter(dispensableNth).map(node => nthChild(node, nth)));
                }
            }
            else if (limit === Limit.Two) {
                level = level.slice(0, 1);
                if (nth) {
                    level = level.concat(level.filter(dispensableNth).map(node => nthChild(node, nth)));
                }
            }
            else if (limit === Limit.One) {
                const [node] = level = level.slice(0, 1);
                if (nth && dispensableNth(node)) {
                    level = [nthChild(node, nth)];
                }
            }
            for (let node of level) {
                node.level = i;
            }
            stack.push(level);
            if (stack.length >= config.seedMinLength) {
                path = findUniquePath(stack, fallback);
                if (path) {
                    break;
                }
            }
            current = current.parentElement;
            i++;
        }
        if (!path) {
            path = findUniquePath(stack, fallback);
        }
        return path;
    }
    function findUniquePath(stack, fallback) {
        const paths = sort(combinations(stack));
        if (paths.length > config.threshold) {
            return fallback ? fallback() : null;
        }
        for (let candidate of paths) {
            if (unique(candidate)) {
                return candidate;
            }
        }
        return null;
    }
    function selector(path) {
        let node = path[0];
        let query = node.name;
        for (let i = 1; i < path.length; i++) {
            const level = path[i].level || 0;
            if (node.level === level - 1) {
                query = `${path[i].name} > ${query}`;
            }
            else {
                query = `${path[i].name} ${query}`;
            }
            node = path[i];
        }
        return query;
    }
    function penalty(path) {
        return path.map(node => node.penalty).reduce((acc, i) => acc + i, 0);
    }
    function unique(path) {
        switch (rootDocument.querySelectorAll(selector(path)).length) {
            case 0:
                throw new Error(`Can't select any node with this selector: ${selector(path)}`);
            case 1:
                return true;
            default:
                return false;
        }
    }
    function id(input) {
        const elementId = input.getAttribute("id");
        if (elementId && config.idName(elementId)) {
            return {
                name: "#" + cssesc(elementId, { isIdentifier: true }),
                penalty: 0,
            };
        }
        return null;
    }
    function attr(input) {
        const attrs = Array.from(input.attributes).filter((attr) => config.attr(attr.name, attr.value));
        return attrs.map((attr) => ({
            name: "[" + cssesc(attr.name, { isIdentifier: true }) + "=\"" + cssesc(attr.value) + "\"]",
            penalty: 0.5
        }));
    }
    function classNames(input) {
        const names = Array.from(input.classList)
            .filter(config.className);
        return names.map((name) => ({
            name: "." + cssesc(name, { isIdentifier: true }),
            penalty: 1
        }));
    }
    function tagName(input) {
        const name = input.tagName.toLowerCase();
        if (config.tagName(name)) {
            return {
                name,
                penalty: 2
            };
        }
        return null;
    }
    function any() {
        return {
            name: "*",
            penalty: 3
        };
    }
    function index(input) {
        const parent = input.parentNode;
        if (!parent) {
            return null;
        }
        let child = parent.firstChild;
        if (!child) {
            return null;
        }
        let i = 0;
        while (child) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                i++;
            }
            if (child === input) {
                break;
            }
            child = child.nextSibling;
        }
        return i;
    }
    function nthChild(node, i) {
        return {
            name: node.name + `:nth-child(${i})`,
            penalty: node.penalty + 1
        };
    }
    function dispensableNth(node) {
        return node.name !== "html" && !node.name.startsWith("#");
    }
    function maybe(...level) {
        const list = level.filter(notEmpty);
        if (list.length > 0) {
            return list;
        }
        return null;
    }
    function notEmpty(value) {
        return value !== null && value !== undefined;
    }
    function* combinations(stack, path = []) {
        if (stack.length > 0) {
            for (let node of stack[0]) {
                yield* combinations(stack.slice(1, stack.length), path.concat(node));
            }
        }
        else {
            yield path;
        }
    }
    function sort(paths) {
        return Array.from(paths).sort((a, b) => penalty(a) - penalty(b));
    }
    function* optimize(path, input, scope = {
        counter: 0,
        visited: new Map()
    }) {
        if (path.length > 2 && path.length > config.optimizedMinLength) {
            for (let i = 1; i < path.length - 1; i++) {
                if (scope.counter > config.maxNumberOfTries) {
                    return; // Okay At least I tried!
                }
                scope.counter += 1;
                const newPath = [...path];
                newPath.splice(i, 1);
                const newPathKey = selector(newPath);
                if (scope.visited.has(newPathKey)) {
                    return;
                }
                if (unique(newPath) && same(newPath, input)) {
                    yield newPath;
                    scope.visited.set(newPathKey, true);
                    yield* optimize(newPath, input, scope);
                }
            }
        }
    }
    function same(path, input) {
        return rootDocument.querySelector(selector(path)) === input;
    }
    const regexAnySingleEscape = /[ -,\.\/:-@\[-\^`\{-~]/;
    const regexSingleEscape = /[ -,\.\/:-@\[\]\^`\{-~]/;
    const regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;
    const defaultOptions = {
        "escapeEverything": false,
        "isIdentifier": false,
        "quotes": "single",
        "wrap": false
    };
    function cssesc(string, opt = {}) {
        const options = Object.assign(Object.assign({}, defaultOptions), opt);
        if (options.quotes != "single" && options.quotes != "double") {
            options.quotes = "single";
        }
        const quote = options.quotes == "double" ? "\"" : "'";
        const isIdentifier = options.isIdentifier;
        const firstChar = string.charAt(0);
        let output = "";
        let counter = 0;
        const length = string.length;
        while (counter < length) {
            const character = string.charAt(counter++);
            let codePoint = character.charCodeAt(0);
            let value = void 0;
            // If it’s not a printable ASCII character…
            if (codePoint < 0x20 || codePoint > 0x7E) {
                if (codePoint >= 0xD800 && codePoint <= 0xDBFF && counter < length) {
                    // It’s a high surrogate, and there is a next character.
                    const extra = string.charCodeAt(counter++);
                    if ((extra & 0xFC00) == 0xDC00) {
                        // next character is low surrogate
                        codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
                    }
                    else {
                        // It’s an unmatched surrogate; only append this code unit, in case
                        // the next code unit is the high surrogate of a surrogate pair.
                        counter--;
                    }
                }
                value = "\\" + codePoint.toString(16).toUpperCase() + " ";
            }
            else {
                if (options.escapeEverything) {
                    if (regexAnySingleEscape.test(character)) {
                        value = "\\" + character;
                    }
                    else {
                        value = "\\" + codePoint.toString(16).toUpperCase() + " ";
                    }
                }
                else if (/[\t\n\f\r\x0B]/.test(character)) {
                    value = "\\" + codePoint.toString(16).toUpperCase() + " ";
                }
                else if (character == "\\" || !isIdentifier && (character == "\"" && quote == character || character == "'" && quote == character) || isIdentifier && regexSingleEscape.test(character)) {
                    value = "\\" + character;
                }
                else {
                    value = character;
                }
            }
            output += value;
        }
        if (isIdentifier) {
            if (/^-[-\d]/.test(output)) {
                output = "\\-" + output.slice(1);
            }
            else if (/\d/.test(firstChar)) {
                output = "\\3" + firstChar + " " + output.slice(1);
            }
        }
        // Remove spaces after `\HEX` escapes that are not followed by a hex digit,
        // since they’re redundant. Note that this is only possible if the escape
        // sequence isn’t preceded by an odd number of backslashes.
        output = output.replace(regexExcessiveSpaces, function ($0, $1, $2) {
            if ($1 && $1.length % 2) {
                // It’s not safe to remove the space, so don’t.
                return $0;
            }
            // Strip the space.
            return ($1 || "") + $2;
        });
        if (!isIdentifier && options.wrap) {
            return quote + output + quote;
        }
        return output;
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var uaParser = createCommonjsModule(function (module, exports) {
    /*!
     * UAParser.js v0.7.21
     * Lightweight JavaScript-based User-Agent string parser
     * https://github.com/faisalman/ua-parser-js
     *
     * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
     * Licensed under MIT License
     */

    (function (window, undefined$1) {

        //////////////
        // Constants
        /////////////


        var LIBVERSION  = '0.7.21',
            EMPTY       = '',
            UNKNOWN     = '?',
            FUNC_TYPE   = 'function',
            OBJ_TYPE    = 'object',
            STR_TYPE    = 'string',
            MAJOR       = 'major', // deprecated
            MODEL       = 'model',
            NAME        = 'name',
            TYPE        = 'type',
            VENDOR      = 'vendor',
            VERSION     = 'version',
            ARCHITECTURE= 'architecture',
            CONSOLE     = 'console',
            MOBILE      = 'mobile',
            TABLET      = 'tablet',
            SMARTTV     = 'smarttv',
            WEARABLE    = 'wearable',
            EMBEDDED    = 'embedded';


        ///////////
        // Helper
        //////////


        var util = {
            extend : function (regexes, extensions) {
                var mergedRegexes = {};
                for (var i in regexes) {
                    if (extensions[i] && extensions[i].length % 2 === 0) {
                        mergedRegexes[i] = extensions[i].concat(regexes[i]);
                    } else {
                        mergedRegexes[i] = regexes[i];
                    }
                }
                return mergedRegexes;
            },
            has : function (str1, str2) {
              if (typeof str1 === "string") {
                return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
              } else {
                return false;
              }
            },
            lowerize : function (str) {
                return str.toLowerCase();
            },
            major : function (version) {
                return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g,'').split(".")[0] : undefined$1;
            },
            trim : function (str) {
              return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            }
        };


        ///////////////
        // Map helper
        //////////////


        var mapper = {

            rgx : function (ua, arrays) {

                var i = 0, j, k, p, q, matches, match;

                // loop through all regexes maps
                while (i < arrays.length && !matches) {

                    var regex = arrays[i],       // even sequence (0,2,4,..)
                        props = arrays[i + 1];   // odd sequence (1,3,5,..)
                    j = k = 0;

                    // try matching uastring with regexes
                    while (j < regex.length && !matches) {

                        matches = regex[j++].exec(ua);

                        if (!!matches) {
                            for (p = 0; p < props.length; p++) {
                                match = matches[++k];
                                q = props[p];
                                // check if given property is actually array
                                if (typeof q === OBJ_TYPE && q.length > 0) {
                                    if (q.length == 2) {
                                        if (typeof q[1] == FUNC_TYPE) {
                                            // assign modified match
                                            this[q[0]] = q[1].call(this, match);
                                        } else {
                                            // assign given value, ignore regex match
                                            this[q[0]] = q[1];
                                        }
                                    } else if (q.length == 3) {
                                        // check whether function or regex
                                        if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                            // call function (usually string mapper)
                                            this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined$1;
                                        } else {
                                            // sanitize match using given regex
                                            this[q[0]] = match ? match.replace(q[1], q[2]) : undefined$1;
                                        }
                                    } else if (q.length == 4) {
                                            this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined$1;
                                    }
                                } else {
                                    this[q] = match ? match : undefined$1;
                                }
                            }
                        }
                    }
                    i += 2;
                }
            },

            str : function (str, map) {

                for (var i in map) {
                    // check if array
                    if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                        for (var j = 0; j < map[i].length; j++) {
                            if (util.has(map[i][j], str)) {
                                return (i === UNKNOWN) ? undefined$1 : i;
                            }
                        }
                    } else if (util.has(map[i], str)) {
                        return (i === UNKNOWN) ? undefined$1 : i;
                    }
                }
                return str;
            }
        };


        ///////////////
        // String map
        //////////////


        var maps = {

            browser : {
                oldsafari : {
                    version : {
                        '1.0'   : '/8',
                        '1.2'   : '/1',
                        '1.3'   : '/3',
                        '2.0'   : '/412',
                        '2.0.2' : '/416',
                        '2.0.3' : '/417',
                        '2.0.4' : '/419',
                        '?'     : '/'
                    }
                }
            },

            device : {
                amazon : {
                    model : {
                        'Fire Phone' : ['SD', 'KF']
                    }
                },
                sprint : {
                    model : {
                        'Evo Shift 4G' : '7373KT'
                    },
                    vendor : {
                        'HTC'       : 'APA',
                        'Sprint'    : 'Sprint'
                    }
                }
            },

            os : {
                windows : {
                    version : {
                        'ME'        : '4.90',
                        'NT 3.11'   : 'NT3.51',
                        'NT 4.0'    : 'NT4.0',
                        '2000'      : 'NT 5.0',
                        'XP'        : ['NT 5.1', 'NT 5.2'],
                        'Vista'     : 'NT 6.0',
                        '7'         : 'NT 6.1',
                        '8'         : 'NT 6.2',
                        '8.1'       : 'NT 6.3',
                        '10'        : ['NT 6.4', 'NT 10.0'],
                        'RT'        : 'ARM'
                    }
                }
            }
        };


        //////////////
        // Regex map
        /////////////


        var regexes = {

            browser : [[

                // Presto based
                /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
                /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
                /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
                /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80
                ], [NAME, VERSION], [

                /(opios)[\/\s]+([\w\.]+)/i                                          // Opera mini on iphone >= 8.0
                ], [[NAME, 'Opera Mini'], VERSION], [

                /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
                ], [[NAME, 'Opera'], VERSION], [

                // Mixed
                /(kindle)\/([\w\.]+)/i,                                             // Kindle
                /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i,
                                                                                    // Lunascape/Maxthon/Netfront/Jasmine/Blazer
                // Trident based
                /(avant\s|iemobile|slim)(?:browser)?[\/\s]?([\w\.]*)/i,
                                                                                    // Avant/IEMobile/SlimBrowser
                /(bidubrowser|baidubrowser)[\/\s]?([\w\.]+)/i,                      // Baidu Browser
                /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

                // Webkit/KHTML based
                /(rekonq)\/([\w\.]*)/i,                                             // Rekonq
                /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon)\/([\w\.-]+)/i
                                                                                    // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
                ], [NAME, VERSION], [

                /(konqueror)\/([\w\.]+)/i                                           // Konqueror
                ], [[NAME, 'Konqueror'], VERSION], [

                /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
                ], [[NAME, 'IE'], VERSION], [

                /(edge|edgios|edga|edg)\/((\d+)?[\w\.]+)/i                          // Microsoft Edge
                ], [[NAME, 'Edge'], VERSION], [

                /(yabrowser)\/([\w\.]+)/i                                           // Yandex
                ], [[NAME, 'Yandex'], VERSION], [

                /(Avast)\/([\w\.]+)/i                                               // Avast Secure Browser
                ], [[NAME, 'Avast Secure Browser'], VERSION], [

                /(AVG)\/([\w\.]+)/i                                                 // AVG Secure Browser
                ], [[NAME, 'AVG Secure Browser'], VERSION], [

                /(puffin)\/([\w\.]+)/i                                              // Puffin
                ], [[NAME, 'Puffin'], VERSION], [

                /(focus)\/([\w\.]+)/i                                               // Firefox Focus
                ], [[NAME, 'Firefox Focus'], VERSION], [

                /(opt)\/([\w\.]+)/i                                                 // Opera Touch
                ], [[NAME, 'Opera Touch'], VERSION], [

                /((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i         // UCBrowser
                ], [[NAME, 'UCBrowser'], VERSION], [

                /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
                ], [[NAME, /_/g, ' '], VERSION], [

                /(windowswechat qbcore)\/([\w\.]+)/i                                // WeChat Desktop for Windows Built-in Browser
                ], [[NAME, 'WeChat(Win) Desktop'], VERSION], [

                /(micromessenger)\/([\w\.]+)/i                                      // WeChat
                ], [[NAME, 'WeChat'], VERSION], [

                /(brave)\/([\w\.]+)/i                                               // Brave browser
                ], [[NAME, 'Brave'], VERSION], [

                /(qqbrowserlite)\/([\w\.]+)/i                                       // QQBrowserLite
                ], [NAME, VERSION], [

                /(QQ)\/([\d\.]+)/i                                                  // QQ, aka ShouQ
                ], [NAME, VERSION], [

                /m?(qqbrowser)[\/\s]?([\w\.]+)/i                                    // QQBrowser
                ], [NAME, VERSION], [

                /(baiduboxapp)[\/\s]?([\w\.]+)/i                                    // Baidu App
                ], [NAME, VERSION], [

                /(2345Explorer)[\/\s]?([\w\.]+)/i                                   // 2345 Browser
                ], [NAME, VERSION], [

                /(MetaSr)[\/\s]?([\w\.]+)/i                                         // SouGouBrowser
                ], [NAME], [

                /(LBBROWSER)/i                                                      // LieBao Browser
                ], [NAME], [

                /xiaomi\/miuibrowser\/([\w\.]+)/i                                   // MIUI Browser
                ], [VERSION, [NAME, 'MIUI Browser']], [

                /;fbav\/([\w\.]+);/i                                                // Facebook App for iOS & Android
                ], [VERSION, [NAME, 'Facebook']], [

                /safari\s(line)\/([\w\.]+)/i,                                       // Line App for iOS
                /android.+(line)\/([\w\.]+)\/iab/i                                  // Line App for Android
                ], [NAME, VERSION], [

                /headlesschrome(?:\/([\w\.]+)|\s)/i                                 // Chrome Headless
                ], [VERSION, [NAME, 'Chrome Headless']], [

                /\swv\).+(chrome)\/([\w\.]+)/i                                      // Chrome WebView
                ], [[NAME, /(.+)/, '$1 WebView'], VERSION], [

                /((?:oculus|samsung)browser)\/([\w\.]+)/i
                ], [[NAME, /(.+(?:g|us))(.+)/, '$1 $2'], VERSION], [                // Oculus / Samsung Browser

                /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i        // Android Browser
                ], [VERSION, [NAME, 'Android Browser']], [

                /(sailfishbrowser)\/([\w\.]+)/i                                     // Sailfish Browser
                ], [[NAME, 'Sailfish Browser'], VERSION], [

                /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i
                                                                                    // Chrome/OmniWeb/Arora/Tizen/Nokia
                ], [NAME, VERSION], [

                /(dolfin)\/([\w\.]+)/i                                              // Dolphin
                ], [[NAME, 'Dolphin'], VERSION], [

                /(qihu|qhbrowser|qihoobrowser|360browser)/i                         // 360
                ], [[NAME, '360 Browser']], [

                /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
                ], [[NAME, 'Chrome'], VERSION], [

                /(coast)\/([\w\.]+)/i                                               // Opera Coast
                ], [[NAME, 'Opera Coast'], VERSION], [

                /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
                ], [VERSION, [NAME, 'Firefox']], [

                /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
                ], [VERSION, [NAME, 'Mobile Safari']], [

                /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
                ], [VERSION, NAME], [

                /webkit.+?(gsa)\/([\w\.]+).+?(mobile\s?safari|safari)(\/[\w\.]+)/i  // Google Search Appliance on iOS
                ], [[NAME, 'GSA'], VERSION], [

                /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
                ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

                /(webkit|khtml)\/([\w\.]+)/i
                ], [NAME, VERSION], [

                // Gecko based
                /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
                ], [[NAME, 'Netscape'], VERSION], [
                /(swiftfox)/i,                                                      // Swiftfox
                /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                                                                                    // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
                /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)$/i,

                                                                                    // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
                /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

                // Other
                /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
                                                                                    // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
                /(links)\s\(([\w\.]+)/i,                                            // Links
                /(gobrowser)\/?([\w\.]*)/i,                                         // GoBrowser
                /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
                /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
                ], [NAME, VERSION]
            ],

            cpu : [[

                /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
                ], [[ARCHITECTURE, 'amd64']], [

                /(ia32(?=;))/i                                                      // IA32 (quicktime)
                ], [[ARCHITECTURE, util.lowerize]], [

                /((?:i[346]|x)86)[;\)]/i                                            // IA32
                ], [[ARCHITECTURE, 'ia32']], [

                // PocketPC mistakenly identified as PowerPC
                /windows\s(ce|mobile);\sppc;/i
                ], [[ARCHITECTURE, 'arm']], [

                /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
                ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

                /(sun4\w)[;\)]/i                                                    // SPARC
                ], [[ARCHITECTURE, 'sparc']], [

                /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+[;l]))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                    // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
                ], [[ARCHITECTURE, util.lowerize]]
            ],

            device : [[

                /\((ipad|playbook);[\w\s\),;-]+(rim|apple)/i                        // iPad/PlayBook
                ], [MODEL, VENDOR, [TYPE, TABLET]], [

                /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
                ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

                /(apple\s{0,1}tv)/i                                                 // Apple TV
                ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple'], [TYPE, SMARTTV]], [

                /(archos)\s(gamepad2?)/i,                                           // Archos
                /(hp).+(touchpad)/i,                                                // HP TouchPad
                /(hp).+(tablet)/i,                                                  // HP Tablet
                /(kindle)\/([\w\.]+)/i,                                             // Kindle
                /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
                /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
                ], [VENDOR, MODEL, [TYPE, TABLET]], [

                /(kf[A-z]+)\sbuild\/.+silk\//i                                      // Kindle Fire HD
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
                /(sd|kf)[0349hijorstuw]+\sbuild\/.+silk\//i                         // Fire Phone
                ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [
                /android.+aft([bms])\sbuild/i                                       // Fire TV
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, SMARTTV]], [

                /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
                ], [MODEL, VENDOR, [TYPE, MOBILE]], [
                /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
                ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

                /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
                /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i,
                                                                                    // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
                /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
                /(asus)-?(\w+)/i                                                    // Asus
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [
                /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
                ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
                                                                                    // Asus Tablets
                /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone|p00c)/i
                ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

                /(sony)\s(tablet\s[ps])\sbuild\//i,                                  // Sony
                /(sony)?(?:sgp.+)\sbuild\//i
                ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
                /android.+\s([c-g]\d{4}|so[-l]\w+)(?=\sbuild\/|\).+chrome\/(?![1-6]{0,1}\d\.))/i
                ], [MODEL, [VENDOR, 'Sony'], [TYPE, MOBILE]], [

                /\s(ouya)\s/i,                                                      // Ouya
                /(nintendo)\s([wids3u]+)/i                                          // Nintendo
                ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

                /android.+;\s(shield)\sbuild/i                                      // Nvidia
                ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

                /(playstation\s[34portablevi]+)/i                                   // Playstation
                ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

                /(sprint\s(\w+))/i                                                  // Sprint Phones
                ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

                /(htc)[;_\s-]+([\w\s]+(?=\)|\sbuild)|\w+)/i,                        // HTC
                /(zte)-(\w*)/i,                                                     // ZTE
                /(alcatel|geeksphone|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i
                                                                                    // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
                ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

                /(nexus\s9)/i                                                       // HTC Nexus 9
                ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [

                /d\/huawei([\w\s-]+)[;\)]/i,
                /(nexus\s6p|vog-l29|ane-lx1|eml-l29)/i                              // Huawei
                ], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [

                /android.+(bah2?-a?[lw]\d{2})/i                                     // Huawei MediaPad
                ], [MODEL, [VENDOR, 'Huawei'], [TYPE, TABLET]], [

                /(microsoft);\s(lumia[\s\w]+)/i                                     // Microsoft Lumia
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [

                /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
                ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
                /(kin\.[onetw]{3})/i                                                // Microsoft Kin
                ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

                                                                                    // Motorola
                /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)[\w\s]+build\//i,
                /mot[\s-]?(\w*)/i,
                /(XT\d{3,4}) build\//i,
                /(nexus\s6)/i
                ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
                /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
                ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

                /hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i            // HbbTV devices
                ], [[VENDOR, util.trim], [MODEL, util.trim], [TYPE, SMARTTV]], [

                /hbbtv.+maple;(\d+)/i
                ], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [

                /\(dtv[\);].+(aquos)/i                                              // Sharp
                ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [

                /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,
                /((SM-T\w+))/i
                ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
                /smart-tv.+(samsung)/i
                ], [VENDOR, [TYPE, SMARTTV], MODEL], [
                /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,
                /(sam[sung]*)[\s-]*(\w+-?[\w-]*)/i,
                /sec-((sgh\w+))/i
                ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [

                /sie-(\w*)/i                                                        // Siemens
                ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

                /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
                /(nokia)[\s_-]?([\w-]*)/i
                ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

                /android[x\d\.\s;]+\s([ab][1-7]\-?[0178a]\d\d?)/i                   // Acer
                ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

                /android.+([vl]k\-?\d{3})\s+build/i                                 // LG Tablet
                ], [MODEL, [VENDOR, 'LG'], [TYPE, TABLET]], [
                /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
                ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
                /(lg) netcast\.tv/i                                                 // LG SmartTV
                ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
                /(nexus\s[45])/i,                                                   // LG
                /lg[e;\s\/-]+(\w*)/i,
                /android.+lg(\-?[\d\w]+)\s+build/i
                ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [

                /(lenovo)\s?(s(?:5000|6000)(?:[\w-]+)|tab(?:[\s\w]+))/i             // Lenovo tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [
                /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
                ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [
                /(lenovo)[_\s-]?([\w-]+)/i
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [

                /linux;.+((jolla));/i                                               // Jolla
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [

                /((pebble))app\/[\d\.]+\s/i                                         // Pebble
                ], [VENDOR, MODEL, [TYPE, WEARABLE]], [

                /android.+;\s(oppo)\s?([\w\s]+)\sbuild/i                            // OPPO
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [

                /crkey/i                                                            // Google Chromecast
                ], [[MODEL, 'Chromecast'], [VENDOR, 'Google'], [TYPE, SMARTTV]], [

                /android.+;\s(glass)\s\d/i                                          // Google Glass
                ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

                /android.+;\s(pixel c)[\s)]/i                                       // Google Pixel C
                ], [MODEL, [VENDOR, 'Google'], [TYPE, TABLET]], [

                /android.+;\s(pixel( [23])?( xl)?)[\s)]/i                              // Google Pixel
                ], [MODEL, [VENDOR, 'Google'], [TYPE, MOBILE]], [

                /android.+;\s(\w+)\s+build\/hm\1/i,                                 // Xiaomi Hongmi 'numeric' models
                /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,               // Xiaomi Hongmi
                /android.+(mi[\s\-_]*(?:a\d|one|one[\s_]plus|note lte)?[\s_]*(?:\d?\w?)[\s_]*(?:plus)?)\s+build/i,    
                                                                                    // Xiaomi Mi
                /android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+))\s+build/i       // Redmi Phones
                ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [
                /android.+(mi[\s\-_]*(?:pad)(?:[\s_]*[\w\s]+))\s+build/i            // Mi Pad tablets
                ],[[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, TABLET]], [
                /android.+;\s(m[1-5]\snote)\sbuild/i                                // Meizu
                ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [
                /(mz)-([\w-]{2,})/i
                ], [[VENDOR, 'Meizu'], MODEL, [TYPE, MOBILE]], [

                /android.+a000(1)\s+build/i,                                        // OnePlus
                /android.+oneplus\s(a\d{4})[\s)]/i
                ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

                /android.+[;\/]\s*(RCT[\d\w]+)\s+build/i                            // RCA Tablets
                ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [

                /android.+[;\/\s]+(Venue[\d\s]{2,7})\s+build/i                      // Dell Venue Tablets
                ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i                         // Verizon Tablet
                ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [

                /android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i     // Barnes & Noble Tablet
                ], [[VENDOR, 'Barnes & Noble'], MODEL, [TYPE, TABLET]], [

                /android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i                           // Barnes & Noble Tablet
                ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [

                /android.+;\s(k88)\sbuild/i                                         // ZTE K Series Tablet
                ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(gen\d{3})\s+build.*49h/i                         // Swiss GEN Mobile
                ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [

                /android.+[;\/]\s*(zur\d{3})\s+build/i                              // Swiss ZUR Tablet
                ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [

                /android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i                         // Zeki Tablets
                ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [

                /(android).+[;\/]\s+([YR]\d{2})\s+build/i,
                /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(\w{5})\sbuild/i        // Dragon Touch Tablet
                ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [

                /android.+[;\/]\s*(NS-?\w{0,9})\sbuild/i                            // Insignia Tablets
                ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [

                /android.+[;\/]\s*((NX|Next)-?\w{0,9})\s+build/i                    // NextBook Tablets
                ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(Xtreme\_)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i
                ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [                    // Voice Xtreme Phones

                /android.+[;\/]\s*(LVTEL\-)?(V1[12])\s+build/i                     // LvTel Phones
                ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [

                /android.+;\s(PH-1)\s/i
                ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [                // Essential PH-1

                /android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i          // Envizen Tablets
                ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(\w{1,9})\s+build/i          // Le Pan Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [

                /android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i                         // MachSpeed Tablets
                ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i                // Trinity Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [

                /android.+[;\/]\s*TU_(1491)\s+build/i                               // Rotor Tablets
                ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [

                /android.+(KS(.+))\s+build/i                                        // Amazon Kindle Tablets
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [

                /android.+(Gigaset)[\s\-]+(Q\w{1,9})\s+build/i                      // Gigaset Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [

                /\s(tablet|tab)[;\/]/i,                                             // Unidentifiable Tablet
                /\s(mobile)(?:[;\/]|\ssafari)/i                                     // Unidentifiable Mobile
                ], [[TYPE, util.lowerize], VENDOR, MODEL], [

                /[\s\/\(](smart-?tv)[;\)]/i                                         // SmartTV
                ], [[TYPE, SMARTTV]], [

                /(android[\w\.\s\-]{0,9});.+build/i                                 // Generic Android Device
                ], [MODEL, [VENDOR, 'Generic']]
            ],

            engine : [[

                /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
                ], [VERSION, [NAME, 'EdgeHTML']], [

                /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i                         // Blink
                ], [VERSION, [NAME, 'Blink']], [

                /(presto)\/([\w\.]+)/i,                                             // Presto
                /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,     
                                                                                    // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
                /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
                /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
                ], [NAME, VERSION], [

                /rv\:([\w\.]{1,9}).+(gecko)/i                                       // Gecko
                ], [VERSION, NAME]
            ],

            os : [[

                // Windows based
                /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
                ], [NAME, VERSION], [
                /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
                /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i,                   // Windows Phone
                /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
                ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
                /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
                ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

                // Mobile/Embedded OS
                /\((bb)(10);/i                                                      // BlackBerry 10
                ], [[NAME, 'BlackBerry'], VERSION], [
                /(blackberry)\w*\/?([\w\.]*)/i,                                     // Blackberry
                /(tizen|kaios)[\/\s]([\w\.]+)/i,                                    // Tizen/KaiOS
                /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|sailfish|contiki)[\/\s-]?([\w\.]*)/i
                                                                                    // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki/Sailfish OS
                ], [NAME, VERSION], [
                /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]*)/i                  // Symbian
                ], [[NAME, 'Symbian'], VERSION], [
                /\((series40);/i                                                    // Series 40
                ], [NAME], [
                /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
                ], [[NAME, 'Firefox OS'], VERSION], [

                // Console
                /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

                // GNU/Linux based
                /(mint)[\/\s\(]?(\w*)/i,                                            // Mint
                /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
                /(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]*)/i,
                                                                                    // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                    // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
                /(hurd|linux)\s?([\w\.]*)/i,                                        // Hurd/Linux
                /(gnu)\s?([\w\.]*)/i                                                // GNU
                ], [NAME, VERSION], [

                /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
                ], [[NAME, 'Chromium OS'], VERSION],[

                // Solaris
                /(sunos)\s?([\w\.\d]*)/i                                            // Solaris
                ], [[NAME, 'Solaris'], VERSION], [

                // BSD based
                /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]*)/i                    // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
                ], [NAME, VERSION],[

                /(haiku)\s(\w+)/i                                                   // Haiku
                ], [NAME, VERSION],[

                /cfnetwork\/.+darwin/i,
                /ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i             // iOS
                ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [

                /(mac\sos\sx)\s?([\w\s\.]*)/i,
                /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
                ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

                // Other
                /((?:open)?solaris)[\/\s-]?([\w\.]*)/i,                             // Solaris
                /(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i,                                // AIX
                /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms|fuchsia)/i,
                                                                                    // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS/Fuchsia
                /(unix)\s?([\w\.]*)/i                                               // UNIX
                ], [NAME, VERSION]
            ]
        };


        /////////////////
        // Constructor
        ////////////////
        var UAParser = function (uastring, extensions) {

            if (typeof uastring === 'object') {
                extensions = uastring;
                uastring = undefined$1;
            }

            if (!(this instanceof UAParser)) {
                return new UAParser(uastring, extensions).getResult();
            }

            var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
            var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

            this.getBrowser = function () {
                var browser = { name: undefined$1, version: undefined$1 };
                mapper.rgx.call(browser, ua, rgxmap.browser);
                browser.major = util.major(browser.version); // deprecated
                return browser;
            };
            this.getCPU = function () {
                var cpu = { architecture: undefined$1 };
                mapper.rgx.call(cpu, ua, rgxmap.cpu);
                return cpu;
            };
            this.getDevice = function () {
                var device = { vendor: undefined$1, model: undefined$1, type: undefined$1 };
                mapper.rgx.call(device, ua, rgxmap.device);
                return device;
            };
            this.getEngine = function () {
                var engine = { name: undefined$1, version: undefined$1 };
                mapper.rgx.call(engine, ua, rgxmap.engine);
                return engine;
            };
            this.getOS = function () {
                var os = { name: undefined$1, version: undefined$1 };
                mapper.rgx.call(os, ua, rgxmap.os);
                return os;
            };
            this.getResult = function () {
                return {
                    ua      : this.getUA(),
                    browser : this.getBrowser(),
                    engine  : this.getEngine(),
                    os      : this.getOS(),
                    device  : this.getDevice(),
                    cpu     : this.getCPU()
                };
            };
            this.getUA = function () {
                return ua;
            };
            this.setUA = function (uastring) {
                ua = uastring;
                return this;
            };
            return this;
        };

        UAParser.VERSION = LIBVERSION;
        UAParser.BROWSER = {
            NAME    : NAME,
            MAJOR   : MAJOR, // deprecated
            VERSION : VERSION
        };
        UAParser.CPU = {
            ARCHITECTURE : ARCHITECTURE
        };
        UAParser.DEVICE = {
            MODEL   : MODEL,
            VENDOR  : VENDOR,
            TYPE    : TYPE,
            CONSOLE : CONSOLE,
            MOBILE  : MOBILE,
            SMARTTV : SMARTTV,
            TABLET  : TABLET,
            WEARABLE: WEARABLE,
            EMBEDDED: EMBEDDED
        };
        UAParser.ENGINE = {
            NAME    : NAME,
            VERSION : VERSION
        };
        UAParser.OS = {
            NAME    : NAME,
            VERSION : VERSION
        };

        ///////////
        // Export
        //////////


        // check js environment
        {
            // nodejs env
            if ( module.exports) {
                exports = module.exports = UAParser;
            }
            exports.UAParser = UAParser;
        }

        // jQuery/Zepto specific (optional)
        // Note:
        //   In AMD env the global scope should be kept clean, but jQuery is an exception.
        //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
        //   and we should catch that.
        var $ = window && (window.jQuery || window.Zepto);
        if ($ && !$.ua) {
            var parser = new UAParser();
            $.ua = parser.getResult();
            $.ua.get = function () {
                return parser.getUA();
            };
            $.ua.set = function (uastring) {
                parser.setUA(uastring);
                var result = parser.getResult();
                for (var prop in result) {
                    $.ua[prop] = result[prop];
                }
            };
        }

    })(typeof window === 'object' ? window : commonjsGlobal);
    });

    // Licensed to the Software Freedom Conservancy (SFC) under one

    const isTest =
      typeof process === "object" && process.env && process.env.NODE_ENV === "test";

    const userAgent = uaParser(window.navigator.userAgent);

    /**
     * Parses a Selenium locator, returning its type and the unprefixed locator
     * string as an object.
     *
     * @param locator  the locator to parse
     */
    function parse_locator(locator) {
      if (!locator) {
        throw new TypeError("Locator cannot be empty");
      }
      const result = locator.match(/^([A-Za-z]+)=.+/);
      if (result) {
        let type = result[1];
        const length = type.length;
        const actualLocator = locator.substring(length + 1);
        return { type: type, string: actualLocator };
      }
      throw new Error(
        "Implicit locators are obsolete, please prepend the strategy (e.g. id=element)."
      );
    }

    /* eslint-disable */
    // GENERATED CODE - DO NOT EDIT
    function findElement() {
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
          for (; a; ) {
            if (b(a)) return a;
            a = a.parentNode;
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
    }

    /*
     * Copyright 2005 Shinya Kasatani
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *      http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    function LocatorBuilders(window) {
      this.window = window;
    }

    LocatorBuilders.prototype.detach = function () {};

    LocatorBuilders.prototype.buildWith = function (name, e, opt_contextNode) {
      return LocatorBuilders.builderMap[name].call(this, e, opt_contextNode);
    };

    LocatorBuilders.prototype.elementEquals = function (name, e, locator) {
      let fe = this.findElement(locator);
      //TODO: add match function to the ui locator builder, note the inverted parameters
      return (
        e == fe ||
        (LocatorBuilders.builderMap[name] &&
          LocatorBuilders.builderMap[name].match &&
          LocatorBuilders.builderMap[name].match(e, fe))
      );
    };

    LocatorBuilders.prototype.build = function (e) {
      let locators = this.buildAll(e);
      if (locators.length > 0) {
        return locators[0][0];
      } else {
        return "LOCATOR_DETECTION_FAILED";
      }
    };

    LocatorBuilders.prototype.buildAll = function (el) {
      let locator;
      let locators = [];
      for (let i = 0; i < LocatorBuilders.order.length; i++) {
        let finderName = LocatorBuilders.order[i];
        try {
          locator = this.buildWith(finderName, el);
          if (locator) {
            locator = String(locator);
            //Samit: The following is a quickfix for above commented code to stop exceptions on almost every locator builder
            //TODO: the builderName should NOT be used as a strategy name, create a feature to allow locatorBuilders to specify this kind of behaviour
            //TODO: Useful if a builder wants to capture a different element like a parent. Use the this.elementEquals
            let fe = this.findElement(locator);
            if (el == fe) {
              locators.push([locator, finderName]);
            }
          }
        } catch (e) {
          // TODO ignore the buggy locator builder for now
          //this.log.debug("locator exception: " + e);
        }
      }
      return locators;
    };

    LocatorBuilders.prototype.findElement = function (loc) {
      try {
        const locator = parse_locator(loc, true);
        return findElement(
          { [locator.type]: locator.string },
          this.window.document
        );
      } catch (error) {
        //this.log.debug("findElement failed: " + error + ", locator=" + locator);
        return null;
      }
    };

    /*
     * Class methods
     */

    LocatorBuilders.order = [];
    LocatorBuilders.builderMap = {};
    LocatorBuilders._preferredOrder = [];
    // NOTE: for some reasons we does not use this part
    // classObservable(LocatorBuilders);

    LocatorBuilders.add = function (name, finder) {
      this.order.push(name);
      this.builderMap[name] = finder;
      this._orderChanged();
    };

    /**
     * Call when the order or preferred order changes
     */
    LocatorBuilders._orderChanged = function () {
      let changed = this._ensureAllPresent(this.order, this._preferredOrder);
      this._sortByRefOrder(this.order, this._preferredOrder);
    };

    /**
     * Set the preferred order of the locator builders
     *
     * @param preferredOrder can be an array or a comma separated string of names
     */
    LocatorBuilders.setPreferredOrder = function (preferredOrder) {
      if (typeof preferredOrder === "string") {
        this._preferredOrder = preferredOrder.split(",");
      } else {
        this._preferredOrder = preferredOrder;
      }
      this._orderChanged();
    };

    /**
     * Returns the locator builders preferred order as an array
     */
    LocatorBuilders.getPreferredOrder = function () {
      return this._preferredOrder;
    };

    /**
     * Sorts arrayToSort in the order of elements in sortOrderReference
     * @param arrayToSort
     * @param sortOrderReference
     */
    LocatorBuilders._sortByRefOrder = function (arrayToSort, sortOrderReference) {
      let raLen = sortOrderReference.length;
      arrayToSort.sort(function (a, b) {
        let ai = sortOrderReference.indexOf(a);
        let bi = sortOrderReference.indexOf(b);
        return (ai > -1 ? ai : raLen) - (bi > -1 ? bi : raLen);
      });
    };

    /**
     * Function to add to the bottom of destArray elements from source array that do not exist in destArray
     * @param sourceArray
     * @param destArray
     */
    LocatorBuilders._ensureAllPresent = function (sourceArray, destArray) {
      let changed = false;
      sourceArray.forEach(function (e) {
        if (destArray.indexOf(e) == -1) {
          destArray.push(e);
          changed = true;
        }
      });
      return changed;
    };

    /*
     * Utility function: Encode XPath attribute value.
     */
    LocatorBuilders.prototype.attributeValue = function (value) {
      if (value.indexOf("'") < 0) {
        return "'" + value + "'";
      } else if (value.indexOf('"') < 0) {
        return '"' + value + '"';
      } else {
        let result = "concat(";
        let part = "";
        let didReachEndOfValue = false;
        while (!didReachEndOfValue) {
          let apos = value.indexOf("'");
          let quot = value.indexOf('"');
          if (apos < 0) {
            result += "'" + value + "'";
            didReachEndOfValue = true;
            break;
          } else if (quot < 0) {
            result += '"' + value + '"';
            didReachEndOfValue = true;
            break;
          } else if (quot < apos) {
            part = value.substring(0, apos);
            result += "'" + part + "'";
            value = value.substring(part.length);
          } else {
            part = value.substring(0, quot);
            result += '"' + part + '"';
            value = value.substring(part.length);
          }
          result += ",";
        }
        result += ")";
        return result;
      }
    };

    LocatorBuilders.prototype.xpathHtmlElement = function (name) {
      if (this.window.document.contentType == "application/xhtml+xml") {
        // "x:" prefix is required when testing XHTML pages
        return "x:" + name;
      } else {
        return name;
      }
    };

    LocatorBuilders.prototype.relativeXPathFromParent = function (current) {
      let index = this.getNodeNbr(current);
      let currentPath = "/" + this.xpathHtmlElement(current.nodeName.toLowerCase());
      if (index > 0) {
        currentPath += "[" + (index + 1) + "]";
      }
      return currentPath;
    };

    LocatorBuilders.prototype.getNodeNbr = function (current) {
      let childNodes = current.parentNode.childNodes;
      let total = 0;
      let index = -1;
      for (let i = 0; i < childNodes.length; i++) {
        let child = childNodes[i];
        if (child.nodeName == current.nodeName) {
          if (child == current) {
            index = total;
          }
          total++;
        }
      }
      return index;
    };

    LocatorBuilders.prototype.preciseXPath = function (xpath, e) {
      //only create more precise xpath if needed
      if (this.findElement(xpath) != e) {
        let result = e.ownerDocument.evaluate(
          xpath,
          e.ownerDocument,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        //skip first element (result:0 xpath index:1)
        for (let i = 0, len = result.snapshotLength; i < len; i++) {
          let newPath = "xpath=(" + xpath + ")[" + (i + 1) + "]";
          if (this.findElement(newPath) == e) {
            return newPath;
          }
        }
      }
      return "xpath=" + xpath;
    };

    /*
     * ===== builders =====
     */

    // order listed dictates priority
    // e.g., 1st listed is top priority

    LocatorBuilders.add("css:data-attr", function cssDataAttr(e) {
      const dataAttributes = ["data-test", "data-test-id"];
      for (let i = 0; i < dataAttributes.length; i++) {
        const attr = dataAttributes[i];
        const value = e.getAttribute(attr);
        if (attr) {
          return `css=*[${attr}="${value}"]`;
        }
      }
      return null;
    });

    LocatorBuilders.add("id", function id(e) {
      if (e.id) {
        return "id=" + e.id;
      }
      return null;
    });

    LocatorBuilders.add("linkText", function linkText(e) {
      if (e.nodeName == "A") {
        let text = e.textContent;
        if (!text.match(/^\s*$/)) {
          return (
            "linkText=" + text.replace(/\xA0/g, " ").replace(/^\s*(.*?)\s*$/, "$1")
          );
        }
      }
      return null;
    });

    LocatorBuilders.add("name", function name(e) {
      if (e.name) {
        return "name=" + e.name;
      }
      return null;
    });

    LocatorBuilders.add("css:finder", function cssFinder(e) {
      return "css=" + finder(e);
    });

    LocatorBuilders.add("xpath:link", function xpathLink(e) {
      if (e.nodeName == "A") {
        let text = e.textContent;
        if (!text.match(/^\s*$/)) {
          return this.preciseXPath(
            "//" +
              this.xpathHtmlElement("a") +
              "[contains(text(),'" +
              text.replace(/^\s+/, "").replace(/\s+$/, "") +
              "')]",
            e
          );
        }
      }
      return null;
    });

    LocatorBuilders.add("xpath:img", function xpathImg(e) {
      if (e.nodeName == "IMG") {
        if (e.alt != "") {
          return this.preciseXPath(
            "//" +
              this.xpathHtmlElement("img") +
              "[@alt=" +
              this.attributeValue(e.alt) +
              "]",
            e
          );
        } else if (e.title != "") {
          return this.preciseXPath(
            "//" +
              this.xpathHtmlElement("img") +
              "[@title=" +
              this.attributeValue(e.title) +
              "]",
            e
          );
        } else if (e.src != "") {
          return this.preciseXPath(
            "//" +
              this.xpathHtmlElement("img") +
              "[contains(@src," +
              this.attributeValue(e.src) +
              ")]",
            e
          );
        }
      }
      return null;
    });

    LocatorBuilders.add("xpath:attributes", function xpathAttr(e) {
      const PREFERRED_ATTRIBUTES = [
        "id",
        "name",
        "value",
        "type",
        "action",
        "onclick",
      ];
      let i = 0;

      function attributesXPath(name, attNames, attributes) {
        let locator = "//" + this.xpathHtmlElement(name) + "[";
        for (i = 0; i < attNames.length; i++) {
          if (i > 0) {
            locator += " and ";
          }
          let attName = attNames[i];
          locator += "@" + attName + "=" + this.attributeValue(attributes[attName]);
        }
        locator += "]";
        return this.preciseXPath(locator, e);
      }

      if (e.attributes) {
        let atts = e.attributes;
        let attsMap = {};
        for (i = 0; i < atts.length; i++) {
          let att = atts[i];
          attsMap[att.name] = att.value;
        }
        let names = [];
        // try preferred attributes
        for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
          let name = PREFERRED_ATTRIBUTES[i];
          if (attsMap[name] != null) {
            names.push(name);
            let locator = attributesXPath.call(
              this,
              e.nodeName.toLowerCase(),
              names,
              attsMap
            );
            if (e == this.findElement(locator)) {
              return locator;
            }
          }
        }
      }
      return null;
    });

    LocatorBuilders.add("xpath:idRelative", function xpathIdRelative(e) {
      let path = "";
      let current = e;
      while (current != null) {
        if (current.parentNode != null) {
          path = this.relativeXPathFromParent(current) + path;
          if (
            1 == current.parentNode.nodeType && // ELEMENT_NODE
            current.parentNode.getAttribute("id")
          ) {
            return this.preciseXPath(
              "//" +
                this.xpathHtmlElement(current.parentNode.nodeName.toLowerCase()) +
                "[@id=" +
                this.attributeValue(current.parentNode.getAttribute("id")) +
                "]" +
                path,
              e
            );
          }
        } else {
          return null;
        }
        current = current.parentNode;
      }
      return null;
    });

    LocatorBuilders.add("xpath:href", function xpathHref(e) {
      if (e.attributes && e.hasAttribute("href")) {
        let href = e.getAttribute("href");
        if (href.search(/^http?:\/\//) >= 0) {
          return this.preciseXPath(
            "//" +
              this.xpathHtmlElement("a") +
              "[@href=" +
              this.attributeValue(href) +
              "]",
            e
          );
        } else {
          // use contains(), because in IE getAttribute("href") will return absolute path
          return this.preciseXPath(
            "//" +
              this.xpathHtmlElement("a") +
              "[contains(@href, " +
              this.attributeValue(href) +
              ")]",
            e
          );
        }
      }
      return null;
    });

    LocatorBuilders.add("xpath:position", function xpathPosition(
      e,
      opt_contextNode
    ) {
      let path = "";
      let current = e;
      while (current != null && current != opt_contextNode) {
        let currentPath;
        if (current.parentNode != null) {
          currentPath = this.relativeXPathFromParent(current);
        } else {
          currentPath = "/" + this.xpathHtmlElement(current.nodeName.toLowerCase());
        }
        path = currentPath + path;
        let locator = "/" + path;
        if (e == this.findElement(locator)) {
          return "xpath=" + locator;
        }
        current = current.parentNode;
      }
      return null;
    });

    LocatorBuilders.add("xpath:innerText", function xpathInnerText(el) {
      if (el.innerText) {
        return `xpath=//${el.nodeName.toLowerCase()}[contains(.,'${
      el.innerText
    }')]`;
      } else {
        return null;
      }
    });

    /* eslint no-unused-vars: off, no-useless-escape: off */

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
      mouseoverQ;
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
          console.log("frame deleted");
          // if (removedNodes.length && removedNodes[0].nodeName === "IFRAME") {
          // browser.runtime.sendMessage({ frameRemoved: true }).catch(() => {});
          // }
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
            console.log("page loaded");
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

    // Licensed to the Software Freedom Conservancy (SFC) under one
    // import { attach, detach } from "./prompt-injector";

    function updateInputElementsOfRelevantType(action, win) {
      let inp = win.document.getElementsByTagName("input");
      for (let i = 0; i < inp.length; i++) {
        if (Recorder.inputTypes.indexOf(inp[i].type) >= 0) {
          action(inp[i]);
        }
      }
    }

    function focusEvent(recordingState, event) {
      recordingState.focusTarget = event.target;
      recordingState.focusValue = recordingState.focusTarget.value;
      recordingState.tempValue = recordingState.focusValue;
      recordingState.preventType = false;
    }

    function blurEvent(recordingState) {
      recordingState.focusTarget = null;
      recordingState.focusValue = null;
      recordingState.tempValue = null;
    }

    function attachInputListeners(recordingState, win) {
      updateInputElementsOfRelevantType((input) => {
        input.addEventListener("focus", focusEvent.bind(null, recordingState));
        input.addEventListener("blur", blurEvent.bind(null, recordingState));
      }, win);
    }

    function detachInputListeners(recordingState, win) {
      updateInputElementsOfRelevantType((input) => {
        input.removeEventListener("focus", focusEvent.bind(null, recordingState));
        input.removeEventListener("blur", blurEvent.bind(null, recordingState));
      }, win);
    }
    /**
     * @param {Window} window
     */
    class Recorder {
      constructor(window) {
        this.window = window;
        this.eventListeners = {};
        this.attached = false;
        this.recordingState = {};
        this.frameLocation = "";
        this.inputTypes = Recorder.inputTypes;
        this.recalculateFrameLocation = this.recalculateFrameLocation.bind(this);
        this.attachRecorderHandler = this.attachRecorderHandler.bind(this);
        this.detachRecorderHandler = this.detachRecorderHandler.bind(this);
        this.setWindowHandle = this.setWindowHandle.bind(this);

        this.window.addEventListener("message", this.setWindowHandle);
        this.window.addEventListener("message", this.setActiveContext);
        // browser.runtime.onMessage.addListener(this.recalculateFrameLocation);
        // browser.runtime.onMessage.addListener(this.attachRecorderHandler);
        // browser.runtime.onMessage.addListener(this.detachRecorderHandler);
        this.attach();

        // browser.runtime
        // .sendMessage({
        // attachRecorderRequest: true,
        // })
        // .then((shouldAttach) => {
        // if (shouldAttach) {
        // this.addRecorderTracingAttribute();
        // this.attach();
        // }
        // })
        // .catch(() => {});

        // runs in the content script of each frame
        // e.g., once on load
        (async () => {
          await this.getFrameLocation();
        })();
      }

      addRecorderTracingAttribute() {
        this.window.document.body.setAttribute("data-side-attach-once-loaded", "");
      }

      attachRecorderHandler(message, _sender, sendResponse) {
        if (message.attachRecorder) {
          this.attach();
          sendResponse(true);
        }
      }

      detachRecorderHandler(message, _sender, sendResponse) {
        if (message.detachRecorder) {
          this.detach();
          sendResponse(true);
        }
      }

      onNewCommand(cb) {
        this.newCommandCallback = cb;
      }

      /* record */
      record(command, target, value, insertBeforeLastCommand, actualFrameLocation) {
        console.log(
          "recorded command",
          command,
          target,
          value,
          actualFrameLocation
        );
        if (this.newCommandCallback) {
          return this.newCommandCallback({
            command: command,
            target: target,
            selectedTarget: 0,
            value: value,
            insertBeforeLastCommand: insertBeforeLastCommand,
            frameLocation:
              actualFrameLocation != undefined
                ? actualFrameLocation
                : this.frameLocation,
          });
          // .catch(() => {
          // this.detach();
          // });
        }
      }

      setWindowHandle(event) {
        if (
          event.data &&
          event.data.direction === "from-page-script" &&
          event.data.action === "set-handle"
        ) ;
      }

      setActiveContext(event) {
        if (
          event.data &&
          event.data.direction === "from-page-script" &&
          event.data.action === "set-frame"
        ) ;
      }

      /**
       * @param {string} eventKey
       */
      parseEventKey(eventKey) {
        if (eventKey.match(/^C_/)) {
          return { eventName: eventKey.substring(2), capture: true };
        } else {
          return { eventName: eventKey, capture: false };
        }
      }

      attach() {
        if (!this.attached) {
          for (let eventKey in Recorder.eventHandlers) {
            const eventInfo = this.parseEventKey(eventKey);
            const eventName = eventInfo.eventName;
            const capture = eventInfo.capture;

            const handlers = Recorder.eventHandlers[eventKey];
            this.eventListeners[eventKey] = [];
            for (let i = 0; i < handlers.length; i++) {
              this.window.document.addEventListener(
                eventName,
                handlers[i].bind(this),
                capture
              );
              this.eventListeners[eventKey].push(handlers[i]);
            }
          }
          // for (let observerName in Recorder.mutationObservers) {
          // const observer = Recorder.mutationObservers[observerName];
          // console.log("this.window", this.window.document);
          // observer.observe(this.window.document.body, observer.config);
          // }
          this.attached = true;
          this.recordingState = {
            typeTarget: undefined,
            typeLock: 0,
            focusTarget: null,
            focusValue: null,
            tempValue: null,
            preventType: false,
            preventClickTwice: false,
            preventClick: false,
            enterTarget: null,
            enterValue: null,
            tabCheck: null,
          };
          attachInputListeners(this.recordingState, this.window);
          // attach(this.record.bind(this));
        }
      }

      detach() {
        for (let eventKey in this.eventListeners) {
          const eventInfo = this.parseEventKey(eventKey);
          const eventName = eventInfo.eventName;
          const capture = eventInfo.capture;
          for (let i = 0; i < this.eventListeners[eventKey].length; i++) {
            this.window.document.removeEventListener(
              eventName,
              this.eventListeners[eventKey][i],
              capture
            );
          }
        }
        for (let observerName in Recorder.mutationObservers) {
          const observer = Recorder.mutationObservers[observerName];
          observer.disconnect();
        }
        this.eventListeners = {};
        this.attached = false;
        detachInputListeners(this.recordingState, this.window);
        // detach();
      }

      // set frame id
      getFrameLocation() {
        let currentWindow = this.window;
        let currentParentWindow;

        while (currentWindow !== this.window.top) {
          currentParentWindow = currentWindow.parent;
          if (!currentParentWindow.frames.length) {
            break;
          }

          for (let idx = 0; idx < currentParentWindow.frames.length; idx++) {
            const frame = currentParentWindow.frames[idx];

            if (frame === currentWindow) {
              this.frameLocation = ":" + this.frameLocation;
              currentWindow = currentParentWindow;
              break;
            }
          }
        }
        this.frameLocation = "root" + this.frameLocation;
        // return browser.runtime
        // .sendMessage({ frameLocation: this.frameLocation })
        // .catch(() => {});
      }

      recalculateFrameLocation(message, _sender, sendResponse) {
        if (message.recalculateFrameLocation) {
          (async () => {
            this.frameLocation = "";
            await this.getFrameLocation();
            sendResponse(true);
          })();
          return true;
        }
      }
    }

    /** @type {{ [key: string]: EventListener[] }} */
    Recorder.eventHandlers = {};
    /** @type {{ [observerName: string]: MutationObserver }} */
    Recorder.mutationObservers = {};
    /**
     * @param {string} handlerName
     * @param {string} eventName
     * @param {EventListener} handler
     * @param {boolean} options
     */
    Recorder.addEventHandler = function (handlerName, eventName, handler, options) {
      handler.handlerName = handlerName;
      if (!options) options = false;
      let key = options ? "C_" + eventName : eventName;
      if (!this.eventHandlers[key]) {
        this.eventHandlers[key] = [];
      }
      this.eventHandlers[key].push(handler);
    };

    /**
     * @param {string} observerName
     * @param {MutationCallback} callback
     */
    Recorder.addMutationObserver = function (observerName, callback, config) {
      const observer = new MutationObserver(callback);
      observer.observerName = observerName;
      observer.config = config;
      this.mutationObservers[observerName] = observer;
    };

    Recorder.inputTypes = [
      "text",
      "password",
      "file",
      "datetime",
      "datetime-local",
      "date",
      "month",
      "time",
      "week",
      "number",
      "range",
      "email",
      "url",
      "search",
      "tel",
      "color",
    ];

    handlers.forEach((handler) => {
      Recorder.addEventHandler(...handler);
    });

    observers.forEach((observer) => {
      Recorder.addMutationObserver(...observer);
    });

    return Recorder;

})));
