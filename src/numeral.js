/**
 * Thư viện mô phỏng Numeral.js cho Google Apps Script
 * @namespace numeral
 * @classdesc Cung cấp các hàm định dạng và thao tác với số
 */
function numeral() {}

/**
 * Đối tượng định dạng mặc định
 * @private
 */
numeral._defaults = {
  decimalPlaces: 0,
  thousandsSeparator: ",",
  decimalSeparator: ".",
  abbreviations: {
    thousand: "k",
    million: "m",
    billion: "b",
    trillion: "t",
  },
  currency: {
    symbol: "$",
    position: "prefix",
  },
  percentage: {
    symbol: "%",
    decimalPlaces: 0,
  },
};

/**
 * Cấu hình định dạng tùy chỉnh
 * @private
 */
numeral._options = {};

// khởi tạo và thiết lập

/**
 * Tạo đối tượng numeral từ giá trị số
 * @param {number|string} value - Giá trị số cần xử lý
 * @return {Object} Đối tượng numeral
 */
numeral.create = function (value) {
  const instance = Object.create(numeral.prototype);
  instance._value = numeral._parseNumber(value);
  instance._options = Object.assign({}, numeral._defaults, numeral._options);
  return instance;
};

/**
 * Thiết lập tùy chọn định dạng
 * @param {Object} options - Tùy chọn định dạng
 * @return {void}
 */
numeral.setOptions = function (options) {
  numeral._options = Object.assign({}, numeral._options, options);
};

/**
 * Phân tích giá trị thành số
 * @private
 * @param {number|string} value - Giá trị cần phân tích
 * @return {number} Giá trị số
 */
