/**
 * HƯỚNG DẪN CÀI ĐẶT MỚI NHẤT (CHO CẢ 2 FORM):
 * 1. Mở lại Google Apps Script project của bạn.
 * 2. Copy toàn bộ mã này đè lên mã cũ trong file `Code.gs`.
 * 3. Đảm bảo bạn đã thay đúng 3 hằng số dưới đây: FOLDER_ID, SHEET_ID, EMAIL_TO.
 * 4. Bấm Deploy > Manage deployments > Chọn deployment cũ > Bấm biểu tượng ✏️ Edit > Chọn Version: New > Bấm Deploy.
 *    (Hoặc tạo New deployment mới và thay đổi URL trên web cũng được).
 */

const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID'; // Thay ID thư mục Drive
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Thay ID file Google Sheet 
const EMAIL_TO = 'info@invamax.com'; // Email nhận thông báo

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const formType = data.formType; // 'contact' hoặc 'quote'
    
    // Thời gian gửi
    const timestamp = new Date();
    const timeString = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    // -----------------------------------------------------
    // XỬ LÝ CHO FORM YÊU CẦU BÁO GIÁ
    // -----------------------------------------------------
    if (formType === 'quote') {
      let fileUrl = '';
      
      // Xử lý lưu file đính kèm nếu có
      if (data.fileBase64 && data.fileName) {
        const folder = DriveApp.getFolderById(FOLDER_ID);
        const decodedData = Utilities.base64Decode(data.fileBase64);
        const blob = Utilities.newBlob(decodedData, data.mimeType, data.fileName);
        const file = folder.createFile(blob);
        fileUrl = file.getUrl();
      }
      
      // 1. Lưu vào Google Sheet (Tab: BaoGia)
      try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName('BaoGia');
        if (sheet) {
          // Thời gian | Họ tên | Công ty | Số điện thoại | Email | Yêu cầu báo giá | File đính kèm
          sheet.appendRow([
            timeString,
            data.name,
            data.company,
            data.phone ? "'" + data.phone : "",
            data.email,
            data.requirement,
            fileUrl
          ]);
        }
      } catch(err) {
        console.log('Lỗi ghi Sheet BaoGia:', err);
      }
      
      // 2. Tạo PDF và gửi Email
      const htmlBody = `
        <h2>Yêu Cầu Báo Giá Mới (Supply Hub)</h2>
        <p><strong>Thời gian:</strong> ${timeString}</p>
        <p><strong>Họ và tên:</strong> ${data.name}</p>
        <p><strong>Công ty/Nhà máy:</strong> ${data.company}</p>
        <p><strong>Số điện thoại:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Nội dung yêu cầu:</strong><br/>${(data.requirement || '').replace(/\\n/g, '<br/>')}</p>
        <p><strong>File đính kèm:</strong> ${fileUrl ? `<a href="${fileUrl}">Xem file</a>` : 'Không có'}</p>
        <hr/>
        <p><em>Hệ thống gửi tự động từ Website INVAMAX</em></p>
      `;
      
      const htmlBlob = Utilities.newBlob(htmlBody, 'text/html', 'Yeu_Cau_Bao_Gia_' + data.name + '.html');
      const pdfBlob = htmlBlob.getAs('application/pdf');
      pdfBlob.setName('Yeu_Cau_Bao_Gia_' + data.name + '.pdf');
      
      MailApp.sendEmail({
        to: EMAIL_TO,
        subject: `[Yêu cầu báo giá mới] từ ${data.company} - ${data.name}`,
        htmlBody: htmlBody,
        attachments: [pdfBlob]
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Đã gửi yêu cầu báo giá thành công'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // -----------------------------------------------------
    // XỬ LÝ CHO FORM ĐĂNG KÝ TƯ VẤN (KHÁM BỆNH)
    // -----------------------------------------------------
    else if (formType === 'contact') {
      
      // 1. Lưu vào Google Sheet (Tab: TuVan)
      try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName('TuVan');
        if (sheet) {
          // Thời gian | Họ tên | Chức danh | SĐT | Email | Tên công ty | Địa chỉ | Lĩnh vực | Quy mô | Nội dung
          sheet.appendRow([
            timeString,
            data.hoTen,
            data.chucDanh,
            data.soDienThoai ? "'" + data.soDienThoai : "",
            data.email,
            data.tenNhaMay,
            data.diaChi,
            data.linhVuc,
            data.quyMo,
            data.noiDung
          ]);
        }
      } catch(err) {
        console.log('Lỗi ghi Sheet TuVan:', err);
      }
      
      // 2. Tạo PDF và gửi Email
      const htmlBody = `
        <h2>Khách Hàng Đăng Ký Tư Vấn (Khám Bệnh Nhà Máy)</h2>
        <p><strong>Thời gian:</strong> ${timeString}</p>
        <p><strong>Họ và tên:</strong> ${data.hoTen}</p>
        <p><strong>Chức danh:</strong> ${data.chucDanh}</p>
        <p><strong>Số điện thoại:</strong> ${data.soDienThoai}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Công ty/Nhà máy:</strong> ${data.tenNhaMay}</p>
        <p><strong>Địa chỉ:</strong> ${data.diaChi}</p>
        <p><strong>Lĩnh vực:</strong> ${data.linhVuc}</p>
        <p><strong>Quy mô:</strong> ${data.quyMo}</p>
        <p><strong>Nội dung vấn đề:</strong><br/>${(data.noiDung || '').replace(/\\n/g, '<br/>')}</p>
        <hr/>
        <p><em>Hệ thống gửi tự động từ Website INVAMAX</em></p>
      `;
      
      const htmlBlob = Utilities.newBlob(htmlBody, 'text/html', 'Dang_Ky_Tu_Van_' + data.hoTen + '.html');
      const pdfBlob = htmlBlob.getAs('application/pdf');
      pdfBlob.setName('Dang_Ky_Tu_Van_' + data.hoTen + '.pdf');
      
      MailApp.sendEmail({
        to: EMAIL_TO,
        subject: `[Đăng ký tư vấn] từ ${data.tenNhaMay} - ${data.hoTen}`,
        htmlBody: htmlBody,
        attachments: [pdfBlob]
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Đã gửi đăng ký tư vấn thành công'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Nếu formType không khớp
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Loại form không được hỗ trợ'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Xử lý OPTIONS preflight request (CORS)
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setHeaders(headers)
    .setMimeType(ContentService.MimeType.TEXT);
}
