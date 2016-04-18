/**
 * @file WebGL 3D地球
 * @author vision <vision.shi@cloudwise.com>
 */

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
var FLOAT_ARRAY = Float32Array ? Float32Array : ARRAY;

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
 * 二维向量构造函数
 * @constructor
 */
function Vector2() {

    /**
     * 第一个值
     * @type {number}
     */
    this.x = 0;

    /**
     * 第二个值
     * @type {number}
     */
    this.y = 0;

    /**
     *
     * @type {string[]}
     * @protected
     */
    this.orderBy = ['x', 'y'];

    this.init.apply(this, arguments);
}

Vector2.prototype = {
    constructor: Vector2,
    /**
     * 变量
     * @param callback
     * @returns {Vector2}
     */
    each: function (callback) {

        each(this.orderBy, function (key, index) {
            caller(callback, this[key], key, index, this);
        }, this);

        return this;
    },
    /**
     * 初始化向量
     * @param array
     * @returns {Vector2}
     */
    init: function (array) {

        if (!isArray(array)) {
            array = arguments;
        }

        this.each(function (value, key, index) {
            this[key] = array[index] || 0;
        });

        return this;
    },
    /**
     * 设置数据
     * @returns {Vector2}
     */
    set: function () {
        var args = arguments;
        this.each(function (value, key, index) {

            this[key] = args[index];
        });

        return this;
    },
    /**
     *
     * @param {number} x
     * @returns {Vector2}
     */
    setX: function (x) {

        this.x = x;

        return this;
    },
    /**
     *
     * @param y
     * @returns {Vector2}
     */
    setY: function (y) {

        this.y = y;

        return this;
    },
    /**
     * 根据index设置值
     * @param index
     * @param value
     * @returns {Vector2}
     */
    setComponent: function (index, value) {
        var key = this.orderBy[index];
        if (key) {
            this[key] = value;
            return this;
        }
        throw new Error("索引不在范围内: " + index);
    },
    /**
     * 根据index设置值
     * @param index
     * @returns {*}
     */
    getComponent: function (index) {

        var key = this.orderBy[index];

        if (key) {

            return this[key];
        }

        throw new Error("索引不在范围内: " + index);
    },
    /**
     * 复制一个向量
     * @param {Vector2} v
     * @returns {Vector2}
     */
    copy: function (v) {

        this.each(function (value, key) {
            this[key] = v[key];
        });

        return this;
    },
    /**
     *
     * @param {Vector2} v
     * @returns {Vector2}
     */
    add: function (v) {

        this.each(function (value, key) {

            this[key] += v[key];
        });

        return this;
    },
    /**
     * 重新自赋值为两个相加的2维向量
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {Vector2}
     */
    addVectors: function (v1, v2) {

        this.each(function (value, key) {
            this[key] = v1[key] + v2[key];
        });

        return this;
    },
    /**
     * 根据比例相加
     * @param {number} s 加多少
     * @returns {Vector2}
     */
    addScalar: function (s) {

        this.each(function (value, key) {

            this[key] += s;
        });

        return this;
    },
    /**
     * 与另一个2维向量相减
     * @param {Vector2} v
     * @returns {Vector2}
     */
    sub: function (v) {

        this.each(function (value, key) {

            this[key] -= v[key];
        });

        return this;
    },
    /**
     * 重新自赋值为两个相减的2维向量
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {Vector2}
     */
    subVectors: function (v1, v2) {

        this.each(function (value, key) {

            this[key] = v1[key] - v2[key];
        });

        return this;
    },
    /**
     * 根据比例相减
     * @param {number} s
     * @returns {Vector2}
     */
    subScalar: function (s) {

        this.each(function (value, key) {

            this[key] -= s;
        });

        return this;
    },
    /**
     * 与另一个2维向量相乘
     * @param {Vector2} v
     * @returns {Vector2}
     */
    multiply: function (v) {

        this.each(function (value, key) {

            this[key] *= v[key];
        });

        return this;
    },
    /**
     * 重新自赋值为两个相乘的2维向量
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {Vector2}
     */
    multiplyVector: function (v1, v2) {

        this.each(function (value, key) {

            this[key] = v1[key] * v2[key];
        });

        return this;
    },
    /**
     * 根据比例相乘
     * @param {number} s
     * @returns {Vector2}
     */
    multiplyScalar: function (s) {

        this.each(function (value, key) {

            this[key] *= s;
        });

        return this;
    },
    /**
     * 与另一个2维向量相除
     * @param {Vector2} v
     * @returns {Vector2}
     */
    divide: function (v) {

        this.each(function (value, key) {

            this[key] /= v[key];
        });

        return this;
    },
    /**
     * 重新自赋值为两个相乘的2维向量
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {Vector2}
     */
    divideVector: function (v1, v2) {

        this.each(function (value, key) {

            this[key] = v1[key] / v2[key];
        });

        return this;
    },
    /**
     * 根据比例相乘
     * @param {number} s
     * @returns {Vector2}
     */
    divideScalar: function (s) {

        var invScalar = s ? 1 / s : 0;

        this.each(function (value, key) {

            this[key] *= invScalar;
        });

        return this;

    },
    /**
     * 计算一个正方形距离
     * @param {Vector2} v
     * @returns {number}
     */
    distanceToSquared: function (v) {

        var sum = 0;

        this.each(function (value, key) {

            sum += v[key] - value;
        });

        return sum;
    },
    /**
     * 计算与另外一个点的直线距离
     * @param {Vector2} v
     * @returns {number}
     */
    distance: function (v) {

        return MATH_SQRT(this.distanceToSquared(v))
    },
    /**
     *
     * @returns {number}
     */
    length: function () {

        return MATH_SQRT(this.lengthSq());
    },
    /**
     *
     * @returns {number}
     */
    lengthSq: function () {

        var sum = 0;

        this.each(function (value, key) {
            sum += value * value;

        });

        return sum;
    },
    /**
     * 将值转为负数
     * @returns {*|Vector2}
     */
    negate: function () {

        return this.multiplyScalar(-1);
    },
    /**
     *
     * @param {Vector2} v
     * @returns {number}
     */
    dot: function (v) {

        var sum = 0;

        this.each(function (value, key) {

            sum += v[key] * value;
        });

        return sum;
    },
    /**
     * 标准化
     * @returns {Vector2}
     */
    normalize: function () {

        return this.divideScalar(this.length());
    },
    /**
     * 根据两点的最小值,重新设置向量
     * @param {Vector2} v
     * @returns {Vector2}
     */
    min: function (v) {

        this.each(function (value, key) {

            if (value > v[key]) {

                this[key] = v[key];
            }
        });

        return this;
    },
    /**
     * 根据两点的最大值,重新设置向量
     * @param {Vector2} v
     * @returns {Vector2}
     */
    max: function (v) {

        this.each(function (value, key) {

            if (value < v[key]) {

                this[key] = v[key];
            }
        });

        return this;
    },
    /**
     * 限制向量的最小值和最大值不能
     * @param minVector
     * @param maxVector
     * @returns {Vector2}
     */
    clamp: function (minVector, maxVector) {

        each(function (value, key) {
            if (value < minVector[key]) {

                this[key] = minVector[key];

            } else if (value > maxVector[key]) {

                this[key] = maxVector[key];

            }
        });

        return this;
    },
    /**
     * 根据数值限制向量的最小值和最大值
     */
    clampScalar: (function () {

        var min, max;

        return function (minVal, maxVal) {

            if (min === undefined) {

                min = new this.constructor();
                max = new this.constructor();
            }

            min.set(minVal, minVal);
            max.set(maxVal, maxVal);

            return this.clamp(min, max);
        };

    })(),
    /**
     * 给向量舍弃取整
     * @returns {Vector2}
     */
    floor: function () {

        this.each(function (value, key) {

            this[key] = MATH.floor(value);
        });

        return this;
    },
    /**
     * 给向量自增取整
     * @returns {Vector2}
     */
    ceil: function () {

        this.each(function (value, key) {

            this[key] = MATH.ceil(value);
        });

        return this;
    },
    /**
     * 给向量应用四舍五入
     * @returns {Vector2}
     */
    round: function () {

        this.each(function (value, key) {

            this[key] = MATH.round(value);
        });

        return this;
    },
    /**
     * 给向量应用四舍五入切不能小于0
     * @returns {Vector2}
     */
    roundToZero: function () {

        this.each(function (value, key) {

            this[key] = ( value < 0 ) ? Math.ceil(value) : Math.floor(value);
        });

        return this;
    },
    /**
     *
     * @param {number} l
     * @returns {Vector2}
     */
    setLength: function (l) {

        var oldLength = this.length();

        if (oldLength !== 0 && l !== oldLength) {

            this.multiplyScalar(l / oldLength);
        }

        return this;
    },
    /**
     *
     * @param {Vector2} v
     * @param {number} alpha
     * @returns {Vector2}
     */
    lerp: function (v, alpha) {

        this.each(function (value, key) {
            this[key] = (v[key] - value) * alpha;
        });

        return this;
    },
    /**
     * 判断两个向量是否想等
     * @param {Vector2} v
     * @returns {boolean}
     */
    equals: function (v) {

        for (var i = 0, len = this.orderBy.length; i < len; i++) {
            var key = this.orderBy[i];

            if (this[key] !== v[key]) {

                return false;
            }
        }

        return true;
    },
    /**
     * 从一个数组重新设置向量
     * @param {Array} array
     * @returns {Vector2}
     */
    fromArray: function (array) {

        this.each(function (value, key, index) {

            this[key] = array[index];
        });

        return this;
    },

    /**
     * 转换成数组
     * @returns {Array}
     */
    toArray: function () {

        var array = [];

        this.each(function (value) {

            array.push(value);
        });

        return array;
    },
    /**
     * 克隆
     * @returns {Vector2}
     */
    clone: function () {

        return new this.constructor(this.toArray());
    },
    /**
     * 反转
     * @param {Vector2} v
     * @returns {Vector2}
     */
    inverse: function (v) {

        this.each(function (value, key) {
            this[key] = 1 / value;
        });
        return this;
    },
    /**
     *
     * @returns {number}
     */
    lengthManhattan: function () {
        var value = 0;

        this.each(function (value) {
            value += MATH.abs(value);
        });

        return value;
    }

};

