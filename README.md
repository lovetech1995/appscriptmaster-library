# AppScriptMaster Library - Hướng dẫn sử dụng

Đây là bộ sưu tập các thư viện hữu ích được thiết kế để tăng tốc độ phát triển trên nền tảng Google Apps Script.

## Cài đặt

Để sử dụng các thư viện này, bạn cần sao chép mã nguồn từ các file trong thư mục `src` vào dự án Apps Script của mình.

1.  Mở dự án Google Apps Script của bạn.
2.  Tạo các file script mới cho mỗi thư viện bạn muốn sử dụng (ví dụ: `sheet.gs`, `agent.gs`, `lodash.gs`, v.v.).
3.  Sao chép và dán toàn bộ nội dung của từng file `.js` tương ứng vào file `.gs` bạn vừa tạo.
4.  Lưu tất cả các file. Giờ đây bạn có thể sử dụng các hàm và lớp được cung cấp trong các file script của mình.

---

## 1. Thư viện `sheet.js`

Thư viện này cung cấp một giao diện tương tự như Firestore để dễ dàng thao tác với Google Sheets (thêm, đọc, cập nhật, xóa dữ liệu dưới dạng các đối tượng).

### Khởi tạo

Để bắt đầu, hãy tạo một thực thể (instance) mới của lớp `sheet`, trỏ đến Spreadsheet và Sheet bạn muốn làm việc.

```javascript
// Khởi tạo bằng cách chỉ định ID và tên của Sheet
const sheet = new sheet("ID_CUA_SPREADSHEET", "TEN_CUA_SHEET");

// Hoặc sử dụng Spreadsheet và Sheet đang hoạt động (active)
// const sheet = new sheet();
```

### Lấy dữ liệu (Querying)

Bạn có thể truy vấn dữ liệu bằng cách sử dụng các hàm `where()` và `query()` để xây dựng bộ lọc, sau đó dùng `getDocs()` để lấy kết quả.

**Ví dụ:** Lấy tất cả nhân viên có `age` (tuổi) lớn hơn 30 VÀ thuộc phòng `Sales`.

```javascript
function layNhanVien() {
  const sheet = new sheet("ID_CUA_SPREADSHEET", "NhanVien");

  // Xây dựng các điều kiện
  const dieuKien1 = sheet.where("age", ">", 30);
  const dieuKien2 = sheet.where("department", "==", "Sales");

  // Tạo truy vấn từ các điều kiện
  const truyVan = sheet.query([dieuKien1, dieuKien2]);

  // Thực thi truy vấn và lấy dữ liệu
  const nhanViens = sheet.getDocs(truyVan);

  nhanViens.forEach((nv) => {
    console.log(`Tên: ${nv.name}, Tuổi: ${nv.age}, Phòng: ${nv.department}`);
  });
}
```

### Các phương thức khác

- `getDoc(id, key)`: Lấy một hàng duy nhất dựa trên giá trị `id` trong cột `key`.
- `addDoc(data)`: Thêm một hàng mới vào cuối sheet. `data` là một object.
- `updateDoc(id, data, key)`: Cập nhật một hàng đã có.
- `setDoc(id, data, key)`: Cập nhật một hàng, hoặc tạo mới nếu chưa có.
- `deleteDoc(id, key)`: Xóa một hàng dựa trên `id`.

---

## 2. Thư viện `agent.js`

Thư viện này cho phép bạn tạo và quản lý các "agent" AI, giúp tương tác với nhiều nhà cung cấp mô hình ngôn ngữ lớn (LLM) khác nhau như OpenAI, Google AI, Groq, v.v.

### Cài đặt API Key

Trước tiên, bạn cần lưu trữ API key của mình bằng `PropertiesService` của Apps Script.

```javascript
function setupApiKeys() {
  const asmAgent = new Agent();
  asmAgent.setupApiKey("OPENAI_API_KEY", "sk-...");
  asmAgent.setupApiKey("GOOGLEAI_API_KEY", "...");
  asmAgent.setupApiKey("GROQ_API_KEY", "gsk_...");
}
```

### Tạo và sử dụng Agent

1.  Khởi tạo `Agent` manager.
2.  Tạo một agent cụ thể cho một nhà cung cấp và cấu hình model.
3.  Gửi truy vấn.

**Ví dụ:** Tạo một agent sử dụng GPT-4 của OpenAI và hỏi một câu.

```javascript
function testOpenAIAgent() {
  const asmAgent = new Agent();

  // Cấu hình cho agent
  const config = {
    model: "gpt-4",
    temperature: 0.8,
    systemPrompt: "Bạn là một trợ lý hữu ích.",
  };

  // Tạo một agent có tên là 'myGPT4' với nhà cung cấp 'OpenAI'
  const agentGPT4 = asmAgent.createAgent("myGPT4", "OpenAI", config);

  // Gửi truy vấn
  const response = agentGPT4.query("Thủ đô của Việt Nam là gì?");

  if (response.status === 200) {
    console.log("Phản hồi từ AI:", response.response);
  } else {
    console.error("Lỗi:", response.error);
  }
}
```

