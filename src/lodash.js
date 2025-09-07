/**
 * Thư viện mô phỏng các hàm tiện ích của Lodash cho Google Apps Script
 * @namespace lodash
 * @classdesc Cung cấp các hàm tiện ích để làm việc với mảng, đối tượng, chuỗi và hàm
 */
var lodash = {};

// 1. Các hàm chunk, compact, flatten, uniq

/**
 * Chia mảng thành các mảng con có kích thước xác định
 * @param {Array} array - Mảng cần chia
 * @param {number} [size=1] - Kích thước mỗi mảng con
 * @return {Array} Mảng chứa các mảng con
 */
lodash.chunk = function (array, size) {
  if (!Array.isArray(array)) return [];
  size = Math.max(size || 1, 1);

  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Loại bỏ các giá trị falsey (false, null, 0, "", undefined, NaN)
 * @param {Array} array - Mảng cần xử lý
 * @return {Array} Mảng mới sau khi loại bỏ các giá trị falsey
 */
lodash.compact = function (array) {
  if (!Array.isArray(array)) return [];
  return array.filter(Boolean);
};

/**
 * Làm phẳng mảng một cấp
 * @param {Array} array - Mảng cần làm phẳng
 * @return {Array} Mảng mới sau khi làm phẳng
 */
lodash.flatten = function (array) {
  if (!Array.isArray(array)) return [];
  return array.reduce((acc, val) => acc.concat(val), []);
};

/**
 * Loại bỏ các giá trị trùng lặp
 * @param {Array} array - Mảng cần xử lý
 * @return {Array} Mảng mới không chứa giá trị trùng lặp
 */
lodash.uniq = function (array) {
  if (!Array.isArray(array)) return [];
  return [...new Set(array)];
};

// 2. Các hàm xử lý đối tượng

/**
 * Lấy giá trị từ đối tượng theo đường dẫn
 * @param {Object} object - Đối tượng cần truy cập
 * @param {string} path - Đường dẫn đến thuộc tính (ví dụ: 'a.b.c')
 * @param {*} [defaultValue] - Giá trị mặc định nếu không tìm thấy
 * @return {*} Giá trị tại đường dẫn hoặc giá trị mặc định
 */
lodash.get = function (object, path, defaultValue) {
  if (typeof object !== "object" || object === null) return defaultValue;

  const keys = path.split(".");
  let result = object;

  for (const key of keys) {
    if (result === null || result === undefined || !(key in result)) {
      return defaultValue;
    }
    result = result[key];
  }

  return result;
};

/**
 * Đặt giá trị cho đối tượng theo đường dẫn
 * @param {Object} object - Đối tượng cần cập nhật
 * @param {string} path - Đường dẫn đến thuộc tính (ví dụ: 'a.b.c')
 * @param {*} value - Giá trị cần đặt
 * @return {Object} Đối tượng đã được cập nhật
 */
lodash.set = function (object, path, value) {
  if (typeof object !== "object" || object === null) return {};

  const keys = path.split(".");
  let current = object;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return object;
};

/**
 * Kiểm tra đối tượng có thuộc tính tại đường dẫn không
 * @param {Object} object - Đối tượng cần kiểm tra
 * @param {string} path - Đường dẫn đến thuộc tính (ví dụ: 'a.b.c')
 * @return {boolean} True nếu thuộc tính tồn tại
 */
lodash.has = function (object, path) {
  if (typeof object !== "object" || object === null) return false;

  const keys = path.split(".");
  let current = object;

  for (const key of keys) {
    if (!(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
};

// 3.2. cloneDeep, merge, isEmpty
/**
 * Sao chép sâu đối tượng hoặc mảng
 * @param {*} value - Giá trị cần sao chép
 * @return {*} Bản sao sâu của giá trị
 */
lodash.cloneDeep = function (value) {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return new Date(value);
  if (value instanceof Array)
    return value.map((item) => lodash.cloneDeep(item));

  const result = {};
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      result[key] = lodash.cloneDeep(value[key]);
    }
  }
  return result;
};

/**
 * Hợp nhất các đối tượng vào đối tượng đích
 * @param {Object} object - Đối tượng đích
 * @param {...Object} sources - Các đối tượng nguồn
 * @return {Object} Đối tượng sau khi hợp nhất
 */
lodash.merge = function (object, ...sources) {
  if (typeof object !== "object" || object === null) return {};

  for (const source of sources) {
    if (typeof source !== "object" || source === null) continue;

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === "object" &&
          source[key] !== null &&
          typeof object[key] === "object" &&
          object[key] !== null
        ) {
          object[key] = lodash.merge(object[key], source[key]);
        } else {
          object[key] = source[key];
        }
      }
    }
  }

  return object;
};