/**
 * 三维向量构造函数
 * @constructor
 */
function Vector3() {

    /**
     *
     * @type {number}
     */
    this.x = 0;

    /**
     *
     * @type {number}
     */
    this.y = 0;

    /**
     *
     * @type {number}
     */
    this.z = 0;

    this.orderBy = ['x', 'y', 'z'];

    this.init.apply(this, arguments);
}

extend(Vector3.prototype, Vector2.prototype, {
    //构造函数
    constructor: Vector3,
    /**
     * 设置第三个值
     * @param value
     */
    setZ: function (value) {
        this.z = value;
    },
    cross: function (v) {

        var x = this.x, y = this.y, z = this.z;

        this.x = y * v.z - z * v.y;
        this.y = z * v.x - x * v.z;
        this.z = x * v.y - y * v.x;

        return this;
    },
    crossVectors: function (a, b) {

        var ax = a.x, ay = a.y, az = a.z;
        var bx = b.x, by = b.y, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;

    },
    projectOnVector: function () {

        var v1, dot;

        return function (vector) {

            if (v1 === undefined) v1 = new this.constructor();

            v1.copy(vector).normalize();

            dot = this.dot(v1);

            return this.copy(v1).multiplyScalar(dot);

        };

    }(),
    projectOnPlane: function () {

        var v1;

        return function (planeNormal) {

            if (v1 === undefined) v1 = new this.constructor();

            v1.copy(this).projectOnVector(planeNormal);

            return this.sub(v1);

        }

    }(),
    reflect: function () {

        // reflect incident vector off plane orthogonal to normal
        // normal is assumed to have unit length

        var v1;

        return function (normal) {

            if (v1 === undefined) v1 = new this.constructor();

            return this.sub(v1.copy(normal).multiplyScalar(2 * this.dot(normal)));

        }

    }(),
    /**
     * 计算距离另外一个点的角度
     * @param v
     * @returns {number}
     */
    angleTo: function (v) {

        var theta = this.dot(v) / ( this.length() * v.length() );

        // clamp, to handle numerical problems

        return MATH.acos(clamp(theta, -1, 1));
    }
});

