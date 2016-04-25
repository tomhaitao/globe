/**
 * @file WebGL 3D地球
 * @author vision <vision.shi@cloudwise.com>
 */

(function (window, document) {

    /**
     * 项目URL根目录,用于加载资源,注意,这个-8是'globe.js'的长度
     * @const
     * @type {string}
     */
    var URL_ROOT = document.currentScript.src.slice(0, -8);

    /**
     * 数组的constructor
     * @const
     * @type {Array}
     */
    var ARRAY = Array;

    /**
     * 数组的prototype
     * @const
     * @type {Object}
     */
    var ARRAY_PROTOTYPE = ARRAY.prototype;

    /**
     * 对象的constructor
     * @const
     * @type {Object}
     */
    var OBJECT = Object;

    /**
     * 对象的prototype
     * @const
     * @type {Object}
     */
    var OBJECT_PROTOTYPE = OBJECT.prototype;

    /**
     * Float32Array
     * @const
     * @type {Function}
     */
    var FLOAT32_ARRAY = Float32Array ? Float32Array : ARRAY;

    /**
     * Math对象
     * @const
     * @type {Object}
     */
    var MATH = Math;

    /**
     * Math.PI常量
     * @const
     * @type {number}
     */
    var MATH_PI = MATH.PI;

    /**
     * Math.random函数
     * @const
     * @type {Function}
     */
    var MATH_RANDOM = MATH.random;

    /**
     * Math.sin函数
     * @const
     * @type {Function}
     */
    var MATH_SIN = MATH.sin;

    /**
     * Math.cos函数
     * @const
     * @type {Function}
     */
    var MATH_COS = MATH.cos;

    /**
     * Math.sqrt函数
     * @const
     * @type {Function}
     */
    var MATH_SQRT = MATH.sqrt;

    /**
     * Math.pow函数
     * @const
     * @type {Function}
     */
    var MATH_POW = MATH.pow;

    /**
     * Math.max函数
     * @const
     * @type {Function}
     */
    var MATH_MAX = MATH.max;

    /**
     * Math.min函数
     * @const
     * @type {Function}
     */
    var MATH_MIN = MATH.min;

    /**
     * 标记鼠标当前坐标,包括移动
     * @type {number[]}
     */
    var MOUSE_POS = [0, 0];

    /**
     * 标记鼠标按下状态
     * -1  没有按下
     * 0 鼠标左键按下
     * 2 鼠标右键按下
     * @type {number}
     */
    var MOUSE_DOWN = -1;

    /**
     * 标记鼠标上次按下的坐标
     * @type {number[]}
     */
    var MOUSE_DOWN_POS = [0, 0];

    /**
     * 标记鼠标上次按下的时间
     * @type {number}
     */
    var MOUSE_DOWN_TIME = 0;

    /**
     * 标记是否正在拖拽
     * @type {boolean}
     */
    var MOUSE_DRAGGING = false;

    /**
     * 获取一个资源的链接
     * @param path
     * @returns {string}
     */
    function resource(path) {
        return URL_ROOT + path;
    }

    /**
     * 判断变量是否是数组
     * @param {*} obj 要判断的变量
     * @returns {boolean}
     */
    function isArray(obj) {
        return OBJECT_PROTOTYPE.toString.call(obj) === "[object Array]";
    }

    /**
     * 判断变量是否是对象
     * @param {*} obj 要判断的变量
     * @returns {boolean}
     */
    function isObject(obj) {
        return !(OBJECT_PROTOTYPE.toString.call(obj) !== "[object Object]" || isDom(obj) || obj instanceof Window);
    }

    /**
     * 判断变量是否是字符串
     * @param {*} obj 要判断的变量
     * @returns {boolean}
     */
    function isString(obj) {
        return typeof obj === "string";
    }

    /**
     * 判断变量是否是函数
     * @param {*} obj 要判断的变量
     * @returns {boolean}
     */
    function isFunction(obj) {
        return typeof obj === "function";
    }

    /**
     * 判断变量是否是数值,包括整型,浮点型,和数值型的字符串
     * @param {*} obj 要判断的变量
     * @returns {boolean}
     */
    function isNumeric(obj) {
        return !isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
    }

    /**
     * 判断变量是否是undefine或null
     * @param {*} obj 要判断的变量
     * @returns {boolean}
     */
    function isNull(obj) {
        return obj === undefined || obj === null;
    }

    /**
     * 判断变量是否是DOM(HTMLElement)
     * @param {*} obj 要判断的变量
     * @returns {boolean}
     */
    function isDom(obj) {
        return obj instanceof HTMLElement;
    }

    /**
     * 构建类之间的继承关系
     * @param {Function} subClass 子类函数
     * @param {Function} superClass 父类函数
     */
    function inherits(subClass, superClass) {
        var F = new Function();
        var prototype = clone(subClass.prototype);
        F.prototype = superClass.prototype;
        subClass.prototype = new F();
        extend(true, subClass.prototype, prototype);
        subClass.prototype.constructor = subClass;
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

        //如果是对象,深度克隆
        if (isObject(source)) {
            var result = source;
            //如果是数组,length遍历法
            if (isArray(source)) {
                result = [];
                for (var i = 0, len = source.length; i < len; i++) {
                    result[i] = clone(source[i]);
                }
            } else {
                //如果是对象,属性遍历法
                result = {};
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        //深度克隆
                        result[key] = clone(source[key]);
                    }
                }
            }
            return result;
        }

        return source;
    }

    /**
     * 深度合并多个对象(继承)
     * @returns {*|{}}
     */
    function extend() {
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        //第一个值是布尔,代表是否深度合并
        if (typeof target === "boolean") {
            deep = target;

            target = arguments[i] || {};
            i++;
        }

        //如果目标对象不是对象或函数,默认生成一个空对象
        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }
        //逐一合并,越往后优先级越高
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
                        //深度合并
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
     * 批量向一个数组push元素
     * @param array
     */
    function arrayPush(array) {
        for (var t = 1; t < arguments.length; ++t) {
            array.push.apply(array, arguments[t])
        }
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
     * 回调一个函数,最后一个参数是context
     * @param callback
     */
    function caller(callback) {
        var args = arguments,
            context = args.length == 1 ? null : args[args.length - 1],
            params = ARRAY_PROTOTYPE.slice.call(args, 1, args.length - 1);
        //执行回调
        if (isFunction(callback)) {
            callback.apply(context, params);
        }
        return context;
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
     * 从参数列表中挑选一个可用的值
     * @returns {*}
     */
    function pick() {
        var args = arguments;

        for (var i in args) {
            if (typeof args[i] != "undefined" && args[i] !== null) {
                return args[i];
            }
        }
    }

    /**
     * 生成缓冲区
     * @param gl            webgl
     * @param target        数据类型
     * @param bufferData    数据
     * @param bufferType    缓冲类型
     * @returns {*}
     */
    function makeBuffer(gl, target, bufferData, bufferType) {

        bufferType = bufferType || gl.STATIC_DRAW;
        var buffer = gl.createBuffer();
        gl.bindBuffer(target, buffer);
        gl.bufferData(target, bufferData, bufferType);

        return buffer
    }

    /**
     * 生成顶点缓冲区
     * @param gl
     * @param bufferData
     * @param bufferType
     * @returns {*}
     */
    function makeVertexBuffer(gl, bufferData, bufferType) {
        return makeBuffer(gl, gl.ARRAY_BUFFER, bufferData, bufferType)
    }

    /**
     * 生成元素缓冲区
     * @param gl
     * @param bufferData
     * @param bufferType
     * @returns {*}
     */
    function makeElementBuffer(gl, bufferData, bufferType) {
        return makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, bufferData, bufferType)
    }

    /**
     * 绑定顶点缓冲区
     * @param gl
     * @param buffer
     */
    function bindVertexBuffer(gl, buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    }

    /**
     * 绑定元素缓冲区
     * @param gl
     * @param buffer
     */
    function bindElementBuffer(gl, buffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    }

    /**
     * 创建Texture2D
     * @param gl
     * @param option
     * @returns {*}
     */
    function createTexture2D(gl, option) {

        var texture = gl.createTexture();
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
            var o = gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
            o && gl.texParameteri(gl.TEXTURE_2D, o.TEXTURE_MAX_ANISOTROPY_EXT, option.aniso)
        }
        return texture;
    }

    /**
     * 加载Texture
     * @param gl
     * @param url
     * @param options
     * @returns {*}
     */
    function loadTexture2D(gl, url, options) {

        options = extend(true, {mipmap: !1, flip: !1, callback: null, filter: gl.LINEAR}, options || {});

        var texture = createTexture2D(gl, options),
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
            caller(options.callback, texture, gl);
        };
        return texture;
    }

    /**
     * 已注册的着色器
     * @type {{}}
     */
    var SHADERS = {
        "map_pick": "attribute vec3 position;\nuniform mat4 mvp;\nuniform float color;\n",
        "map_pick.vertex": "void main() {\n    vec3 P = position;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "map_pick.fragment": "void main() {\n    gl_FragColor = vec4(color, 0.0, 0.0, 1.0);\n}\n",
        "map_main": "attribute vec3 position;\nattribute vec3 normal;\nattribute vec3 position2;\nattribute vec3 normal2;\nattribute vec2 texcoord;\nvarying vec3 v_normal;\nvarying vec2 v_texcoord;\nvarying vec3 v_light_vec;\nvarying vec3 v_view_vec;\nuniform mat4 mvp;\nuniform float offset_x;\n\nuniform sampler2D t_blur;\nuniform float blend;\nuniform vec3 light_pos;\nuniform vec3 view_pos;\n\nuniform vec3 color0;\nuniform vec3 color1;\nuniform float tone;\nuniform float height;\n",
        "map_main.vertex": "void main() {\n    vec3 P = mix(position, position2, blend);\n    P.x += offset_x;\n\n    v_normal = mix(normal, normal2, blend);\n    P += height * v_normal;\n\n    gl_Position = mvp * vec4(P, 1.0);\n\n    v_texcoord = texcoord;\n    v_light_vec = light_pos - P;\n    v_view_vec = view_pos - P;\n}\n",
        "map_main.fragment": "void main() {\n    vec3 N = normalize(-v_normal);\n    vec3 V = normalize(v_view_vec);\n    vec3 L = normalize(v_light_vec);\n    vec3 H = normalize(L + V);\n    float NdotL = max(0.0, dot(N, L));\n    float NdotH = max(0.0, dot(N, H));\n\n    float blur = texture2D(t_blur, v_texcoord).r;\n    blur = 1.0*pow(blur, 2.0);\n\n    float diffuse = 0.5 + 0.5*NdotL;\n    float specular = 0.75 * pow(NdotH, 15.0);\n\n    gl_FragColor.rgb = diffuse * mix(color0, color1, tone) + vec3(specular);\n    gl_FragColor.a = 1.0;\n}\n",
        "map_grid": "attribute vec3 position;\nattribute vec3 position2;\nattribute vec2 texcoord;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform vec2 pattern_scale;\nuniform sampler2D t_blur;\nuniform sampler2D t_pattern;\nuniform float blend;\nuniform vec3 color0;\nuniform vec3 color1;\nuniform float offset_x;\n",
        "map_grid.vertex": "void main() {\n    vec3 P = mix(position, position2, blend);\n    P.x += offset_x;\n    gl_Position = mvp * vec4(P, 1.0);\n    v_texcoord = texcoord;\n}\n",
        "map_grid.fragment": "void main() {\n    float pattern = texture2D(t_pattern, pattern_scale * v_texcoord).r;\n    float blur = texture2D(t_blur, v_texcoord).r;\n\n    gl_FragColor.rgb = mix(color0, color1, blur) + vec3(pattern);\n    gl_FragColor.a = 1.0;\n}\n",
        "map_line": "attribute vec3 position;\nattribute vec3 normal;\nattribute vec3 position2;\nattribute vec3 normal2;\nuniform mat4 mvp;\nuniform vec4 color;\nuniform float blend;\nuniform float height;\n",
        "map_line.vertex": "void main() {\n    vec3 P = mix(position, position2, blend);\n    vec3 N = mix(normal, normal2, blend);\n    P += height * N;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "map_line.fragment": "void main() {\n    gl_FragColor = color;\n}\n\n",
        "map_label": "attribute vec3 position;\n attribute vec2 texcoord;\n varying float v_alpha;\n varying vec2 v_texcoord;\n uniform mat4 mvp;\n uniform vec4 color;\nuniform vec4 circle_of_interest;\n uniform bool inside;\n uniform sampler2D t_color;",
        "map_label.vertex": "void main() {\n    gl_Position = mvp * vec4(position, 1.0);\n    v_alpha = max(0.0, 1.0 - distance(position, circle_of_interest.xyz)/circle_of_interest.a);\n    if (!inside)\n        v_alpha = pow(1.0 - v_alpha, 6.0);\n    v_texcoord = texcoord;\n}\n",
        "map_label.fragment": "void main() {\n    gl_FragColor = texture2D(t_color, v_texcoord);\n    gl_FragColor.a = 0.7 * v_alpha;\n}",
        "stars": "attribute vec4 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        "stars.vertex": "void main() {\n    gl_PointSize = position.w;\n    gl_Position = mvp * vec4(position.xyz, 1.0);\n}\n",
        "stars.fragment": "void main() {\n    gl_FragColor = color;\n}\n",
        "corona": "attribute vec4 vertex;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform mat3 bill;\nuniform sampler2D t_smoke;\nuniform float time;\nuniform vec4 color;\n",
        "corona.vertex": "void main() {\n    float s = 10.0 + (10.0 * vertex.w);\n    vec3 P = vec3(s * vertex.xy, 0);\n    P = bill * P;\n    gl_Position = mvp * vec4(P, 1.0);\n    v_texcoord = vertex.zw;\n}\n",
        "corona.fragment": "void main() {\n    vec2 uv = vec2(5.0*v_texcoord.x + 0.01*time, 0.8 - 1.5*v_texcoord.y);\n    float smoke = texture2D(t_smoke, uv).r;\n    uv = vec2(3.0*v_texcoord.x - 0.007*time, 0.9 - 0.5*v_texcoord.y);\n vec3 color1 = vec3(0,0,0);\n   smoke *= 1.5*texture2D(t_smoke, uv).r;\n\n    float t = pow(v_texcoord.y, 0.25);\n    gl_FragColor.rgb = mix(color.rgb,color1, t) + 0.3*smoke;\ngl_FragColor.a = color.a;\n}\n",
        "mark": "attribute vec2 coord;\nvarying vec2 v_texcoord;\nuniform mat4 mvp;\nuniform mat3 bill;\nuniform mat4 mat;\nuniform vec3 pos;\nuniform sampler2D t_sharp;\nuniform sampler2D t_fuzzy;\nuniform vec4 color;\nuniform float scale;\nuniform float fuzz;\n",
        "mark.vertex": "void main() {\n    v_texcoord = vec2(coord.x, 1.0 - coord.y);\n    vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "mark.fragment": "void main() {\n    vec4 C = mix(texture2D(t_sharp, v_texcoord), texture2D(t_fuzzy, v_texcoord), fuzz);\n    float alpha = C.x;\n    gl_FragColor = vec4(color.xyz, alpha);\n}",
        "mark_pick": "attribute vec2 coord;\n varying vec2 v_texcoord;\n uniform mat4 mvp;\n uniform mat3 bill;\n uniform vec3 pos;\n uniform float color;\n uniform float scale;",
        "mark_pick.vertex": "void main() {\n   v_texcoord = vec2(coord.x, 1.0 - coord.y);\n   vec3 P = (bill * scale * vec3(2.0*(coord.x-0.5), 2.0*coord.y, 0.0)) + pos;\n   gl_Position = mvp * vec4(P, 1.0);\n  }",
        "mark_pick.fragment": "void main() {\n   gl_FragColor = vec4(color, 0.0, 0.0, 1.0);\n }",
        "connector": "attribute vec4 position;\nuniform mat4 mvp;\nuniform vec4 color;\n",
        "connector.vertex": "void main() {\n    vec3 P = position.xyz;\n    float side = position.w;\n    if (side > 0.5)\n        gl_Position = mvp * vec4(P, 1.0);\n    else\n        gl_Position = vec4(P, 1.0);\n}\n",
        "connector.fragment": "void main() {\n    gl_FragColor = color;\n}\n\n\n",
        "missile_icon": "attribute vec3 vertex;\nvarying float v_alpha;\nuniform mat4 mvp;\nuniform mat4 mat;\nuniform vec3 color;\nuniform float time;\nuniform float scale;\n",
        "missile_icon.vertex": "void main() {\n    float spread = 1.0 + (time * 0.3*vertex.z);\n    vec3 P = scale * spread * vec3(vertex.xy, -2.50*(vertex.z)*time);\n    P = P.xzy;\n    P.y = -P.y;\n    gl_Position = mvp * mat * vec4(P, 1.0);\n    v_alpha = 1.0 - vertex.z/6.0;\n}\n",
        "missile_icon.fragment": "void main() {\n    gl_FragColor.rgb = color;\n    gl_FragColor.a = (1.0 - pow(time, 7.0)) * (v_alpha * time);\n}\n",
        "missile_main": "attribute vec4 position;\nvarying vec3 v_normal;\nvarying vec3 v_view_vec;\nvarying float v_alpha;\nvarying float v_v;\nuniform mat4 mvp;\nuniform vec3 view_position;\nuniform vec3 color;\nuniform float time;\nuniform float width;\n",
        "missile_main.vertex": "void main() {\n    float u = abs(position.w);\n    float v = sign(position.w);\n    v_v = v;\n\n    float w = 0.2 + 0.3*(1.0 - pow(2.0*abs(u - 0.5), 2.0));\n    w = width * w * (v - 0.5);\n\n    vec3 P = position.xyz;\n    P.x += w;\n\n    v_normal = normalize(P);\n    v_view_vec = normalize(view_position - P);\n    v_alpha = u;\n    gl_Position = mvp * vec4(P, 1.0);\n}\n",
        "missile_main.fragment": "void main() {\n    vec3 N = normalize(v_normal);\n    vec3 V = normalize(v_view_vec);\n    float NdotV = max(0.0, dot(N, V));\n    float w = 1.0 - pow(abs(v_v), 4.0);\n    gl_FragColor.rgb = color.rgb;\n    gl_FragColor.a = pow(max(0.0, sin(3.14159 * (v_alpha + (1.0 - 2.0*time)))), 3.5);\n    gl_FragColor.a *= w;\n}\n",
        "missile_impact": "attribute vec2 position;\nvarying vec2 v_texcoord0;\nvarying vec2 v_texcoord;\nvarying vec2 v_texcoord2;\nvarying vec2 v_texcoord3;\nuniform mat4 mvp;\nuniform vec3 color;\nuniform sampler2D t_color;\nuniform float time;\nuniform mat4 mat;\n",
        "missile_impact.vertex": "#define PI 3.14159265359\n\nvec2 rotate_vec2(vec2 v, float theta) {\n    float c = cos(theta);\n    float s = sin(theta);\n    return vec2(c*v.x - s*v.y, s*v.x + c*v.y);\n}\n\nvoid main() {\n    const float SCALE = 0.08 * 1.25;\n    vec3 P = SCALE * vec3(2.0 * (position.x - 0.5), 0.01, 2.0 * (position.y - 0.5));\n    gl_Position = mvp * mat * vec4(P, 1.0);\n    v_texcoord0 = position.xy;\n    float impact_scale = 1.0 / (time + 0.1);\n    v_texcoord = impact_scale*rotate_vec2(position.xy - 0.5, time) + 0.5;\n    v_texcoord2 = impact_scale*rotate_vec2(position.xy - 0.5, -time) + 0.5;\n    float scale = 1.5 + 0.3*sin(2.0*time);\n    v_texcoord3 = scale * impact_scale*rotate_vec2(position.xy - 0.5, -0.32323 * time) + 0.5;\n}\n",
        "missile_impact.fragment": "void main() {\n    vec3 C = texture2D(t_color, v_texcoord).rgb;\n    vec3 C2 = texture2D(t_color, v_texcoord2).rgb;\n    vec3 C3 = 0.6*texture2D(t_color, v_texcoord3).rgb;\n    gl_FragColor.rgb = color.rgb * (C * C2) + C3;\n\n    // grid\n    {\n        float x = 0.0;\n        vec2 t = 5.0 * (v_texcoord0 - 0.5);\n        t = t - floor(t);\n        if (t.x < 0.10)\n            x += 2.0;\n        if (t.y < 0.10)\n            x += 2.0;\n        x *= 1.0 - 2.0*length(v_texcoord0 - 0.5);\n        gl_FragColor.rgb += 0.5 * x * color.rgb;\n    }\n\n    gl_FragColor.a = 1.0 - pow(2.0*abs(time - 0.5), 2.0);\n}\n",
        "missile_cone": "attribute vec3 position;\nvarying vec2 v_coord;\nuniform mat4 mvp;\nuniform vec3 color;\nuniform mat4 mat;\nuniform float time;\n",
        "missile_cone.vertex": "void main() {\n    v_coord = vec2(0.0, position.y);\n    float scale = 0.07 * mix(0.15, 0.4, position.y);\n    vec3 P = scale * position;\n    P.y *= 5.0;\n    gl_Position = mvp * mat * vec4(P, 1.0);\n}\n",
        "missile_cone.fragment": "void main() {\n    gl_FragColor.rgb = color;\n    gl_FragColor.rgb += (1.0 - vec3(v_coord.y)) * 0.2;\n    gl_FragColor.a = (1.0 - v_coord.y) * 1.0;\n    gl_FragColor.a *= 1.0 - pow(2.0*abs(time - 0.5), 2.0);\n}\n\n"
    };

    /**
     * 注册一个着色器
     * @param name
     * @param shader
     * @param vertex
     * @param fragment
     */
    function registerShaders(name, shader, vertex, fragment) {
        SHADERS[name] = shader;
        SHADERS[name + ".vertex"] = vertex;
        SHADERS[name + ".fragment"] = fragment;
    }

    /**
     * 创建着色器
     * @param gl
     * @param shaderType
     * @param shader
     * @param shaderName
     * @returns {*}
     */
    function createShader(gl, shaderType, shader, shaderName) {
        var n = gl.createShader(shaderType);
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
    }

    /**
     * 获取着色器
     * @param shaderName
     * @param suffix
     * @returns {*}
     */
    function getShader(shaderName, suffix) {
        if (arguments.length === 2) {
            return SHADERS[shaderName + "." + suffix]
        }
        return SHADERS[shaderName];
    }

    /**
     * 获取一个着色器的program
     * @param gl
     * @param shaderName
     * @returns {*}
     */
    function getProgram(gl, shaderName) {
        var has = true;

        each([shaderName, shaderName + ".vertex", shaderName + ".fragment"], function () {
            has = has && !!getShader(shaderName);
            console.assert(has, shaderName + " not found.");
        });

        if (has) {

            var shader = getShader(shaderName),
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
                    vertexSource = shader + getShader(shaderName, "vertex"),
                    fragmentSource = shaderRaw + getShader(shaderName, "fragment");

                var r = "precision highp float;\n",
                    glProgram = gl.createProgram();

                gl.attachShader(glProgram, createShader(gl, gl.VERTEX_SHADER, vertexSource, shaderName));
                gl.attachShader(glProgram, createShader(gl, gl.FRAGMENT_SHADER, r + fragmentSource, shaderName));
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

    /**
     * 根据事件对象获取鼠标当前位置
     * @param e
     * @returns {*[]}
     */
    function getMouseEventOffset(e) {
        return typeof e.offsetX == "undefined" ? [e.layerX, e.layerY] : [e.offsetX, e.offsetY]
    }

    /**
     * 绑定事件
     * @param canvas
     * @param eventful
     */
    function bindCanvasEvents(canvas, eventful) {

        //绑定canvas事件
        each({
            mousedown: function (e) {

                MOUSE_DOWN = e.button;

                MOUSE_DOWN_POS = getMouseEventOffset(e);
                MOUSE_DOWN_TIME = new Date() - 0;
                eventful.dispatch("mousedown", e);
                e.preventDefault();
                return false;
            },
            mouseup: function (e) {

                //鼠标松开的时间
                var mouseUpTime = new Date() - 0,
                //鼠标松开的坐标
                    mousePos = getMouseEventOffset(e),
                //鼠标移动距离
                    distance = vec2.distance(mousePos, MOUSE_DOWN_POS);

                MOUSE_DOWN = -1;
                eventful.dispatch("mouseup", e);

                //拖拽结束
                if (MOUSE_DRAGGING === true) {
                    MOUSE_DRAGGING = false;
                    eventful.dispatch("dragend");

                    //鼠标按下后没有移动,被认为是点击事件
                } else if (distance === 0) {
                    eventful.dispatch("click", e);
                }

                return false;
            },
            mousemove: function (e) {
                var mousePos = getMouseEventOffset(e);

                //鼠标没有按下,认为是mousemove事件
                if (MOUSE_DOWN === -1) {
                    eventful.dispatch("mousemove", e);

                    //鼠标左键按下并且移动,被认为是拖拽事件
                } else if (MOUSE_DOWN === 0) {

                    //移动距离小于5,认为是刚开始拖拽
                    if (MOUSE_DRAGGING === false && vec2.distance(mousePos, MOUSE_DOWN_POS) < 5) {
                        MOUSE_DRAGGING = true;

                        eventful.dispatch("dragstart", e);

                        //正在发生拖拽
                    } else {

                        eventful.dispatch("dragging", e);
                    }
                }
                MOUSE_POS = mousePos;
                return false;
            },
            mousewheel: function (e) {
                eventful.dispatch("mousewheel", e);
                e.preventDefault();
                return false
            },
            DOMMouseScroll: function (e) {
                e.wheelDelta = -120 * e.detail;
                return this.mousewheel(e);
            }
        }, function (callback, eventName) {
            canvas.addEventListener(eventName, callback, false)
        });
    }

    /**
     * Base64解码
     * @param e
     * @param t
     * @returns {ArrayBuffer}
     */
    function base64Decode(e, t) {
        for (var r = atob(e), n = r.length, o = new ArrayBuffer(n), a = new Uint8Array(o), i = 0; n > i; ++i) {
            a[i] = r.charCodeAt(i);
        }
        return t ? new t(o) : o
    }

    /**
     * 着色器的Program
     * @param name
     * @param context
     * @constructor
     */
    function Program(name, context) {
        this.gl = context;
        this.name = name;
        this.program = null;
        this.attribs = {};
        this.uniforms = {};
        this.enabledMask = 0;
        this.maxEnabledIndex = -1;
    }

    Program.prototype = {
        constructor: Program,
        /**
         *
         * @param program
         * @returns {Program}
         */
        setProgram: function (program) {
            var self = this,
                context = self.gl;

            self.program = program;

            var attributes = context.getProgramParameter(program, context.ACTIVE_ATTRIBUTES);

            for (var i = 0; attributes > i; ++i) {
                var attribute = context.getActiveAttrib(program, i);
                self.attribs[attribute.name] = {
                    index: context.getAttribLocation(program, attribute.name),
                    name: attribute.name,
                    size: attribute.size,
                    type: attribute.type
                }
            }

            var a = 0,
                uniforms = context.getProgramParameter(program, context.ACTIVE_UNIFORMS);

            for (var i = 0; uniforms > i; ++i) {
                var uniform = context.getActiveUniform(program, i);
                this.uniforms[uniform.name] = {
                    location: context.getUniformLocation(program, uniform.name),
                    name: uniform.name,
                    size: uniform.size,
                    type: uniform.type,
                    texUnit: function () {
                        if (uniform.type == context.SAMPLER_2D || uniform.type == context.SAMPLER_CUBE) {
                            var t = a;
                            a += uniform.size;
                            return t
                        }
                        return -1
                    }()
                }
            }
            return this;
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
                this.maxEnabledIndex = Math.max(this.maxEnabledIndex, e);
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
     * 颜色转vec3颜色
     * @param style
     * @returns {Vector3}
     */
    function color2Vec3(style) {
        var m,
            colors = vec3.create();

        if (m = /^\#([A-Fa-f0-9]+)$/.exec(style)) {

            // hex color

            var hex = m[1];
            var size = hex.length;

            if (size === 3) {

                // #ff0
                vec3.set(colors,
                    parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255,
                    parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255,
                    parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255
                );

            } else if (size === 6) {

                // #ff0000
                vec3.set(colors,
                    parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255,
                    parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255,
                    parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255
                );
            }
        } else if (isArray(style)) {
            vec3.set(colors, style[0] / 255, style[1] / 255, style[2] / 255);
        }

        return colors;
    }

    function lerp(e, t, r) {
        return (1 - r) * e + r * t
    }

    /**
     * 非线性增加
     * @param e
     * @returns {number}
     */
    function smoothstep(e) {
        return 3 * e * e - 2 * e * e * e
    }

    /**
     * 获取当前时间戳
     * @returns {number}
     */
    function timeNow() {
        return .001 * Date.now();
    }

    /**
     * 现在一个值在一个范围内
     * @param x
     * @param min
     * @param max
     * @returns {*}
     */
    function clamp(x, min, max) {

        return ( x < min ) ? min : ( ( x > max ) ? max : x );
    }

    /**
     * 获取范围随机数
     * @param min
     * @param max
     * @returns {*}
     */
    function range(min, max) {

        return Math.round(MATH_RANDOM() * (max - min)) + min;
    }

    /**
     * 计算地球的平面模式投影坐标
     * @param target
     * @param coord
     */
    function project_mercator(target, coord) {
        var o = coord[0],
            a = coord[1],
            i = MATH_PI * a / 180,
            u = 90 / MATH_PI * MATH.log(MATH.tan(.25 * MATH_PI + .5 * i));
        target[0] = -o / 180;
        target[1] = clamp(u / 90, -1, 1);
        target[2] = -1 * coord[2];
        vec3.scale(target, target, 10)
    }

    /**
     * 计算地球的3D模式投影坐标
     * @param target
     * @param coord
     */
    function project_ecef(target, coord) {
        var o = deg2rad(coord[0]),
            a = deg2rad(coord[1]),
            i = 1 * coord[2],
            u = MATH_COS(a),
            c = MATH_SIN(a),
            l = 1,
            s = 1;
        target[0] = -(l + i) * u * MATH_COS(o);
        target[2] = (l + i) * u * MATH_SIN(o);
        target[1] = (s + i) * c;
        vec3.scale(target, target, 10)
    }

    function deg2rad(deg) {
        return MATH_PI * deg / 180
    }

    var vec2 = {
        create: function () {
            var vector = new FLOAT32_ARRAY(2);
            vector[0] = 0;
            vector[1] = 0;
            return vector
        },
        clone: function (target) {
            var vector = new FLOAT32_ARRAY(2);
            vector[0] = target[0];
            vector[1] = target[1];
            return vector;
        },
        fromValues: function (e, t) {
            var vector = new FLOAT32_ARRAY(2);
            vector[0] = e;
            vector[1] = t;
            return vector
        },
        fromArray: function (array) {
            var vector = vec2.create();
            vector[0] = array[0];
            vector[1] = array[1];
            return vector;
        },
        copy: function (vector, target) {
            vector[0] = target[0];
            vector[1] = target[1];
            return vector
        },
        set: function (vector, x, y) {
            vector[0] = x;
            vector[1] = y;
            return vector
        },
        add: function (vector, v1, v2) {
            vector[0] = v1[0] + v2[0];
            vector[1] = v1[1] + v2[1];
            return vector
        },
        subtract: function (vector, v1, v2) {
            vector[0] = v1[0] - v2[0];
            vector[1] = v1[1] - v2[1];
            return vector
        },
        multiply: function (vector, v1, v2) {
            vector[0] = v1[0] * v2[0];
            vector[1] = v1[1] * v2[1];
            return vector
        },
        divide: function (vector, v1, v2) {
            vector[0] = v1[0] / v2[0];
            vector[1] = v1[1] / v2[1];
            return vector
        },
        min: function (vector, v1, v2) {
            vector[0] = MATH_MIN(v1[0], v2[0]);
            vector[1] = MATH_MIN(v1[1], v2[1]);
            return vector
        },
        max: function (vector, v1, v2) {
            vector[0] = MATH_MAX(v1[0], v2[0]);
            vector[1] = MATH_MAX(v1[1], v2[1]);
            return vector
        },
        scale: function (vector, v1, v2) {
            vector[0] = v1[0] * v2;
            vector[1] = v1[1] * v2;
            return vector
        },
        distance: function (vector, v) {
            var r = v[0] - vector[0],
                n = v[1] - vector[1];

            return MATH_SQRT(r * r + n * n)
        },
        length: function (vector) {

            return MATH_SQRT(vector[0] * vector[0] + vector[1] * vector[1])
        },
        negate: function (vector, v) {
            vector[0] = -v[0];
            vector[1] = -v[1];
            return vector
        },
        normalize: function (e, t) {
            var r = t[0],
                n = t[1],
                o = r * r + n * n;
            if (o > 0) {
                o = 1 / MATH_SQRT(o);
                e[0] = t[0] * o;
                e[1] = t[1] * o
            }

            return e
        },
        dot: function (e, t) {
            return e[0] * t[0] + e[1] * t[1]
        },
        cross: function (e, t, r) {
            var n = t[0] * r[1] - t[1] * r[0];
            e[0] = e[1] = 0;
            e[2] = n;
            return e
        },
        lerp: function (e, t, r, n) {
            var o = t[0], a = t[1];
            e[0] = o + n * (r[0] - o);
            e[1] = a + n * (r[1] - a);
            return e
        },
        random: function (e, t) {
            t = t || 1;
            var r = 2 * n() * MATH_PI;
            e[0] = MATH_COS(r) * t;
            e[1] = MATH_SIN(r) * t;
            return e
        },
        transformMat4: function (e, t, r) {
            var n = t[0], o = t[1];
            e[0] = r[0] * n + r[4] * o + r[12];
            e[1] = r[1] * n + r[5] * o + r[13];
            return e
        },
        forEach: function (t, r, n, o, a, i) {
            var u, c;
            for (r || (r = 2), n || (n = 0), c = o ? MATH_MIN(o * r + n, t.length) : t.length, u = n; c > u; u += r) {
                e[0] = t[u], e[1] = t[u + 1], a(e, e, i), t[u] = e[0], t[u + 1] = e[1];
            }
            return t
        },
        load: function (e, t, r) {
            e[0] = t[r + 0];
            e[1] = t[r + 1]
        }
    };
    var vec3 = {
        create: function () {
            var vector = new FLOAT32_ARRAY(3);
            vector[0] = 0;
            vector[1] = 0;
            vector[2] = 0;
            return vector
        },
        clone: function (target) {
            var vector = new FLOAT32_ARRAY(3);
            vector[0] = target[0];
            vector[1] = target[1];
            vector[2] = target[2];
            return vector
        },
        fromValues: function (x, y, z) {
            var vector = new FLOAT32_ARRAY(3);
            vector[0] = x;
            vector[1] = y;
            vector[2] = z;
            return vector
        },
        fromArray: function (array) {
            var vector = vec3.create();
            vector[0] = array[0];
            vector[1] = array[1];
            vector[2] = array[2];
            return vector;
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
        multiply: function (e, t, r) {
            return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e[2] = t[2] * r[2], e
        },
        divide: function (e, t, r) {
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
        length: function (e) {
            var t = e[0], r = e[1], n = e[2];
            return MATH_SQRT(t * t + r * r + n * n)
        },
        negate: function (e, t) {
            return e[0] = -t[0], e[1] = -t[1], e[2] = -t[2], e
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
            var n = t[0],
                o = t[1],
                a = t[2],
                i = r[3] * n + r[7] * o + r[11] * a + r[15];

            i = i || 1;
            e[0] = (r[0] * n + r[4] * o + r[8] * a + r[12]) / i;
            e[1] = (r[1] * n + r[5] * o + r[9] * a + r[13]) / i;
            e[2] = (r[2] * n + r[6] * o + r[10] * a + r[14]) / i;

            return e
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
        }
    };
    var vec4 = {
        create: function () {
            var e = new FLOAT32_ARRAY(4);
            return e[0] = 0, e[1] = 0, e[2] = 0, e[3] = 0, e
        },
        clone: function (e) {
            var t = new FLOAT32_ARRAY(4);
            return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t
        },
        fromValues: function (e, t, n, o) {
            var a = new FLOAT32_ARRAY(4);
            return a[0] = e, a[1] = t, a[2] = n, a[3] = o, a
        },
        fromArray: function (array) {
            var vector = vec4.create();
            vector[0] = array[0];
            vector[1] = array[1];
            vector[2] = array[2];
            vector[3] = array[3];
            return vector;
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
        multiply: function (e, t, r) {
            return e[0] = t[0] * r[0], e[1] = t[1] * r[1], e[2] = t[2] * r[2], e[3] = t[3] * r[3], e
        },
        divide: function (e, t, r) {
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
        length: function (e) {
            var t = e[0], r = e[1], n = e[2], o = e[3];
            return MATH_SQRT(t * t + r * r + n * n + o * o)
        },
        negate: function (e, t) {
            return e[0] = -t[0], e[1] = -t[1], e[2] = -t[2], e[3] = -t[3], e
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
        forEach: function (t, r, n, o, a, i) {
            var u, c;
            for (r || (r = 4), n || (n = 0), c = o ? MATH_MIN(o * r + n, t.length) : t.length, u = n; c > u; u += r) {
                e[0] = t[u], e[1] = t[u + 1], e[2] = t[u + 2], e[3] = t[u + 3], a(e, e, i), t[u] = e[0], t[u + 1] = e[1], t[u + 2] = e[2], t[u + 3] = e[3];
            }
            return t
        }
    };
    var mat3 = {
        create: function () {
            var e = new FLOAT32_ARRAY(9);
            return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 1, e[5] = 0, e[6] = 0, e[7] = 0, e[8] = 1, e
        },
        clone: function (e) {
            var t = new FLOAT32_ARRAY(9);
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
        multiply: function (e, t, r) {
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
        }
    };
    var mat4 = {
        create: function () {
            var e = new FLOAT32_ARRAY(16);
            return e[0] = 1, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = 1, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = 1, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, e
        },
        clone: function (e) {
            var t = new FLOAT32_ARRAY(16);
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
        multiply: function (e, t, r) {
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
        perspective: function (e, t, r, n, o) {
            var a = 1 / MATH.tan(t / 2), i = 1 / (n - o);
            return e[0] = a / r, e[1] = 0, e[2] = 0, e[3] = 0, e[4] = 0, e[5] = a, e[6] = 0, e[7] = 0, e[8] = 0, e[9] = 0, e[10] = (o + n) * i, e[11] = -1, e[12] = 0, e[13] = 0, e[14] = 2 * o * n * i, e[15] = 0, e
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

    var geoMetry = window.geoMetry = {
        "faces": base64Decode("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Tg0GDQgNRwohCjIKsg+kD6wPzw7YDtMOzw7dDtgOzw7jDt0OkgpHCugK5wsDDLkLsQ6hDr0OKw1SDQ8NYA1SDSsNUg1gDacNDw7uDQUOdw9HDzAPpw6/DrcODg8YDxoPDg8dDxgPVw6RDl8OfQz4C04Mlw+bD5wPzAkICUoJkg+ED48PZQ9pD1IPMA8zDzIPmQ+TD6EPqgteC30LXwteC/gLAwyBDAsMgQwDDLkMUg8iD0oP6AocC/YKBg0TDf4MTg0TDQYNfQzyC/gLDg8gDx0PDg8jDyAP1Q18DdwN2ww1DRwNBA8ODwsPHA5iDj4Ozw7qDuMODw7cDe4N7Q70Du8Omw+ZD58Pog2GDYkNIw8fDygPDg8fDyMPpAqSCugK6AoyChwL+Q4ED/4ODg8ED/QOHw8OD/QOEw1ODfIO/gm4ChoKmQ+SD5MPaQ+ED1IPlg4qDqAOeg4qDpYOYg4qDnoOKg5iDtUN1Q0cDhEOKg7VDQ8OXg6hDnQOKw4iDloORQ4rDloO8Q0iDisO8Q0bDiIO3A33DfENTg2GDfIOgQyzDKIMgQy5DLMMxgy5DOMLhg2iDbUO6g70Du0Ozw70DuoO2wxLDTUN2wxTDUsNzAlqCuAJVgu4ClsL4wtWC8YM9A7PDh8PsQ93D7IP8gzPDK4Mlw+YD5sPhA+SD1IPVgtbCzEMXwvyCzkMHw+nDjUPpgwyDZQMGw5IDToOhg3SDvIOoQ6xDqcNoA93Dx8Pmg+gDx8PXg4sDvgNdA4sDl4OsQ6zDqINog2nDbEOhg21DtIOUg+SDyIPIg9oDzQO8g4iDxMNlw+aDx8PdA6hDm8OJw6hDqcN8gwBDbYOzg7SDtAO0g61DtAORwoyCugKVgscC9AKsgzyDK4MAQnMCeAJvw6nDh8PxA7BDgwNxA6YD8EOmA+XD8EOng1+DfIMng2RDn4NkQ5XDn4NNQ+2DpcPNQ+eDbYOng3yDLYOhgq/Cv4JhgovC78KLwtfC78KWg1+DVcOWg3PDH4NzwzyDH4NKA28DH0MKA1TDbwMUw3bDLwMSA0yDaYMSA33DTIN9w3cDTINGgrQCjIKGgq4CtAKuApWC9AK4AmGCv4J4AlqCoYKagoJC4YKWwu/Cl8LWwu4Cr8KuAr+Cb8KMQw5DNsMMQxbCzkMWwtfCzkMOQy8DNsMOQzyC7wM8gt9DLwMlAwoDX0MlAwyDSgNMg3cDSgNOg5aDVcOOg5IDVoNSA2mDFoNNA7EDgwNNA5oD8QOaA+ZD8QOtg7BDpcPtg4BDcEOAQ0MDcEOIg+SD2gPDA0TDTQOMQzbDMYMOg5XDiUOAQ3yDO0MagrMCWkKkQ6nDl8O8gtfC/gL9w0bDvENUw3cDUsNzwymDK4MmA+ZD5sPlw8fDzUPHAsyCtAK/gkBCeAJOhcyFywX5Rc6FxUX0hflFxUX7xflF/4X5xbFFsMW/BfvFxwYxRbSFqkW5xbSFsUWFxe9FtIWFRfSFucWFxfSFhUXERcXFxgXGBcXFzoXFxcVFzoX5BfZF+cXchfZF+QXMhc6F3IXchc6F9kX2Rc6F+UXARjZF/wX/BfZF+8X2RflF+8XhAWMBX8FfwVpBYQFbAWHBWUFaQVlBYcFhAVpBYcFjAWDBX8FPRs6G0gbEx/5HgofEyQVJAokth64HsAeniTKJIMkqSMnJAEkEST1I/4jGyIhIjsiQh8/Hy8fCwAKAAgA7RrxGvsaLCIkIjQiIRreGSgaZBdhF1AXDxb+FfoVVRpMGogaCyYKJgIm3Bj4GPsYgSWEJXwlGQAVABwAtR+cH/4fFCUCJf0kPyUCJUAlAhqIGeQZ9CLYIuIiSSVAJUElHxz9G2kc5CBcIHUg8CL8IrcishfUF8kXzRrtGrgahxmfGagZgSWPJYQluRhLGCoYjRY0Fg8WtRvdG9QbJyQkJAEkEgAPABEAQSVAJQIlayNRIyUjABr6GdMZ7RzeHP8c0hy8HN4cdCVtJXwlnxmUGbEZDgAaABUA7hsXHP0bLxo0Gi4aWhuZG5UbqBmfGdEZdiC3IN8gch2aHcQdIiYjJh4mHRsfGyYbPRsnGzobHRsFGx8bWxtkG2sbWxtVG2QbJxsxGzYbVRtQG1cbJxsYGzEbMhs+Gy4bBBsUG+wa9RsJHAwcUBs9G08bIRsbGwIbFBshG/oaGxsyGwEbIRsyGxsb6BruGtYa7hroGgUbIRsUGxgbGBsdGy8bGBsFGx0b7hoEG8MapxsJHPUbpxuDGwkcpxt9G4MbWxuDG3AbBRsEG+4aGBsEGwUbJxshGxgbPRshGycbPRsyGyEbPRs+GzIbUBs+Gz0bVRs+G1AbWxs+G1UbcBs3Gz4bWxtwGz4bVyVfJT8lXCRbJEck1Rk0GTEZ7h34HfsdpCH8IZEhJSMuI/wiQhkfGRMZ+iQDJQUlYRxYHEEcIQApACgA3h75HhMf+R7eHroegR6NHnselB6NHoEexh65HtEefh53HnQe+R66Hg8fiR66Hp0exh6dHrkenR6UHokelB6BHokeiR6BHn4egR5jHncefh6BHncexxeSF8YXbyN3I1wj3SPuI9YjMSQVJBMkUiQVJDEkVyObI28jxyOgI6gj4yMVJFIkCSQVJO4joCN3I5sj7iMCJAkkDiSoIywkAiSoIw4kdyNvI5sj3SPHI6gj7iPdIwIkAiTdI6gjZx5eHm8eYR5vHlAedh5uHlMebh52Hm8e0B6hHrYeth6hHrgeuB6hHoseix6hHm8ebh5hHksebx5hHm4ebSSeJIMkeCRtJIMkESQEJPUjEiTxIxwkEiQQJAckQCQZJCokGyQUJB0kHCQQJBIkBSQZJO8jKiQZJBskJiQgJCUkFyQgJCYkFyQRJCAkDCQRJBckDCQEJBEkDCT2IwQkFCT2IwwkFCQFJPYjFCQbJAUkGiInIh4isSGiIZ4hsSHXIaIhBSLXIeIhISIeIioiiSHiIbEh4iEaIgUiBSIbIiUiBSIhIhsiGiIeIgUiHiIhIgUiEBovGi4aAwACAAQA+x34HXoeDAAPAAoAPx9SH14fNh9CHyofQh9SHz8foB95H1IfBR+gH1IfHh8FHzYfBR9SHzYfUh9CHzYf5hq4Gu0aOCMuIyUjIQAiACQABwAEAAIADQAPABAAEwASABEAGwAdACAAHgAfACMAGQAYABYAHgAcAB8AIgAeACUAIQAeACIALgAwADMALgAoACkAMAApAC8ALgApADAAKQAhACwAHQAhACgAHgAhABkAFwAbABQAGAAbABcAGAAdABsAGQAdABgAHgAZABwADAAOABUAFQAaABwAEQAMABUADwAMABEACQAMAAsA0BykHLwcCwAMAAoADQAKAA8ABgAKAA0ABAAFAAMABQAKAAYAWSK3Ii4j5xzFHMcc4R25HSgeiRqGGoIaiRqWGoYa2BrNGrsatxqWGokatxqsGpYazRq3Gr0a9BrtGgYbERvvGjAb8RrvGhEbrBq3GrQaGRvzGvwa/BrzGvQaxhrYGr4atBq4GpUa/Br0GhIbrBq0GqAa7xrGGrwa7xrYGsYa8RrYGu8a8RrNGtgatxrNGrQa8xrmGvQatBrNGrga9BrmGu0aPSJNIjYiNCKHIk0iLCI9IiYiNCJNIj0iLCI0Ij0iMxooGkcaPBqIGkwa9hkhGkwaIRooGjMaIRozGjwaTBohGjwaXhpVGogaQBpVGl4aaRpAGl4a3h65Hroe6BoHGwUbZCVFJUIlwh/nHx4gtRvUG7MbkB2LHfodnB+pH/4fbBxaHMAcWBxtHHsc4Rh8GGoYNRmIGT0ZKRsLG04b8hzVHO4cmyWrJZ4lOxlxGSAZwSLLItMiChjeF+IXrSOII88jQh0/HTUdTSVRJWEleRl8GYUZtCO+I6QjayN9I2gjMRk0GSUZLSUyJTYlRSRDJEwkGR8OH/8eWyRcJGAk0BzaHMscShtMG1MbeBt0G2IbxxzFHL0cNBk3GScZhiOBI3oj3BjZGMQYOCNRI1QjLho0Gk0amyWPJY0lIyYiJiUmzhvJG80bwhrEGtIaeht3G4EbNRokGjsaNRoCGiQafhh4GIUYGyYaJiAmFyYaJhsmYxhmGFYYAx/6HgwfyRfGF54Xzh68Htoe/hccGO8XPRgcGP4XiBeNF4AXcB2BHY0dlhmHGagZ0BzSHNocUyBgIHIgQiBgIFMgZiVdJVAl2RjcGPsYXyVXJWAldxuAG4cbYRdzF1MXTiJcIjwi8SDzIPsg5xzyHPccaCNlI2EjXyBMIF4g2xvMG8UbgSV/JYMlgSV6JX8leBhiGHcYSSVRJU0lABoOGjEaABrcGQ4aCBkJGe0Y6SLfItciHhgqGEEYRSBMIF8gPiBMIEUgQBxBHDYcCyP0IuIizhvKG8kbzhvXG8ob4R34HccddR1tHXsdnx2aHY8dBRr1GQcaCCUOJRYlCh0RHfkc5CDfIOsgiCOtI48jICUTJRAlICUdJRMlpySiJLgk1CLBItMiURxWHEscVhxRHG4czyPEI+gjexyZHKYcNBovGjca0STVJN0k5SPPI+AjQhlkGSoZ8hznHMcc7hvXG84bFxvgGv8a5SOtI88jliWiJaQliRx3HIYcaRx3HIkcxBqzGs8afBmUGYoZTB1CHTMdACPpIuciWx9OH1Af1Rn3Ge0ZvyWrJbUlbRtdG3wbFxzuG/wbnhhmGGMY0hzQHLwcDBopGhgavBykHJMcYiB1IGQgfxxuHHgc7hj2GOoY7hgIGfYYuxeyF8kXqyLDIrcieiVrJXYl+RfUF8MX9ST6JAUlxCPDI84jvSW8JbEl1xvbG9AbYx11HZIdYx1tHXUdIhouGkMa9xkuGiIajReSF30X+xwMHf0cGR0MHfscIBkAGf4YIBkSGQAZIBksGRIZnxypHJwcwhypHLIcYiVdJWYlVCVdJWIlVCVKJV0lUSVKJVQleB2BHXAdQBxhHEEcTiJ9Ilwizh6EHrweGSFEIT8hGSHxIEQhxheNF4gX7CTxJPQkSiVBJU4lrxy8HKIc7hvbG9cbLSUrJTIl+hkAGgoaPSUUJUMlcxdtF2kXSSVKJVElJSAXIAcgwhqzGsQa7CTnJPEkdiRmJGkkaCR2JGokYhwfHGkc7STnJOwkARnzGPoYdiBiIE0gdiB1IGIg4xnVGesZ0R2/HcIdYhh8GIMYDiUcJR4lXxtAG1YbKRs8G0obAx34HOUcSiJ9Ik4iThlUGVcZThkzGVQZThkLGTMZuRgLGU4ZuRgCGAsZAhi5GCoYgBt+G5Mbdxt+G4AbdxttG34b7RzSHN4cDiUbJRwlbSV6JYElhiKKIpAikCKKIoAiiiJ9IoAihiSiJKckbiSiJIYkayOHI4sj5hieGKcY6SIAI/4iXRtsG3IbXRtfG2wbXRtAG18b4Bn6GfMZqRlxGYwZmRxtHJUcexxtHJkc4B3JHdYdHSUSJQ0l9ST9JPgk/ST1JAUlESUFJRkluhqUGpsaZBl8GXkZQhl8GWQZch1MHUgd+B3uHcodJCYhJiMmTB0/HUId8B/nH+YfeBupG3Qb4BrdGt4a8x3pHeYd8h3gHekdchdkF10X5BeoF3IXYhyMHIgcYhxpHIwc1xm0GeIZvxm0GdcZjh2YHYgdzyTfJM0k4yTfJM8k5yTfJOMk7STfJOckqRuuG7EbsCDRIPEgDyMnIxcjgR9/H7QfYh9/H4EflBqEGn8aARjnF9kXoiS1JMMkFCUFJREldxxpHBccdxtdG20bdxtAG10bWht4G1kbCRkgGQQZCBkgGQkZSiJJIhgi6hypHMIcQBsXGy0b2Rj7GAMZbR1jHRsdZSNqI3UjaCNqI2UjHBgBGPwX/SQCJfwkTCA+ICUgkB2YHY4dbRxYHHMcdxx7HIMcWSVLJWUlZCVLJVkl9yQAJQglChgeGCsY/Bj7GPgY/BgfGfsYRx0fHT0d2xvuG/0blh1sHX0ddxsXG0Ab4hfHF8YXUBg4GD0Yexx3HBccQiA/IGAgTx83HykftSTGJNEkrBzIHLAcSiVJJUElcxfLF20XYRfLF3MXwh+FH1sfBSUDJQcllh1GHWwd7STYJN8krCTYJMwkXCRFJGIkRSRcJEckNCU5JTgluyK1IroiyxeHF4UXBRoQGi4axR3jHc0dviPbI5kjtCPbI74jlhm/GXsZlhm0Gb8ZlhmoGbQZ3RmoGdEZGx3tHP8cHiYaJiImFyYPJhomKSBCIEMgfx+2H+Efch0/HUwdIyDnH/AfSyDnHyMgChgqGB4Y4hwKHd8cGx0KHeIcGx0RHQodoB76HgMfOxkOGTIZyBzyHMccrBzVHMgc9RngGQYaPCVVJTsliiWOJYIl3BkAGtMZqyW/JcQlKSUbJQolHyYOJhYm1RjuGNAYKSA/IEIgsB2nHawd4B2zHckdAhjJFzkYPyDsH20gKSDsHz8gth/sHykgth/WH+wfth+cH9Yffx+cH7YfSiIYIt8hhiO0I4Ej7h3jHcUd7h30HeMd9B3uHfsdzh59HoQe9x59Hs4e4Bq6Gt0aCyM5IzsjbhxFHFYcWh4nHjYeWh7+HSceSiLfIdYhxhfJFwIYFSYSJhcm8SUEJgcmFxu6GuAauhoXG3obARjkF+cXHBgAGAEY0xv0G/AbGSGwIPEgGSG6ILAgoBuSG5cbDh9PH/IeGR9PHw4f5BoLG/IaAhg5GEwYfyR2JGgkfyRmJHYkeh5rHmYeAx1GHfgcCyYCJgwm5hhmGJ4Y9B37He8dxheSF40X4hfGFwIYVyVAJVslSyUgJRolSyUdJSAlZCU+JUslPSVBJQIlFCU9JQIlBSUUJf0kQhllGXwZuyKxIrUiuyKoIrEiuyLFIqgiySLFIrsi0yLFIski0yLLIsUieBuuG6kbChgCGCoYvCXJJbolKCYJJg4mGR0GHQQdtRuqG7QbZBebF2EX5BfVF6gXyxfVF08Y9x6eHn0ecBpIGjUaRRqNGjIatyJZIlgiFyJZIrMiFxxYHHscQRxYHBccfyDnH0sgfSJKIoAigCJKIoki3hyvHKgcqRxuHH8cqRxFHG4c6hyrHKkcwyLwIrciDhnVGMkYDhnuGNUYDhkIGe4YOxkIGQ4ZCBk7GSAZIBlxGSwZ3hcKGC4YAhgKGOIXxiXCJb0lbiSTJKIkiCPEI88jwyPEI2sjDyMtIycj0yLfItQi3yLpItQiTBs8G2AbPx1yHcQdWhuVG3gbBRr3GfUZ0SM0JHwkORh4GH4YORhiGHgYfBhiGPkXoB6lHnoe0RuuG88bjyWbJYolRRqRGo0aDyP+Ii0jhxf5F2AXyxfjF4cX+RfjF2oY/xwMHRsd2yM0JNEjtCM0JNsjDyb5JRMm8SXiJQQmGR14HW0dFyAsIDQgJSAsIBcgTCAlIE8gkRpFGngaUSM4IyUj3yDkIHUglBq6GhobLiO3IvwiPx3EHesdmh3hHcQdnx25HZod5hiqGGYYoB7PHvoeAhpIGr4Z4iLGIu0ieyM5I6Mj1RkxGXEZqRngGXEZsxp4GqEa1RngGfUZpiWiJZclviWuJaUlyhrCGt8aeB2LHYEdGR1VHXgdfyReJGYkrCSwJKYkTx9/H2IfNx9PH2IfTx+cH38fGR9ZH08fnB9ZH0ofayOII4cjnyR0JKMk4RjkGO8YTyAPIG4gTh+FH3Qf9x4hH0of6hwxHQQdGR1bHVUdDCUSJRgleyOVI4YjMCR0JD0kDiUAJQYlqRnTGfoZ4BmpGfoZ4BnVGXEZNBnVGTcZNxnVGTUZzBv9G8Ib2xv9G8wbFxwPHEEc+RsPHBcc9BsPHPkb0xsPHPQbDiYJJgom3SXNJeUlzSN+I8kjehuSG2YbBQAGAAMAYyNrI2gjUSNrI2MjayV6JW0llh3+HZMdQCVXJT8lFxt3G3obXyVrJT8lYx0RHRsdNiQ0JEMkCyPtImQj/yQEJQolNRk9GRsZYh8nHzcfkB2XHZgdWhtUG2YbDxzTG8sbRyReJH8kXiRHJFskJSC1H08gSSHDIDAhKSYfJhwmDiYfJigmviXQJcMlrByQHNMc0iXIJcQlNCVSJTklkhrCGsoanhrCGpIanhqzGsIakRqzGp4a5BrRGsAa0RmxGTAa1STGJMEkDBrpGU4alBpbGoQacyVVJXcl0iXiJcglNCVFJVIlJyO9IyUjtCPcI/gj7ST2JOgk0xvPG64bUBiqGKkYQhmQGWUZtRvYG90bbSFHIVshdSB2IN8gLiN+I/8ixiKJInoivSPDIyUjwyNrIyUjpCHgIfwhLiP/IrMiUCSEJF0kUCRJJD0knx2XHQIeNiRFJEckNiRDJEUkQyQIJDckeyO3I5UjAyS3I+YjoB56HkgeTyBuIGcg+B3hHXoeGR/PHgcfoB5IHrse9x5kHp4ediDDILcgRRxaHC0cARkiGfMYRRopGm0aIQAdABkAviWlJbAl0SDzIPEgSSF5IVshGSQFJBskPiAsICUglBoaG8AaxCOII2sjCSb4Jf8lURxyHG4cdh6LHm8eDB0ZHRsdLhr3GQUaFSTjI+4jFBsEGxgb1RnjGTUZoR5nHm8eISYeJiMmGR1tHRsdNCS0IwgkYhg5GPkXSSIpIhgiuh65Hp0e3SXJJc0lqCOgI5sj6SL+ItQipR5rHnoeGSQcJO8jvyXXJdIl9xnVGfUZ+Rc5GNQX1yGxIeIh8SPvIxwkliWGJYklayVtJT8lbBw/HD0c4iTcJMwktSSTJKskoBuqG4UbaRz9GxccJCIwIjQifSNqI2gjLSO9Iycjgxt9G3AbACMtI/4iGiYPJiImHSU+JSQlHyYpJigmvByvHN4c9yTuJPsk5hquGrgaeh7nHfsdyRfUFzkYHBg4GI4YfyC6IHogNBY8FjYWjRaOFjwWjRY8FjQW9xWNFg8WJRYSFicW/hUSFiUW/hUPFhIWEhYPFjQWzRrxGu0aMRksGXEZoCNyI3cj5BcAGFkY5Bk1GeMZAib/JfElAiYKJv8lCiYJJv8lfCWAJXQlfCWEJYAlhCWKJYAl1BsTHA8c1BvdGxMc3RsiHBMclRuzG64blRuZG7MbmRu1G7MbkSHWIW0hkSH8IdYh/CFKItYhExnwGOYYExkfGfAYHxn8GPAYKB4CHloeKB65HQIeuR2fHQIeQiUwJSklQiVFJTAlRSU0JTAlsxvLG64bsxvUG8sb1BsPHMsb/h8PIE8g/h+pHw8gqR/CHw8gwByrHOocwBxaHKscWhxFHKscPRmQGUIZPRmIGZAZiBkCGpAZThs1G3obThsLGzUbCxvkGjUb7hzTHOoc7hzVHNMc1RysHNMcNiU3JTolNiUyJTclMiUzJTclMiUsJTMlMiUrJSwlKyUpJSwlwh20Hbcdwh2/HbQdvx2wHbQdHiUvJTElHiUcJS8lHCUtJS8lHCUrJS0lHCUbJSslGyUpJSslchuGG4kbchtsG4YbbBuEG4Yb1h2/HdEd1h3JHb8dyR2wHb8d5h3bHdkd5h3pHdsd6R3gHdsd/R3yHfMdPR0YHTAdPR0fHRgdHx0DHRgdfR1WHWAdfR1sHVYdbB1HHVYdbB0fHUcdbB1GHR8dRh0DHR8dzCToJOIkzCTYJOgk2CTtJOgkgiWJJXklgiWOJYkljiWWJYklCiUGJf8kCiUbJQYlGyUOJQYlrB2hHagdrB2nHaEdpx2WHaEdyR2nHbAdyR2zHacdsx2WHacdNh7yHf0dNh4nHvIdJx7gHfIdJx6zHeAdJx7+HbMd/h2WHbMdByYSJhUmByYEJhImBCYPJhIm+BwxHeoc+BxGHTEdRh2WHTEdDCYGJhQmDCYCJgYmAibxJQYmBB3uHOocBB0GHe4cBh3yHO4cqBebF2QXqBfVF5sX1RfLF5sXTxhZGOEYTxjVF1kY1RfkF1kYYBtOG3obYBs8G04bPBspG04bahhPGOEYahjjF08Y4xfLF08YBCb5JQ8mBCbiJfkl4iXSJfklvhkBGpQZvhlIGgEaSBpwGgEaoyNkI80joyM5I2QjOSMLI2QjoRptGpQaoRp4Gm0aeBpFGm0alyWOJYollyWiJY4loiWWJY4lpSWXJYolpSWuJZclriWmJZclpiSrJJ8kpiSwJKsksCS1JKskSh8HH/ceSh9ZHwcfWR8ZHwcf7xjwGPwY7xjkGPAY5BjmGPAYbiAeIH8gbiAPIB4gDyDCHx4gdB+pH5wfdB+FH6kfhR/CH6kfSh90H5wfSh8hH3QfIR9OH3QfBB1bHRkdBB0xHVsdMR2WHVsdVR2THYsdVR1bHZMdWx2WHZMdGCUkJSklGCUSJSQlEiUdJSQlPSSEJFAkPSR0JIQkdCSfJIQkBiX7JP8kBiUAJfskACX3JPsk5SXUJfEl5SXNJdQlzSXGJdQlZhuFG1obZhuSG4UbkhugG4Ubkx35HYsdkx3+Hfkd/h1aHvkdZCM9I80jZCPtIj0j7SLGIj0jCiUYJSklCiUEJRglBCUMJRglGxkiGQEZGxk9GSIZPRlCGSIZZhtgG3obZhtUG2AbVBtMG2AbMCG5IBkhMCHDILkgwyB2ILkgwyXUJcYlwyXQJdQl0CXxJdQl0xzAHOoc0xyQHMAckBxsHMAcxCWwJaslxCXIJbAlyCW+JbAlOSVaJTwlOSVSJVolUiV5JVolwBqhGpQawBrRGqEa0RqzGqEaMBoBGnAaMBqxGQEasRmUGQEawSSwJKwkwSTGJLAkxiS1JLAkThowGnAaThrpGTAa6RnRGTAahBpOGnAahBpbGk4aWxoMGk4adyVaJXkldyVVJVolVSU8JVolyCXQJb4lyCXiJdAl4iXxJdAlUiVvJXklUiVFJW8lRSVkJW8l+CMWJDAk+CPcIxYk3CMDJBYk6CTzJOIk6CT2JPMk9iT/JPMkqRjkGOEYqRiqGOQYqhjmGOQYZRm+GZQZZRmQGb4ZkBkCGr4Z3RsZHCIc3RvYGxkc2BsUHBkcWyEtIUkhWyFHIS0hRyEPIS0h/yI9I8Yi/yJ+Iz0jfiPNIz0jeiI1IhcieiKJIjUiiSJKIjUi/CE1Ikoi/CHgITUi4CEXIjUisyJ6IhcisyL/Inoi/yLGInoiXSSKJG4kXSSEJIokhCSfJIokPSQ3JDAkPSRJJDckSSRDJDckAh76HVoeAh6XHfodlx2QHfodNyT4IzAkNyQIJPgjCCS0I/gjlSPcI7QjlSO3I9wjtyMDJNwj5iOjI80j5iO3I6MjtyN7I6MjZyB6IHYgZyBuIHogbiB/IHogBx+7HvceBx/PHrsezx6gHrseux5kHvceux5IHmQeSB7hHWQenh4oHloenh5kHigeZB7hHSgetyAtIQ8htyDDIC0hwyBJIS0hLRw9HBQcLRxaHD0cWhxsHD0c8xgTGeYY8xgiGRMZIhlCGRMZbRpbGpQabRopGlsaKRoMGlsasCWeJaslsCWlJZ4lpSWKJZ4lWyGRIW0hWyF5IZEheSGkIZEhwBo1G+QawBoaGzUbGht6GzUb/yXlJfEl/yX4JeUl+CXdJeUlzSXCJcYlzSXJJcIlySW8JcIliSV3JXkliSWGJXclhiVzJXclPRwZHBQcPRw/HBkcPxwiHBkczCTBJKwkzCTcJMEk3CTVJMEkqySKJJ8kqySTJIokkyRuJIokhRuZG1obhRuqG5kbqhu1G5kbJCVCJSklJCU+JUIlPiVkJUIl+yTzJP8k+yTuJPMk7iTiJPMkjhipGOEYjhg4GKkYOBhQGKkYeiC5IHYgeiC6ILkguiAZIbkgWRiOGOEYWRgAGI4YABgcGI4YTyC1H/4fiBk1GeQZjyWKJYQlbSWBJXwl0RmfGbEZtyAPId8g5x9/IB4gix35Hfod+R1aHvodfBj5F2oYiiWbJZ4loiWmJaQlKRpFGhgaqRyfHLIc8xjmGPoYPBtMG0ob+BzqHOUcXxuEG2wbEiUMJQ0lqBdkF3IXhBpwGn8aACUOJQglHxlCGfsYOBgcGD0YxiTVJNEkhR9OH1sf2CSsJN8kOSU8JTgl1RzyHMgcVSVzJTslvyXSJcQlOSN7Izsj3yFtIdYhEiYPJhcmABjkFwEY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EQEPARIBPwBAAEIAWQBcAGYAbwFwAW0BwAC8AL8AVAA+AFcAiQGIAY4BcwBsAHUAwAG0AbABuAG0AcABcABrAGkAbABrAHAAbABqAGsAQwE+AToBTgFJAUcBUgBJAEoAVgBaAE8AUgFRAVABxgDHAMsAkgGQAYsBCQEIAQABCgEIAQkBrQCbAKgAlAGRAYwBpwClAKAAIwEnAS8BMAExAS4BiQGBAYcBlgGYAZkBtACsAK8AMwExATABUQFJAU4BwADCAL0APQBZADYATQBGAEsAggBzAHgAcwCCAIgADwEKAQsByADTAMwAVwBjAF8AnACPAI4AhQB7AHIAaABnAGAASQFFAUEBbAFoAWsBBwEMAQYBCAEMAQcBDwEIAQoBegBdAGIAqwCaAKIA8ADSAPkAhQCEAIoAsQGqAa8BkQGSAYoBlAGSAZEBGQEdASMBVAFVAVcBBQHwAPsAkwB8AIcAogCmAKkAmwCLAH0AmwCJAIsAfgCJAIcAqwC3AKoAvwC3ALEAPgEzATUBVAFRAVIBPQA8AG4AVwFWAVEBtgDHAMYAHQEmASMBkgBuAHEAfgCHAHkAXgB2AGMApwC2AKUA0gDUANcAxADUAMIA+gD3AP4APQBcAFkAXAA9AG4AZABcAG4AjwB6AHcAmQGbAZYBqgGbAZkBlAGbAZoBZAFdAVkBZAFhAV0BUQBOAFIAhQCKAHsA9wABAQQBwgC1ALIAwgCtALUAZQA6AF0AVQFYAVcBWgBvAFgAVgBvAFoAVQBvAFYAsQDDAL8AqQCsALQAgQF3AX8BiQF3AYEBZwBSAEgAXgFgAVsBhwCtAJMAcgFsAXABbAFyAXQBaAFsAXQBJwEpAS0BSQBMAEcAUgBMAEkAUQBSAFMAPwA7AEAAYQFkAWUBuAG+AaoBlACRAJ0ARQFDATsBRQE+AUMBSQE+AUUBUQE+AUkB0wD6APwAtgDIAMcAyAC2AJwAPgExATMBXQA5ADgAegBlAF0AZQB6AIAAZwBvAFUA0wD3APoAogCpAKsAkAGSAZoBkgBkAG4AkgCWAGQAlwCWAJIADwERAQwBEQEVAQwBFQEZAQwBUQFUAVcBtAGxAacBuAGxAbQBuAGqAbEBXgBjAFcAhwBoAHQAhwBnAGgAUwBnAFUAlgCeAIoAlwCeAJYAmACeAJcAgACfAKEAgACjAJ8AjgGQAZoBdAGJAY4BdAF3AYkBJwEjASYBIAEZASMBIAEjASIBGgEgASIBGgEiATEBbACIAGoAcwCIAGwAlACIAIwAlACdAIgAVgFTAVEBQwBGADsAPgFPATEBowCAAI8AGgExAR4BZgFoAXQBZgFnAWgBZgFpAWcBZAFmAWUBXgFbAWEBZQCAAIMATwEeATEBwwDEAL8ARABGAE0ATQBTAEQA8ADCANIA8AAFAdMAwgDwAJgAAQH3AAUBdgB0AGMAqQCxAKsA7ADlAOoAuAfYB9AHfABvAIcAXwJKAk0CRgBEADsAUAgyCBkIOwJAAooCDAEIAQ8BUwBVAEQAnwTNAxkETwE+AVEBAQQ3BD8EpgCsAKkAvwDEAMAAvAC6AL8AQgq3CVwKnwkBCtsJIghSCOMHZQFeAWEBmAiFCFIIlgq0CrEK2AfsB9AHhACWAIoArQDCAJgAWAFbAVcBOwA/AEMAXgf3B+MH9AcUCA0IBQH3ANMAngDwANMAngCYAPAABwQ+BDcEvQawBq4GfAJ4Am4CbQIrAlsCTQJKAjwCWwhSCDcIBgjuB/4HEwrkCQwKGwgNCCQIXwRZBHAEPwQ3BEQEcQJpAmwCIQgZCAkIVgZoBmkG5Qf8B9YHkAaIBowGNAZWBlAGdgKFAnsCNwQ+BEMEQgqxCrIKsQpCClwKSwdHB04HXgdtB1IHxwOkA7YDbApnCm4KFggoCCAIYgJ1AmgCwAmrCcgJ3grhCvAK3grICuEKsQrICt4KLQghCB8IDwmlCKAI8AfMBwUI8AfXB8wHGQgiCAEIPgQHBFAEAQQHBDcEhwKFAnYCagVgBVgFZgVgBWoFAAb+Be4F6QcWCBMIyAq0CsYKnwSqBKQE7gfQBwcIPwUdBTsFDQUdBTMFSgoTChkKXAoTCkoK1AfuBwYI1AfQB+4HmQaRBrAGXAJLAk8CSwJAAjcCbApcCmcKTQVgBWYFtAqWCpoK7Af0Bw0Iwga9BrQG2Aa9BsIGgwpcCmwKMwVQBU8FFggPCCgI6QcPCBYI6QfYBw8IxwOfA6QDXgfjB20HaAarBpYGWQQ/BE0EhAJ9AoMC9wfwBwAI9wfXB/AHCgjUBwIISgb+BQAGeAiNCFIITQU/BWAFGgctB9gGdwhbCFcIUghbCHEIbQJbAm8C4gK9AsQChQJ/AnoChQKOAn8ChwKOAoUC1QMBBD8EAQf8BhMHZwJzAl0CZwJ3AnMC7AcNCBcI3ge4BwQI1ge4B94HigKEAogCkgkPCYkJQAI7Ai8CUAVLBVkFSwVQBT8FpwmfCdsJOwJYAkQClAdoB5EH2Ae4B9YHaAaXBqsGUAgtCBgIUAghCC0IIQhQCBkIdwJxAnQCZwJxAncCrwKUApMCSgbSBf4FSwU/BU0FGgfzBucGGgfYBvMG/wa9Bi0HZwJpAnEC7AfYB+kHlAKHAoYClAKOAocCrwKOApQCaAZ+BpcG/AbSBgIHtwlVCMAJaAdRB1AHuAeUB5cH/wTUBNUEDQXUBP8E/wawBr0G/waZBrAG+waZBv8GxwOFA58DuAdoB5QHaAe4B9AHZwJfAmkCWwJfAmcCXwJbAkoCZAMnA2UDZAMDAycDkwVkBYoFMggiCBkIpgiYCJQIhQiYCKYIQAJLAooCWAI7AooCGgXuBOsEWgUjBoEF0wTABLME1ATABNME1ATBBMAEqASiBKcEpQSiBKgEkAaTBogGmQaTBpAG+waTBpkGYwaTBt4GMwUDBQ0FJAUaBVoFAwPiAuEC4gKvAr0C4gKOAq8C1QM/BF8EgwqWCrEKXAqDCrEKZAPiAgMDWAKOAn4CtwkTClwKtwnkCRMKtwnACeQJ4welCFUIPgJDAkEC+gkBCvAJ2wkBCvoJxQfUBwoIxQfQB9QHnwTkAyEEfQJcAmgChAJcAn0CVgZ+BmgGNAZ+BlYGUggiCDIIQgJDAj4CQgJFAkMCWAJFAkICWAJNAkUCWAJlAl8CWgU0BiMGWgV+BjQGWgUaBa4FfgauBbwFdgSgBHoETQJYAl8C9wciCOMH1QOtA8cDxQfXB14HCQcGBxUHcQh4CFIIFwgbCDgI0AfsBxcIaAfQB48GUQdoB48GSwf8BgEHRwdLBwEHpQR6BKIEpQRfBHoEZQJYAn4CjgJYAooC0gWbBZIF0gWxBZsFnwRrAngC1QMjBDAEpQhSCIUIkwX/BfIFnwR4AnwCvQSqBDAEGgX3BCMFSwdRB48G/AZLB74GkwWxBf8F4gJkAxgDGgXrBPcEpQTBBK0EPgBeAFcA3gYGBwkH3gb7BgYH3gbSBmMGYwbSBkoGjwbFB14H2wmrCacJpwmrCZIJVQilCA8J9wdeB9cH0gVsBjkGwAMZBNEDWwIrAkoCvgGaAaoBZAFpAWYBUAUzBT8FJgEpAScB/AfYB9YH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2B3lHd0d2B3xHeUdVB9EH00fYCFFIXQhQiFFIWAhCyFFIUIhCyEfIUUhdCBvIGEgoh6XHpgeJSMXIycj/CIXIyUjDyMXI/Ai1CIPI/AivR3OHcAd6B/GH8QfRiE7IW8hRiEQITshKyEQIUYhECErIQUhzRzZHNYcIx0XHRQdwxzPHL8cyhzPHMMc9CAfIQshFx0QHQ0dxB6wHr4eJiECIRsh5h71HvQeaSGGIVYhvR3fHc4dASHLIOkg/SD2IAYh9yD2IP0g7yD2IPcgzBy3HKcczBzNHLcczBzZHM0cyyKoIsUiqCLLIp0iNR5DHkYeFR4tHjUeWSIXIlgi7yDwIPYgByH8IBchByHvIPwgAiHvIAchth2kHasd4iDbINwg4xwJHewcMyFIISYhAh3cHOAcGh0WHRMdGh0jHRYdIx0aHV8d7h/GH+gfIyEkIUAhnSKEIpcinSJlIoQiSiA7IEYgXx5JHk4efCBvIHQgnx9nH3sfaCCgIIYg6B7WHtseXiFTIV0hJCFTIV4hJCE5IVMh6x7DHvQePyGkIXkh7yDnIPAgQB06HWUdhR5JHl8eHCAJIBIgyhzRHM8c3BzRHMoc9B7KHsIeQB1lHUodSx1/HW8d0RzMHM4c2RzMHOMcbyB8IKwgBSEkISMhOyAcIDYgOyAJIBwgQR8xHzQfsCC+IM4gzBzRHOMcVSEBITEh5yDbIOIg7yDbIOcgBx7aHfAdvR3sHd8dvR0EHuwd9B4IH0Qf6x70HlQfzSCsINkgOSECISYhJCECITkhSR4yHj4eTiBVIFggTiBKIFUgTiA7IEogxB6vHrAeoCDAIK0gEyHAIFUhpB2MHZkdzSBvIKwgqCKdIrEiwSKPIp0iHyHyICgh9CDyIB8hxh+sH6IfAiEkIe8gkx/YH98fCSA7IF0ghR5cHkkebh0jHV8dbh1BHSMdcR6VHpkecR6sHpUeRR5zHnEezCETIoYh0B22HcEdQyJVIksiFx1BHSQdzCFpIVQhzCGGIWkhGh7aHQceAh0JHeMcNB0dHRwdrB6bHqYe6iDyIPQgyCDyIOogxB61Hq8eoCBoIMsgxh/uHxUg2h22HdAdth3aHaQdMh7qHdodWCKrIrciWCLDIqsi8SD7IEQh7yDNINsg7yBvIM0gMh4aHioeNB1LHUMdyyABIaAgbyAFIV0gfx2bHYAdfx3cHaIdBB69HQoefx1LHdwdVB9nH/EeRCHDIaQhwyJYIosiTiBjIGYgBCDbH+ofziDgINEg8yDgIAoh+yDzIAohRCH7ICohRCEqIcMhBCDYH9sfbyDvIAUhBx0QHRwdMh5cHm0eWCK1IUsikx89H0cfJh/jHtwekx9HH5gf8iB9IEcgxB7HHjofrR61HuQeoh6nHtwexB46HwEfyyAdIMggPCAdIMsgEyFSIaUhEyFVIVIhZiBXIE4gSx00Hb4dyyLBIp0i0RzcHOMcOh1LHWUdGh1THV8dOyBXIF0gYyBlIGYg4CDzINEgFyLgIVgiZx+fH/EeWB1xHTQdWB2MHXEdjB2kHXEdhh1+HYIdhh2FHX4dhR13HX4d9h09HkUe9h3qHT0e6h0yHj0esCG1IVgisCEOIbUhDiETIbUhPR5zHkUePR5tHnMebR6sHnMetR2iHb0dtR2bHaIdmx1/HaIdFSBHIMYfFSCpIEcgqSDyIEcgcR2+HTQdcR32Hb4d9h1FHr4dXyKLIlgiXyKPIosijyLBIosinh2GHYIdnh2gHYYdoB2JHYYd3R3tHeId3R3lHe0d5R3zHe0d5R33HfMd5R3xHfcd8R0AHvcdwB3PHcMdwB3OHc8dzh3YHc8dzh3xHdgdzh3fHfEd3x0AHvEd3x0NHgAe3x3sHQ0e7B0VHg0e7B0tHhUe7B0EHi0eBB5DHi0eSyJfIlgiSyJVIl8iVSJlIl8iJB1YHTQdJB1BHVgdQR1uHVgdHB0IHQcdHB0dHQgdHR0JHQgdph6XHqIeph6bHpcemx6FHpcegB2eHYIdgB2bHZ4dmx2tHZ4doh0KHr0doh3cHQoe3B1FHgoeQx4EHgoe6h+sH8Yf6h/bH6wf2x+fH6wfwyGwIVgiwyEqIbAhKiEKIbAh2x+YH58f2x/YH5gf2B+TH5gfHB0kHTQdHB0QHSQdEB0XHSQdbR6bHqwebR5cHpseXB6FHpseSyKlIUMiSyK1IaUhtSETIaUhRx/WHugeRx89H9YePR/NHtYe3B6mHqIe3B7jHqYe4x6sHqYemB9IH58fmB9HH0gfRx/oHkgfRyDqH8YfRyB9IOoffSAEIOofOh89H5MfOh/HHj0fxx7NHj0f5B4BHyYf5B61HgEftR7EHgEf3B7kHiYf3B6nHuQepx6tHuQeAR9cHyYfAR86H1wfOh+TH1wfpSHYIUMipSFSIdghUiGGIdghXSAFIakghiETItghSB/oHvEe8iDIIH0gAh0HHQgdGSE/ITAh9x0AHv0dVSJDImgilx6FHpgeEB0HHQ0dLR5DHjUe1h7NHtseSSE/IXkhKB1AHUodZR1LHW8djB1uHZkdjyJlIp0irB+fH6If2B8EIN8fXB4yHkkeQR0XHSMdcx6sHnEetR6tHq8e7h9dIBUg6h2kHdodSx1FHtwdwyFYIqQhwSLDIosi+yAKISohVSGGIVIhRR5LHb4d4CGkIVgiRR5DHgoekBOCE3oTxxMfFJITOBTWFHcUwRTHFOMUxxTpFOMU+RT4FOoU/xS6FHcUsBTKFPkUHxTHE2QU1hQ4FB8UyhSwFLoUkhOCE5AT+RTKFBIV3RTBFOMUyxMfFPwTkhMfFMsTxxOQE5YTLhXiFCQVJhXiFC4V7xTiFCYV7xSUFOIU/xTWFAoV1hT/FHcUlBTvFGQUOBR3FFIUHxRkFO8U6hSwFPkU3BPHE80THhTHE9wTZBTHEx4U1hQfFO8U+BTjFOkU+BTpFOoUsBR3FLoUkBPHE5ITUAo3CuMJJwkuCSAJ9ghICSwJ1wrvCqkKjgpdCvQJ4AhLCWoJrgm7CaIJeQldCRsJeglpCVAJ/AjgCGoJqQqOCvQJggiTCI8I4Ai3CEsJdAmcCa4JtwihCKgI9QjwCDkJfQprCtIJvwj1CEsJeglQCUwJfwgpCFkIuwlsCYwJMwq9CbIJLgoDCjcK6QjTCBAJCglQCWkJ6QnzCeIJ0wntCdQJNwrtCdMJ6QkVCvMJFQpACgcKFQozCkAKZgouCjcK7QkDCtUJNwoDCu0JUApmCjcKUAplCmYKRQplClAKZQpFCmQK6glkCbgJtgnqCekJ6QnqCRUKFQrqCTMKsglhCjMK6gm4Cb0JMwrqCb0JMwphCkUKYQpkCkUKNAnwCNIItwioCL8IuAhyCH0I/QhHCVIJFQkyCSgJ7wjyCA0JaApbCocK/AjXCMwImgiuCIMIMAkbCewInQioCG0I0wjpCL4I4AjGCMIIuAiRCM0IqgjLCKwIwQjWCIgI+QjZCLsICgnZCPkIYAl2CZoJIwk6CRYJQwljCXAJQAlMCRcJGwkjCQIJLgkJCQsJLgkmCQkJUAkKCTEJEQkFCSkJ7gjdCNQIFQkQCTIJNgksCVkJrQjACIEI/AgdCdcI3wj/COEIHQn/CN8IHQkiCf8IlgibCHkIaglLCW8JuAiWCHII6QgVCQYJOQk0CVMJ2QiiCLIIBwnzCN4IBQnzCAcJtAi5CK8IFQnpCBAJEQnzCAUJ4Aj8CMYIyQmgCdYJ8wgSCdAIVgpdCnUKhwhZCFMIcgmdCagJcglgCZ0JtAiZCKEIpAiPCJMIswitCH4ICgmiCNkICgn0CKIIkQjACM0IngjSCGgIygkKCpsJOglECRoJzwiuCJoI1gjBCP0IoAmQCboJ7gkQChIK7gnJCRAKcgl5CRsJpwidCGIIvwidCKcIvwioCJ0IawrXCqkKfwiCCI8IfwhuCIII9AgKCWkJrgizCGYIzwizCK4IzwitCLMIzwjACK0IXgl6CUwJswmICfYJuAibCJYIdglqCX8JJwn2CCwJ7wjiCPIIIwkbCV0J8Aj1CMcIVgpJCv8JEgnTCMMIyQnuCY4J4gqpCu8K0glrCtkJmwjSCJ4IuAjSCJsI0gi4CDQJ8QjvCDUJ8QjiCO8IHQn8CGoJagl2CR0J9Aj7CMkI+wj0CJAJjgn7CMkJmwl8CcoJbgh/CFkITAlACV4JYAlyCTAJ4gjdCO4I3QjLCKoI4gjLCN0I8QjLCOIIaAp9CtIJEQkSCfMIHwkSCREJuAjNCDQJ/wnXCVYKtAihCLkIOgkjCV0JMAkiCWAJ9AldCtcJ2Qn0CcQJzwjWCP0IJwr/CSgKCgr2CZsJWwpoCtIJGwpbCrMJ9AhpCX4JEgkQCdMIHwkQCRIJHwk9CRAJjAk9CR8JPwk9CWwJRwn9CPEIoQiACIcI9AnZCakKRAk6CV0JWwrSCbMJ+wk7CnQK+wm7CTsKbAm7CfsJ9gkbCrMJkAmgCfsI9Ah+CZAJnAljCUMJnAl0CWMJogl0Ca4Jogm7CYwJLAkuCScJNgkuCSwJNgkmCS4JNgmMCSYJogmMCTYJiAmbCfYJ+wigCckJPwlHCfEIzQjPCP0IzQjACM8INAk5CfAISwn1CDkJhwioCKEIfAmOCcoJLAgpCDwIWQgpCCwIdglgCR0J7gnKCY4JXglECV0JSwm3CL8IQAlECV4JSQooCv8JawqpCtkJXQpWCtcJIgkdCWAJwQjxCP0IbAlHCT8JwQjLCPEIPQmMCWwJmQiACKEIMAlyCRsJWQiHCIAIbghZCIAIUwNcA1cDBQ0NDfUM7gryCvwKzQbWBsUGxgTQBN8EWwNeA2YD4AHrAd8BIgIhAggC2QPWA84DQwVKBWcFFgQPBCwE+AUCBgsGMwhFCFQIqwyRDKoMLwQdBDEEogWeBZQFfQNiA3ADKwM3AzkDqgKpAqwCLgQnBBwE+AYoB/oG9gP6A/8DlAOmA5kD3gTdBMQElgZJB+0GJQoGCiQKZgJZAlcCkAV9BZoFNgInAiAC+gH3AfIBhguIC6ILigyaDJ8MOwtACykLOQU8BUUFFA0SDSQNNQwzDDwMUgJJAkYCPQ0zDVQN7gbtBhcHgAN8A4EDOgdnB0oHrge8B6MHvAeyB5sHSQdnBzoHMAIzAj8CWAs9CycLqgegB5gHqgfHB6AH0AzZDNYMmgylDKwMtws9C1gL+QT6BAUFsge2B4YH5wHhAd0B2wHUAdYBeAN5A3ED9QHqAeUBXARsBHsE5QX8BQ4GfAR1BGQETAtgC4wLZgJWAmECwwHGAbkBuAbtBu4GjwaXBoYGbguIC4YLfwuIC24LpAGtAawB5ge8B64HFwagBp4GgAt/C1UL7QvdCwQMkgezB4gHBgrmCQ4KpgGlAaABsgTFBMsEHQIlAhUCbAR3BHgEugy7DM0MZwthC0cLJQIoAhYCcwxwDHgM9ATlBPsEAgo0CiYKjwOSA4wDvQWrBdwFwQHDAbYBHAITAhACJwITAhwCIwwNDCoM/QT0BAwFOQp/CnwKOQo1Cn8KDQo1CjkKaQZQBlYGxgHHAb8BBQILAgMCAgoLCjQKfASDBHUEtgezB5IHkAVeBX0FUQJSAj0CoQGjAZ8BsAq5Cq8K/AH6AfgBJwY1BgkG9QH+AeoBMA09DVANGAssCzULDAIPAgICvgvCC+kL2gTSBOIEUAYjBjQGngSUBIYEngS4BJQEswHBAbUB7wHiAeYBMA0zDT0NjQypDLUMGgxGDGcMAQb5BRMGPwZOBkIG2Qu3C9wLEwIPAgwCcQRrBGME6AuxC4MLxwfmB7kHTgWrBacFoAuKC5ILgwRxBGEESQI1AkcCMgw+DFYMoAa4BsoG7QZJBykHOg0mDVcNYQuAC1MLZwuAC2EL9wHhAecBNgwaDEgMbQxFDF4MxQTkBM0E/gTkBPAEnAtpC7QLEwINAg8CJwINAhMCdAyKDJYMcgZYBlUGsgu8C78LiAuyC7oLQAU5BUkFoQGiAaMB6QHeAdoB2ATqBO0EcQRtBGsE2QzHDBgN0AzHDNkMFgwyDFcMgQR/BJgEWAeiBzgHvAHIAb0ByAG8AcsBOAtpC3wLrwaSBt0G4wHVAdIBsgGuAckBZwd3B1kHsAkWCiIK7wHzAeIB7wH8AfMBCwqwCR4KdwSBBJEEdwR/BIEEdwRuBH8EbARuBHcEKwQfBBMEFwUtBTIFUQluCYUJvAu+C9MLfwuyC4gLgAuyC38LugosCxgL2QTPBLoEaQNZA24DWQNpA1wD/ATvBAsFLgI2AiwCHgYIBi0GlQGdAZMB5QTaBPIEMAveChULMAuxCt4KMAuyCrEKgAu8C7ILVQi3CZgJtgdsCLMHJwbtBR4GeQNyA2oDFgolCkEKFgoGCiUKegavBtkGegaSBq8GlAqrCp8KkgS8BH0EGQWLBbcFGQVABYsFpQyZDLAMmgyZDKUMOQuPCzALVQhtB+MH4ASDBHwECg35DOoM6wsNDCMMCg0UDfkMCg0SDRQNewF2AXMBkgbOBt8GkgZyBs4GkgZYBnIGWAaSBjUGPgxgDGgM/QTlBPQEigyZDJoMvgG6AcUBngGiAaEBLQQfBCsEOwQfBC0EdgF5AXEBeQF2AXoBHgQqBBIEXAxwDHMM6gQABRUF7gSkBL0EwgvtC/MLwgvdC+0LxAHCAbsBxQHCAcQBxwG+AcUBeAqUCp8K+ApMCxkLzwTgBMcE2QTgBM8E2wTgBNkElQGeAZ0B/gHvAewB/gH8Ae8BYgnFCFEJfAucC7YLHQs4C3wLHQv4CjgLjAr4Ch0LVAKJAmQC1AHQAdEBTAM6A1MD+ApgC0wLgwOKA4IDBAL9AegBngTbBLgELAY8BjsGcweqB3QH4geqB3MHDQwzDDUMAwIEAgACXgeXBo8GXgerBpcGlgarBlIHAgqwCQsK5wmwCQIKkwmwCecJ3QsGDBcM6gT8BAAF6gTvBPwE7wTqBOAEUwJSAlECWQJSAlMCWQJJAlICxwy0DPAMjQy0DLsMpQPIA7UDPAZiBk0GdwdYB1MHdweiB1gHvgGOAZoBKQYsBjYGbAi2B+YH/QH1AeQB/QH+AfUBBAL+Af0BfQGCAX4BbgmwCZMJ4gfHB6oH4gfmB8cHsAq6CrkKlAq6CrAKlgZpBmgGVgFXAWIBEAtLCtUK5geyB7wHdAyZDIoMYAxcDG4MgQUkBVoFsgGoAa4BsgGXAagBzwG3AcwBXwFWAWIBmQy6DMIMmQy7DLoMsAkGChYKsAnmCQYKRgwWDFUMGgwWDEYMsgowC2AL4QHZAdgB4QHbAdkB2wHhAeMBBgzrCxUM3QvrCwYMvQViBggGqQwSDQoN6wLRAtICeAq6CpQKNQq6CngKMw06DVsNJAXuBBoFKAI0AhoCKAIwAjQCJQIwAigCJQIzAjACMwIlAh8C/QQsBQ8F+gTlBP0EewF9AXoBewGCAX0BYQZBBjUGgAWnBawFbgRsBFEExgHDAcgBOQX5BDwFOgWABX0FpwWABU4FpgGpAaUBogGpAaYBogGkAakBngGkAaIBngGtAaQBlQGtAZ4BuwzQDNIMQgZYBicGHgZCBicGTgZYBkIGQAtnCzILOwtnC0ALdAFlAWYBXgFlAWAB5gk1Cg0K1AHbAeMB6wLSAu4CXARvBDsEYQZ6BqIG0wHIAcsBdwfTB6IHDQIEAgsCDQL+AQQCDQL8Af4B/AENAvoB/AWgBhcGLAtnCzsLAQYTBvQFkgZ6BjUG5QUnBfwFEAu3DKkMUQmwCW4J7wQXBTgFLQUXBdsE2gTlBPkEmQyNDLsMcgODA2wDeQODA3IDigODA48DjwOhA6IDVALDAokCewGDAYIB0AHUAeMBPgxcDGAMawJmAmECUQlsCOYHFgw+DDIMMw0ZDSYNuAagBoEFUwNZA1wDsgGAAZcBVAKgAsMC8ATuBCcFEAQfBG8E7gzfDOkMUQRcBDsEQARuBFEE0AHjAc0BAwQCBAkE1QHjAdMBUwMoA1kDwgu+C4ALLAvdC2cLLAvrC90L6wssCxYMMAuSC2ALmQTbBJ4EbQeWBlIHlgZtB0kHGQU5BUAFGQX5BDkFpATuBPAEbQNUA3QDCAbHBb0FaQaWBu0G+QfmCfoHgQX8BScFdQFiAWABdAF1AWABHwIdAg4CcQSDBJIEJwIJAvoB+QfTB0sKbgRABB4EbAhRCcUItwvZC7sLVANtA2EDMwwaDDYMDQwaDDMM6wsaDA0M6wsWDBoMugoQCywLPgwWDBALGQ0SDeIMNQItAiQCNQJJAi4CSQInAjYCCAYpBjIGCAYsBikGOgUZBU4FLQMbAx4DLQUZBToFGQUtBdsE+QQZBZkE2gT5BI4E6QEUAt4BzgEUAukBDQM+A1kDmQx0DHAMFAIzAh8C+gdRCeYHpQOhA3kDXAyNDJkMcAxcDJkMPgyNDFwMjQw+DBALFwXvBNsEbgQeBLkEjgRuBLkEkguxC6ALGQ0wDTYNPQcbBz8HjQwQC6kMNQpLChALmAlLCncHSwo1CvkHyAHBAbMB0wHGAcgB0wHHAcYB9wHHAdMBgAOHA3wDgAOMA4cDvASSBIMEigOPA4wDeAOlA3kDeAPIA6UDhQGNAYABhgGNAYUBhgGVAY0BbQRxBJIEJwJJApkCZwhWCD8IIwZQBu0GgQUjBrgGbQSSBGcE6gS8BIMEYQhsCMUImAlnB1UIRgNSA1sD0gKgArICdQF0AXsBgwF0AYYBewF0AYMBrQHOAbcBxwEUAr4BVAIzAscBMwIUAscBPQuhCyQLuwuhC7cL6Au7C9kLXgwgDNkLIAzoC9kLIAygC+gLfQNwA3cDsgqMCkIKjAqYCUIK3gTEBIUE8ATFBKQExQSyBKYEZgJrAk4DZgJOA6sC/gPdA6kD+AqMCrIKvATYBJoE2AS8BOoEoAb8BYEF7wTgBNsEGQXbBJkEVALHARkCDQPXArsCvgEUAo4BzgGtAY4BGwXcBOgEIwcdBxYHiQhNCF8I7QZQBmkG8wTmBOcEiwtwC2MLjgTSBNoEQQYTBjUGSAJQAikC2QuCDF4MfgXPBcQFvAHKAcsBLgItAjUCQw0+DVYNXA1RDUkNmw2kDbENPw1BDWINKQ1BDT8Nzw2zDbANdg2BDX8Nsw3PDc0Nxw3JDdcNzQ3hDdoNkw2ZDbINBQ3uDOkMsw2hDY4NuA3JDccNuA3NDckNXw1cDTwNqQ2TDbsNgQ2TDakNmQ2UDaoNkw2UDZkNZQ12DWwNTQ1DDWQNbw1cDV8NzgzTDOkM0wwqDekMUQ1cDW8N6QwqDQUNdg2TDYENlA2TDZENDQ0iDQMNkQ2bDdMNpA2bDY0NWQ10DUYNZw1lDWkNQQ1lDWcNjQ2FDYINhQ10DVkNbw10DYUNbw2FDY0NuA2zDc0NuA2hDbMNpA2hDbgNpA2NDaENFALOAY4Bbw2NDZENUQ1vDWUNZQ1BDVEN3gzRDNcM1wzRDN8M0QzpDN8MTQ0WDUMNKQ0+DSINZQ2RDXYNDQ0pDSINuwXOBQwGbQdVCEkH5ATFBPAEoQs9C7cLvgO4A54DEgUEBQgFXgU6BX0FWgadBk8GPAYsBggGYgY8BggGGAQIBAkExAZ0BtMGEQY3Bl8GmwuoC4UL5woCC/8KPwtOC1wLVwkrCTsJyQbXBiIHdQmHCaMJlwiVCKkI6AbvBv0GJQgrCDsIGgsuCzcLawlXCU8JJgc7BzYHDgnrCOQISQhNCGQI6gi6CLUIIwtGC0gLnwumC8MLGwcgBw8HoQqtCt8KgAqeCq4KWwmRCZ4JkQm1CZ4J2gvfC+wLrAvfC7ULLgtOCz8LlwhpCHsI3AepB6wHRwVSBUIFswqgCuYK/golCwMLwgXMBdMFPwhHCDUIfgudC54LagtsC5kLbAtyC4IL8goDCwQLzAW7BSUGNwxKDF8M0gvaC+4Lbwt+C5cLOAktCaUJ5wgtCTgJmwqVCpkKkQqVCpsKhQqVCosKbAs+C3ILags+C2wL5AfcB8gHVghnCG8ITAY9BhsGygirCOUIiQirCMoI2wetB3YHTwdaBz0HzQvwC/QL0grnCvQK2AhVCXAI6wjaCNwILQkzCVoJXQtwC5QLKwkOCSUJAgsjCwULKAsrCzQLiwqRCokKYwtwC10LOAw3DGwMAAw3DDgMjgutC1cL/AvSCykMVApMCnEKiwuWC8cLzgXFBd0FpgufC4sLwwryCu4KfgduB1QHpQpwCr0KlgW0BVMFzgW0BZYFDwsoCzELLgtjC04LKgrRCYQKzwnRCSoKIwhnCD8IPwdqB2MHPgsICxQLCAs+C0sLtQuoC5sLzgrSCukKtgq+CscKNwwBDEoM1wb1BgwHTQiJCLwIqAuVC3MLUgVjBUYFqwjnCAQJGwc9ByAHUQg+CJAIEQg+CFEIAAwBDDcMbQlXCWsJPghJCGoIngmCCYMJrQnPCQQKrQnRCc8JhwnRCa0JLwb2BdcFLwZMBvYFUgV8BWMFtwrbCuUKzgsADAUMkwq2CsIK9QboBggH1wboBvUGhwfGB4kH7wfGB4cHxgfvByMIMQgOCPUHnQfbB2UHjwptCrsK6woqCy4LuwXMBbQFRgtLC3gL0gu1C9oLPQbnBfUFswqBCqAKtAVSBUcFfAVSBcIFPQZXBucFTAZXBj0G2wdGCK0HzgsBDAAMqQduB34HPghNCEkIEQhNCD4IXwhaCJIIJgZMBi8GowqdCpwKrQqdCqMKoQqdCq0KoQqKCp0KoQpYCooKrQtaCzYL/AmBCrMKfgtqC50LbwtqC34LzQvOC/ALgwapBsMGgwaCBqkG8gcxCPYHAwgRCEMItwqhCtsKXwgxCPIHpguLC8kLlguLC2ML3QrDCu0KqArDCt0KeAedB2YHIwtLC0YLDwsrCygLRggDCFgI2wcDCEYInQcDCNsHDggxCE0IlgvNC+AL5wgzCS0JTAptCo8KCAulCgwL0Qn8CWIKZQbJBgoGZQbXBskGPwe/BmoHSwtvC3oLSwtqC28LSwsjCwgLAQz8C0AMIwsCCwgL5wqlCgILngpwCqUKLgsaC+sKzgv8CwEMzgvSC/wLtQvSC60Lxwl1Cb8JMwl1CccJMwmHCXUJngrOCtwKngrSCs4K0gqeCqUKngpPCnAKTwqeClgK8gr+CgMLbQowCrUK6wr+CvIKlgtjC1oLVwZlBvsFTAZlBlcGTAbXBmUG1wZMBoMGxgclCLsHKwglCCMIKwnrCA4JlgvOC80L1wbvBugGRwjYCBoI2AhHCGkIlQuOC2QL6wgrCdgIlQutC44LqAutC5ULtQutC6gLlgutC84LlgtaC60LJQIdAh8C8grDCusKqAq3CsMKqAqhCrcKqApYCqEK1AoPCxsLvgoPC9QKvwatBvAGTAowCm0KMApMCj0KEQgDCNwHTQgRCA4IqwiJCF8IPQc7ByYHvgorCw8LpAkrC7YKiwp3CoUKrQa/BtcG3QXhBQYG6wWCBiYGIwg/CCsIDgjkB9IHDgjcB+QHMwnnCLoIXwiSCKsITwc9Bz8HWwdPBz8H+wpNCv0KhwkzCfcI/AnRCfcJVQn3COgIEAbCBSQGfAXCBRAGzgW7BbQFGQa7BQwGwQqoCgELMAqoCsEKMApYCqgKvwY/B+8G9wi6COoIgwatBtcG5gmwCfoHqQjaCJcITwqeCbUJVwltCVUJ9wlNCvsK9wk9Ck0K/An3CYEKPQpUCpcKpQrnCtIK9wkwCj0KMAr3CVUJWAowClUJeAdPB1sH2AiXCNoIaQiXCNgIkw12DZENtAzHDLsM6wXOBd0FWwduB3gHJgYMBusFTAYmBoMGqQedB24HDggRCNwHWAqACncKlQGGAXQBPwhWCEcIVQnYCFcJtgqTCqQJkwpPCrUJnglYCoIJMwYuBiIGTAdFB1wHgwdwB6cHsgW5BaYFdQVMBXkFiwaEBqwGiwZzBoQGnAakBpQG9wXgBdEFtQanBuUGFgYcBkAGjQmhCbQJnwWOBYYFZAeFB6gHEgbwBcAFRQd/B54H4AX3BRQGnwXLBY4FwQXLBZ8FwQXiBcsFTwYzBhgG6wZ/B/4GcwZGBnwGTwYuBjMGFAdwB2QHMQYVBrgFWgZFBv0FRQZaBk8G6wftB2MI7QfrB+AHRgYWBksG+wfoB2IHRQmNCc4JdwbwBRIGFAa5BeAF5QuuC3kMtQYUB9MGEQYEBskFBAYRBl8GuQlFCegJBAbIBcoFBAZfBsgFxAZfBnQGpAbTBngGPQh2CL4HLwl2CIoI6QVWBaMF7QfgB04IRQZPBuoFcAadBl0G7AljCh4L4AcdCDQIOArhCQoLFgbEBRwG4AeDBx0IhQeDB+AHZAeDB4UHNwZEBl8G4QksCqcL4Qm5CSwKRQm5CS8JeQXBBXUFMAVRBSYFOgbiBRYGLgZPBpwGMwfEBtMG1gaPB3sGQgfyBlUHagbyBncGUQWNBQoFywYHB6UGMwfWBs0GMwePB9YGhAvlC/4LhAuuC+ULdwaaBvAFOAquC2MKTQfLBooGTQcHB8sGMQaNBa8FBwd5B9QGTQd5BwcHRQdMB/4GLwnsCcgIYwrsCTgKXgiNBwAJNwcZB3kHrwVRBTAFTQcVBpoGjwf7BzEH+wePB40HjQdkB3QIuQaLBv4GcwaLBnAGSAWvBTYFKwavBUgFKwYxBq8FnQZwBqcGRgZzBnAG4gXEBRYGHgg3B3kHHgh5BwsIcAY6BkYG6QUrBlYFmgYrBukFjQmKCKEJRQmKCI0J4Qk4CuwJjwczB2QHuQnhCS8JighFCS8J+wdeCD0IjQdeCPsH6AcLCHkHmgYxBisGmgZ3BvIGQgdNB/IG6AdNB0IHkwtjCoQL0wZ0BigGjQePB2QHtQadBqcGFAczB9MGFAdkBzMHCwjoB/sHLwnhCewJdgg9CIoILgacBhQG5QT6BPkEpQXgBbIFlwKQApIClgKbApwCjgS5BNIEJAWBBScFtAShBJ0EtgSXBLsEPQX2BAYFBgX2BMYExgT2BLsEiASPBIcEiwSQBIkEoQSQBIsEkASPBIgE0AS0BJsExgS0BNAExgShBLQEkAShBLsEjwSQBLsEuwSMBI8EZQF0AWAB7QUIBh4GeAVHBsYFaQucC3wLhgOIA5EDewOIA4YDCwMOAxkDXgNoA3MDMQNGA1gDRgM7A1IDWANGA1sDewNQA4gDaANQA3sDDgMjAx8D5ALeAs0C2QLcAroC7ALcAtkCCAMqA+gCUAMqAwgD3wLLAscC3wLkAssCUQ1BDSoNUgNPA2gDKgNQA08D5AILA94CDgMLA/sCKgNPAyMD9AIqA/sCKgMjA/sCIwMOA/sCPg1DDSIN+wLkAuwC5ALfAuwC3wLCAtwC7ALfAtwCFQYxBpoGnQa1BqQGiwa5BqcG9gH0AfAB+QH0AfYBCgIRAikC9AHrAeABSAIeAlUCCgIHAgECSAImAh4C3AHtAdcB7QHrAfEBKQISAgoCEgIHAgoC1wHtAfEBBwL7Af8B+QH7AfEB8QH7ARICJgJIAikCIgIyAiECvwKmAtQCowKmAr8CmgKdAp8CnQKjAqUCnQKmAqMCMgJMAiMCiwIqAkwCFwJqAiICpgKYAqICnQKYAqYCnQKaApgCmgKLApgCmAKLAmoCaANeA1IDTAIyAmoClQKYAmoCFQP2AvMCRgQ5BEgEGAQyBEEEMgQYBAkE8gP1A+cDMgQ5BEYEMgQmBDkE1gPPA8kDJgQyBAkE/APgAwMECAT8AwMEAgQDBPAD9QMJBOMDPQQmBPID8gMmBPUD9QMmBAkECQTZA78D1gP4A88DCAQDBAkEAgT4AwkE+APWA9kDCQT4A9kDFAUIBfgECAUUBR4FbQZHBm8GEgUeBT4FWARzBI0ESgVDBSgFQAcWB0EHzAYWB0AHvAYjBxYHFgfMBrwGGwUTBS4FIAVVBSgF3ATjBLAExgVwBXQFxQXhBd0FEwUSBV8FdAV4BcYFcwRTBLAEFgcdB0gHEwUbBegESgUoBVUFzAZtBrwGWwbGBUcGdAVrBVUFHgUSBQgFsASWBOgE3ASwBOgEEgUTBQQFVQRXBGkEZgRVBHQETARVBGYE7QP0A+oDOAQ8BFQE+QPbA+sD9AP7A+YDNARMBEsEwgPYA8oDTAQ0BCIEBQT5A/sDTARXBFUEQgQiBCQEPAQXBE8EPAQ4BBcEOAQFBBcEFwQFBPsDVwRCBGgETARCBFcEQgRMBCIE5QPYA8ID5QPtA9gD5QP0A+0DDwT0A+UDFgT0Aw8EFwQWBCIEFwT0AxYE6wPUA/sD9AMXBPsDwAayBscG9gbpBiUHsgbpBvYGAwbkBfMF+AXVBQIG1QXNBQIG1AWwBeQFsgaYBukGsgabBpgGwAabBrIGgAabBoEGAgbNBR0G5AUDBh0GzQXUBR0G1AXkBR0GYwMeA0oDHQaBBj4GPgaBBsAG5gfiB/oHxAXBBX4FegZhBjUGjgGVAXQBwQV5BX4FMwjxB0UIMwjqB/EH6gfKB/EHygfLB/EHQwUeBSgFvwyrDKoMngydDKcMvwyqDHEMnQxxDKgMcQydDGIMaQy/DHEMnQyeDGIMVwFgAWIBjQGXAYABSQI2Ai4CYAv4CrIKRQQvBDEEnARFBGUEMQQVBBsERQQxBGUEMQQbBGUEGwT9A2UE0QLDAtICugHCAcUBsAlRCfoHSgN1A28DVghpCEcIVwVEBREFEQImAikCiwJMAmoCuQTIA64E2ALlAsECbwU1BUQFVgJeAmECXgNbA1IDvwbvBtcGjAKRApICgwN5A48DBAIDAgsCnwtwC4sLRwNBA0AD6QIlAz4DmwbABoEG0gvOC60LbgVtBXcFiAVuBZcFtQWeBaIFoQVyBY8FjwWoBbYFoQWPBaQF0AXWBdgFwgTOBLUEbgVEBW0FBwURBewEowTJBIQE5wTJBKME4QTpBNYE5gSTBNcE1gUgBugFgATCBFoE1gW1BSAG0AW1BdYFqAW1BdAFqAWeBbUFngWoBYkFiAWeBYkFqAWPBYkFBwVXBREFyQTCBIAEyQTOBMIE5wTOBMkEzgTnBNcEygTmBPME1wRdBM4EbwViBTUF5gTXBOcEHwXzBOcEKQXzBB8FiQVvBYgFHwX1BAIFHwUCBTUFKQUfBTUFbwVEBW4FbwVuBYgF4QQRBekENQXIBOkEswO4A7sDkwN9A3cDxgO+A9ADPwNAAzUDuQK1AqcCBAP5AvUCuAO+A8YDyALWAr4C+QLWAsgC+QIKA9YCBAMKA/kC5gLwAvIC5gLlAvACBAMeAwoDqAOTA6MDtQLBAq4CuQLBArUCBQMVAyQD9gIVAwUD5gLBAuUCTQNjA1oDtAK5ArMCPwMtAx4DvALYArEC8wLYArwCngN/A4QD2ALzAvYCdwOjA5MD3wOzA+ED3wOxA7MDsQOjA7MDmAO+A54D3wvaC7ULYwNKA28D2AK5ArQCuQLYAsEC2AL2AuUCHgMVA/MCHgMbAxUD/QJKAwQDLANBA0IDQANBAywDPwNjA00DQAM/A0cDHgNjAz8DSQLXAtICfwNvA3UDswOjA54DngOjA38DfwOjA3cDfwN3A28DHgMEA0oD4wSNBLAEtwlCCpgJRAZ0Bl8GbQZbBkcG6wH0AfEBKwMTAzcD/wITA/wCQwP8AisDqwqnCp8KnAKbAqECqgKeAqkCxQK3ArYCzALJAs8CPwNNA0cDyQLGAs4CygLMAtMCxgK3AsUCtwLGAsoCygLJAswCzAXCBbQFpAK3AsoCpAKqArcCpAKeAqoClwKeAqQCkQJyAmACjAJyApECkAKMApICnAKXApYCUgRWBDYELgRbBCcElQSrBFsElQRbBFYEqQSVBFIELgQaBFYEUgSVBFYE+AZEBygHRAcVCLoHKAdEB7oH+gP3AwoE+gPcA/cDsgO3A6wD9gPcA/oD0wPcA/YD0wPDA9wD0wPFA8MDwwPFA8EDqgOgA5sDtwOuA6sDpwOyA5oDsAONA6ADsAOgA6oDsAOqA64DsAOuA7cDwQOyA6cDtwPBA8UDsAO3A8UDtwOyA8EDegOUA5kDYATeBIUErguEC2MKtQbTBqQG7wY/BxsH9AH5AfEByAN4A64Ekgi6CKsIgAqFCncK+QU1BhMGugo1ChALZwdJB1UIhwNhA3wDigtgC5ILMwm6CPcINQURBUQFEwMrA/wCjQVRBa8FoQOPA3kDkwq1CaQJTwNQA2gDMgIiAmoCbQmCCVUJOgMoA1MDxwWnBb0FtwziDKkMggaDBiYGlQi2CKkInQepBwMIqwZeB1IHDwX6BP0E9gS2BLsEWAY1BicGBQ0qDSkN7QXHBQgGEwXoBAQFYgxpDHEMrQGVAY4BOgYWBkYGQAQqBB4EsgSuBN0DTQfoB3kHoQTGBLsE6weFB+AHxwzQDLsMsQvoC6AL4QH3AeMBbQN8A2ED+QSZBI4EpAacBp0GPQgLCPsHHgTIA7kEawVKBVUFuQWyBeAF4gXBBcQFPgtqC0sLjwuSCzAL7wcnCCMIcAeDB2QHcAVrBXQFFAUoBR4FKgtaCy4LawKfBKQEJQjGByMIgAKZArICEAsWDCwLKAMNA1kD4wH3AdMBFg0iDUMNCwPkAvsCSQJZAtcCIwbtBrgGDQInAvoBTAe5Bv4G7gQkBScFWgijCJIIUgW0BcIFbARcBFEElwKSApYC5wirCLoIWgc7Bz0Hwwq3CusKuAOzA54DgAU6BU4F3QvCC2cLnAKeApcCLAUqBQ8FMw0wDRkNYwsuC1oLTApUCj0Kvgu8C4ALngqAClgK9whVCYcJYgUpBTUFNAQXBCIEwwHBAcgBMQhfCE0IGgv+CusKkgOQA4wDzAZbBm0GtgeyB+YHXgiKCD0IfwdFB/4G9wUuBhQG+wEHAhICxgLJAsoCVQn3CdEJjAOQA4cDaQNgA1wDqwW9BacF6wjYCNoIJQsNCwMLKwlXCdgIdgF7AXoBjQRzBLAEbw2RDWUNAwaBBh0GRQwgDF4MEg2pDOIMEQU1BekEJg06DTMNiwanBnAGqQfcBwMITAVzBXkF1wJZAmYC+QPrA/sDTwpYCp4JgAtnC8ILHwQ7BG8EGQ3iDCYNnQd4B24HhwlVCdEJlQqRCosKTwadBpwGTQeaBvIGzw3hDc0NDQ0FDSkNcgWJBY8F0wd3B0sKAgulCggLmw2RDY0NWApVCYIJdwdnB5gJWwQuBFYEgwTgBOoEDAbOBesFNQrmCfkHQQ0pDSoNzgHMAbcBKwu+CrYKJQOpA3gD2gJOA9oDTgOkBCkEuwLpAg0DZgKrArsCqwLaAukCjwIZAjoCjwKgAhkCoAJUAhkCOgKAAo8C9wEJAjoCCQInAoACKQT+A9oDpASmBCkEpgSyBP4DlwZ+BoYGoALSAsMCCQL3AfoBPgN4A1kDSQLSApkCoAKPArICpATFBKYEawKkBE4DTgPaAqsC3QN4A6kDxwH3ARkC1wJmArsCJQN4Az4DrgR4A90DmQLSArIC2gLaAyUD2gOpAyUD2gNOAykE6QI+Aw0DqwLpArsC2gIlA+kCGQL3AToCgAKyAo8CCQKAAjoCJwKZAoAC/gOpA9oDpgT+AykEsgTdA/4DbhRgFIMUGhUzFcIUwhScFKsUOhR1FIMUMxUsFcIU4BQsFY4V4hTIFNsUdRSrFJwUPxR1FDoUyBSUFI8UeRWjFcIVnBTCFKwUyBTiFJQUYBQqFDoUqxSKFJgUEhQ/FDoU4BTbFLQUEhQ6FCYUJBXiFNsUYBQ6FIMUSxWjFXkVLhWjFUsVjhWjFSQV6xTUFNUUGhXUFOsUqxR1FIoU4BQkFdsU1BQaFcIUJBXgFI4V1BTCFKsU1xTCFCwV4BTXFCwVgxR1FJwUoxUuFSQVvhV5FcIVlhbmFt8W1xXBFeQVFRaWFg4WjxZMFksWeRW+FQoVChXvFEsVRhcaF1UXKhcaF0YXyRaPFksWwRbfFuAWwRbJFksWSxUmFS4VSxXvFCYV7xQKFdYUKhcQFxoXlhYVFm0WKRcQFyoXAhcQFykX8xYQF+YWtxbmFpYW1xUOFtQV3xYCFwQX5BUVFg4WDhbXFeQVEBcCF+YWAhffFuYWSxV5FQoVvhXkFcEVSxYOFsEWDhaWFsEWwRaWFt8WvhXBFQoVWhRlFE0UCxdJF3sX8xa3Fo8X1BYLF3sXMxUaFUUVvhRFFesUiRd7F0kXqRelF08WXBd+F3oXrBeYF68XuhesF68XjhUzFe0VeRcaF/MWsxd5F9cXoxWOFW0WrheQF9gXqxTVFNQUvhUVFuQVmBTVFKsUCxfUFuoWbRa3FpYW1BZmFmMW7RWDFeMV3xezF9cX7RVeFYMVfheWF5gX7RVFFV4VHhcLFwwXjhRlFFoUjhSYFGgUwhUVFr4V8xfXF8EXSRceFz0XSRcLFx4XSRdcF3oXwRfXF3kXTxYXFhMWuRe6F68X1BZQFmYW1BZPFlAW8xYaFxAXoxUVFsIVFRajFW0WMxWOFSwVtxbzFuYWGhd5F1UXwRd5F/MWsBfBF48XeheJF0kXTxbUFnsXkBeuF08WwRfzFo8Xjxe3Fm0WjxdtFo4VjxeOFU8WRRXtFTMVexeQF08WiRSYFIoUvhTVFJgU1RS+FOsUrhepF08WlxePF6UXpRePF08WmBd6F34XTxaOFRcWFxaOFe0VGhXrFEUVjhS+FJgUlhevF5gXmBSJFGgUaBRlFI4UcRTRFEQUsxT1FPMU9RRfFUoVLRXzFPUUsxTRFHEU7RT1FLMU0RSzFPMUYBWQFVoVYBWJFZAVzRW/FYkVXxXNFYkVXxWJFWAVXxVgFUoVNxXzFC0VShUtFfUUdgZ1BmAG7AUHBgUGKgZZBg8GYAZ1BmYGdQaHBo4GdQaOBoUGBwYNBiEGBwbsBQ0G3gXsBQUG7wXmBdsF7wUPBuYF7wXeBQUGZgZ1BoUGMAZmBlkGZAaFBpUGKgYwBlkGBQYqBg8GhQZkBlkGZgaFBlkGDwbvBQUGugbGBqgG1QdCCCYIVAaJBlMGbAeOB8IH4QcmCCoIQgjVB6YHDgfGBroGHgcOBywHsQZTBokG5gYKBwQHGgZUBkMGzwbIBrYGQwZUBlMGzwfVB+EHwgfhB7AHHgcKBw4HtgbGBs8GjghLCEwIJghLCI4ISwgmCEgIzwbbBuAGzwbmBtsGiQa2BrEGDgfmBsYGbAcsBy8HLAdsB8IH4QfVByYIQghICCYIyAaxBrYG5gbPBsYGCgfmBg4HwgfPB+EHjgfPB8IHDgcvBywH9RfhFwYYBhjhFwwYDBjsFwcY4RfaF+wXDBjhF+wXRxlVGWYZxxgQGRwZHBnMGM0YHBlVGUcZHBlQGVUZHBkQGVAZrhi4GMcY0RioGKsY0RjKGKgYEBnKGNEYtRiuGMcYzRi1GMcYEBnHGMoYzRjHGBwZWRxVHDUcSRxMHF8cHh3XHOwcTxxIHFUcaBxdHFUcpRyjHLQcGxw7HCYcHh0JHR0dCR0eHewcuRyjHNcc4xzWHNkc7BzWHOMcZhxVHFkcaBxVHGYcoxxoHGYcTBw7HBscTBxJHDscZxxJHF8coxxmHHEcoxxxHJsc1xyjHM0c7BzXHNYc1hzXHM0cZxxfHHQcmxxnHHQcmxx0HKccmxynHLccoxybHM0cmxy3HM0cXRxPHFUcoxy5HLQcNB0eHR0d7BgaGToZiRhRGOsYaBhkGFUYaBi3GGQYiRi3GGgYUxlNGWEZSxlKGUwZiRjaGLcYiRj9GNoYWxlLGVYZTxlLGVsZShk6GUQZSBlNGVMZIxlNGUgZIxlPGU0Z/RhPGSMZiRhPGf0YTxmJGOsYUhjrGFEYSxlPGToZ6xjsGDoZShlLGToZTxnrGDoZRw01DUsN/wwODR0Nlw1HDXwNgw1HDZcNRw0dDTUNgw0dDUcN/wwaDQQNag2PDZYNag2DDY8NTA0lDR4NGg3/DB0NHQ2DDUwNTw1MDWoNTA0eDRoNTA0aDR0Ngw1qDUwNsh+oH5Ufrh+3H+MfcB+oH5sfcB9aH2Mfrh+8H6sfrh/QH7wfqB+6H7cfeB9wH3IfWh9lH1EfWh+bH2Uf0B/gH+IfgB9wH3gfhh+VH4AfgB+VH3AflR+oH3Afrh+bH6gf0B+uH+Mftx+uH6gfWh9wH5sf4x/gH9AfnAV6BZkFmQV2BZUFmQV6BXYFegVcBXYFXAVbBUEFdgVcBUEFXhZ8FkIWxBUGFs0VbBXNFV8VGRZeFkIWGRZCFgYWxBUZFgYWbBXEFc0VzRUGFuoVZxVsFV8VUCJPIkgiiCKOIkEiOSIrIjciICIyIj4iNyIgIj4iZiJ5InIiLiIvIhkiLiJGIi8iRiIuIkEiQCI4IkYiOiJAIkciRyJAImYiViJPIlAiOSJBIi0iWiJWIlsiTyI+IkIiTyI3Ij4iQCJGImYiWiKIIkEiZiJGIo0iNyJPIjkieSJmIo0iRiJBIo0iQSI5IloiKyIfIjciLiIxIkEiViJaIjkijiKNIkEiTyJWIjkiphSpFJYUEBUoFeEU4RS4FOYU5hT9FBAVuBSmFJsUphThFKkUuBThFKYUpxSiFLgUohTmFLgU5hQQFeEUEBVEFSgVRBVHFSgV/RQTFRAV+SHsIdshhCJoIpYi4SHvIQIiQyITIlci+SEDIgcilSKEIpYiOiJHIgsiAiILIlEi+SELIuwhlyKxIp0iZSJoIoQiCyICIvMhAyL5IeshaCJDIlciCyL5IQci4SHMIdkhUSJmInIiUSJHImYiDiIDIv0hByIDIg4iByI6Igsi4SETIswhEyLhIQIisSKXIpUiVyKWImgisSK6IrUisSKVIroiRyJRIgsiVyICIlEilyKEIpUiAiJXIhMiahlwGXMZgRnCGYQZjxnoGacZFRpyGhcaqhmEGcIZXRr5GXIaYRlNGYEZ+RkXGnIacxmXGXgZcxlwGZcZcBmPGZcZlxmPGacZbxp2Gn4aXRp2Gm8agRlPGVsZgRlNGU8ZdhpdGnQapxnSGbsZdhp0GoEahBlhGYEZ0hmnGegZFxrSGegZqhkVGhcachp0Gl0aFRqqGcIZ+RnSGRcaphCqELMQ1hDcEOEQ5BDhEPgQ/BD4EAMR6BABEf0QHREbEQER4RDdEPgQuxC2ELUQJxEZESgRHREZEScRHREDERkRqhC0EMQQsxCqEMQQwxDEELcQAxEdEQERwBCzEMQQ1hDkENcQuxDWELYQ3BDWELsQ5BDWEOEQGxH9EAER5BD8EOYQuRDdEL0Q6BDDEL4Q/BDkEPgQ6BDEEMMQwBDEEOgQwBDoEP0QyBDAEP0QARH8EAMRuRD4EN0QDhEQEREREBEXERERFhElETERMxEYERcRGBEzESsRFxESERQRMREzERcRFhEUEQ0RFxEUERYRFxEWETERMRElETgREREXERgRDBERERgRfBt+G20buhqbGt4afxo7GnkatRoIG7AaeRo7GiIaiRuiG6QbFBy0G/MbpRy0HKEcshqbGnkauhsBHAIcshqwGggbhRqAGnUatRqqGp0aKB06HUAdTRpDGi4aERzqG/ob7RnrGdUZqRqfGpcadx18HX4d5BkkGgIaiRt8G3IbsBqyGqcaMB1JHT0dfxycHKkcdx1oHXwdhxuBG3cbOx0yHUMdfBuTG34biRuPG3wb6hvAG8YbIhrtGfcZ2R3eHeYdwBu6G7kbhRq1GoAacxqFGmQafRqFGnManxqFGn0anxq1GoUaRRxLHFYcFBxLHC0c3hr/GuAakxuHG4Ab6xnkGeMZ6xkkGuQZ2B3dHdIdwx3PHcsdOh07HUsd1RqfGqka1Rq1Gp8aIhrrGe0ZIhokGusZ/xotGxcbqB2vHawdwx24HcAdwx2qHbgdHh00HTIdpRyCHKMceBycHH8cHh0yHTsdHh07HTodHh06HSgd1xweHSgdLRtDG0AbYB2HHX0dfxqbGpQaERzAG+obwBsRHLobJBoiGjsaRhtjG1wbSxwUHFEc0R3THdYdtx28HcIdtx2mHbwdqB2dHa8dYB10HYcdMB1iHUkddx2FHWgdOxpwGjUa3Rq6Gt4aVhtnG18beRpDGk0auhu2G7gbtRrVGggbOxp/GnAamxp/GnkaVhtDG0sbuRzXHPEcchx4HG4cURxqHHIc9xoJG9Uaqhq1GrAawhzlHOocwhzhHOUcwhz2HOEceBySHJwcURx1HGoctBugG6YbgRuXG3obhxuXG4EbkxuXG4cbiRukG48bSBxPHBEcsBu2G+wbiR1iHXodZR1PHUodLRv/GjgbMB32HPQcaByCHH4cURxeHHUcTxxdHFAcRhv/GggbsBvsG7IbshreGpsa3hqyGv8ahBtnG1wbhBufG4YbkRulG4oboBuXG5MbQxp5GiIaTxwBHBEcCRsIG9UaKB0qHfEcnxytHLIc4h3eHdcd/xqyGggbFBzYG7QbpBuyG7QbpBuiG7IbohuwG7IboRytHJ8coRy0HK0ctBy5HK0cAhxQHFEcAhwBHFAcARxPHFAcfh2AHYIdfh18HYAdfB1/HYAdPR1WHUcdPR1JHVYdSR1gHVYdfB1vHX8dfB1oHW8daB1lHW8d5h3tHfMd5h3eHe0d3h3iHe0d0h3XHdEd0h3dHdcd3R3iHdcdyx3SHdEdyx3PHdIdzx3YHdIdrB20HbAdrB2vHbQdrx23HbQdwB21Hb0dwB24HbUduB2tHbUduB2gHa0duB2qHaAdqh2JHaAdfR2hHZYdfR2HHaEdhx2oHaEdXBuKG4QbXBtjG4obYxuRG4ob1h3bHeAd1h3THdsd0x3ZHdsdwh3LHdEdwh28HcsdvB3DHcsdvB2qHcMdvB2mHaodph2JHaodrx2mHbcdrx2dHaYdnR2JHaYdhx2dHagdhx10HZ0ddB2JHZ0dSR10HWAdSR1iHXQdYh2JHXQdaB16HWUdaB2FHXodhR2JHXodSxs4G0YbSxtDGzgbQxstGzgb4RwYHQMd4Rz2HBgd9hwwHRgdahySHHgcahx1HJIcdRyfHJIcjxumG5MbjxukG6YbpBu0G6Yb7BsCHFEc7Bu2GwIcthu6GwIceh1PHWUdeh1iHU8dYh0wHU8dSh0qHSgdSh1PHSodTx0wHSod9By+HLkc9Bz2HL4c9hzCHL4cfhyhHJ8cfhyCHKEcghylHKEcdRx+HJ8cdRxeHH4cXhxoHH4cUBxeHFEcUBxdHF4cXRxoHF4cshvzG7QbshvsG/Mb7BtRHPMbXBtLG0YbXBtnG0sbZxtWG0sbhhuiG4kbhhufG6IbnxuwG6IbihufG4QbihulG58bpRuwG58b8Rz0HLkc8RwqHfQcKh0wHfQcshy+HMIcshytHL4crRy5HL4c1x3THdEd1x3eHdMd3h3ZHdMdURwUHPMbfBtdG3IbjxuTG3wbSxxFHC0cghxoHKMcQxtWG0AbZxuEG18bthuwG7gb1xwoHfEcahx4HHIc4RwDHeUckhyfHJwcoBuTG6Yb/xpGGzgbARy6GxEc2Bu1G7Qb+RgZGdgY3hjxGCYZBhkNGVwZhxp6GmIahBhvGJUYvBiEGJUYCBo9GioaPxkZGfkYYxk/GfkYjBrpGpoa2hkIGv8Zohl9GVwZBhnxGOUYRhkvGTAZehltGXUZPRpaGl8aehliGW0ZvBjoGM8Y3hi8GJUY3hjoGLwYOhoEGgMaOhrfGQQa6BjeGCYZ/hrwGukamhprGowanBnfGfEZcRp6GnsanBlpGYsZRhlpGbMZohlgGWwZ2hmiGQgaCBqiGT0aPRqiGfQZWhr0GbMZmhqPGmsa+RjoGGMZ8BqaGukaOhpXGlAaJhk8GWMZJhnxGDwZ8RgGGTwZXBlgGaIZXBkNGWAZDRkVGWAZYhpXGjoaYhp6GlcaehpxGlcaXBk8GQYZXBl9GTwZfRljGTwZMBkXGRgZMBkvGRcZLxkVGRcZAxrNGcwZAxoEGs0ZBBrOGc0ZBBq2Gc4ZBBrfGbYZ3xmcGbYZ8RlQGloa8RnfGVAa3xk6GlAaixliGXoZixlpGWIZaRlGGWIZsxnxGVoasxlpGfEZaRmcGfEZbBkvGUYZbBlgGS8ZYBkVGS8ZsxlsGUYZsxn0GWwZ9BmiGWwZaxpiGjoaaxqPGmIajxqHGmIaUBpmGloaUBpXGmYaVxpxGmYa8RjeGOUYYhlGGW0ZYxnoGCYZaxo6GowaehqHGnsaWho9GvQZuBbCFs4WyRTLFIgUFRQyFCIUORUrFToVbhWNFcMUcBWKFXQVgRWPFdgVLhQyFDkUehTsFCsVeBSIFMsUfRRIFFQU3BTDFI0VlRV+FXwVOBXmFZsVbxVkFXoVbhVvFYgVDRYUFggWjRVuFaEVnhWXFZMVahR5FEwUwhbHFtgWKxYeFkAWeBR6FGsUNRYrFkQWEBQVFCIUihWcFZgV3BQHFd4UexV+FYIVORVJFVUVeRRUFEYULhRhFDUUWRVXFUwVOBVRFSUVOBWbFVEVuxXDFbcVaBZOFnEW7BQYFToVxxaGFt0WwhaGFscWKxbmFR4WThY1FmEWwxTcFKUUfBV+FXsVkRWVFXwVQBU6FU4ViBR4FF0UgRTJFIgUMhQuFCIUmxX8FaIVbhVkFW8VehQ5FCsUUha4FsgWuxR9FFQUYRQuFDkU5hWNFagVehR4FMsUDRZSFhQW/BVSFg0Whha4FmgWSRVAFVIVVBRIFDsUeRS7FFQUORVAFUkV7BR6FMsUORR6FCsVKxU5FV0VQBU5FToVBxU4FQQV2BWXFZ4VlxXYFY8VuBaGFsIWUhb8FU4WjRXmFTgVmBVxFYoVWRV0FVcVBxXcFI0VThb8FTUWjxWFFYAVjxWHFYUVjxWBFYcVOhUrFewUORQrFWEUIhVhFCsVdRWRFXwVdRV8FXgVdRV4FYEVIhV1FWUVdBVZFXAVZRWBFdgVIhVlFWQVIhVkFXkUuxWrFcMVrRWrFbsVmBWrFa0VnBWwFZgVThZoFlIWBxWNFTgVWRUiFSsVeRRqFCIVuxRuFcMUuBZSFmgWdRWBFWUVWRUrFXAVNRabFSsWsBWrFZgVGBVNFToVcRV0FYoVahRhFCIV/BWbFTUWZBVuFbsU5hUrFpsVZBW7FHkUdhZlFlMW4xjbGPYXKRcnGDYY1RZeGJAY8BfVFsYYdhaPFskW4xjiGAoZ8Bf2F/cXZRZ7FlkW4BbJFsEWmRi3GLIYmRhkGLcYehhkGJkY/RbWFtcWRhcpFyoXVRgoGEAYsxdVF3kXexaZFm4WXhg2GFcYmRbVFpoWShhkGHoYexbVFpkWKBjtFw4Y/hb9FvAXkBhxGH8YdhZ7FmUWdhbVFnsWBBfgFt8W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RR84H2QfOB9FHzkfmh93H3wfFx8iHzkfpR+8H9kfHCFBIWwhaCFsIXYhTiFsIWghISEcIWwhTiEhIWwhJRc3FygXMxcfFzsXOhjuF3UYUhcnFzMXNhlHGW4Zgxk2GW4ZAhnMGBwZHRhUGHUYmhmgGZkZbhmSGYMZlBd3F9YXRxdEFzkXPhc4FyEXmBmlGZMZRBc+FzUXWRdNF0gX1he2F80X1hd/F7YXtRjAGK8YzRjAGLUYzBjAGM0YzBi6GMAYlRmTGaEZkhmaGZkZoxjDGLsYuhh1GJwYlRluGZMZPheUFzgXfxdvF2cXvhehF58XfxmDGYYZ7hehF74XdxdZF0wXdxdNF1kXbxmDGX8ZWRmDGW8ZNhmDGVkZkhmVGZ4ZkhluGZUZRBeUFz4X6RcdGHUYTRc3FyUXTRdHFzcXpBmgGaYZlBe+F4wXbxd3F1EXfxd3F28XdRijGDoYdxdHF00XRxeUF0QXdxeUF0cXvheUF9YX7he+F+kXbhlHGWYZmRmgGaQZgxmSGZkZNhkCGRwZwxjMGAIZzBjDGLoYoxh1GMMY7hfpF3UYdxd/F9YXdRi6GMMYpRmhGZMZHBlHGTYZ1hfpF74XoxiPGDoYbhdWF5oXUhduF2gXUhdWF24XVhdSFzMXMxc7F1YXOxckF1YXVx1eHV0dZB1nHSsdUR1XHVodRR0uHVEdRB1kHSsdTR1FHVEdKx1eHSUdPh0pHUUdNh0+HUUdTR02HUUdXh1XHSUdZx1eHSsdVx1RHSUdLh0lHVEdUBddF2QXMhddFy8XCBfpFvwWXRcyF3IX/BYyFy8X6RYIF+MWLxcIF/wWLxddF1AXzxb8FukWXBb8Fs8WXBbPFoEWXBaBFk0WXBZNFi0WLBZcFi8WXBYtFi8WXBYsFjwWvRYXFxEX/BaOFr0WvRaOFo0WLBcYFzoXMhf8FiwXLBf8FhgXGBf8FhEXERf8Fr0Wjhb8FlwWPBaOFlwWLBY2FjwWvxq2Gq8aUht/G5gbIxslG2EbXhtJG0QbfxueG6sbghuUG54bJRsJG/YaxRrBGrkaRBtJGzsbnBrHGqQawxu3G8EbvxrFGrYanhuaG50bfxuCG54b4hrQGswa9hrQGuIa2xrjGtcaoxqiGpcaohqmGpca0BrFGr8aqxu3G8MbqxuvG7cbYRteG0QbrxurG54bYRuYG44bIxs5GyIbrxueG6wbmBt/G6sbyxrTGtUa0Br2GtsaIxtEGzkbfxtSG2UbnhuUG5obYRtSG5gbLBtSGyUblxqmGqkaphrLGqkaqRrLGtUa1RrjGvca4xrbGvcaxRrQGtsaCRv3GvYaIxsJGyUbwRrFGtsapRqcGqgaxxqcGqUaxxqlGsEa2xrHGsEaRBsjG2EbUhthGyUb9xrbGvYa0xrjGtUaYxxXHFQcMhxHHBscJRwyHBsc0RzOHM8cORw7HEkcOhw5HEIcKRw5HDocJRwLHB0cHBwpHCEczhzMHKocMhwlHDEcORwpHCYcdByqHKccORwmHDscdBxfHFcc7xveG9wb7xv+G94b/hvvGxscCxzoG+sbCxz3G+gbJRz3Gwsc9xslHBscZRxjHFscnRxjHGUczxzOHJ0czhyqHJ0cqhx0HJ0cnRx0HGMcYxx0HFccEBwcHAAcHBwQHBscGxwmHBwcTBwbHEccTBxHHFcc7xv3GxscXxxMHFccKRwcHCYcEBz+GxscfBdsF1cXfBdXF0AXfBdAF4MXqheiF4MXohd8F4MXQB8yHzMfWB81H2UfpR+PH5sfPh8fHyMfFx8WHyAfyx72HisfLh9lHzUfDR8CH+Ue2R7lHgIfSR8uHygfFx8gHyIfyx74HtIeTB9AH0YfPh9AH0wfPh8yH0AfMh8+HyMfAB/2HtUeUR9JH1ofUR8uH0kfNR9YH0sfoR+lH5sfIB8rHzgfFh8GHyAfWB98H2sfWB+NH3wfWB+PH40fHx8cHyMfjx9YH2UfZR8uH1EfHx8NH+Ue7h7ZHgIfAB/7HhUf5x7LHr0e+B7LHisfHB8fH+UeFR8uH/YeZR+bH48fKx8gH/geLh81H/YeGB8cH+UeBh/4HiAfAB8VH/Yeyx7nHvYe/R7uHgIf/R4LH+4eFB8LH/0eCx8UH/seNR8rH/YeFB8VH/seaBJ4ElkSbhKBEo4ShhJ3Em8SaRJ2EogSaBJ3EngSbxJpEogSiBKGEm8SbxJoEmISbxJ3EmgSdhJuEo4SiBJ2Eo4SdhZMFo8W+BRTFggVIBUIFZoW1BVTFvgUDhZLFkwWyhS6FP8UUxZZFggVbhZZFnsWABUhFfQUWRZTFmUWIBUhFQAVIBXXFiEV1RbXFpoWUxZMFnYW1BXBFdcVwRX/FAoV+BT5FBIVmhZuFpkW3RSkFMEU3RSaFKQU3RQIFZoU1BUOFkwW/xTBFRIVEhXKFP8U4xT4FN0U3RT4FAgVbhYIFVkWEhXUFfgU1xYgFZoWmhYIFW4WTBZTFtQVwRXUFRIV9BSfFM4UFhXWEygU1RUhFf4WQxYEFq0W6hMoFNQT+xYEFtUVcxUWFSEV5hPWExYVBBZDFgcW/hbWFv0WqBZDFq0W5hMpFO0TrBPqE9QTyBO1E6cTyBPmE7UTKBQ9FJ8UIRWfFPQUKBSfFCEV1BMoFNYT1hPmE8gTKRTmExYVKRT8FCcU/BQpFBYVIRUWFSgUrRYBF/oWrRbxFgEX1RVzFSEVBBbxFq0WBBb7FvEW/hb7FtUV1xbWFiEVIRXWFv4WABv5Ggob8Br5GtwaAxvhGgwb1BrwGtwaAxsQGw0bFhsMGw4bExsMGxYbmhrwGtQamhqOGo8a1BqOGpoa4RrcGvkaEBsDGwwbEBsMGxMbABvhGvkaDBvhGgAbjhqHGo8a+gsQDPsLIQuQCs8KWgxyDJcMUgwsDFoMdQx3DFIMWgz6C3cLEAwKDPsLUgvBC+AKdgoUChEKCAz6C1oMuQuNC+AKkAqqCesJ5gghCV8JhAloCVgJ4wvBC1ILqgmBCesJPAlfCYQJ/wuzC9YL4AraCqwKCwzqCwMMqgkRCosJ+AnfCQ8KlwxyDK0MLAxSDC4MEgwbDBMMdQxaDG8MUgv2ChwLUgvgCvYKKAwsDC0MZglOCT4JTglmCYEJdwx1DIMMlQyBDKIMZQyBDJUMZQwLDIEMwQvjC+cLjwx3DJIMdwyPDFIMzwrrCT8KzwqqCo0LPAnmCF8JVgvjC1ILuAyXDMAMiQyXDLgMkAp2ChEKwQu5C+AK6guNC8QLEgwoDBsMCAwoDBIM2grgCo0LdwshC88KIQlOCYEJZQzqCwsMZQyNC+oLZwloCZYJWAloCWcJWAk8CYQJIQmBCV8JjQtlDFoMWgx1DFIMswv/C0kM+wv/C9YLEQqqCZAKFAr4CQ8KFAoPChEKdwvPCo0LKAwIDFoMKAxaDCwMZQxyDFoM+wvWC/oLjQtaDHcLewxaDJcMzwqQCusJ+gvWC3cLjwxYDFIMqgraCo0LlwyJDHsMZgnrCYEJlhuMG3MbLBxSHB0crBudG8cbwRusG+sbMRwdHFIcrBvHG+QbIxwsHOsblhu8G74bLBwjHDcclBuCG3UbVBxXHEccVBxHHDIceRtoG2kbHRwxHCUceRt1G2gbUhxKHGQcShwsHE0cixtqG24bHhzxGwccIxzxGx4cUhwsHEocYxxUHFscWxxUHDEcrBu3G68bjBuWG74brBvBG7cb6xsdHAscWxwxHFIcixt5G2ob5BvHG+cbnRusG54b6BvBG+sb8RsjHOsbZRxbHFIceRuUG3UblBt5G5obnRy/HM8cvxydHHwc6xssHB0cwxy/HHwcvhuLG4wbvhuaG4sbvhudG5obxxudG74b6xusG/EbfBxlHFIcVBwyHDEceRuLG5obnRxlHHwcghtvG3UbrBvkG/EbcRuLG24bwBm8GcYZCRrvGRwaUBm3GZgZmBluGWYZCRocGh0aEBkZGT8ZUBkQGT8ZUBk/GWMZuBnAGdAZuBm8GcAZ/BkJGhEaxBkJGvwZ7xmiGdoZtxljGcQZUBljGbcZuBm3GbwZmBm4GaUZmBm3GbgZLRorGiwaVRlQGWYZZhlQGZgZtxnEGcgZbhmYGZMZLRofGisaHBofGi0aHBoUGh8aFBocGhMa7xkTGhwaYxl9GcQZohnvGcQZxBnvGQkafRmiGcQZ8BD2EP4QKxAlEFwQVBBlEHAQ+RD2EPAQ5xDwEPUQKRAoECYQQBA/EC8QcBCAEHQQaxBiEFgQ+RDuEPcQVBBcEDUQBhH/EAkR9hD/EAYRQRBIEFQQ+RDiEO4Q/xD5EAoR9hD5EP8Q4hD5EPAQJRArEBsQahBlEEkQlBCcEJMQlBCjEJwQgBCGEIEQgBCUEIYQvBDjEL8QoxC8EKAQPxAwEC0QnRDiEKMQ4xDnEPEQ4xDwEOcQ8BDjEOIQoxCUEJ0QlBCAEJ0QcBByEIAQchBwEGoQLBApECQQMxBqEDIQchBqEDMQQBAoECwQKxAsECMQKxBAECwQQRBUEB0QXBBUEHAQQBArEFwQYhBpED8QXBAlEBYQPxBAEFgQWBBcEHAQWBBiED8QQBBcEFgQKBApECwQSBBlEFQQgBByEJ0QZRBqEHAQ4xC8EOIQvBCjEOIQaRAwED8QnBuhG6MbGhrYGdAZmBraGrEakBtzGxwb4hrOGiwbzhpoGywbKxuIG40bZRtSG2gbaRtqG3kboRmeGZUZxhnQGcAZZRuCG38bbxtoG3UbFhoaGicamhmmGaAZzhriGswayBm8GbcZkBucG5sb2BkaGhYaZRtvG4IbnBuNG6EbkBuNG5wbQhotGj8aQhocGi0aQhodGhwaqxmmGZoZXBpCGlMaHRoRGgkaGhpGGj4aRhoaGtAZQhoRGh0a0BmlGbgZnhmaGZIZqxmaGZ4ZxxmrGZ4ZxxmeGaEZcRuMG4sbcRtzG4wbDxvnGvgaDxvaGucaxxmhGaUZxxmlGdAZbxtlG2gbHBsrG5AbXBoRGkIayBnGGbwZJRv2GiwbmBp8GooaXBp8GosacRscG3MbRhp3GmMa/BnIGcQZ/BnGGcgZHBtxG0Ib/BnQGcYZUhssG2gb2BnHGdAZRhrQGXcazhqZGosa/BkRGncazhrqGigbaBvOGmkbaRvOGigb9hriGiwb0Bn8GXcaKxuNG5AbERpcGmoacRtuG0IbsRrqGs4asRraGuoa2hoPG+oa+BrZGuUa+BrnGtka5xrIGtka5xqrGsga5xraGqsa2hqYGqsaihpuGoMaihp8Gm4afBpcGm4aixqxGs4aixp8GrEafBqYGrEaixpqGlwaixqZGmoamRp3GmoaKBtBG2obKBvqGkEb6hoPG0EbQhtBGw8bQhtuG0EbbhtqG0EbDxscG0IbahtpGygbdxoRGmoamRmGGYMZmRmvGawZ2RnHGdgZ2Rm9GccZ2Rm5Gb0ZvRm5Ga4ZuRnBGa8Zrhm5Ga8ZpBmuGZkZrhmvGZkZhhmZGawZrBl/GYYZGhb5FQMWGhYmFiAW+RUaFiAWBRbzFe8VFhYFFu8V7xXnFREWERb5FSAW6xXfFfkV6xX5FREW7xURFhYW5xXrFREW8xXhFe8Vlh+VH4YfxR+kH5kfYB9XH18fix+aH6QfxB+iH4wfsR+nH5Yfvx/KH7If4B8FIPUf/R/8H+Mfkh+kH6of1R/jH7ofoh97H4wfuh+yH8ofsh+6H6gfTR9gH1QfVx9gH00foh/EH8Yfdx+LH30fmh+LH3cf5B/eH9kfex9nH2Afex9gH18ffh9kH3Mffh9fH2Qfvx/PH8kflB+xH5Yfrx+nH70fkh+MH4Qfvx/OH88fvx+5H84f0h/UH9Mf3R/XH9wf3R/BH9cfxB/dH+gfxB/BH90fyh/IH8sf6R/VH9ofkh+LH6QfwR/EH4wf3h++H8Mf6R/4H+Mf1R/pH+MfwR+qH80fqh/BH4wfuR+zH8wfuh/jH7cfsx+vH8Afnx97H6IfyB+/H8cfyh+/H8gfuR+/H7Ifrx+zH7Ifjh+UH5Yf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TyGHIYghnSStJKgkUiNzI3QjPiMyI0QjFSJjIiMioiCOIJMgiiDJIK8gayRTJOcjhSJUIkwipSK/IrkipSLsIr8inyLsIqUi7SPwI/sj8CP5I/sjqiDTIKEgpiN/I4MjpiONI38jcySdJKAkcySQJJ0kBiIJIggiGCMQIxIjACIVIgkiACJjIhUi9iFjIgAi5iFjIvYh0CS6JMUkrSQtJL8kySD6IO4gySCKIH4gsCOqI5gjYyLmIRAi+SPsIy8kayTnI8gjcyRrJCEkrSSQJC0kLyP1IjIjwCTHJMIkwCS3JMcktyStJMckeCM3I0IjcCBsIFogcCB3IGwgaSB3IHAgjiBpIFEgjiB3IGkgjiB7IHcgoiChIBghRCSmI6ojeCONIzwk7CKfIjIjxyKSIqAijiB+IHsguiTQJEQkYyKBIm8imCKBIqkioiAYIcIg0yAYIaEgxyStJL8kjCS6JEQkfSSMJFckcyQhJPojCSM3I0sjoiOKI7MjjiCoIH4gEiJUIqohMiOYIgQjMiM+Iy8jPiNJI0YjTyHtIYchWSB+IHkgyiFNIQMhbCR+JHIkWSRLJFgkWSRYJHIkjSSJJJEklSSJJI0kPiRZJEgkSCRZJHkkeSRZJIkklyR5JJUkWSRyJIkklySVJJkk9SLsIjIj9iICI0Mj8iEAIgkilSR5JIkkPiNGIy8jnyKYIjIj5CTUJMckEiKqIfAhmCKpIgQjVySMJEQkiiB5IH4g7CPnIy8kxyLaIiMj5iG8Ia4hGCF7IcIgUiMTI3MjTyH6IJIhZyN4IyQjcSR9JFckYyIQInciBiREJKojUyIjImMiTSNGI0kjkiNDI6IjkiMzI0MjMyP2IkMj7iLQIuQi7iLaItAi2iLHItAivyQ8JNAkvyQtJDwkLSR4IzwkLST6I3gjLSSQJPojkCRzJPojQiMQIxgjQiM3IxAjNyMJIxAjPCRUJNAkPCSNI1QkjSOmI1QkoCJ3IoUioCKSIncikiJjInciqSKSIsciqSKBIpIigSJjIpIi+iOdI3gj+iMhJJ0jISTII50jSyOKI6IjSyM3I4ojNyN4I4ojsyOdI8gjsyOKI50jiiN4I50jqiHtIU8hqiFUIu0hVCKFIu0hhyEiIq4hhyHtISIi7SGFIiIiAyGoII4gAyFNIaggTSHJIKggQyNLI6IjQyMCI0sjAiMJI0sj8CGSIcoh8CGqIZIhqiFPIZIhBCMTI1IjBCOpIhMjqSLHIhMjIyMzI4QjIyPaIjMj2iL2IjMjwiADIY4gwiB7IQMheyHKIQMhcyMjI4QjcyMTIyMjEyPHIiMjkiFNIcohkiH6IE0h+iDJIE0hdyIiIoUidyIQIiIiECKuISIiRCTQJFQkkiOiI5cjQiMYIyQjAiP2IgUjeyEYIawhhyGuIYghcyOEI3QjVCISIkwijSN4I38jkCStJJ0kECMJIxIj+iBPIe4g5iGuIRAiayTIIyEkgSKYIm8ijiCiIMIg0CTHJL8kqCDJIH4gUiMyIwQjhRSzFHQU9RPkE/QTPBX1FO0UPBVCFU8VPBUoFUIVDhT1E/QThRTtFLMUtBPkE7oTZxU8FWIVXxU8FWcV9RQ8FV8VKBU8Fe0U4RQoFe0UvRPkE7QT9BPkE70TDhT0E0cUchQOFEcUchRHFIUUqRThFO0U7RSFFKkUWxSpFIUURxRbFIUUUR5HHk0eaxxOHHYc1B3kHbodcByPHE4cQxxvHHAcHx4SHv8dwRwtHSwdJxw0HEQcwRwsHTcdmhyYHPUcLx5dHlQe5B0DHsgdlxw3HZYcEh4DHv8dsxyeHI4ceR0BHWYdXx5VHlQehRyXHJYcrh60Hr4eBx4dHhoeVR5fHk4ehxyFHJYckRyaHH0coh6jHqcemB6jHqIeox6wHq8eox6uHrAeUR5KHkceUR5WHkoemhyEHHocHR4HHg4etB6kHrcerh6kHrQeEB4JHgweDR0UHRcdxhzUHMQcFh0jHRId/x38HQgeFR0OHSIdPhw0HC8cBh4PHiIeBh4DHg8euhy1HLEcQxwzHA4cMxxDHHAcAx4SHhgeiB5wHnkeNBwnHCQcOBwnHEQcWR5WHlEeFhwEHPgbBBwWHC4c/x3kHfwdXB1QHVIdmB6uHqMemB6kHq4emB6QHqQeBBzyG/YbGx4XHhkeUB03HU4deR1mHXYduBy6HLYc1By6HLgchByPHHkcmhyUHIQcJh0gHScdLx3vHN0cPhxEHDQcaxxEHD4cbB5ZHmAecB5ZHmwecB5WHlkecB5dHlYeXR5wHoIeBR3mHPwcDh3mHAUdDh3YHOYclhyRHIEcGh08HVMdER4THhQe5B3UHegdux3UHbodcBw8HDMcLh4vHlQeLx08HSEdkB6CHpEeBRwuHAYcIB4hHiQeIB4bHiEehR6QHpgeXx6QHoUegh6QHlQeaxw+HE4cGx4WHhceIB4WHhseIx4WHiAeHx4WHiMeFh4fHv8duhzrHLUc1BzrHLocAh3wHA0dDh4mHhweAh0NHQcd6xwUHQ0dFB3rHA8dBBwFHPIblB3IHaUdHB4dHg4esxy7HK4cFB0PHRId1BwTHQ8dxhzpHNQcLR0mHTkdIB0OHRUdIB3YHA4dJh3YHCAdLR3YHCYdLR3JHNgcLR3BHMkcoBzBHDcdEx3pHCEdLB0tHTgdeR2RHXMdER4QHhMeFh4QHhEeFh4JHhAeFh7/HQkeAx7kHf8dPBxwHE4cgh5UHl0elhyYHJEcBBwuHAUcPBxOHC4cXB03HVAdoBw3HZccLh4sHiYeBx4BHg4eAR4GHg4eyB0GHgEejxzkHHYcax1UHf4cuh3IHakdmhwBHf4cyB26HeQdLx3kHOgcox2cHYodihygHJccox2uHZwdkB5fHlQeAx4GHsgdcB6IHoIeFhw8HC4c6xzUHA8dNx1cHfMc8BzrHA0dIx0UHRIdLB4cHiYeVB4sHi4exhy7HPocPB0aHRMd9RzzHFwd9RyYHPMcmByWHPMcZh31HFwdZh0BHfUcAR2aHPUc3RyOHGsc3RzvHI4c7xyzHI4cIR36HC8dIR3pHPoc6RzGHPoccx2KHWsdcx2RHYodkR2jHYoddhzdHGscdhzkHN0c5BwvHd0c/hzoHJoc/hxUHegcVB0vHegc/hxzHWsd/hwBHXMdAR15HXMd6ByUHJoc6BzkHJQc5ByPHJQcih2EHWsdih2cHYQdnB2UHYQdnB2pHZQdnB2uHakdrh26Hakd+hzvHC8d+hy7HO8cuxyzHO8cThyPHHYcnhxrHI4cox6tHqceZh1cHXYdlByPHIQcPB0THSEduxzGHK4c6RwTHdQcmByaHJEcyB2UHakdlhw3HfMcPhonGhoayRnhGdwZURonGj4aDhpSGjEaUhpRGmUa0xnJGdwZrxmyGawZ2RnBGbkZFhrZGdgZwRnZGdYZURoWGicaUhoWGlEaDhoWGlIarxnWGbIZwRnWGa8Z2RkWGtYZDhrhGdYZDhrcGeEZFhoOGtYZehF0EWERdBF6EYMRjhGDEY0RkRGaEY4RUhFLEUMRkRGOEY0RPxE9ETwRXBFKETkRhBF0EYMRqxGWEaARlhGrEYcRYBFcEUERSRFGETYRUhGWEWARcBF6EWYRShFFEUARShE/EUURexGNEYMRexGDEXoRexF6EXARhxF7EXARRhFgETQRSRFgEUYRSxFJETsRUhFJEUsRSRFSEWARXBGHEXARYBGWEYcRXBFgEYcRShFcEXARPxFKEXARoxGUEYcRqxGjEYcRcBE9ET8Rux+wH50flSGaIYUhqSHRIcEhaB9qH3EfgiJqInYigSF4IZchbCJ8In4imiOhI5AjuCDPIL8gQSAqIDcg0iDQIJcg8B78Hgkfux/tH7AfJiAbICoggCCCIFIgRCBBIDcg8x/tH+sfAyA3IBsg7R+7H+sfgCBSIIggNyBSIEQgKiAbIDcg8x8DIBsgayGVIYUhDSFrITUhayGFITUh8SH1Iech8SHnIdIh0SHxIcshwSHRIcshZh9oH24fLB8wHyUfhx+IH5Efkx6cHp8enx6cHqoenB6zHqoeqh6zHsEewR6zHtgesx7JHtge2B7JHhEfnh+JH5cfah+HH4MfyR7wHhEfLB8SH/AeiB+jH5AfiB+tH6Mfph+tH54fXR9VH2EfUx9VH10fdR9mH3YfaR9mH3UfVR9mH2kfiB+HH0MfLB9THzAfVR9THx0fEh8RH/AeEh8sHxofZh9qH2gfVR9qH2Yfah8dH0Mfnh+IH4kfQx+KH4kfCR8dHywfah9VHx0fpCCuIKcgCR8sH/AeryKcIr0iryKaIpwinCKaIoIimiJrIoIiayJiImoigiJrImoiSSBqIDkgXyF3IXghKiMgIxojFSP9IhEjrR+IH54fACESIQkhGiE4ISwhYyFfIXgh/yDlIOgg+SDlICchUCFKIYEhOCEaISkhmyGgIachmyGUIaAhMiH/IP4gUSFxIWQhJyH/IDIhQyH5ICchcSGUIZshcSFlIZQhZSFxIVohPSFaIVEhgSFjIXghiiFQIYEhWiFQIYohUCFaIUMhEiERIQQh9CHqIbkhxyH0IbkhOCG5IUshPSESIfkgHSESIT0hHSERIRIhHSEpIREhKSHHIbkhKSG5ITghGCA1IDggWiE9IUMhux+4H+sf+SBDIT0hbCJuInwibCJeIm4ibiJgIoMiYCJdInQibiJeImAiYCJSIl0iYCJeIlIiXiJhIlIiYSJkIlIiSiFjIYEhnyO8I9kj8SHSIcshhx9qH0MfUx8sHx0fxyDEILEgiR+IH0MfICAGIA0ggiBEIFIgcSFRIVohEiEAIfkg6x8DIPMf2SN8I2YjBiP4IvoiDSP4IgYj1SLKIsIi1SLlIsoivCOaI5Yj8yIMIwMj/SLlItUiGiMNIwojFiMVIxEj+CLzItkiDSMaIyAj+CIMI/MiICMqIyEj/SLVIuYi/SLmIhEjvCOhI5ojZiN8I2IjoSOfI4wjNCNmI0ojDSMMI/giESMMIxYj2iO8I7YjnyOAI5EjvCPaI9kjvCOfI6EjgCMpIyIjgCOfI9kjICMWIw0jKSMqIxojNCMqIykjNCMpI4AjZiM0I4AjZiOAI9kjGiERISkh5SD/ICch0CC8IJcglyCHIMQgSSCnIGogDCMNIxYjACD5H/cflyCbIJQgSSA4IDog+R8MIAogwSC4ILwgDSAGIAIgDiAYIDggtiDHILEgpCCEIIwghCCkIKcg0CDdIOwgOSBqIEAg0CDSIN0gACAMIPkfhCBJIGsgSSCEIKcgvCDQINggACAgIAwg9h8gIAAg+h8gIPYfsSCnILIg0iDEINcghyCXII0gmyClIJ8gFCAOIDggxCDSIJcgsSDEIIcgOCBJIDkgFCA4IDkgICD6HwYgDSAUICAgsSCHIKcgvCCbIJcgpSCbILgguCC/IKUgvyDGIKUghyBqIKcgmyC8ILggFCA5ICAgGB8jHxwf3iDaIPUg2iDUIMUgmyCfIJggJB88H0Yfbx96H20fjSCUIEggKyAvIC4gIx8zHzIfMx9GH0AfGB8zHyMfJB8zHxgfMx8kH0YfOx9vH20fRh88H2wfPB87H20feh+CH20fxSDUINUg2iDGIOEgvSDFIMogLSArIC4guyC1IL0gnCCjIJogDCARIAogMCAvICcglCCNIJcgvSC1IMUgjSBqIIcg1CDaIN4gQCBqIEggSCCJIHggxiDaIMUgpSDGIMUgGiARICAgLyAzIC4gliCcIJUgmCCcIJYgpSDFIKMgtSCzIKMgpSCjIJwgpSCcIJ8giSCUIJsgmCCJIJsgMCAaICAgMyBIIDIgSCAzIEAgQCAwIDkgkiCRIIkgaiCNIEggICA5IDAgMyAvIEAgmCCSIIkgESAMICAgPB9tH2wflCCJIEggbB9MH0YfnCCYIJ8gxSC1IKMgLyAwIEAgRxhwGGsYmBjSGLEYIBgXGAwYHRn3GOcY5xi2GD4ZBhgMGBcYCBgUGPIXRxhcGHAYmBixGJMYHRlBGUAZHRlFGUEZ8RfOF9AXYRiGGHMYbhiGGGEYhhhuGL8YRRkdGT4Z8RfKF84X8RczGMoXMxjxF0cYLRgaGHIYFBgpGBUYhhi/GLMYthjnGL8YJRhcGEcYmBhcGCYYLRiYGCYYmBgtGHIYwRhyGIEY0hjBGNQYchjBGJgYihiiGJsYQxk+GbYYIBghGCQYIRggGAwYPhlDGUkZHRnnGD4ZCBgfGIoYmxgIGIoYFxgfGAYYsRgWGbYYFBgIGJsYHxgIGAYYwRjSGJgYGhgpGHIY0hgWGbEYohilGJsY8RclGEcYXBglGCYYFhlDGbYYchgUGJsYKRgUGHIYbhi2GL8Y", Uint16Array),
        "lines": base64Decode("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", Uint16Array),
        "verts": base64Decode("AYABgAGAGogBgIpcAYAaYiWArl04gCBeRYAAYn2ANF3HgNtdBoEtXQ6BcF4ZgX1dyoIcXTqDS2A9gyNcSYPHX2yDA2CPg9JeroPVX76D917Og2Ff8YNLXg6EsF4uhEVfRoTZXnGEgF5/hIRbgYR5X7CE51u7hA9f1oQjXNiEYlvbhGFfH4VpXTOFxlxwhaxbjoUUXZqFkVzMhVJa44W6WuOFOV8EhqFdEoZ2WhOGDFpShh9dgYZBWqiGNF6phlBdsoasXb6GI1rmhpZaVYf4XVqHhFkJiANacYhkXUaJtlxeiTVhsYlNYc6J92HRiZlX34nWW+qJz1xeih9WYYoNV2WK2lZoigpXbYr6VneKOld+is9YjYr/Vo6KXleQillXkIqnVpKKHleVit9WnYpeV6CKWVeoindXq4psV8GKXVnGiv1Yx4p1V8yK6VbfiqVX6IqhVu2KxVgKiz1ZE4seVhaL5lkhi7ZeJ4ucWTGLcFY/iyVeS4soYFWLFVVpi3FWdIuNVoOLWo+Si3NfnYsrVqCL912ii0lipYusXrOLnlbNi2hW1ov0TdyLZU7oiy9O9otrTveLmlv4i/RbA4ysWQ+MIk49jIBbWYwaX1uMpU5mjMhVZ4woTm6MUlV5jEdfe4xGToqMlVWNjIRfkIw6X5WMXlqujGlTsoyuVbWMBJC4jMVjz4wdVNOMXk7YjP5j3oxBXt6MoF7gjOde44xVVvKMe08DjZ5UFo2AXhyNDlQdjRtPI42eWyeNoF4ojUJfK43oTlWNt05ijVtcaI1UWmqN/U50jXWOg40oXquNDFysjdVa0Y2gT/qNDFD+jf5TCY7JXgyOUU8Pjm9eFY45ZCOObmRFjmZkVo5uT1eO72NYjmKDdo6wZHaOC0+7jk9kAo8NUy+PBVAvjyRRMY+6UDiP6U9EjylURY+ijkmPoE9Mj+lTWI9GUIOPWVOFj0WRkI/6T6ePxlOpj79ksY/EUbaPEZHSj1aS24/7Ud2PrpHsj51S948IUwSQeoYTkMNRQpC4UmOQcoyEkCBUrpAIUbiQiVG6kPuRwJBaZfCQ3GQWkaFkI5EMkCuRX5JdkTVluJExZdaRzYzbkYSL7JF5USaSPFFHktpQTpIdVFGSqmRTkqxSWJIDUliSBIxrkixTa5I7UYCS6IuBkrFQi5I4UpOS+1Gkkj6Sq5KhkK2SQFGvkiZR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Q6s5aUWr+W1Gq4tpSKtMZ0mrEGZOq/WEU6s1bGerzmxqq1JMsKuRbLOr3Ja2qxpntqttMLar45XLq/dkzKs9W9+ro2UDrIJlBKy8Zgysq2w0rEJtRqxSlk+s7GVRrAZrXKxIU2esZ2R2rGYvfqyLY4CskWmFrAGWjay0Z6CshGuxrPhht6xFLrysgmzDrNhs/qz6aySttmJBrWhtQ61Hbk2tW2xQrcVtka1/bJatEm20rXBtu61WKs2tF2LXrZlg8q3ybQCugWgKrk84G67zYyeubGAvrrhlMK6cajCuVlI0rnctOa6mazuubCdMrtJsW67ra1yunJZcrjsuba6ILnCuF5Z3rlFsga5BZ4muW2iMrqsqnq40aqmu0FW3rqEn465jYeSuVGvkrpIo664NYe+u6pbwroln865mJ/auCmj7rpJk/q6+aiqv3WEur0RnOa8GJkCv25VHr2NiV68WlmevQWtrr6RudK9bYX2v+yWBr0FuhK+Elo6vVyaWr2ksnK94LZ+vamGgr9Vnsq8clr6vcCjSr9Bp5K+JlfWv1mMJsFZsE7BdJROwQWAysNFrPrA0KUiwSiRMsDUjT7BtJFaw+W1csG4+bbDlZnWw6yV4sEMmjLDBMo2w+muOsOyVmbDLZquwASa2sHyWubAIZL+w22vLsBqW0rDYi9OwrZXlsGdr6rBrZ/awWVj+sLwnCbGQLBGxYGAZsRyVIbH/aiOxtm4+schnSLE3Z0+xnSJnse0ma7GhJ4CxpWyCseaUh7FMIo6xhCGTsVpnobGiIqOxPW6rsVqWt7GabrixuGC9se5rx7GMINWxrZXosU9f77ECZ/GxbWf0saZnBrK3ZxOyBm8zsmAhN7KhJEWyPmxUsntnVrK2imqyTSRrsrhha7JhJXKyTWB2sjVnhLJBRpCyWGucssRqnbKwJJ2ypGuesslfn7IXYaiyUySuso1EvLIuYL2yPm3CsoBfw7IuZ86yq2zcsslf3rLgOOyyJ2zsssEj8bLrX/uylGH/sgpoCLP/ZQ6zMy0Os5AsJrN8bCyzqSMws8ZrMbO0XzKzS2A0sw8jSLPTYEmzF2FJs1tfU7PWZVyzmGZisy1fc7OgYHezE2x8s/Jgq7MpYrKzLS28s0BmvbNdXtuzCF/js4Fo/bOwaw60TGEVtD1oK7QvijK012I9tHBhPbQgYUu0MGFRtO1gVrRjYle0Jy1jtCpsdrQMYp60vWrBtDogz7RNYdq0/hzgtJxh47SVcPO0jx3ztExh/bS/YQ61k2sRtWdhGrV2ZyS1mmcptUIdMLX/PjO1fR47tf1hRrXeaEy1om9YtRFwWbWBG2C1UzNltTtiaLV7K5C1YXCStehgnbUNYaG1EmWqtTIqsbXBYLS1lWi3tU9vy7XLZea1UljntVdw6LUHcAS21G8etr8rLLY2cFS2VZhWttFwXbZoZGO2o29rth5jcLYLGnW28mB+tkcpiLb6b562S2Kito+Yu7a3l7621WK/tkmX1LbvltW22WHXtoxr27ZfNuW2eG/xtm5nB7dGbxK3bZkStytwP7fXYkC3gipKt1JgWrdtbF+38mdmtw+YgbeRGYK3HkWJtzNsjbe4bKW3YmKyt3I5trfClri3dnC9t4Ro5LdXKue3cmzytxOW+LdoZw24xmsQuEhSGLjbaCi4Nm8ruDRZLLiOGC64zWMxuM5sRrhBY0m4mZVWuCprV7hsOXG4qWZ6uBFogLjzaoa4zpWHuJKZkrjZZ5a4ZmiZuMWZmbh0Z7e4D5a5uGqZyLhGbMm4rZXKuKdq2biymd64umfmuABr7bj3b/W4nm74uO1rCLkWaQq5W28OuR5oHrn9bC65KWIyubhSOrnBbz25NJU+uTYnSrkMbE+5UGxiua+Zb7nfaHq5TZeHuZgljLmnbKO5rWukuQNvprlWiLi5koi4uWqZvrnDmcu5XGXOuT1h4LnLmOC50WDluexg6rlqmeu59WL2uf5l/rmkZwS6Cm0EupE/Bbqjbwm6kmIMuvVvDbr8YhC6a2AVuvRgGrrJmR26BDgfukNmJrpOKii65mUsulKZMrokaza6GHA3usGZOro9TD+6YGBCunhgSbq6ZUu6oGBMurJvTrpkY0+60TdPusBiW7q4a2S6JCBsuuRnd7q1Fnm6+255ug0ne7oeaX+6emuJuliZirq8YI26gmicutxqoLoqJqe6oSepuiRgqbpbbKq62WW5uscmu7rdJr66G2PAuqNrx7rMmdO6O2vXukmZ2rq6kt26vGfiukJn5bqTJ+a6ax3nulJo7bruJPC6amD1uqduDbshbQ2732geu9tmHrsfbx67dWYpu3ttKrt+KCq76HEwu+hvO7u5YEC7Q3JGu8iZR7vYKEy7p2pNu69kULsymVa7KGVbu71j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psvOZarLl7asy+W+rcuMua3LiZmwy1K4scvrtLLLDf6zy2O7tMtItbTL97W3yxyat8vgt7nLW7+8yx5dvsvzxMLL5FvDywAcw8u8W8PLfrbFy520xsuZv8rLeb7QywjA0cuJttHL+BnSy2db0suGZdLLCw3Ty/Nk18stYdzLurXdy0Vh4Mv1W+PLOMHjyxAQ5MvTteTLmrbly5y768vQtuzL67Xsy8i078vyx+/LvLvwy0y08cs/YfLLn/Lyy5DE9Mv9mPXLL8v2yw2/+cvSt/rLw5r9yxXAAMwmcQHM1fYCzDnCDcwobw7MXGUWzNW0GczztRvMiLQezDrzH8zUtCHMAcUjzHm0JczcmiXMPrYnzENbKMy3OirMZbUqzCi1LMxQtS3McPwwzLKZMMystTHMdMMxzGfEMsy3+DPMYW8zzN/DM8y+wTTMlZE3zGe/PMwRGzzMR7U9zF+0P8zqDELMWsBGzMfCSsyrG0rM91pKzPy0Tcw1tE7MErZSzBy1U8xTHFTMI1tWzCq0Vsy7ZFbMarRazJx1XszAwGXMr8RlzJm1ZsxsZGfMl7pnzFu2acyFtGnMrG9rzOplbMzZu2zMecNtzLhadMzRD3TMmLV3zKcKeMxZtnnMT8R5zJebesxXb3vMDrSBzKDDgcwTcoLMjJqEzL22hMzbs4nMkZiLzIDyjMx9vI3Mw8SOzFoaksyDC5LMj1qVzBLFlsyPV5jM97eZzEC7ncwbmp7MpF+fzJOdosz0WqfMABCrzF20sMy+ZLPMPFqzzMbxtMzVwrXM3MO2zPQNv8xUwMXMU5nLzLdXzMzTs83Mi7LNzHQazcz7CdHMlxDTzG8Q1swSxtjMa73ZzIZa3swNtt/MwFrizF1X5czYvObMT7TozAyP6MzlwO/MeJzxzOSz8cwqZPXMFL/4zKcZ+swGHP7MlML/zCLEAc2qGgPNQdQEzfP8Bc20xwnNnb0OzSKdE83cDBrNnVoazW1aGs09DxvNn1cdzbYRIs2VYyTNzdYnzdU6Kc1n5ynNlg8tzSW1MM2jcTPNldE2zQgZOs2myDrNrFk8zXc7PM3zVjzNH5w/zZdtSM3bEEnNmG5NzXpCTc3J8U3Nlr9PzXvVUM1ds1DNScBazXVaYs35OmLNm8tizXZxZM3mtGbNTWRnzZVZbs1aZW7NNRFvzXE7cM2owHXNBxp5zUkN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WG37nVptzZ6XbZBUrW0qVa5t7WS3bRCe/21rngluF1QebrmdO25SXltua1SbbqdO1W6IVuNuHGXlbpdQLG+HnWhvXUhwb4Fed28aUqBvp1HQb/Od/W/lVzxwN2RlcNONhXCEUo1w3UmdcPtXqXBoS8lwm13QcDpLGnHKZCFxRI4vca1cOXHxjD5xEVhxcbJXlXFSY5pxao2fcatWoXEcTKJxFVincSBXyHH/TMlxHY3OcSFkznFtj89xwlzRcYJL4HEpVvtxY2IGcsxiB3IaWAlyJWMOcg+MDnLKViFyno8ict6MJnIqjjRyx1w5coOMTXIBj19ysYxgcvSMYXJ0YWlysI1rct5hdXJ7YXZyR2J3chWceXKgYnpyemF8cvhif3LlYYlyg2GUcoBhnHJSjZ9yMWKocs5ht3LWYb1ywWHIchpiznKuYuZyA2L+cu1OEHOHWCNz71Uoc5hSOXO7Tz1zNF1Hc+JNVnNhjFZzOl1lc9yLb3OPknBzrZNycwpSenM2UHxztleVcy6Vm3NrUptzBlCkcwiTqHPqT7lzk1G6c1hdvHMMnMNzxVDEc55i0nOQk9JzF1TccxWT4HPnV+NzmV3xc+xT9XPgkvlzZ1ACdAGUCHS0VAx0/FMQdEFSEHSyUBR0b5IZdPNYHXSzVyl07U86dAGLSHR9m050yZtYdICRXHRlVWB0qJVhdJJWeHSOm3x0ElmFdCKLh3RnlYx01JGhdDljtnSUWLl04pW7dB9VwXQ1XsR03ZDgdDBZ9HR9Vfl0QpAFdQxXBnVykS11kJY2dQVVQHWzWFR1hFVVdQFZdnVOVY91K1eSdc2VpHUHY7d1EJG5ddqWxHUCXsp10ljRdYOQInaUliR2ElU5dtNdSnYGVl92c5tjdo++i3Yvv5d2lJuYdg+/oHaMv6h21GK6dqZdv3b+vsB2y7/Idkq/ynbLVed2U7/ydiOQD3eFVxZ3VYkddwDAJ3eblyl3p2JNd1abUHc8Y453TV2rd3piu3dfwfV3wIkueJ29O3hul1N4OFZbeH2JXngPmH54IWLMeBCZ03gAXPp4AGP7eIeZB3kIhgp5n5oQeTRVFXkWmhp5LZkeeceYNnmGmjl5v2NIeb2+Snk9Y1J59WJSeclhWHntVXJ5wb50ef3CdXm3Ynl5/WGSectWmHnMmZ95MWLPee/AEXqTXDl6PWM+etGIW3oexWN628VkerdiiXociZ16zsGveuRex3ovxtF6XVfTevHO1XoYX9p6gsLsemTG/XovVwh7+8UMewbPFXvszRZ7ocEYez/FKHs+YzZ7Ms5Ke3nNTntozVd7f85ue69ZfXvHzY57IMiZe59frHv9zMB7W8XDexDFyns4zN17GMzhe0/F7HtRzPB7oMT1e+XN9nuwxfd7YMULfABcDnzgyxd8VMsXfHnMH3xGyyd8S8UnfMzIMnxSY1V8Y1hXfJnLXXxMy218UMqJfBnGjnz6xqN8s1+sfNHEsnwezLV8QlzbfAjL8ny0Wgp9u8sQfRlcIH0NXCZ9eco8fWZjTX31X159g1y6fVtcv33bxst9kFzZfWhZ530/yPp98MkHfsFaDn7+WBV+M1w2fhpcTH4LXFB+eVuDfivIl36ZysN+ZlrWfmlb8n7bW/p+XcoRfyVaHX/+Wx1/glogf3JaVX+VWHV/l1mUf81ZsH8PWf9/G4j/fwGA/38aYv9/ilw=", Int16Array),
        "coast": base64Decode("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", Uint16Array),
        "countries": [
            {
                "code": "BD",
                "faceCount": 126,
                "faceOffset": 0,
                "border": "Mx40HjAeMR4pHiseJR4jHh8eEh4YHgMeDx4iHgYeDh4mHi4eLx5dHlYeSh5HHk0eUR5ZHmAeYh5XHlgeWx5PHkweRB5AHjgeQR4/HjweOh5CHjseOR43HjMe",
                "center": [90.39147271428568, 23.315597833333324],
                "label": {
                    "name": "Bangladesh",
                    "coordinate": [89.94869279999999, 23.837767230284467],
                    "fontSize": 1.64223421
                }
            }, {
                "code": "BE",
                "faceCount": 45,
                "faceOffset": 126,
                "border": "vxL6EgcTCRMXEwYT8BL8EsgSthK4ErMSpBKYErASrxK+Er8S",
                "center": [4.971237066666667, 50.65231235555555],
                "label": {
                    "name": "Belgium",
                    "coordinate": [4.599403199999981, 50.680466334931715],
                    "fontSize": 1.74702144
                }
            }, {
                "code": "BF",
                "faceCount": 81,
                "faceOffset": 171,
                "border": "+REYEhMSUhJZEngSiRKTEpYSlBKMEn0SfhKEEnASYxJPEjESLhIgEhES/xH7EfIR6xHkEcsRuxHfEfkR",
                "center": [-1.3916974691358026, 12.45616074074075],
                "label": {"name": "Burkina Faso", "coordinate": [-1.3899902343750048, 12.11054832607417], "fontSize": 2}
            }, {
                "code": "BG",
                "faceCount": 63,
                "faceOffset": 252,
                "border": "ZReEF0IXDRfeFpIWohaJFmwWnxZzFmsWoBaYFuIWBxciFyAXJhcnF1IXaBdUF2UX",
                "center": [24.9326673968254, 42.69063280952383],
                "label": {"name": "Bulgaria", "coordinate": [25.038345600000017, 42.44390731118658], "fontSize": 2}
            }, {
                "code": "BA",
                "faceCount": 36,
                "faceOffset": 315,
                "border": "hhW6FcUV3RXsFd4V8BXaFeIV1hWpFRcVKhV/FYYV",
                "center": [18.487036722222225, 43.97677002777778],
                "label": {
                    "name": "Bosnia and Herzegovina",
                    "coordinate": [17.76386160000001, 44.05977084665011],
                    "fontSize": 0.82899499
                }
            }, {
                "code": "BO",
                "faceCount": 147,
                "faceOffset": 351,
                "border": "+gz7DNQMUQwODAcMyAuvC5oLcQtECyIL4gqpCo4KXQp1ClYKSQooCicKHwpaCi0KRgo2ClcKUgpgCiMKaQoJCy8LXwteC30Lqgv4C04MfQyUDKYMrgyjDLIM8gztDAwNEw3+DAYN+gw=",
                "center": [-64.4748863605442, -16.952696775510198],
                "label": {"name": "Bolivia", "coordinate": [-64.5891624, -17.80762493429387], "fontSize": 4.54925346}
            }, {
                "code": "JP",
                "faceCount": 303,
                "faceOffset": 498,
                "border": "SCNaI04jViNZI2wjXyOFI5MjlCOeI6sjtSOuI8Ej0yPMI9cj1SPpI/0j4iPUI9Ij4SPeI9AjwiO/I7IjuCOsI7ojuSOnI44jaSNYI1sjYCNtI24jUyNQI0EjRyP7Is0iwCK+ItEi3iLqIjEjKyM6I0gj///OIs8iyCK4IpEiniKUIpkipiKjIrIiqiKwIq0ioiKkIrQirCK8IrYizCLcItYiziL//+si9yIIIxkjJiMbIwcj+SLdIusi//+7I98jwCPFI9gj8iMaJDMkYyRNJEYkUSRBJC4k/CPrI/Mj5CPGI8ojsSO7Iw==",
                "center": [136.9487997986799, 36.975868287128755],
                "label": {"name": "Japan", "coordinate": [138.1648968, 36.39176186954913], "fontSize": 2.60921216}
            }, {
                "code": "BI",
                "faceCount": 24,
                "faceOffset": 801,
                "border": "lxe8F8AX0xfPF90X3BfFF6kXpReXFw==",
                "center": [30.030195875000004, -3.224283333333334],
                "label": {
                    "name": "Burundi",
                    "coordinate": [30.016188000000007, -3.470893613585823],
                    "fontSize": 1.48555934
                }
            }, {
                "code": "BJ",
                "faceCount": 42,
                "faceOffset": 825,
                "border": "dxJ4EokSkxKWEpUSnBKoEqsSnxKaEpkSlxKOEogShhJ3Eg==",
                "center": [2.293730023809524, 10.111296999999995],
                "label": {"name": "Benin", "coordinate": [2.399547599999994, 10.415414655931768], "fontSize": 2}
            }, {
                "code": "BT",
                "faceCount": 24,
                "faceOffset": 867,
                "border": "Mh4+HkkeTh5VHlQeLB4cHh0eKh4yHg==",
                "center": [90.40768441666665, 27.51649445833334],
                "label": {"name": "Bhutan", "coordinate": [90.5008464, 27.26523417276721], "fontSize": 2}
            }, {
                "code": "BW",
                "faceCount": 72,
                "faceOffset": 891,
                "border": "GBYfFgIWABYpFioWrxbEFuUWBRcjF0oXThdeF2oXnBenF3YXPxc8FxkXDxfvFqEWghZHFhgW",
                "center": [24.592573680555542, -22.518696430555554],
                "label": {
                    "name": "Botswana",
                    "coordinate": [24.18532560000001, -22.327650207922105],
                    "fontSize": 2.20004296
                }
            }, {
                "code": "BR",
                "faceCount": 915,
                "faceOffset": 963,
                "border": "uQ7GDqIOZw5cDnYOXQ5bDnIOrQ65Dv//9A73Du8O7Q7sDuoO6A7jDuIO3A7dDtoO2A7XDtMO0Q7KDskOvg68Ds8OwA6/DrcOpw6sDmMOXw5HDlcOJQ4bDiIOZg5aDlMORg5EDkUOKw7xDdwN7g35DQQOBQ4ODg8OKg6gDpYOnw56DmIOPg4WDhwOEQ7VDXwNRw1LDTUNHA3bDMYMuQzIDMQMswy2DJUMogyBDAsMAwzqC8QLjQu5C8EL5wvjC1YLUgscC/YK6ArRCqQKjQqSCggKCQo6CkcK9QnyCSEKMgoaCv4JvgkYCQEJvQifCAgJ+AhKCVwJmQnMCcMJIwppCgkLLwtfC14LfQuqC/gLTgx9DJQMpgyuDKMMsgzyDO0MDA0TDf4MBg36DAgNAg1ODWMNhg2JDX0Nog2nDVINDw0rDUUNYA2gDdANuQ3DDeANAA4pDicOTw5vDnQOLA72DfgNXg6hDrIOvQ6xDrsOsw7HDrUO0A7ODtIO8g4NDykPIg9KD1IPTw9lD2kPgw+ED48Pkg+VD5MPoQ+ZD58Pmw+cD5cPmg+dD6MPoA+kD6YPrA+yD7QPug/FD8YPww+xD44Pdw9HDzMPPQ8yDzAPHw8oDzEPIw8tDysPIA8dDxwPGA8aDw4PDw8LDwwPBA8DD/4O/A75DvQO",
                "center": [-53.66679152459017, -8.585795755191269],
                "label": {"name": "Brazil", "coordinate": [-51.761062800000005, -10.8661497423279], "fontSize": 8}
            }, {
                "code": "BY",
                "faceCount": 66,
                "faceOffset": 1878,
                "border": "LBcyF3IX5BfnF9kXARj8FxwY7xf+F+UX0hcVF+cWwxbFFqkW0ha9FhcXERcYFzoXLBc=",
                "center": [27.74678083333334, 53.70551798484848],
                "label": {"name": "Belarus", "coordinate": [27.81856800000002, 53.33789858351069], "fontSize": 2}
            }, {
                "code": "BZ",
                "faceCount": 18,
                "faceOffset": 1944,
                "border": "hAWMBYMFfwVpBWUFbAWHBYQF",
                "center": [-88.54596033333333, 17.517027055555555],
                "label": {"name": "Belize", "coordinate": [-88.5624768, 17.143609936667513], "fontSize": 1.47678638}
            }, {
                "code": "RU",
                "faceCount": 3993,
                "faceOffset": 1962,
                "border": "OhtIGz0bTxtQG1cbVRtkG2sbWxuDGwkcDBz1G6cbfRtwGzcbPhsuGzIbARsbGwIbIRv6GhQb7BoEG8Ma7hrWGugaBxsFGx8bJhsdGy8bGBsxGzYbJxs6G///+R4KHxMf3h65HtEexh6dHpQejR57HoEeYx53HnQefh6JHroeDx/5Hv//CiQVJAkkAiQOJCwkqCObI1cjbyNcI3cjciOgI8cj3SPWI+4j4yNSJDEkEyQKJP//uB7AHrYe0B6hHmceXh5vHlAeYR5LHm4eUx52HoseuB7//54kyiSDJHgkbSSeJP//qSMnJCQkASSpI///9SP+IxEkICQlJCYkFyQMJBQkHSQbJCokQCQZJBwkECQHJBIk8SPvIwUk9iMEJPUj//8hIjsiGyIlIgUi1yGiIZ4hsSGJIeIhGiInIh4iKiIhIv//Lx8/H14fUh95H6AfBR8eHzYfKh9CHy8f//8IAAoABQAEAAcAAgADAAYADQAQAA8AEgATABEAFQAZABYAGAAXABQAGwAgAB0AKAAuADMAMAAvACkALAAhACQAIgAlAB4AIwAfABwAGgAOAAwACQALAAgA///xGvsa7RoGG/QaEhv8Ghkb8xrmGq4auBqVGrQaoBqsGpYahhqCGokatxq9Gs0auxrYGr4axhq8Gu8aMBsRG/Ea//8kIiwiJiI9IjYiTSKHIjQiMCIkIv//3hkhGvYZTBpVGkAaaRpeGogaPBozGkcaKBreGf//UBdhF1MXcxdpF20XyxeFF4cXYBf5F8MX1BeyF7sXyReeF8YXiBeAF40XfReSF8cX4hfeFy4YChgrGB4YQRgqGEsYuRhOGVcZVBkzGQsZAhhMGDkYfhiFGHgYdxhiGIMYfBjhGO8Y/Bj4GNwYxBjZGAMZ+xhCGSoZZBl5GYUZfBmKGZQZnxmHGZYZexm/GdcZ4hm0GagZ3RnRGekZDBoYGkUaMhqNGpEanhqSGsoa3xrCGtIaxBrPGrMa0RrkGvIaKRtKG1MbTBtUG1obWRt4G2IbdBupG7EbrhvRG88b0xvwG/Qb+RsXHPwb7hvOG80byRvKG9cb0BvbG8UbzBvCG/0bHxxiHIgcjBxpHIkchhx3HIMcexymHJkclRxtHHMcWBxhHEAcNhxBHA8cExwiHD8cbByQHKwcsBzIHMccvRzFHOcc9xzyHAYdGR37HP0cDB3/HN4cqByvHKIcvByTHKQc0BzLHNoc0hztHBsd4hzfHAod+RwRHWMdkh11HXsdbR14HXAdjR2BHYsdkB2OHYgdmB2fHY8dmh1yHUgdTB0zHUIdNR0/HesdxB3hHccd+B3KHe4dxR3NHeMd9B3vHfsd5x16HmYeax6lHqAeAx8MH/oeGR//Hg4f8h5PHykfNx8nH2IfgR+0H38f4R+2HykgQyBCIFMgciBgID8gbSDsH9YfnB+1HyUgByAXIDQgLCA+IEUgXyBeIEwgTyBnIHYgTSBiIGQgdSBcIOQg6yDfIA8hRyFtId8hGCIpIkkiSiJOIjwiXCJ9IooihiKQIoAixiLiItgi9CILIzsjeyOGI3ojgSO0I6QjviOZI9sj0SN8JDQkNiRHJH8kaCRqJHYkaSRmJF4kWyRgJFwkYiRFJEwkQyRJJFAkXSRuJIYkpyS4JKIkwyS1JNEk3STVJNwk4iTuJPckCCUWJQ4lHiUxJS8lLSU2JTolNyUzJSwlKSUwJTQlOCU8JTslcyWGJZYlpCWmJa4lviXDJcYlvSWxJbwluiXdJfglCSYoJikmHCYfJhYmDiYLJgwmFCYGJvElByYVJhcmGyYgJhomHiYhJiQmIyYlJiImDyYTJtIl1yW/JbUlqyWbJY0ljyWBJYMlfyV6JXYlayVfJWAlVyVbJUAlSSVNJWElUSVUJWIlZiVQJV0lSiVOJUElPSVDJRQlESUZJQUlByUDJfok9ST4JP0k/CQCJT8lbSV0JYAliiWCJXklbyVkJVklZSVLJRolICUQJRMlHSUNJQwlBCX/JPYk7STsJPQk8STnJOMkzyTNJN8krCSmJJ8koyQwJBYkAyTmI80jySMuIzgjVCNRI2MjaCNhI2UjdSNqI30jayOLI4cjiCOPI60j5SPgI88j6CPEI84jwyO9Iy0jACPnIuki1yLfItMiySK7IroitSKxIqgixSLLIsEi1CL+Ig8jFyMnIyUj/CLwIsMiqyK3IlgiWSIXIuAhpCF5IUkhMCEZIT8hRCHxIPsg8yDRILAgfyBLICMg8B/mH+cfwh9bH1AfTh8hH/cezh7aHrwehB59HloeNh79HfMd5h3ZHdsd4B3WHdEdwh23HbQdsB2sHagdoR2WHX0dYB1WHUcdPR0wHRgdAx3lHOocwhyyHJ8cnBypHH8ceBxuHHIcURxLHFYcRRwtHBQc2Bu1G7QboBuXG3obgRt3G4cbgBuTG34bbRt8G10bchuJG4YbhBtfG1YbQBstGxcb/xrgGt4a3Rq6GpsalBp/GnAaNRo7GiQaAhrkGeMZ6xnVGe0Z9xkiGkMaLhpNGjQaNxovGhAaBRoHGvUZBhrgGfMZ+hkKGgAaMRoOGtwZ0xmpGYwZcRk7GTIZDhnJGNUY0BjuGOoY9hgIGe0YCRkEGSAZ/hgAGRIZLBkxGSUZNBknGTcZNRkbGQEZ+hjmGKcYnhhjGFYYZhhQGD0Y/hfvFxwY/BcBGNkX5xfkF3IXXRdkF1AX///6Ff4VJRYnFhIWNBY2FjwWjhaNFvcVDxb6FQ==",
                "center": [90.48944015777565, 63.568608406461266],
                "label": {
                    "name": "Russia",
                    "coordinate": [96.43939559999997, 61.58821111848236],
                    "fontSize": 10.34348106
                }
            }, {
                "code": "RW",
                "faceCount": 21,
                "faceOffset": 5955,
                "border": "0RfgF9MXwBe8F5cXjxewF8IX0Rc=",
                "center": [29.90040804761905, -2.0585055714285714],
                "label": {
                    "name": "Rwanda",
                    "coordinate": [29.815664399999978, -2.1225596884859947],
                    "fontSize": 1.73839319
                }
            }, {
                "code": "RS",
                "faceCount": 69,
                "faceOffset": 5976,
                "border": "3hXsFd0VDBYFFhYWaxZzFp8WbBaJFnUWixZ3Fl0WOxY+FgkWyhXTFeUV1hXiFdoV8BXeFQ==",
                "center": [20.81948072463768, 44.146338188405814],
                "label": {
                    "name": "Serbia",
                    "coordinate": [21.061800000000012, 43.88162156624426],
                    "fontSize": 1.24106419
                }
            }, {
                "code": "LR",
                "faceCount": 33,
                "faceOffset": 6045,
                "border": "VhGJEYwRbRF1EXERbBFXEUwRThE4ESURLxFWEQ==",
                "center": [-9.27708915151515, 6.7879152424242415],
                "label": {"name": "Liberia", "coordinate": [-9.945691199999999, 6.558072030330835], "fontSize": 2}
            }, {
                "code": "RO",
                "faceCount": 69,
                "faceOffset": 6078,
                "border": "dRaLFncWXRY7Fj4WCRYbFjMWWBaVFvYWNBdwF3QXtBetF44XhBdCFw0X3haSFqIWiRZ1Fg==",
                "center": [24.3741243478261, 45.34357601449276],
                "label": {"name": "Romania", "coordinate": [24.740136000000028, 45.804182271361306], "fontSize": 2}
            }, {
                "code": "GW",
                "faceCount": 60,
                "faceOffset": 6147,
                "border": "4BDlEN8Q6RDeEO0Q7BDTENsQ1BDKEMYQxRDMELkQ+BADEQARBBHzEOsQ6hDgEA==",
                "center": [-15.178290633333333, 11.882542949999992],
                "label": {
                    "name": "Guinea-Bissau",
                    "coordinate": [-14.861570400000009, 12.103701048597832],
                    "fontSize": 0.98808563
                }
            }, {
                "code": "GT",
                "faceCount": 42,
                "faceOffset": 6207,
                "border": "AQUQBTEFNAUYBSEFIgVpBWUFbAWFBWgFWwVBBSsFHAUBBQ==",
                "center": [-90.15381957142858, 15.745664761904763],
                "label": {
                    "name": "Guatemala",
                    "coordinate": [-90.33166080000001, 15.340669651793272],
                    "fontSize": 1.41159594
                }
            }, {
                "code": "GR",
                "faceCount": 138,
                "faceOffset": 6249,
                "border": "wBbaFtsWeRalFpsWtBaAFn8WnBbKFrUW0RbLFugWzRYAFx8XMxcnFyYXIBciFwcX4haYFiYWGhYDFhwWMhYdFigWMRZwFqsWkBZUFjAWRhZKFl8WeBaEFqoWiha/Fp4WwBY=",
                "center": [23.07589436231885, 39.36531182608696],
                "label": {
                    "name": "Greece",
                    "coordinate": [21.721463999999994, 39.31344080305926],
                    "fontSize": 1.74702144
                }
            }, {
                "code": "GQ",
                "faceCount": 12,
                "faceOffset": 6387,
                "border": "3BMeFCAUzBOrE80T3BM=",
                "center": [10.190465166666666, 1.6273399166666664],
                "label": {
                    "name": "Equatorial Guinea",
                    "coordinate": [10.341604800000002, 1.5278369947890336],
                    "fontSize": 1.17266905
                }
            }, {
                "code": "GY",
                "faceCount": 75,
                "faceOffset": 6399,
                "border": "HA01DR0NDg3/DAQNGg0eDSAN8wzhDOYMwQy4DMAMlwytDHIMZQyVDLYMswzEDMgMuQzGDNsMHA0=",
                "center": [-58.98735953333332, 5.145877466666667],
                "label": {"name": "Guyana", "coordinate": [-59.161298400000014, 5.4265434522220914], "fontSize": 2}
            }, {
                "code": "GF",
                "faceCount": 27,
                "faceOffset": 6474,
                "border": "fA2XDYMNjw2cDboN7A39DQgOEQ7VDXwN",
                "center": [-53.20347314814814, 4.233485148148149],
                "label": {
                    "name": "French Guiana",
                    "coordinate": [-52.616282399999996, 3.2737812287979735],
                    "fontSize": 2
                }
            }, {
                "code": "GE",
                "faceCount": 45,
                "faceOffset": 6501,
                "border": "1hnhGckZ0xmpGYwZcRk7GTIZWBlaGV0ZWRlvGX8ZrBmyGdYZ",
                "center": [43.659164644444445, 42.15081886666667],
                "label": {
                    "name": "Georgia",
                    "coordinate": [43.67206080000001, 41.90313980227407],
                    "fontSize": 1.64247012
                }
            }, {
                "code": "GB",
                "faceCount": 267,
                "faceOffset": 6546,
                "border": "1xHiEdkRyhHSEbIRuBHQEcMRzxG1Ea0RuRGlEcIRthG/EbARvBGxEdERvhHTEQoSAxLnEfUR4xEsEjQSHhL+ERsS9hEaEjkSPBJaEl8SUBJkEmcSXBKDEpASghJ1EnoSahKHEnwSZRJYEksSSRJBEiESDxL3EekRzRGzEewRCRIiEvwRzBHwEe8R3RHuERYSBRIUEgES+BELEuYR6BHYEdURzhHhEdcR//97EYcRlBGjEcERrxG0EaIRkRGNEXsR",
                "center": [-3.480442011235954, 54.52757837078653],
                "label": {
                    "name": "United Kingdom",
                    "coordinate": [-1.4351867999999968, 52.28225289486326],
                    "fontSize": 2
                }
            }, {
                "code": "GA",
                "faceCount": 96,
                "faceOffset": 6813,
                "border": "rBTCFNcU4BS0FNsUyBSPFJQUZBQeFCAUzBO5E74TphPVE6oTpROaE4sTsxOXE78T4xPFExIUJhQ6FCoUYBRuFIMUnBSsFA==",
                "center": [11.512553749999999, -0.8169805833333333],
                "label": {"name": "Gabon", "coordinate": [11.441426400000001, -1.087868491002837], "fontSize": 2}
            }, {
                "code": "GN",
                "faceCount": 108,
                "faceOffset": 6909,
                "border": "eRGFEX4RgRF8EX0RdhFkEXMRbxFVEUcRNxEyES0RKhEoERkRAxEAEQQR8xDrEPIQ9BAHEQwRGBErETMRMRE4EU4RTBFXEWwRcRF/EXkR",
                "center": [-10.55749593518518, 10.24274628703704],
                "label": {"name": "Guinea", "coordinate": [-11.212581599999991, 10.717381928917732], "fontSize": 2}
            }, {
                "code": "GL",
                "faceCount": 1890,
                "faceOffset": 7017,
                "border": "MQ5rDkgOdQ6bDpgOpg5UDpAOfg5VDkIOWA5MDgwOmg4UDh0OUA4VDngOMg6IDj0OmQ5wDpQOfQ6ODqMOkw6EDocOnQ6CDqsOpA6wDqgOtA6uDroOqg7IDq8OxQ64DsIO1A7NDtUOww7ZDswO2w7eDtYO4A7kDuEO5g7pDucO6w7uDvAO8w7xDvUO/Q4AD/oOAQ8HD/gOEw/2DhEP/w4GD/sOEA8KDxcPEg8lDxQPLg8WDyYPLw87DzoPTg9LDzYPVg9CD1UPQw9XD0EPWQ9ID1wPUQ9dD1QPZA9bD18PUw9hD00Pag9uD2APdA9mD2sPfw9vD3gPdQ9+D4IPeQ+HD20PiQ+FD4gPcA9yD3YPgA+GD4oPeg+QD40PqA+qD6cPqw+uD6kPsA+tD68Psw+1D7gPtw+7D7wPwg+/D8cPyQ/ID8oPyw/OD80Pzw/XD9kP1A/WD9MP2A/dD9oP3A/jD+IP5Q/mD/4PHBAZECcQIhBLEAsQ9Q/pD/8P5w/wD+sP+g8IEOoP+A/oDxIQKhA0EDgQQxBmEFIQXxBEEF0QURBhEFcQPRA5EFMQLhA6EBUQBxAKEAIQFBAQEPsPABD0Dw8Q/A/zD/EP/Q/2DwEQBBAJEBMQBRAYEB4QRxAfEEIQfxCFEFoQVRBQEDsQTBA8EFkQShCQEJoQbxB8EHgQexA+EH4QNhBoEEUQixCWEI0QTxCOEF4QZBA3EFYQMRBgEHMQWxB6EJ8QohCeEHEQmxCYEIMQdxBjEE0QdhBnEHUQbhCIEIoQhxCVEJkQkhCMEJEQqBCXEIIQeRB9EI8QrBDLEG0Q0hAcEboQpxCpEKQQhBCJEBcQRhBOECAQGhD3D/IPDBDQD+QP2w8OEGwQIRADEBEQDRDBDwYQ1Q+iD7YPlA+lD1gPCQ9FD+UOjA+RD3EPZw9sD2IPAg9eDzcPHg8sDxkPOA8kD4MOPA6pDkAOpQ7WDa0NpQ23DYANyww0DdoMkAxhDJMMagx8DOQLCQzXC80K6grMC3kLiQszCzcJGQlCCQMJlwn9CcYJKQrdCT4KXwp+CgALLQsGCyALSAomCxILlQmiChwKcgoRC9kKQwtUCzoLWQvhC4sM6wz3DOAMOw0sDUANLw05DRsNQg03DV4NRA1rDVgNcw17DXINeQ1tDYoNXQ14DWENaA2IDUoNZg2dDZINwA2aDbYNow3FDd8Nyw0TDtINIA7jDRIO7Q0wDhkOTg4BDmwOHg5uDiEOTQ5DDnkOZA7bDZUNeg3rDYoOcQ6FDo0OUQ6MDjsOfA6VDmEOiw4/DiYOaA5SDucN0Q3BDegNWQ44DkoOHw6SDnMONw4HDtgN6g3GDfoNzA3UDasNQQ4jDnsOLw5JDmkOhg6eDokOVg6XDmAOJA4LDuUNnw2oDcoNOQ4XDn8ONg4YDvINvA20DcINpg2YDe8Nvw3pDa4Nrw3ODb0NNQ6ADm0OnA5LDoEOKA6+DQoOyA3eDdkN5g3kDQMOAg4aDjMOdw4uDhAOBg4NDuIN9Q3wDS0O8w37DfQN/g3/DTEO//91DYQN3Q0JDrUNiw3EDW4Nhw1wDYwNdQ0=",
                "center": [-42.3903942608466, 70.90513183121698],
                "label": {"name": "Greenland", "coordinate": [-41.7541896, 68.30885860671616], "fontSize": 7.59197807}
            }, {
                "code": "KW",
                "faceCount": 24,
                "faceOffset": 8907,
                "border": "2hn/GQgaKhobGg0aIBoUGhMa7xnaGQ==",
                "center": [47.69488020833333, 29.395393458333334],
                "label": {
                    "name": "Kuwait",
                    "coordinate": [47.25584640000003, 29.240971043957767],
                    "fontSize": 1.48555934
                }
            }, {
                "code": "GH",
                "faceCount": 78,
                "faceOffset": 8931,
                "border": "ExJSElkSaBJiEm8SaRJ2Em4SgRJ0EnESbRJhEmwSchJzEmYSTBI6Ei0SBxIIEg0SFRIAEh8SGBITEg==",
                "center": [-0.760799576923077, 7.105309525641023],
                "label": {"name": "Ghana", "coordinate": [-1.1641427999999965, 6.905509120839239], "fontSize": 2}
            }, {
                "code": "OM",
                "faceCount": 60,
                "faceOffset": 9009,
                "border": "jBrpGv4a8Br5GgobABsMGw4bFhskG0cbWBtFGz8bNBszGyAbFRv1GusarRqMGg==",
                "center": [56.33618311666666, 21.380599466666673],
                "label": {
                    "name": "Oman",
                    "coordinate": [56.558322000000004, 20.497907617110933],
                    "fontSize": 1.64126945
                }
            }, {
                "code": "TN",
                "faceCount": 60,
                "faceOffset": 9069,
                "border": "6xPxEwsU8hMRFNsT8BMKFBMUJxQpFO0T5hO1E54TchNYE3ATaxOEE8IT0RPrEw==",
                "center": [9.856230566666667, 34.35718348333334],
                "label": {
                    "name": "Tunisia",
                    "coordinate": [8.954078399999998, 33.68825915042876],
                    "fontSize": 1.49404287
                }
            }, {
                "code": "JO",
                "faceCount": 33,
                "faceOffset": 9129,
                "border": "EBkZGdgY+RjoGM8YvBiEGIcYoBimGKsY0RgQGQ==",
                "center": [36.578573575757574, 31.10877518181819],
                "label": {
                    "name": "Jordan",
                    "coordinate": [36.45496439999999, 30.46981339664869],
                    "fontSize": 1.46370518
                }
            }, {
                "code": "HR",
                "faceCount": 57,
                "faceOffset": 9162,
                "border": "ohS2FNAU2hQfFVgVfxUqFRcVqRXWFeUV0xXKFYsVRxVEFRAVExX9FOYUohQ=",
                "center": [16.29700307017544, 45.22061703508771],
                "label": {
                    "name": "Croatia",
                    "coordinate": [16.644286800000035, 45.41329837906038],
                    "fontSize": 1.24156451
                }
            }, {
                "code": "HT",
                "faceCount": 33,
                "faceOffset": 9219,
                "border": "eAl7CWUJdwnjCLAIcwiGCE0JHgkkCdsIKgl4CQ==",
                "center": [-72.7396771818182, 18.837804272727276],
                "label": {"name": "Haiti", "coordinate": [-73.10026800000001, 18.218917038553897], "fontSize": 2}
            }, {
                "code": "HU",
                "faceCount": 48,
                "faceOffset": 9252,
                "border": "WBaVFl4WGRbEFWwVZxViFTwVTxVCFSgVRxWLFcoVCRYbFjMWWBY=",
                "center": [18.781236041666666, 47.2860291875],
                "label": {"name": "Hungary", "coordinate": [19.1992464, 46.9579403877902], "fontSize": 2}
            }, {
                "code": "HN",
                "faceCount": 60,
                "faceOffset": 9300,
                "border": "mQWcBXoFXAVbBWgFhQXfBUgGXAZJBlIGfwZ5BjgGHwbjBdkFvwXDBa0FqgWZBQ==",
                "center": [-86.29015678333333, 14.631795500000003],
                "label": {"name": "Honduras", "coordinate": [-86.6749212, 14.802728387041807], "fontSize": 1.4943763}
            }, {
                "code": "PT",
                "faceCount": 51,
                "faceOffset": 9360,
                "border": "WhFlEVQRWxFNEWsRYhF4EXcRnhGmEZsRlRGIEZgRkBGZEYoRixFaEQ==",
                "center": [-7.929643568627455, 39.673546862745106],
                "label": {
                    "name": "Portugal",
                    "coordinate": [-8.101702799999991, 39.93464364931235],
                    "fontSize": 1.74718821
                }
            }, {
                "code": "SJ",
                "faceCount": 228,
                "faceOffset": 9411,
                "border": "/hQFFdMU7hSEFFUUkRQdFGIUMBRFFBcU/hOyFFwUnRSTFMAUtRTkFDsVDhU0FVQVpBWEFbMVzxU/FtEV2RW2Fa8VkhVcFWkVSBUJFUMV2RS3FDIV8BRhFbkUoRRtFTYVVhUGFf4U//+nFrYWlBZqFn4WYhZBFlUW+xXpFfgV0hXuFeAVlBXJFaYVxxVnFvIVvhZLF/QWpxb//3IWjBYjFkUWJBayFqQW9RaFFnIW",
                "center": [17.77536168421052, 78.89477315789476],
                "label": {
                    "name": "Svalbard",
                    "coordinate": [16.273079999999997, 78.58471182051925],
                    "fontSize": 3.53704762
                }
            }, {
                "code": "PY",
                "faceCount": 48,
                "faceOffset": 9639,
                "border": "4wwQDQsNfwwODFEM1Az7DPoMCA0CDU4NYw2GDYkNfQ13DVUN4ww=",
                "center": [-57.506883270833335, -23.35376158333333],
                "label": {
                    "name": "Paraguay",
                    "coordinate": [-58.51677599999999, -23.39048345506922],
                    "fontSize": 2.61872196
                }
            }, {
                "code": "PA",
                "faceCount": 96,
                "faceOffset": 9687,
                "border": "0QbhBuMG6gbxBhgHLgcQB18HfQeMB58HigeEB3wHmQekB68H0QfAB5AHQwfiBrcGuwajBpUGhQaOBocGjQahBqYGwQbRBg==",
                "center": [-80.19056020833332, 8.380179760416667],
                "label": {
                    "name": "Panama",
                    "coordinate": [-81.42162120000002, 8.397659269443709],
                    "fontSize": 1.41692162
                }
            }, {
                "code": "PG",
                "faceCount": 144,
                "faceOffset": 9783,
                "border": "0yTeJOAk2iTbJNIkviSlJJgkmiSxJLkkuyTJJNYk0yT//x8kMiQrJDUkOiRvJHokgiSFJI8kryS8JMQkvSTIJLIkriS0JKkkqiSbJJQkiCSBJI4kiyRhJF8kOST3I9kj2iMPJB4kGCT/IykkHyQ=",
                "center": [147.4640106458334, -7.3597128125000015],
                "label": {
                    "name": "Papua New Guinea",
                    "coordinate": [144.6157404, -6.568255420758702],
                    "fontSize": 3.02003837
                }
            }, {
                "code": "PE",
                "faceCount": 171,
                "faceOffset": 9927,
                "border": "wwnMCZkJXAlKCfgICAmfCL0IAQkYCb4J/gnaCcEJ2AnxCd4JfQkTCdEIiwhgCEAIMAhECDYI8weBB28HVgc+BxEHEgcnBxwH2gb5BuQGMAddB6sHDAj9BxwITwiKCdcJ/wknCh8KWgotCkYKNgpXClIKYAojCsMJ",
                "center": [-74.05098789473683, -7.944868140350877],
                "label": {
                    "name": "Peru",
                    "coordinate": [-75.62778479999999, -10.443795128793157],
                    "fontSize": 4.28453016
                }
            }, {
                "code": "PK",
                "faceCount": 210,
                "faceOffset": 10098,
                "border": "thy6HLEctRzrHPAcAh3gHNwcyhzDHHwcUhxkHEocTRwsHDccIxweHAcc8RvkG+cbxxu+G7wblhtzG5AbmxucG6MboRuNG4gbqButG78buxu9G8gbxBvVG9Ib1hvaG98b4BviG+Mb4RvyGwUcBhwuHE4cPhwvHDQcJBwnHDgcRBxrHJ4csxyuHMYcxBzUHLgcthw=",
                "center": [69.3836207428572, 29.3503823809524],
                "label": {"name": "Pakistan", "coordinate": [68.95891800000001, 29.304219644075985], "fontSize": 2}
            }, {
                "code": "PH",
                "faceCount": 213,
                "faceOffset": 10308,
                "border": "nSGoIbMhySG+IcQh6CH4If8hDCL+IQoiESIdIhwiMyIWIgEiBCLjId0h0CGyIbghoyGZIYIhcCF8IZAhliGdIf//yCHNIe4h5SHpIfohDyL7IdQhyCH//x4hNCE2IUwhOiE8IVghaiGPIY0hnyHAIbohwiHFIbchqyG9IaEhnCGTIX0hgyFnIVwhjCF+IYQhcyFXITchLiElIRYhFCEVIQwhHiE=",
                "center": [123.20059375586852, 11.57619933333334],
                "label": {"name": "Philippines", "coordinate": [120.88454759999999, 15.343978536386098], "fontSize": 2}
            }, {
                "code": "PL",
                "faceCount": 117,
                "faceOffset": 10521,
                "border": "ShVgFVoVkBWJFb8VzRXqFQYWQhZ8FpMWiBbcFsMWxRapFtIWvRaNFvcV3BX0FfEVzBXAFbUVxhWxFZ0VzRTMFOcUzxTFFOgU5RT3FPMUNxUtFUoV",
                "center": [18.777860615384622, 52.11716683760685],
                "label": {
                    "name": "Poland",
                    "coordinate": [19.023224400000025, 52.21771214145786],
                    "fontSize": 2.32899618
                }
            }, {
                "code": "ZM",
                "faceCount": 117,
                "faceOffset": 10638,
                "border": "LBhEGDcYNRhJGCMY6BfYF5AXexeJF3oXmBesF7oXuRevF5YXfhdcF0kXPRceFwwXCxfqFtQW2RZWFlcWuhb5FgUXQxdiF4oXkRfOF8oXMxgZGCwY",
                "center": [28.471601777777792, -12.973100076923076],
                "label": {
                    "name": "Zambia",
                    "coordinate": [26.413372800000005, -14.962915040046475],
                    "fontSize": 2.80825186
                }
            }, {
                "code": "EH",
                "faceCount": 60,
                "faceOffset": 10755,
                "border": "2hAVERMRHxEeEWgRaRFqEQ8RCBH6EO8Q1RDRENgQ2RDNEMIQuBCxEK0QrhDaEA==",
                "center": [-14.263348050000001, 24.02614313333334],
                "label": {
                    "name": "Western Sahara",
                    "coordinate": [-14.162541503906247, 23.6904081733544],
                    "fontSize": 2
                }
            }, {
                "code": "EE",
                "faceCount": 39,
                "faceOffset": 10815,
                "border": "vBbQFrsWuRYWF2kXcxdTF2EXUBcvFwgX4xbsFswWvBY=",
                "center": [25.571200999999995, 58.6555712820513],
                "label": {
                    "name": "Estonia",
                    "coordinate": [25.65830519999998, 58.55728772964739],
                    "fontSize": 1.78206873
                }
            }, {
                "code": "EG",
                "faceCount": 105,
                "faceOffset": 10854,
                "border": "+xb+FvAX9xf2F9MYrBihGLAYlBhFGBEYFhg0GFsYghhdGFoYTRhCGDwYMRgyGC8YGxgQGA0Y/RcDGA8YBRjmF50XTxcKFwEX8Rb7Fg==",
                "center": [31.773616885714297, 28.7280632095238],
                "label": {"name": "Egypt", "coordinate": [29.77850880000001, 26.79044914994105], "fontSize": 3.76930666}
            }, {
                "code": "ZA",
                "faceCount": 132,
                "faceOffset": 10959,
                "border": "YxV2FacV2xX/FQIWHxYYFkcWghahFu8WDxcZFzwXPxd2F6cXvRfyFwgYBhj1F+EX2hfsFwcYDBghGBIY9BfEF2YXMBcTFxIXehYBFssVyBW0FbgVmRWuFawVPxVjFQ==",
                "center": [24.791740162790695, -28.539574937984504],
                "label": {"name": "South Africa", "coordinate": [24.21865799999999, -28.68357072638377], "fontSize": 2}
            }, {
                "code": "EC",
                "faceCount": 78,
                "faceOffset": 11091,
                "border": "9wYhBzkHNQc8BzIHHAcnBxIHEQc+B1YHbweBB/MHNghECDAIQAgICL8HcQdpBysHKgcNBx8H9Ab3Bg==",
                "center": [-78.82952123076919, -1.8115454230769217],
                "label": {"name": "Ecuador", "coordinate": [-78.07640760000001, -1.5181125112074598], "fontSize": 2}
            }, {
                "code": "IT",
                "faceCount": 180,
                "faceOffset": 11169,
                "border": "+hQDFfsUCxWtFJUUWRT6FP//bBOyE88TuxOcE5ETdRN+E2wT//8jE0kTMRNBE2ITdhOdE6QT4hPfE/MT9BNHFFsUqRSWFKYUmxS4FKcUkBRTFEoUZxRQFFcUoxS/FPEUKRUcFZ8VvRWyFZoVWxU+FWYVaBVGFSMVDRUxFREVDxThE44TWRNeEzoTPxMjEw==",
                "center": [12.231294222222225, 42.77950309444445],
                "label": {"name": "Italy", "coordinate": [12.24784440000002, 42.79763050166345], "fontSize": 2.51796436}
            }, {
                "code": "AO",
                "faceCount": 96,
                "faceOffset": 11349,
                "border": "VhbZFtQWYxZmFlAWTxYTFhcW7RXjFYMVXhVFFb4UjhRPFJcUghSuFK8UYxQtFDQUNhQvFIwUvRS5Fc4VIhauFroWVxZWFg==",
                "center": [17.54340741666666, -11.783584104166666],
                "label": {
                    "name": "Angola",
                    "coordinate": [17.67928680000002, -12.545607369455082],
                    "fontSize": 2.98751664
                }
            }, {
                "code": "ET",
                "faceCount": 108,
                "faceOffset": 11445,
                "border": "9BgFGRQZORlnGV8ZXhlzGWoZcBmPGegZFxqqGYQZYRlTGUgZIxn9GNoYtxiyGJkYehhKGCcYNhhXGF4YcRh/GJAYrRi+GMgY3xjpGPQY",
                "center": [38.78811243518516, 9.220454935185188],
                "label": {
                    "name": "Ethiopia",
                    "coordinate": [39.06191159999999, 8.416568175032186],
                    "fontSize": 2.20393252
                }
            }, {
                "code": "ZW",
                "faceCount": 66,
                "faceOffset": 11553,
                "border": "BRdDF2IXiheRF84X0BfxFyUYJhgtGBoYKRgVGBQY8he9F6cXnBdqF14XThdKFyMXBRc=",
                "center": [29.89040556060606, -19.08572266666667],
                "label": {"name": "Zimbabwe", "coordinate": [29.753787600000013, -19.054579936798593], "fontSize": 2}
            }, {
                "code": "ES",
                "faceCount": 114,
                "faceOffset": 11619,
                "border": "VRJgElYSXRJ7EqASoRKPEooSUxIzEpMRgBFTEVkRYxFfEW4RXhFiEXgRdxGeEaYRmxGVEYgRmBGQEZkRihGLEaERqRHFEcgR5REqEjgSURJVEg==",
                "center": [-4.717578473684211, 40.316428640350885],
                "label": {
                    "name": "Spain",
                    "coordinate": [-3.589948799999998, 40.20648131627003],
                    "fontSize": 2.20047855
                }
            }, {
                "code": "ER",
                "faceCount": 51,
                "faceOffset": 11733,
                "border": "Lhk4GVIZdBlnGTkZFBkFGfQY6RjfGMgYxhjWGNcY4hgKGREZKRkuGQ==",
                "center": [38.78585745098039, 15.191102215686275],
                "label": {
                    "name": "Eritrea",
                    "coordinate": [38.14341120000001, 15.32787680773013],
                    "fontSize": 1.64827192
                }
            }, {
                "code": "ME",
                "faceCount": 18,
                "faceOffset": 11784,
                "border": "4RXzFQUWDBbdFcUVuhW8FeEV",
                "center": [19.32150433333333, 42.747724777777776],
                "label": {
                    "name": "Montenegro",
                    "coordinate": [19.380563999999968, 42.76593955531302],
                    "fontSize": 0.86234677
                }
            }, {
                "code": "MD",
                "faceCount": 24,
                "faceOffset": 11802,
                "border": "cBd0F5MXlRfIF78XpBegF18XNBdwFw==",
                "center": [28.702290916666662, 46.99905620833334],
                "label": {
                    "name": "Moldova",
                    "coordinate": [28.58047200000003, 46.996617215185424],
                    "fontSize": 1.49437642
                }
            }, {
                "code": "MG",
                "faceCount": 99,
                "faceOffset": 11826,
                "border": "EhomGjkaQRo4Gk8aWRpoGmEaWBpUGlYa7hmwGZEZdhmCGZ0ZjRmbGcUZ1BnPGeUZ5hnwGfIZ7BnqGf4Z+xkPGhkaCxoeGhIa",
                "center": [47.50164391919194, -16.254066424242424],
                "label": {"name": "Madagascar", "coordinate": [46.700308799999995, -19.496379699082514], "fontSize": 2}
            }, {
                "code": "MA",
                "faceCount": 75,
                "faceOffset": 11925,
                "border": "8xH6EdYRuhGSEWcRahEPESYROhFIEUQRWBGcEa4RxBHGEeARDBIOEhASJhI1EjcSSBJAEhIS8xE=",
                "center": [-5.603211999999999, 32.30362132000002],
                "label": {
                    "name": "Morocco",
                    "coordinate": [-6.253822800000011, 31.960017723700318],
                    "fontSize": 2.81246758
                }
            }, {
                "code": "UZ",
                "faceCount": 159,
                "faceOffset": 12000,
                "border": "ORxCHDocKRwhHBwcABwQHP4b3hvcG+8b9xvoG8EbwxurG5gbjhthG14bSRs7G0QbORsiGyMbCRsIG0YbYxuRG6UbsBu4G7obuRvAG8Yb6hv6GxEcSBxVHDUcWRxmHHEcmxxnHEkcORw=",
                "center": [65.33265737106915, 41.37726657861638],
                "label": {"name": "Uzbekistan", "coordinate": [62.82751319999998, 41.992094853978955], "fontSize": 2}
            }, {
                "code": "MM",
                "faceCount": 261,
                "faceOffset": 12159,
                "border": "4h7tHuoe3x7pHuEe1B7THsweyB6/HrIesR6rHqgeqR6aHpYekh6PHowejh6GHooefx6HHoMefB6AHngech51Hmkeah5oHmUeWB5XHmIeYB5sHnAeeR6IHoIekR6QHqQetx60Hr4exB7HHs0e2x7oHvEe6x7DHsoewh70HuYe9R4IH/4eEB8bHzEfNB8XHxYfBh/4HtIeyx69Huce9h7VHgAf+x4LH+4e4B7dHuwe7x7zHuIe",
                "center": [96.89146619157086, 19.279033842911847],
                "label": {"name": "Myanmar", "coordinate": [96.06722039999998, 21.310420409878557], "fontSize": 2}
            }, {
                "code": "ML",
                "faceCount": 156,
                "faceOffset": 12420,
                "border": "JBEuETARTxFQEVERvRHHEbcRnxHaEYASfxKSEqISoxK1ErQSshKnEoUSYxJPEjESLhIgEhES/xH7EfIR6xHkEcsRuxGnEaQRlxGGEX0RdhFkEXMRbxFVEUcRNxEyES0RKhEoEScRHREbESARJBE=",
                "center": [-5.417310666666668, 14.574851339743601],
                "label": {
                    "name": "Mali",
                    "coordinate": [-2.277280800000001, 17.109709980008002],
                    "fontSize": 3.20683718
                }
            }, {
                "code": "MN",
                "faceCount": 156,
                "faceOffset": 12576,
                "border": "nSCwIH8gSyAjIPAf5h/nH8IfWx9QH04fIR/3Hs4e2h68HoQefR5aHjYe/R0AHg0eFR41HkYeQx5FHnEemR6VHqwe4x4mH1wfkx/fHwQgHSA8IDEgPSBoIIYgoCCtIMAgEyEOIQoh4CDOIL4gnSA=",
                "center": [104.23743828205131, 47.20316365384615],
                "label": {"name": "Mongolia", "coordinate": [102.685824, 46.5920072878404], "fontSize": 3.99618483}
            }, {
                "code": "US",
                "faceCount": 1902,
                "faceOffset": 12732,
                "border": "0QDYANAA3wDaAOMA4ADkAOoA9gDsAPgA9AD9AO4A6ADzAO0A6wDmAOcA5QDbAOIA3ADhANUAzwDRAP//JwAqADIANQA0ADEALQArACYAJwD//4YAjwB3AHoAYgBdADgAOQA6AGUAgwCAAKEAnwCjAKcAoAClALYAxgDLAMcAyADMANMA/AD6AP4A9wAEAQEBHgFPAVMBVgFXAWABXgFlAWYBdAGOAZoBvgG4AcABsAGrAbQBpwGxAa8BqgGZAZwBmAGWAZsBlAGMAZEBigGSAYsBkAGIAYkBhwGBAX8BdwF4AXIBfAFvAW0BcAFsAWsBaAFnAWoBbgFpAWQBWQFcAV0BYQFbAVgBVQFUAVIBUAFRAU4BRwFJAUEBRQE7AUMBOgE+ATUBMwEwAS4BMQEiASoBIwEvAScBLQEpASYBHQEZARcBFQEUAREBEwESAQ0BDwELAQoBCQEAAQgBAgEHAQYBDAEgARABGgEFAfsA8AD5ANIA6QDXANQAxADDALEAqQC0AK8ArACmAKIAkQCQAJQAjACCAHgAcwB1AGwAcABpAGsAagCIAJ0AmQCaAKsAqgC3AL8AugC8AMAAvQDCALIAsAC1AK0AqACbAH0AiwCBAIkAfgB5AIcAdAB2AF4APgBUAFsAVwBfAGMAaABgAGcASABSAEoASQBFAEEARwBMAE4AUQBTAE0ASwBGAEMAPwBCAEAAOwBEAFUAUABWAE8AWgBYAG8AfACTAJgAjQCXAJIAcQBuAG0APAA3AD0ANgBZAGYAXABkAJYAhACFAHIAewCKAJ4AnACOAIYA//9jAmgCXAJPAksCNwJAAi8COwJEAlgCQgI+AkECQwJFAk0CPAJKAjkCKwJtAm8CWwJnAl0CcwJ3AnQCcQJsAmkCXwJlAn4CfAJuAngCawKfBKQEvQTuBBoFJAVaBYEFIwY0BlAGVgZpBmgGlgarBpcGfgaGBo8GXgdSB20H4wdVCLcJQgqyCrEK3grwCuEKyArGCrQKmgqWCoMKbApuCmcKXApKChkKEwoMCuQJwAnICasJ2wn6CfAJAQqfCacJkgmJCQ8JoAilCIUIpgiUCJgIjQh4CHEIdwhXCFsINwhSCDIIUAgYCC0IHwghCAkIGQgBCCII9wcACPAHBQjMB9cHxQcKCAII1AcGCP4H7gcHCNAHFwg4CBsIJAgNCBQI9AfsB+kHEwgWCCAIKAgPCNgH/AflB9YH3gcECLgHlweUB5EHaAdQB1EHSwdOB0cHRgcBBxMH/AYCB9IG3gYJBxUHBgf7Bv8GLQcaB+cG8wbYBsIGtAa9Bq4GsAafBpEGmQaQBowGiAaTBmMGSgYABu4F/gXSBZIFmwWTBYoFMwVPBVAFWQVLBU0FZgVqBVgFYAU/BTsFHQUNBf8E1QTUBNMEswTABKUEqASnBKIEoAR2BHoEXwRwBFkETQQ/BEQENwRDBD4EUAQHBAEE1QPHA7YDpAOfA4UDdgNkA2UDJwMDA+EC4gLEAr0CrwKTApQChgKHAnYCewKFAnoCfwKOAooCiAKEAoMCfQJ1AmICYwI=",
                "center": [-120.17106540326022, 48.35548152681387],
                "label": {
                    "name": "United States",
                    "coordinate": [-100.0299024, 38.57099460960616],
                    "fontSize": 8.97361469
                }
            }, {
                "code": "MW",
                "faceCount": 60,
                "faceOffset": 14634,
                "border": "GRgsGEQYNxg1GEkYIxgwGF8YhhhzGGEYbhi2GLEYkxiYGFwYcBhrGEcYMxgZGA==",
                "center": [34.18358971666668, -13.069863550000003],
                "label": {
                    "name": "Malawi",
                    "coordinate": [33.75626399999998, -13.57104861478695],
                    "fontSize": 1.60014021
                }
            }, {
                "code": "MR",
                "faceCount": 84,
                "faceOffset": 14694,
                "border": "HhFoEWkRnRHaEZ8RtxHHEb0RURFQEU8RMBEuESQRIBEbEf0QyBDAEM8QwRDJEK8QrRCuENoQFRETER8RHhE=",
                "center": [-11.588053273809521, 19.49110511904761],
                "label": {
                    "name": "Mauritania",
                    "coordinate": [-11.027998800000006, 19.172869269529617],
                    "fontSize": 2.71499205
                }
            }, {
                "code": "UG",
                "faceCount": 45,
                "faceOffset": 14778,
                "border": "VRhoGIkYURhSGPoX0RfCF7AXwRfzF9cX3xftFw4YKBhAGFUY",
                "center": [32.13690602222223, 1.675837177777778],
                "label": {"name": "Uganda", "coordinate": [32.23977480000001, 0.8066783186236244], "fontSize": 2}
            }, {
                "code": "UA",
                "faceCount": 246,
                "faceOffset": 14823,
                "border": "JRk0GScZNxk1GRsZARn6GOYYpxieGGMYVhhmGFAYPRj+F+UX0hcVF+cWwxbcFogWkxZ8Fl4WlRb2FjQXXxegF6QXvxfIF5UXkxd0F7QXsRe4F8wX2xcEGPsXCRgYGPgXCxj/F0YYThgTGEMYOxhTGKQYxRjLGJ8YmhiNGH0Ydhh7GIsYnRiSGGcYdBhIGGwYZRhtGHkYjBiWGIgYtBj+GAAZEhksGTEZJRk=",
                "center": [32.91023745528458, 47.698244170731684],
                "label": {
                    "name": "Ukraine",
                    "coordinate": [31.135694399999995, 49.06125288594917],
                    "fontSize": 3.08472538
                }
            }, {
                "code": "MX",
                "faceCount": 291,
                "faceOffset": 15069,
                "border": "RQNLAy8DMAMmAw8DAgPbAucCBwMWAxcDHAMuAzMDNgNEAzwDNAMRAxIDEAMMA/4CAQP3At0C8QLqAu0C0ALEAuIC4QIDAycDZQNkA3YDhQOfA6QDtgPHA9UDAQQHBFAEMwROBH4ErwS/BAkFDgUWBS8FNwV7BbMFvgWdBakFmAWRBYMFfwVpBSIFIQUYBTQFMQUQBQEF8QTDBNEEtwS+BLEErARqBDUE3gPMA7QDnAOLA5UDjgOXA4kDawNnA18DVQNJA1EDRQM=",
                "center": [-102.99664277319592, 23.60785310309279],
                "label": {"name": "Mexico", "coordinate": [-102.0694104, 22.06316144257713], "fontSize": 6.71727848}
            }, {
                "code": "IL",
                "faceCount": 30,
                "faceOffset": 15360,
                "border": "kRioGKsYphiXGIAYoBiHGIIYXRhgGGkYkRg=",
                "center": [34.980216799999994, 31.625914166666664],
                "label": {
                    "name": "Israel",
                    "coordinate": [34.622578799999964, 31.476320084307606],
                    "fontSize": 1.42111897
                }
            }, {
                "code": "FR",
                "faceCount": 198,
                "faceOffset": 15390,
                "border": "HBIjEhcSBhLqEd4R7RHcEQISGRI7EjISPRJDEmsSXhKLEo0SmBKwEq8SvhK/EvoSFBNuE1wTXRM7EwUTMBNBEzETSRMjEz8TOhNeE1kTVhNUE1ETUhMKE8YSrRKeEqESjxKREooSUxIzEkcSPhJEElQSThI/EkUSQhIpEjASJxIoEjYSLxIkEhwS",
                "center": [1.9114940151515132, 46.598370747474775],
                "label": {
                    "name": "France",
                    "coordinate": [2.674303199999999, 46.574271046518994],
                    "fontSize": 2.47068667
                }
            }, {
                "code": "FI",
                "faceCount": 171,
                "faceOffset": 15588,
                "border": "nhfGF4gXgBeNF30XkheLF6MXcRcrFx0XFBf3FtMWbxY5FhQWUhbIFrgWzhbCFtgWxxbdFvAW7hYJFw4X6xbkFrEWYBZpFj0WSRYuFkgWOhaDFnQWfRaHFqMWphaRFrMWlxYcFzYXLRdgF/kXwxfUF7IXuxfJF54X",
                "center": [25.252839643274825, 65.12211604678366],
                "label": {
                    "name": "Finland",
                    "coordinate": [26.19995400000001, 63.0149856078028],
                    "fontSize": 2.81310725
                }
            }, {
                "code": "NI",
                "faceCount": 54,
                "faceOffset": 15759,
                "border": "vwXZBeMFHwY4BnkGfwZxBn0GawZuBmcGXgZkBlkGDwbmBaAFrQXDBb8F",
                "center": [-84.82658668518519, 13.191695722222224],
                "label": {"name": "Nicaragua", "coordinate": [-85.4020116, 12.603235340282415], "fontSize": 1.45799613}
            }, {
                "code": "NL",
                "faceCount": 108,
                "faceOffset": 15813,
                "border": "xxLWEskS2xLhEtwS9BLrEuwS/RIBE/gS7RLoEuISuxKsErESqRK3EqYSthLIEvwS8BIGE/4SDhMEEzITRBMnE0MTShM0E7wSuhLFEscS",
                "center": [5.542743944444438, 52.242889120370386],
                "label": {
                    "name": "Netherlands",
                    "coordinate": [5.465566800000006, 52.00763315186535],
                    "fontSize": 0.98808563
                }
            }, {
                "code": "NO",
                "faceCount": 822,
                "faceOffset": 15921,
                "border": "TBR5FEYUVBQ7FEgUfRS7FMMUpRTcFN4UBxUEFTgVJRVRFZsVohX8FQ0WCBYUFjkWbxbTFvcWFBcdFysXcRejF4sXkhfHF+IX3herF7cXphe1F4YX6heZF4EXaxd4F2MXdRdaF4IXWxdFF1gXQRcuFzEXAxf4FgYX/xYbF+0W4RbyFsYWsBZkFp0WNxZaFlEWWxY4FhAWIRb9FQoW9RX2FdAV6BWqFaUVdxWWFWsVjBU9FX0VahVyFTUVUxUnFVAVLxVBFTAVHhUBFR0VGRXyFBsVDBUPFfYU0hQVFaAUvBSSFKoUgBSeFIcUxBRwFH8UfBSLFI0UbxR2FFYUbRRRFH4UbBRJFEEUPhQ8FBoUThQjFCwUFhQIFPYT2RPlE7cT4BPKE94TBhQMFAQU+xMUFBsUIRQcFCUUDRQkFP0TBRTdE+wTwROhE64TmROGE48TdxOVE2kTfBNjE30TQBM4E2gTDxMmExATLxNTE0ITNRMWEx8TEhMCExMTzhLeEswSLBPBEtoS1RLYEs0S1BLKEvkSwhLuEsMS3RL3EhsTHBMqEyATNxNME1ATSxNPE1sTThNVEzwTSBMhExUTAxPgEsQS6RLREuMSwBLTEvIS8xLLEt8S9RL2Eg0TRxMdEyUTDBPxEhET0BLnEhoT/xIkEwsT6hLlEi0TIhNtE28TexOKE4wTmBOjE60TxBO2E+gT9xPnE/oT+BMAFPkTARQiFC4UNRRhFGoUTBQ=",
                "center": [13.675940718978099, 64.71278794282219],
                "label": {"name": "Norway", "coordinate": [9.78710400000002, 61.39060234990319], "fontSize": 2.61759615}
            }, {
                "code": "NA",
                "faceCount": 75,
                "faceOffset": 16743,
                "border": "rxbEFuUWBRf5FroWrhYiFs4VuRW9FIwULxQzFN8U2BQCFT8VYxV2FacV2xX/FQIWABYpFioWrxY=",
                "center": [18.927919586666665, -21.470599599999993],
                "label": {
                    "name": "Namibia",
                    "coordinate": [16.988817600000004, -21.97705673355394],
                    "fontSize": 2.6026473
                }
            }, {
                "code": "NE",
                "faceCount": 99,
                "faceOffset": 16818,
                "border": "fhKEEnASYxKFEqcSshK0ErUS+xJXEz0UnxTOFPQUABUgFQgVmhSkFF4U/xPAE2ETNhMZEwATrhKoEpwSlRKWEpQSjBJ9En4S",
                "center": [6.755544101010101, 15.88001184848485],
                "label": {
                    "name": "Niger",
                    "coordinate": [9.205027200000004, 17.253466088661852],
                    "fontSize": 3.09488964
                }
            }, {
                "code": "NG",
                "faceCount": 132,
                "faceOffset": 16917,
                "border": "/BMfFDgUUhR3FLAU6hTpFMcUwRSkFF4U/xPAE2ETNhMZEwATrhKoEqsSnxKaEpkSqhKlErkSzxLmEtIS7xLZEuQSCBMoEysTMxMuEz0TORNGE0UTXxOCE5ITyxP8Ew==",
                "center": [7.930989969696976, 8.265660007575752],
                "label": {
                    "name": "Nigeria",
                    "coordinate": [7.899894000000018, 8.696139207785974],
                    "fontSize": 3.25225782
                }
            }, {
                "code": "NZ",
                "faceCount": 186,
                "faceOffset": 17049,
                "border": "9iX9Jf4l5CX3Jfwl9SX7JfMl6iXyJewl9CXmJekl4CXjJd8l2iXTJdkl3iXhJe4l+iUDJgEmBSYIJhEmGSYdJhgmECYNJgAm9iX//5IllSWcJZkloCWnJcElyyXMJdYl0SXYJdwl7yXnJesl8CXoJe0l1SXbJc8lxyW7JcAlqSWRJZgllCWaJZIl",
                "center": [173.05285202688182, -40.08353389247311],
                "label": {"name": "New Zealand", "coordinate": [170.7548291015625, -43.70949949333329], "fontSize": 2}
            }, {
                "code": "NP",
                "faceCount": 69,
                "faceOffset": 17235,
                "border": "0B3VHdod8B0HHgEeyB2lHZQdhB1rHVQdLx08HVMdWR1fHW4dmR2kHasdth2yHcEdzB3QHQ==",
                "center": [84.0667473188406, 28.393582130434794],
                "label": {"name": "Nepal", "coordinate": [83.84646960000002, 27.9972623990429], "fontSize": 2}
            }, {
                "code": "CI",
                "faceCount": 87,
                "faceOffset": 17304,
                "border": "eRGFEX4RgRF8EX0RhhGXEaQRpxG7Ed8R+REYEh8SABIVEg0SBBL9EfER9BHbEckR1BGJEYwRbRF1EXERfxF5EQ==",
                "center": [-5.778911954022989, 7.616899908045972],
                "label": {"name": "Ivory Coast", "coordinate": [-5.477309999999999, 7.315699578928552], "fontSize": 2}
            }, {
                "code": "CH",
                "faceCount": 54,
                "faceOffset": 17391,
                "border": "dhOdE6QT4hPfE/MT9BO9E7ETtBO6E38TgBNgE10TOxMFEzATQRNiE3YT",
                "center": [8.638777462962963, 46.88060983333335],
                "label": {
                    "name": "Switzerland",
                    "coordinate": [8.250512400000002, 46.68775157118697],
                    "fontSize": 1.49404287
                }
            }, {
                "code": "CO",
                "faceCount": 264,
                "faceOffset": 17445,
                "border": "qgrPCj8K6wlmCT4JTgkhCeYIPAlYCWcJlgmmCYYJ7QiMCHoIawiECFwIQQgvCN8H5wfAB9EHrwekB5kHwwe0B80HsQfBB70Hzge3B9oHpQecB5oHlgeVB5MHiweCB4AHewd1B3IHVwdpB3EHvwcICEAIYAiLCNEIEwl9Cd4J8QnYCcEJ2gn+CRoKMgohCvIJ9QlHCjoKCQoICpIKjQqkCtEK6Ar2CuAKrAraCqoK",
                "center": [-73.50221637878786, 3.7231044393939388],
                "label": {"name": "Colombia", "coordinate": [-73.0239696, 3.525703248339596], "fontSize": 3.57033563}
            }, {
                "code": "CN",
                "faceCount": 1296,
                "faceOffset": 17709,
                "border": "8R/yHwggEyAoICIg/x/xH///UyFiIV0hciF1IV4heiFmIVkhJCFuIUAhIyEFIRAhICE7IW8hRiErIfIgKCEfIT4hRSF0IYshjiFgIUIhCyH0IOog5iDIIMsg6SABITEhVSGGIVYhaSFUIcwhEyJDImgiZSKEIpcinSKxIqgixSLLIsEi1CL+Ig8jFyMnIyUj/CLwIsMiqyK3IlgiWSIXIuAhpCF5IUkhMCEZIT8hRCHxIPsg8yDRILAgnSC+IM4g4CAKIQ4hEyHAIK0goCCGIGggPSAxIDwgHSAEIN8fkx9cHyYf4x6sHpUemR5xHkUeQx5GHjUeFR4NHgAe/R3zHe0d4h3dHdgdzx3DHcAdvR21Ha0doB2JHYUddx1+HYIdgB1/HW8dZR1KHSgdQB06HUsdOx1DHTIdNB0dHQkd7BzjHNkc1hzNHLccpxyqHMwczhzRHM8cvxzDHMoc3BzgHAIdBx0NHRcdFB0jHRYdEh0PHRMdGh1THVkdXx1uHZkdpB2rHbYdsh3BHcwd0B3VHdod8B0HHhoeHR4qHjIePh5JHk4eXx6FHpgeoh6nHq0eox6vHrAerh6+HsQexx7NHtse6B7xHusewx7KHsIe9B7mHvUeCB/+HhAfGx8xHzQfOR9FH0EfRB9NH1QfYB9nH3sfnx+iH8YfxB/oH+8f7h/7HwkgEiALIBAgGSAfIBYgHCA2IDsgRiBKIFAgVSBYIE4gYyBlIGYgVyBdIG8gYSB0IHwgqyC0IKwg2SDNINYg2yDcIOMg4iDtIOcg+CDwIPYgBiH9IAgh9yDvIPwgFyEHIQIhIiEbIS8hJiEzIUghOSFhIVMh",
                "center": [103.56560471141962, 36.02326294675923],
                "label": {"name": "China", "coordinate": [100.0381212, 34.5914045595505], "fontSize": 8.297616}
            }, {
                "code": "CM",
                "faceCount": 105,
                "faceOffset": 19005,
                "border": "ehOCE5ITyxP8Ex8UOBRSFHcUsBTqFOkUxxTBFN0U4xT4FPkUEhXKFLoU/xQKFdYU7xQmFS4VJBXiFJQUZBQeFNwTzRPHE5YTkBN6Ew==",
                "center": [12.8376446857143, 7.014200971428572],
                "label": {"name": "Cameroon", "coordinate": [12.165973199999986, 4.627795810257056], "fontSize": 2}
            }, {
                "code": "CL",
                "faceCount": 678,
                "faceOffset": 19110,
                "border": "4wk3CtMJ1AntCdUJAwouCmYKZQpkCmEKsgm9CbgJZAnqCbYJ6QniCfMJFQoHCkAKMwpFClAK4wn//yAJLgkLCQkJJgmMCR8JEQkpCQUJBwneCPMI0AgSCcMI0wi+COkIBgkVCSgJMgkQCT0JPwnxCDUJ7wgNCfII4gjuCNQI3QiqCKwIywjBCIgI1gjPCJoIgwiuCGYIswh+CK0IgQjACJEIuAh9CHIIlgh5CJsInghoCNII8AjHCPUIvwinCGIInQhtCKgIhwhTCFkILAg8CCkIfwiPCKQIkwiCCG4IgAiZCLQIrwi5CKEItwjgCMIIxgj8CMwI1wgdCd8I4Qj/CCIJMAnsCBsJAgkjCRYJOgkaCUQJQAkXCUwJUAkxCQoJ+Qi7CNkIsgiiCPQIyQj7CI4JfAmbCYgJswnSCdkJxAn0CdcJ/wknCigKSQpWCnUKXQqOCqkK4grvCtcKawp9CmgKhwpbChsK9gkKCsoJ7gkSChAKyQnWCaAJugmQCX4JaQl6CV4JXQl5CXIJqAmdCWAJmgl2CX8JaglvCUsJOQlTCTQJzQj9CFIJRwlsCfsJdAo7CrsJrgmcCUMJcAljCXQJogk2CVkJLAlICfYIJwkgCQ==",
                "center": [-72.14039846165188, -45.28662784070804],
                "label": {"name": "Chile", "coordinate": [-73.0222668, -41.153034147699], "fontSize": 4.04207897}
            }, {
                "code": "CA",
                "faceCount": 4782,
                "faceOffset": 19788,
                "border": "VwNcA2ADaQNuA1kDeANxA3kDagNyA2wDgwOCA4oDjAOAA4EDfANtA3QDVANhA4cDkAOSA48DogOhA6UDtQPIAx4EEgQqBEAEUQQ7BC0EKwQTBB8EEARvBFwEewRsBHgEdwSRBIEEmAR/BG4EjgSZBJ4EhgSUBLgE2wTZBLoEzwTHBOAEfARkBHUEgwRhBHEEYwRrBG0EZwSSBH0EvASaBNgE7QTqBBUFAAX8BAsF7wQ4BRcFMgUtBToFXgWQBZoFfQWABawFpwXHBe0FJwYJBjUG+QUBBvQFEwZBBmEGogZ6BtkGrwbdBpIG3wbOBnIGVQZYBk4GPwZCBh4GLQYIBjIGKQY2BiwGOwY8Bk0GYga9BdwFqwVOBRkFtwWLBUAFSQU5BUUFPAX5BAUF+gQPBSoFLAX9BAwF9AT7BOUE8gTaBOIE0gS5BK4EsgTLBMUEzQTkBP4E8AQnBeUFDgb8BRcGngagBsoGuAbuBhcH7QYpB0kHOgdKB2cHWQd3B1MHWAc4B6IH0wf5B/oH4gdzB3QHqgeYB6AHxwe5B+YHrgejB7wHmweyB4YHtgeSB4gHswdsCGEIxQhiCVEJhQluCZMJ5wkCCiYKNAoLCh4KsAkiChYKQQolCiQKBgoOCuYJDQo5CnwKfwo1CngKnwqnCqsKlAqwCq8KuQq6ChgLNQssCzsLKQtACzILZwtHC2ELUwuAC1ULfwtuC4YLoguIC7oLsgu/C7wL0wu+C+kLwgvzC+0LBAzdCxcMBgwVDOsLIwwqDA0MNQw8DDMMNgxIDBoMZwxGDFUMFgxXDDIMVgw+DGgMYAxuDFwMcwx4DHAMdAyWDIoMnwyaDKwMpQywDJkMwgy6DM0MuwzSDNAM1gzZDBgNxwzwDLQMjQy1DKkMCg3qDPkMFA0kDRINGQ02DTANUA09DVQNMw1bDToNVw0mDeIMtwwQC9UKSwqYCYwKHQt8C7YLnAu0C2kLOAv4ChkLTAuMC2ALigugCyAMRQxtDF4MggzZC9wLtwtYCycLPQskC6ELuwvoC4MLsQuSC48LOQswCxUL3gqxCrIKQgq3CVUI4wdtB1IHXgePBoYGfgaXBqsGlgZoBmkGVgZQBjQGIwaBBVoFJAUaBe4EvQSkBJ8EawJhAl4CVgJmAlcCWQJTAlECPQJSAkYCSQJHAjUCJAItAi4CLAI2AiACJwIcAhACEwIMAgICDwINAgsCBQIDAgACBALoAf0B5AH1AeUB6gH+AewB7wHmAeIB8wH8AfgB+gHyAfcB5wHdAeEB2AHZAdsB1gHUAdEB0AHNAeMB0gHVAdMBywHKAbwBvQHIAbMBtQHBAbYBwwG5AcYBvwHHAcUBxAG7AcIBugG+AZoBjgF0AWYBZQFeAWABVwFWAV8BYgF1AXsBcwF2AXEBeQF6AX0BfgGCAYMBhgGFAYABsgHJAa4BqAGXAY0BlQGTAZ0BngGhAZ8BowGiAaYBoAGlAakBpAGsAa0BtwHPAcwBzgHpAdoB3gEUAh8CDgIdAhUCJQIWAigCGgI0AjACPwIzAlQCZAKJAsMC0QLrAu4C0gLXAg0DKAM6A0wDUwNXA///9QwNDQMNIg0WDU0NZA1DDVYNPg0pDT8NYg1BDWcNaQ1lDWwNdg1/DYENqQ27DZMNsg2ZDaoNlA2RDdMNmw2xDaQNuA3HDdcNyQ3NDdoN4Q3PDbANsw2ODaENjQ2CDYUNWQ1GDXQNbw1fDTwNXA1JDVENKg3TDM4M6QzRDN4M1wzfDO4MBQ31DP//8gr8Cu4KwwrtCt0KqAoBC8EKMAq1Cm0KuwqPCkwKcQpUCpcKPQpNCv0K+wr3CYEKoArmCrMK/AliCtEJhAoqCs8JBAqtCYcJowl1Cb8JxwkzCVoJLQmlCTgJ5wgECasI5QjKCIkIvAhNCGQISQhqCD4IkAhRCBEIQwgDCFgIRgitB3YH2wdlB50HZgd4B08HWgc7BzYHJgc9ByAHDwcbB+8G/QboBggH9QYMB9cGIgfJBgoGZQb7BVcG5wX1BT0GGwZMBvYF1wUvBiYGDAYZBrsFJQbMBdMFwgUkBhAGfAVjBUYFUgVCBUcFtAVTBZYFzgXFBeEFBgbdBesFggapBsMGgwatBvAGvwZqB2MHPwdbB24HVAd+B6kHrAfcB8gH5AfSBw4I9QcxCPYH8gdfCFoIowiSCLoItQjqCPcI6AhVCXAI2AgaCEcINQg/CCsIOwglCLsHxgeJB4cH7wcnCCMIZwhvCFYIaQh7CJcIlQi2CKkI2gjcCOsI5AgOCSUJKwk7CVcJTwlrCW0JggmDCZ4JWwmRCbUJpAkrCzQLKAsxCw8LGwvUCr4Kxwq2CsIKkwpPCnAKvQqlCgwLCAsUCz4LcguCC2wLmQtqC50Lngt+C5cLbwt6C0sLeAtGC0gLIwsFCwIL/wrnCvQK0grpCs4K3AqeCq4KgAqFCpUKmQqbCpEKiQqLCncKWAqKCp0KnAqjCq0K3wqhCtsK5Qq3CusKKgtaCzYLrQtXC44LZAuVC3MLqAuFC5sLtQusC98L7AvaC+4L0gspDPwLQAwBDEoMXww3DGwMOAwADAUMzgvwC/QLzQvgC5YLxwuLC8kLpgvDC58LcAuUC10LYwtOC1wLPwsuCzcLGgv+CiULDQsDCwQL8gr//8UG1gZ7Bo8HMQf7B2IH6AdCB1UH8gZqBncGEgbABfAFmgbpBaMFVgUrBkgFNgWvBTAFJgVRBQoFjQUxBrgFFQZNB4oGywalBgcH1AZ5BxkHNwceCAsIPQi+B3YILwnICOwJHgtjCpMLhAv+C+ULeQyuCzgKCgvhCacLLAq5CegJRQnOCY0JtAmhCYoIXggACY0HdAhkB6gHhQfrB2MI7QdOCOAHNAgdCIMHpwdwBxQHtQblBqcGuQZMB1wHRQeeB38H6wb+BosGrAaEBnMGfAZGBksGFgZABhwGxAXPBX4FeQVzBUwFdQXBBZ8FhgWOBcsF4gU6BnAGXQadBloG/QVFBuoFTwYYBjMGIgYuBvcF0QXgBaUFsgWmBbkFFAacBpQGpAZ4BtMGKAZ0BkQGNwYRBskFBAbKBcgFXwbEBjMHzQbFBv//0ATfBMYEBgU9BfYEtgSXBLsEjASPBIcEiASQBIkEiwShBJ0EtASbBNAE//9eA2YDWwNYAzEDRgM7A1IDTwMjAx8DDgMZAwsD3gLNAuQCywLHAt8CwgLcAroC2QLsAvsC9AIqA+gCCANQA4gDkQOGA3sDaANzA14D///fAesB7QHcAdcB8QESAikCUAJIAlUCHgImAhECCgIBAgcC/wH7AfkB9gHwAfQB4AHfAf//CAIhAjICIwJMAioCiwKaAp8CnQKlAqMCvwLUAqYCogKYApUCagIXAiICCAL//84D1gPJA88D+AMCBPADAwTgA/wDCAQYBEEEMgRGBEgEOQQmBD0E8gPnA/UD4wMJBL8D2QPOA///SgVnBUMFHgU+BRIFXwUTBS4FGwXcBOMEjQRYBHMEUwSwBJYE6AQEBQgF+AQUBSgFIAVVBXQFeAVHBm8GbQa8BiMHHQdIBxYHQQdAB8wGWwbGBXAFawVKBf//DwQsBBYEIgQkBEIEaARXBGkEVQR0BGYETARLBDQEFwRPBDwEVAQ4BAUE+QPbA+sD1AP7A+YD9APqA+0D2APKA8ID5QMPBP//AgYLBvgF1QXNBdQFsAXkBfMFAwaBBoAGmwaYBukGJQf2BrIGxwbABj4GHQYCBv//RQhUCDMI6gfKB8sH8QdFCP//kQyrDL8MaQxiDJ4MpwydDKgMcQyqDJEM//8dBC8ERQScBGUE/QMbBBUEMQQdBP//lAWeBYgFlwVuBXcFbQVEBVcFBwXsBBEF4QTWBOkEyAQ1BQIF9QQfBecEowSEBMkEgARaBMIEtQTOBF0E1wSTBOYEygTzBCkFYgVvBYkFcgWhBaQFjwW2BagF0AXYBdYF6AUgBrUFogWUBf//YgN9A5MDqAOjA7ED3wPhA7MDuwO4A8YD0AO+A5gDngOEA38DdQNKA/0CBAP1AvkCyAK+AtYCCgMeA/MCvAKxAtgCtAKzArkCpwK1Aq4CwQLmAvIC8ALlAvYCBQMkAxUDGwMtAz8DNQNAAywDQgNBA0cDTQNaA2MDbwN3A3ADYgP//zcDOQMrA0MD/AL/AhMDNwP//6kCrAKqArcCtgLFAsYCzgLJAs8CzALTAsoCpAKXApACjAJyAmACkQKSApYCmwKhApwCngKpAv//HAQnBFsEqwSVBKkEUgQ2BFYEGgQuBBwE///6BigHugcVCEQH+Ab6Bv//+gP/A/YD0wPFA7ADjQOgA5sDqgOuA6sDtwOsA7IDmgOnA8EDwwPcA/cDCgT6A///lAOmA5kDegOUA///3QTeBGAEhQTEBN0E",
                "center": [-88.60708353283108, 66.063801233375],
                "label": {
                    "name": "Canada",
                    "coordinate": [-110.27687399999999, 58.31839051463935],
                    "fontSize": 9.28478718
                }
            }, {
                "code": "CG",
                "faceCount": 102,
                "faceOffset": 24570,
                "border": "YBRuFIMUnBSsFMIU1xTgFLQU2xTIFI8UlBTiFCQVLhVLFXkVwhWjFY4VLBUzFRoV6xTVFNQUqxSYFIoUdRQ/FBIUJhQ6FCoUYBQ=",
                "center": [14.41640197058824, -1.5429683333333337],
                "label": {
                    "name": "Congo Republic",
                    "coordinate": [15.610298400000016, -0.32501239856238245],
                    "fontSize": 1.41549993
                }
            }, {
                "code": "CF",
                "faceCount": 99,
                "faceOffset": 24672,
                "border": "eRXCFb4V5BUVFm0Wlha3FuYW8xYQFxoXVRdGFyoXKRcCFwQX3xbgFsEWyRaPFkwWSxYOFtQV1xXBFQoV1hTvFCYVLhVLFXkV",
                "center": [21.511142888888884, 6.490782525252527],
                "label": {
                    "name": "Central African Republic",
                    "coordinate": [20.8845936, 6.012409216700622],
                    "fontSize": 2
                }
            }, {
                "code": "CD",
                "faceCount": 213,
                "faceOffset": 24771,
                "border": "TRRlFGgUiRSKFJgUqxTUFNUU6xQaFTMVLBWOFaMVwhW+FeQVFRZtFpYWtxbmFvMWEBcaF1UXeRezF98X1xfzF8EXsBePF5cXpRepF64X2BeQF3sXiRd6F5gXrBe6F7kXrxeWF34XXBdJFz0XHhcMFwsX6hbUFmMWZhZQFk8WExYXFu0V4xWDFV4VRRW+FI4UWhRNFA==",
                "center": [22.741169220657273, -4.703429568075121],
                "label": {
                    "name": "Congo Democratic Republic",
                    "coordinate": [22.625816399999984, -4.2417987861780695],
                    "fontSize": 1.98875272
                }
            }, {
                "code": "CZ",
                "faceCount": 45,
                "faceOffset": 24984,
                "border": "RBTRFPMUNxUtFUoVYBVaFZAViRW/Fc0VXxX1FO0UsxRxFEQU",
                "center": [15.883877333333338, 49.83619744444445],
                "label": {
                    "name": "Czech Republic",
                    "coordinate": [15.428736000000018, 49.62629383574384],
                    "fontSize": 1.74702144
                }
            }, {
                "code": "CR",
                "faceCount": 60,
                "faceOffset": 25029,
                "border": "dQZ2BmAGZgYwBioGBQYHBiEGDQbsBd4F7wXbBeYFDwZZBmQGlQaFBo4GhwZ1Bg==",
                "center": [-84.39685131666667, 9.881514383333334],
                "label": {"name": "Costa Rica", "coordinate": [-84.306348, 9.834211245701178], "fontSize": 1.24252105}
            }, {
                "code": "CU",
                "faceCount": 102,
                "faceOffset": 25089,
                "border": "qAbGBrYGiQZUBhoGQwZTBrEGyAbPBuAG2wbmBgQHCgceBywHwgewB+EHKggmCI4ITAhLCEgIQgimB9UHzweOB2wHLwcOB7oGqAY=",
                "center": [-79.54644245098034, 21.87221587254901],
                "label": {
                    "name": "Cuba",
                    "coordinate": [-79.29335160000001, 21.792525163461377],
                    "fontSize": 2.77551079
                }
            }, {
                "code": "SZ",
                "faceCount": 15,
                "faceOffset": 25191,
                "border": "4Rf1FwYYDBgHGOwX2hfhFw==",
                "center": [31.43784106666666, -26.609520333333336],
                "label": {
                    "name": "Swaziland",
                    "coordinate": [31.482201599999982, -26.78471050955571],
                    "fontSize": 1.03452957
                }
            }, {
                "code": "SY",
                "faceCount": 42,
                "faceOffset": 25206,
                "border": "VRlmGUcZHBnMGM0YtRiuGLgYxxjKGKgYqxjRGBAZUBlVGQ==",
                "center": [37.914083142857145, 35.05956245238095],
                "label": {"name": "Syria", "coordinate": [38.3697936, 34.863343881959196], "fontSize": 1.82102859}
            }, {
                "code": "KG",
                "faceCount": 96,
                "faceOffset": 25248,
                "border": "NRxVHEgcTxxdHGgcoxylHLQcuRzXHB4dNB0dHQkd7BzjHNkc1hzNHLccpxx0HF8cTBwbHCYcOxxJHGccmxxxHGYcWRw1HA==",
                "center": [73.49153818750003, 41.280596854166646],
                "label": {"name": "Kyrgyzstan", "coordinate": [75.01174919999997, 41.364994496248], "fontSize": 2}
            }, {
                "code": "KE",
                "faceCount": 69,
                "faceOffset": 25344,
                "border": "7BgaGToZRBlKGUwZSxlWGVsZTxlNGWEZUxlIGSMZ/RjaGLcYZBhVGGgYiRhRGFIY6xjsGA==",
                "center": [38.64441504347828, 0.5044362898550725],
                "label": {
                    "name": "Kenya",
                    "coordinate": [37.870970400000004, 0.6679395623199708],
                    "fontSize": 2.74961686
                }
            }, {
                "code": "SR",
                "faceCount": 48,
                "faceOffset": 25413,
                "border": "NQ1LDUcNfA2XDYMNjw2WDWoNTw1MDSUNHg0aDQQN/wwODR0NNQ0=",
                "center": [-56.08482627083332, 4.348842374999999],
                "label": {"name": "Suriname", "coordinate": [-55.850328, 4.28490835385684], "fontSize": 2}
            }, {
                "code": "KH",
                "faceCount": 60,
                "faceOffset": 25461,
                "border": "qB+yH5Ufhh+AH3gfch9wH2MfWh9RH2Ufmx+uH6sfvB/QH+If4B/jH7cfuh+oHw==",
                "center": [105.22285303333332, 12.435452299999998],
                "label": {
                    "name": "Cambodia",
                    "coordinate": [104.81268959999997, 12.625458190054944],
                    "fontSize": 1.46370518
                }
            }, {
                "code": "SV",
                "faceCount": 18,
                "faceOffset": 25521,
                "border": "egWcBZkFlQV2BUEFWwVcBXoF",
                "center": [-88.68122938888888, 13.708399],
                "label": {
                    "name": "El Salvador",
                    "coordinate": [-88.88914439999999, 13.472912076896476],
                    "fontSize": 1.24156451
                }
            }, {
                "code": "SK",
                "faceCount": 27,
                "faceOffset": 25539,
                "border": "XhZ8FkIWBhbqFc0VXxVnFWwVxBUZFl4W",
                "center": [19.54285651851852, 48.773125629629625],
                "label": {
                    "name": "Slovakia",
                    "coordinate": [19.332993599999988, 48.71675314744338],
                    "fontSize": 1.62078226
                }
            }, {
                "code": "KR",
                "faceCount": 87,
                "faceOffset": 25566,
                "border": "SCJPIkIiPiIyIiAiNyIfIisiOSItIkEiMSIuIhkiLyJGIjgiQCI6IkciZiJyInkijSKOIogiWiJbIlYiUCJIIg==",
                "center": [127.24466031034486, 35.986681977011486],
                "label": {"name": "Korea South", "coordinate": [128.0639592, 36.22355000140815], "fontSize": 1.64247012}
            }, {
                "code": "SI",
                "faceCount": 39,
                "faceOffset": 25653,
                "border": "lhSpFOEUKBVHFUQVEBUTFf0U5hSiFKcUuBSbFKYUlhQ=",
                "center": [14.692626358974355, 46.08682225641026],
                "label": {
                    "name": "Slovenia",
                    "coordinate": [14.685623999999994, 45.98586990036057],
                    "fontSize": 1.24156451
                }
            }, {
                "code": "KP",
                "faceCount": 93,
                "faceOffset": 25692,
                "border": "2yHsIQsi8yECIu8h4SHZIcwhEyJDImgiZSKEIpcinSKxIrUiuiKVIpYiVyJRInIiZiJHIjoiByIOIv0hAyLrIfkh2yE=",
                "center": [127.0049808924731, 39.84042874193549],
                "label": {
                    "name": "Korea North",
                    "coordinate": [126.24765480000003, 39.96161431763972],
                    "fontSize": 1.62759352
                }
            }, {
                "code": "SO",
                "faceCount": 78,
                "faceOffset": 25785,
                "border": "ahlwGY8Z6BkXGqoZhBlhGU0ZTxlbGYEZwhkVGnIadBqBGnYafhpvGl0a+RnSGbsZpxmXGXgZcxlqGQ==",
                "center": [46.230984461538426, 7.868550833333331],
                "label": {
                    "name": "Somalia",
                    "coordinate": [47.62406159999998, 9.256610851447695],
                    "fontSize": 2.46764994
                }
            }, {
                "code": "SN",
                "faceCount": 93,
                "faceOffset": 25863,
                "border": "phCqELQQxBC3EMMQvhDoEAER/BDmEOQQ1xDWELYQtRC7ENwQ4RDdEL0QuRD4EAMRGREoEScRHREbEf0QyBDAELMQphA=",
                "center": [-15.122621204301073, 13.66340623655914],
                "label": {"name": "Senegal", "coordinate": [-14.717757599999985, 14.569472575579379], "fontSize": 2}
            }, {
                "code": "SL",
                "faceCount": 39,
                "faceOffset": 25956,
                "border": "DhEQERcREhEUEQ0RFhElETgRMREzESsRGBEMERERDhE=",
                "center": [-12.35551653846154, 8.621131230769231],
                "label": {
                    "name": "Sierra Leone",
                    "coordinate": [-11.987060399999994, 8.45551878070859],
                    "fontSize": 1.48285389
                }
            }, {
                "code": "KZ",
                "faceCount": 777,
                "faceOffset": 25995,
                "border": "bRt+G5MbgBuHG3cbgRt6G5cboBu0G7Ub2BsUHC0cRRxWHEscURxyHG4ceBx/HKkcnByfHLIcwhzqHOUcAx0YHTAdPR1HHVYdYB19HZYdoR2oHawdsB20Hbcdwh3RHdYd4B3bHdkd5h3zHe0d4h3dHdgdzx3DHcAdvR21Ha0doB2JHYUddx1+HYIdgB1/HW8dZR1KHSgdQB06HUsdOx1DHTIdNB0eHdccuRy0HKUcoxxoHF0cTxxIHBEc+hvqG8YbwBu5G7obuBuwG6UbkRtjG0YbCBsJG/ca1RqpGpcanxp9GnMaZBqFGnUagBq1Gp0aqhqwGqcashp5Gk0aLhpDGiIa9xntGdUZ6xnjGeQZAhokGjsaNRpwGn8alBqbGroa3RreGuAa/xoXGy0bQBtWG18bhBuGG4kbchtdG3wbbRs=",
                "center": [70.57771969111974, 48.57978138996137],
                "label": {"name": "Kazakhstan", "coordinate": [65.9047176, 47.73513717142143], "fontSize": 4.98808575}
            }, {
                "code": "SA",
                "faceCount": 258,
                "faceOffset": 26772,
                "border": "2BgZGT8ZYxl9GaIZ2hn/GQgaKho9Gl8aWhpmGnEaexqHGo8amhrwGv4a6RqMGjoaAxrMGc0Zzhm2GZwZixl6GXUZbRlGGTAZGBkXGRUZDRkGGeUY3hiVGG8YhBi8GM8Y6Bj5GNgY",
                "center": [44.58283291860466, 23.50351660852713],
                "label": {
                    "name": "Saudi Arabia",
                    "coordinate": [44.2665972, 24.695591125603833],
                    "fontSize": 3.30666351
                }
            }, {
                "code": "SE",
                "faceCount": 336,
                "faceOffset": 27030,
                "border": "whbOFrgWyBZSFhQWCBYNFvwVohWbFVEVJRU4FQQVBxXeFNwUpRTDFLsUfRRIFDsUVBRGFHkUTBRqFGEUNRQuFCIUEBQVFDIUORQrFHoUaxR4FF0UiBSBFMkUyxTsFBgVTRU6FU4VQBVSFUkVVRU5FV0VKxVwFYoVnBWwFasVwxW3FbsVrRWYFXEVdBVXFUwVWRUiFXUVkRWVFX4VghV7FXwVeBWBFYcVhRWAFY8VlxWTFZ4V2BVlFWQVehVvFYgVbhWhFY0VqBXmFR4WQBYrFkQWNRZhFk4WcRZoFoYW3RbHFtgWwhY=",
                "center": [17.002518627976198, 61.527265898809475],
                "label": {
                    "name": "Sweden",
                    "coordinate": [15.179281200000005, 60.131109594710814],
                    "fontSize": 2.5176456
                }
            }, {
                "code": "SD",
                "faceCount": 174,
                "faceOffset": 27366,
                "border": "UxZlFlkWexZuFpkWmhbVFtcW1hb9Fv4W8Bf3F/YX0xjgGNsY4xgKGeIY1xjWGMYYyBi+GK0YkBh/GHEYXhhXGDYYJxhKGHoYmRiyGLcYZBhVGEAYKBgOGO0X3xezF3kXVRdGFyoXKRcCFwQX3xbgFsEWyRaPFnYWUxY=",
                "center": [30.228675632183915, 11.750394586206896],
                "label": {
                    "name": "Sudan",
                    "coordinate": [29.808478800000003, 14.051733809367084],
                    "fontSize": 3.24106431
                }
            }, {
                "code": "DO",
                "faceCount": 45,
                "faceOffset": 27540,
                "border": "jwmpCcIJzQkFCnMKggpeCh0KQwoXCgAKvAl4CXsJZQl3CY8J",
                "center": [-70.3786454444444, 18.794361600000006],
                "label": {
                    "name": "Dominican Republic",
                    "coordinate": [-69.85579680000001, 18.94824497288199],
                    "fontSize": 1.24156451
                }
            }, {
                "code": "DJ",
                "faceCount": 21,
                "faceOffset": 27585,
                "border": "cxl4GXIZaBl+GXQZZxlfGV4Zcxk=",
                "center": [42.60681452380952, 11.676728666666667],
                "label": {
                    "name": "Djibouti",
                    "coordinate": [42.511024800000015, 11.586109254532465],
                    "fontSize": 1.70141149
                }
            }, {
                "code": "DK",
                "faceCount": 96,
                "faceOffset": 27606,
                "border": "rxPJE7ATwxO8E8YTzhO4E9oT6RMHFNIT7hPvE9gTqBOiE6kTnxONE2oTZhN0E2cTZROFE4cTrxP//0sUaRQ3FEIUMRQDFBgUQxRfFEsU",
                "center": [9.886828302083332, 55.88996850000002],
                "label": {"name": "Denmark", "coordinate": [9.350749511718753, 55.80846804183741], "fontSize": 2}
            }, {
                "code": "DE",
                "faceCount": 180,
                "faceOffset": 27702,
                "border": "dBSzFHEURBTRFPMU9xTlFOgUxRTPFLEUqBSZFIYUWBR7FGYUAhQJFNMT1xOvE4cTcxNxE4ETmxODE5MTlBPQE4gTeRNkE00TPhNKE0MTJxNEEzITBBMOE/4SBhMXEwkTHhMUE24TXBNdE2ATgBN/E7oT5BP1Ew4UchSFFHQU",
                "center": [9.922413577777775, 51.732606988888875],
                "label": {
                    "name": "Germany",
                    "coordinate": [9.702619200000004, 50.975781600987865],
                    "fontSize": 2.56195498
                }
            }, {
                "code": "YE",
                "faceCount": 81,
                "faceOffset": 27882,
                "border": "jBqtGpMakBpEGjYauhmtGY4ZgBl3GWsZbRl1GXoZixmcGbYZzhnNGcwZAxo6Gowa",
                "center": [45.94978620987654, 15.840182012345672],
                "label": {
                    "name": "Yemen",
                    "coordinate": [46.71177839999999, 14.749697730745703],
                    "fontSize": 2.59275961
                }
            }, {
                "code": "DZ",
                "faceCount": 126,
                "faceOffset": 27963,
                "border": "ohKjErUS+xJXEz0UKBTqE6wT1BPWE8gTpxO1E54TchNYE3ATaxOEExgT1xK9Ep0SeRImEjUSNxJIEkASEhLzEfoR1hG6EZIRZxFqEWkRnRHaEYASfxKSEqIS",
                "center": [2.610591031746031, 29.050984023809523],
                "label": {"name": "Algeria", "coordinate": [1.7066592000000114, 27.764653950684924], "fontSize": 4}
            }, {
                "code": "MK",
                "faceCount": 15,
                "faceOffset": 28089,
                "border": "ERYWFmsWoBaYFiYWIBYRFg==",
                "center": [21.5267774, 41.47847586666667],
                "label": {
                    "name": "Macedonia",
                    "coordinate": [21.71678399999998, 41.54263511077187],
                    "fontSize": 0.86234677
                }
            }, {
                "code": "UY",
                "faceCount": 48,
                "faceOffset": 28104,
                "border": "uQ3QDaANYA1FDSsNDw0JDfgMAA39DPEM7AwHDSMNOA2QDcMNuQ0=",
                "center": [-56.341308979166655, -32.7272075625],
                "label": {
                    "name": "Uruguay",
                    "coordinate": [-55.87804799999999, -33.191409132272405],
                    "fontSize": 2.14826179
                }
            }, {
                "code": "TZ",
                "faceCount": 87,
                "faceOffset": 28152,
                "border": "0Rf6F1IY6xjsGBoZDxkkGR4ZIRktGUAZHRn3GOcYvxizGIYYXxgwGCMY6BfYF64XqRfFF9wX3RfPF9MX4BfRFw==",
                "center": [34.60406583908048, -6.660858022988506],
                "label": {"name": "Tanzania", "coordinate": [34.28054999999998, -6.367863192889989], "fontSize": 2}
            }, {
                "code": "LA",
                "faceCount": 126,
                "faceOffset": 28239,
                "border": "IB8iHxcfNB85H0UfQR9EH00fVx9fH2Qfcx9+H4wfhB+SH4sffR93H5ofmR++H8Mf3h/ZH+Qf4h/QH7wfqx+uH5sfoR+lH48fjR98H2sfWB9LHzUfKx84HyAf",
                "center": [103.94556188888883, 18.510260349206344],
                "label": {"name": "Laos", "coordinate": [102.58046639999998, 19.22048906632192], "fontSize": 2}
            }, {
                "code": "TW",
                "faceCount": 15,
                "faceOffset": 28365,
                "border": "HCFBIWwhdiFoIU4hISEcIQ==",
                "center": [121.18220760000001, 24.196199933333332],
                "label": {"name": "Taiwan", "coordinate": [121.066611328125, 23.70256070241176], "fontSize": 2}
            }, {
                "code": "TR",
                "faceCount": 219,
                "faceOffset": 28380,
                "border": "KBc3F0cXORdEFzUXPhchFzgXlBeMF74XnxehF+4XOhiPGKMYuxjDGAIZNhlZGW8ZfxmGGYMZmRmkGaYZoBmaGZIZnhmVGaEZpRmYGZMZbhlmGUcZHBnMGM0YtRivGMAYuhicGHUYVBgdGOkX1hfNF7YXfxdnF28XURd3F0wXWRdIF00XJRcoF///HxczFycXUhdoF24XmhdWFyQXOxcfFw==",
                "center": [34.10584581278539, 38.90987010958906],
                "label": {
                    "name": "Turkey",
                    "coordinate": [35.35143480000002, 39.09188274324174],
                    "fontSize": 1.81811774
                }
            }, {
                "code": "LK",
                "faceCount": 42,
                "faceOffset": 28599,
                "border": "XR1eHWcdZB1EHSsdJR0uHUUdKR0+HTYdTR1RHVodVx1dHQ==",
                "center": [80.71666969047614, 8.392095285714287],
                "label": {"name": "Sri Lanka", "coordinate": [80.68517640000002, 7.4880121867837035], "fontSize": 2}
            }, {
                "code": "LV",
                "faceCount": 45,
                "faceOffset": 28641,
                "border": "XRdkF1AXLxcIF+MW6RbPFoEWTRYtFi8WLBZcFvwWMhdyF10X",
                "center": [24.534777066666674, 56.920544533333356],
                "label": {
                    "name": "Latvia",
                    "coordinate": [25.729034400000018, 56.79200183701485],
                    "fontSize": 1.65975261
                }
            }, {
                "code": "LT",
                "faceCount": 36,
                "faceOffset": 28686,
                "border": "LBZcFvwWMhcsFzoXGBcRFxcXvRaNFo4WPBY2FiwW",
                "center": [24.023517916666666, 55.241473361111105],
                "label": {
                    "name": "Lithuania",
                    "coordinate": [23.87469599999996, 55.44003576767267],
                    "fontSize": 1.74277961
                }
            }, {
                "code": "TM",
                "faceCount": 156,
                "faceOffset": 28722,
                "border": "rxq2GsUauRrBGqUaqBqcGqQaxxrbGtca4xrTGssaphqiGqMalxqpGtUa9xoJGyMbIhs5G0QbOxtJG14bYRuOG5gbqxvDG8EbtxuvG6wbnhudG5oblBuCG38bZRtSGywbJRv2GuIazBrQGr8arxo=",
                "center": [57.372084224358986, 39.65160732051287],
                "label": {"name": "Turkmenistan", "coordinate": [58.604741999999995, 39.17490761294433], "fontSize": 2}
            }, {
                "code": "TJ",
                "faceCount": 114,
                "faceOffset": 28878,
                "border": "VBxXHEccMhwxHCUcHRwLHOsb6Bv3G+8b3BveG/4bEBwAHBwcIRwpHDocQhw5HEkcOxwmHBscTBxfHHQcpxyqHMwczhzRHM8cnRxlHFscYxxUHA==",
                "center": [70.56435643859653, 38.847147824561404],
                "label": {"name": "Tajikistan", "coordinate": [70.91890199999997, 38.659141733691214], "fontSize": 2}
            }, {
                "code": "LS",
                "faceCount": 15,
                "faceOffset": 28992,
                "border": "bBd8F6IXqheDF0AXVxdsFw==",
                "center": [28.202298055555556, -29.793770888888886],
                "label": {"name": "Lesotho", "coordinate": [28.3517352, -29.711684237202245], "fontSize": 1.24156451}
            }, {
                "code": "TH",
                "faceCount": 147,
                "faceOffset": 29007,
                "border": "Mh8zH0AfRh9MHz4fHx8NHwIf/R4UHxUfLh8oH0kfWh9RH2Ufmx+hH6Ufjx+NH3wfax9YH0sfNR8rHzgfIB8iHxcfFh8GH/ge0h7LHr0e5x72HtUeAB/7Hgsf7h7ZHuUeGB8cHyMfMh8=",
                "center": [100.77549466666666, 13.624265884353745],
                "label": {
                    "name": "Thailand",
                    "coordinate": [102.21910560000002, 15.59937675681839],
                    "fontSize": 2.06002593
                }
            }, {
                "code": "TG",
                "faceCount": 33,
                "faceOffset": 29154,
                "border": "WRJ4EncShhKIEo4SgRJuEnYSaRJvEmISaBJZEg==",
                "center": [0.8141691818181821, 9.110950484848484],
                "label": {"name": "Togo", "coordinate": [0.99782279999999, 8.542019112708678], "fontSize": 2}
            }, {
                "code": "TD",
                "faceCount": 96,
                "faceOffset": 29187,
                "border": "TBaPFnYWUxZlFlkWexZuFpkWmhbVFtcWIRX0FAAVIBUIFZoUpBTBFN0U4xT4FPkUEhXKFLoU/xQKFcEV1xXUFQ4WSxZMFg==",
                "center": [18.302760729166668, 13.382745468749997],
                "label": {
                    "name": "Chad",
                    "coordinate": [18.166773600000003, 14.626681683324195],
                    "fontSize": 3.23360968
                }
            }, {
                "code": "LY",
                "faceCount": 96,
                "faceOffset": 29283,
                "border": "nxTOFPQUIRXXFtYW/Rb+FvsW8RYBF/oWrRaoFkMWBxYEFtUVcxUWFfwUJxQpFO0T5hO1E6cTyBPWE9QTrBPqEygUPRSfFA==",
                "center": [16.557745322916663, 27.99933359375001],
                "label": {
                    "name": "Libya",
                    "coordinate": [16.65790920000002, 27.499397107171873],
                    "fontSize": 3.96832848
                }
            }, {
                "code": "AE",
                "faceCount": 48,
                "faceOffset": 29379,
                "border": "+RoKGwAbDBsOGxYbExsQGw0bAxvhGtwa1BqOGocajxqaGvAa+Ro=",
                "center": [54.89186799999999, 24.45729520833334],
                "label": {
                    "name": "United Arab Emirates",
                    "coordinate": [53.7987096, 23.4435311039334],
                    "fontSize": 1.29750383
                }
            }, {
                "code": "VE",
                "faceCount": 234,
                "faceOffset": 29427,
                "border": "+gsQDAoM+wv/C0kMswvWC3cLIQuQCnYKFAr4Cd8JDwoRCosJqgmBCV8JhAloCZYJZwlYCTwJ5gghCU4JPglmCesJPwrPCqoK2gqsCuAK9gocC1ILVgvjC+cLwQu5C40LxAvqCwMMCwyBDKIMlQxlDHIMrQyXDMAMuAyJDHsMWgxvDHUMgwx3DJIMjwxYDFIMLgwsDC0MKAwbDBMMEgwIDPoL",
                "center": [-65.43273895299147, 7.919219559829059],
                "label": {"name": "Venezuela", "coordinate": [-66.0066192, 7.417924048092372], "fontSize": 2.94430947}
            }, {
                "code": "AF",
                "faceCount": 156,
                "faceOffset": 29661,
                "border": "cxuMG4sbcRtuG2obeRtpG2gbdRtvG4IblBuaG50bnhusG68btxvBG+gb6xsLHB0cJRwxHDIcRxxXHFQcYxxbHGUcnRzPHL8cwxx8HFIcZBxKHE0cLBw3HCMcHhwHHPEb5BvnG8cbvhu8G5Ybcxs=",
                "center": [67.07889678205129, 34.80292328205127],
                "label": {"name": "Afghanistan", "coordinate": [65.9040156, 34.150890233842695], "fontSize": 2}
            }, {
                "code": "IQ",
                "faceCount": 96,
                "faceOffset": 29817,
                "border": "vBnGGcAZ0Bm4GaUZmBmTGW4ZZhlVGVAZEBkZGT8ZYxl9GaIZ2hnvGRMaFBofGisaLBotGhwaHRoJGhEa/BnEGcgZtxm8GQ==",
                "center": [45.2650875104167, 32.88784852083332],
                "label": {"name": "Iraq", "coordinate": [43.21160280000002, 33.01475346552514], "fontSize": 2.18946505}
            }, {
                "code": "IS",
                "faceCount": 171,
                "faceOffset": 29913,
                "border": "9hD+EPAQ9RDnEPEQ4xC/ELwQoBCjEJwQkxCUEIYQgRCAEHQQcBBYEGsQYhBpEDAQLRA/EC8QQBAoECYQKRAkECwQIxArEBsQJRAWEFwQNRBUEB0QQRBIEGUQSRBqEDIQMxByEJ0Q4hDuEPcQ+RAKEf8QCREGEfYQ",
                "center": [-19.702225865497084, 65.40857847953217],
                "label": {
                    "name": "Iceland",
                    "coordinate": [-18.226054799999996, 64.6610264675878],
                    "fontSize": 4.5736599
                }
            }, {
                "code": "IR",
                "faceCount": 285,
                "faceOffset": 30084,
                "border": "oRujG5wbmxuQG3MbjBuLG3EbbhtqG3kbaRtoG3UbbxuCG38bZRtSGywbJRv2GuIazBrOGpkadxpjGkYaPhoaGicaFhrYGccZqxmmGaAZmhmSGZ4ZlRmhGaUZuBnQGcAZxhm8GbcZyBnEGfwZERoJGh0aHBotGj8aQhpTGlwabhqDGooamBqrGsga2RrlGvgaDxscGysbiBuNG6Eb",
                "center": [53.165301287719274, 32.78374040701759],
                "label": {"name": "Iran", "coordinate": [53.444224800000015, 32.58285048650119], "fontSize": 4.01459122}
            }, {
                "code": "AM",
                "faceCount": 36,
                "faceOffset": 30369,
                "border": "gxmGGX8ZrBmvGcEZuRnZGdgZxxm9Ga4ZpBmZGYMZ",
                "center": [45.14646597222222, 40.14064402777775],
                "label": {
                    "name": "Armenia",
                    "coordinate": [44.75671919999999, 40.156119713272865],
                    "fontSize": 1.47759461
                }
            }, {
                "code": "AL",
                "faceCount": 36,
                "faceOffset": 30405,
                "border": "+RUDFhoWJhYgFhEWFhYFFvMV4RXvFecV6xXfFfkV",
                "center": [20.050917388888887, 41.08019658333334],
                "label": {
                    "name": "Albania",
                    "coordinate": [20.09017079999998, 40.89399791440362],
                    "fontSize": 0.95357287
                }
            }, {
                "code": "VN",
                "faceCount": 225,
                "faceOffset": 30441,
                "border": "hh+VH7IfqB+6H7cf4x/gH+If5B/ZH94fwx++H5kfmh93H30fix+SH4QfjB9+H3MfZB9fH1cfTR9UH2AfZx97H58foh/GH8Qf6B/dH9wf1x/BH80fqh+kH8Uf9R8FIPwfASD9H/gf6R/aH9Uf1B/SH9Mf0R/KH8sfyB/HH78fyR/PH84fuR/MH7MfwB+vH70fpx+xH5Qfjh+WH4Yf",
                "center": [106.15022395555555, 15.343033826666659],
                "label": {
                    "name": "Vietnam",
                    "coordinate": [107.73718559999998, 11.408907621215844],
                    "fontSize": 1.39062405
                }
            }, {
                "code": "AQ",
                "faceCount": 1923,
                "faceOffset": 30666,
                "border": "siXFJbkltCW2JaMlkCWTJWklbiVoJVMlLiX+JPkk8iTvJPAk6yTqJM4kyyShJJYknCSSJIAkhyR7JE4kZCRVJDskIiQNJCgjMCMfIxQjHiMcI6cifyJEIkUiKCL3IYAhzCCmIIUggSBWICQgISD0H+UfVh8tHwQf1x7FHlIeHh4LHgUe9R3GHZUdgx1pHWEdah0LHQAdjRyAHIscYBxTHFwcRhwrHA0c2RvpG+UbGBwSHAMcCBz/G+Yb7RsVHCAcChwqHBocMBwoHE0bHhsqG/0ayRpnGmAabBpJGkoaJRpLGiMa+BnnGf0Z2xnKGcsZURkrGSgZDBkHGf8Y3RjyGPUYzhi9GMIYWBg+GD8YIhjrF6wWoBUUFcYUcxRAFBkUiROgE3gTWhMpE5sSVxJKEk0SRhIrEiUSrBGoEcARqhGCEY8RchFdEUIRNRE+ESwRIhEjERoRKREhEQsR+xACEdAQshDOELAQxxAFEasQoRClEO0PzA+9D9EP+Q/hD+8P7A9zD1APrA32DNUM3AzFDGUIEAg0B8QHEgjZByQHAwdRBmEHtQfVBgUH0AZdCBwJLgh6B6EH/wc6CNAJMQriC/YLpQv1C8UL+QvvCxwMRwxQDH4MTwyhDFkMTQxjDEQMoAy+DMMMmwycDGsMWwyODHoMjAwYDIgMQwyEDGYMNAxdDB0MQQwPDB8M2wvmC9UL8QvGCwwMqwvLC2gLdgtRC5ELRQtlC00LawtPC5ALhwvRC7gL2AsUDCQMAgwwDFMMZAyGDKQMSwwhDFQMOgw/DL0MyQzKDN0M5AwVDS4NJw0fDdgMzAyADIUMQgwiDBEMJwz9C/cLygvAC9QLmAujC0oLDgsXC8wKwAoWC+QKCwvjCvMKywoHC1kKvArTCskK9wr6CisK3Qf4B2sHYAcABwsH3AbsBqoG8QX6BdoFugVxBYIFYQVUBV0FJQXLA7kDrwO6AwYEvAO9A9ID1wPuA+gD8QPiAwAEMgMpAz0DOAMdAyADGgMiAwkD+AIGA/oCAAPvAuAC4wLAArgCsAKNAo8BhAE/AUsBPAEsARgBOAFMAUQBTQE9AUgBQgFGAUABNwE2ATQBMgElASQBIQEbAR8BFgH/AO8A8QDdAMoAxQC5ALsAswC4AN4AyQA5AUoBKAHNAMEA1gDZAM4AAwH1APIAHAFjAVoBKwEOAb4AAQAAAFsSJyYmJsolziWsJZ8lqCVnJXAlRiUfJUQlJSUnJSIlKCUVJTUlDyUqJQElIyUJJSYlFyUhJXslnSWLJYcleCV9JWolciVjJUclXCVPJVglViVIJV4lTCVxJWwldSWFJX4ljCWIJaElqiWtJbgltyWvJbIl//+cCM4IsQgUCVQJrwlhCcsJ+ghJCTwKeQqYCnoK7wnlCVYJgAlzCZQJQQmsCcUJDAn+CEYJxAjVCHwIdQhKCDkInAj//xQEIAQOBAQEDQTvA+kD8wPsA8QDEQSKBGIEggR5BEkEcgReBEcEOgQoBCUEFAT//2EAfwCuAJUAYQD//68MsQyYDBkM7ApMDIcMrwz//9wJ2AqxCXEJ3An//zkPPg8bD8sOjw5lDnEN/A00DzwPKg9GD0QPJw8/DwgPOQ///+4BGAJOAjgCGwIGAu4B//9wAnkCWgKBAq0CggJwAg==",
                "center": [-12.296684095163807, -73.68587608112367],
                "label": {"name": "Antarctica", "coordinate": [70, -84], "fontSize": 8}
            }, {
                "code": "AR",
                "faceCount": 366,
                "faceOffset": 32589,
                "border": "ZgqICm8K1gp0C2ILEwtlCmYK//8gClMKRAovClUKewpOCqYKxQpBCx8LPAtCC/kKygrECvEKUAtJC20LZguwC4ELqQu9C94L0AukC3sLdQvPCyUMLwweDDsMKww9DCYMdgz0DBENMQ0tDRcNIQ3nDO8M5QzoDPwM+AwJDQ8NUg2nDaINfQ13DVUN4wwQDQsNfwwODAcMyAuvC5oLcQtECyIL4grvCtcKawp9CmgKhwpbChsK9gkKCsoJ7gkSChAKyQnWCaAJugmQCX4JaQl6CV4JXQl5CXIJqAmdCWAJmgl2CX8JaglvCUsJOQlTCTQJzQj9CFIJRwlsCfsJdApRCiAK",
                "center": [-66.04543952459018, -39.30502375409837],
                "label": {
                    "name": "Argentina",
                    "coordinate": [-64.20461759999999, -36.8353859928634],
                    "fontSize": 5.26719284
                }
            }, {
                "code": "AU",
                "faceCount": 915,
                "faceOffset": 32955,
                "border": "8iEGIggiCSINIhUiFCIjIj8iUyJpImMiZyJvIm0icCJxInUicyJ4IpgikyKfIowimyKlIqEiuSKuIr8ixCLsIvUi8SLyIu8i4CLSItsi4yLhIugiASMvIzwjNiNFI0YjTyNdI00jTCNJIz4jRCMyI1IjdCOEI5cjoiOzI8gj5yPsI/Qj+SPwI+0j+yMAJAskIyQvJDgkTyRTJGckZSRwJGskdSRzJKAkpCSdJKgkrSS3JLYkwCTCJMck1CTXJNkk5iTkJOkk5SThJNAkxSS6JLMkjCR9JHEkdyRWJFokVyRCJEokRCQoJAYk6iPLI68jsCOYI6ojnCOlI6YjgiOJI4MjdiNVI14jcCNxI38jeCN5I2cjPyNAIywjNSMkIx0jGCMOIxIjCSMFI/Yi7iLkItAixyKgIoUiTCISIvAhyiGsIRgh0yCqIJAgjyCZIKEgoiCTII4gUSBUIGkgcCBaIFsgbCBxIHcgeyB+IFkgcyB5IIogryDJIO4gTyGIIX8hmCGuIa8hvCGmIbQhrSG2IbshvyHGIeYhziHeIc8h0yHaIdwh9iHkIQAi8iH//z4kPyRIJHkklySZJJUkjSSRJIkkfiRsJHIkWCRLJFkkPiQ=",
                "center": [133.68887318032796, -24.526109880874365],
                "label": {"name": "Australia", "coordinate": [133.5920148, -26.031298169678895], "fontSize": 5.91478872}
            }, {
                "code": "AT",
                "faceCount": 66,
                "faceOffset": 33870,
                "border": "dBSzFO0U9RRfFWcVYhU8FU8VQhUoFeEUqRRbFEcU9BO9E7QTuhPkE/UTDhRyFIUUdBQ=",
                "center": [13.470358530303033, 47.5207461818182],
                "label": {
                    "name": "Austria",
                    "coordinate": [14.594875199999997, 47.538634140696125],
                    "fontSize": 1.74702144
                }
            }, {
                "code": "IN",
                "faceCount": 621,
                "faceOffset": 33936,
                "border": "Rx5NHlEeWR5gHmwecB55Hogegh6RHpAepB63HrQevh6uHrAerx6jHq0epx6iHpgehR5fHk4eVR5UHiweHB4dHhoeBx4BHsgdpR2UHYQdax1UHS8dPB1THRodEx0PHRIdFh0jHRQdFx0NHQcdAh3wHOsctRyxHLocthy4HNQcxBzGHK4csxyeHGscRBw4HCccJBw0HC8cPhxOHC4cBhwFHPIb9hsEHPgbFhw8HDMcDhxDHG8ccByPHHkchBx6HJocfRyRHIEclhyHHIUclxyKHKAcwRzJHNgc5hz8HAUdDh0iHRUdIB0nHSYdOR0tHTgdLB03HU4dUB1SHVwddh15HZEdox2uHbodux3UHegd5B38HQge/x0JHgweEB4THhQeER4WHhceGR4bHiEeJB4gHiMeHx4SHhgeAx4PHiIeBh4OHiYeLh4vHl0eVh5KHkce",
                "center": [81.37093826731073, 24.12328614170692],
                "label": {"name": "India", "coordinate": [78.61856040000002, 22.687053188898144], "fontSize": 5}
            }, {
                "code": "AZ",
                "faceCount": 57,
                "faceOffset": 34557,
                "border": "GhonGhYa2BnZGbkZwRmvGawZshnWGeEZyRnTGdwZDhoxGlIaZRpRGj4aGho=",
                "center": [47.330199385964924, 40.53070063157896],
                "label": {"name": "Azerbaijan", "coordinate": [47.831112, 40.463276060630236], "fontSize": 1.45435321}
            }, {
                "code": "IE",
                "faceCount": 102,
                "faceOffset": 34614,
                "border": "YRF0EYQRgxGOEZoRkRGNEXsRhxGUEaMRqxGgEZYRUhFDEUsROxFJETYRRhE0EWARQRFcETkRShFAEUURPxE8ET0RcBFmEXoRYRE=",
                "center": [-8.527068186274512, 53.614406784313736],
                "label": {"name": "Ireland", "coordinate": [-7.935346799999983, 53.47638245538719], "fontSize": 2}
            }, {
                "code": "ID",
                "faceCount": 636,
                "faceOffset": 34716,
                "border": "nR+wH+0f8x8bICYgKiBBIEQggiCAIIggUiA3IAMg6x+4H7sfnR///5UhmiGFITUhDSFrIZUh//+pIdEh8SH1Iech0iHLIcEhqSH//2ofcR9oH24fZh92H3UfaR9VH2EfXR9THzAfJR8sHxofEh8RH9gewR6qHp8ekx6cHrMeyR7wHvweCR8dH0Mfih+JH5cfnh+mH60fox+QH4gfkR+HH4Mfah///2oidiKCIpwivSKvIpoiayJiImoi//94IZchgSGKIVohZSGUIaAhpyGbIXEhZCFRIT0hHSEpIcch9CHqIbkhSyE4ISwhGiERIQQhEiEJIQAh+SDlIOgg/yD+IDIhJyFDIVAhSiFjIV8hdyF4If//fCJ+ImwiXiJhImQiUiJdInQiYCKDIm4ifCL//5AjoSOMI58jkSOAIyIjKSMaIwojDSMGI/oi+CLZIvMiAyMMIxEj5iLVIsIiyiLlIv0iFSMWIyAjISMqIzQjSiNmI2IjfCPZI9ojtiO8I5YjmiOQI///uCDPIL8gxiClIJ8gmyCUIJcgjSCHIGogQCA5ICAgDCAKIPkf9x8AIPYf+h8GIAIgDSAUIA4gGCA1IDggOiBJIGsghCCMIKQgriCnILIgsSC2IMcgxCDXINIg3SDsINAg2CC8IMEguCA=",
                "center": [118.30242900314481, -1.943502308176102],
                "label": {"name": "Indonesia", "coordinate": [113.60269799999999, -0.8345806221730508], "fontSize": 2}
            }, {
                "code": "MY",
                "faceCount": 177,
                "faceOffset": 35352,
                "border": "HB8jHzIfMx9AH0YfTB9sH20fgh96H28fOx88HyQfGB8cH///2iD1IN4g1CDVIMUgyiC9ILsgtSCzIKMgmiCcIJUgliCYIJIgkSCJIHggSCAyIDMgLiAtICsgLyAnIDAgGiARIAogDCAgIDkgQCBqIIcgjSCXIJQgmyCfIKUgxiDhINog",
                "center": [111.48748607344629, 3.880487960451976],
                "label": {"name": "Malaysia", "coordinate": [113.62959359999999, 2.401579669678078], "fontSize": 2}
            }, {
                "code": "MZ",
                "faceCount": 156,
                "faceOffset": 35529,
                "border": "axhwGFwYmBiTGLEYthhuGGEYcxiGGLMYvxjnGPcYHRlAGUEZRRk+GUkZQxkWGdIY1BjBGIEYchibGKUYohiKGB8YFxggGCQYIRgMGAYYCBjyFxQYFRgpGBoYLRgmGCUY8RfQF84XyhczGEcYaxg=",
                "center": [34.92969057051284, -17.714747019230757],
                "label": {
                    "name": "Mozambique",
                    "coordinate": [35.00835119999997, -18.129623025510583],
                    "fontSize": 1.76119828
                }
            }
        ],
        "countriesByCode": {},
        "gridElements": []
    };

    (function () {

        /**
         * 国家
         * @param options
         * @constructor
         */
        function Country(options) {

            /**
             * 国家代码
             * @type {string}
             */
            this.code = options.code;
            this.index = options.index;
            this.name = options.label.name;
            this.label = options.label;
            this.tone = options.tone || MATH_RANDOM();
            this.border = options.border;
            this.faceOffset = options.faceOffset;
            this.faceCount = options.faceCount;
            this.center = vec3.fromArray(options.center);

            /**
             * 标记是否高亮
             * @type {boolean}
             */
            this.hovered = false;

            /**
             * 标记是否突出显示
             * @type {boolean}
             */
            this.extrusion = false;
        }

        Country.prototype = {
            constructor: Country
        };

        each(geoMetry.countries, function (country, index) {

            //国家索引
            country.index = index;
            //解密国家边界线
            country.border = base64Decode(country.border, Uint16Array);

            country.center = [country.center[0], country.center[1], country.center[2] || 0];

            country.tone = country.tone || MATH_RANDOM();

            geoMetry.countries[index] = geoMetry.countriesByCode[country.code] = new Country(country);
        });

        function t(e, t) {
            return 181 * e + t
        }

        for (var i = 0; i < 360; i++) {
            for (var j = 0; j < 180; j++) {
                geoMetry.gridElements.push(t(i, j), t(i + 1, j), t(i + 1, j + 1), t(i + 1, j + 1), t(i, j + 1), t(i, j));
            }
        }

    })();

    /**
     * WebGL摄像机
     * @constructor
     */
    function Camera(options) {
        var self = this;

        options = options || {};

        //视角
        self.fov = 60;
        self.near = .01;
        self.far = 200;
        /**
         * canvas视口
         * 左边距
         * 右边距
         * 宽度
         * 高度
         */
        self.viewport = vec4.create();
        self.proj = mat4.create();
        self.view = mat4.create();
        self.bill = mat3.create();
        self.mvp = mat4.create();
        self.mvpInv = mat4.create();
        self.viewInv = mat4.create();
        self.viewPos = vec3.create();
        self.viewDir = vec3.create();

        //地球当前朝向(GEO坐标)
        self.coordinate = [];

        /**
         * 地球目标朝向(GEO坐标)
         * 0   经度
         * 1   维度
         * 2   地球放大等级
         */
        self.targetCoordinate = [];

        vec3.copy(self.coordinate, options.coordinate);

        vec3.copy(self.targetCoordinate, options.targetCoordinate);

        //地球旋转到目标朝向的速度
        self.lerpSpeed = options.lerpSpeed || .02;
        /**
         * 地球旋转角度
         * 0 水平角度
         * 1 纵向角度
         * 2 地球放大等级
         */
        self.coordinateDelta = vec3.create();

        /**
         * 地球显示类型,通过修改此值可以使地球切换显示类型
         * 1    3D模式
         * -1   平面模式
         * @type {bool}
         */
        self.globe = !!options.globe;

        /**
         * 地球转换显示类型的过程
         * @type {number}
         */
        self.projectionBlend = self.globe ? 1 : 0;

        //地球默认大小
        self.earthDefaultSize = 1.6;

        self.blend = 0;

        return self;
    }

    Camera.prototype = {
        /**
         * 更新投影
         * @private
         * @returns {Camera}
         */
        _update_projection: function () {
            var self = this;
            var e = self.viewport[2] / self.viewport[3];
            mat4.perspective(self.proj, deg2rad(self.fov), e, self.near, self.far);
            return self;
        },
        _update_mvp: function () {
            var self = this;
            var e = self.bill,
                t = self.view;
            e[0] = t[0];
            e[1] = t[4];
            e[2] = t[8];
            e[3] = t[1];
            e[4] = t[5];
            e[5] = t[9];
            e[6] = t[2];
            e[7] = t[6];
            e[8] = t[10];
            mat4.multiply(self.mvp, self.proj, self.view);
            mat4.invert(self.mvpInv, self.mvp);
            mat4.invert(self.viewInv, self.view);
            vec3.transformMat4(self.viewPos, [0, 0, 0], self.viewInv);
            vec3.set(self.viewDir, -self.viewInv[8], -self.viewInv[9], -self.viewInv[10])

        },
        update: function () {
            var self = this,
                globe = self.globe,
                coord = self.coordinate,
                coord_target = self.targetCoordinate,
                coord_delta = self.coordinateDelta,
                K = vec3.create(),
                Q = vec3.create(),
                Z = vec3.create(),
                J = vec3.create(),
                R = vec3.create();

            vec3.add(coord_target, coord_target, coord_delta);
            coord_target[1] = clamp(coord_target[1], -80, 80);

            var projectionType;

            projectionType = globe ? [.35, 4.5] : [0.15, 1];
            coord_target[2] = clamp(coord_target[2], projectionType[0], projectionType[1]);

            if (globe) {
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
            vec3.lerp(coord, coord, coord_target, self.lerpSpeed);
            vec3.scale(coord_delta, coord_delta, .9);

            project_mercator(K, [coord[0], coord[1], 0]);
            project_mercator(Q, coord);
            Q[1] -= 2;
            vec3.subtract(Z, K, Q);
            vec3.normalize(Z, Z);
            vec3.copy(K, Q);
            var u = [0, 0, 0];
            project_ecef(u, [coord[0], coord[1], 0]);
            project_ecef(Q, coord);
            var c = clamp(2 * (self.earthDefaultSize - coord[2]), 0, 1);

            c = lerp(0, 2, c);
            Q[1] -= c;
            vec3.subtract(J, u, Q);
            vec3.normalize(J, J);
            var l = smoothstep(self.projectionBlend);
            vec3.lerp(K, K, Q, l);
            vec3.lerp(Z, Z, J, l);

            self._update_projection();
            vec3.add(R, K, Z);
            mat4.lookAt(self.view, K, R, vec3.fromValues(0, 1, 0));
            self._update_mvp();

            self.projectionBlend = clamp(self.projectionBlend + (globe ? 1 : -1) / 120, 0, 1)

            self.blend = smoothstep(self.projectionBlend);
        },
        update_quat: function (e, t, r) {
            var self = this,
                view = mat4.create();
            self._update_projection();
            mat4.fromRotationTranslation(view, t, e);
            mat4.invert(view, view);
            if (r) {
                for (var i = 0; 16 > i; ++i) {
                    self.view[i] = r * self.view[i] + (1 - r) * view[i];
                }
            } else {
                mat4.copy(self.view, view);
            }
            self._update_mvp()
        },
        unproject: function (e, t) {

            var self = this;
            var r = vec4.create();
            r[0] = 2 * (t[0] / self.viewport[2]) - 1;
            r[1] = 2 * (t[1] / self.viewport[3]) - 1;
            r[1] = 1 - r[1];
            r[2] = 0;
            r[3] = 1;
            vec4.transformMat4(r, r, self.mvpInv);
            e[0] = r[0] / r[3];
            e[1] = r[1] / r[3];

        },
        /**
         * 根据显示模式计算投影坐标
         * @param target
         * @param coord
         * @returns {*}
         */
        projection: function (target, coord) {
            if (this.globe === true) {
                return project_ecef(target, coord);
            }
            return project_mercator(target, coord);
        },
        /**
         * 判断一个坐标是否在视野内
         * @param coord
         * @param deg
         * @returns {boolean}
         */
        inView: function (coord, deg) {
            if (this.globe !== true) {
                return true;
            }

            var proj = vec3.create(),
                t = vec3.create();

            this.projection(proj, coord);

            vec3.normalize(t, proj);

            return vec3.dot(t, this.viewDir) < -Math.cos(deg2rad(deg || 90))
        }
    };

    /**
     *  文字标记
     * @constructor
     */
    function Label(label) {
        this.coord = vec3.fromValues(label.coord[0], label.coord[1], .0002);
        this.pos = vec3.create();
        this.mat = mat4.create();
        this.box = vec4.create();
        this.name = label.name || "";
        this.fontSize = label.fontSize || 3
    }


    /**
     * 导弹系统
     * @param context
     * @param camera
     * @param globe
     * @constructor
     */
    function Missile(context, camera, globe) {
        var self = this;

        self.context = context;
        self.camera = camera;
        self.globe = globe;

        /**
         * 待发的导弹个数
         * @type {number}
         */
        self.count = 1000;

        /**
         * 光圈效果
         * @type {{program: *, buffer: null}}
         */
        self.icon = {
            program: getProgram(context, "missile_icon"),
            buffer: null,
            count: 0
        };

        /**
         * 光锥效果
         * @type {{program: *, buffer: null}}
         */
        self.cone = {
            program: getProgram(context, "missile_cone"),
            count: 0,
            buffer: null
        };

        /**
         * 地面撞击效果
         * @type {{program: *, texture: *}}
         */
        self.impact = {
            program: getProgram(context, "missile_impact"),
            texture: loadTexture2D(context, resource("texture/impact-512.jpg"), {
                mipmap: false
            }),
            quad: makeVertexBuffer(context, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]))
        };

        /**
         * 导弹轨迹效果
         * @type {{program: *, buffer: null}}
         */
        self.missile = {
            program: getProgram(context, "missile_main"),
            buffer: null,
            bufferData: new FLOAT32_ARRAY(self.count * 800)
        };

        /**
         * 待发的导弹
         * @type {Array}
         */
        self.items = [];

        self.buildMissile();
        self.buildCone();
        self.buildIcon();
    }

    Missile.prototype = {
        constructor: Missile,
        /**
         * 构造光锥
         * @returns {Missile}
         */
        buildCone: function () {
            var vertex = [];
            var count = 16;

            for (var n = 0; count > n; ++n) {
                var o = MATH_PI * 2 * n / (count - 1),
                    a = MATH_COS(o),
                    i = MATH_SIN(o);

                vertex.push(a, 0, i, a, 1, i)
            }
            var floatArray = new FLOAT32_ARRAY(vertex);

            this.cone.count = floatArray.length / 3;
            this.cone.buffer = makeVertexBuffer(this.context, floatArray);

            return this;
        },
        buildIcon: function () {
            var self = this,
                context = self.context,
                vertex = [];

            function addVertex(e, t) {

                vertex.push(MATH_COS(e), MATH_SIN(e), t)
            }

            var n_sides = 16;

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
            }

            vertex = new Float32Array(vertex);
            self.icon.count = vertex.length/3;

            self.icon.buffer = makeVertexBuffer(context, vertex);

            return self;
        },
        /**
         * 构造导弹轨迹效果
         * @returns {Missile}
         */
        buildMissile: function () {
            var self = this,
                context = self.context;

            //初始化1000个导弹
            for (var i = 0; i < self.count; i++) {
                var vertex = self.missile.bufferData.subarray(i * 800, (i + 1) * 800);
                self.items.push(new MissileItem(i, vertex));
            }

            self.missile.buffer = makeVertexBuffer(context, self.missile.bufferData);

            return self;
        },
        /**
         * 获取一个空闲的导弹
         * @returns {MissileItem}
         */
        getFreeMissile: function () {
            var time = this.time;
            var items = this.items;
            var r = null, n = 0;

            for (var i = 0; i < items.length; ++i) {
                var item = items[i];

                if (!item.alive) return item;

                var diff = time - item.start_time;

                if (diff > n) {
                    n = diff;
                    r = item;
                }
            }

            if (r) {
                return r
            }
            var sample = range(0, items.length);

            return items[sample];
        },

        render: function () {
            var self = this,
                context = self.context,
                camera = self.camera;

            self.time = timeNow();

            context.enable(context.DEPTH_TEST);
            context.depthMask(!1);

            context.enable(context.BLEND);
            context.blendFunc(context.SRC_ALPHA, context.ONE);

            self.drawMissile();
            self.drawImpacts();
            self.drawCone();
            self.drawIcon();
            context.depthMask(true);
        },
        /**
         * 画光锥效果
         * @returns {Missile}
         */
        drawCone: function () {
            var self = this,
                context = self.context,
                camera = self.camera,
                program = self.cone.program.use();

            program.uniformMatrix4fv("mvp", camera.mvp);
            bindVertexBuffer(context, self.cone.buffer);
            program.vertexAttribPointer("position", 3, context.FLOAT, false, 0, 0);

            each(self.items, function (item) {
                if (item.alive) {
                    var o = self.time - item.start_time;
                    if (item.has_target && o >= 1 && 2 > o) {
                        program.uniform3fv("color", item.color);
                        program.uniformMatrix4fv("mat", item.target_mat);
                        program.uniform1f("time", o - 1);
                        context.drawArrays(context.TRIANGLE_STRIP, 0, self.cone.count);
                    }
                }
            });
            return self;
        },
        drawMissile: function () {
            var self = this,
                context = self.context,
                camera = self.camera,
                items = self.items;

            var program = self.missile.program.use();
            program.uniformMatrix4fv("mvp", camera.mvp);
            program.uniform3fv("view_position", camera.viewPos);
            program.uniform1f("width", .1);
            bindVertexBuffer(context, this.missile.buffer);
            program.vertexAttribPointer("position", 4, context.FLOAT, !1, 0, 0);
            each(items, function (missile) {
                if (missile.alive && missile.has_source) {

                    var time = self.time - missile.start_time;

                    if (2 > time) {

                        program.uniform1f("time", .5 * time);
                        program.uniform3fv("color", missile.color);
                        var a = 200,
                            i = a * missile.index;
                        context.drawArrays(context.TRIANGLE_STRIP, i, a)
                    }
                }
            });
            return self;
        },
        drawImpacts: function () {
            var self = this,
                camera = self.camera,
                context = self.context;

            var program = self.impact.program.use();

            program.uniformMatrix4fv("mvp", camera.mvp);
            program.uniformSampler2D("t_color", self.impact.texture);
            bindVertexBuffer(context, self.impact.quad);
            program.vertexAttribPointer("position", 2, context.FLOAT, false, 0, 0);
            each(self.items, function (missile) {
                if (missile.alive) {

                    var diffTime = self.time - missile.start_time;
                    if (diffTime > 4) return void(missile.alive = !1);
                    program.uniform3fv("color", missile.color);

                    if (missile.has_source && missile.draw_source_impact && 1 > diffTime) {
                        program.uniformMatrix4fv("mat", missile.source_mat);
                        program.uniform1f("time", diffTime);
                        context.drawArrays(context.TRIANGLE_STRIP, 0, 4)
                    }
                    if (missile.has_target && diffTime >= 1) {
                        program.uniformMatrix4fv("mat", missile.target_mat);
                        program.uniform1f("time", (diffTime - 1) / 3);
                        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
                    }

                }
            });
            return self;
        },
        drawIcon: function () {
            var self = this,
                context = self.context;

            var program = self.icon.program.use();
            program.uniformMatrix4fv("mvp", self.camera.mvp);
            program.uniform1f("scale", .05);
            bindVertexBuffer(context, self.icon.buffer);
            program.vertexAttribPointer("vertex", 3, context.FLOAT, false, 0, 0);
            context.lineWidth(2);
            each(self.items, function (missile) {
                if (missile.alive) {

                    var r = self.time - missile.start_time;

                    if (r >= 1 && 2 > r) {
                        program.uniformMatrix4fv("mat", missile.target_mat);
                        program.uniform3fv("color", missile.color);
                        program.uniform1f("time", r - 1);
                        context.drawArrays(context.LINES, 0, self.icon.count);
                    }
                }
            });
            context.lineWidth(1);
            return self;
        },
        /**
         *
         * @param source_coord
         * @param target_coord
         * @param style
         * @param sacle
         * @param angle
         * @returns {Missile}
         */
        launch: function (source_coord, target_coord, style, sacle, angle) {
            var self = this,
                missile = self.getFreeMissile(),
                color = color2Vec3(style),
                camera = self.camera,
                context = self.context,
                bufferData = self.missile.bufferData;
            sacle = sacle || 1;
            angle = angle || 0;

            missile.has_source = !!source_coord;

            vec3.copy(missile.target_coord, target_coord);

            vec3.copy(missile.color, color);

            missile.start_time = timeNow();
            missile.alive = true;

            if (missile.has_source) {
                vec3.copy(missile.source_coord, source_coord);
                var p = vec2.distance(source_coord, target_coord),
                    m = .01 * p,
                    d = (target_coord[0] - source_coord[0]) / p,
                    _ = (target_coord[1] - source_coord[1]) / p,
                    b = 200,
                    y = b * -_,
                    T = b * d;

                var w = MATH_COS(angle),
                    E = MATH_SIN(angle),
                    x = missile.index * 800,
                    A = vec3.create(),
                    M = vec3.create();
                for (var R = 0; 100 > R; ++R) {
                    var P = R / (100 - 1);
                    vec3.lerp(M, source_coord, target_coord, P);
                    var L = m * MATH_SIN(P * MATH_PI) * .15;
                    M[0] += E * L * y;
                    M[1] += E * L * T;
                    M[2] += w * L;
                    camera.projection(A, M);
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
                bindVertexBuffer(context, self.missile.buffer);
                context.bufferSubData(context.ARRAY_BUFFER, 4 * missile.index * 800, missile.vertex);
                if (missile.source_coord[2] < .015) {
                    missile.projection(missile.source_mat, missile.source_coord, sacle, camera);
                    missile.draw_source_impact = true
                } else {
                    missile.draw_source_impact = false

                }
            }
            missile.projection(missile.target_mat, missile.target_coord, sacle, camera);
            return this;
        }
    };

    function MissileItem(index, vectors) {
        this.vertex = vectors;
        this.index = index;
        this.source_coord = vec3.create();
        this.target_coord = vec3.create();
        this.source_mat = mat4.create();
        this.target_mat = mat4.create();
        this.start_time = 0;
        this.alive = false;
        this.color = vec3.create(0, 0, 0);
        this.has_source = true;
        this.has_target = true;
        this.draw_source_impact = true;
    }

    MissileItem.prototype = {
        constructor: MissileItem,
        projection: function (mat, coord, sacle, camera) {
            var o = vec3.create(),
                a = vec3.create(),
                l = vec3.create(),
                f = vec3.create();
            camera.projection(f, coord);
            if (camera.projectionBlend > .5) {
                vec3.normalize(l, f);
                vec3.set(o, 0, 1, 0);
                vec3.cross(o, l, o);
                vec3.normalize(o, o);
                vec3.cross(a, o, l);
                mat[0] = o[0];
                mat[1] = o[1];
                mat[2] = o[2];
                mat[4] = l[0];
                mat[5] = l[1];
                mat[6] = l[2];
                mat[8] = a[0];
                mat[9] = a[1];
                mat[10] = a[2];
            } else {
                mat4.identity(mat);
                mat4.rotateX(mat, mat, -.5 * MATH_PI);
            }
            sacle && mat4.scale(mat, mat, [sacle, sacle, sacle]);
            mat[12] = f[0];
            mat[13] = f[1];
            mat[14] = f[2];
        }
    };

    /**
     * 绘制世界
     * @param context
     * @param camera
     * @param globe
     * @constructor
     */
    function World(context, camera, globe) {

        var self = this;

        self.context = context;

        self.camera = camera;

        self.globe = globe;

        self.pattern_scale = [1440, 720];

        /**
         * 地图中的国家
         * @type {Array<Country>}
         */
        self.countries = geoMetry.countries;

        self.countriesByCode = geoMetry.countriesByCode;

        /**
         * 地球几何数据
         * @type {{grid: {buffers: {vectors: null, elements: *}, elementsCount: Number, strideBytes: number, program: *}, texture: {blur: *, pattern: *}, map: {buffer: null, strideBytes: number, program: *}, line: {count: *, buffer: *, program: *}, face: {count: *}, coast: {start: number, count: number}}}
         */
        self.geoMetry = {
            //地球背景网格
            grid: {
                //缓冲数据
                buffer: null,
                elements: makeElementBuffer(context, new Uint16Array(geoMetry.gridElements)),
                elementsCount: geoMetry.gridElements.length,
                strideBytes: 56,
                program: getProgram(context, "map_grid")
            },
            //纹理
            texture: {
                blur: loadTexture2D(context, resource("texture/map_blur.jpg")),
                pattern: loadTexture2D(context, resource("texture/pattern.png"), {
                    mipmap: true,
                    wrap: context.REPEAT,
                    aniso: 4
                })
            },
            map: {
                buffer: null,
                strideBytes: 56,
                program: getProgram(context, "map_main")
            },
            line: {
                count: geoMetry.lines.length,
                buffer: makeElementBuffer(context, new Uint16Array(geoMetry.lines)),
                program: getProgram(context, "map_line")
            },
            face: {
                count: geoMetry.faces.length,
                buffer: null
            },
            coast: {
                start: 0,
                count: 0
            },
            label: {
                buffer: null,
                labels: [],
                largeCount: 0,
                program: getProgram(context, "map_label"),
                size: 2048,
                texture: createTexture2D(context, {
                    size: 2048,
                    mipmap: true,
                    min: context.LINEAR_MIPMAP_LINEAR,
                    aniso: 4,
                    format: context.LUMINANCE
                })
            },
            pick: {
                program: getProgram(context, "map_pick"),
            },
            stars: {
                buffer: null,
                count: 0,
                program: getProgram(context, "stars")
            },
            corona: {
                buffer: null,
                program: getProgram(context, "corona"),
                texture: loadTexture2D(context, resource("texture/smoke.jpg"), {
                    mipmap: true,
                    wrapS: context.REPEAT,
                    wrapT: context.CLAMP_TO_EDGE
                })
            }
        };

        self.buildStars();
        self.buildCorona();
        self.buildGrid();
        self.biuldMetry();
        self.buildLabels();

    }

    World.prototype = {
        constructor: World,
        /**
         * 构造背景星星
         */
        buildStars: function () {
            var count = this.globe.options.stars.count,
                e = vec3.create(),
                r = new FLOAT32_ARRAY(count << 2);
            for (var n = 0; n < r.length; n += 4) {
                e[0] = 2 * (MATH_RANDOM() - .5);
                e[1] = 2 * (MATH_RANDOM() - .5);
                e[2] = 2 * (MATH_RANDOM() - .5);
                vec3.normalize(e, e);
                vec3.scale(e, e, 50);
                r[n + 0] = e[0];
                r[n + 1] = e[1];
                r[n + 2] = e[2];
                r[n + 3] = lerp(.1, 2.5, MATH_POW(MATH_RANDOM(), 10));
            }
            this.geoMetry.stars.count = count;
            this.geoMetry.stars.buffer = makeVertexBuffer(this.context, r);
        },
        /**
         * 画星星
         * @returns {World}
         */
        drawStars: function () {
            var self = this,
                camera = self.camera,
                options = self.globe.getOptions("stars");

            if (options.show && camera.projectionBlend > .5) {
                var metry = self.geoMetry.stars;

                var context = self.context,
                    mvp = mat4.create();

                mat4.copy(mvp, camera.view);
                mvp[12] = 0;
                mvp[13] = 0;
                mvp[14] = 0;

                mat4.multiply(mvp, camera.proj, mvp);

                context.disable(context.DEPTH_TEST);
                context.enable(context.BLEND);
                context.blendFunc(context.SRC_ALPHA, context.ONE);
                var program = metry.program.use();

                program.uniformMatrix4fv("mvp", mvp);
                var color = color2Vec3(options.color);
                program.uniform4f("color", color[0], color[1], color[2], pick(options.alpha, .5));

                bindVertexBuffer(context, metry.buffer);
                program.vertexAttribPointer("position", 4, context.FLOAT, false, 0, 0);
                context.drawArrays(context.POINTS, 0, metry.count);
            }
            return self;
        },
        /**
         * 构造日冕
         * @returns {World}
         */
        buildCorona: function () {
            var self = this,
                context = self.context;

            var e = [],
                r = 128;
            for (var n = 0; r + 1 > n; ++n) {
                var o = 2 * MATH_PI * n / r,
                    a = n / (r + 1),
                    i = MATH_COS(o),
                    u = MATH_SIN(o);
                e.push(i, u, a, 0, i, u, a, 1)
            }

            self.geoMetry.corona.count = e.length / 4;
            self.geoMetry.corona.buffer = makeVertexBuffer(context, new Float32Array(e));
            return self;
        },
        /**
         * 画日冕
         * @returns {World}
         */
        drawCorona: function () {
            var self = this,
                camera = self.camera,
                context = self.context,
                options = self.globe.getOptions("corona");

            if (options.show && camera.projectionBlend > .5) {
                var metry = self.geoMetry.corona;

                var coronaProgram = metry.program.use();
                coronaProgram.uniformMatrix4fv("mvp", camera.mvp);
                coronaProgram.uniformMatrix3fv("bill", camera.bill);
                coronaProgram.uniformSampler2D("t_smoke", metry.texture);

                context.disable(context.CULL_FACE);
                context.enable(context.BLEND);

                context.blendFunc(context.SRC_ALPHA, context.ONE);
                var color = color2Vec3(options.color);

                coronaProgram.uniform4f("color", color[0], color[1], color[2], pick(options.alpha, 1));

                bindVertexBuffer(context, metry.buffer);

                coronaProgram.vertexAttribPointer("vertex", 4, context.FLOAT, !1, 0, 0);
                context.drawArrays(context.TRIANGLE_STRIP, 0, metry.count);
                context.disable(context.BLEND);
            }
            return self;
        },
        /**
         * 构造地球背景网格
         */
        buildGrid: function () {
            var vectors = [],
                a = vec3.create();
            a[2] = -this.globe.options.coast.height;
            var i = vec3.create(),
                u = vec3.create(),
                c = vec2.create();

            for (var l = -180; 180 >= l; l += 1) {
                for (var s = -90; 90 >= s; s += 1) {
                    vec2.set(a, l, s);
                    vec2.set(c, (l + 180) / 360, 1 - (s + 90) / 180);
                    project_mercator(i, a);
                    vec3.set(u, 0, 0, -1);
                    arrayPush(vectors, i, u);
                    project_ecef(i, a);
                    vec3.normalize(u, i);
                    arrayPush(vectors, i, u);
                    arrayPush(vectors, c);

                }
            }
            this.geoMetry.grid.buffer = makeVertexBuffer(this.context, new FLOAT32_ARRAY(vectors));

            return this;
        },

        /**
         * 构造地球
         * @returns {Globe}
         * @private
         */
        biuldMetry: function () {
            var self = this,
                context = self.context,
                vertexs = [],
                geom = geoMetry,
                faces = Array.apply([], geom.faces),
                i = vec3.create(),
                _ = vec3.create(),
                b = vec3.create(),
                y = 14,
                coastHeight = self.globe.options.coast.height,
                addVert = function () {
                    var a = vec3.create(),
                        u = vec2.create();
                    return function (e, t) {
                        a[0] = 180 * geom.verts[2 * e + 0] / 32768;
                        a[1] = 90 * geom.verts[2 * e + 1] / 32768;
                        a[2] = t;
                        u[0] = .5 + a[0] / 360;
                        u[1] = .5 - a[1] / 180;
                        var r = vertexs.length / 14;
                        project_mercator(i, a);
                        vertexs.push(i[0], i[1], i[2]);
                        vertexs.push(0, 0, 0);
                        project_ecef(i, a);
                        vertexs.push(i[0], i[1], i[2]);
                        vertexs.push(0, 0, 0);
                        vertexs.push(u[0], u[1]);
                        return r
                    }
                }();

            for (var l = 0; geom.verts.length > l; ++l) {
                addVert(l, 0);
            }

            faces.length = geom.faces.length;
            faces.constructor = Array;

            self.geoMetry.coast.start = faces.length;

            for (var l = 0; l < geom.coast.length; l += 2) {
                var coast0 = geom.coast[l + 0],
                    coast1 = geom.coast[l + 1],
                    p = addVert(coast0, -coastHeight),
                    g = addVert(coast1, -coastHeight),
                    f = addVert(coast0, 0),
                    v = addVert(coast1, 0);

                faces.push(f, v, p);
                faces.push(v, g, p)
            }

            for (var l = 0; l < faces.length; l += 3) {
                var f = faces[l + 0],
                    v = faces[l + 1],
                    T = faces[l + 2];
                for (var w = 0; 2 > w; ++w) {
                    var E = 6 * w;
                    for (var x = 0; 3 > x; ++x) {
                        _[x] = vertexs[y * v + E + x] - vertexs[y * f + E + x];
                        b[x] = vertexs[y * T + E + x] - vertexs[y * f + E + x];
                    }
                    vec3.cross(i, _, b);
                    vec3.normalize(i, i);
                    for (var x = 0; 3 > x; ++x) {
                        vertexs[y * f + E + 3 + x] += i[x];
                        vertexs[y * v + E + 3 + x] += i[x];
                        vertexs[y * T + E + 3 + x] += i[x]
                    }
                }
            }
            vec3.forEach(vertexs, y, 3, 0, function (e) {
                vec3.normalize(e, e)
            });
            vec3.forEach(vertexs, y, 9, 0, function (e) {
                vec3.normalize(e, e)
            });

            self.geoMetry.coast.count = faces.length - self.geoMetry.coast.start;
            self.geoMetry.map.buffer = makeVertexBuffer(context, new Float32Array(vertexs));
            self.geoMetry.face.buffer = makeElementBuffer(context, new Uint16Array(faces));

            return this;
        },
        /**
         * 构造国家和城市名称
         */
        buildLabels: function () {
            var self = this,
                context = self.context,
                countries = self.countries,
                cities = [],
                metry = self.geoMetry.label,
                canvas = document.createElement("canvas");

            each(countries, function (country) {
                var label = country.label;
                //地球小的时候,只显示fontSize大于5的国家名
                if (label.fontSize > 5) {
                    metry.labels.push(new Label({
                        name: label.name.toUpperCase(),
                        coord: label.coordinate,
                        fontSize: label.fontSize
                    }));
                } else {
                    cities.push(label);
                }
                each(country.cities, function (city) {
                    cities.push(city);
                });
            });

            //大字国家数量
            metry.largeCount = metry.labels.length;

            each(cities, function (city) {
                metry.labels.push(new Label({
                    name: city.name,
                    coord: city.coordinate,
                    fontSize: city.fontSize
                }));
            });

            metry.buffer = makeVertexBuffer(context, new Float32Array(metry.labels.length * 30));

            canvas.width = canvas.height = metry.size;

            var context2d = canvas.getContext("2d");
            context2d.fillStyle = "#000";
            context2d.fillRect(0, 0, canvas.width, canvas.height);
            context2d.font = "30px Ubuntu Mono";
            context2d.fillStyle = "white";
            context2d.textBaseline = "top";
            var pos = [0, 0],
                minSize = 35;
            each(metry.labels, function (label) {
                var name = label.name,
                    width = context2d.measureText(name).width;
                if (pos[0] + width >= canvas.width) {
                    pos[0] = 0;
                    pos[1] += minSize;
                }
                context2d.fillText(name, pos[0], pos[1] - 0);

                vec4.set(label.box, pos[0], pos[1], pos[0] + width, pos[1] + minSize);
                vec4.scale(label.box, label.box, 1 / metry.size);
                pos[0] += width;

            });
            context.bindTexture(context.TEXTURE_2D, metry.texture);
            context.texSubImage2D(context.TEXTURE_2D, 0, 0, 0, context.LUMINANCE, context.UNSIGNED_BYTE, canvas);
            context.generateMipmap(context.TEXTURE_2D);

            self.setupLabels();
            return self;
        },
        setupLabels: function () {
            var self = this,
                camera = self.camera,
                context = self.context,
                labels = self.geoMetry.label.labels;

            if (labels.length) {
                var n = vec3.create(),
                    o = vec3.create(),
                    a = vec3.create(),
                    i = [],
                    u = vec3.create(),
                    data = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1];
                each(labels, function (label) {

                    camera.projection(label.pos, label.coord);

                    var fontSize = 1 * label.fontSize;
                    mat4.identity(label.mat);

                    if (camera.globe) {
                        vec3.normalize(n, label.pos);
                        vec3.set(o, 0, 1, 0);
                        vec3.cross(o, n, o);
                        vec3.normalize(o, o);
                        vec3.cross(a, o, n);
                        label.mat[0] = o[0];
                        label.mat[1] = o[1];
                        label.mat[2] = o[2];
                        label.mat[4] = n[0];
                        label.mat[5] = n[1];
                        label.mat[6] = n[2];
                        label.mat[8] = a[0];
                        label.mat[9] = a[1];
                        label.mat[10] = a[2];
                        mat4.rotateX(label.mat, label.mat, MATH_PI / 2);
                    }

                    mat4.scale(label.mat, label.mat, [
                        fontSize * (label.box[2] - label.box[0]),
                        fontSize * (label.box[3] - label.box[1]), 1
                    ]);
                    label.mat[12] = label.pos[0];
                    label.mat[13] = label.pos[1];
                    label.mat[14] = label.pos[2];

                    for (var index = 0; index < data.length; index += 2) {
                        u[0] = data[index + 0];
                        u[1] = data[index + 1];
                        u[2] = 0;
                        vec3.transformMat4(u, u, label.mat);
                        i.push(u[0], u[1], u[2]);
                        u[0] = .5 * (1 + data[index + 0]);
                        u[1] = .5 * (1 + data[index + 1]);
                        u[0] = lerp(label.box[2], label.box[0], u[0]);
                        u[1] = lerp(label.box[3], label.box[1], u[1]);
                        i.push(u[0], u[1])
                    }
                });
                bindVertexBuffer(context, self.geoMetry.label.buffer);
                context.bufferSubData(context.ARRAY_BUFFER, 0, new Float32Array(i))
            }
            return self;
        },
        /**
         * 画地球
         * @private
         */
        render: function () {
            var self = this,
                context = self.context,
                camera = self.camera,
                countries = self.countries,
                options = self.globe.getOptions(),
                showOffset = camera.blend < .25,
                metry = self.geoMetry,
                map_stride_bytes = metry.map.strideBytes;

            self.drawStars();

            self.drawCorona();

            //绘制地球背景网格
            self.drawGrid();

            //画国家
            var mainProgram = metry.map.program.use();
            mainProgram.uniformMatrix4fv("mvp", camera.mvp);
            mainProgram.uniformSampler2D("t_blur", metry.texture.blur);
            mainProgram.uniform1f("blend", camera.blend);
            mainProgram.uniform3fv("view_pos", camera.viewPos);
            mainProgram.uniform3fv("light_pos", options.light.position);

            bindVertexBuffer(context, metry.map.buffer);
            mainProgram.vertexAttribPointer("position", 3, context.FLOAT, false, map_stride_bytes, 0);
            mainProgram.vertexAttribPointer("normal", 3, context.FLOAT, false, map_stride_bytes, 12);
            mainProgram.vertexAttribPointer("position2", 3, context.FLOAT, false, map_stride_bytes, 24);
            mainProgram.vertexAttribPointer("normal2", 3, context.FLOAT, false, map_stride_bytes, 36);
            mainProgram.vertexAttribPointer("texcoord", 2, context.FLOAT, false, map_stride_bytes, 48);

            var color0 = color2Vec3(options.country.color0);
            var color1 = color2Vec3(options.country.color1);

            mainProgram.uniform3f("color0", color0[0], color0[1], color0[2]);
            mainProgram.uniform3f("color1", color1[0], color1[1], color1[2]);

            bindElementBuffer(context, metry.face.buffer);

            each(countries, function (country) {
                mainProgram.uniform1f("height", 0);
                mainProgram.uniform1f("tone", country.tone);
                mainProgram.uniform1f("offset_x", 0);
                context.drawElements(context.TRIANGLES, country.faceCount, context.UNSIGNED_SHORT, country.faceOffset << 1);
                if (showOffset) {
                    mainProgram.uniform1f("offset_x", -20);
                    context.drawElements(context.TRIANGLES, country.faceCount, context.UNSIGNED_SHORT, country.faceOffset << 1);
                    mainProgram.uniform1f("offset_x", 20);
                    context.drawElements(context.TRIANGLES, country.faceCount, context.UNSIGNED_SHORT, country.faceOffset << 1);
                }
            });

            context.depthFunc(context.LESS);
            /**
             * 画海岸线
             */
            if (options.coast.show) {
                context.disable(context.CULL_FACE);
                mainProgram.uniform1f("tone", .5);
                mainProgram.uniform1f("offset_x", 0);
                context.drawElements(context.TRIANGLES, metry.coast.count, context.UNSIGNED_SHORT, metry.coast.start << 1);

                if (showOffset) {
                    mainProgram.uniform1f("offset_x", -20);
                    context.drawElements(context.TRIANGLES, metry.coast.count, context.UNSIGNED_SHORT, metry.coast.start << 1);
                    mainProgram.uniform1f("offset_x", 20);
                    context.drawElements(context.TRIANGLES, metry.coast.count, context.UNSIGNED_SHORT, metry.coast.start << 1);
                }
            }

            // if (hoverCountry) {
            //     mainProgram.uniform1f("tone", 1);
            //     mainProgram.uniform1f("alpha", .5);
            //     mainProgram.uniform1f("offset_x", 0);
            //     mainProgram.uniform1f("height", 0);
            //     context.drawElements(context.TRIANGLES, 1296, context.UNSIGNED_SHORT, 17709 << 1)
            // }

            self.drawBoundary();

            self.drawLabels();

        },
        /**
         * 画地球背景网格
         * @private
         */
        drawGrid: function () {
            var self = this,
                options = self.globe.getOptions("grid");

            if (options.show) {
                var context = self.context,
                    camera = self.camera,
                    metry = self.geoMetry.grid,
                    grid_stride_bytes = metry.strideBytes,
                    gridProgram = metry.program.use();

                context.disable(context.BLEND);
                context.enable(context.CULL_FACE);
                context.cullFace(context.BACK);
                context.enable(context.DEPTH_TEST);

                gridProgram.uniformMatrix4fv("mvp", camera.mvp);
                gridProgram.uniformSampler2D("t_blur", self.geoMetry.texture.blur);
                gridProgram.uniformSampler2D("t_pattern", self.geoMetry.texture.pattern);
                gridProgram.uniform2fv("pattern_scale", self.pattern_scale);
                gridProgram.uniform1f("blend", camera.blend);
                var color0 = color2Vec3(options.color0);
                var color1 = color2Vec3(options.color1);
                gridProgram.uniform3f("color0", color0[0], color0[1], color0[2]);
                gridProgram.uniform3f("color1", color1[0], color1[1], color1[2]);

                bindVertexBuffer(context, metry.buffer);
                gridProgram.vertexAttribPointer("position", 3, context.FLOAT, false, grid_stride_bytes, 0);
                gridProgram.vertexAttribPointer("position2", 3, context.FLOAT, false, grid_stride_bytes, 24);
                gridProgram.vertexAttribPointer("texcoord", 2, context.FLOAT, false, grid_stride_bytes, 48);

                bindElementBuffer(context, metry.elements);
                gridProgram.uniform1f("offset_x", 0);
                context.drawElements(context.TRIANGLES, metry.elementsCount, context.UNSIGNED_SHORT, 0);

                if (camera.blend < .25) {
                    gridProgram.uniform1f("offset_x", -20);
                    context.drawElements(context.TRIANGLES, metry.elementsCount, context.UNSIGNED_SHORT, 0);
                    gridProgram.uniform1f("offset_x", 20);
                    context.drawElements(context.TRIANGLES, metry.elementsCount, context.UNSIGNED_SHORT, 0);
                }

            }

            return self;
        },
        /**
         * 画国家边界线
         * @returns {World}
         */
        drawBoundary: function () {
            var self = this,
                options = self.globe.getOptions("boundary");

            //画国家边界线
            if (options.show) {
                var context = self.context,
                    camera = self.camera,

                    metry = self.geoMetry.line,
                    map_stride_bytes = self.geoMetry.map.strideBytes;

                context.enable(context.DEPTH_TEST);
                context.depthMask(false);
                var lineProgram = metry.program.use();
                var color = color2Vec3(options.color);
                lineProgram.uniformMatrix4fv("mvp", camera.mvp);
                lineProgram.vertexAttribPointer("position", 3, context.FLOAT, false, map_stride_bytes, 0);
                lineProgram.vertexAttribPointer("normal", 3, context.FLOAT, false, map_stride_bytes, 12);
                lineProgram.vertexAttribPointer("position2", 3, context.FLOAT, false, map_stride_bytes, 24);
                lineProgram.vertexAttribPointer("normal2", 3, context.FLOAT, false, map_stride_bytes, 36);
                lineProgram.uniform1f("blend", camera.blend);
                lineProgram.uniform4f("color", color[0], color[1], color[2], 1);
                lineProgram.uniform1f("height", 0);
                bindElementBuffer(context, metry.buffer);
                context.lineWidth(pick(options.width, 1));
                context.drawElements(context.LINES, metry.count, context.UNSIGNED_SHORT, 0);
                context.lineWidth(1);
                context.depthMask(true);

                //画高亮国家的边界线
                // if (hoverCountry) {
                //     if (self.borderedCountry !== hoverCountry.index) {
                //         var r = [],
                //             borders = hoverCountry.border,
                //             o = -1;
                //         for (var a = 0; a < borders.length; ++a) {
                //             var i = borders[a];
                //             if (65535 != i) {
                //                 if (o >= 0) {
                //                     r.push(o, i);
                //                 }
                //                 o = i
                //             } else {
                //                 o = -1;
                //             }
                //
                //         }
                //         context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, self.border.buffer);
                //         context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(r), context.STATIC_DRAW);
                //         self.border.count = r.length;
                //         self.borderedCountry = hoverCountry.index;
                //     }
                //     if (self.border.count) {
                //         var f = self.programs.line.use();
                //         var hoverColor = color2Vec3(options.boundary.hover.color);
                //         f.uniformMatrix4fv("mvp", camera.mvp);
                //         f.vertexAttribPointer("position", 3, context.FLOAT, false, map_stride_bytes, 0);
                //         f.vertexAttribPointer("normal", 3, context.FLOAT, false, map_stride_bytes, 12);
                //         f.vertexAttribPointer("position2", 3, context.FLOAT, false, map_stride_bytes, 24);
                //         f.vertexAttribPointer("normal2", 3, context.FLOAT, false, map_stride_bytes, 36);
                //         f.uniform1f("blend", blend);
                //         f.uniform1f("height", 0);
                //         f.uniform4f("color", hoverColor[0], hoverColor[1], hoverColor[2], 1);
                //         bindElementBuffer(context, self.border.buffer);
                //         context.lineWidth(pick(options.boundary.hover.width, 1));
                //         context.drawElements(context.LINES, self.border.count, context.UNSIGNED_SHORT, 0);
                //         context.lineWidth(1)
                //     }
                // }
            }
            return self;
        },
        /**
         * 画国家和城市名称
         * @returns {World}
         */
        drawLabels: function () {
            var self = this,
                options = self.globe.getOptions("label");

            if (options.show) {
                var context = self.context,
                    camera = self.camera,
                    geometry = self.geoMetry.label;

                context.enable(context.DEPTH_TEST);
                context.enable(context.BLEND);
                context.blendFunc(context.SRC_ALPHA, context.ONE);
                context.depthMask(false);

                var project = vec3.create();
                camera.projection(project, camera.coordinate);
                var labelProgram = geometry.program.use();
                labelProgram.uniformMatrix4fv("mvp", camera.mvp);
                labelProgram.uniform4f("circle_of_interest", project[0], project[1], project[2], lerp(3, 10, camera.blend));
                labelProgram.uniformSampler2D("t_color", geometry.texture);
                bindVertexBuffer(context, geometry.buffer);
                labelProgram.vertexAttribPointer("position", 3, context.FLOAT, false, 20, 0);
                labelProgram.vertexAttribPointer("texcoord", 2, context.FLOAT, false, 20, 12);
                labelProgram.uniform1i("inside", 0);
                context.drawArrays(context.TRIANGLES, 0, 6 * geometry.largeCount);
                labelProgram.uniform1i("inside", 1);
                context.drawArrays(context.TRIANGLES, 6 * geometry.largeCount, 6 * (geometry.labels.length - geometry.largeCount));
                context.depthMask(!0);
                context.disable(context.BLEND)
            }

            return self;
        },
        /**
         * 根据鼠标平面坐标计算出鼠标放在地球上的哪个国家
         * @param mouseX
         * @param mouseY
         * @returns {number}
         */
        pick: function (mouseX, mouseY) {
            var self = this,
                context = self.context,
                camera = self.camera,
                countries = self.countries,
                r = 4,
                data = new Uint8Array(r * r << 2),
                viewport = camera.viewport,
                mvp = mat4.create(),
                metry = self.geoMetry,
                map_stride_bytes = metry.map.strideBytes,
                blend = camera.projectionBlend < .5 ? 0 : 24;

            function getFrameBuffer() {
                if (!self.framebuffer) {
                    self.framebuffer = context.createFramebuffer();
                    context.bindFramebuffer(context.FRAMEBUFFER, self.framebuffer);
                    var e = createTexture2D(context, {
                        size: r
                    });
                    context.bindTexture(context.TEXTURE_2D, e);
                    context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, e, 0);
                    var n = context.createRenderbuffer();
                    context.bindRenderbuffer(context.RENDERBUFFER, n);
                    context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_COMPONENT16, r, r);
                    context.framebufferRenderbuffer(context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, n);
                    context.bindRenderbuffer(context.RENDERBUFFER, null);
                    context.bindFramebuffer(context.FRAMEBUFFER, null);
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
            mat4.multiply(mvp, mvp, camera.mvp);

            context.viewport(0, 0, r, r);
            context.bindFramebuffer(context.FRAMEBUFFER, getFrameBuffer());
            context.clearColor(0, 0, 1, 0);
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
            context.disable(context.BLEND);
            context.enable(context.CULL_FACE);
            context.cullFace(context.BACK);
            context.enable(context.DEPTH_TEST);
            var pickProgram = metry.pick.program.use();
            pickProgram.uniformMatrix4fv("mvp", mvp);

            bindVertexBuffer(context, metry.map.buffer);

            pickProgram.vertexAttribPointer("position", 3, context.FLOAT, !1, map_stride_bytes, blend);

            bindElementBuffer(context, metry.face.buffer);

            each(countries, function (country) {
                pickProgram.uniform1f("color", country.index / 255);
                context.drawElements(context.TRIANGLES, country.faceCount, context.UNSIGNED_SHORT, country.faceOffset << 1);

            });
            context.disable(context.CULL_FACE);
            context.disable(context.DEPTH_TEST);
            context.readPixels(0, 0, r, r, context.RGBA, context.UNSIGNED_BYTE, data);

            context.bindFramebuffer(context.FRAMEBUFFER, null);
            context.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
            var index = -1,
                m = 0,
                d = {};

            for (var b = 0; b < data.length; b += 4) {
                if (data[b + 3]) {
                    var y = data[b + 1] << 8 | data[b + 0],
                        T = d[y] || 0;
                    d[y] = ++T;
                    T > m && (index = y, m = T)
                }
            }
            return this.countries[index] ? this.countries[index] : false;
        }
    };

    /**
     * 地球构造器和控制器
     * @param element
     * @param options
     * @param theme
     * @constructor
     */
    function Globe(element, options, theme) {
        var self = this;

        if (!(element instanceof HTMLElement)) {
            throw new Error("第一个参数必须是一个HTMLElement对象");
        }

        self.element = element;

        //用户设置的参数
        self.origin = options || {};

        //主题样式
        self.theme = theme || "default";

        if (!(self.theme in Globe.themes)) {
            console.warn("不存在的主题:" + self.theme);
            self.theme = "default";
        }

        //合并默认参数
        options = self.options = extend(true, {}, Globe.themes[self.theme], options);

        //创建canvas
        var canvas = self.canvas = document.createElement("canvas");

        /**
         * @type {WebGLRenderingContext}
         */
        var context;

        /**
         * 获取WebGLRenderingContext
         */
        try {

            //兼容处于实验阶段的WebGL标准
            context = self.context = canvas.getContext("webgl", options.webgl)
                || canvas.getContext("experimental-webgl", options.webgl);

        } catch (n) {

            throw new Error("抱歉,您的浏览器可能不支持WebGL");
        }

        //将canvas添加到容器中
        element.appendChild(canvas);

        //绑定的事件
        self._events = {};

        //初始化canvas照相机
        var camera = self.camera = new Camera({
            coordinate: options.coordinate,
            targetCoordinate: options.targetCoordinate,
            lerpSpeed: options.lerpSpeed,
            globe: !!options.globe
        });

        //绑定canvas事件
        bindCanvasEvents(canvas, self);

        //绑定点击事件
        self.bind("click", function () {
        }).bind("dragging", function (e) {

            var //取当前鼠标坐标
                mousePos = getMouseEventOffset(e),
            //横向移动距离
                xdiff = mousePos[0] - MOUSE_POS[0],
            //纵向移动距离
                ydiff = mousePos[1] - MOUSE_POS[1],
                coord_delta = camera.coordinateDelta;

            //缓动旋转
            coord_delta[0] -= .03 * xdiff;
            coord_delta[1] += .03 * ydiff;

        }).bind("mousedown", function () {

            //鼠标按下时,调整地球的缓冲速度,优化体验
            camera.lerpSpeed = .2;

        }).bind("mousewheel", function (e) {

            camera.coordinateDelta[2] -= e.wheelDelta / 10000;
        });

        //自动刷新尺寸
        if (options.autoResize) {
            window.addEventListener("resize", proxy(self.resize, self));
        }

        /**
         * 地球
         * @type {World}
         */
        self.world = new World(context, camera, self);

        /**
         * 导弹系统
         * @type {Missile}
         */
        self.missile = new Missile(context, camera, self);

        self.resize();
    }

    Globe.prototype = {
        constructor: Globe,
        /**
         * 刷新尺寸
         * @param {?number} width     宽度
         * @param {?number} height    高度
         * @returns {Globe}
         */
        resize: function (width, height) {
            var self = this,
                canvas = self.canvas,
                context = self.context;

            //设置canvas宽高,默认为外层容器宽高
            canvas.width = width > 0 ? width : self.element.offsetWidth;
            canvas.height = height > 0 ? height : self.element.offsetHeight;
            //宽高比
            var scale = canvas.width / canvas.height;

            1 > scale ? self.camera.fov = 60 / scale : self.camera.fov = 60;

            //设置视口
            context.viewport(0, 0, canvas.width, canvas.height);

            vec4.copy(self.camera.viewport, context.getParameter(context.VIEWPORT));

            self.dispatch("resize", canvas.width, canvas.height);
            return self;
        },
        /**
         * 渲染
         * @returns {Globe}
         */
        render: function () {
            var self = this,
                context = self.context,
                options = self.options,
                backgroundColor = color2Vec3(options.background.color);

            self.dispatch("render.start");

            //更新摄像机视角
            self.camera.update();

            self.dispatch("render");

            //清空画布
            context.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], options.background.alpha);
            context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

            self.world.render();

            self.missile.render();

            self.dispatch("render.end");

            /**
             * 不停的渲染,实现动画效果
             * @type {Number}
             */
            self.animationFrame = requestAnimationFrame(proxy(self.render, self));

            return self;
        },
        /**
         * 暂停动画
         * @returns {Globe}
         */
        pause: function () {

            this.animationFrame && cancelAnimationFrame(this.animationFrame);

            this.dispatch("pause");
            return this;
        },
        /**
         * 设置地球朝向
         * @param long  经度
         * @param lat   维度
         * @param speed 旋转速度,默认0.2
         * @param zoomLevel 放大等级
         * @returns {Globe}
         */
        lookAt: function (long, lat, speed, zoomLevel) {
            //经度
            this.camera.targetCoordinate[0] = long;
            //维度
            this.camera.targetCoordinate[1] = lat;
            //旋转速度
            this.camera.lerpSpeed = speed || .2;
            //缩放等级
            zoomLevel && (this.camera.targetCoordinate[0] = zoomLevel);

            this.dispatch("lookAt", long, lat, speed, zoomLevel);
            return this;
        },
        /**
         * 使地球转向到某个国家的中心位置
         * @param codeOrID
         * @param speed
         * @param zoomLevel
         * @returns {Globe}
         */
        lookAtCountry: function (codeOrID, speed, zoomLevel) {
            //获取country
            var country = this.getCountry(codeOrID);
            if (country) {
                this.lookAt(country.center[0], country.center[1], speed, zoomLevel);
            }
            return this;
        },
        /**
         * 地球放大
         * @param level
         * @returns {Globe}
         */
        zoomIn: function (level) {
            level = level || this.options.zoomLevel;
            this.camera.coordinateDelta[2] -= level;
            this.dispatch("zoomIn", level);
            return this;
        },
        /**
         * 地球缩小
         * @param level
         * @returns {Globe}
         */
        zoomOut: function (level) {
            level = level || this.options.zoomLevel;
            this.camera.coordinateDelta[2] += level;
            this.dispatch("zoomOut", level);
            return this;
        },
        /**
         * 显示模式,globe或true为3D模式,其他值为平面模式
         * @param globe
         * @returns {Globe}
         */
        display: function (globe) {
            globe = (globe === "globe" || globe === true);
            this.camera.globe = globe;
            this.world.setupLabels();
            this.dispatch("display", globe);
            return this;
        },
        /**
         * 切换显示类型
         * @returns {Globe}
         */
        toggleDisplay: function () {
            return this.display(!this.camera.globe);
        },
        /**
         * 设置主题样式
         * @param name
         * @returns {Globe}
         */
        setTheme: function (name) {
            var options = Globe.themes[name] || {};
            this.options = {};
            this.theme = name;
            extend(true, this.options, options, this.origin);
            this.dispatch("setTheme", name);
            return this;
        },
        /**
         * 切换主题
         * @returns {Globe}
         */
        toggleTheme: function () {
            var themes = keys(Globe.themes);
            var next = themes.indexOf(this.theme) + 1;
            if (next >= themes.length) {
                next = 0;
            }
            return this.setTheme(themes[next]);
        },
        /**
         * 根据索引或国家代码获取国家
         * @param indexOrCode
         * @returns {*}
         */
        getCountry: function (indexOrCode) {

            return this.world.countries[indexOrCode] || this.world.countriesByCode[indexOrCode];
        },
        /**
         * 获取参数
         * @returns {*|{}|*}
         */
        getOptions: function (name) {
            if (arguments.length) {
                return this.options[name];
            }
            return this.options;
        },
        /**
         * 设置参数
         * @param options
         * @returns {Globe}
         */
        setOptions: function (options) {
            extend(true, this.options, options);
            this.dispatch("setOptions", options);
            extend(true, this.origin, options);
            return this;
        },
        /**
         * 绑定一个事件
         * @param event 事件名
         * @param handler 回调函数
         * @param once 是否只触发1次
         * @returns {Globe}
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
         * @returns {Globe}
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
         * @returns {Globe}
         */
        dispatch: function () {
            ARRAY_PROTOTYPE.push.call(arguments, this);
            return this.dispatchWithContext.apply(this, arguments);
        },
        /**
         * 自定义context并触发事件,最后一个参数为context
         * @param type
         * @returns {Globe}
         */
        dispatchWithContext: function (type) {
            var self = this,
                args = arguments,
                argLength = args.length - 1,
                paramArgs = ARRAY_PROTOTYPE.slice.call(args, 1, argLength),
                events = self._events || {},
                context = args[argLength];

            each(events[type] || {}, function (event, index) {

                event.h.apply(context, paramArgs);

                if (event.once) {

                    delete self._events[type][index];
                }
            });
            ARRAY_PROTOTYPE.unshift.call(paramArgs, type);
            each(events["*"] || [], function (event, index) {

                event.h.apply(context, paramArgs);

                if (event.once) {
                    delete self._events["*"][index];
                }
            });

            return self;
        }
    };
    Globe.themes = {
        default: {
            //webgl的设置参数
            webgl: {
                //开启抗锯齿模式,默认手持设备关闭
                antialias: true,
                alpha: true,
                depth: true,
                stencil: false,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false
            },
            //canvas背景
            background: {
                //canvas背景颜色
                color: "#000",
                //canvas背景透明度
                alpha: 0
            },
            //背景星星
            stars: {
                //启用
                show: true,
                //背景星星的数量
                count: 10000,
                //星星透明度
                alpha: .5,
                //星星颜色
                color: "#fff"
            },
            //日冕颜色
            corona: {
                show: true,
                //日冕颜色
                color: "#124029"
            },
            //默认显示为3D模式
            globe: true,
            //地球背景网格
            grid: {
                //是否显示网格
                show: true,
                //颜色1
                color0: "#131713",
                //颜色2
                color1: "#5C695C"
            },
            //海岸线
            coast: {
                //是否显示
                show: true,
                //海岸线高度
                height: .014
            },
            //国家边界线
            boundary: {
                //显示边界线
                show: true,
                //边界线颜色
                color: "#333",
                //线宽
                width: 1,
                //高亮效果
                hover: {
                    //高亮时边界线颜色
                    color: "#aaa",
                    //线宽
                    width: 2
                }
            },
            //文字标记
            label: {
                //是否显示国家和城市名
                show: true
            },
            //国家样式
            country: {
                //透明度
                alpha: 1,
                //国家颜色范围1
                color1: "#1A1F1C",
                //国家颜色范围2
                color0: "#333B36"
            },
            //聚光灯灯光位置
            light: {
                position: [20, 20, -20]
            },
            //默认地球朝向
            coordinate: [-103, 36, 5],
            //默认地球目标朝向
            targetCoordinate: [103, 36, 1.5],
            //默认地球旋转到目标朝向的速度
            lerpSpeed: .02,
            //默认缩放级别
            zoomLevel: .1,
            //自动刷新尺寸
            autoResize: true,
            mark: {
                show: true,
                items: []
            }
        }
    };

    /**
     * 注册主题
     * @param name
     * @param option
     * @param inherit
     */
    Globe.registerTheme = function (name, option, inherit) {
        var base = Globe.themes[inherit || "default"];
        Globe.themes[name] = {};
        extend(true, Globe.themes[name], base, option);
    };

    window.Globe = Globe;



})(window, document);