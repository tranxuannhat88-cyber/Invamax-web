// ĐIỀN URL WEB APP CỦA GOOGLE APPS SCRIPT VÀO ĐÂY
const GAS_URL = "https://script.google.com/macros/s/AKfycbwYOUR_SCRIPT_ID_HERE/exec"; 

/**
 * Gửi dữ liệu form về Google Sheet thông qua Google Apps Script
 * @param {Object} payload - Dữ liệu đã được định dạng
 * @returns {Promise<boolean>} Trả về true nếu thành công
 */
export async function submitDataToGoogleSheet(payload) {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            // Sử dụng text/plain để tránh lỗi CORS Preflight khi gửi request từ trình duyệt lên GAS
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', 
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.status === "success") {
                return true;
            } else {
                console.error("Lỗi từ Google Apps Script:", result.message);
                return false;
            }
        } else {
            console.error("Network response was not ok.");
            return false;
        }
    } catch (error) {
        console.error("Lỗi khi gửi dữ liệu:", error);
        return false;
    }
}