/**
 * 四维向量
 * @constructor
 */
function Vector4() {

    /**
     *
     * @type {number}
     */
    this.x = 0;

    /**
     *
     * @type {number}
     */
    this.y = 0;

    /**
     *
     * @type {number}
     */
    this.z = 0;

    /**
     *
     * @type {number}
     */
    this.w = 0;

    this.orderBy = ['x', 'y', 'z', 'w'];

    this.init.apply(this, arguments);
}

extend(Vector4.prototype, Vector2.prototype, {
    //构造函数
    constructor: Vector4,
    /**
     * 设置第三个值
     * @param value
     */
    setY: function (value) {
        this.y = value;
    },
    /**
     * 设置第四个值
     * @param value
     */
    setW: function (value) {
        this.w = value;
    }
});

/**
 * 3X3矩阵构造函数
 * @constructor
 */
function Matrix3(array) {

    var elements = this.elements = new Float32Array(9);

    if (!isArray(array)) {
        array = arguments;
    }

    //初始化矩阵
    elements[0] = isNull(array[0]) ? 1 : array[0];
    elements[1] = array[1] || 0;
    elements[2] = array[1] || 0;

    elements[3] = array[1] || 0;
    elements[4] = isNull(array[4]) ? 1 : array[4];
    elements[5] = array[5] || 0;

    elements[6] = array[6] || 0;
    elements[7] = array[7] || 0;
    elements[8] = isNull(array[8]) ? 1 : array[8];
}

