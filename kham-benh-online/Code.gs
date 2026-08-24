/**
 * HƯỚNG DẪN CÀI ĐẶT GOOGLE APPS SCRIPT CHO FORM KHÁM BỆNH INVAMAX (CẬP NHẬT)
 * 
 * BƯỚC 1: Mở Google Sheet "Dữ liệu Khám bệnh nhà máy".
 * BƯỚC 2: Vào Tiện ích mở rộng -> Apps Script.
 * BƯỚC 3: Xóa code cũ, paste toàn bộ code dưới đây vào.
 * BƯỚC 4: Tạo một file Google Docs làm Mẫu Báo Cáo. Trong Docs, bạn có thể gõ các từ khóa để code tự điền vào:
 *         {{TEN_CONG_TY}}, {{DIEM}}, {{MUC_DO}}, {{BENH}}, {{GOI_Y}}, v.v.
 *         Copy phần ID của file Docs đó (nằm trên thanh địa chỉ, giữa /d/ và /edit)
 * BƯỚC 5: Dán ID đó vào biến TEMPLATE_DOC_ID ở dưới.
 * BƯỚC 6: Lưu lại, cấp quyền (nếu nó yêu cầu khi chạy thử).
 * BƯỚC 7: F5 tải lại trang Google Sheet, bạn sẽ thấy menu mới tên là "🤖 INVAMAX".
 */

const SHEET_NAME = "Trang tính1"; 

// !!! QUAN TRỌNG: ĐIỀN ID CỦA FILE GOOGLE DOCS MẪU VÀO ĐÂY !!!
const TEMPLATE_DOC_ID = "YOUR_GOOGLE_DOC_TEMPLATE_ID_HERE"; 

// Hàm tự động chạy khi mở file Sheet để tạo Menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 INVAMAX')
      .addItem('Tạo PDF & Lên nháp Email (Dòng đang chọn)', 'generateAndDraftEmail')
      .addToUi();
}

