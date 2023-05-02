/*
 * anime.js v3.2.1
 * (c) 2020 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */ // Defaults
var $71de71cec2eb6594$var$defaultInstanceSettings = {
    update: null,
    begin: null,
    loopBegin: null,
    changeBegin: null,
    change: null,
    changeComplete: null,
    loopComplete: null,
    complete: null,
    loop: 1,
    direction: "normal",
    autoplay: true,
    timelineOffset: 0
};
var $71de71cec2eb6594$var$defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    endDelay: 0,
    easing: "easeOutElastic(1, .5)",
    round: 0
};
var $71de71cec2eb6594$var$validTransforms = [
    "translateX",
    "translateY",
    "translateZ",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "perspective",
    "matrix",
    "matrix3d"
];
// Caching
var $71de71cec2eb6594$var$cache = {
    CSS: {},
    springs: {}
};
// Utils
function $71de71cec2eb6594$var$minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
}
function $71de71cec2eb6594$var$stringContains(str, text) {
    return str.indexOf(text) > -1;
}
function $71de71cec2eb6594$var$applyArguments(func, args) {
    return func.apply(null, args);
}
var $71de71cec2eb6594$var$is = {
    arr: function(a) {
        return Array.isArray(a);
    },
    obj: function(a) {
        return $71de71cec2eb6594$var$stringContains(Object.prototype.toString.call(a), "Object");
    },
    pth: function(a) {
        return $71de71cec2eb6594$var$is.obj(a) && a.hasOwnProperty("totalLength");
    },
    svg: function(a) {
        return a instanceof SVGElement;
    },
    inp: function(a) {
        return a instanceof HTMLInputElement;
    },
    dom: function(a) {
        return a.nodeType || $71de71cec2eb6594$var$is.svg(a);
    },
    str: function(a) {
        return typeof a === "string";
    },
    fnc: function(a) {
        return typeof a === "function";
    },
    und: function(a) {
        return typeof a === "undefined";
    },
    nil: function(a) {
        return $71de71cec2eb6594$var$is.und(a) || a === null;
    },
    hex: function(a) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a);
    },
    rgb: function(a) {
        return /^rgb/.test(a);
    },
    hsl: function(a) {
        return /^hsl/.test(a);
    },
    col: function(a) {
        return $71de71cec2eb6594$var$is.hex(a) || $71de71cec2eb6594$var$is.rgb(a) || $71de71cec2eb6594$var$is.hsl(a);
    },
    key: function(a) {
        return !$71de71cec2eb6594$var$defaultInstanceSettings.hasOwnProperty(a) && !$71de71cec2eb6594$var$defaultTweenSettings.hasOwnProperty(a) && a !== "targets" && a !== "keyframes";
    }
};
// Easings
function $71de71cec2eb6594$var$parseEasingParameters(string) {
    var match = /\(([^)]+)\)/.exec(string);
    return match ? match[1].split(",").map(function(p) {
        return parseFloat(p);
    }) : [];
}
// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js
function $71de71cec2eb6594$var$spring(string, duration) {
    var params = $71de71cec2eb6594$var$parseEasingParameters(string);
    var mass = $71de71cec2eb6594$var$minMax($71de71cec2eb6594$var$is.und(params[0]) ? 1 : params[0], .1, 100);
    var stiffness = $71de71cec2eb6594$var$minMax($71de71cec2eb6594$var$is.und(params[1]) ? 100 : params[1], .1, 100);
    var damping = $71de71cec2eb6594$var$minMax($71de71cec2eb6594$var$is.und(params[2]) ? 10 : params[2], .1, 100);
    var velocity = $71de71cec2eb6594$var$minMax($71de71cec2eb6594$var$is.und(params[3]) ? 0 : params[3], .1, 100);
    var w0 = Math.sqrt(stiffness / mass);
    var zeta = damping / (2 * Math.sqrt(stiffness * mass));
    var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    var a = 1;
    var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;
    function solver(t) {
        var progress = duration ? duration * t / 1000 : t;
        if (zeta < 1) progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
        else progress = (a + b * progress) * Math.exp(-progress * w0);
        if (t === 0 || t === 1) return t;
        return 1 - progress;
    }
    function getDuration() {
        var cached = $71de71cec2eb6594$var$cache.springs[string];
        if (cached) return cached;
        var frame = 1 / 6;
        var elapsed = 0;
        var rest = 0;
        while(true){
            elapsed += frame;
            if (solver(elapsed) === 1) {
                rest++;
                if (rest >= 16) break;
            } else rest = 0;
        }
        var duration = elapsed * frame * 1000;
        $71de71cec2eb6594$var$cache.springs[string] = duration;
        return duration;
    }
    return duration ? solver : getDuration;
}
// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function
function $71de71cec2eb6594$var$steps(steps) {
    if (steps === void 0) steps = 10;
    return function(t) {
        return Math.ceil($71de71cec2eb6594$var$minMax(t, 0.000001, 1) * steps) * (1 / steps);
    };
}
// BezierEasing https://github.com/gre/bezier-easing
var $71de71cec2eb6594$var$bezier = function() {
    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
    function A(aA1, aA2) {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }
    function B(aA1, aA2) {
        return 3.0 * aA2 - 6.0 * aA1;
    }
    function C(aA1) {
        return 3.0 * aA1;
    }
    function calcBezier(aT, aA1, aA2) {
        return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    }
    function getSlope(aT, aA1, aA2) {
        return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }
    function binarySubdivide(aX, aA, aB, mX1, mX2) {
        var currentX, currentT, i = 0;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) aB = currentT;
            else aA = currentT;
        }while (Math.abs(currentX) > 0.0000001 && ++i < 10);
        return currentT;
    }
    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
        for(var i = 0; i < 4; ++i){
            var currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) return aGuessT;
            var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }
    function bezier(mX1, mY1, mX2, mY2) {
        if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) return;
        var sampleValues = new Float32Array(kSplineTableSize);
        if (mX1 !== mY1 || mX2 !== mY2) for(var i = 0; i < kSplineTableSize; ++i)sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        function getTForX(aX) {
            var intervalStart = 0;
            var currentSample = 1;
            var lastSample = kSplineTableSize - 1;
            for(; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample)intervalStart += kSampleStepSize;
            --currentSample;
            var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
            var guessForT = intervalStart + dist * kSampleStepSize;
            var initialSlope = getSlope(guessForT, mX1, mX2);
            if (initialSlope >= 0.001) return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
            else if (initialSlope === 0.0) return guessForT;
            else return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
        return function(x) {
            if (mX1 === mY1 && mX2 === mY2) return x;
            if (x === 0 || x === 1) return x;
            return calcBezier(getTForX(x), mY1, mY2);
        };
    }
    return bezier;
}();
var $71de71cec2eb6594$var$penner = function() {
    // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)
    var eases = {
        linear: function() {
            return function(t) {
                return t;
            };
        }
    };
    var functionEasings = {
        Sine: function() {
            return function(t) {
                return 1 - Math.cos(t * Math.PI / 2);
            };
        },
        Circ: function() {
            return function(t) {
                return 1 - Math.sqrt(1 - t * t);
            };
        },
        Back: function() {
            return function(t) {
                return t * t * (3 * t - 2);
            };
        },
        Bounce: function() {
            return function(t) {
                var pow2, b = 4;
                while(t < ((pow2 = Math.pow(2, --b)) - 1) / 11);
                return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
            };
        },
        Elastic: function(amplitude, period) {
            if (amplitude === void 0) amplitude = 1;
            if (period === void 0) period = .5;
            var a = $71de71cec2eb6594$var$minMax(amplitude, 1, 10);
            var p = $71de71cec2eb6594$var$minMax(period, .1, 2);
            return function(t) {
                return t === 0 || t === 1 ? t : -a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - p / (Math.PI * 2) * Math.asin(1 / a)) * (Math.PI * 2) / p);
            };
        }
    };
    var baseEasings = [
        "Quad",
        "Cubic",
        "Quart",
        "Quint",
        "Expo"
    ];
    baseEasings.forEach(function(name, i) {
        functionEasings[name] = function() {
            return function(t) {
                return Math.pow(t, i + 2);
            };
        };
    });
    Object.keys(functionEasings).forEach(function(name) {
        var easeIn = functionEasings[name];
        eases["easeIn" + name] = easeIn;
        eases["easeOut" + name] = function(a, b) {
            return function(t) {
                return 1 - easeIn(a, b)(1 - t);
            };
        };
        eases["easeInOut" + name] = function(a, b) {
            return function(t) {
                return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
            };
        };
        eases["easeOutIn" + name] = function(a, b) {
            return function(t) {
                return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : (easeIn(a, b)(t * 2 - 1) + 1) / 2;
            };
        };
    });
    return eases;
}();
function $71de71cec2eb6594$var$parseEasings(easing, duration) {
    if ($71de71cec2eb6594$var$is.fnc(easing)) return easing;
    var name = easing.split("(")[0];
    var ease = $71de71cec2eb6594$var$penner[name];
    var args = $71de71cec2eb6594$var$parseEasingParameters(easing);
    switch(name){
        case "spring":
            return $71de71cec2eb6594$var$spring(easing, duration);
        case "cubicBezier":
            return $71de71cec2eb6594$var$applyArguments($71de71cec2eb6594$var$bezier, args);
        case "steps":
            return $71de71cec2eb6594$var$applyArguments($71de71cec2eb6594$var$steps, args);
        default:
            return $71de71cec2eb6594$var$applyArguments(ease, args);
    }
}
// Strings
function $71de71cec2eb6594$var$selectString(str) {
    try {
        var nodes = document.querySelectorAll(str);
        return nodes;
    } catch (e) {
        return;
    }
}
// Arrays
function $71de71cec2eb6594$var$filterArray(arr, callback) {
    var len = arr.length;
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    var result = [];
    for(var i = 0; i < len; i++)if (i in arr) {
        var val = arr[i];
        if (callback.call(thisArg, val, i, arr)) result.push(val);
    }
    return result;
}
function $71de71cec2eb6594$var$flattenArray(arr) {
    return arr.reduce(function(a, b) {
        return a.concat($71de71cec2eb6594$var$is.arr(b) ? $71de71cec2eb6594$var$flattenArray(b) : b);
    }, []);
}
function $71de71cec2eb6594$var$toArray(o) {
    if ($71de71cec2eb6594$var$is.arr(o)) return o;
    if ($71de71cec2eb6594$var$is.str(o)) o = $71de71cec2eb6594$var$selectString(o) || o;
    if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
    return [
        o
    ];
}
function $71de71cec2eb6594$var$arrayContains(arr, val) {
    return arr.some(function(a) {
        return a === val;
    });
}
// Objects
function $71de71cec2eb6594$var$cloneObject(o) {
    var clone = {};
    for(var p in o)clone[p] = o[p];
    return clone;
}
function $71de71cec2eb6594$var$replaceObjectProps(o1, o2) {
    var o = $71de71cec2eb6594$var$cloneObject(o1);
    for(var p in o1)o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
    return o;
}
function $71de71cec2eb6594$var$mergeObjects(o1, o2) {
    var o = $71de71cec2eb6594$var$cloneObject(o1);
    for(var p in o2)o[p] = $71de71cec2eb6594$var$is.und(o1[p]) ? o2[p] : o1[p];
    return o;
}
// Colors
function $71de71cec2eb6594$var$rgbToRgba(rgbValue) {
    var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
    return rgb ? "rgba(" + rgb[1] + ",1)" : rgbValue;
}
function $71de71cec2eb6594$var$hexToRgba(hexValue) {
    var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var hex = hexValue.replace(rgx, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var r = parseInt(rgb[1], 16);
    var g = parseInt(rgb[2], 16);
    var b = parseInt(rgb[3], 16);
    return "rgba(" + r + "," + g + "," + b + ",1)";
}
function $71de71cec2eb6594$var$hslToRgba(hslValue) {
    var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
    var h = parseInt(hsl[1], 10) / 360;
    var s = parseInt(hsl[2], 10) / 100;
    var l = parseInt(hsl[3], 10) / 100;
    var a = hsl[4] || 1;
    function hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 0.5) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    var r, g, b;
    if (s == 0) r = g = b = l;
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
}
function $71de71cec2eb6594$var$colorToRgb(val) {
    if ($71de71cec2eb6594$var$is.rgb(val)) return $71de71cec2eb6594$var$rgbToRgba(val);
    if ($71de71cec2eb6594$var$is.hex(val)) return $71de71cec2eb6594$var$hexToRgba(val);
    if ($71de71cec2eb6594$var$is.hsl(val)) return $71de71cec2eb6594$var$hslToRgba(val);
}
// Units
function $71de71cec2eb6594$var$getUnit(val) {
    var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
    if (split) return split[1];
}
function $71de71cec2eb6594$var$getTransformUnit(propName) {
    if ($71de71cec2eb6594$var$stringContains(propName, "translate") || propName === "perspective") return "px";
    if ($71de71cec2eb6594$var$stringContains(propName, "rotate") || $71de71cec2eb6594$var$stringContains(propName, "skew")) return "deg";
}
// Values
function $71de71cec2eb6594$var$getFunctionValue(val, animatable) {
    if (!$71de71cec2eb6594$var$is.fnc(val)) return val;
    return val(animatable.target, animatable.id, animatable.total);
}
function $71de71cec2eb6594$var$getAttribute(el, prop) {
    return el.getAttribute(prop);
}
function $71de71cec2eb6594$var$convertPxToUnit(el, value, unit) {
    var valueUnit = $71de71cec2eb6594$var$getUnit(value);
    if ($71de71cec2eb6594$var$arrayContains([
        unit,
        "deg",
        "rad",
        "turn"
    ], valueUnit)) return value;
    var cached = $71de71cec2eb6594$var$cache.CSS[value + unit];
    if (!$71de71cec2eb6594$var$is.und(cached)) return cached;
    var baseline = 100;
    var tempEl = document.createElement(el.tagName);
    var parentEl = el.parentNode && el.parentNode !== document ? el.parentNode : document.body;
    parentEl.appendChild(tempEl);
    tempEl.style.position = "absolute";
    tempEl.style.width = baseline + unit;
    var factor = baseline / tempEl.offsetWidth;
    parentEl.removeChild(tempEl);
    var convertedUnit = factor * parseFloat(value);
    $71de71cec2eb6594$var$cache.CSS[value + unit] = convertedUnit;
    return convertedUnit;
}
function $71de71cec2eb6594$var$getCSSValue(el, prop, unit) {
    if (prop in el.style) {
        var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || "0";
        return unit ? $71de71cec2eb6594$var$convertPxToUnit(el, value, unit) : value;
    }
}
function $71de71cec2eb6594$var$getAnimationType(el, prop) {
    if ($71de71cec2eb6594$var$is.dom(el) && !$71de71cec2eb6594$var$is.inp(el) && (!$71de71cec2eb6594$var$is.nil($71de71cec2eb6594$var$getAttribute(el, prop)) || $71de71cec2eb6594$var$is.svg(el) && el[prop])) return "attribute";
    if ($71de71cec2eb6594$var$is.dom(el) && $71de71cec2eb6594$var$arrayContains($71de71cec2eb6594$var$validTransforms, prop)) return "transform";
    if ($71de71cec2eb6594$var$is.dom(el) && prop !== "transform" && $71de71cec2eb6594$var$getCSSValue(el, prop)) return "css";
    if (el[prop] != null) return "object";
}
function $71de71cec2eb6594$var$getElementTransforms(el) {
    if (!$71de71cec2eb6594$var$is.dom(el)) return;
    var str = el.style.transform || "";
    var reg = /(\w+)\(([^)]*)\)/g;
    var transforms = new Map();
    var m;
    while(m = reg.exec(str))transforms.set(m[1], m[2]);
    return transforms;
}
function $71de71cec2eb6594$var$getTransformValue(el, propName, animatable, unit) {
    var defaultVal = $71de71cec2eb6594$var$stringContains(propName, "scale") ? 1 : 0 + $71de71cec2eb6594$var$getTransformUnit(propName);
    var value = $71de71cec2eb6594$var$getElementTransforms(el).get(propName) || defaultVal;
    if (animatable) {
        animatable.transforms.list.set(propName, value);
        animatable.transforms["last"] = propName;
    }
    return unit ? $71de71cec2eb6594$var$convertPxToUnit(el, value, unit) : value;
}
function $71de71cec2eb6594$var$getOriginalTargetValue(target, propName, unit, animatable) {
    switch($71de71cec2eb6594$var$getAnimationType(target, propName)){
        case "transform":
            return $71de71cec2eb6594$var$getTransformValue(target, propName, animatable, unit);
        case "css":
            return $71de71cec2eb6594$var$getCSSValue(target, propName, unit);
        case "attribute":
            return $71de71cec2eb6594$var$getAttribute(target, propName);
        default:
            return target[propName] || 0;
    }
}
function $71de71cec2eb6594$var$getRelativeValue(to, from) {
    var operator = /^(\*=|\+=|-=)/.exec(to);
    if (!operator) return to;
    var u = $71de71cec2eb6594$var$getUnit(to) || 0;
    var x = parseFloat(from);
    var y = parseFloat(to.replace(operator[0], ""));
    switch(operator[0][0]){
        case "+":
            return x + y + u;
        case "-":
            return x - y + u;
        case "*":
            return x * y + u;
    }
}
function $71de71cec2eb6594$var$validateValue(val, unit) {
    if ($71de71cec2eb6594$var$is.col(val)) return $71de71cec2eb6594$var$colorToRgb(val);
    if (/\s/g.test(val)) return val;
    var originalUnit = $71de71cec2eb6594$var$getUnit(val);
    var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
    if (unit) return unitLess + unit;
    return unitLess;
}
// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744
function $71de71cec2eb6594$var$getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
function $71de71cec2eb6594$var$getCircleLength(el) {
    return Math.PI * 2 * $71de71cec2eb6594$var$getAttribute(el, "r");
}
function $71de71cec2eb6594$var$getRectLength(el) {
    return $71de71cec2eb6594$var$getAttribute(el, "width") * 2 + $71de71cec2eb6594$var$getAttribute(el, "height") * 2;
}
function $71de71cec2eb6594$var$getLineLength(el) {
    return $71de71cec2eb6594$var$getDistance({
        x: $71de71cec2eb6594$var$getAttribute(el, "x1"),
        y: $71de71cec2eb6594$var$getAttribute(el, "y1")
    }, {
        x: $71de71cec2eb6594$var$getAttribute(el, "x2"),
        y: $71de71cec2eb6594$var$getAttribute(el, "y2")
    });
}
function $71de71cec2eb6594$var$getPolylineLength(el) {
    var points = el.points;
    var totalLength = 0;
    var previousPos;
    for(var i = 0; i < points.numberOfItems; i++){
        var currentPos = points.getItem(i);
        if (i > 0) totalLength += $71de71cec2eb6594$var$getDistance(previousPos, currentPos);
        previousPos = currentPos;
    }
    return totalLength;
}
function $71de71cec2eb6594$var$getPolygonLength(el) {
    var points = el.points;
    return $71de71cec2eb6594$var$getPolylineLength(el) + $71de71cec2eb6594$var$getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}