Matrix3.prototype = {

    constructor: Matrix3,

    /**
     * 设置矩阵
     * @returns {Matrix3}
     */
    set: function () {

        var args = arguments;

        return this.each(function (value, index) {

            this.elements[index] = args[index];
        });
    },
    /**
     * 遍历
     * @param {Function} callback
     */
    each: function (callback) {
        each(this.elements, callback, this);

        return this;
    },
    /**
     *
     * @returns {Matrix3}
     */
    identity: function () {

        this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );

        return this;
    },
    /**
     * 复制一个矩阵
     * @param m
     * @returns {Matrix3}
     */
    copy: function (m) {

        this.elements = clone(m.elements);

        return this;
    },
    multiplyVector3Array: function () {

        var v1 = new Vector3();

        return function (a) {

            for (var i = 0, il = a.length; i < il; i += 3) {

                v1.x = a[i];
                v1.y = a[i + 1];
                v1.z = a[i + 2];

                v1.applyMatrix3(this);

                a[i] = v1.x;
                a[i + 1] = v1.y;
                a[i + 2] = v1.z;

            }

            return a;

        };

    }(),
    /**
     *
     * @param {number} s
     * @returns {Matrix3}
     */
    multiplyScalar: function (s) {

        var te = this.elements;

        te[0] *= s;
        te[3] *= s;
        te[6] *= s;
        te[1] *= s;
        te[4] *= s;
        te[7] *= s;
        te[2] *= s;
        te[5] *= s;
        te[8] *= s;

        return this;
    },
    /**
     *
     * @returns {number}
     */
    determinant: function () {

        var te = this.elements;

        var a = te[0], b = te[1], c = te[2],
            d = te[3], e = te[4], f = te[5],
            g = te[6], h = te[7], i = te[8];

        return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
    },
    transpose: function () {

        var tmp, m = this.elements;

        tmp = m[1];
        m[1] = m[3];
        m[3] = tmp;
        tmp = m[2];
        m[2] = m[6];
        m[6] = tmp;
        tmp = m[5];
        m[5] = m[7];
        m[7] = tmp;

        return this;
    },
    /**
     * 矩阵转数组
     */
    toArray: function () {

        return new ARRAY(this.elements);
    },
    /**
     * 克隆矩阵
     * @returns {Matrix3}
     */
    clone: function () {

        return new Matrix3(this.toArray());
    }

};