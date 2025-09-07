/**
 * Class Moment dùng để tính toán thời gian
 * @class
 * @classdesc Khai báo một biến thời gian để tiến hành tính toán nhanh các giá trị thời gian
 */
function moment(date) {
  /**
   * Đối tượng Date JavaScript bên trong
   * @type {Date}
   * @private
   */
  this._date = date ? new Date(date) : new Date();

  /**
   * Mảng tên các ngày trong tuần
   * @type {Array.<string>}
   * @const
   */
  this._weekdays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  /**
   * Mảng tên các tháng
   * @type {Array.<string>}
   * @const
   */
  this._months = [
    "Tháng Một",
    "Tháng Hai",
    "Tháng Ba",
    "Tháng Tư",
    "Tháng Năm",
    "Tháng Sáu",
    "Tháng Bảy",
    "Tháng Tám",
    "Tháng Chín",
    "Tháng Mười",
    "Tháng Mười Một",
    "Tháng Mười Hai",
  ];
}

/**
 * Định dạng ngày theo chuỗi định dạng
 * @param {string} formatString - Chuỗi định dạng (YYYY: năm, MM: tháng, DD: ngày, HH: giờ, mm: phút, ss: giây)
 * @return {string} Chuỗi ngày đã định dạng
 */
moment.prototype.format = function (formatString) {
  const year = this._date.getFullYear();
  const month = this._date.getMonth() + 1;
  const day = this._date.getDate();
  const hours = this._date.getHours();
  const minutes = this._date.getMinutes();
  const seconds = this._date.getSeconds();

  let result = formatString;
  result = result.replace("YYYY", year);
  result = result.replace("MM", month.toString().padStart(2, "0"));
  result = result.replace("DD", day.toString().padStart(2, "0"));
  result = result.replace("HH", hours.toString().padStart(2, "0"));
  result = result.replace("mm", minutes.toString().padStart(2, "0"));
  result = result.replace("ss", seconds.toString().padStart(2, "0"));

  return result;
};

/**
 * Thêm một khoảng thời gian vào ngày hiện tại
 * @param {number} amount - Số lượng cần thêm
 * @param {string} unit - Đơn vị ('days', 'months', 'years', 'hours', 'minutes', 'seconds')
 * @return {moment} Đối tượng moment mới với ngày đã được cập nhật
 */
moment.prototype.add = function (amount, unit) {
  const newDate = new Date(this._date);

  switch (unit) {
    case "days":
      newDate.setDate(newDate.getDate() + amount);
      break;
    case "months":
      newDate.setMonth(newDate.getMonth() + amount);
      break;
    case "years":
      newDate.setFullYear(newDate.getFullYear() + amount);
      break;
    case "hours":
      newDate.setHours(newDate.getHours() + amount);
      break;
    case "minutes":
      newDate.setMinutes(newDate.getMinutes() + amount);
      break;
    case "seconds":
      newDate.setSeconds(newDate.getSeconds() + amount);
      break;
  }

  return new moment(newDate);
};

/**
 * Lấy tên ngày trong tuần
 * @return {string} Tên ngày trong tuần
 */
moment.prototype.dayName = function () {
  return this._weekdays[this._date.getDay()];
};

/**
 * Lấy tên tháng
 * @return {string} Tên tháng
 */
moment.prototype.monthName = function () {
  return this._months[this._date.getMonth()];
};

/**
 * So sánh với một ngày khác
 * @param {moment|Date|string} otherDate - Ngày cần so sánh
 * @return {number} -1 nếu ngày hiện tại nhỏ hơn, 0 nếu bằng, 1 nếu lớn hơn
 */
moment.prototype.compareTo = function (otherDate) {
  let compareDate;

  if (otherDate instanceof moment) {
    compareDate = otherDate._date;
  } else if (otherDate instanceof Date) {
    compareDate = otherDate;
  } else {
    compareDate = new Date(otherDate);
  }

  if (this._date < compareDate) return -1;
  if (this._date > compareDate) return 1;
  return 0;
};

/**
 * Tính khoảng cách giữa hai ngày
 * @param {moment|Date|string} otherDate - Ngày cần tính khoảng cách
 * @param {string} unit - Đơn vị ('days', 'months', 'years', 'hours', 'minutes', 'seconds')
 * @return {number} Khoảng cách theo đơn vị được chỉ định
 */
moment.prototype.diff = function (otherDate, unit) {
  let compareDate;

  if (otherDate instanceof moment) {
    compareDate = otherDate._date;
  } else if (otherDate instanceof Date) {
    compareDate = otherDate;
  } else {
    compareDate = new Date(otherDate);
  }

  const diffMs = Math.abs(this._date - compareDate);

  switch (unit) {
    case "days":
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    case "months":
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    case "years":
      return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
    case "hours":
      return Math.floor(diffMs / (1000 * 60 * 60));
    case "minutes":
      return Math.floor(diffMs / (1000 * 60));
    case "seconds":
      return Math.floor(diffMs / 1000);
    default:
      return diffMs;
  }
};

/**
 * Trả về giá trị date value
 * @param {moment|string} date - Ngày cần trả về
 * @return {Date} - Đơn vị ngày dùng để tính toán các giá trị ngày khác
 */
moment.prototype.toDate = function () {
  let returnDate;
  const date = this._date;

  if (date instanceof moment) {
    returnDate = date._date;
  } else {
    returnDate = new Date(date);
  }

  return returnDate;
};

/**
 * Tạo đối tượng moment từ ngày hiện tại
 * @return {moment} Đối tượng moment mới
 */
moment.now = function () {
  return new moment();
};

/**
 * Tạo đối tượng moment từ chuỗi ngày
 * @param {string} dateString - Chuỗi ngày tháng
 * @return {moment} Đối tượng moment mới
 */
moment.parse = function (dateString) {
  return new moment(dateString);
};

// dòng này để test thôi nào test xong thì remove đi.
// module.exports = moment;
