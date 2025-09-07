/**
 * Thư viện mô phỏng Firestore API để thao tác với Google Sheets.
 * @namespace sheet
 * @param {string} [sheetId] - ID của spreadsheet. Nếu bỏ qua, sẽ dùng spreadsheet hiện tại.
 * @param {string} [sheetName] - Tên của sheet. Mặc định là sheet đầu tiên.
 * @class
 */
function sheet(sheetId, sheetName) {
  this.sheetId = sheetId || null;
  this.sheetName = sheetName || null;
}

/**
 * [Hàm nội bộ] Lấy đối tượng sheet một cách an toàn.
 * @private
 * @return {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
sheet.prototype._getSheet = function () {
  let ss;
  try {
    if (this.sheetId) {
      ss = SpreadsheetApp.openById(this.sheetId);
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
  } catch (e) {
    console.error("Lỗi khi truy cập spreadsheet. ID: " + this.sheetId, e);
    return null;
  }

  if (this.sheetName) {
    const ws = ss.getSheetByName(this.sheetName);
    if (!ws) {
      console.error("Không tìm thấy sheet với tên: " + this.sheetName);
      return null;
    }
    return ws;
  }
  // Nếu không có sheetName, lấy sheet đang hoạt động
  return ss.getSheets()[0];
};

/**
 * Lấy các document (hàng) từ collection (sheet), có thể kèm theo điều kiện truy vấn.
 * @param {Object} [queryOptions] - Tùy chọn truy vấn.
 * @param {Array<Array<any>>} [queryOptions.where] - Mảng các điều kiện 'where'. Mỗi điều kiện là một mảng con `[field, operator, value]`.
 *   - `field` (string): Tên cột (header) để lọc.
 *   - `operator` (string): Toán tử so sánh. Hỗ trợ: '==', '!=', '>', '>=', '<', '<=', 'in', 'array-contains'.
 *   - `value`: Giá trị để so sánh.
 * @return {Array<Object>} Một mảng các object thỏa mãn điều kiện truy vấn.
 * @example
 * // Lấy tất cả user có age > 30
 * getDocs({ where: [ ['age', '>', 30] ] })
 * // Lấy tất cả sản phẩm thuộc phòng 'Sales' VÀ có status là 'active'
 * getDocs({ where: [ ['department', '==', 'Sales'], ['status', '==', 'active'] ] })
 */
sheet.prototype.getDocs = function (queryOptions) {
  const ws = this._getSheet();
  if (!ws || ws.getLastRow() <= 1) {
    return [];
  }
  const allData = ws.getDataRange().getDisplayValues();
  const headers = allData.shift();
  const allObjects = allData.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
      }
    });
    return obj;
  });

  // Nếu không có query, trả về tất cả
  if (!queryOptions || !queryOptions.where || queryOptions.where.length === 0) {
    return allObjects;
  }

  const conditions = queryOptions.where;

  // Lọc các object dựa trên điều kiện
  const filteredObjects = allObjects.filter((doc) => {
    // Một document phải thỏa mãn TẤT CẢ các điều kiện
    return conditions.every((condition) => {
      const [field, op, value] = condition;
      const docValue = doc[field];

      if (docValue === undefined) {
        return false;
      }

      // Xử lý toán tử
      switch (op) {
        case "==":
          return String(docValue) == String(value);
        case "!=":
          return String(docValue) != String(value);
        case ">":
          return Number(docValue) > Number(value);
        case ">=":
          return Number(docValue) >= Number(value);
        case "<":
          return Number(docValue) < Number(value);
        case "<=":
          return Number(docValue) <= Number(value);
        case "in":
          return (
            Array.isArray(value) && value.map(String).includes(String(docValue))
          );
        case "array-contains":
          // Giả sử ô trong sheet là một chuỗi các giá trị cách nhau bởi dấu phẩy
          const docArray = String(docValue)
            .split(",")
            .map((item) => item.trim());
          return docArray.includes(String(value));
        default:
          console.warn("Toán tử không được hỗ trợ: " + op);
          return false;
      }
    });
  });

  return filteredObjects;
};