numeral._parseNumber = function (value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    // Xử lý chuỗi có chứa dấu phân cách
    const cleanValue = value.replace(/[^\d.-]/g, "");
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

/**
 * Định dạng số theo chuỗi
 * @param {string} formatString - Chuỗi định dạng (ví dụ: "0,0.00")
 * @return {string} Chuỗi số đã định dạng
 */
numeral.prototype.format = function (formatString) {
  if (!formatString) return this._value.toString();

  const value = this._value;
  const parts = formatString.split(".");
  const integerPartFormat = parts[0];
  const decimalPartFormat = parts.length > 1 ? parts[1] : "";

  const decimalPlaces = decimalPartFormat.length;
  const useThousandsSeparator = integerPartFormat.includes(",");

  let fixedValue = value.toFixed(decimalPlaces);
  let [integerDigits, decimalDigits] = fixedValue.split(".");

  if (useThousandsSeparator) {
    integerDigits = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return decimalDigits ? integerDigits + "." + decimalDigits : integerDigits;
};

// 3.2. Định dạng tiền tệ

/**
 * Định dạng số thành tiền tệ
 * @param {string} [symbol] - Ký hiệu tiền tệ (sử dụng mặc định nếu không cung cấp)
 * @return {string} Chuỗi tiền tệ đã định dạng
 */
numeral.prototype.formatCurrency = function (symbol) {
  const currencySymbol = symbol || this._options.currency.symbol;
  const formattedNumber = this.format("0,0.00");

  if (this._options.currency.position === "prefix") {
    return currencySymbol + formattedNumber;
  } else {
    return formattedNumber + currencySymbol;
  }
};

// 3.3 Định dạng phần trăm.
/**
 * Định dạng số thành phần trăm
 * @param {number} [decimalPlaces] - Số chữ số thập phân (sử dụng mặc định nếu không cung cấp)
 * @return {string} Chuỗi phần trăm đã định dạng
 */
numeral.prototype.formatPercentage = function (decimalPlaces) {
  const places =
    decimalPlaces !== undefined
      ? decimalPlaces
      : this._options.percentage.decimalPlaces;
  const value = this._value * 100;
  const formattedNumber = numeral
    .create(value)
    .format("0,0." + "0".repeat(places));
  return formattedNumber + this._options.percentage.symbol;
};

// 3.4 Định dạng tiêu chuẩn
/**
 * Định dạng số với đơn vị rút gọn (k, m, b, t)
 * @return {string} Chuỗi số đã định dạng với đơn vị rút gọn
 */
numeral.prototype.formatShort = function () {
  let value = Math.abs(this._value);
  let unit = "";

  if (value >= 1000000000000) {
    value = value / 1000000000000;
    unit = this._options.abbreviations.trillion;
  } else if (value >= 1000000000) {
    value = value / 1000000000;
    unit = this._options.abbreviations.billion;
  } else if (value >= 1000000) {
    value = value / 1000000;
    unit = this._options.abbreviations.million;
  } else if (value >= 1000) {
    value = value / 1000;
    unit = this._options.abbreviations.thousand;
  }

  const formattedValue = numeral.create(value).format("0,0.00");
  return formattedValue + unit;
};

// các phương thức thêm
/**
 * Cộng thêm giá trị
 * @param {number|string} value - Giá trị cần cộng
 * @return {Object} Đối tượng numeral
 */
numeral.prototype.add = function (value) {
  this._value += numeral._parseNumber(value);
  return this;
};

/**
 * Trừ đi giá trị
 * @param {number|string} value - Giá trị cần trừ
 * @return {Object} Đối tượng numeral
 */
numeral.prototype.subtract = function (value) {
  this._value -= numeral._parseNumber(value);
  return this;
};

/**
 * Nhân với giá trị
 * @param {number|string} value - Giá trị cần nhân
 * @return {Object} Đối tượng numeral
 */
numeral.prototype.multiply = function (value) {
  this._value *= numeral._parseNumber(value);
  return this;
};

/**
 * Chia cho giá trị
 * @param {number|string} value - Giá trị cần chia
 * @return {Object} Đối tượng numeral
 */
numeral.prototype.divide = function (value) {
  const divisor = numeral._parseNumber(value);
  if (divisor !== 0) {
    this._value /= divisor;
  }
  return this;
};

// 5. các tiện ích
/**
 * Lấy giá trị số
 * @return {number} Giá trị số
 */
numeral.prototype.value = function () {
  return this._value;
};

/**
 * Thiết lập giá trị mới
 * @param {number|string} value - Giá trị mới
 * @return {Object} Đối tượng numeral
 */
numeral.prototype.set = function (value) {
  this._value = numeral._parseNumber(value);
  return this;
};

/**
 * Sao chép đối tượng
 * @return {Object} Đối tượng numeral mới
 */
numeral.prototype.clone = function () {
  return numeral.create(this._value);
};

/**
 * Chuyển đổi chuỗi định dạng thành số
 * @param {string} formattedString - Chuỗi định dạng
 * @return {number} Giá trị số
 */
numeral.unformat = function (formattedString) {
  // Xử lý tiền tệ
  let cleanString = formattedString.replace(/[^\d.-]/g, "");

  // Xử lý phần trăm
  if (formattedString.includes("%")) {
    cleanString = cleanString.replace("%", "");
    const value = parseFloat(cleanString) || 0;
    return value / 100;
  }

  // Xử lý đơn vị rút gọn
  const abbreviations = numeral._defaults.abbreviations;
  if (formattedString.includes(abbreviations.thousand)) {
    cleanString = cleanString.replace(abbreviations.thousand, "");
    return parseFloat(cleanString) * 1000;
  } else if (formattedString.includes(abbreviations.million)) {
    cleanString = cleanString.replace(abbreviations.million, "");
    return parseFloat(cleanString) * 1000000;
  } else if (formattedString.includes(abbreviations.billion)) {
    cleanString = cleanString.replace(abbreviations.billion, "");
    return parseFloat(cleanString) * 1000000000;
  } else if (formattedString.includes(abbreviations.trillion)) {
    cleanString = cleanString.replace(abbreviations.trillion, "");
    return parseFloat(cleanString) * 1000000000000;
  }

  return parseFloat(cleanString) || 0;
};

// dòng này để test thôi nào test xong thì remove đi.
// module.exports = numeral;