// Hàm nhận dữ liệu từ Web Form bắn về
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // --- AUTHENTICATION ACTIONS ---
    if (payload.action === 'register') {
      let sheet = ss.getSheetByName('Khách hàng');
      if (!sheet) {
        sheet = ss.insertSheet('Khách hàng');
        sheet.appendRow(['Thời gian', 'Họ tên', 'Email', 'Mật khẩu', 'Nguồn']);
        sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f3f4f6');
        sheet.setFrozenRows(1);
      }
      
      // Check if email already exists
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === payload.email) {
          return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "Email đã tồn tại" })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      // Register
      sheet.appendRow([new Date(), payload.name, payload.email, payload.password, 'Email']);
      return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Đăng ký thành công" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (payload.action === 'login') {
      const sheet = ss.getSheetByName('Khách hàng');
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "Sai email hoặc mật khẩu" })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = sheet.getDataRange().getValues();
      let found = false;
      let userName = '';
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === payload.email && data[i][3] === payload.password) {
          found = true;
          userName = data[i][1];
          break;
        }
      }
      
      if (found) {
        logLogin(ss, payload.email);
        return ContentService.createTextOutput(JSON.stringify({ "status": "success", "name": userName })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": "Sai email hoặc mật khẩu" })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    if (payload.action === 'google_login') {
      let sheet = ss.getSheetByName('Khách hàng');
      if (!sheet) {
        sheet = ss.insertSheet('Khách hàng');
        sheet.appendRow(['Thời gian', 'Họ tên', 'Email', 'Mật khẩu', 'Nguồn']);
        sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f3f4f6');
        sheet.setFrozenRows(1);
      }
      
      const data = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] === payload.email) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        sheet.appendRow([new Date(), payload.name, payload.email, '', 'Google']);
      }
      
      logLogin(ss, payload.email);
      return ContentService.createTextOutput(JSON.stringify({ "status": "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    
    if (payload.action === 'get_history') {
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ "status": "success", "data": [] })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = sheet.getDataRange().getValues();
      const history = [];
      
      for (let i = 1; i < data.length; i++) {
        // Cột K (index 10) là Email
        if (data[i][10] === payload.email) {
          try {
             // Cột cuối cùng (data[i].length - 1) là raw JSON của submission
             const rawStr = data[i][data[i].length - 1];
             if (rawStr && rawStr.startsWith('{')) {
                 const rawObj = JSON.parse(rawStr);
                 history.push({
                     timestamp: data[i][0],
                     companyName: data[i][1],
                     warningScore: data[i][12],
                     level: data[i][13],
                     rawAnswers: rawObj
                 });
             }
          } catch(e) {}
        }
      }
      
      // Sắp xếp mới nhất lên đầu
      history.reverse();
      
      return ContentService.createTextOutput(JSON.stringify({ "status": "success", "data": history })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- DEFAULT ACTION (SUBMIT FORM) ---
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    // Nếu sheet trống, tự động tạo Header
    if (sheet.getLastRow() === 0) {
      const headers = [
        "Thời gian",
        "Tên công ty", "Ngành nghề", "Sản phẩm chính", "Địa chỉ", "Số năm HĐ", "Quy mô",
        "Họ và tên", "Chức vụ", "Số điện thoại", "Email",
        "Ưu tiên cải tiến",
        "Điểm cảnh báo", "Mức đánh giá", 
        "Top 3 Triệu chứng", "Top 3 NỀN FOS yếu", "3 Bệnh vận hành",
        "Gợi ý phác đồ"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }

    const rowData = [
      new Date(), // Thời gian
      payload.factoryInfo.A01 || "", // Tên công ty
      payload.factoryInfo.A02 || "", // Ngành nghề
      payload.factoryInfo.A03 || "", // Sản phẩm chính
      payload.factoryInfo.A04 || "", // Địa chỉ
      payload.factoryInfo.A05 || "", // Số năm HĐ
      payload.factoryInfo.A06 || "", // Quy mô
      
      payload.contactInfo.F01 || "", // Họ tên
      payload.contactInfo.F02 || "", // Chức vụ
      payload.contactInfo.F04 || "", // Điện thoại (F04)
      payload.contactInfo.F03 || "", // Email (F03)
      payload.priorityInfo.E01 || "", // Ưu tiên (E01)
      
      payload.scores.warningScore || 0,
      payload.scores.assessmentLevel || "",
      (payload.scores.top3Wastes || []).join(", "),
      (payload.scores.top3FOS || []).join(", "),
      (payload.scores.diseases || []).join(", "),
      payload.scores.nextSteps || "", e.postData.contents];

    sheet.appendRow(rowData);

    return ContentService
      .createTextOutput(JSON.stringify({ "status": "success", "message": "Đã lưu dữ liệu" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function logLogin(ss, email) {
  let sheet = ss.getSheetByName('Nhật ký đăng nhập');
  if (!sheet) {
    sheet = ss.insertSheet('Nhật ký đăng nhập');
    sheet.appendRow(['Thời gian', 'Email']);
    sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#f3f4f6');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date(), email]);
}


// Xử lý request OPTIONS (CORS preflight) nếu fetch dùng application/json
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}


// Hàm Xử lý tạo Báo cáo PDF và Tạo thư nháp
function generateAndDraftEmail() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const activeRowIndex = sheet.getActiveCell().getRow();
  
  if (activeRowIndex === 1) {
    SpreadsheetApp.getUi().alert("Vui lòng chọn một dòng dữ liệu của khách hàng (không chọn dòng tiêu đề)!");
    return;
  }
  
  const data = sheet.getRange(activeRowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Ánh xạ dữ liệu cột
  const email = data[10]; // Cột K (Email)
  const tenCongTy = data[1]; // Cột B
  const diem = data[12]; // Cột M
  const mucDo = data[13]; // Cột N
  const trieuChung = data[14]; // Cột O
  const fosYeu = data[15]; // Cột P
  const benh = data[16]; // Cột Q
  const goiY = data[17]; // Cột R
  const tenKhach = data[7]; // Cột H

  if (!email) {
    SpreadsheetApp.getUi().alert("Không tìm thấy email ở dòng này!");
    return;
  }
  
  if (TEMPLATE_DOC_ID === "YOUR_GOOGLE_DOC_TEMPLATE_ID_HERE") {
    SpreadsheetApp.getUi().alert("Bạn chưa cấu hình ID của Google Docs Mẫu (TEMPLATE_DOC_ID). Vui lòng đọc Hướng dẫn!");
    return;
  }
  
  // 1. Copy Template Docs ra 1 bản nháp
  const templateDoc = DriveApp.getFileById(TEMPLATE_DOC_ID);
  const tempDoc = templateDoc.makeCopy("Bao_Cao_Chi_Tiet_INVAMAX_" + tenCongTy);
  const tempDocId = tempDoc.getId();
  const doc = DocumentApp.openById(tempDocId);
  const body = doc.getBody();
  
  // 2. Điền dữ liệu vào Template (Thay thế các {{TUKHOA}})
  body.replaceText("{{TEN_CONG_TY}}", tenCongTy);
  body.replaceText("{{DIEM}}", diem);
  body.replaceText("{{MUC_DO}}", mucDo);
  body.replaceText("{{TRIEU_CHUNG}}", trieuChung);
  body.replaceText("{{FOS_YEU}}", fosYeu);
  body.replaceText("{{BENH}}", benh);
  body.replaceText("{{GOI_Y}}", goiY);
  
  doc.saveAndClose();
  
  // 3. Chuyển thành PDF
  const pdfBlob = tempDoc.getAs(MimeType.PDF);
  pdfBlob.setName("Bao_Cao_Chi_Tiet_INVAMAX_" + tenCongTy + ".pdf");
  
  // 4. Tạo thư nháp trong Gmail
  const subject = "[INVAMAX] Báo cáo chẩn đoán chi tiết Hệ thống vận hành - " + tenCongTy;
  const htmlBody = `
    <p>Chào anh/chị <b>${tenKhach}</b>,</p>
    <p>Cảm ơn anh/chị đã tin tưởng và sử dụng dịch vụ Khám bệnh nhà máy của INVAMAX.</p>
    <p>INVAMAX đã nhận được khoản thanh toán và xin gửi đến anh/chị <b>Báo cáo chẩn đoán chi tiết (PDF)</b> được đính kèm trong email này.</p>
    <p>Dựa trên kết quả phân tích, chuyên gia của chúng tôi sẵn sàng hỗ trợ anh/chị trong các bước tiếp theo để tối ưu hóa quy trình.</p>
    <br>
    <p>Trân trọng,</p>
    <p><b>Đội ngũ INVAMAX</b></p>
  `;
  
  GmailApp.createDraft(email, subject, "", {
    htmlBody: htmlBody,
    attachments: [pdfBlob]
  });
  
  // 5. Xóa file Docs nháp đi cho đỡ rác Drive
  tempDoc.setTrashed(true);
  
  SpreadsheetApp.getUi().alert("✅ Đã tạo thành công! Hãy vào hộp thư nháp (Drafts) của Gmail để xem lại và bấm Gửi.");
}