/**
 * thiết lập các hàm where doc
 * @param {string} fieldName - Tên của cột cần so sánh.
 * @param {string} operator - Các Toán tử so sánh. Hỗ trợ: '==', '!=', '>', '>=', '<', '<=', 'in', 'array-contains'.
 * @param {string} value - Giá trị của các hàm so sánh.
 * @return {Arrays} Object chứa dữ liệu của document, hoặc null nếu không tìm thấy.
 */
sheet.where = function (fieldName, operator, value) {
  return [fieldName, operator, value];
};

/**
 * thiết lập các hàm query doc
 * @param {Arrays} wheresQuery - Các bậc thức so sánh khác nhau
 * @return {Object} trả về Object query dùng để nạp vào hàm.
 */
sheet.query = function (wheresQuery) {
  return { where: wheresQuery };
};

/**
 * Lấy một document (hàng) duy nhất bằng ID.
 * @param {string|number} id - Giá trị ID của document cần tìm.
 * @param {string} key - Tên của cột (header) chứa ID.
 * @return {Object|null} Object chứa dữ liệu của document, hoặc null nếu không tìm thấy.
 */
sheet.prototype.getDoc = function (id, key) {
  // Tận dụng getDocs có sẵn để tránh lặp code
  const results = this.getDocs({ where: [[key, "==", id]] });
  return results.length > 0 ? results[0] : null;
};

/**
 * Cập nhật một document (hàng) đã tồn tại. Không tạo mới nếu không tìm thấy.
 * @param {string|number} id - Giá trị ID của document cần cập nhật.
 * @param {Object} data - Object chứa các trường cần cập nhật. Ví dụ: { "age": 30, "status": "active" }.
 * @param {string} key - Tên của cột (header) chứa ID.
 * @return {boolean} Trả về true nếu cập nhật thành công, false nếu không tìm thấy document.
 */
sheet.prototype.updateDoc = function (id, data, key) {
  const ws = this._getSheet();
  if (!ws) return false;

  const allData = ws.getDataRange().getDisplayValues();
  const headers = allData[0];
  const idColumnIndex = headers.indexOf(key);
  if (idColumnIndex === -1) {
    console.error("Không tìm thấy cột ID với tên: " + key);
    return false;
  }

  // Tìm chỉ số của hàng cần cập nhật (bỏ qua tiêu đề)
  const rowIndex = allData
    .slice(1)
    .findIndex((row) => String(row[idColumnIndex]) === String(id));
  if (rowIndex === -1) {
    return false; // Document không tồn tại
  }

  const actualRowIndex = rowIndex + 2; // +1 vì slice, +1 vì index của sheet bắt đầu từ 1

  // Cập nhật từng ô
  for (const key in data) {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      ws.getRange(actualRowIndex, colIndex + 1).setValue(data[key]);
    }
  }
  return true;
};

/**
 * Tạo hoặc ghi đè một document (hàng).
 * @param {string|number} id - Giá trị ID của document.
 * @param {Object} data - Object chứa toàn bộ dữ liệu của document.
 * @param {string} key - Tên của cột (header) chứa ID.
 * @return {boolean} Trả về true nếu thực hiện thành công.
 */
sheet.prototype.setDoc = function (id, data, key) {
  const ws = this._getSheet();
  if (!ws) return false;

  const allData = ws.getDataRange().getDisplayValues();
  const headers = allData[0];
  const idColumnIndex = headers.indexOf(key);
  if (idColumnIndex === -1) {
    console.error("Không tìm thấy cột ID với tên: " + key);
    return false;
  }

  const rowIndex = allData
    .slice(1)
    .findIndex((row) => String(row[idColumnIndex]) === String(id));

  // Tạo một mảng mới theo đúng thứ tự của header
  const newRow = headers.map((header) =>
    data[header] !== undefined ? data[header] : ""
  );
  // Đảm bảo ID được gán đúng
  newRow[idColumnIndex] = id;

  if (rowIndex !== -1) {
    // Document đã tồn tại -> Ghi đè
    const actualRowIndex = rowIndex + 2;
    ws.getRange(actualRowIndex, 1, 1, headers.length).setValues([newRow]);
  } else {
    // Document chưa tồn tại -> Thêm mới
    ws.appendRow(newRow);
  }
  return true;
};

// module.exports = sheet;
