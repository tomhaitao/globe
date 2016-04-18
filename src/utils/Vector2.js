/**
 * @file 2维向量工具库
 * @author vision <vision.shi@cloudwise.com>
 */

/**
 * 实例化一个二维向量
 * @param {number=} x 第一个值
 * @param {number=} y 第二个值
 * @constructor
 */
function Vector2(x, y) {

    /**
     * 第一个值
     * @type {number}
     */
    this.x = x || 0;

    /**
     * 第二个值
     * @type {number}
     */
    this.y = y || 0;
}

Vector2.prototype = {
    constructor: Vector2,
    /**
     * 设置数据
     * @param {number} x 第一个值
     * @param {number} y 第二个值
     * @returns {Vector2}
     */
    set: function (x, y) {

        this.x = x;
        this.y = y;

        return this;
    },
    /**
     * 设置第一个值
     * @param {number} x
     * @returns {Vector2}
     */
    setX: function (x) {

        this.x = x;

        return this;
    },
    /**
     * 设置第二个值
     * @param {number} y
     * @returns {Vector2}
     */
    setY: function (y) {

        this.y = y;

        return this;
    },
    /**
     * 根据索引设置值
     * @param {int} index 所以,0(x)和1(y)
     * @param {number} value   要设置的值
     * @returns {Vector2}
     */
    setComponent: function (index, value) {

        switch (index) {
            case 0:
                this.x = value;
                break;
            case 1:
                this.y = value;
                break;
            default:
                throw new Error("index is out of range: " + index);

        }
        return this;
    },
    /**
     * 根据索引获取值
     * @param index
     * @returns {*|Vector2}
     */
    getComponent: function (index) {

        switch (index) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            default:
                throw new Error("index is out of range: " + index);
        }
    },
    /**
     * 从另外一个2维向量复制
     * @param {Vector2} v 要复制的向量
     * @returns {Vector2}
     */
    copy: function (v) {

        this.x = v.x;
        this.y = v.y;

        return this;
    },
    /**
     * 与另一个2维向量相加
     * @param {Vector2} v
     * @returns {Vector2}
     */
    add: function (v) {

        this.x += v.x;
        this.y += v.y;

        return this;
    },
    /**
     * 重新自赋值为两个相加的2维向量
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {Vector2}
     */
    addVectors: function (v1, v2) {

        this.x = v1.x + v2.x;
        this.y = v1.y + v2.y;

        return this;
    },
    /**
     * 根据比例相加
     * @param {number} s 加多少
     * @returns {Vector2}
     */
    addScalar: function (s) {

        this.x += s;
        this.y += s;

        return this;
    },
    /**
     * 与另一个2维向量相减
     * @param {Vector2} v
     * @returns {Vector2}
     */
    sub: function (v) {

        this.x -= v.x;
        this.y -= v.y;

        return this;
    },
    /**
     * 重新自赋值为两个相减的2维向量
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {Vector2}
     */
    subVectors: function (v1, v2) {

        this.x = v1.x - v2.x;
        this.y = v1.y - v2.y;

        return this;
    },
    /**
     * 根据比例相减
     * @param {number} s
     * @returns {Vector2}
     */
    subScalar: function (s) {

        this.x -= s;
        this.y -= s;

        return this;
    },
    /**
     * 与另一个2维向量相乘
     * @param {Vector2} v
     * @returns {Vector2}
     */
    multiply: function (v) {

        this.x *= v.x;
        this.y *= v.y;

        return this;
    },
    /**
     * 重新自赋值为两个相乘的2维向量
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {Vector2}
     */
    multiplyVector: function (v1, v2) {

        this.x = v1.x * v2.x;
        this.y = v1.x * v2.y;

        return this;
    },
    /**
     * 根据比例相乘
     * @param {number} s
     * @returns {Vector2}
     */
    multiplyScalar: function (s) {

        this.x *= s;
        this.y *= s;

        return this;
    },
    /**
     * 与另一个2维向量相除
     * @param {Vector2} v
     * @returns {Vector2}
     */
    divide: function (v) {

        this.x /= v.x;
        this.y /= v.y;

        return this;
    },
    /**
     * 重新自赋值为两个相乘的2维向量
     * @param {Vector2} v1
     * @param {Vector2} v2
     * @returns {Vector2}
     */
    divideVector: function (v1, v2) {

        this.x = v1.x / v2.x;
        this.y = v1.x / v2.y;

        return this;
    },
    /**
     * 根据比例相乘
     * @param {number} s
     * @returns {Vector2}
     */
    divideScalar: function (s) {

        if (s !== 0) {

            var invScalar = 1 / s;

            this.x *= invScalar;
            this.y *= invScalar;

        } else {

            this.x = 0;
            this.y = 0;

        }

        return this;

    },
    /**
     * 计算一个正方形距离
     * @param {Vector2} v
     * @returns {number}
     */
    distanceToSquared: function (v) {

        var x = v.x - this.x;
        var y = v.y - this.y;

        return x * x + y * y;
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

        return this.x * this.x + this.y * this.y;
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

        return this.x * v.x + this.y * v.y;
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

        if (this.x > v.x) {

            this.x = v.x;
        }

        if (this.y > v.y) {

            this.y = v.y;
        }

        return this;
    },
    /**
     * 根据两点的最大值,重新设置向量
     * @param {Vector2} v
     * @returns {Vector2}
     */
    max: function (v) {

        if (this.x < v.x) {

            this.x = v.x;
        }

        if (this.y < v.y) {

            this.y = v.y;
        }

        return this;
    },
    /**
     * 限制向量的最小值和最大值不能
     * @param minVector
     * @param maxVector
     * @returns {Vector2}
     */
    clamp: function (minVector, maxVector) {

        if (this.x < minVector.x) {

            this.x = minVector.x;

        } else if (this.x > maxVector.x) {

            this.x = maxVector.x;

        }

        if (this.y < minVector.y) {

            this.y = minVector.y;

        } else if (this.y > maxVector.y) {

            this.y = maxVector.y;

        }

        return this;
    },
    /**
     * 根据数值限制向量的最小值和最大值
     */
    clampScalar: (function () {

        var min, max;

        return function (minVal, maxVal) {

            if (min === undefined) {

                min = new Vector2();
                max = new Vector2();
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

        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);

        return this;
    },
    /**
     * 给向量自增取整
     * @returns {Vector2}
     */
    ceil: function () {

        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);

        return this;
    },
    /**
     * 给向量应用四舍五入
     * @returns {Vector2}
     */
    round: function () {

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        return this;
    },
    /**
     * 给向量应用四舍五入切不能小于0
     * @returns {Vector2}
     */
    roundToZero: function () {

        this.x = ( this.x < 0 ) ? Math.ceil(this.x) : Math.floor(this.x);
        this.y = ( this.y < 0 ) ? Math.ceil(this.y) : Math.floor(this.y);

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

        this.x += ( v.x - this.x ) * alpha;
        this.y += ( v.y - this.y ) * alpha;

        return this;
    },
    /**
     *
     * @param {Vector2} v
     * @returns {boolean}
     */
    equals: function (v) {

        return ( ( v.x === this.x ) && ( v.y === this.y ) );
    },
    /**
     * 从一个数组重新设置向量
     * @param {Array} array
     * @returns {Vector2}
     */
    fromArray: function (array) {

        this.x = array[0];
        this.y = array[1];

        return this;
    },
    /**
     * 以随机数重新设置向量
     * @param s
     * @returns {Vector2}
     */
    fromRandom: function (s) {
        s = s || 1;
        var r = 2 * MATH_RANDOM() * MATH_PI;
        this.x = MATH_COS(r) * s;
        this.y = MATH_SIN(r) * s;

        return this;
    },
    /**
     * 转换成数组
     * @returns {Array}
     */
    toArray: function () {

        return [this.x, this.y];
    },
    /**
     * 克隆
     * @returns {Vector2}
     */
    clone: function () {

        return new Vector2(this.x, this.y);
    },
    /**
     * 反转
     * @param {Vector2} v
     * @returns {Vector2}
     */
    inverse: function (v) {

        this.x = 1 / v.x;
        this.y = 1 / v.y;

        return this;
    }

};