### Các nhà cung cấp được hỗ trợ

- `OpenAI`
- `GoogleAI`
- `DeepSeek`
- `OpenRouter`
- `Groq`
- `OpenAILike` (Dành cho các dịch vụ có API tương tự OpenAI)

---

## 3. Thư viện `lodash.js`

Đây là thư viện tiện ích phổ biến cung cấp nhiều hàm để làm việc với mảng, đối tượng, chuỗi, v.v. một cách dễ dàng.

Sau khi thêm `lodash.js` vào dự án, bạn có thể sử dụng đối tượng toàn cục `_`.

**Ví dụ:** Chia một mảng thành các mảng con có kích thước bằng 2.

```javascript
function testLodash() {
  const data = ["a", "b", "c", "d", "e"];
  const chunks = _.chunk(data, 2);
  console.log(chunks); // Kết quả: [['a', 'b'], ['c', 'd'], ['e']]
}
```

---

## 4. Thư viện `moment.js`

Thư viện mạnh mẽ để phân tích, xác thực, thao tác và định dạng ngày/tháng.

Sau khi thêm `moment.js`, bạn có thể sử dụng đối tượng toàn cục `moment`.

**Ví dụ:** Lấy ngày giờ hiện tại và định dạng nó.

```javascript
function testMoment() {
  // Lấy ngày giờ hiện tại
  const now = new moment().toDate();

  // Định dạng theo ý muốn
  const formattedDate = now.format("dddd, DD/MM/YYYY, HH:mm:ss");
  console.log(formattedDate); // Ví dụ: "Chủ Nhật, 07/09/2025, 15:30:10"

  // Thêm 7 ngày vào ngày hiện tại
  const nextWeek = moment().add(7, "days");
  console.log("Ngày này tuần sau:", nextWeek.format("DD/MM/YYYY"));
}
```

---

## 5. Thư viện `numeral.js`

Thư viện để định dạng và thao tác với số, rất hữu ích cho việc hiển thị tiền tệ, phần trăm, v.v.

Sau khi thêm `numeral.js`, bạn có thể sử dụng đối tượng toàn cục `numeral`.

**Ví dụ:** Định dạng số thành dạng tiền tệ.

```javascript
function testNumeral() {
  const price = 1234567.89;

  // Định dạng tiền tệ
  const currency = new numeral.create(price).format("$0,0.00");
  console.log(currency); // Kết quả: $1,234,567.89

  // Định dạng số thông thường
  const number = new numeral.create(price).format("0,0");
  console.log(number); // Kết quả: 1,234,568
}
```

## Sử dụng dưới dạng Thư viện Apps Script

Ngoài việc sao chép mã nguồn, bạn có thể tích hợp toàn bộ dự án này như một thư viện chỉ với vài bước đơn giản.

### 1. Thêm thư viện vào dự án của bạn

1.  Mở dự án Google Apps Script.
2.  Nhấp vào biểu tượng **Libraries** (`+` bên cạnh "Thư viện").
3.  Trong ô "Thêm thư viện", dán ID sau:
    ```
    10vKTX11KgffA1SLyKzvYbu8n_n2ehVncvV7a0SK_J-FFl9Sv6CD40MGt
    ```
4.  Nhấp vào **Look up**.
5.  Chọn phiên bản mới nhất.
6.  Để nguyên mã nhận dạng Mặc định là `ASM` (hoặc đổi tên nếu muốn). Đây sẽ là tên bạn dùng để gọi các hàm từ thư viện.
7.  Nhấp vào **Add**.

### 2. Cách gọi hàm từ thư viện

Sau khi thêm thư viện, bạn có thể gọi bất kỳ lớp hoặc hàm nào bằng cách sử dụng mã nhận dạng đã chọn.

**Ví dụ:** Sử dụng lớp `sheet` từ thư viện.

```javascript
function suDungThuVienSheet() {
  // Thay vì "new sheet()", bạn sẽ dùng "new AppScriptMaster.sheet()"
  const sheet = new ASM.sheet("ID_CUA_SPREADSHEET", "TEN_CUA_SHEET");

  const data = sheet.getDoc("some_id", "id");
  console.log(data);
}
```

**Ví dụ:** Sử dụng `lodash` (được export dưới tên `lodash` trong thư viện).

```javascript
function suDungLodashQuaThuVien() {
  const numbers = [1, 2, 3, 4, 5];

  // Gọi hàm chunk thông qua AppScriptMaster._
  const chunks = ASM.lodash.chunk(numbers, 2);
  console.log(chunks); // [[1, 2], [3, 4], [5]]
}
```

---

Cảm ơn bạn đã quan tâm! Dự án sẽ liên tục được cập nhật và hoàn thiện, nhằm đóng góp cho cộng đồng yêu thích Google Apps Script những công cụ chuyên nghiệp và hữu ích nhất.

---