// Path animation
function $71de71cec2eb6594$var$getTotalLength(el) {
    if (el.getTotalLength) return el.getTotalLength();
    switch(el.tagName.toLowerCase()){
        case "circle":
            return $71de71cec2eb6594$var$getCircleLength(el);
        case "rect":
            return $71de71cec2eb6594$var$getRectLength(el);
        case "line":
            return $71de71cec2eb6594$var$getLineLength(el);
        case "polyline":
            return $71de71cec2eb6594$var$getPolylineLength(el);
        case "polygon":
            return $71de71cec2eb6594$var$getPolygonLength(el);
    }
}
function $71de71cec2eb6594$var$setDashoffset(el) {
    var pathLength = $71de71cec2eb6594$var$getTotalLength(el);
    el.setAttribute("stroke-dasharray", pathLength);
    return pathLength;
}
// Motion path
function $71de71cec2eb6594$var$getParentSvgEl(el) {
    var parentEl = el.parentNode;
    while($71de71cec2eb6594$var$is.svg(parentEl)){
        if (!$71de71cec2eb6594$var$is.svg(parentEl.parentNode)) break;
        parentEl = parentEl.parentNode;
    }
    return parentEl;
}
function $71de71cec2eb6594$var$getParentSvg(pathEl, svgData) {
    var svg = svgData || {};
    var parentSvgEl = svg.el || $71de71cec2eb6594$var$getParentSvgEl(pathEl);
    var rect = parentSvgEl.getBoundingClientRect();
    var viewBoxAttr = $71de71cec2eb6594$var$getAttribute(parentSvgEl, "viewBox");
    var width = rect.width;
    var height = rect.height;
    var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(" ") : [
        0,
        0,
        width,
        height
    ]);
    return {
        el: parentSvgEl,
        viewBox: viewBox,
        x: viewBox[0] / 1,
        y: viewBox[1] / 1,
        w: width,
        h: height,
        vW: viewBox[2],
        vH: viewBox[3]
    };
}
function $71de71cec2eb6594$var$getPath(path, percent) {
    var pathEl = $71de71cec2eb6594$var$is.str(path) ? $71de71cec2eb6594$var$selectString(path)[0] : path;
    var p = percent || 100;
    return function(property) {
        return {
            property: property,
            el: pathEl,
            svg: $71de71cec2eb6594$var$getParentSvg(pathEl),
            totalLength: $71de71cec2eb6594$var$getTotalLength(pathEl) * (p / 100)
        };
    };
}
function $71de71cec2eb6594$var$getPathProgress(path, progress, isPathTargetInsideSVG) {
    function point(offset) {
        if (offset === void 0) offset = 0;
        var l = progress + offset >= 1 ? progress + offset : 0;
        return path.el.getPointAtLength(l);
    }
    var svg = $71de71cec2eb6594$var$getParentSvg(path.el, path.svg);
    var p = point();
    var p0 = point(-1);
    var p1 = point(1);
    var scaleX = isPathTargetInsideSVG ? 1 : svg.w / svg.vW;
    var scaleY = isPathTargetInsideSVG ? 1 : svg.h / svg.vH;
    switch(path.property){
        case "x":
            return (p.x - svg.x) * scaleX;
        case "y":
            return (p.y - svg.y) * scaleY;
        case "angle":
            return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
    }
}
// Decompose value
function $71de71cec2eb6594$var$decomposeValue(val, unit) {
    // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
    // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
    var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
    var value = $71de71cec2eb6594$var$validateValue($71de71cec2eb6594$var$is.pth(val) ? val.totalLength : val, unit) + "";
    return {
        original: value,
        numbers: value.match(rgx) ? value.match(rgx).map(Number) : [
            0
        ],
        strings: $71de71cec2eb6594$var$is.str(val) || unit ? value.split(rgx) : []
    };
}
// Animatables
function $71de71cec2eb6594$var$parseTargets(targets) {
    var targetsArray = targets ? $71de71cec2eb6594$var$flattenArray($71de71cec2eb6594$var$is.arr(targets) ? targets.map($71de71cec2eb6594$var$toArray) : $71de71cec2eb6594$var$toArray(targets)) : [];
    return $71de71cec2eb6594$var$filterArray(targetsArray, function(item, pos, self) {
        return self.indexOf(item) === pos;
    });
}
function $71de71cec2eb6594$var$getAnimatables(targets) {
    var parsed = $71de71cec2eb6594$var$parseTargets(targets);
    return parsed.map(function(t, i) {
        return {
            target: t,
            id: i,
            total: parsed.length,
            transforms: {
                list: $71de71cec2eb6594$var$getElementTransforms(t)
            }
        };
    });
}
// Properties
function $71de71cec2eb6594$var$normalizePropertyTweens(prop, tweenSettings) {
    var settings = $71de71cec2eb6594$var$cloneObject(tweenSettings);
    // Override duration if easing is a spring
    if (/^spring/.test(settings.easing)) settings.duration = $71de71cec2eb6594$var$spring(settings.easing);
    if ($71de71cec2eb6594$var$is.arr(prop)) {
        var l = prop.length;
        var isFromTo = l === 2 && !$71de71cec2eb6594$var$is.obj(prop[0]);
        if (!isFromTo) // Duration divided by the number of tweens
        {
            if (!$71de71cec2eb6594$var$is.fnc(tweenSettings.duration)) settings.duration = tweenSettings.duration / l;
        } else // Transform [from, to] values shorthand to a valid tween value
        prop = {
            value: prop
        };
    }
    var propArray = $71de71cec2eb6594$var$is.arr(prop) ? prop : [
        prop
    ];
    return propArray.map(function(v, i) {
        var obj = $71de71cec2eb6594$var$is.obj(v) && !$71de71cec2eb6594$var$is.pth(v) ? v : {
            value: v
        };
        // Default delay value should only be applied to the first tween
        if ($71de71cec2eb6594$var$is.und(obj.delay)) obj.delay = !i ? tweenSettings.delay : 0;
        // Default endDelay value should only be applied to the last tween
        if ($71de71cec2eb6594$var$is.und(obj.endDelay)) obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0;
        return obj;
    }).map(function(k) {
        return $71de71cec2eb6594$var$mergeObjects(k, settings);
    });
}
function $71de71cec2eb6594$var$flattenKeyframes(keyframes) {
    var propertyNames = $71de71cec2eb6594$var$filterArray($71de71cec2eb6594$var$flattenArray(keyframes.map(function(key) {
        return Object.keys(key);
    })), function(p) {
        return $71de71cec2eb6594$var$is.key(p);
    }).reduce(function(a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
    }, []);
    var properties = {};
    var loop = function(i) {
        var propName = propertyNames[i];
        properties[propName] = keyframes.map(function(key) {
            var newKey = {};
            for(var p in key){
                if ($71de71cec2eb6594$var$is.key(p)) {
                    if (p == propName) newKey.value = key[p];
                } else newKey[p] = key[p];
            }
            return newKey;
        });
    };
    for(var i = 0; i < propertyNames.length; i++)loop(i);
    return properties;
}
function $71de71cec2eb6594$var$getProperties(tweenSettings, params) {
    var properties = [];
    var keyframes = params.keyframes;
    if (keyframes) params = $71de71cec2eb6594$var$mergeObjects($71de71cec2eb6594$var$flattenKeyframes(keyframes), params);
    for(var p in params)if ($71de71cec2eb6594$var$is.key(p)) properties.push({
        name: p,
        tweens: $71de71cec2eb6594$var$normalizePropertyTweens(params[p], tweenSettings)
    });
    return properties;
}
// Tweens
function $71de71cec2eb6594$var$normalizeTweenValues(tween, animatable) {
    var t = {};
    for(var p in tween){
        var value = $71de71cec2eb6594$var$getFunctionValue(tween[p], animatable);
        if ($71de71cec2eb6594$var$is.arr(value)) {
            value = value.map(function(v) {
                return $71de71cec2eb6594$var$getFunctionValue(v, animatable);
            });
            if (value.length === 1) value = value[0];
        }
        t[p] = value;
    }
    t.duration = parseFloat(t.duration);
    t.delay = parseFloat(t.delay);
    return t;
}
function $71de71cec2eb6594$var$normalizeTweens(prop, animatable) {
    var previousTween;
    return prop.tweens.map(function(t) {
        var tween = $71de71cec2eb6594$var$normalizeTweenValues(t, animatable);
        var tweenValue = tween.value;
        var to = $71de71cec2eb6594$var$is.arr(tweenValue) ? tweenValue[1] : tweenValue;
        var toUnit = $71de71cec2eb6594$var$getUnit(to);
        var originalValue = $71de71cec2eb6594$var$getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
        var previousValue = previousTween ? previousTween.to.original : originalValue;
        var from = $71de71cec2eb6594$var$is.arr(tweenValue) ? tweenValue[0] : previousValue;
        var fromUnit = $71de71cec2eb6594$var$getUnit(from) || $71de71cec2eb6594$var$getUnit(originalValue);
        var unit = toUnit || fromUnit;
        if ($71de71cec2eb6594$var$is.und(to)) to = previousValue;
        tween.from = $71de71cec2eb6594$var$decomposeValue(from, unit);
        tween.to = $71de71cec2eb6594$var$decomposeValue($71de71cec2eb6594$var$getRelativeValue(to, from), unit);
        tween.start = previousTween ? previousTween.end : 0;
        tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
        tween.easing = $71de71cec2eb6594$var$parseEasings(tween.easing, tween.duration);
        tween.isPath = $71de71cec2eb6594$var$is.pth(tweenValue);
        tween.isPathTargetInsideSVG = tween.isPath && $71de71cec2eb6594$var$is.svg(animatable.target);
        tween.isColor = $71de71cec2eb6594$var$is.col(tween.from.original);
        if (tween.isColor) tween.round = 1;
        previousTween = tween;
        return tween;
    });
}
// Tween progress
var $71de71cec2eb6594$var$setProgressValue = {
    css: function(t, p, v) {
        return t.style[p] = v;
    },
    attribute: function(t, p, v) {
        return t.setAttribute(p, v);
    },
    object: function(t, p, v) {
        return t[p] = v;
    },
    transform: function(t, p, v, transforms, manual) {
        transforms.list.set(p, v);
        if (p === transforms.last || manual) {
            var str = "";
            transforms.list.forEach(function(value, prop) {
                str += prop + "(" + value + ") ";
            });
            t.style.transform = str;
        }
    }
};
// Set Value helper
function $71de71cec2eb6594$var$setTargetsValue(targets, properties) {
    var animatables = $71de71cec2eb6594$var$getAnimatables(targets);
    animatables.forEach(function(animatable) {
        for(var property in properties){
            var value = $71de71cec2eb6594$var$getFunctionValue(properties[property], animatable);
            var target = animatable.target;
            var valueUnit = $71de71cec2eb6594$var$getUnit(value);
            var originalValue = $71de71cec2eb6594$var$getOriginalTargetValue(target, property, valueUnit, animatable);
            var unit = valueUnit || $71de71cec2eb6594$var$getUnit(originalValue);
            var to = $71de71cec2eb6594$var$getRelativeValue($71de71cec2eb6594$var$validateValue(value, unit), originalValue);
            var animType = $71de71cec2eb6594$var$getAnimationType(target, property);
            $71de71cec2eb6594$var$setProgressValue[animType](target, property, to, animatable.transforms, true);
        }
    });
}
// Animations
function $71de71cec2eb6594$var$createAnimation(animatable, prop) {
    var animType = $71de71cec2eb6594$var$getAnimationType(animatable.target, prop.name);
    if (animType) {
        var tweens = $71de71cec2eb6594$var$normalizeTweens(prop, animatable);
        var lastTween = tweens[tweens.length - 1];
        return {
            type: animType,
            property: prop.name,
            animatable: animatable,
            tweens: tweens,
            duration: lastTween.end,
            delay: tweens[0].delay,
            endDelay: lastTween.endDelay
        };
    }
}
function $71de71cec2eb6594$var$getAnimations(animatables, properties) {
    return $71de71cec2eb6594$var$filterArray($71de71cec2eb6594$var$flattenArray(animatables.map(function(animatable) {
        return properties.map(function(prop) {
            return $71de71cec2eb6594$var$createAnimation(animatable, prop);
        });
    })), function(a) {
        return !$71de71cec2eb6594$var$is.und(a);
    });
}
// Create Instance
function $71de71cec2eb6594$var$getInstanceTimings(animations, tweenSettings) {
    var animLength = animations.length;
    var getTlOffset = function(anim) {
        return anim.timelineOffset ? anim.timelineOffset : 0;
    };
    var timings = {};
    timings.duration = animLength ? Math.max.apply(Math, animations.map(function(anim) {
        return getTlOffset(anim) + anim.duration;
    })) : tweenSettings.duration;
    timings.delay = animLength ? Math.min.apply(Math, animations.map(function(anim) {
        return getTlOffset(anim) + anim.delay;
    })) : tweenSettings.delay;
    timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function(anim) {
        return getTlOffset(anim) + anim.duration - anim.endDelay;
    })) : tweenSettings.endDelay;
    return timings;
}
var $71de71cec2eb6594$var$instanceID = 0;
function $71de71cec2eb6594$var$createNewInstance(params) {
    var instanceSettings = $71de71cec2eb6594$var$replaceObjectProps($71de71cec2eb6594$var$defaultInstanceSettings, params);
    var tweenSettings = $71de71cec2eb6594$var$replaceObjectProps($71de71cec2eb6594$var$defaultTweenSettings, params);
    var properties = $71de71cec2eb6594$var$getProperties(tweenSettings, params);
    var animatables = $71de71cec2eb6594$var$getAnimatables(params.targets);
    var animations = $71de71cec2eb6594$var$getAnimations(animatables, properties);
    var timings = $71de71cec2eb6594$var$getInstanceTimings(animations, tweenSettings);
    var id = $71de71cec2eb6594$var$instanceID;
    $71de71cec2eb6594$var$instanceID++;
    return $71de71cec2eb6594$var$mergeObjects(instanceSettings, {
        id: id,
        children: [],
        animatables: animatables,
        animations: animations,
        duration: timings.duration,
        delay: timings.delay,
        endDelay: timings.endDelay
    });
}
// Core
var $71de71cec2eb6594$var$activeInstances = [];
var $71de71cec2eb6594$var$engine = function() {
    var raf;
    function play() {
        if (!raf && (!$71de71cec2eb6594$var$isDocumentHidden() || !$71de71cec2eb6594$var$anime.suspendWhenDocumentHidden) && $71de71cec2eb6594$var$activeInstances.length > 0) raf = requestAnimationFrame(step);
    }
    function step(t) {
        // memo on algorithm issue:
        // dangerous iteration over mutable `activeInstances`
        // (that collection may be updated from within callbacks of `tick`-ed animation instances)
        var activeInstancesLength = $71de71cec2eb6594$var$activeInstances.length;
        var i = 0;
        while(i < activeInstancesLength){
            var activeInstance = $71de71cec2eb6594$var$activeInstances[i];
            if (!activeInstance.paused) {
                activeInstance.tick(t);
                i++;
            } else {
                $71de71cec2eb6594$var$activeInstances.splice(i, 1);
                activeInstancesLength--;
            }
        }
        raf = i > 0 ? requestAnimationFrame(step) : undefined;
    }
    function handleVisibilityChange() {
        if (!$71de71cec2eb6594$var$anime.suspendWhenDocumentHidden) return;
        if ($71de71cec2eb6594$var$isDocumentHidden()) // suspend ticks
        raf = cancelAnimationFrame(raf);
        else {
            // first adjust animations to consider the time that ticks were suspended
            $71de71cec2eb6594$var$activeInstances.forEach(function(instance) {
                return instance._onDocumentVisibility();
            });
            $71de71cec2eb6594$var$engine();
        }
    }
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", handleVisibilityChange);
    return play;
}();
function $71de71cec2eb6594$var$isDocumentHidden() {
    return !!document && document.hidden;
}
// Public Instance
function $71de71cec2eb6594$var$anime(params) {
    if (params === void 0) params = {};
    var startTime = 0, lastTime = 0, now = 0;
    var children, childrenLength = 0;
    var resolve = null;
    function makePromise(instance) {
        var promise = window.Promise && new Promise(function(_resolve) {
            return resolve = _resolve;
        });
        instance.finished = promise;
        return promise;
    }
    var instance = $71de71cec2eb6594$var$createNewInstance(params);
    var promise = makePromise(instance);
    function toggleInstanceDirection() {
        var direction = instance.direction;
        if (direction !== "alternate") instance.direction = direction !== "normal" ? "normal" : "reverse";
        instance.reversed = !instance.reversed;
        children.forEach(function(child) {
            return child.reversed = instance.reversed;
        });
    }
    function adjustTime(time) {
        return instance.reversed ? instance.duration - time : time;
    }
    function resetTime() {
        startTime = 0;
        lastTime = adjustTime(instance.currentTime) * (1 / $71de71cec2eb6594$var$anime.speed);
    }
    function seekChild(time, child) {
        if (child) child.seek(time - child.timelineOffset);
    }
    function syncInstanceChildren(time) {
        if (!instance.reversePlayback) for(var i = 0; i < childrenLength; i++)seekChild(time, children[i]);
        else for(var i$1 = childrenLength; i$1--;)seekChild(time, children[i$1]);
    }
    function setAnimationsProgress(insTime) {
        var i = 0;
        var animations = instance.animations;
        var animationsLength = animations.length;
        while(i < animationsLength){
            var anim = animations[i];
            var animatable = anim.animatable;
            var tweens = anim.tweens;
            var tweenLength = tweens.length - 1;
            var tween = tweens[tweenLength];
            // Only check for keyframes if there is more than one tween
            if (tweenLength) tween = $71de71cec2eb6594$var$filterArray(tweens, function(t) {
                return insTime < t.end;
            })[0] || tween;
            var elapsed = $71de71cec2eb6594$var$minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
            var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
            var strings = tween.to.strings;
            var round = tween.round;
            var numbers = [];
            var toNumbersLength = tween.to.numbers.length;
            var progress = void 0;
            for(var n = 0; n < toNumbersLength; n++){
                var value = void 0;
                var toNumber = tween.to.numbers[n];
                var fromNumber = tween.from.numbers[n] || 0;
                if (!tween.isPath) value = fromNumber + eased * (toNumber - fromNumber);
                else value = $71de71cec2eb6594$var$getPathProgress(tween.value, eased * toNumber, tween.isPathTargetInsideSVG);
                if (round) {
                    if (!(tween.isColor && n > 2)) value = Math.round(value * round) / round;
                }
                numbers.push(value);
            }
            // Manual Array.reduce for better performances
            var stringsLength = strings.length;
            if (!stringsLength) progress = numbers[0];
            else {
                progress = strings[0];
                for(var s = 0; s < stringsLength; s++){
                    var a = strings[s];
                    var b = strings[s + 1];
                    var n$1 = numbers[s];
                    if (!isNaN(n$1)) {
                        if (!b) progress += n$1 + " ";
                        else progress += n$1 + b;
                    }
                }
            }
            $71de71cec2eb6594$var$setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
            anim.currentValue = progress;
            i++;
        }
    }
    function setCallback(cb) {
        if (instance[cb] && !instance.passThrough) instance[cb](instance);
    }
    function countIteration() {
        if (instance.remaining && instance.remaining !== true) instance.remaining--;
    }
    function setInstanceProgress(engineTime) {
        var insDuration = instance.duration;
        var insDelay = instance.delay;
        var insEndDelay = insDuration - instance.endDelay;
        var insTime = adjustTime(engineTime);
        instance.progress = $71de71cec2eb6594$var$minMax(insTime / insDuration * 100, 0, 100);
        instance.reversePlayback = insTime < instance.currentTime;
        if (children) syncInstanceChildren(insTime);
        if (!instance.began && instance.currentTime > 0) {
            instance.began = true;
            setCallback("begin");
        }
        if (!instance.loopBegan && instance.currentTime > 0) {
            instance.loopBegan = true;
            setCallback("loopBegin");
        }
        if (insTime <= insDelay && instance.currentTime !== 0) setAnimationsProgress(0);
        if (insTime >= insEndDelay && instance.currentTime !== insDuration || !insDuration) setAnimationsProgress(insDuration);
        if (insTime > insDelay && insTime < insEndDelay) {
            if (!instance.changeBegan) {
                instance.changeBegan = true;
                instance.changeCompleted = false;
                setCallback("changeBegin");
            }
            setCallback("change");
            setAnimationsProgress(insTime);
        } else if (instance.changeBegan) {
            instance.changeCompleted = true;
            instance.changeBegan = false;
            setCallback("changeComplete");
        }
        instance.currentTime = $71de71cec2eb6594$var$minMax(insTime, 0, insDuration);
        if (instance.began) setCallback("update");
        if (engineTime >= insDuration) {
            lastTime = 0;
            countIteration();
            if (!instance.remaining) {
                instance.paused = true;
                if (!instance.completed) {
                    instance.completed = true;
                    setCallback("loopComplete");
                    setCallback("complete");
                    if (!instance.passThrough && "Promise" in window) {
                        resolve();
                        promise = makePromise(instance);
                    }
                }
            } else {
                startTime = now;
                setCallback("loopComplete");
                instance.loopBegan = false;
                if (instance.direction === "alternate") toggleInstanceDirection();
            }
        }
    }
    instance.reset = function() {
        var direction = instance.direction;
        instance.passThrough = false;
        instance.currentTime = 0;
        instance.progress = 0;
        instance.paused = true;
        instance.began = false;
        instance.loopBegan = false;
        instance.changeBegan = false;
        instance.completed = false;
        instance.changeCompleted = false;
        instance.reversePlayback = false;
        instance.reversed = direction === "reverse";
        instance.remaining = instance.loop;
        children = instance.children;
        childrenLength = children.length;
        for(var i = childrenLength; i--;)instance.children[i].reset();
        if (instance.reversed && instance.loop !== true || direction === "alternate" && instance.loop === 1) instance.remaining++;
        setAnimationsProgress(instance.reversed ? instance.duration : 0);
    };
    // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
    instance._onDocumentVisibility = resetTime;
    // Set Value helper
    instance.set = function(targets, properties) {
        $71de71cec2eb6594$var$setTargetsValue(targets, properties);
        return instance;
    };
    instance.tick = function(t) {
        now = t;
        if (!startTime) startTime = now;
        setInstanceProgress((now + (lastTime - startTime)) * $71de71cec2eb6594$var$anime.speed);
    };
    instance.seek = function(time) {
        setInstanceProgress(adjustTime(time));
    };
    instance.pause = function() {
        instance.paused = true;
        resetTime();
    };
    instance.play = function() {
        if (!instance.paused) return;
        if (instance.completed) instance.reset();
        instance.paused = false;
        $71de71cec2eb6594$var$activeInstances.push(instance);
        resetTime();
        $71de71cec2eb6594$var$engine();
    };
    instance.reverse = function() {
        toggleInstanceDirection();
        instance.completed = instance.reversed ? false : true;
        resetTime();
    };
    instance.restart = function() {
        instance.reset();
        instance.play();
    };
    instance.remove = function(targets) {
        var targetsArray = $71de71cec2eb6594$var$parseTargets(targets);
        $71de71cec2eb6594$var$removeTargetsFromInstance(targetsArray, instance);
    };
    instance.reset();
    if (instance.autoplay) instance.play();
    return instance;
}
// Remove targets from animation
function $71de71cec2eb6594$var$removeTargetsFromAnimations(targetsArray, animations) {
    for(var a = animations.length; a--;)if ($71de71cec2eb6594$var$arrayContains(targetsArray, animations[a].animatable.target)) animations.splice(a, 1);
}
function $71de71cec2eb6594$var$removeTargetsFromInstance(targetsArray, instance) {
    var animations = instance.animations;
    var children = instance.children;
    $71de71cec2eb6594$var$removeTargetsFromAnimations(targetsArray, animations);
    for(var c = children.length; c--;){
        var child = children[c];
        var childAnimations = child.animations;
        $71de71cec2eb6594$var$removeTargetsFromAnimations(targetsArray, childAnimations);
        if (!childAnimations.length && !child.children.length) children.splice(c, 1);
    }
    if (!animations.length && !children.length) instance.pause();
}
function $71de71cec2eb6594$var$removeTargetsFromActiveInstances(targets) {
    var targetsArray = $71de71cec2eb6594$var$parseTargets(targets);
    for(var i = $71de71cec2eb6594$var$activeInstances.length; i--;){
        var instance = $71de71cec2eb6594$var$activeInstances[i];
        $71de71cec2eb6594$var$removeTargetsFromInstance(targetsArray, instance);
    }
}
// Stagger helpers
function $71de71cec2eb6594$var$stagger(val, params) {
    if (params === void 0) params = {};
    var direction = params.direction || "normal";
    var easing = params.easing ? $71de71cec2eb6594$var$parseEasings(params.easing) : null;
    var grid = params.grid;
    var axis = params.axis;
    var fromIndex = params.from || 0;
    var fromFirst = fromIndex === "first";
    var fromCenter = fromIndex === "center";
    var fromLast = fromIndex === "last";
    var isRange = $71de71cec2eb6594$var$is.arr(val);
    var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
    var val2 = isRange ? parseFloat(val[1]) : 0;
    var unit = $71de71cec2eb6594$var$getUnit(isRange ? val[1] : val) || 0;
    var start = params.start || 0 + (isRange ? val1 : 0);
    var values = [];
    var maxValue = 0;
    return function(el, i, t) {
        if (fromFirst) fromIndex = 0;
        if (fromCenter) fromIndex = (t - 1) / 2;
        if (fromLast) fromIndex = t - 1;
        if (!values.length) {
            for(var index = 0; index < t; index++){
                if (!grid) values.push(Math.abs(fromIndex - index));
                else {
                    var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
                    var fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
                    var toX = index % grid[0];
                    var toY = Math.floor(index / grid[0]);
                    var distanceX = fromX - toX;
                    var distanceY = fromY - toY;
                    var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                    if (axis === "x") value = -distanceX;
                    if (axis === "y") value = -distanceY;
                    values.push(value);
                }
                maxValue = Math.max.apply(Math, values);
            }
            if (easing) values = values.map(function(val) {
                return easing(val / maxValue) * maxValue;
            });
            if (direction === "reverse") values = values.map(function(val) {
                return axis ? val < 0 ? val * -1 : -val : Math.abs(maxValue - val);
            });
        }
        var spacing = isRange ? (val2 - val1) / maxValue : val1;
        return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
    };
}
// Timeline
function $71de71cec2eb6594$var$timeline(params) {
    if (params === void 0) params = {};
    var tl = $71de71cec2eb6594$var$anime(params);
    tl.duration = 0;
    tl.add = function(instanceParams, timelineOffset) {
        var tlIndex = $71de71cec2eb6594$var$activeInstances.indexOf(tl);
        var children = tl.children;
        if (tlIndex > -1) $71de71cec2eb6594$var$activeInstances.splice(tlIndex, 1);
        function passThrough(ins) {
            ins.passThrough = true;
        }
        for(var i = 0; i < children.length; i++)passThrough(children[i]);
        var insParams = $71de71cec2eb6594$var$mergeObjects(instanceParams, $71de71cec2eb6594$var$replaceObjectProps($71de71cec2eb6594$var$defaultTweenSettings, params));
        insParams.targets = insParams.targets || params.targets;
        var tlDuration = tl.duration;
        insParams.autoplay = false;
        insParams.direction = tl.direction;
        insParams.timelineOffset = $71de71cec2eb6594$var$is.und(timelineOffset) ? tlDuration : $71de71cec2eb6594$var$getRelativeValue(timelineOffset, tlDuration);
        passThrough(tl);
        tl.seek(insParams.timelineOffset);
        var ins = $71de71cec2eb6594$var$anime(insParams);
        passThrough(ins);
        children.push(ins);
        var timings = $71de71cec2eb6594$var$getInstanceTimings(children, params);
        tl.delay = timings.delay;
        tl.endDelay = timings.endDelay;
        tl.duration = timings.duration;
        tl.seek(0);
        tl.reset();
        if (tl.autoplay) tl.play();
        return tl;
    };
    return tl;
}
$71de71cec2eb6594$var$anime.version = "3.2.1";
$71de71cec2eb6594$var$anime.speed = 1;
// TODO:#review: naming, documentation
$71de71cec2eb6594$var$anime.suspendWhenDocumentHidden = true;
$71de71cec2eb6594$var$anime.running = $71de71cec2eb6594$var$activeInstances;
$71de71cec2eb6594$var$anime.remove = $71de71cec2eb6594$var$removeTargetsFromActiveInstances;
$71de71cec2eb6594$var$anime.get = $71de71cec2eb6594$var$getOriginalTargetValue;
$71de71cec2eb6594$var$anime.set = $71de71cec2eb6594$var$setTargetsValue;
$71de71cec2eb6594$var$anime.convertPx = $71de71cec2eb6594$var$convertPxToUnit;
$71de71cec2eb6594$var$anime.path = $71de71cec2eb6594$var$getPath;
$71de71cec2eb6594$var$anime.setDashoffset = $71de71cec2eb6594$var$setDashoffset;
$71de71cec2eb6594$var$anime.stagger = $71de71cec2eb6594$var$stagger;
$71de71cec2eb6594$var$anime.timeline = $71de71cec2eb6594$var$timeline;
$71de71cec2eb6594$var$anime.easing = $71de71cec2eb6594$var$parseEasings;
$71de71cec2eb6594$var$anime.penner = $71de71cec2eb6594$var$penner;
$71de71cec2eb6594$var$anime.random = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
var $71de71cec2eb6594$export$2e2bcd8739ae039 = $71de71cec2eb6594$var$anime;


(0, $71de71cec2eb6594$export$2e2bcd8739ae039)({
    targets: "body",
    translateY: [
        -50,
        0
    ],
    duration: 1000
}); // anime({
 //     targets: 'nav .linkDivContainer',
 //     translateY: [-50, 0],
 //     delay: anime.stagger(100)
 // });


//# sourceMappingURL=index.c2fb4d6b.js.map