/**
 * Kiểm tra giá trị có rỗng không
 * @param {*} value - Giá trị cần kiểm tra
 * @return {boolean} True nếu giá trị rỗng
 */
lodash.isEmpty = function (value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" || Array.isArray(value))
    return value.length === 0;
  if (typeof value === "object") {
    for (const key in value) {
      if (value.hasOwnProperty(key)) return false;
    }
    return true;
  }
  return false;
};

// 4. Các hàm xử lý chuỗi

/**
 * Chuyển đổi chuỗi thành camelCase
 * @param {string} str - Chuỗi cần chuyển đổi
 * @return {string} Chuỗi ở dạng camelCase
 */
lodash.camelCase = function (str) {
  if (typeof str !== "string") return "";

  return str
    .replace(/[\s_\-]+/g, " ")
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "");
};

/**
 * Chuyển đổi chuỗi thành kebab-case
 * @param {string} str - Chuỗi cần chuyển đổi
 * @return {string} Chuỗi ở dạng kebab-case
 */
lodash.kebabCase = function (str) {
  if (typeof str !== "string") return "";

  return str
    .replace(/[\s_]+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
};

/**
 * Cắt chuỗi nếu dài hơn độ dài tối đa
 * @param {string} str - Chuỗi cần cắt
 * @param {number} maxLength - Độ dài tối đa
 * @param {string} [omission='...'] - Chuỗi thay thế
 * @return {string} Chuỗi đã được cắt
 */
lodash.truncate = function (str, maxLength, omission) {
  if (typeof str !== "string") return "";
  omission = omission || "...";

  if (str.length <= maxLength) return str;

  return str.substring(0, maxLength - omission.length) + omission;
};

// 5. Các hàm tiện ích
// 5.1. debounce, throttle

/**
 * Tạo hàm debounced - chỉ thực thi sau khi đợi một khoảng thời gian
 * @param {Function} func - Hàm cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @return {Function} Hàm đã được debounce
 */
lodash.debounce = function (func, wait) {
  if (typeof func !== "function") return function () {};

  let timeout;
  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
};

/**
 * Tạo hàm throttled - chỉ thực thi tối đa một lần mỗi khoảng thời gian
 * @param {Function} func - Hàm cần throttle
 * @param {number} wait - Thời gian chờ (ms)
 * @return {Function} Hàm đã được throttle
 */
lodash.throttle = function (func, wait) {
  if (typeof func !== "function") return function () {};

  let timeout;
  let lastTime = 0;

  return function () {
    const context = this;
    const args = arguments;
    const now = Date.now();

    if (now - lastTime >= wait) {
      func.apply(context, args);
      lastTime = now;
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
        lastTime = Date.now();
      }, wait - (now - lastTime));
    }
  };
};

// 5.2. isEqual, times

/**
 * So sánh sâu hai giá trị
 * @param {*} value - Giá trị đầu tiên
 * @param {*} other - Giá trị thứ hai
 * @return {boolean} True nếu hai giá trị bằng nhau
 */
lodash.isEqual = function (value, other) {
  if (value === other) return true;

  if (
    value === null ||
    other === null ||
    typeof value !== "object" ||
    typeof other !== "object"
  ) {
    return value !== value && other !== other; // Handle NaN
  }

  if (Array.isArray(value) !== Array.isArray(other)) return false;

  const keysA = Object.keys(value);
  const keysB = Object.keys(other);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !lodash.isEqual(value[key], other[key])) {
      return false;
    }
  }

  return true;
};

/**
 * Gọi hàm n lần
 * @param {number} n - Số lần gọi
 * @param {Function} iteratee - Hàm cần gọi (index)
 * @return {Array} Mảng kết quả
 */
lodash.times = function (n, iteratee) {
  if (typeof iteratee !== "function") return [];

  const result = [];
  for (let i = 0; i < n; i++) {
    result.push(iteratee(i));
  }
  return result;
};

// dòng này để test thôi nào test xong thì remove đi.
// module.exports = lodash;
