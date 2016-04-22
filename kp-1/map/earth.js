/**
 * Created by vision on 16/4/7.
 */
(function (window, document) {

    var BASE = document.currentScript.src.slice(0, -8),
        ARRAY = Array,
        ARRAY_PROTOTYPE = ARRAY.prototype,
        OBJECT = Object,
        OBJECT_PROTOTYPE = OBJECT.prototype,
        FLOAT_ARRAY = "undefined" != typeof Float32Array ? Float32Array : ARRAY,
        vec2,
        vec3,
        vec4,
        mat2,
        mat3,
        mat4,
        MATH = Math,
        MATH_RANDOM = MATH.random,
        MATH_PI = MATH.PI,
        MATH_SIN = MATH.sin,
        MATH_COS = MATH.cos,
        MATH_SQRT = MATH.sqrt,
        MATH_POW = MATH.pow,
        MATH_MAX = MATH.max,
        MATH_MIN = MATH.min,
        Random,
        Base64,
        Agent = {
            language: navigator.language,
            isMobile: function () {
                return false;
            }
        };

    /**
     * 判断是否是数组
     * @param obj
     * @returns {boolean}
     */
    function isArray(obj) {
        return OBJECT_PROTOTYPE.toString.call(obj) === "[object Array]";
    }

    /**
     * 判断是否是对象
     * @param obj
     * @returns {boolean}
     */
    function isObject(obj) {
        return !(OBJECT_PROTOTYPE.toString.call(obj) !== "[object Object]" || isDom(obj) || obj instanceof Window);
    }

    /**
     * 判断是否是字符串
     * @param obj
     * @returns {boolean}
     */
    function isString(obj) {
        return typeof obj === "string";
    }

    /**
     * 判断是否是函数
     * @param obj
     * @returns {boolean}
     */
    function isFunction(obj) {
        return typeof obj === "function";
    }

    /**
     * 批量向一个数组push元素
     * @param array
     */
    function arrayPush(array) {
        for (var t = 1; t < arguments.length; ++t) {
            array.push.apply(array, arguments[t])
        }
    }

    /**
     * 判断是否是数字
     * @param obj
     * @returns {boolean}
     */
    function isNumeric(obj) {
        return !isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
    }

    /**
     * 遍历一个对象或数组
     * @param obj 对象或数组
     * @param cb  回调函数
     * @param context
     */
    function each(obj, cb, context) {

        if (!(obj && cb)) {
            return;
        }
        context = context || obj;
        //优先使用forEach,针对数组
        if (obj.forEach && obj.forEach === ARRAY_PROTOTYPE.forEach) {
            obj.forEach(cb, context);
        }
        //针对函数
        else if (!isFunction(obj) && obj.length === +obj.length) {
            for (var i = 0, len = obj.length; i < len; i++) {
                cb.call(context, obj[i], i, obj);
            }
        }
        else {
            //遍历对象
            var i = 0;
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cb.call(context, obj[key], key, obj, i);
                    i++;
                }
            }
        }

    }

    /**
     * 深度克隆一个变量
     * @param source
     * @returns {*}
     */
    function clone(source) {

        if (isObject(source)) {
            var result = source;
            if (isArray(source)) {
                result = [];
                for (var i = 0, len = source.length; i < len; i++) {
                    result[i] = clone(source[i]);
                }
            } else {
                result = {};
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        result[key] = clone(source[key]);
                    }
                }
            }
            return result;
        }

        return source;
    }

    /**
     * 深度合并多个对象
     * @returns {*|{}}
     */
    function extend() {
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        if (typeof target === "boolean") {
            deep = target;

            target = arguments[i] || {};
            i++;
        }

        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            if ((options = arguments[i]) != null) {

                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    if (target === copy) {
                        continue;
                    }

                    if (deep && copy && ( isObject(copy) || (copyIsArray = isArray(copy)) )) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];

                        } else {
                            clone = src && isObject(src) ? src : {};
                        }

                        target[name] = extend(deep, clone, copy);

                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    }

    /**
     * 回调一个函数,最后一个参数是context
     * @param callback
     */
    function caller(callback) {
        var args = arguments,
            context = args.length == 1 ? null : args[args.length - 1],
            params = ARRAY_PROTOTYPE.slice.call(args, 1, args.length - 1);
        if (isFunction(callback)) {
            callback.apply(context, params);
        }
        return context;
    }

    /**
     * 将JS对象转为urlencodeed
     * @param param
     * @param key
     * @returns {string}
     */
    function serialize(param, key) {
        var paramStr = "";
        if (isString(param) || isNumeric(param) || param instanceof Boolean) {
            paramStr += "&" + key + "=" + encodeURIComponent(param);
        } else {
            each(param, function (_, i) {
                var k = key == null ? i : key + "[" + i + "]";

                paramStr += "&" + serialize(_, k);
            });
        }
        return paramStr.substr(1);
    }

    /**
     * 建立一个请求
     * @param option 请求参数
     * @param callback  成功请求后的回调函数
     */
    function request(option, callback) {
        var method = (option.method || "GET").toUpperCase(),
            complete = callback || option.complete,
            serializeData = serialize(option.data || {}),
            url = option.url,
            xhr = (window.XMLHttpRequest
                ? new XMLHttpRequest()
                : new ActiveXObject("Microsoft.XMLHTTP"));

        if (method == "GET") {
            url += (/\?/.test(url) ? "&" : "?" ) + serializeData;
        }

        xhr.open(method, url, true);

        each(option.headers || {}, function (value, name) {
            xhr.setRequestHeader(name, value);
        });

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    caller(complete, xhr.responseText, xhr);

                } else {
                    caller(option.error, xhr);
                    console.error("请求失败: " + url);
                }
                xhr.onreadystatechange = function () {
                };
                xhr = null;
            }
            caller(option.readystatechange, xhr);
        };
        each(["abort", "error", "load", "loadend", "loadstart", "progress", "timeout"], function (eventName) {
            xhr["on" + eventName] = option[eventName];
        }, xhr);
        if (method == "POST") {
            xhr.send(serializeData);

        } else {
            xhr.send();
        }

        return xhr;
    }

    /**
     * 代理函数
     * @param fn
     * @param context
     * @returns {*}
     */
    function proxy(fn, context) {
        var args;

        if (!isFunction(fn)) {
            return undefined;
        }

        args = ARRAY_PROTOTYPE.slice.call(arguments, 2);

        return function () {
            return fn.apply(context || this, args.concat(ARRAY_PROTOTYPE.slice.call(arguments)));
        };
    }

    /**
     * 类继承
     * @param child 子类
     * @param base  基类
     * @returns {*}
     */
    function inherit(child, base) {
        var prototype = clone(child.prototype);
        child.prototype = extend(true, {}, new base(), prototype);
        return child;
    }

    /**
     * 判断是否是DOM
     * @param obj
     * @returns {boolean}
     */
    function isDom(obj) {
        return obj instanceof HTMLElement;
    }

    /**
     * 获取一个对象的所有key
     * @param obj
     * @returns {Array}
     */
    function keys(obj) {
        var keys = [];
        for (var i in obj) {
            keys.push(i);
        }
        return keys;
    }

    /**
     * 获取一个资源的链接
     * @param path
     * @returns {string}
     */
    function resource(path) {
        return BASE + path;
    }

    /**
     * 批量加载资源
     * @param options
     * @param callback
     */
    function loadResources(options, callback) {
        var ret = {},
            count = keys(options).length;
        each(options, function (url, name) {
            url = resource(url);
            if (/\.(jpg|png)$/i.test(url)) {
                var image = new Image;
                image.src = url;
                image.onload = function () {
                    onload(name, image)
                }
            } else {
                request({
                    url: url,
                    complete: function (e) {
                        try {
                            ret[name] = JSON.parse(e);
                        } catch (error) {
                            ret[name] = e;
                        }
                        0 === --count && caller(callback, ret, this);
                    }
                })
            }
        })
    }

    function range(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    }

    /**
     * 根据事件对象获取鼠标当前位置
     * @param e
     * @returns {*[]}
     */
    function getMouseEventOffset(e) {
        return typeof e.offsetX == "undefined" ? [e.layerX, e.layerY] : [e.offsetX, e.offsetY]
    }

    function deg2rad(e) {
        return MATH_PI * e / 180
    }

    function lerp(e, t, r) {
        return (1 - r) * e + r * t
    }

    function clamp(e, t, r) {
        return t > e ? t : e > r ? r : e
    }

    function smoothstep(e) {
        return 3 * e * e - 2 * e * e * e
    }

    function timeNow() {
        return .001 * Date.now();
    }

    /**
     * 16进制色值转vec3
     * @param e
     * @returns {*}
     */
    function color2vec3(e) {

        function getValue(t) {
            return parseInt(e.substr(2 * t, 2), 16) / 255
        }

        "#" == e[0] && (e = e.substr(1));
        var r = vec3.create();
        r[0] = getValue(0);
        r[1] = getValue(1);
        r[2] = getValue(2);
        return r
    }

    function project_mercator(r, n) {
        var o = n[0],
            a = n[1],
            i = MATH_PI * a / 180,
            u = 90 / MATH_PI * MATH.log(MATH.tan(.25 * MATH_PI + .5 * i));
        r[0] = -o / 180;
        r[1] = clamp(u / 90, -1, 1);
        r[2] = -1 * n[2];
        vec3.scale(r, r, 10)
    }

    function project_ecef(r, n) {
        var o = deg2rad(n[0]),
            a = deg2rad(n[1]),
            i = 1 * n[2],
            u = MATH_COS(a),
            c = MATH_SIN(a),
            l = 1,
            s = 1;
        r[0] = -(l + i) * u * MATH_COS(o);
        r[2] = (l + i) * u * MATH_SIN(o);
        r[1] = (s + i) * c;
        vec3.scale(r, r, 10)
    }

    function project(blend, e, t) {
        if (blend < .5) {
            return project_mercator(e, t);
        }
        return project_ecef(e, t);
    }

    vec2 = {
        create: function () {
            var e = new FLOAT_ARRAY(2);
            return e[0] = 0, e[1] = 0, e
        },
        clone: function (e) {
            var t = new FLOAT_ARRAY(2);
            return t[0] = e[0], t[1] = e[1], t
        },
        fromValues: function (e, t) {
            var n = new FLOAT_ARRAY(2);
            return n[0] = e, n[1] = t, n
        },
        copy: function (e, t) {
            return e[0] = t[0], e[1] = t[1], e
        },
        set: function (e, t, r) {
            return e[0] = t, e[1] = r, e
        },
        add: function (e, t, r) {
            return e[0] = t[0] + r[0], e[1] = t[1] + r[1], e
        },
        subtract: function (e, t, r) {
            return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e
        },
        sub: function (e, t, r) {
            return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e
        },
        multiply: function (e, t, r) {
            return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e
        },
        mul: function (e, t, r) {
            return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e
        },
        divide: function (e, t, r) {
            return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e
        },
        div: function (e, t, r) {
            return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e
        },
        min: function (e, t, r) {
            return e[0] = MATH_MIN(t[0], r[0]), e[1] = MATH_MIN(t[1], r[1]), e
        },
        max: function (e, t, r) {
            return e[0] = MATH_MAX(t[0], r[0]), e[1] = MATH_MAX(t[1], r[1]), e
        },
        scale: function (e, t, r) {
            return e[0] = t[0] * r, e[1] = t[1] * r, e
        },
        scaleAndAdd: function (e, t, r, n) {
            return e[0] = t[0] + r[0] * n, e[1] = t[1] + r[1] * n, e
        },
        distance: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1];
            return MATH_SQRT(r * r + n * n)
        },
        dist: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1];
            return MATH_SQRT(r * r + n * n)
        },
        squaredDistance: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1];
            return r * r + n * n
        },
        sqrDist: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1];
            return r * r + n * n
        },
        length: function (e) {
            var t = e[0], r = e[1];
            return MATH_SQRT(t * t + r * r)
        },
        len: function (e) {
            var t = e[0], r = e[1];
            return MATH_SQRT(t * t + r * r)
        },
        squaredLength: function (e) {
            var t = e[0], r = e[1];
            return t * t + r * r
        },
        sqrLen: function (e) {
            var t = e[0], r = e[1];
            return t * t + r * r
        },
        negate: function (e, t) {
            return e[0] = -t[0], e[1] = -t[1], e
        },
        inverse: function (e, t) {
            return e[0] = 1 / t[0], e[1] = 1 / t[1], e
        },
        normalize: function (e, t) {
            var r = t[0], n = t[1], o = r * r + n * n;
            return o > 0 && (o = 1 / MATH_SQRT(o), e[0] = t[0] * o, e[1] = t[1] * o), e
        },
        dot: function (e, t) {
            return e[0] * t[0] + e[1] * t[1]
        },
        cross: function (e, t, r) {
            var n = t[0] * r[1] - t[1] * r[0];
            return e[0] = e[1] = 0, e[2] = n, e
        },
        lerp: function (e, t, r, n) {
            var o = t[0], a = t[1];
            return e[0] = o + n * (r[0] - o), e[1] = a + n * (r[1] - a), e
        },
        random: function (e, t) {
            t = t || 1;
            var r = 2 * n() * MATH_PI;
            return e[0] = MATH_COS(r) * t, e[1] = MATH_SIN(r) * t, e
        },
        transformMat2: function (e, t, r) {
            var n = t[0], o = t[1];
            return e[0] = r[0] * n + r[2] * o, e[1] = r[1] * n + r[3] * o, e
        },
        transformMat2d: function (e, t, r) {
            var n = t[0], o = t[1];
            return e[0] = r[0] * n + r[2] * o + r[4], e[1] = r[1] * n + r[3] * o + r[5], e
        },
        transformMat3: function (e, t, r) {
            var n = t[0], o = t[1];
            return e[0] = r[0] * n + r[3] * o + r[6], e[1] = r[1] * n + r[4] * o + r[7], e
        },
        transformMat4: function (e, t, r) {
            var n = t[0], o = t[1];
            return e[0] = r[0] * n + r[4] * o + r[12], e[1] = r[1] * n + r[5] * o + r[13], e
        },
        forEach: function (t, r, n, o, a, i) {
            var u, c;
            for (r || (r = 2), n || (n = 0), c = o ? MATH_MIN(o * r + n, t.length) : t.length, u = n; c > u; u += r) {
                e[0] = t[u], e[1] = t[u + 1], a(e, e, i), t[u] = e[0], t[u + 1] = e[1];
            }
            return t
        },
        str: function (e) {
            return "vec2(" + e[0] + ", " + e[1] + ")"
        },
        load: function (e, t, r) {
            e[0] = t[r + 0], e[1] = t[r + 1]
        },
        save: function (e, t, r) {
            t[r + 0] = e[0], t[r + 1] = e[1]
        },
        perp: function (e, t) {
            var r = t[0];
            e[0] = -t[1], e[1] = r
        }
    };
    vec3 = window.vec3={
        create: function () {
            var e = new FLOAT_ARRAY(3);
            return e[0] = 0, e[1] = 0, e[2] = 0, e
        },
        clone: function (e) {
            var t = new FLOAT_ARRAY(3);
            return t[0] = e[0], t[1] = e[1], t[2] = e[2], t
        },
        fromValues: function (e, t, n) {
            var o = new FLOAT_ARRAY(3);
            return o[0] = e, o[1] = t, o[2] = n, o
        },
        copy: function (e, t) {
            return e[0] = t[0], e[1] = t[1], e[2] = t[2], e
        },
        set: function (e, t, r, n) {
            return e[0] = t, e[1] = r, e[2] = n, e
        },
        add: function (e, t, r) {
            return e[0] = t[0] + r[0], e[1] = t[1] + r[1], e[2] = t[2] + r[2], e
        },
        subtract: function (e, t, r) {
            return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e[2] = t[2] - r[2], e
        },
        sub: function (e, t, r) {
            return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e[2] = t[2] - r[2], e
        },
        multiply: function (e, t, r) {
            return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e[2] = t[2] * r[2], e
        },
        mul: function (e, t, r) {
            return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e[2] = t[2] * r[2], e
        },
        divide: function (e, t, r) {
            return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e[2] = t[2] / r[2], e
        },
        div: function (e, t, r) {
            return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e[2] = t[2] / r[2], e
        },
        min: function (e, t, r) {
            return e[0] = MATH_MIN(t[0], r[0]), e[1] = MATH_MIN(t[1], r[1]), e[2] = MATH_MIN(t[2], r[2]), e
        },
        max: function (e, t, r) {
            return e[0] = MATH_MAX(t[0], r[0]), e[1] = MATH_MAX(t[1], r[1]), e[2] = MATH_MAX(t[2], r[2]), e
        },
        scale: function (e, t, r) {
            return e[0] = t[0] * r, e[1] = t[1] * r, e[2] = t[2] * r, e
        },
        scaleAndAdd: function (e, t, r, n) {
            return e[0] = t[0] + r[0] * n, e[1] = t[1] + r[1] * n, e[2] = t[2] + r[2] * n, e
        },
        distance: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2];
            return MATH_SQRT(r * r + n * n + o * o)
        },
        dist: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2];
            return MATH_SQRT(r * r + n * n + o * o)
        },
        squaredDistance: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2];
            return r * r + n * n + o * o
        },
        sqrDist: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2];
            return r * r + n * n + o * o
        },
        length: function (e) {
            var t = e[0], r = e[1], n = e[2];
            return MATH_SQRT(t * t + r * r + n * n)
        },
        len: function (e) {
            var t = e[0], r = e[1], n = e[2];
            return MATH_SQRT(t * t + r * r + n * n)
        },
        squaredLength: function (e) {
            var t = e[0], r = e[1], n = e[2];
            return t * t + r * r + n * n
        },
        sqrLen: function (e) {
            var t = e[0], r = e[1], n = e[2];
            return t * t + r * r + n * n
        },
        negate: function (e, t) {
            return e[0] = -t[0], e[1] = -t[1], e[2] = -t[2], e
        },
        inverse: function (e, t) {
            return e[0] = 1 / t[0], e[1] = 1 / t[1], e[2] = 1 / t[2], e
        },
        normalize: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = r * r + n * n + o * o;
            return a > 0 && (a = 1 / MATH_SQRT(a), e[0] = t[0] * a, e[1] = t[1] * a, e[2] = t[2] * a), e
        },
        dot: function (e, t) {
            return e[0] * t[0] + e[1] * t[1] + e[2] * t[2]
        },
        cross: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = r[0], u = r[1], c = r[2];
            return e[0] = o * c - a * u, e[1] = a * i - n * c, e[2] = n * u - o * i, e
        },
        lerp: function (e, t, r, n) {
            var o = t[0], a = t[1], i = t[2];
            return e[0] = o + n * (r[0] - o), e[1] = a + n * (r[1] - a), e[2] = i + n * (r[2] - i), e
        },
        random: function (e, t) {
            t = t || 1;
            var r = 2 * n() * MATH_PI, o = 2 * n() - 1, a = MATH_SQRT(1 - o * o) * t;
            return e[0] = MATH_COS(r) * a, e[1] = MATH_SIN(r) * a, e[2] = o * t, e
        },
        transformMat4: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = r[3] * n + r[7] * o + r[11] * a + r[15];
            return i = i || 1, e[0] = (r[0] * n + r[4] * o + r[8] * a + r[12]) / i, e[1] = (r[1] * n + r[5] * o + r[9] * a + r[13]) / i, e[2] = (r[2] * n + r[6] * o + r[10] * a + r[14]) / i, e
        },
        transformMat3: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2];
            return e[0] = n * r[0] + o * r[3] + a * r[6], e[1] = n * r[1] + o * r[4] + a * r[7], e[2] = n * r[2] + o * r[5] + a * r[8], e
        },
        transformQuat: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = r[0], u = r[1], c = r[2], l = r[3], s = l * n + u * a - c * o, f = l * o + c * n - i * a, v = l * a + i * o - u * n, p = -i * n - u * o - c * a;
            return e[0] = s * l + p * -i + f * -c - v * -u, e[1] = f * l + p * -u + v * -i - s * -c, e[2] = v * l + p * -c + s * -u - f * -i, e
        },
        rotateX: function (e, t, r, n) {
            var o = [], a = [];
            return o[0] = t[0] - r[0], o[1] = t[1] - r[1], o[2] = t[2] - r[2], a[0] = o[0], a[1] = o[1] * MATH_COS(n) - o[2] * MATH_SIN(n), a[2] = o[1] * MATH_SIN(n) + o[2] * MATH_COS(n), e[0] = a[0] + r[0], e[1] = a[1] + r[1], e[2] = a[2] + r[2], e
        },
        rotateY: function (e, t, r, n) {
            var o = [], a = [];
            return o[0] = t[0] - r[0], o[1] = t[1] - r[1], o[2] = t[2] - r[2], a[0] = o[2] * MATH_SIN(n) + o[0] * MATH_COS(n), a[1] = o[1], a[2] = o[2] * MATH_COS(n) - o[0] * MATH_SIN(n), e[0] = a[0] + r[0], e[1] = a[1] + r[1], e[2] = a[2] + r[2], e
        },
        rotateZ: function (e, t, r, n) {
            var o = [], a = [];
            return o[0] = t[0] - r[0], o[1] = t[1] - r[1], o[2] = t[2] - r[2], a[0] = o[0] * MATH_COS(n) - o[1] * MATH_SIN(n), a[1] = o[0] * MATH_SIN(n) + o[1] * MATH_COS(n), a[2] = o[2], e[0] = a[0] + r[0], e[1] = a[1] + r[1], e[2] = a[2] + r[2], e
        },
        forEach: function () {
            var e = this.create();
            return function (t, r, n, o, a, i) {
                var u, c;
                for (r || (r = 3), n || (n = 0), c = o ? MATH_MIN(o * r + n, t.length) : t.length, u = n; c > u; u += r) {
                    e[0] = t[u], e[1] = t[u + 1], e[2] = t[u + 2], a(e, e, i), t[u] = e[0], t[u + 1] = e[1], t[u + 2] = e[2];
                }
                return t
            }
        },
        str: function (e) {
            return "vec3(" + e[0] + ", " + e[1] + ", " + e[2] + ")"
        },
        load: function (e, t, r) {
            e[0] = t[r + 0], e[1] = t[r + 1], e[2] = t[r + 2]
        },
        save: function (e, t, r) {
            t[r + 0] = e[0], t[r + 1] = e[1], t[r + 2] = e[2]
        }
    };
    vec4 = {
        create: function () {
            var e = new FLOAT_ARRAY(4);
            return e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 0, e
        },
        clone: function (e) {
            var t = new FLOAT_ARRAY(4);
            return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t
        },
        fromValues: function (e, t, n, o) {
            var a = new FLOAT_ARRAY(4);
            return a[0] = e, a[1] = t, a[2] = n, a[3] = o, a
        },
        copy: function (e, t) {
            return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e
        },
        set: function (e, t, r, n, o) {
            return e[0] = t, e[1] = r, e[2] = n, e[3] = o, e
        },
        add: function (e, t, r) {
            return e[0] = t[0] + r[0], e[1] = t[1] + r[1], e[2] = t[2] + r[2], e[3] = t[3] + r[3], e
        },
        subtract: function (e, t, r) {
            return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e[2] = t[2] - r[2], e[3] = t[3] - r[3], e
        },
        sub: function (e, t, r) {
            return e[0] = t[0] - r[0], e[1] = t[1] - r[1], e[2] = t[2] - r[2], e[3] = t[3] - r[3], e
        },
        multiply: function (e, t, r) {
            return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e[2] = t[2] * r[2], e[3] = t[3] * r[3], e
        },
        mul: function (e, t, r) {
            return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e[2] = t[2] * r[2], e[3] = t[3] * r[3], e
        },
        divide: function (e, t, r) {
            return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e[2] = t[2] / r[2], e[3] = t[3] / r[3], e
        },
        div: function (e, t, r) {
            return e[0] = t[0] / r[0], e[1] = t[1] / r[1], e[2] = t[2] / r[2], e[3] = t[3] / r[3], e
        },
        min: function (e, t, r) {
            return e[0] = MATH_MIN(t[0], r[0]), e[1] = MATH_MIN(t[1], r[1]), e[2] = MATH_MIN(t[2], r[2]), e[3] = MATH_MIN(t[3], r[3]), e
        },
        max: function (e, t, r) {
            return e[0] = MATH_MAX(t[0], r[0]), e[1] = MATH_MAX(t[1], r[1]), e[2] = MATH_MAX(t[2], r[2]), e[3] = MATH_MAX(t[3], r[3]), e
        },
        scale: function (e, t, r) {
            return e[0] = t[0] * r, e[1] = t[1] * r, e[2] = t[2] * r, e[3] = t[3] * r, e
        },
        scaleAndAdd: function (e, t, r, n) {
            return e[0] = t[0] + r[0] * n, e[1] = t[1] + r[1] * n, e[2] = t[2] + r[2] * n, e[3] = t[3] + r[3] * n, e
        },
        distance: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2], a = t[3] - e[3];
            return MATH_SQRT(r * r + n * n + o * o + a * a)
        },
        dist: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2], a = t[3] - e[3];
            return MATH_SQRT(r * r + n * n + o * o + a * a)
        },
        squaredDistance: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2], a = t[3] - e[3];
            return r * r + n * n + o * o + a * a
        },
        sqrDist: function (e, t) {
            var r = t[0] - e[0], n = t[1] - e[1], o = t[2] - e[2], a = t[3] - e[3];
            return r * r + n * n + o * o + a * a
        },
        length: function (e) {
            var t = e[0], r = e[1], n = e[2], o = e[3];
            return MATH_SQRT(t * t + r * r + n * n + o * o)
        },
        len: function (e) {
            var t = e[0], r = e[1], n = e[2], o = e[3];
            return MATH_SQRT(t * t + r * r + n * n + o * o)
        },
        squaredLength: function (e) {
            var t = e[0], r = e[1], n = e[2], o = e[3];
            return t * t + r * r + n * n + o * o
        },
        sqrLen: function (e) {
            var t = e[0], r = e[1], n = e[2], o = e[3];
            return t * t + r * r + n * n + o * o
        },
        negate: function (e, t) {
            return e[0] = -t[0], e[1] = -t[1], e[2] = -t[2], e[3] = -t[3], e
        },
        inverse: function (e, t) {
            return e[0] = 1 / t[0], e[1] = 1 / t[1], e[2] = 1 / t[2], e[3] = 1 / t[3], e
        },
        normalize: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = r * r + n * n + o * o + a * a;
            return i > 0 && (i = 1 / MATH_SQRT(i), e[0] = t[0] * i, e[1] = t[1] * i, e[2] = t[2] * i, e[3] = t[3] * i), e
        },
        dot: function (e, t) {
            return e[0] * t[0] + e[1] * t[1] + e[2] * t[2] + e[3] * t[3]
        },
        lerp: function (e, t, r, n) {
            var o = t[0], a = t[1], i = t[2], u = t[3];
            return e[0] = o + n * (r[0] - o), e[1] = a + n * (r[1] - a), e[2] = i + n * (r[2] - i), e[3] = u + n * (r[3] - u), e
        },
        random: function (e, t) {
            return t = t || 1, e[0] = n(), e[1] = n(), e[2] = n(), e[3] = n(), c.normalize(e, e), c.scale(e, e, t), e
        },
        transformMat4: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3];
            return e[0] = r[0] * n + r[4] * o + r[8] * a + r[12] * i, e[1] = r[1] * n + r[5] * o + r[9] * a + r[13] * i, e[2] = r[2] * n + r[6] * o + r[10] * a + r[14] * i, e[3] = r[3] * n + r[7] * o + r[11] * a + r[15] * i, e
        },
        transformQuat: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = r[0], u = r[1], c = r[2], l = r[3], s = l * n + u * a - c * o, f = l * o + c * n - i * a, v = l * a + i * o - u * n, p = -i * n - u * o - c * a;
            return e[0] = s * l + p * -i + f * -c - v * -u, e[1] = f * l + p * -u + v * -i - s * -c, e[2] = v * l + p * -c + s * -u - f * -i, e
        },
        forEach: function (t, r, n, o, a, i) {
            var u, c;
            for (r || (r = 4), n || (n = 0), c = o ? MATH_MIN(o * r + n, t.length) : t.length, u = n; c > u; u += r) {
                e[0] = t[u], e[1] = t[u + 1], e[2] = t[u + 2], e[3] = t[u + 3], a(e, e, i), t[u] = e[0], t[u + 1] = e[1], t[u + 2] = e[2], t[u + 3] = e[3];
            }
            return t
        },
        str: function (e) {
            return "vec4(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ")"
        },
        load: function (e, t, r) {
            e[0] = t[r + 0], e[1] = t[r + 1], e[2] = t[r + 2], e[3] = t[r + 3]
        },
        save: function (e, t, r) {
            t[r + 0] = e[0], t[r + 1] = e[1], t[r + 2] = e[2], t[r + 3] = e[3]
        }
    };
    mat2 = {
        create: function () {
            var e = new FLOAT_ARRAY(4);
            return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e
        },
        clone: function (e) {
            var t = new FLOAT_ARRAY(4);
            return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t
        },
        copy: function (e, t) {
            return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e
        },
        identity: function (e) {
            return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 1, e
        },
        transpose: function (e, t) {
            if (e === t) {
                var r = t[1];
                e[1] = t[2], e[2] = r
            } else e[0] = t[0], e[1] = t[2], e[2] = t[1], e[3] = t[3];
            return e
        },
        invert: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = r * a - o * n;
            return i ? (i = 1 / i, e[0] = a * i, e[1] = -n * i, e[2] = -o * i, e[3] = r * i, e) : null
        },
        adjoint: function (e, t) {
            var r = t[0];
            return e[0] = t[3], e[1] = -t[1], e[2] = -t[2], e[3] = r, e
        },
        determinant: function (e) {
            return e[0] * e[3] - e[2] * e[1]
        },
        multiply: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = r[0], c = r[1], l = r[2], s = r[3];
            return e[0] = n * u + a * c, e[1] = o * u + i * c, e[2] = n * l + a * s, e[3] = o * l + i * s, e
        },
        mul: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = r[0], c = r[1], l = r[2], s = r[3];
            return e[0] = n * u + a * c, e[1] = o * u + i * c, e[2] = n * l + a * s, e[3] = o * l + i * s, e
        },
        rotate: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = MATH_SIN(r), c = MATH_COS(r);
            return e[0] = n * c + a * u, e[1] = o * c + i * u, e[2] = n * -u + a * c, e[3] = o * -u + i * c, e
        },
        scale: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = r[0], c = r[1];
            return e[0] = n * u, e[1] = o * u, e[2] = a * c, e[3] = i * c, e
        },
        str: function (e) {
            return "mat2(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ")"
        },
        frob: function (e) {
            return MATH_SQRT(MATH_POW(e[0], 2) + MATH_POW(e[1], 2) + MATH_POW(e[2], 2) + MATH_POW(e[3], 2))
        },
        LDU: function (e, t, r, n) {
            return e[2] = n[2] / n[0], r[0] = n[0], r[1] = n[1], r[3] = n[3] - e[2] * r[1], [e, t, r]
        }
    };
    mat3 = {
        create: function () {
            var e = new FLOAT_ARRAY(9);
            return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 1, e[5] = 0, e[6] = 0, e[7] = 0, e[8] = 1, e
        },
        fromMat4: function (e, t) {
            return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[4], e[4] = t[5], e[5] = t[6], e[6] = t[8], e[7] = t[9], e[8] = t[10], e
        },
        clone: function (e) {
            var t = new FLOAT_ARRAY(9);
            return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4], t[5] = e[5], t[6] = e[6], t[7] = e[7], t[8] = e[8], t
        },
        copy: function (e, t) {
            return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e[6] = t[6], e[7] = t[7], e[8] = t[8], e
        },
        identity: function (e) {
            return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 1, e[5] = 0, e[6] = 0, e[7] = 0, e[8] = 1, e
        },
        transpose: function (e, t) {
            if (e === t) {
                var r = t[1], n = t[2], o = t[5];
                e[1] = t[3], e[2] = t[6], e[3] = r, e[5] = t[7], e[6] = n, e[7] = o
            } else e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8];
            return e
        },
        invert: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8], f = s * i - u * l, v = -s * a + u * c, p = l * a - i * c, g = r * f + n * v + o * p;
            return g ? (g = 1 / g, e[0] = f * g, e[1] = (-s * n + o * l) * g, e[2] = (u * n - o * i) * g, e[3] = v * g, e[4] = (s * r - o * c) * g, e[5] = (-u * r + o * a) * g, e[6] = p * g, e[7] = (-l * r + n * c) * g, e[8] = (i * r - n * a) * g, e) : null
        },
        adjoint: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8];
            return e[0] = i * s - u * l, e[1] = o * l - n * s, e[2] = n * u - o * i, e[3] = u * c - a * s, e[4] = r * s - o * c, e[5] = o * a - r * u, e[6] = a * l - i * c, e[7] = n * c - r * l, e[8] = r * i - n * a, e
        },
        determinant: function (e) {
            var t = e[0], r = e[1], n = e[2], o = e[3], a = e[4], i = e[5], u = e[6], c = e[7], l = e[8];
            return t * (l * a - i * c) + r * (-l * o + i * u) + n * (c * o - a * u)
        },
        multiply: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = r[0], p = r[1], g = r[2], h = r[3], m = r[4], d = r[5], _ = r[6], b = r[7], y = r[8];
            return e[0] = v * n + p * i + g * l, e[1] = v * o + p * u + g * s, e[2] = v * a + p * c + g * f, e[3] = h * n + m * i + d * l, e[4] = h * o + m * u + d * s, e[5] = h * a + m * c + d * f, e[6] = _ * n + b * i + y * l, e[7] = _ * o + b * u + y * s, e[8] = _ * a + b * c + y * f, e
        },
        mul: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = r[0], p = r[1], g = r[2], h = r[3], m = r[4], d = r[5], _ = r[6], b = r[7], y = r[8];
            return e[0] = v * n + p * i + g * l, e[1] = v * o + p * u + g * s, e[2] = v * a + p * c + g * f, e[3] = h * n + m * i + d * l, e[4] = h * o + m * u + d * s, e[5] = h * a + m * c + d * f, e[6] = _ * n + b * i + y * l, e[7] = _ * o + b * u + y * s, e[8] = _ * a + b * c + y * f, e
        },
        translate: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = r[0], p = r[1];
            return e[0] = n, e[1] = o, e[2] = a, e[3] = i, e[4] = u, e[5] = c, e[6] = v * n + p * i + l, e[7] = v * o + p * u + s, e[8] = v * a + p * c + f, e
        },
        rotate: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = MATH_SIN(r), p = MATH_COS(r);
            return e[0] = p * n + v * i, e[1] = p * o + v * u, e[2] = p * a + v * c, e[3] = p * i - v * n, e[4] = p * u - v * o, e[5] = p * c - v * a, e[6] = l, e[7] = s, e[8] = f, e
        },
        scale: function (e, t, r) {
            var n = r[0], o = r[1];
            return e[0] = n * t[0], e[1] = n * t[1], e[2] = n * t[2], e[3] = o * t[3], e[4] = o * t[4], e[5] = o * t[5], e[6] = t[6], e[7] = t[7], e[8] = t[8], e
        },
        fromMat2d: function (e, t) {
            return e[0] = t[0], e[1] = t[1], e[2] = 0, e[3] = t[2], e[4] = t[3], e[5] = 0, e[6] = t[4], e[7] = t[5], e[8] = 1, e
        },
        fromQuat: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = r + r, u = n + n, c = o + o, l = r * i, s = n * i, f = n * u, v = o * i, p = o * u, g = o * c, h = a * i, m = a * u, d = a * c;
            return e[0] = 1 - f - g, e[3] = s - d, e[6] = v + m, e[1] = s + d, e[4] = 1 - l - g, e[7] = p - h, e[2] = v - m, e[5] = p + h, e[8] = 1 - l - f, e
        },
        normalFromMat4: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8], f = t[9], v = t[10], p = t[11], g = t[12], h = t[13], m = t[14], d = t[15], _ = r * u - n * i, b = r * c - o * i, y = r * l - a * i, T = n * c - o * u, w = n * l - a * u, E = o * l - a * c, x = s * h - f * g, A = s * m - v * g, M = s * d - p * g, R = f * m - v * h, P = f * d - p * h, L = v * d - p * m, D = _ * L - b * P + y * R + T * M - w * A + E * x;
            return D ? (D = 1 / D, e[0] = (u * L - c * P + l * R) * D, e[1] = (c * M - i * L - l * A) * D, e[2] = (i * P - u * M + l * x) * D, e[3] = (o * P - n * L - a * R) * D, e[4] = (r * L - o * M + a * A) * D, e[5] = (n * M - r * P - a * x) * D, e[6] = (h * E - m * w + d * T) * D, e[7] = (m * y - g * E - d * b) * D, e[8] = (g * w - h * y + d * _) * D, e) : null
        },
        str: function (e) {
            return "mat3(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ", " + e[4] + ", " + e[5] + ", " + e[6] + ", " + e[7] + ", " + e[8] + ")"
        },
        frob: function (e) {
            return MATH_SQRT(MATH_POW(e[0], 2) + MATH_POW(e[1], 2) + MATH_POW(e[2], 2) + MATH_POW(e[3], 2) + MATH_POW(e[4], 2) + MATH_POW(e[5], 2) + MATH_POW(e[6], 2) + MATH_POW(e[7], 2) + MATH_POW(e[8], 2))
        }
    };
    mat4 = {
        create: function () {
            var e = new FLOAT_ARRAY(16);
            return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 1, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e
        },
        clone: function (e) {
            var t = new FLOAT_ARRAY(16);
            return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4], t[5] = e[5], t[6] = e[6], t[7] = e[7], t[8] = e[8], t[9] = e[9], t[10] = e[10], t[11] = e[11], t[12] = e[12], t[13] = e[13], t[14] = e[14], t[15] = e[15], t
        },
        copy: function (e, t) {
            return e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[4] = t[4], e[5] = t[5], e[6] = t[6], e[7] = t[7], e[8] = t[8], e[9] = t[9], e[10] = t[10], e[11] = t[11], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15], e
        },
        identity: function (e) {
            return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 1, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e
        },
        transpose: function (e, t) {
            if (e === t) {
                var r = t[1], n = t[2], o = t[3], a = t[6], i = t[7], u = t[11];
                e[1] = t[4], e[2] = t[8], e[3] = t[12], e[4] = r, e[6] = t[9], e[7] = t[13], e[8] = n, e[9] = a, e[11] = t[14], e[12] = o, e[13] = i, e[14] = u
            } else e[0] = t[0], e[1] = t[4], e[2] = t[8], e[3] = t[12], e[4] = t[1], e[5] = t[5], e[6] = t[9], e[7] = t[13], e[8] = t[2], e[9] = t[6], e[10] = t[10], e[11] = t[14], e[12] = t[3], e[13] = t[7], e[14] = t[11], e[15] = t[15];
            return e
        },
        invert: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8], f = t[9], v = t[10], p = t[11], g = t[12], h = t[13], m = t[14], d = t[15], _ = r * u - n * i, b = r * c - o * i, y = r * l - a * i, T = n * c - o * u, w = n * l - a * u, E = o * l - a * c, x = s * h - f * g, A = s * m - v * g, M = s * d - p * g, R = f * m - v * h, P = f * d - p * h, L = v * d - p * m, D = _ * L - b * P + y * R + T * M - w * A + E * x;
            return D ? (D = 1 / D, e[0] = (u * L - c * P + l * R) * D, e[1] = (o * P - n * L - a * R) * D, e[2] = (h * E - m * w + d * T) * D, e[3] = (v * w - f * E - p * T) * D, e[4] = (c * M - i * L - l * A) * D, e[5] = (r * L - o * M + a * A) * D, e[6] = (m * y - g * E - d * b) * D, e[7] = (s * E - v * y + p * b) * D, e[8] = (i * P - u * M + l * x) * D, e[9] = (n * M - r * P - a * x) * D, e[10] = (g * w - h * y + d * _) * D, e[11] = (f * y - s * w - p * _) * D, e[12] = (u * A - i * R - c * x) * D, e[13] = (r * R - n * A + o * x) * D, e[14] = (h * b - g * T - m * _) * D, e[15] = (s * T - f * b + v * _) * D, e) : null
        },
        adjoint: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = t[4], u = t[5], c = t[6], l = t[7], s = t[8], f = t[9], v = t[10], p = t[11], g = t[12], h = t[13], m = t[14], d = t[15];
            return e[0] = u * (v * d - p * m) - f * (c * d - l * m) + h * (c * p - l * v), e[1] = -(n * (v * d - p * m) - f * (o * d - a * m) + h * (o * p - a * v)), e[2] = n * (c * d - l * m) - u * (o * d - a * m) + h * (o * l - a * c), e[3] = -(n * (c * p - l * v) - u * (o * p - a * v) + f * (o * l - a * c)), e[4] = -(i * (v * d - p * m) - s * (c * d - l * m) + g * (c * p - l * v)), e[5] = r * (v * d - p * m) - s * (o * d - a * m) + g * (o * p - a * v), e[6] = -(r * (c * d - l * m) - i * (o * d - a * m) + g * (o * l - a * c)), e[7] = r * (c * p - l * v) - i * (o * p - a * v) + s * (o * l - a * c), e[8] = i * (f * d - p * h) - s * (u * d - l * h) + g * (u * p - l * f), e[9] = -(r * (f * d - p * h) - s * (n * d - a * h) + g * (n * p - a * f)), e[10] = r * (u * d - l * h) - i * (n * d - a * h) + g * (n * l - a * u), e[11] = -(r * (u * p - l * f) - i * (n * p - a * f) + s * (n * l - a * u)), e[12] = -(i * (f * m - v * h) - s * (u * m - c * h) + g * (u * v - c * f)), e[13] = r * (f * m - v * h) - s * (n * m - o * h) + g * (n * v - o * f), e[14] = -(r * (u * m - c * h) - i * (n * m - o * h) + g * (n * c - o * u)), e[15] = r * (u * v - c * f) - i * (n * v - o * f) + s * (n * c - o * u), e
        },
        determinant: function (e) {
            var t = e[0], r = e[1], n = e[2], o = e[3], a = e[4], i = e[5], u = e[6], c = e[7], l = e[8], s = e[9], f = e[10], v = e[11], p = e[12], g = e[13], h = e[14], m = e[15], d = t * i - r * a, _ = t * u - n * a, b = t * c - o * a, y = r * u - n * i, T = r * c - o * i, w = n * c - o * u, E = l * g - s * p, x = l * h - f * p, A = l * m - v * p, M = s * h - f * g, R = s * m - v * g, P = f * m - v * h;
            return d * P - _ * R + b * M + y * A - T * x + w * E
        },
        multiply: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = t[9], p = t[10], g = t[11], h = t[12], m = t[13], d = t[14], _ = t[15], b = r[0], y = r[1], T = r[2], w = r[3];
            return e[0] = b * n + y * u + T * f + w * h, e[1] = b * o + y * c + T * v + w * m, e[2] = b * a + y * l + T * p + w * d, e[3] = b * i + y * s + T * g + w * _, b = r[4], y = r[5], T = r[6], w = r[7], e[4] = b * n + y * u + T * f + w * h, e[5] = b * o + y * c + T * v + w * m, e[6] = b * a + y * l + T * p + w * d, e[7] = b * i + y * s + T * g + w * _, b = r[8], y = r[9], T = r[10], w = r[11], e[8] = b * n + y * u + T * f + w * h, e[9] = b * o + y * c + T * v + w * m, e[10] = b * a + y * l + T * p + w * d, e[11] = b * i + y * s + T * g + w * _, b = r[12], y = r[13], T = r[14], w = r[15], e[12] = b * n + y * u + T * f + w * h, e[13] = b * o + y * c + T * v + w * m, e[14] = b * a + y * l + T * p + w * d, e[15] = b * i + y * s + T * g + w * _, e
        },
        mul: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = t[9], p = t[10], g = t[11], h = t[12], m = t[13], d = t[14], _ = t[15], b = r[0], y = r[1], T = r[2], w = r[3];
            return e[0] = b * n + y * u + T * f + w * h, e[1] = b * o + y * c + T * v + w * m, e[2] = b * a + y * l + T * p + w * d, e[3] = b * i + y * s + T * g + w * _, b = r[4], y = r[5], T = r[6], w = r[7], e[4] = b * n + y * u + T * f + w * h, e[5] = b * o + y * c + T * v + w * m, e[6] = b * a + y * l + T * p + w * d, e[7] = b * i + y * s + T * g + w * _, b = r[8], y = r[9], T = r[10], w = r[11], e[8] = b * n + y * u + T * f + w * h, e[9] = b * o + y * c + T * v + w * m, e[10] = b * a + y * l + T * p + w * d, e[11] = b * i + y * s + T * g + w * _, b = r[12], y = r[13], T = r[14], w = r[15], e[12] = b * n + y * u + T * f + w * h, e[13] = b * o + y * c + T * v + w * m, e[14] = b * a + y * l + T * p + w * d, e[15] = b * i + y * s + T * g + w * _, e
        },
        translate: function (e, t, r) {
            var n, o, a, i, u, c, l, s, f, v, p, g, h = r[0], m = r[1], d = r[2];
            return t === e ? (e[12] = t[0] * h + t[4] * m + t[8] * d + t[12], e[13] = t[1] * h + t[5] * m + t[9] * d + t[13], e[14] = t[2] * h + t[6] * m + t[10] * d + t[14], e[15] = t[3] * h + t[7] * m + t[11] * d + t[15]) : (n = t[0], o = t[1], a = t[2], i = t[3], u = t[4], c = t[5], l = t[6], s = t[7], f = t[8], v = t[9], p = t[10], g = t[11], e[0] = n, e[1] = o, e[2] = a, e[3] = i, e[4] = u, e[5] = c, e[6] = l, e[7] = s, e[8] = f, e[9] = v, e[10] = p, e[11] = g, e[12] = n * h + u * m + f * d + t[12], e[13] = o * h + c * m + v * d + t[13], e[14] = a * h + l * m + p * d + t[14], e[15] = i * h + s * m + g * d + t[15]), e
        },
        scale: function (e, t, r) {
            var n = r[0], o = r[1], a = r[2];
            return e[0] = t[0] * n, e[1] = t[1] * n, e[2] = t[2] * n, e[3] = t[3] * n, e[4] = t[4] * o, e[5] = t[5] * o, e[6] = t[6] * o, e[7] = t[7] * o, e[8] = t[8] * a, e[9] = t[9] * a, e[10] = t[10] * a, e[11] = t[11] * a, e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15], e
        },
        rotate: function (e, r, n, o) {
            var a, i, u, c, l, s, f, v, p, g, h, m, d, _, b, y, T, w, E, x, A, M, R, P, L = o[0], D = o[1], S = o[2], F = MATH_SQRT(L * L + D * D + S * S);
            return MATH.abs(F) < t ? null : (F = 1 / F, L *= F, D *= F, S *= F, a = MATH_SIN(n), i = MATH_COS(n), u = 1 - i, c = r[0], l = r[1], s = r[2], f = r[3], v = r[4], p = r[5], g = r[6], h = r[7], m = r[8], d = r[9], _ = r[10], b = r[11], y = L * L * u + i, T = D * L * u + S * a, w = S * L * u - D * a, E = L * D * u - S * a, x = D * D * u + i, A = S * D * u + L * a, M = L * S * u + D * a, R = D * S * u - L * a, P = S * S * u + i, e[0] = c * y + v * T + m * w, e[1] = l * y + p * T + d * w, e[2] = s * y + g * T + _ * w, e[3] = f * y + h * T + b * w, e[4] = c * E + v * x + m * A, e[5] = l * E + p * x + d * A, e[6] = s * E + g * x + _ * A, e[7] = f * E + h * x + b * A, e[8] = c * M + v * R + m * P, e[9] = l * M + p * R + d * P, e[10] = s * M + g * R + _ * P, e[11] = f * M + h * R + b * P, r !== e && (e[12] = r[12], e[13] = r[13], e[14] = r[14], e[15] = r[15]), e)
        },
        rotateX: function (e, t, r) {
            var n = MATH_SIN(r), o = MATH_COS(r), a = t[4], i = t[5], u = t[6], c = t[7], l = t[8], s = t[9], f = t[10], v = t[11];
            return t !== e && (e[0] = t[0], e[1] = t[1], e[2] = t[2], e[3] = t[3], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[4] = a * o + l * n, e[5] = i * o + s * n, e[6] = u * o + f * n, e[7] = c * o + v * n, e[8] = l * o - a * n, e[9] = s * o - i * n, e[10] = f * o - u * n, e[11] = v * o - c * n, e
        },
        rotateY: function (e, t, r) {
            var n = MATH_SIN(r), o = MATH_COS(r), a = t[0], i = t[1], u = t[2], c = t[3], l = t[8], s = t[9], f = t[10], v = t[11];
            return t !== e && (e[4] = t[4], e[5] = t[5], e[6] = t[6], e[7] = t[7], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[0] = a * o - l * n, e[1] = i * o - s * n, e[2] = u * o - f * n, e[3] = c * o - v * n, e[8] = a * n + l * o, e[9] = i * n + s * o, e[10] = u * n + f * o, e[11] = c * n + v * o, e
        },
        rotateZ: function (e, t, r) {
            var n = MATH_SIN(r), o = MATH_COS(r), a = t[0], i = t[1], u = t[2], c = t[3], l = t[4], s = t[5], f = t[6], v = t[7];
            return t !== e && (e[8] = t[8], e[9] = t[9], e[10] = t[10], e[11] = t[11], e[12] = t[12], e[13] = t[13], e[14] = t[14], e[15] = t[15]), e[0] = a * o + l * n, e[1] = i * o + s * n, e[2] = u * o + f * n, e[3] = c * o + v * n, e[4] = l * o - a * n, e[5] = s * o - i * n, e[6] = f * o - u * n, e[7] = v * o - c * n, e
        },
        fromRotationTranslation: function (e, t, r) {
            var n = t[0], o = t[1], a = t[2], i = t[3], u = n + n, c = o + o, l = a + a, s = n * u, f = n * c, v = n * l, p = o * c, g = o * l, h = a * l, m = i * u, d = i * c, _ = i * l;
            return e[0] = 1 - (p + h), e[1] = f + _, e[2] = v - d, e[3] = 0, e[4] = f - _, e[5] = 1 - (s + h), e[6] = g + m, e[7] = 0, e[8] = v + d, e[9] = g - m, e[10] = 1 - (s + p), e[11] = 0, e[12] = r[0], e[13] = r[1], e[14] = r[2], e[15] = 1, e
        },
        fromQuat: function (e, t) {
            var r = t[0], n = t[1], o = t[2], a = t[3], i = r + r, u = n + n, c = o + o, l = r * i, s = n * i, f = n * u, v = o * i, p = o * u, g = o * c, h = a * i, m = a * u, d = a * c;
            return e[0] = 1 - f - g, e[1] = s + d, e[2] = v - m, e[3] = 0, e[4] = s - d, e[5] = 1 - l - g, e[6] = p + h, e[7] = 0, e[8] = v + m, e[9] = p - h, e[10] = 1 - l - f, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e
        },
        frustum: function (e, t, r, n, o, a, i) {
            var u = 1 / (r - t), c = 1 / (o - n), l = 1 / (a - i);
            return e[0] = 2 * a * u, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 2 * a * c, e[6] = 0, e[7] = 0, e[8] = (r + t) * u, e[9] = (o + n) * c, e[10] = (i + a) * l, e[11] = -1, e[12] = 0, e[13] = 0, e[14] = i * a * 2 * l, e[15] = 0, e
        },
        perspective: function (e, t, r, n, o) {
            var a = 1 / MATH.tan(t / 2), i = 1 / (n - o);
            return e[0] = a / r, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = a, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = (o + n) * i, e[11] = -1, e[12] = 0, e[13] = 0, e[14] = 2 * o * n * i, e[15] = 0, e
        },
        ortho: function (e, t, r, n, o, a, i) {
            var u = 1 / (t - r), c = 1 / (n - o), l = 1 / (a - i);
            return e[0] = -2 * u, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = -2 * c, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 2 * l, e[11] = 0, e[12] = (t + r) * u, e[13] = (o + n) * c, e[14] = (i + a) * l, e[15] = 1, e
        },
        str: function (e) {
            return "mat4(" + e[0] + ", " + e[1] + ", " + e[2] + ", " + e[3] + ", " + e[4] + ", " + e[5] + ", " + e[6] + ", " + e[7] + ", " + e[8] + ", " + e[9] + ", " + e[10] + ", " + e[11] + ", " + e[12] + ", " + e[13] + ", " + e[14] + ", " + e[15] + ")"
        },
        frob: function (e) {
            return MATH_SQRT(MATH_POW(e[0], 2) + MATH_POW(e[1], 2) + MATH_POW(e[2], 2) + MATH_POW(e[3], 2) + MATH_POW(e[4], 2) + MATH_POW(e[5], 2) + MATH_POW(e[6], 2) + MATH_POW(e[7], 2) + MATH_POW(e[8], 2) + MATH_POW(e[9], 2) + MATH_POW(e[10], 2) + MATH_POW(e[11], 2) + MATH_POW(e[12], 2) + MATH_POW(e[13], 2) + MATH_POW(e[14], 2) + MATH_POW(e[15], 2))
        },
        lerp: function (e, t, r, n) {
            for (var o = 0; 16 > o; ++o) {
                e[o] = (1 - n) * t[o] + n * r[o];
            }
            return e
        },
        lookAt: function (e, r, n, o) {

            var a,
                i,
                u,
                c,
                l,
                s,
                f,
                p,
                g,
                h,
                m = r[0],
                d = r[1],
                _ = r[2],
                b = o[0],
                y = o[1],
                T = o[2],
                w = n[0],
                E = n[1],
                x = n[2],
                t = 1e-6;
            return MATH.abs(m - w) < t && MATH.abs(d - E) < t && MATH.abs(_ - x) < t ? v.identity(e) : (f = m - w, p = d - E, g = _ - x, h = 1 / MATH_SQRT(f * f + p * p + g * g), f *= h, p *= h, g *= h, a = y * g - T * p, i = T * f - b * g, u = b * p - y * f, h = MATH_SQRT(a * a + i * i + u * u), h ? (h = 1 / h, a *= h, i *= h, u *= h) : (a = 0, i = 0, u = 0), c = p * u - g * i, l = g * a - f * u, s = f * i - p * a, h = MATH_SQRT(c * c + l * l + s * s), h ? (h = 1 / h, c *= h, l *= h, s *= h) : (c = 0, l = 0, s = 0), e[0] = a, e[1] = c, e[2] = f, e[3] = 0, e[4] = i, e[5] = l, e[6] = p, e[7] = 0, e[8] = u, e[9] = s, e[10] = g, e[11] = 0, e[12] = -(a * m + i * d + u * _), e[13] = -(c * m + l * d + s * _), e[14] = -(f * m + p * d + g * _), e[15] = 1, e)

        }
    };
    Random = {
        cardinal: function (e) {
            return MATH.floor(e * b())
        },
        integer: function (e, t) {
            return e + MATH.floor((t - e) * b())
        },
        uniform: function (e, t) {
            return lerp(e, t, MATH_RANDOM())
        },
        gauss: function (e, t) {
            var r = d;
            if (d = 0, 0 === r) {
                var n = TWO_PI * b(), o = MATH_SQRT(-2 * MATH.log(1 - b()));
                r = MATH_COS(n) * o, d = MATH_SIN(n) * o
            }
            return e + r * t
        },
        choose: function (e) {
            var t = Random.cardinal(e.length);
            return e[t]
        },
        uniformVec3: function (e, t) {
            return e[0] = 2 * t * (MATH_RANDOM() - .5), e[1] = 2 * t * (MATH_RANDOM() - .5), e[2] = 2 * t * (MATH_RANDOM() - .5), e
        },
        unitVec3: function (e) {
            return Random.uniformVec3(e, 1), vec3.normalize(e, e), e
        },
        shuffle: function (e) {
            for (var t = e.length - 1; t >= 0; --t) {
                var r = Random.cardinal(t + 1), n = e[t];
                e[t] = e[r], e[r] = n
            }
        },
        distribute: function (e, t, n) {
            return lerp(e, t, MATH_POW(b(), n))
        }
    };
    Base64 = {
        decode: function (e, t) {
            for (var r = atob(e), n = r.length, o = new ArrayBuffer(n), a = new Uint8Array(o), i = 0; n > i; ++i) {
                a[i] = r.charCodeAt(i);
            }
            return t ? new t(o) : o
        },
        encode: function (e) {
            for (var e = new Uint8Array(e.buffer, e.byteOffset, e.byteLength), t = e.length, r = "", n = 0; t > n; ++n) {
                r += String.fromCharCode(e[n]);
            }
            return btoa(r)
        }
    };

    /**
     * 事件机制
     * @returns {Eventful}
     * @constructor
     */
    function Eventful() {

    }

    Eventful.prototype = {
        /**
         * 绑定一个事件
         * @param event 事件名
         * @param handler 回调函数
         * @param once 是否只触发1次
         * @returns {Eventful}
         */
        bind: function (event, handler, once) {
            var _h = this._events = this._events || {};
            if (isFunction(event)) {
                once = handler;
                handler = event;
                event = "*";
            }
            if (!isFunction(handler) || !event) {
                return this;
            }
            _h[event] = _h[event] || [];

            _h[event].push({
                h: handler,
                once: !!once
            });

            return this;
        },
        /**
         * 解绑事件
         * @param eventName 事件名,为空时全部解绑
         * @param handler 要解绑哪个具体的事件,为空时解绑所有eventName事件
         * @returns {Eventful}
         */
        unbind: function (eventName, handler) {
            var self = this,
                _h = self._events || {};

            if (!eventName) {
                self._events = {};
                return self;
            }

            if (handler) {
                if (_h[eventName]) {
                    var newList = [];
                    for (var i = 0, l = _h[eventName].length; i < l; i++) {
                        if (_h[eventName][i]["h"] != handler) {
                            newList.push(_h[eventName][i]);
                        }
                    }
                    _h[eventName] = newList;
                }

                if (_h[eventName] && _h[eventName].length === 0) {
                    delete _h[eventName];
                }
            }
            else {
                delete _h[eventName];
            }

            return self;
        },
        /**
         * 触发事件
         * @returns {Eventful}
         */
        dispatch: function () {
            ARRAYPROTO.push.call(arguments, this);
            return this.dispatchWithContext.apply(this, arguments);
        },
        /**
         * 自定义context并触发事件,最后一个参数为context
         * @param type
         * @returns {Eventful}
         */
        dispatchWithContext: function (type) {
            var self = this,
                args = arguments,
                argLength = args.length - 1,
                paramArgs = ARRAYPROTO.slice.call(args, 1, argLength),
                events = self._events || {},
                context = args[argLength];

            each(events[type] || {}, function (event, index) {

                event.h.apply(context, paramArgs);

                if (event.once) {

                    delete self._events[type][index];
                }
            });
            ARRAYPROTO.unshift.call(paramArgs, type);
            each(events["*"] || [], function (event, index) {

                event.h.apply(context, paramArgs);

                if (event.once) {
                    delete self._events["*"][index];
                }
            });

            return self;
        }
    };

    var MOUSE_STATE = -1;

    var SHADERS = window.SHADERS = {
        "stars": "attribute vec4 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        "stars.vertex": "void main() {\n    gl_PointSize = position.w;\n    gl_Position = mvp * vec4(position.xyz, 1.0);\n}\n",
        "stars.fragment": "void main() {\n    gl_FragColor = color;\n}\n",
        "corona": "attribute vec4 vertex;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform mat3 bill;\nuniform vec4 color;\nuniform sampler2D t_smoke;\nuniform float time;\n\nuniform vec3 color0;\nuniform vec3 color1;\nuniform float zoff;\n",
        "corona.vertex": "void main() {\n    float s = 10.0 + (10.0 * vertex.w);\n    vec3 P = vec3(s * vertex.xy, zoff);\n    P = bill * P;\n    gl_Position = mvp * vec4(P, 1.0);\n    v_texcoord = vertex.zw;\n}\n",
        "corona.fragment": "void main() {\n    vec2 uv = vec2(5.0*v_texcoord.x + 0.01*time, 0.8 - 1.5*v_texcoord.y);\n    float smoke = texture2D(t_smoke, uv).r;\n    uv = vec2(3.0*v_texcoord.x - 0.007*time, 0.9 - 0.5*v_texcoord.y);\n    smoke *= 1.5*texture2D(t_smoke, uv).r;\n\n    float t = pow(v_texcoord.y, 0.25);\n    gl_FragColor.rgb = mix(color0, color1, t) + 0.3*smoke;\n    gl_FragColor.a = 1.0;\n}\n",
        "icon": "attribute vec3 vertex;\nvarying float v_alpha;\nuniform mat4 mvp;\nuniform mat4 mat;\nuniform vec3 color;\nuniform float time;\nuniform float scale;\n",
        "icon.vertex": "void main() {\n    float spread = 1.0 + (time * 0.3*vertex.z);\n    vec3 P = scale * spread * vec3(vertex.xy, -2.50*(vertex.z)*time);\n    P = P.xzy;\n    P.y = -P.y;\n    gl_Position = mvp * mat * vec4(P, 1.0);\n    v_alpha = 1.0 - vertex.z/6.0;\n}\n",
        "icon.fragment": "void main() {\n    gl_FragColor.rgb = color;\n    gl_FragColor.a = (1.0 - pow(time, 7.0)) * (v_alpha * time);\n}\n",
        "missile": "attribute vec4 position;\nvarying vec3 v_normal;\nvarying vec3 v_view_vec;\nvarying float v_alpha;\nvarying float v_v;\nuniform mat4 mvp;\nuniform vec3 view_position;\nuniform vec3 color;\nuniform float time;\nuniform float width;\n",
        "missile.vertex": "void main() {\n    float u = abs(position.w);\n    float v = sign(position.w);\n    v_v = v;\n\n    float w = 0.2 + 0.3*(1.0 - pow(2.0*abs(u - 0.5), 2.0));\n    w = width * w * (v - 0.5);\n\n    vec3 P = position.xyz;\n    P.x += w;\n\n    v_normal = normalize(P);\n    v_view_vec = normalize(view_position - P);\n    v_alpha = u;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "missile.fragment": "void main() {\n    vec3 N = normalize(v_normal);\n    vec3 V = normalize(v_view_vec);\n    float NdotV = max(0.0, dot(N, V));\n    float w = 1.0 - pow(abs(v_v), 4.0);\n    gl_FragColor.rgb = color.rgb;\n    gl_FragColor.a = pow(max(0.0, sin(3.14159 * (v_alpha + (1.0 - 2.0*time)))), 3.5);\n    gl_FragColor.a *= w;\n}\n",
        "map_pick": "attribute vec3 position;\nuniform mat4 mvp;\nuniform float color;\n",
        "map_pick.vertex": "void main() {\n    vec3 P = position;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "map_pick.fragment": "void main() {\n    gl_FragColor = vec4(color, 0.0, 0.0, 1.0);\n}\n",
        "map_main": "attribute vec3 position;\nattribute vec3 normal;\nattribute vec3 position2;\nattribute vec3 normal2;\nattribute vec2 texcoord;\nvarying vec3 v_normal;\nvarying vec2 v_texcoord;\nvarying vec3 v_light_vec;\nvarying vec3 v_view_vec;\nuniform mat4 mvp;\nuniform float offset_x;\n\nuniform sampler2D t_blur;\nuniform float blend;\nuniform vec3 light_pos;\nuniform vec3 view_pos;\n\nuniform vec3 color0;\nuniform vec3 color1;\nuniform float tone;\nuniform float alpha;\nuniform float height;\n",
        "map_main.vertex": "void main() {\n    vec3 P = mix(position, position2, blend);\n    P.x += offset_x;\n\n    v_normal = mix(normal, normal2, blend);\n    P += height * v_normal;\n\n    gl_Position = mvp * vec4(P, 1.0);\n\n    v_texcoord = texcoord;\n    v_light_vec = light_pos - P;\n    v_view_vec = view_pos - P;\n}\n",
        "map_main.fragment": "void main() {\n    vec3 N = normalize(-v_normal);\n    vec3 V = normalize(v_view_vec);\n    vec3 L = normalize(v_light_vec);\n    vec3 H = normalize(L + V);\n    float NdotL = max(0.0, dot(N, L));\n    float NdotH = max(0.0, dot(N, H));\n\n    float blur = texture2D(t_blur, v_texcoord).r;\n    blur = 1.0*pow(blur, 2.0);\n\n    float diffuse = 0.5 + 0.5*NdotL;\n    float specular = 0.75 * pow(NdotH, 15.0);\n\n    gl_FragColor.rgb = diffuse * mix(color0, color1, tone) + vec3(specular);\n    gl_FragColor.a = alpha;\n}\n",
        "map_grid": "attribute vec3 position;\nattribute vec3 position2;\nattribute vec2 texcoord;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform vec2 pattern_scale;\nuniform sampler2D t_blur;\nuniform sampler2D t_pattern;\nuniform float blend;\nuniform vec3 color0;\nuniform vec3 color1;\nuniform float offset_x;\n",
        "map_grid.vertex": "void main() {\n    vec3 P = mix(position, position2, blend);\n    P.x += offset_x;\n    gl_Position = mvp * vec4(P, 1.0);\n    v_texcoord = texcoord;\n}\n",
        "map_grid.fragment": "void main() {\n    float pattern = texture2D(t_pattern, pattern_scale * v_texcoord).r;\n    float blur = texture2D(t_blur, v_texcoord).r;\n\n    gl_FragColor.rgb = mix(color0, color1, blur) + vec3(pattern);\n    gl_FragColor.a = 1.0;\n}\n",
        "map_line": "attribute vec3 position;\nattribute vec3 normal;\nattribute vec3 position2;\nattribute vec3 normal2;\nuniform mat4 mvp;\nuniform vec4 color;\nuniform float blend;\nuniform float height;\n",
        "map_line.vertex": "void main() {\n    vec3 P = mix(position, position2, blend);\n    vec3 N = mix(normal, normal2, blend);\n    P += height * N;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "map_line.fragment": "void main() {\n    gl_FragColor = color;\n}\n\n",
        "label": "attribute vec3 position;\nattribute vec2 texcoord;\nvarying float v_alpha;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform vec4 color;\nuniform vec4 circle_of_interest;\nuniform bool inside;\nuniform sampler2D t_color;\n",
        "label.vertex": "void main() {\n    gl_Position = mvp * vec4(position, 1.0);\n    v_alpha = max(0.0, 1.0 - distance(position, circle_of_interest.xyz)/circle_of_interest.a);\n    if (!inside)\n        v_alpha = pow(1.0 - v_alpha, 6.0);\n    v_texcoord = texcoord;\n}\n",
        "label.fragment": "void main() {\n    gl_FragColor = texture2D(t_color, v_texcoord);\n    gl_FragColor.a = 0.7 * v_alpha;\n}\n",
        "impact": "attribute vec2 position;\nvarying vec2 v_texcoord0;\nvarying vec2 v_texcoord;\nvarying vec2 v_texcoord2;\nvarying vec2 v_texcoord3;\nuniform mat4 mvp;\nuniform vec3 color;\nuniform sampler2D t_color;\nuniform float time;\nuniform mat4 mat;\n",
        "impact.vertex": "#define PI 3.14159265359\n\nvec2 rotate_vec2(vec2 v, float theta) {\n    float c = cos(theta);\n    float s = sin(theta);\n    return vec2(c*v.x - s*v.y, s*v.x + c*v.y);\n}\n\nvoid main() {\n    const float SCALE = 0.08 * 1.25;\n    vec3 P = SCALE * vec3(2.0 * (position.x - 0.5), 0.01, 2.0 * (position.y - 0.5));\n    gl_Position = mvp * mat * vec4(P, 1.0);\n    v_texcoord0 = position.xy;\n    float impact_scale = 1.0 / (time + 0.1);\n    v_texcoord = impact_scale*rotate_vec2(position.xy - 0.5, time) + 0.5;\n    v_texcoord2 = impact_scale*rotate_vec2(position.xy - 0.5, -time) + 0.5;\n    float scale = 1.5 + 0.3*sin(2.0*time);\n    v_texcoord3 = scale * impact_scale*rotate_vec2(position.xy - 0.5, -0.32323 * time) + 0.5;\n}\n",
        "impact.fragment": "void main() {\n    vec3 C = texture2D(t_color, v_texcoord).rgb;\n    vec3 C2 = texture2D(t_color, v_texcoord2).rgb;\n    vec3 C3 = 0.6*texture2D(t_color, v_texcoord3).rgb;\n    gl_FragColor.rgb = color.rgb * (C * C2) + C3;\n\n    // grid\n    {\n        float x = 0.0;\n        vec2 t = 5.0 * (v_texcoord0 - 0.5);\n        t = t - floor(t);\n        if (t.x < 0.10)\n            x += 2.0;\n        if (t.y < 0.10)\n            x += 2.0;\n        x *= 1.0 - 2.0*length(v_texcoord0 - 0.5);\n        gl_FragColor.rgb += 0.5 * x * color.rgb;\n    }\n\n    gl_FragColor.a = 1.0 - pow(2.0*abs(time - 0.5), 2.0);\n}\n",
        "cone": "attribute vec3 position;\nvarying vec2 v_coord;\nuniform mat4 mvp;\nuniform vec3 color;\nuniform mat4 mat;\nuniform float time;\n",
        "cone.vertex": "void main() {\n    v_coord = vec2(0.0, position.y);\n    float scale = 0.07 * mix(0.15, 0.4, position.y);\n    vec3 P = scale * position;\n    P.y *= 5.0;\n    gl_Position = mvp * mat * vec4(P, 1.0);\n}\n",
        "cone.fragment": "void main() {\n    gl_FragColor.rgb = color;\n    gl_FragColor.rgb += (1.0 - vec3(v_coord.y)) * 0.2;\n    gl_FragColor.a = (1.0 - v_coord.y) * 1.0;\n    gl_FragColor.a *= 1.0 - pow(2.0*abs(time - 0.5), 2.0);\n}\n\n",
        "marker": "attribute vec2 coord;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform mat3 bill;\nuniform mat4 mat;\nuniform vec3 pos;\nuniform sampler2D t_sharp;\nuniform sampler2D t_fuzzy;\nuniform vec4 color;\nuniform float scale;\nuniform float fuzz;\n",
        "marker.vertex": "void main() {\n    v_texcoord = vec2(coord.x, 1.0 - coord.y);\n    vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "marker.fragment": "void main() {\n    vec4 C = mix(texture2D(t_sharp, v_texcoord), texture2D(t_fuzzy, v_texcoord), fuzz);\n    float alpha = C.x;\n    gl_FragColor = vec4(color.xyz, alpha);\n}",
        "simple": "attribute vec3 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        "simple.vertex": "void main() {\n    gl_Position = mvp * vec4(position, 1.0);\n}\n",
        "simple.fragment": "void main() {\n    gl_FragColor = color;\n}\n\n",
        "gnomon": "attribute vec3 position;\nattribute vec3 color;\nvarying vec3 v_color;\nuniform mat4 mvp;\nuniform vec4 rotation;\nuniform vec3 location;\nuniform float scale;\n",
        "gnomon.vertex": "vec3 transform_quat(vec3 v, vec4 q) {\n    vec3 t = 2.0 * cross(q.xyz, v);\n    return v + q.w*t + cross(q.xyz, t);\n}\n\nvoid main() {\n    v_color = color;\n    vec3 P = location + scale * transform_quat(position, rotation);\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "gnomon.fragment": "void main() {\n    gl_FragColor.rgb = v_color;\n    gl_FragColor.a = 1.0;\n}\n\n",
        "scape": "attribute vec4 position;\nattribute vec2 texcoord;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform vec4 color;\nuniform vec3 fog_color;\nuniform sampler2D pattern;\n",
        "scape.vertex": "void main() {\n    vec3 P = position.xyz;\n    gl_Position = mvp * vec4(P, 1.0);\n    v_texcoord = texcoord + 0.5;\n}\n",
        "scape.fragment": "void main() {\n    gl_FragColor = color + 0.2 * texture2D(pattern, v_texcoord);\n\n#define USE_FOG\n#ifdef USE_FOG\n    {\n        // fog\n        const float LOG2 = 1.442695;\n        const float fog_density = 0.1;\n        float z = gl_FragCoord.z / gl_FragCoord.w;\n        float fog_factor = exp2(-fog_density * fog_density * z * z * LOG2);\n        gl_FragColor.rgb = mix(fog_color, gl_FragColor.rgb, fog_factor);\n        gl_FragColor.a = 1.0;\n    }\n#endif\n}\n",
        "scape_lines": "attribute vec3 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        "scape_lines.vertex": "void main() {\n    vec3 P = position.xyz;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "scape_lines.fragment": "void main() {\n    gl_FragColor = color;\n\n#define USE_FOG\n#ifdef USE_FOG\n    {\n        // fog\n        const float LOG2 = 1.442695;\n        const float fog_density = 0.1;\n        float z = gl_FragCoord.z / gl_FragCoord.w;\n        float fog_factor = exp2(-fog_density * fog_density * z * z * LOG2);\n        gl_FragColor.a *= fog_factor;\n    }\n#endif\n}\n\n",
        "rings": "attribute vec4 position;\nvarying float v_side;\nuniform mat4 mvp;\nuniform vec3 color;\n",
        "rings.vertex": "void main() {\n    vec3 P = position.xyz;\n    v_side = sign(position.w);\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "rings.fragment": "void main() {\n    float x = 1.0 - v_side*v_side;\n    gl_FragColor = vec4(color, x);\n}\n\n",
        "missile_tube": "attribute vec4 position;\nvarying float v_alpha;\nuniform mat4 mvp;\nuniform vec3 color;\nuniform float time;\n",
        "missile_tube.vertex": "void main() {\n    vec3 P = position.xyz;\n    v_alpha = abs(position.w);\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "missile_tube.fragment": "void main() {\n    gl_FragColor.rgb = color;\n    gl_FragColor.a = pow(max(0.0, sin(3.14159 * (v_alpha + (1.0 - 2.0*time)))), 3.5);\n}\n",
        "connector": "attribute vec4 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        "connector.vertex": "void main() {\n    vec3 P = position.xyz;\n    float side = position.w;\n    if (side > 0.5)\n        gl_Position = mvp * vec4(P, 1.0);\n    else\n        gl_Position = vec4(P, 1.0);\n}\n",
        "connector.fragment": "void main() {\n    gl_FragColor = color;\n}\n\n\n",
        "hedgehog": "attribute vec2 coord;\nvarying vec2 v_coord;\nuniform mat4 mvp;\nuniform mat3 bill;\nuniform vec3 position;\nuniform vec2 scale;\nuniform sampler2D t_color;\nuniform float fade;\n",
        "hedgehog.vertex": "void main() {\n    vec3 P = vec3(2.0*(coord - 0.5), 0.0);\n    P.xy *= scale;\n    P = bill * P;\n    P += position;\n    gl_Position = mvp * vec4(P, 1.0);\n    v_coord = vec2(coord.x, 1.0-coord.y);\n}\n",
        "hedgehog.fragment": "void main() {\n gl_FragColor = texture2D(t_color, v_coord);\n    if(gl_FragColor.r == 0.0 && gl_FragColor.g == 0.0 && gl_FragColor.b == 0.0)\n       gl_FragColor.a = 0.0;\n    else\n    gl_FragColor.a = fade;\n \n}\n",
        "logo": "attribute vec2 coord;\n varying vec2 v_texcoord;\n uniform mat4 mvp;\n uniform mat3 bill;\n uniform vec3 pos;\n uniform sampler2D t_sharp;\n uniform float scale;",
        "logo.vertex": "void main() {\n   v_texcoord = vec2(coord.x, 1.0 - coord.y);\n   vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n   gl_Position = mvp * vec4(P, 1.0);\n  }",
        "logo.fragment": "void main() {\n  gl_FragColor = texture2D(t_sharp, v_texcoord);\n }",
        "logo_pick": "attribute vec2 coord;\n varying vec2 v_texcoord;\n uniform mat4 mvp;\n uniform mat3 bill;\n uniform vec3 pos;\n uniform float color;\n uniform float scale;",
        "logo_pick.vertex": "void main() {\n   v_texcoord = vec2(coord.x, 1.0 - coord.y);\n   vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n   gl_Position = mvp * vec4(P, 1.0);\n  }",
        "logo_pick.fragment": "void main() {\n   gl_FragColor = vec4(color, 0.0, 0.0, 1.0);\n }"
    };

    /**
     * WebGL操作
     * @param canvas
     * @param options
     * @returns {WebGL}
     * @constructor
     */
    function WebGL(canvas, options) {
        options = options || {};

        var self = this,
            params = {
                /**
                 * 是否开启平滑模式,手机版可以设置为false,提升性能
                 */
                antialias: options.antialias || true,
                preserveDrawingBuffer: true,
                extensions: []
            },
            gl;

        /**
         * 检查DOM是否是Canvas元素
         */
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("抱歉,WebGL只支持在能Canvas元素上运行");
        }

        /**
         * 绘图canvas容器
         * @type {HTMLCanvasElement}
         */
        self.canvas = canvas;

        /**
         * 获取WebGLRenderingContext
         */
        try {
            //兼容处于实验阶段的WebGL标准
            gl = self.gl = canvas.getContext("webgl", params) || canvas.getContext("experimental-webgl", params);
        } catch (n) {

            throw new Error("抱歉,您的浏览器可能不支持WebGL");
        }

        /**
         * 未知extensions的作用
         * @TODO 待完善注释
         * @type {{}}
         */
        self.extensions = {};
        each(params.extensions, function (extension) {
            self.extensions[extension] = gl.getExtension(extension);
        });

        return self;
    }

    WebGL.prototype = {
        /**
         * 获取context
         * @returns {WebGLRenderingContext}
         */
        getGL: function () {
            return this.gl;
        },
        /**
         * 生成缓冲区
         * @param target        数据类型
         * @param bufferData    数据
         * @param bufferType    缓冲类型
         * @returns {*}
         */
        makeBuffer: function (target, bufferData, bufferType) {

            bufferType = bufferType || this.gl.STATIC_DRAW;
            var buffer = this.gl.createBuffer();
            this.gl.bindBuffer(target, buffer);
            this.gl.bufferData(target, bufferData, bufferType);

            return buffer
        },
        /**
         * 生成顶点缓冲区
         * @param bufferData
         * @param bufferType
         * @returns {*}
         */
        makeVertexBuffer: function (bufferData, bufferType) {
            return this.makeBuffer(this.gl.ARRAY_BUFFER, bufferData, bufferType)
        },
        /**
         * 生成元素缓冲区
         * @param bufferData
         * @param bufferType
         * @returns {*}
         */
        makeElementBuffer: function (bufferData, bufferType) {
            return this.makeBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bufferData, bufferType)
        },
        /**
         * 绑定顶点缓冲区
         * @param buffer
         */
        bindVertexBuffer: function (buffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            return this;
        },
        /**
         * 绑定元素缓冲区
         * @param buffer
         */
        bindElementBuffer: function (buffer) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer)
        },
        /**
         * 创建Texture2D
         * @param option
         * @returns {*}
         */
        createTexture2D: function (option) {

            var gl = this.gl,
                texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            option = option || {};
            option.width = option.width || option.size || 4;
            option.height = option.height || option.width;
            option.format = option.format || gl.RGBA;
            option.type = option.type || gl.UNSIGNED_BYTE;
            option.mag = option.mag || option.filter || gl.NEAREST;
            option.min = option.min || option.mag;
            option.wrapS = option.wrapS || option.wrap || gl.CLAMP_TO_EDGE;
            option.wrapT = option.wrapT || option.wrapS;
            option.dataFormat = option.dataFormat || option.format;
            option.data = option.data || null;
            var r = 0, n = 0;
            gl.texImage2D(gl.TEXTURE_2D, r, option.format, option.width, option.height, n, option.dataFormat, option.type, option.data);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, option.min);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, option.mag);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, option.wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, option.wrapT);

            if (option.aniso) {
                var o = this.extensions.WEBKIT_EXT_texture_filter_anisotropic;
                o && gl.texParameteri(gl.TEXTURE_2D, o.TEXTURE_MAX_ANISOTROPY_EXT, option.aniso)
            }
            return texture;
        },
        /**
         * 加载Texture
         * @param url
         * @param options
         * @returns {*}
         */
        loadTexture2D: function (url, options) {
            var gl = this.gl;
            options = extend(true, {mipmap: !1, flip: !1, callback: null, filter: gl.LINEAR}, options || {});

            var texture = this.createTexture2D(options),
                image = new Image;
            image.src = url;
            image.onload = function () {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.flip ? 1 : 0);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                if (options.mipmap) {
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.generateMipmap(gl.TEXTURE_2D);
                }
                caller(options.callback, texture, this);
            };
            return texture;
        },
        createShader: function (shaderType, shader, shaderName) {
            var gl = this.gl,
                n = gl.createShader(shaderType);
            gl.shaderSource(n, shader);
            gl.compileShader(n);

            if (gl.getShaderParameter(n, gl.COMPILE_STATUS)) {
                return n;
            }
            gl.getShaderInfoLog(n);
            console.log("Shader: " + shaderName);
            console.log("Type: " + (shaderType == gl.VERTEX_SHADER ? "vertex" : "fragment"));
            forEachLine(shader, function (e, t) {
                var r = ("  " + (t + 1)).slice(-3);
                console.log(r + ": " + e)
            });
            throw  {
                type: "COMPILE",
                shaderType: shaderType == gl.VERTEX_SHADER ? "vertex" : "fragment",
                name: shaderName,
                shader: n,
                source: gl.getShaderSource(n),
                log: gl.getShaderInfoLog(n)
            }
        },
        getProgram: function (shaderName, option) {

            var self = this,
                gl = self.gl,
                has = true;

            each([shaderName, shaderName + ".vertex", shaderName + ".fragment"], function () {
                has = has && !!SHADERS[shaderName];
                console.assert(has, shaderName + " not found.");
            });

            if (has) {
                option = option || {};
                var a = "";
                if (option.defines) {
                    each(option.defines, function (t, e) {
                        a += "#define " + t + " " + e + "\n"
                    });
                }

                var shader = a + (SHADERS[shaderName] || ""),
                    shaderItems = [],
                    shaderRaw;

                each(shader.split("\n"), function (item) {
                    if (!item.match(/attribute/)) {
                        shaderItems.push(item);
                    }
                });

                shaderRaw = shaderItems.join("\n");
                try {
                    var program = new Program(shaderName, gl),
                        vertexSource = shader + SHADERS[shaderName + ".vertex"],
                        fragmentSource = shaderRaw + SHADERS[shaderName + ".fragment"];

                    var r = "precision highp float;\n",
                        glProgram = gl.createProgram();

                    gl.attachShader(glProgram, self.createShader(gl.VERTEX_SHADER, vertexSource, shaderName));
                    gl.attachShader(glProgram, self.createShader(gl.FRAGMENT_SHADER, r + fragmentSource, shaderName));
                    gl.linkProgram(glProgram);

                    if (gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
                        program.setProgram(glProgram);
                        return program;
                    }

                    throw {
                        type: "LINK",
                        name: e.name,
                        program: glProgram,
                        log: gl.getProgramInfoLog(glProgram)
                    }
                } catch (s) {
                    throw s;
                    return null;
                }
            }
        }
    };

    /**
     * 着色器
     * @param e
     * @param gl
     * @constructor
     */
    function Program(e, gl) {
        this.gl = gl;
        this.name = e;
        this.program = null;
        this.attribs = {};
        this.uniforms = {};
        this.enabledMask = 0;
        this.maxEnabledIndex = -1;
    }

    Program.prototype = {
        setProgram: function (program) {
            var self = this,
                gl = self.gl;

            function t(e) {
                if (e.type == gl.SAMPLER_2D || e.type == gl.SAMPLER_CUBE) {
                    var t = a;
                    return a += e.size, t
                }
                return -1
            }

            self.program = program;
            var r = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

            for (var n = 0; r > n; ++n) {
                var o = gl.getActiveAttrib(program, n);
                self.attribs[o.name] = {
                    index: gl.getAttribLocation(program, o.name),
                    name: o.name,
                    size: o.size,
                    type: o.type
                }
            }
            for (var a = 0, i = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS), n = 0; i > n; ++n) {
                var u = gl.getActiveUniform(program, n);
                this.uniforms[u.name] = {
                    location: gl.getUniformLocation(program, u.name),
                    name: u.name,
                    size: u.size,
                    type: u.type,
                    texUnit: t(u)
                }
            }
        },
        disableAll: function () {
            for (var e = 0; e <= this.maxEnabledIndex; ++e) {
                var t = 1 << e;
                t & this.enabledMask && this.gl.disableVertexAttribArray(e)
            }
            this.enabledMask = 0;
            this.maxEnabledIndex = -1;
            return this;
        },
        enable: function (e) {
            var t = 1 << e;
            if (!(t & this.enabledMask)) {
                this.gl.enableVertexAttribArray(e);
                this.enabledMask |= t;
                this.maxEnabledIndex = MATH_MAX(this.maxEnabledIndex, e);
            }
            return this;
        },
        disable: function (e) {
            var t = 1 << e;
            t & this.enabledMask && (this.gl.disableVertexAttribArray(e), this.enabledMask &= ~t)
            return this;
        },
        use: function () {
            this.gl.useProgram(this.program);
            return this.disableAll();
        },
        getUniformLocation: function (e) {
            var t = this.uniforms[e];
            return t ? t.location : null
        },
        getAttribIndex: function (e) {
            var t = this.attribs[e];
            return t ? t.index : -1
        },
        uniform1i: function (e, t) {
            var r = this.getUniformLocation(e);
            r && this.gl.uniform1i(r, t)
        },
        uniform1f: function (e, t) {
            var r = this.getUniformLocation(e);
            r && this.gl.uniform1f(r, t)
        },
        uniform2f: function (e, t, r) {
            var n = this.getUniformLocation(e);
            n && this.gl.uniform2f(n, t, r)
        },
        uniform3f: function (e, t, r, n) {
            var o = this.getUniformLocation(e);
            o && this.gl.uniform3f(o, t, r, n)
        },
        uniform4f: function (e, t, r, n, o) {
            var a = this.getUniformLocation(e);
            a && this.gl.uniform4f(a, t, r, n, o)
        },
        uniform1fv: function (e, t) {
            var r = this.getUniformLocation(e);
            r && this.gl.uniform1fv(r, t)
        },
        uniform2fv: function (e, t) {
            var r = this.getUniformLocation(e);
            r && this.gl.uniform2fv(r, t)
        },
        uniform3fv: function (e, t) {
            var r = this.getUniformLocation(e);
            r && this.gl.uniform3fv(r, t)
        },
        uniform4fv: function (e, t) {
            var r = this.getUniformLocation(e);
            r && this.gl.uniform4fv(r, t)
        },
        uniformMatrix3fv: function (e, t, r) {
            var n = this.getUniformLocation(e);
            n && (r = r || !1, this.gl.uniformMatrix3fv(n, r, t))
        },
        uniformMatrix4fv: function (e, t, r) {
            var n = this.getUniformLocation(e);
            n && (r = r || false, this.gl.uniformMatrix4fv(n, r, t))
        },
        uniformSampler: function (e, t, r) {
            var n = this.uniforms[e];
            n && (this.gl.activeTexture(this.gl.TEXTURE0 + n.texUnit), this.gl.bindTexture(t, r), this.gl.uniform1i(n.location, n.texUnit))
        },
        uniformSampler2D: function (e, t) {
            this.uniformSampler(e, this.gl.TEXTURE_2D, t)
        },
        uniformSamplerCube: function (e, t) {
            this.uniformSampler(e, this.gl.TEXTURE_CUBE_MAP, t)
        },
        enableVertexAttribArray: function (e) {
            var t = this.attribs[e];
            t && this.enable(t.index)
        },
        disableVertexAttribArray: function (e) {
            var t = this.attribs[e];
            t && this.disable(t.index)
        },
        vertexAttribPointer: function (e, t, r, n, o, i) {
            var u = this.attribs[e];
            if (u) {
                this.enable(u.index);
                this.gl.vertexAttribPointer(u.index, t, r, n, o, i)
            }
        }
    };

    /**
     * WebGL摄像机
     * @constructor
     */
    function Camera() {
        this.fov = 60;
        this.near = .01;
        this.far = 200;
        this.viewport = vec4.create();
        this.proj = mat4.create();
        this.view = mat4.create();
        this.bill = mat3.create();
        this.mvp = mat4.create();
        this.mvpInv = mat4.create();
        this.viewInv = mat4.create();
        this.viewPos = vec3.create();
        this.viewDir = vec3.create();

        this.t = vec3.fromValues(0, 1, 0);
        this.r = vec3.create();
        this.n = mat4.create();

        return this;
    }

    Camera.prototype = {
        /**
         * 更新投影
         * @private
         * @returns {Camera}
         */
        _update_projection: function () {
            var e = this.viewport[2] / this.viewport[3];
            mat4.perspective(this.proj, deg2rad(this.fov), e, this.near, this.far);
            return this;
        },
        _update_mvp: function () {
            var e = this.bill,
                t = this.view;
            e[0] = t[0];
            e[1] = t[4];
            e[2] = t[8];
            e[3] = t[1];
            e[4] = t[5];
            e[5] = t[9];
            e[6] = t[2];
            e[7] = t[6];
            e[8] = t[10];
            mat4.multiply(this.mvp, this.proj, this.view);
            mat4.invert(this.mvpInv, this.mvp);
            mat4.invert(this.viewInv, this.view);
            vec3.transformMat4(this.viewPos, [0, 0, 0], this.viewInv);
            vec3.set(this.viewDir, -this.viewInv[8], -this.viewInv[9], -this.viewInv[10])

        },
        update: function (e, n) {
            this._update_projection();
            vec3.add(this.r, e, n);
            mat4.lookAt(this.view, e, this.r, this.t);
            this._update_mvp();
        },
        update_quat: function (e, t, r) {
            this._update_projection();
            mat4.fromRotationTranslation(this.n, t, e);
            mat4.invert(this.n, this.n);
            if (r) {
                var o = this.n,
                    a = this.view,
                    i = r,
                    u = 1 - r,
                    c = 0;
                for (; 16 > c; ++c) {
                    a[c] = i * a[c] + u * o[c];
                }
            } else {
                mat4.copy(this.view, this.n);
            }
            this._update_mvp()
        },
        unproject: function (e, t) {
            var r = vec4.create();
            r[0] = 2 * (t[0] / this.viewport[2]) - 1;
            r[1] = 2 * (t[1] / this.viewport[3]) - 1;
            r[1] = 1 - r[1];
            r[2] = 0;
            r[3] = 1;
            vec4.transformMat4(r, r, this.mvpInv);
            e[0] = r[0] / r[3];
            e[1] = r[1] / r[3];

        }
    };

    /**
     * 指标样式
     * @param name
     * @param color
     * @param n_sides
     * @constructor
     */
    function Metric(name, color, n_sides) {

        this.name = name;

        this.color = color2vec3(color);

        this.n_sides = n_sides;
        this.enabled = !0;
        this.count = 0;
        this.target_count = new Int32Array(256);
        this.target_rank = new Int32Array(256);
        this.graph = new Int32Array(60);
    }

    /**
     * 地球控制器
     * @constructor
     */
    function Earth(canvas, options) {

        var self = this;
        options = options || {};

        /**
         * WebGL操作对象
         * @type {WebGL}
         */
        self.webgl = new WebGL(canvas, {
            //抗锯齿,默认手机端禁用
            antialias: options.antialias || (Agent.isMobile() ? false : true),
            //自定义的着色器
            shaderSources: options.shaderSources
        });

        self.width = canvas.clientWidth;
        self.height = canvas.clientHeight;
        /**
         * 显示模式
         * globe 3D地球模式
         * flat  屏幕地图模式
         * @type {string}
         */
        self.viewModel = options.viewModel || "globe";

        /**
         * 颜色模式
         * dark 黑色系
         * light 白色系
         * @type {string}
         */
        self.colorModel = options.colorModel || "dark";

        /**
         * 默认地球缩放倍数
         * @type {number}
         */
        self.zoomLevel = options.zoomLevel || .1;

        /**
         * 创建一个摄像机
         * @type {Camera}
         */
        self.camera = new Camera();

        /**
         * 投影
         * @TODO 具体待解释
         * @type {{dir: number, blend: number}}
         */
        self.projection = {
            dir: 1,
            blend: 1
        };

        /**
         * 地球角度,转向
         * @type {{coord: *, coord_target: *, coord_delta: *, lerp_speed: number}}
         */
        self.geocam = {
            coord: vec3.fromValues(-103.56560471141962, 36.02326294675923, 5),
            coord_target: vec3.fromValues(103.56560471141962, 36.02326294675923, 1.5),
            coord_delta: vec3.create(),
            lerp_speed: .02
        };

        self.light = {
            position: vec3.fromValues(20, 20, -20),
            position2: vec3.fromValues(20, -25, -20)
        };

        self.hover_country = null;
        /**
         * 地球默认大小
         * @type {number}
         */
        self.earthDefaultSize = 1.6;

        /**
         * 作用未知
         */
        self.K = vec3.create();
        self.Q = vec3.create();
        self.Z = vec3.create();
        self.J = vec3.create();

        /**
         * 世界
         * @type {World}
         */
        self.world = new World(self, self.webgl);

        self.stars = new Stars(self);
        self.corona = new Corona(self);
        self.labels = new Labels(self);
        self.missile = new MissileSystem(self);
        self.logo = new Logo(self);
        self.hedgehogs = new Hedgehogs(self);
        //已注册的指标列表
        self.metrics = {};
        self.registerMetric({
            1: {
                color: "38b349"
            },
            2: {
                color: "ed1c24",
                siders: 4
            },
            3: {
                color: "f26522",
                siders: 3
            },
            4: {
                color: "0087f4",
                siders: 32
            },
            5: {
                color: "ec008c",
                siders: 6
            },
            6: {
                color: "fbf267",
                siders: 8
            },
            7: {
                color: "855ff4",
                siders: -16
            },
            8: {
                color: "fbf267",
                siders: 8
            }
        });
        /**
         * 绑定事件
         */
        self.bindEvents();

        //绑定更新尺寸事件
        window.addEventListener("resize", proxy(self.resize, self));
        self.resize();
    }

    Earth.prototype = {
        /**
         * 设置显示模式
         * @param model
         * @returns {Earth}
         */
        setViewModel: function (model) {
            this.viewModel = model == "globe" ? "globe" : "flat";
            this.projection.dir = this.viewModel == "globe" ? 1 : -1;
            this.labels.project_labels(this.projection.dir == 1 ? "ecef" : "mercator");
            return this;
        },
        /**
         * 切换显示模式
         * @returns {*|Earth}
         */
        toggleViewModel: function () {
            return this.setViewModel(this.viewModel == "globe" ? "flat" : "globe");
        },
        /**
         * 地球放大
         * @param level
         * @returns {Earth}
         */
        zoomIn: function (level) {
            this.geocam.coord_delta[2] -= level || this.zoomLevel;
            return this;
        },
        /**
         * 地球缩小
         * @param level
         * @returns {Earth}
         */
        zoomOut: function (level) {
            this.geocam.coord_delta[2] += level || this.zoomLevel;
            return this;
        },
        /**
         * 开始渲染
         * @returns {Earth}
         */
        render: function () {
            var self = this,
                gl = self.getGL(),
                canvas = self.webgl.canvas;
            self.update_projection();

            if (self.can_hover) {

                //var hoverCountry = self.world.pick(self.oldMousePos[0], self.oldMousePos[1]);
                //if (hoverCountry !== self.hover_country) {
                //    canvas.style.cursor = hoverCountry ? "pointer" : "default";
                //    self.hover_country = hoverCountry;
                //}

                var hoverLogo = self.logo.pick(self.oldMousePos[0], self.oldMousePos[1]);
                if (hoverLogo !== self.hover_logo) {
                    canvas.style.cursor = hoverLogo ? "pointer" : "default";
                    self.hover_logo = hoverLogo;
                }
                self.can_hover = false
            }

            gl.clearColor(0.011764705882352941, 0.050980392156862744, 0.07450980392156863, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            self.stars.render();
            if (self.projection.blend >= .5) {
                self.corona.render();
            }
            if (window.drawWorld !== false) {
                self.world.render();
            }

            self.labels.render();
            self.logo.render();
            self.missile.render();
            self.hedgehogs.render();

            /**
             * 不停的渲染
             * @type {Number}
             */
            cancelAnimationFrame(this.animationFrame);

            this.animationFrame = requestAnimationFrame(proxy(this.render, this));
            return this;
        },
        /**
         * 暂停
         * @returns {Earth}
         */
        pause: function () {
            this.animationFrame && cancelAnimationFrame(this.animationFrame);
            return this;
        },
        /**
         * 获取webgl对象
         * @returns {*|WebGLRenderingContext}
         */
        getGL: function () {
            return this.webgl.getGL();
        },
        /**
         * 刷新尺寸
         */
        resize: function () {
            var self = this,
                canvas = self.webgl.canvas,
                gl = self.getGL();

            canvas.width = canvas.clientWidth;
            canvas.height = parseInt(window.innerHeight);

            var e = canvas.width / canvas.height;

            1 > e ? self.camera.fov = 60 / e : self.camera.fov = 60;

            gl.viewport(0, 0, canvas.width, canvas.height);

            vec4.copy(self.camera.viewport, gl.getParameter(gl.VIEWPORT))
        },
        /**
         * 更新投影
         */
        update_projection: function () {
            var self = this,
                dir = self.projection.dir > 0,
                coord = self.geocam.coord,
                coord_target = self.geocam.coord_target,
                coord_delta = self.geocam.coord_delta;

            vec3.add(coord_target, coord_target, coord_delta);
            coord_target[1] = clamp(coord_target[1], -80, 80);

            var projectionType;

            projectionType = dir ? [.35, 4.5] : [0.15, 1];
            coord_target[2] = clamp(coord_target[2], projectionType[0], projectionType[1]);

            if (dir) {
                if (coord[0] < -180) {
                    coord[0] += 360;
                    coord_target[0] += 360;
                } else if (coord[0] > 180) {
                    coord[0] -= 360;
                    coord_target[0] -= 360
                }
            } else {
                coord_target[0] = clamp(coord_target[0], -180, 180)
            }
            vec3.lerp(coord, coord, coord_target, self.geocam.lerp_speed);
            vec3.scale(coord_delta, coord_delta, .9);

            project_mercator(self.K, [coord[0], coord[1], 0]);
            project_mercator(self.Q, coord);
            self.Q[1] -= 2;
            vec3.sub(self.Z, self.K, self.Q);
            vec3.normalize(self.Z, self.Z);
            vec3.copy(self.K, self.Q);
            var u = [0, 0, 0];
            project_ecef(u, [coord[0], coord[1], 0]);
            project_ecef(self.Q, coord);
            var c = clamp(2 * (self.earthDefaultSize - coord[2]), 0, 1);

            c = lerp(0, 2, c);
            self.Q[1] -= c;
            vec3.sub(self.J, u, self.Q);
            vec3.normalize(self.J, self.J);
            var l = smoothstep(self.projection.blend);
            vec3.lerp(self.K, self.K, self.Q, l);
            vec3.lerp(self.Z, self.Z, self.J, l);

            self.camera.update(self.K, self.Z);

            self.projection.blend = clamp(self.projection.blend + self.projection.dir / 120, 0, 1)

        },
        /**
         * 绑定鼠标事件
         */
        bindEvents: function () {
            this.oldMousePos = [0, 0];
            var self = this,

                canvas = self.webgl.canvas,
                CanvasBindEvents = {
                    mousedown: function (e) {
                        //鼠标按下时,调整地球的缓冲速度,优化体验
                        self.geocam.lerp_speed = .2;
                        self.oldMousePos = getMouseEventOffset(e);
                        MOUSE_STATE = e.button;
                        e.preventDefault();
                        return false;
                    },
                    mouseup: function () {

                        MOUSE_STATE = -1;
                        return false;
                    },
                    mousemove: function (e) {
                        var //取当前鼠标坐标
                            mousePos = getMouseEventOffset(e),
                        //横向移动距离
                            xdiff = mousePos[0] - self.oldMousePos[0],
                        //纵向移动距离
                            ydiff = mousePos[1] - self.oldMousePos[1];

                        self.oldMousePos = mousePos;

                        var coord_delta = self.geocam.coord_delta;
                        switch (MOUSE_STATE) {
                            case 0:
                                coord_delta[0] -= .03 * xdiff;
                                coord_delta[1] += .03 * ydiff;
                                break;
                            case 2:
                                var o = MATH.abs(xdiff) > MATH.abs(ydiff) ? xdiff : -ydiff;
                                coord_delta[2] = -.01 * o;
                                break;
                            default:
                                self.can_hover = true
                        }

                        return false;
                    },
                    mousewheel: function (e) {
                        //hidePopAndStaticAble();
                        e.preventDefault();
                        var r = e.wheelDelta / 100;

                        self.geocam.coord_delta[2] -= .01 * r;

                        return false
                    },
                    DOMMouseScroll: function (e) {
                        e.wheelDelta = -120 * e.detail;
                        return CanvasBindEvents.mousewheel(e);
                    }
                };
            each(CanvasBindEvents, function (callback, eventName) {
                canvas.addEventListener(eventName, callback, false)
            });
        },
        registerMetric: function (metrics) {
            var self = this;
            each(metrics, function (opt, name) {
                self.metrics[name] = new Metric(name, opt.color || "ffffff", opt.siders || 5);
            });
            self.missile.registerShape();
            return self;
        }
    };

    /**
     * GTW World
     * 绘制世界
     */
    function World(earth, webgl) {
        var self = this,
            gl = self.gl = earth.getGL();

        self.webgl = webgl;
        self.earth = earth;

        /**
         * 地球背景图比例
         * @type {number[]}
         */
        this.pattern_scale = [1440, 720];

        /**
         * 国家突出高度
         * @type {number}
         */
        this.prominent = .014;

        /**
         * 当前国家突出的高度
         * @type {number}
         */
        this.current_country_prominent = 0;

        /**
         * 已有缓冲区
         * @type {{map: {vert: null, face: null, line: null}, grid: {vert: null, elem: null}, labels: {vert: null, label: *}}}
         */
        this.buffers = {
            map: {
                vert: null,
                face: null,
                line: null
            },
            grid: {
                vert: null,
                elem: null
            },
            labels: {
                vert: null,
                label: webgl.getProgram("label")
            }
        };
        this.border = {
            buffer: gl.createBuffer(),
            count: 0
        };
        this.build_grid();
        this.programs = {
            main: webgl.getProgram("map_main"),
            grid: webgl.getProgram("map_grid"),
            line: webgl.getProgram("map_line"),
            pick: webgl.getProgram("map_pick")
        };
        this.textures = {
            blur: webgl.loadTexture2D(resource("textures/map_blur.jpg")),
            pattern: webgl.loadTexture2D(resource("textures/pattern.png"), {
                mipmap: !0,
                wrap: gl.REPEAT,
                aniso: 4
            }),
            labels: webgl.createTexture2D({
                size: 2048,
                mipmap: !0,
                min: gl.LINEAR_MIPMAP_LINEAR,
                aniso: 4,
                format: gl.LUMINANCE
            })
        };

        gl.generateMipmap(gl.TEXTURE_2D);

        /**
         * 国家列表
         * Key to country
         * @type {{}}
         */
        this.countries = {};
        /**
         * 国家列表
         * index to country
         * @type {{}}
         */
        this.countries_by_index = {};

        /**
         *  突出显示的国家
         * @type {null}
         */
        this.extruded_country = null;

        /**
         * 已渲染hover效果的国家key
         * @type {null}
         */
        this.bordered_country = null;

        loadResources({
            map: "data/countries.json",
            geoip: "data/geoip.json"
        }, function (ret) {
            var geoip = ret.geoip;
            self.countries = ret.map.countries;
            self.geoip = null;

            if (geoip && self.countries[geoip.country]) {
                self.geoip = {
                    country: geoip.country,
                    coord: vec3.fromValues(geoip.coord[1], geoip.coord[0], self.prominent)
                };
                self.extruded_country = geoip.country;
            }
            each(self.countries, function (country, key, __, i) {
                var isGeoIpCountry = self.geoip && self.geoip.country == key;
                country.index = i;
                country.tone = MATH_RANDOM();
                country.borders = Base64.decode(country.borders, Uint16Array);
                country.center = vec3.fromValues(country.center[0], country.center[1], country == isGeoIpCountry ? self.prominent : 0)

                self.countries_by_index[i] = country;
                self.countries_by_index[i].key = key;
            });

            self.map = ret.map;
            self.build_geometry(ret.map.geom);
        })
    }

    World.prototype = {
        /**
         * 画地球背景
         */
        build_grid: function () {
            var self = this,
                webgl = self.webgl;

            function t(e, t) {
                return 181 * e + t
            }

            var n = [],
                o = [],
                a = vec3.create();
            a[2] = -self.prominent;
            var i = vec3.create(),
                u = vec3.create(),
                c = vec2.create();
            for (var l = -180; 180 >= l; l += 1) {
                for (var s = -90; 90 >= s; s += 1) {
                    vec2.set(a, l, s);
                    vec2.set(c, (l + 180) / 360, 1 - (s + 90) / 180);
                    project_mercator(i, a);
                    vec3.set(u, 0, 0, -1);
                    arrayPush(n, i, u);
                    project_ecef(i, a);
                    vec3.normalize(u, i);
                    arrayPush(n, i, u);
                    arrayPush(n, c);
                }
            }
            for (var f = 0; 360 > f; ++f) {
                for (var v = 0; 180 > v; ++v) {
                    o.push(t(f, v), t(f + 1, v), t(f + 1, v + 1), t(f + 1, v + 1), t(f, v + 1), t(f, v));
                }
            }
            this.buffers.grid.vert = webgl.makeVertexBuffer(new Float32Array(n));
            this.buffers.grid.elem = webgl.makeElementBuffer(new Uint16Array(o));
            this.grid_elem_count = o.length;
            this.grid_vert_stride_bytes = 56
        },
        getCurrentCountry: function () {
            return this.geoip ? this.countries[this.geoip.country] : null;
        },
        build_geometry: function (geom) {
            var self = this,
                webgl = self.webgl,
                currentCountry = self.getCurrentCountry(),
                verts = [],
                a = vec3.create(),
                i = vec3.create(),
                u = vec2.create();

            function addVert(e, t) {
                a[0] = 180 * geom.verts[2 * e + 0] / 32768;
                a[1] = 90 * geom.verts[2 * e + 1] / 32768;
                a[2] = t;
                u[0] = .5 + a[0] / 360;
                u[1] = .5 - a[1] / 180;
                var r = verts.length / 14;
                project_mercator(i, a);
                verts.push(i[0], i[1], i[2]);
                verts.push(0, 0, 0);
                project_ecef(i, a);
                verts.push(i[0], i[1], i[2]);
                verts.push(0, 0, 0);
                verts.push(u[0], u[1]);
                return r
            }

            geom.faces = Base64.decode(geom.faces, Uint16Array);
            geom.lines = Base64.decode(geom.lines, Uint16Array);
            geom.coast = Base64.decode(geom.coast, Uint16Array);
            geom.verts = Base64.decode(geom.verts, Int16Array);

            var vertsLength = geom.verts.length;

            for (var index = 0; vertsLength > index; ++index) {
                addVert(index, 0);
            }
            var faces = Array.apply([], geom.faces);

            faces.length = geom.faces.length;
            faces.constructor = Array;
            this.coast_start = faces.length;

            for (var index = 0; index < geom.coast.length; index += 2) {
                var coast0 = geom.coast[index + 0],
                    coast1 = geom.coast[index + 1],
                    p = addVert(coast0, -self.prominent),
                    g = addVert(coast1, -self.prominent),
                    f = addVert(coast0, 0),
                    v = addVert(coast1, 0);

                faces.push(coast0, coast1, p);
                faces.push(coast1, g, p)
            }
            if (currentCountry) {
                var h = currentCountry.borders,
                    m = 65535;
                for (var l = 0; l < h.length; ++l) {
                    var d = h[l];
                    if (65535 != d) {
                        if (65535 != m) {
                            var p = addVert(m, 0),
                                g = addVert(d, 0),
                                f = addVert(m, 1.02 * self.prominent),
                                v = addVert(d, 1.02 * self.prominent);

                            faces.push(f, v, p);
                            faces.push(v, g, p)
                        }
                        m = d
                    } else {
                        m = 65535
                    }
                }
            }
            this.coast_count = faces.length - this.coast_start;
            var _ = vec3.create(),
                b = vec3.create(),
                y = 14;
            for (var l = 0; l < faces.length; l += 3) {
                var f = faces[l + 0],
                    v = faces[l + 1],
                    T = faces[l + 2];
                for (var w = 0; 2 > w; ++w) {
                    var E = 6 * w;
                    for (var x = 0; 3 > x; ++x) {
                        _[x] = verts[y * v + E + x] - verts[y * f + E + x];
                        b[x] = verts[y * T + E + x] - verts[y * f + E + x];
                    }
                    vec3.cross(i, _, b);
                    vec3.normalize(i, i);
                    for (var x = 0; 3 > x; ++x) {
                        verts[y * f + E + 3 + x] += i[x];
                        verts[y * v + E + 3 + x] += i[x];
                        verts[y * T + E + 3 + x] += i[x]
                    }
                }
            }
            vec3.forEach(verts, y, 3, 0, function (e) {
                vec3.normalize(e, e)
            });
            vec3.forEach(verts, y, 9, 0, function (e) {
                vec3.normalize(e, e)
            });

            this.buffers.map.vert = webgl.makeVertexBuffer(new Float32Array(verts));
            this.buffers.map.face = webgl.makeElementBuffer(new Uint16Array(faces));
            this.buffers.map.line = webgl.makeElementBuffer(new Uint16Array(geom.lines));
            this.face_count = geom.faces.length;
            this.line_count = geom.lines.length;
            this.map_vert_stride_bytes = 56;
        },
        render: function () {
            var self = this,
                params = self.earth,
                gl = self.gl,
                webgl = self.webgl;

            if (self.buffers.map.vert) {
                var drawGrid = true,
                    drawCountry = true,
                    drawCountryLine = true,
                    drawProminent = true,
                    drawHoverBorder = true,
                    c = smoothstep(params.projection.blend),
                    l = .25 > c;

                gl.disable(gl.BLEND);
                gl.enable(gl.CULL_FACE);
                gl.cullFace(gl.BACK);
                gl.enable(gl.DEPTH_TEST);
                /**
                 * 画地球的球体背景
                 */
                if (drawGrid) {
                    var f = this.programs.grid.use();
                    f.uniformMatrix4fv("mvp", params.camera.mvp);
                    f.uniformSampler2D("t_blur", this.textures.blur);
                    f.uniformSampler2D("t_pattern", this.textures.pattern);
                    f.uniform2fv("pattern_scale", self.pattern_scale);
                    f.uniform1f("blend", c);
                    if ("dark" === params.colorModel) {
                        f.uniform3f("color0", 0.058823529411764705, 0.44313725490196076, 0.596078431372549);
                        f.uniform3f("color1", 0.06274509803921569, 0.3176470588235294, 0.5019607843137255);

                    } else {
                        f.uniform3f("color0", .93, .95, .93);
                        f.uniform3f("color1", .42, .48, .42)
                    }

                    var v = this.grid_vert_stride_bytes;
                    webgl.bindVertexBuffer(this.buffers.grid.vert);
                    f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                    f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                    f.vertexAttribPointer("texcoord", 2, gl.FLOAT, !1, v, 48);
                    f.uniform4f("color", 1, 1, 1, 1);
                    webgl.bindElementBuffer(this.buffers.grid.elem);
                    f.uniform1f("offset_x", 0);
                    gl.drawElements(gl.TRIANGLES, this.grid_elem_count, gl.UNSIGNED_SHORT, 0);

                    if (l) {
                        f.uniform1f("offset_x", -20);
                        gl.drawElements(gl.TRIANGLES, this.grid_elem_count, gl.UNSIGNED_SHORT, 0);
                        f.uniform1f("offset_x", 20);
                        gl.drawElements(gl.TRIANGLES, this.grid_elem_count, gl.UNSIGNED_SHORT, 0);
                    }
                }
                /**
                 * 画国家
                 */
                if (drawCountry) {
                    var f = this.programs.main.use();
                    f.uniformMatrix4fv("mvp", params.camera.mvp);
                    f.uniformSampler2D("t_blur", this.textures.blur);
                    f.uniform1f("blend", c);
                    f.uniform3fv("view_pos", params.camera.viewPos);
                    f.uniform3fv("light_pos", params.light.position);
                    var v = this.map_vert_stride_bytes;
                    webgl.bindVertexBuffer(this.buffers.map.vert);
                    f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                    f.vertexAttribPointer("normal", 3, gl.FLOAT, !1, v, 12);
                    f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                    f.vertexAttribPointer("normal2", 3, gl.FLOAT, !1, v, 36);
                    f.vertexAttribPointer("texcoord", 2, gl.FLOAT, !1, v, 48);
                    f.uniform1f("alpha", 1);
                    if ("dark" === params.colorModel) {
                        f.uniform3f("color0", 0.058823529411764705, 0.5215686274509804, 0.596078431372549);
                        f.uniform3f("color1", 0.06274509803921569, 0.39215686274509803, 0.5882352941176471);
                    } else {
                        f.uniform3f("color0", .41, .61, .48);
                        f.uniform3f("color1", .51, .69, .53);
                    }
                    gl.disable(gl.BLEND);
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.BACK);
                    gl.enable(gl.DEPTH_TEST);
                    webgl.bindElementBuffer(this.buffers.map.face);
                    each(this.countries, function (e, t) {
                        f.uniform1f("height", t == self.extruded_country ? self.current_country_prominent : 0);
                        f.uniform1f("tone", e.tone);
                        f.uniform1f("offset_x", 0);
                        gl.drawElements(gl.TRIANGLES, e.face_count, gl.UNSIGNED_SHORT, e.face_offset << 1);
                        if (l) {
                            f.uniform1f("offset_x", -20);
                            gl.drawElements(gl.TRIANGLES, e.face_count, gl.UNSIGNED_SHORT, e.face_offset << 1);
                            f.uniform1f("offset_x", 20);
                            gl.drawElements(gl.TRIANGLES, e.face_count, gl.UNSIGNED_SHORT, e.face_offset << 1);
                        }
                    });
                    gl.depthFunc(gl.LESS);
                    /**
                     * 画国家的突出效果
                     */
                    if (drawProminent) {
                        gl.disable(gl.CULL_FACE);
                        f.uniform1f("tone", .5);
                        f.uniform1f("offset_x", 0);
                        gl.drawElements(gl.TRIANGLES, this.coast_count, gl.UNSIGNED_SHORT, this.coast_start << 1);
                        if (l) {
                            f.uniform1f("offset_x", -20);
                            gl.drawElements(gl.TRIANGLES, this.coast_count, gl.UNSIGNED_SHORT, this.coast_start << 1);
                            f.uniform1f("offset_x", 20);
                            gl.drawElements(gl.TRIANGLES, this.coast_count, gl.UNSIGNED_SHORT, this.coast_start << 1);
                        }
                    }

                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                    gl.disable(gl.DEPTH_TEST);
                    gl.enable(gl.CULL_FACE);
                    //永久高亮中国
                    (function () {
                        var hoverCountry = self.countries["CN"];
                        f.uniform1f("tone", 1);
                        f.uniform1f("alpha", .5);
                        f.uniform1f("offset_x", 0);
                        f.uniform1f("height", 0);
                        gl.drawElements(gl.TRIANGLES, hoverCountry.face_count, gl.UNSIGNED_SHORT, hoverCountry.face_offset << 1)

                    })();
                    //永久高亮台湾
                    (function () {
                        var hoverCountry = self.countries["TW"];
                        f.uniform1f("tone", 1);
                        f.uniform1f("alpha", .5);
                        f.uniform1f("offset_x", 0);
                        f.uniform1f("height", 0);
                        gl.drawElements(gl.TRIANGLES, hoverCountry.face_count, gl.UNSIGNED_SHORT, hoverCountry.face_offset << 1)

                    })();
                    if (params.hover_country && params.hover_country != "CN" && params.hover_country != "TW") {
                        var hoverCountry = this.countries[params.hover_country];
                        f.uniform1f("tone", 1);
                        f.uniform1f("alpha", .5);
                        f.uniform1f("offset_x", 0);
                        f.uniform1f("height", params.hover_country == self.extruded_country ? self.current_country_prominent : 0);
                        gl.drawElements(gl.TRIANGLES, hoverCountry.face_count, gl.UNSIGNED_SHORT, hoverCountry.face_offset << 1)
                    }
                    gl.disable(gl.CULL_FACE)
                }
                /**
                 * 画国家边界线
                 */
                if (drawCountryLine) {
                    gl.enable(gl.DEPTH_TEST);
                    gl.depthMask(false);
                    var f = this.programs.line.use();
                    f.uniformMatrix4fv("mvp", params.camera.mvp);
                    f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                    f.vertexAttribPointer("normal", 3, gl.FLOAT, !1, v, 12);
                    f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                    f.vertexAttribPointer("normal2", 3, gl.FLOAT, !1, v, 36);
                    f.uniform1f("blend", c);
                    f.uniform4f("color", 0.12549019607843137, 0.5254901960784314, 0.8784313725490196, 1);
                    f.uniform1f("height", 0);
                    webgl.bindElementBuffer(this.buffers.map.line);
                    gl.drawElements(gl.LINES, this.line_count, gl.UNSIGNED_SHORT, 0);
                    gl.depthMask(true)
                }

                /**
                 * 画国家的hover边界线效果
                 */
                if (drawHoverBorder) {
                    self.set_border("TW");

                    //if (params.hover_country !== this.bordered_country) {
                    //    this.set_border(params.hover_country);
                    //
                    //}
                    if (this.border.count) {
                        var f = this.programs.line.use();
                        f.uniformMatrix4fv("mvp", params.camera.mvp);
                        f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                        f.vertexAttribPointer("normal", 3, gl.FLOAT, !1, v, 12);
                        f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                        f.vertexAttribPointer("normal2", 3, gl.FLOAT, !1, v, 36);
                        f.uniform1f("blend", c);
                        f.uniform1f("height", this.bordered_country == this.extruded_country ? self.current_country_prominent : 0);
                        f.uniform4f("color", 1, 1, 1, .5);
                        webgl.bindElementBuffer(this.border.buffer);
                        gl.lineWidth(2);
                        gl.drawElements(gl.LINES, this.border.count, gl.UNSIGNED_SHORT, 0);
                        gl.lineWidth(1)
                    }

                    self.set_border("CN");

                    //if (params.hover_country !== this.bordered_country) {
                    //    this.set_border(params.hover_country);
                    //
                    //}
                    if (this.border.count) {
                        var f = this.programs.line.use();
                        f.uniformMatrix4fv("mvp", params.camera.mvp);
                        f.vertexAttribPointer("position", 3, gl.FLOAT, !1, v, 0);
                        f.vertexAttribPointer("normal", 3, gl.FLOAT, !1, v, 12);
                        f.vertexAttribPointer("position2", 3, gl.FLOAT, !1, v, 24);
                        f.vertexAttribPointer("normal2", 3, gl.FLOAT, !1, v, 36);
                        f.uniform1f("blend", c);
                        f.uniform1f("height", this.bordered_country == this.extruded_country ? self.current_country_prominent : 0);
                        f.uniform4f("color", 1, 1, 1, .5);
                        webgl.bindElementBuffer(this.border.buffer);
                        gl.lineWidth(2);
                        gl.drawElements(gl.LINES, this.border.count, gl.UNSIGNED_SHORT, 0);
                        gl.lineWidth(1)
                    }
                }

                gl.disable(gl.DEPTH_TEST);
                gl.disable(gl.CULL_FACE)
            }
        },
        /**
         * 检查鼠标在哪个国家上
         */
        pick: function (mouseX, mouseY) {
            var self = this,
                webgl = self.webgl,
                gl = self.gl,
                r = 4,
                params = self.earth,
                n = new Uint8Array(r * r << 2),
                viewport = params.camera.viewport,
                mvp = mat4.create();

            function getFrameBuffer() {
                if (!self.framebuffer) {
                    self.framebuffer = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, self.framebuffer);
                    var e = webgl.createTexture2D({
                        size: r
                    });
                    gl.bindTexture(gl.TEXTURE_2D, e);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, e, 0);
                    var n = gl.createRenderbuffer();
                    gl.bindRenderbuffer(gl.RENDERBUFFER, n);
                    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, r, r);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, n);
                    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }
                return self.framebuffer;
            }

            mat4.identity(mvp);
            mat4.translate(mvp, mvp, [
                (viewport[2] - 2 * (mouseX - viewport[0])) / r,
                -(viewport[3] - 2 * (mouseY - viewport[1])) / r,
                0
            ]);

            mat4.scale(mvp, mvp, [viewport[2] / r, viewport[3] / r, 1]);
            mat4.multiply(mvp, mvp, params.camera.mvp);

            gl.viewport(0, 0, r, r);
            gl.bindFramebuffer(gl.FRAMEBUFFER, getFrameBuffer());
            gl.clearColor(0, 0, 1, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.BLEND);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.enable(gl.DEPTH_TEST);
            var v = this.programs.pick.use();
            v.uniformMatrix4fv("mvp", mvp);
            webgl.bindVertexBuffer(this.buffers.map.vert);
            var p = this.map_vert_stride_bytes,
                g = params.projection.blend < .5 ? 0 : 24;
            v.vertexAttribPointer("position", 3, gl.FLOAT, !1, p, g);

            webgl.bindElementBuffer(this.buffers.map.face);

            each(this.countries, function (e) {
                v.uniform1f("color", e.index / 255);
                gl.drawElements(gl.TRIANGLES, e.face_count, gl.UNSIGNED_SHORT, e.face_offset << 1);

            });
            gl.disable(gl.CULL_FACE);
            gl.disable(gl.DEPTH_TEST);
            gl.readPixels(0, 0, r, r, gl.RGBA, gl.UNSIGNED_BYTE, n);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
            var h = null,
                m = 0,
                d = {};

            for (var b = 0; b < n.length; b += 4) {
                if (n[b + 3]) {
                    var y = n[b + 1] << 8 | n[b + 0],
                        T = d[y] || 0;
                    d[y] = ++T;
                    T > m && (h = y, m = T)
                }
            }
            return h ? this.countries_by_index[h].key : null;
        },
        /**
         * hover时高亮国家的边线
         * @param countryCode
         */
        set_border: function (countryCode) {
            var self = this,
                gl = self.gl;
            if (!countryCode) {
                this.border.count = 0;
                this.bordered_country = null;
                return;
            }
            var country = self.countries[countryCode],
                r = [],
                borders = country.borders,
                o = -1;
            for (var a = 0; a < borders.length; ++a) {
                var i = borders[a];
                if (65535 != i) {
                    if (o >= 0) {
                        r.push(o, i);
                    }
                    o = i
                } else {
                    o = -1;
                }

            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.border.buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(r), gl.STATIC_DRAW);
            this.border.count = r.length;
            this.bordered_country = countryCode
        }
    };

    function Logo(earth) {
        var self = this,
            webgl;

        self.earth = earth;
        webgl = self.webgl = earth.webgl;
        self.gl = webgl.gl;
        self.buffer = webgl.makeVertexBuffer(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]));
        self.texture = webgl.loadTexture2D(resource("textures/logo.png"), {
            mipmap: false
        });
        self.program = webgl.getProgram("logo");
        self.pickProgram = webgl.getProgram("logo_pick");
        self.logos = {};
    }

    Logo.prototype = {
        addLogo: function (logo) {
            this.logos[logo.id] = logo;
            return this;
        },
        render: function () {
            var self = this,
                params = self.earth,
                gl = self.gl;

            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

            self.webgl.bindVertexBuffer(self.buffer);
            var program = self.program.use();
            program.uniformMatrix3fv("bill", params.camera.bill);
            program.uniformMatrix4fv("mvp", params.camera.mvp);
            program.uniformSampler2D("t_sharp", self.texture);
            program.uniform1f("scale", .05);
            program.vertexAttribPointer("coord", 3, gl.FLOAT, false, 0, 0);

            each(self.logos, function (logo) {
                var pos = vec3.create();

                project(params.projection.blend, pos, logo.coord);

                program.uniform3fv("pos", pos);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            });

        },
        pick: function (mouseX, mouseY) {
            var self = this,
                webgl = self.webgl,
                gl = self.gl,
                range = 2,
                params = self.earth,
                data = new Uint8Array(range * range << 2),
                viewport = params.camera.viewport,
                mvp = mat4.create();

            function getFrameBuffer() {
                if (!self.framebuffer) {
                    self.framebuffer = gl.createFramebuffer();
                    gl.bindFramebuffer(gl.FRAMEBUFFER, self.framebuffer);
                    var e = webgl.createTexture2D({
                        size: range
                    });
                    gl.bindTexture(gl.TEXTURE_2D, e);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, e, 0);
                    var n = gl.createRenderbuffer();
                    gl.bindRenderbuffer(gl.RENDERBUFFER, n);
                    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, range, range);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, n);
                    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }
                return self.framebuffer;
            }

            mat4.identity(mvp);
            mat4.translate(mvp, mvp, [
                (viewport[2] - 2 * (mouseX - viewport[0])) / range,
                -(viewport[3] - 2 * (mouseY - viewport[1])) / range,
                0
            ]);

            mat4.scale(mvp, mvp, [viewport[2] / range, viewport[3] / range, 1]);
            mat4.multiply(mvp, mvp, params.camera.mvp);

            gl.viewport(0, 0, range, range);
            gl.bindFramebuffer(gl.FRAMEBUFFER, getFrameBuffer());
            gl.clearColor(0, 0, 1, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.disable(gl.BLEND);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.enable(gl.DEPTH_TEST);

            webgl.bindVertexBuffer(self.buffer);

            var program = this.pickProgram.use();

            program.uniformMatrix4fv("mvp", mvp);
            program.uniformMatrix3fv("bill", params.camera.bill);
            program.uniform1f("scale", .05);
            program.vertexAttribPointer("coord", 3, gl.FLOAT, false, 0, 0);


            each(this.logos, function (logo) {
                var pos = vec3.create();
                project(params.projection.blend, pos, logo.coord);
                program.uniform3fv("pos", pos);
                program.uniform1f("color", logo.id / 255);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            });

            gl.disable(gl.CULL_FACE);
            gl.disable(gl.DEPTH_TEST);
            gl.readPixels(0, 0, range, range, gl.RGBA, gl.UNSIGNED_BYTE, data);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
            var h = null,
                m = 0,
                d = {};

            for (var b = 0; b < data.length; b += 4) {
                if (data[b + 3]) {
                    var y = data[b + 1] << 8 | data[b + 0],
                        T = d[y] || 0;
                    d[y] = ++T;
                    T > m && (h = y, m = T)
                }
            }
            if(h){
                console.log(h);
            }
            return h;
        }
    };

    window.Earth = Earth;

    /**
     * 标记鼠标状态
     */
    document.addEventListener("mouseup", function () {
        MOUSE_STATE = -1;
    }, false);

    function Stars(earth) {
        var self = this,
            webgl,
            count = 10000;
        self.earth = earth;
        webgl = self.webgl = earth.webgl;
        self.gl = webgl.gl;

        function getVert() {
            var e = vec3.create(),
                r = new FLOAT_ARRAY(count << 2);
            for (var n = 0; n < r.length; n += 4) {
                Random.unitVec3(e);
                vec3.scale(e, e, 50);
                r[n + 0] = e[0];
                r[n + 1] = e[1];
                r[n + 2] = e[2];
                r[n + 3] = lerp(.1, 2.5, MATH_POW(MATH_RANDOM(), 10));
            }
            return webgl.makeVertexBuffer(r)
        }

        this.count = count;
        this.buffers = {
            vert: getVert()
        };
        this.programs = {
            main: webgl.getProgram("stars")
        };
        this.mvp = mat4.create();
        return this;
    }

    Stars.prototype = {
        /**
         * 画星星
         * @returns {Stars}
         */
        render: function () {
            var self = this,
                gl = self.gl,
                webgl = self.webgl,
                earth = self.earth;

            gl.disable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

            var program = self.programs.main.use(),
                mvp = self.mvp;

            mat4.copy(mvp, earth.camera.view);
            mvp[12] = 0;
            mvp[13] = 0;
            mvp[14] = 0;

            mat4.multiply(mvp, earth.camera.proj, mvp);
            program.uniformMatrix4fv("mvp", mvp);
            program.uniform4f("color", 1, 1, 1, .5);
            webgl.bindVertexBuffer(self.buffers.vert);
            program.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0);
            gl.drawArrays(gl.POINTS, 0, self.count);

            return self;
        }
    };

    function Corona(earth) {
        var self = this,
            gl,
            webgl;

        self.earth = earth;
        webgl = self.webgl = earth.webgl;
        gl = self.gl = webgl.gl;

        function getVert() {
            for (var e = [], r = 128, n = 0; r + 1 > n; ++n) {
                var o = 2 * MATH_PI * n / r,
                    a = n / (r + 1),
                    i = MATH_COS(o),
                    u = MATH_SIN(o);
                e.push(i, u, a, 0, i, u, a, 1)
            }
            t = e.length / 4;
            return webgl.makeVertexBuffer(new Float32Array(e))
        }

        var t = 0;
        this.buffers = {
            vert: getVert()
        };
        this.vertex_count = t;
        this.programs = {
            main: webgl.getProgram("corona")
        };
        this.textures = {
            smoke: webgl.loadTexture2D(resource("textures/smoke.jpg"), {
                mipmap: !0,
                wrapS: gl.REPEAT,
                wrapT: gl.CLAMP_TO_EDGE
            })
        }
    }

    Corona.prototype = {
        render: function () {
            var self = this,
                gl = self.gl,
                earth = self.earth,
                webgl = self.webgl,
                r = this.programs.main.use();
            r.uniformMatrix4fv("mvp", earth.camera.mvp);
            r.uniformMatrix3fv("bill", earth.camera.bill);
            r.uniformSampler2D("t_smoke", this.textures.smoke);
            r.uniform1f("zoff", 0);
            gl.disable(gl.CULL_FACE);
            gl.enable(gl.BLEND);

            if ("dark" === earth.colorModel) {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                r.uniform3f("color0", 0.34901960784313724, 0.6980392156862745, 0.9254901960784314);
                r.uniform3f("color1", 0, 0, 0);
            } else {
                gl.blendFunc(gl.DST_COLOR, gl.ZERO);
                r.uniform3f("color0", .07, .25, .16);
                r.uniform3f("color1", 1, 1, 1);
            }

            webgl.bindVertexBuffer(this.buffers.vert);

            r.vertexAttribPointer("vertex", 4, gl.FLOAT, !1, 0, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertex_count);
            gl.disable(gl.BLEND)
        },
        isRender: function () {
            return !!this.option.render && this.earth.projection.blend > .5;
        }
    };

    function MissileSystem(earth) {
        var self = this,
            gl,
            webgl;

        self.earth = earth;
        webgl = self.webgl = earth.webgl;
        gl = self.gl = webgl.gl;

        this.programs = {
            missile: webgl.getProgram("missile"),
            impact: webgl.getProgram("impact"),
            icon: webgl.getProgram("icon"),
            cone: webgl.getProgram("cone")
        };
        this.buffers = {
            missile: null,
            icon: null,
            cone: null,
            quad: webgl.makeVertexBuffer(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]))
        };
        this.textures = {
            impact: webgl.loadTexture2D(resource("textures/impact-512.jpg"), {
                mipmap: !1
            })
        };
        (function () {
            for (var e = [], r = 32, n = 0; r > n; ++n) {
                var o = MATH_PI * 2 * n / (r - 1),
                    a = MATH_COS(o),
                    i = MATH_SIN(o);
                e.push(a, 0, i, a, 1, i)
            }
            e = new Float32Array(e);
            self.buffers.cone = webgl.makeVertexBuffer(e);
            self.n_cone_verts = e.length / 3
        })();
        this.data = [];
        this.init_missiles();
    }

    (function () {

        var p = 1e3,
            g = 100,
            h = 8 * g,
            u = {
                use_missiles: !0,
                use_impacts: !0,
                use_cones: !0,
                use_icons: !0,
                scale: 2,
                width: .1,
                height: .01,
                ff_impacts: false
            },
            l = u;

        /**
         * 图形
         * @param gl
         * @constructor
         */
        function Shape(gl) {
            this.gl = gl;
            this.offset = 0;
            this.count = 0;
        }

        /**
         * 画图形
         */
        Shape.prototype.draw = function () {
            this.gl.drawArrays(this.gl.LINES, this.offset, this.count)
        };

        function getMissile(e, t) {
            for (var r = null, n = 0, o = 0; o < t.length; ++o) {
                var a = t[o];
                if (!a.alive) return a;
                var i = e - a.start_time;
                i > n && (n = i, r = a)
            }

            if (r) {
                return r
            }

            return t[0];

        }

        var NOW = timeNow();
        MissileSystem.prototype = {
            init_missiles: function () {
                var self = this,
                    earth = self.earth,
                    webgl = self.webgl,
                    gl = self.gl,
                    bufferData = new Float32Array(p * h),
                    a = null,
                    i = vec3.create(),
                    u = vec3.create(),
                    c = vec3.create(),
                    s = vec3.create();
                self.time = timeNow();
                function Missile(t) {
                    this.index = t;
                    this.verts = bufferData.subarray(this.index * h, (this.index + 1) * h);
                    this.source_coord = vec3.create();
                    this.target_coord = vec3.create();
                    this.source_mat = mat4.create();
                    this.target_mat = mat4.create();
                    this.start_time = 0;
                    this.alive = false;
                    this.style = 1;
                    this.color = vec3.create(0, 0, 0);
                    this.has_source = !0;
                    this.has_target = !0;
                    this.draw_source_impact = true;

                }

                function r(target_mat, target_coord, sacle) {
                    var o = i,
                        a = u,
                        l = c,
                        f = s;
                    project(earth.projection.blend, f, target_coord);
                    if (earth.projection.blend > .5) {
                        vec3.normalize(l, f);
                        vec3.set(o, 0, 1, 0);
                        vec3.cross(o, l, o);
                        vec3.normalize(o, o);
                        vec3.cross(a, o, l);
                        target_mat[0] = o[0];
                        target_mat[1] = o[1];
                        target_mat[2] = o[2];
                        target_mat[4] = l[0];
                        target_mat[5] = l[1];
                        target_mat[6] = l[2];
                        target_mat[8] = a[0];
                        target_mat[9] = a[1];
                        target_mat[10] = a[2];
                    } else {
                        mat4.identity(target_mat);
                        mat4.rotateX(target_mat, target_mat, -.5 * MATH_PI);
                    }
                    sacle && mat4.scale(target_mat, target_mat, [sacle, sacle, sacle]);
                    target_mat[12] = f[0];
                    target_mat[13] = f[1];
                    target_mat[14] = f[2]
                }

                Missile.prototype.launch = function (systemId, target_coord, source_coord, sacle, angle) {

                    this.style = systemId;
                    this.shape = self.shapes[this.style];
                    this.color = earth.metrics[this.style].color;
                    this.has_source = !!source_coord;
                    this.start_time = self.time;
                    this.alive = true;
                    this.has_source && vec3.copy(this.source_coord, source_coord);
                    vec3.copy(this.target_coord, target_coord);
                    if (this.has_source) {
                        var p = vec2.distance(source_coord, target_coord),
                            m = l.height * p,
                            d = (target_coord[0] - source_coord[0]) / p,
                            _ = (target_coord[1] - source_coord[1]) / p,
                            b = 200,
                            y = b * -_,
                            T = b * d;
                        angle = angle || 0;
                        var w = MATH_COS(angle),
                            E = MATH_SIN(angle),
                            x = this.index * h,
                            A = i,
                            M = u;
                        for (var R = 0; g > R; ++R) {
                            var P = R / (g - 1);
                            vec3.lerp(M, source_coord, target_coord, P);
                            var L = m * MATH_SIN(P * MATH_PI) * .15;
                            M[0] += E * L * y;
                            M[1] += E * L * T;
                            M[2] += w * L;
                            project(earth.projection.blend, A, M);
                            bufferData[x + 0] = A[0];
                            bufferData[x + 1] = A[1];
                            bufferData[x + 2] = A[2];
                            bufferData[x + 3] = -P;
                            bufferData[x + 4] = A[0];
                            bufferData[x + 5] = A[1];
                            bufferData[x + 6] = A[2];
                            bufferData[x + 7] = P;
                            x += 8
                        }
                        var D = 4 * this.index * h;
                        webgl.bindVertexBuffer(a);
                        gl.bufferSubData(gl.ARRAY_BUFFER, D, this.verts);
                        if (this.source_coord[2] < .015) {
                            r(this.source_mat, this.source_coord, sacle);
                            this.draw_source_impact = !0
                        } else {
                            this.draw_source_impact = !1

                        }

                    } else {
                        if (u.ff_impacts) {
                            this.start_time -= 1
                        }
                    }
                    r(this.target_mat, this.target_coord, sacle)
                };

                this.missiles = [];
                for (var f = 0; p > f; ++f) {
                    this.missiles.push(new Missile(f));
                }

                this.buffers.missile = a = webgl.makeVertexBuffer(bufferData)
            },
            registerShape: function () {
                var vertex = [],
                    self = this,
                    earth = self.earth,
                    gl = self.gl,
                    webgl = self.webgl;

                function addVertex(e, t) {
                    
                    vertex.push(MATH_COS(e), MATH_SIN(e), t)
                }

                self.shapes = {};

                each(earth.metrics, function (sys, id) {
                    var n_sides = sys.n_sides;

                    var o = new Shape(gl);
                    o.offset = vertex.length / 3;
                    var a = 0 > n_sides;
                    n_sides = MATH.abs(n_sides);
                    var i = a ? MATH_PI / n_sides : MATH_PI * 2 / n_sides;
                    for (var c = 0; 5 > c; ++c) {
                        for (var l = 0, s = 0; n_sides > s; ++s) {
                            addVertex(l, c);
                            addVertex(l + i, c);
                            l += i;
                        }
                        if (a) {
                            addVertex(l, c);
                            addVertex(0, c)
                        }

                        if (31 == n_sides) {
                            l = .8;
                            addVertex(l, c);
                            addVertex(l + MATH_PI, c)
                        }
                    }
                    o.count = vertex.length / 3 - o.offset;

                    self.shapes[id] = o
                });
                vertex = new Float32Array(vertex);

                this.buffers.icon = webgl.makeVertexBuffer(vertex)
            },
            render: function () {
                var self = this;
                self.time = 1 * (timeNow() - NOW);

                this.draw();
            },
            launch: function (systemId, target_coord, source_coord, angle) {
                var missile = getMissile(this.time, this.missiles);
                missile.launch(systemId, target_coord, source_coord, l.scale, angle);
                return missile;
            },
            draw: function () {
                var self = this,
                    gl = self.gl,
                    earth = self.earth,
                    webgl = self.webgl,
                    activeCount = {
                        active: 0,
                        curves: 0
                    };
                gl.enable(gl.DEPTH_TEST);
                gl.depthMask(!1);
                /**
                 * 画导弹线
                 */
                if (l.use_missiles) {
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                    var n = this.programs.missile.use();
                    n.uniformMatrix4fv("mvp", earth.camera.mvp);
                    n.uniform3fv("view_position", earth.camera.viewPos);
                    n.uniform1f("width", l.width);
                    webgl.bindVertexBuffer(this.buffers.missile);
                    n.vertexAttribPointer("position", 4, gl.FLOAT, !1, 0, 0);
                    each(this.missiles, function (t, k) {
                        if (t.alive && t.has_source) {
                            ++activeCount.curves;
                            var time = self.time - t.start_time;
                            if (2 > time) {
                                n.uniform1f("time", .5 * time);
                                n.uniform3fv("color", t.color);
                                var a = 2 * g,
                                    i = a * t.index;
                                gl.drawArrays(gl.TRIANGLE_STRIP, i, a)
                            }
                        }
                    })
                }
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

                /**
                 * 画撞击效果
                 */
                if (l.use_impacts) {
                    var n = this.programs.impact.use();
                    n.uniformMatrix4fv("mvp", earth.camera.mvp);
                    n.uniformSampler2D("t_color", this.textures.impact);
                    webgl.bindVertexBuffer(this.buffers.quad);
                    n.vertexAttribPointer("position", 2, gl.FLOAT, false, 0, 0);
                    each(this.missiles, function (t) {
                        if (t.alive) {

                            ++activeCount.active;
                            var o = self.time - t.start_time;
                            if (o > 4) return void(t.alive = !1);
                            n.uniform3fv("color", t.color);

                            if (t.has_source && t.draw_source_impact && 1 > o) {
                                n.uniformMatrix4fv("mat", t.source_mat);
                                n.uniform1f("time", o);
                                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
                            }
                            if (t.has_target && o >= 1) {
                                n.uniformMatrix4fv("mat", t.target_mat);
                                n.uniform1f("time", (o - 1) / 3);
                                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                            }

                        }
                    })
                }

                /**
                 * 画锥形光圈效果
                 */
                if (l.use_cones) {
                    var n = this.programs.cone.use();
                    n.uniformMatrix4fv("mvp", earth.camera.mvp);
                    webgl.bindVertexBuffer(this.buffers.cone);
                    n.vertexAttribPointer("position", 3, gl.FLOAT, !1, 0, 0);
                    each(this.missiles, function (r) {
                        if (r.alive) {
                            var o = self.time - r.start_time;
                            if (r.has_target && o >= 1 && 2 > o) {
                                n.uniform3fv("color", r.color);
                                n.uniformMatrix4fv("mat", r.target_mat);
                                n.uniform1f("time", o - 1);
                                gl.drawArrays(gl.TRIANGLE_STRIP, 0, self.n_cone_verts);
                            }
                        }
                    })
                }
                /**
                 * 画坐标点高亮效果
                 */
                if (l.use_icons) {
                    var n = this.programs.icon.use();
                    n.uniformMatrix4fv("mvp", earth.camera.mvp);
                    n.uniform1f("scale", .05);
                    webgl.bindVertexBuffer(this.buffers.icon);
                    n.vertexAttribPointer("vertex", 3, gl.FLOAT, false, 0, 0);
                    gl.lineWidth(2);
                    each(this.missiles, function (missile) {
                        if (missile.alive) {

                            var r = self.time - missile.start_time;

                            if (r >= 1 && 2 > r) {
                                n.uniformMatrix4fv("mat", missile.target_mat);
                                n.uniform3fv("color", missile.color);
                                n.uniform1f("time", r - 1);
                                missile.shape.draw();
                            }
                        }
                    });
                    gl.lineWidth(1)
                }
                gl.depthMask(!0)
            }
        };

    })();

    /**
     *
     * @constructor
     */
    function Label() {
        this.coord = vec3.create();
        this.coord[2] = 1e-4;
        this.pos = vec3.create();
        this.mat = mat4.create();
        this.box = vec4.create();
        this.name = "";
        this.font_size = 0
    }

    /**
     * 地方名
     * @param earth
     * @constructor
     */
    function Labels(earth) {
        var self = this,
            webgl,
            gl;

        self.earth = earth;
        webgl = self.webgl = earth.webgl;
        gl = self.gl = webgl.gl;

        this.size = 2048;
        this.buffers = {
            vert: null
        };
        this.programs = {
            label: webgl.getProgram("label")
        };
        this.texture = webgl.createTexture2D({
            size: this.size,
            mipmap: !0,
            min: gl.LINEAR_MIPMAP_LINEAR,
            aniso: 4,
            format: gl.LUMINANCE
        });
        gl.generateMipmap(gl.TEXTURE_2D);
        this.country_count = 0;
        this.labels = [];
        this.geoip_iso2 = null;
        this.r = vec3.create();
        this.load_label_data(function () {
            self.render_labels("en");
            self.project_labels("ecef")
        })
    }

    Labels.prototype = {
        load_label_data: function (callback) {
            var self = this,
                webgl = self.webgl;
            loadResources({labels: "data/labels.json"}, function (ret) {
                var labels = ret.labels;

                function a(cities, upperCase, n) {
                    each(cities, function (city) {
                        if (upperCase) {
                            if ((n && city.font_size < 5) || (!n && city.font_size > 5)) {
                                return
                            }
                        }
                        var a = new Label;
                        vec2.copy(a.coord, city.coord);
                        a.coord[2] *= 2;
                        a.name = city.name;
                        a.font_size = city.font_size;
                        upperCase ? a.name = a.name.toUpperCase() : a.font_size = 3;
                        self.labels.push(a);
                    })
                }

                a(labels.countries, true, true);
                self.country_count = self.labels.length;
                a(labels.cities, false, false);
                a(labels.countries, true, false);
                self.city_count = self.labels.length - self.country_count;
                var i = 30 * self.labels.length;
                self.buffers.vert = webgl.makeVertexBuffer(new Float32Array(i));
                callback()
            })
        },
        render_labels: function () {
            var self = this,
                gl = self.gl;
            var canvas = document.createElement("canvas");
            canvas.width = canvas.height = this.size;
            var n = canvas.getContext("2d");
            n.fillStyle = "#000";
            n.fillRect(0, 0, canvas.width, canvas.height);
            n.font = "30px Ubuntu Mono";
            n.fillStyle = "white";
            n.textBaseline = "top";
            var o = [0, 0],
                a = 35;
            each(this.labels, function (e) {
                var i = e.name,
                    u = n.measureText(i).width;
                o[0] + u >= canvas.width && (o[0] = 0, o[1] += a);
                n.fillText(i, o[0], o[1] - 0);
                vec4.set(e.box, o[0], o[1], o[0] + u, o[1] + a);
                vec4.scale(e.box, e.box, 1 / self.size);
                o[0] += u
            });
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, canvas);
            gl.generateMipmap(gl.TEXTURE_2D)
        },
        project_labels: function (type) {
            var self = this,
                webgl = self.webgl,
                gl = self.gl;

            function t(t, r, i, u) {
                mat4.identity(t);
                if ("ecef" == type) {
                    vec3.normalize(n, r);
                    vec3.set(o, 0, 1, 0);
                    vec3.cross(o, n, o);
                    vec3.normalize(o, o);
                    vec3.cross(a, o, n);
                    t[0] = o[0];
                    t[1] = o[1];
                    t[2] = o[2];
                    t[4] = n[0];
                    t[5] = n[1];
                    t[6] = n[2];
                    t[8] = a[0];
                    t[9] = a[1];
                    t[10] = a[2];
                    mat4.rotateX(t, t, MATH_PI / 2);
                }
                mat4.scale(t, t, [i, u, 1]);
                t[12] = r[0], t[13] = r[1], t[14] = r[2]
            }

            if (this.labels.length) {
                var r = "ecef" == type ? project_ecef : project_mercator,
                    n = vec3.create(),
                    o = vec3.create(),
                    a = vec3.create(),
                    i = [],
                    u = vec3.create(),
                    c = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1],
                    l = this;
                each(this.labels, function (e) {
                    r(e.pos, e.coord);
                    var n = 1 * e.font_size;
                    t(e.mat, e.pos, n * (e.box[2] - e.box[0]), n * (e.box[3] - e.box[1]));
                    for (var o = 0; o < c.length; o += 2) {
                        u[0] = c[o + 0];
                        u[1] = c[o + 1];
                        u[2] = 0;
                        vec3.transformMat4(u, u, e.mat);
                        i.push(u[0], u[1], u[2]);
                        u[0] = .5 * (1 + c[o + 0]);
                        u[1] = .5 * (1 + c[o + 1]);
                        u[0] = lerp(e.box[2], e.box[0], u[0]);
                        u[1] = lerp(e.box[3], e.box[1], u[1]);
                        i.push(u[0], u[1])
                    }
                });
                webgl.bindVertexBuffer(this.buffers.vert);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(i))
            }
        },
        render: function () {
            var self = this,
                webgl = self.webgl,
                gl = self.gl,
                earth = self.earth,
                blend = earth.projection.blend;

            if (0 != this.labels.length) {
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                gl.depthMask(!1);
                project(blend, self.r, earth.geocam.coord);
                var program = this.programs.label.use();
                program.uniformMatrix4fv("mvp", earth.camera.mvp);
                program.uniform4f("circle_of_interest", self.r[0], self.r[1], self.r[2], lerp(3, 10, blend));
                program.uniformSampler2D("t_color", this.texture);
                webgl.bindVertexBuffer(this.buffers.vert);
                program.vertexAttribPointer("position", 3, gl.FLOAT, !1, 20, 0);
                program.vertexAttribPointer("texcoord", 2, gl.FLOAT, !1, 20, 12);
                program.uniform1i("inside", 0);
                gl.drawArrays(gl.TRIANGLES, 0, 6 * this.country_count);
                program.uniform1i("inside", 1);
                gl.drawArrays(gl.TRIANGLES, 6 * this.country_count, 6 * this.city_count);
                gl.depthMask(!0);
                gl.disable(gl.BLEND)
            }
        }
    };

    function Hedgehog(gl) {
        this.position = vec3.create();
        var e = 1;
        this.scale = vec2.fromValues(2, .25 * e);
        this.texture = null;
        this.gl = gl;
    }

    Hedgehog.prototype.destroy = function () {
        this.gl.deleteTexture(this.texture);
        this.texture = null
    };

    function Hedgehogs(earth) {
        var self = this;
        self.earth = earth;
        self.webgl = earth.webgl;
        self.gl = self.webgl.gl;
        self.draw = false;

        self.buffers = {
            verts: self.webgl.makeVertexBuffer(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])),
            lines: null
        };
        self.programs = {
            simple: self.webgl.getProgram("simple"),
            hedgehog: self.webgl.getProgram("hedgehog")
        };

        self.fade = 0;
        self.h = .02;

        self.hedgehogs = [];
        self.top = {};
    }

    Hedgehogs.prototype = {
        render: function () {
            var self = this,
                gl = self.gl,
                webgl = self.webgl,
                params = self.earth;

            if (self.draw) {
                self.fade = Math.min(1, self.fade + self.h);
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

                var hedgehogProgram = self.programs.hedgehog.use();
                hedgehogProgram.uniformMatrix4fv("mvp", params.camera.mvp);
                hedgehogProgram.uniformMatrix3fv("bill", params.camera.bill);
                hedgehogProgram.uniform4f("color", 1, 1, 1, 1);
                webgl.bindVertexBuffer(self.buffers.verts);
                hedgehogProgram.vertexAttribPointer("coord", 2, gl.FLOAT, !1, 0, 0);
                each(self.hedgehogs, function (hedgehog) {
                    hedgehogProgram.uniform3fv("position", hedgehog.position);
                    hedgehogProgram.uniform2fv("scale", hedgehog.scale);
                    hedgehogProgram.uniformSampler2D("t_color", hedgehog.texture);
                    hedgehogProgram.uniform1f("fade", self.fade);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
                });

                var simpleProgram = self.programs.simple.use();
                simpleProgram.uniformMatrix4fv("mvp", params.camera.mvp);
                simpleProgram.uniform4f("color", 1, 1, 1, .5 * self.fade);
                webgl.bindVertexBuffer(self.buffers.lines);
                simpleProgram.vertexAttribPointer("position", 3, gl.FLOAT, !1, 0, 0);
                gl.drawArrays(gl.LINES, 0, 2 * self.hedgehogs.length);
                gl.disable(gl.BLEND);
                gl.disable(gl.DEPTH_TEST);

            } else {
                self.fade = Math.max(0, self.fade - self.h);
            }

        },
        show: function (draw) {
            if (typeof draw == "undefiend" || arguments.length === 0 || draw == null) {
                draw = true;
            }
            this.draw = draw;
        },
        hide: function () {
            this.draw = false;
        },
        setup: function (logos) {
            var self = this,
                earth = self.earth,
                webgl = self.webgl,
                gl = self.gl;

            each(self.hedgehogs, function (hedgehog) {
                hedgehog.destroy()
            });
            self.hedgehogs = [];
            var vertexes = [];
            each(logos || [], function (logo) {
                var ID = logo.id;
                var name = logo.name.toUpperCase();
                var coord = logo.coord,
                    hedgehog = new Hedgehog(gl),
                    position = hedgehog.position,
                    m = vec3.create();
                hedgehog.height = range(0.1, 0.3);
                vec3.set(position, coord[0], coord[1], hedgehog.height);
                project(earth.projection.blend, position, position);

                vec3.set(m, coord[0], coord[1], 0);
                project(earth.projection.blend, m, m);
                vertexes.push(position[0], position[1], position[2]);
                vertexes.push(m[0], m[1], m[2]);
                var canvas = document.createElement("canvas"),
                    context = canvas.getContext("2d");

                canvas.width = 128;
                canvas.height = 32;
                context.alpha = 0;
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.save();
                context.fillStyle = "#ffffff";
                context.font = '8px Arial';
                context.fillText(logo.name.toUpperCase(), 20, 30);
                context.save();
                var texture = hedgehog.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.generateMipmap(gl.TEXTURE_2D);

                self.hedgehogs.push(hedgehog)
            });

            if (self.buffers.lines) {
                gl.deleteBuffer(self.buffers.lines);
                self.buffers.lines = null;
            }
            self.buffers.lines = webgl.makeVertexBuffer(new Float32Array(vertexes))
        }
    };
})(window, document);