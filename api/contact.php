<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
    $company = isset($_POST['company']) ? strip_tags(trim($_POST['company'])) : '';
    $phone = isset($_POST['phone']) ? strip_tags(trim($_POST['phone'])) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    
    if (empty($name) || empty($company) || empty($phone)) {
        http_response_code(400);
        echo json_encode(["message" => "Vui lòng điền đầy đủ thông tin bắt buộc."]);
        exit;
    }

    // 1. Lưu thông tin vào file CSV (hoặc Database)
    $csv_file = 'contacts_log.csv';
    $file_exists = file_exists($csv_file);
    $file = fopen($csv_file, 'a');
    
    // Thêm header nếu file mới
    if (!$file_exists) {
        fputcsv($file, array('Thời gian', 'Họ tên', 'Công ty', 'Số điện thoại', 'Email'));
    }
    
    date_default_timezone_set('Asia/Ho_Chi_Minh');
    fputcsv($file, array(date('Y-m-d H:i:s'), $name, $company, $phone, $email));
    fclose($file);

    // 2. Gửi email thông báo cho INVAMAX
    $to = "info@invamax.com";
    $subject = "Khách hàng liên hệ mới từ Website INVAMAX";
    $message = "Bạn có một yêu cầu liên hệ mới từ Website:\n\n";
    $message .= "Họ và tên: $name\n";
    $message .= "Công ty: $company\n";
    $message .= "Số điện thoại: $phone\n";
    $message .= "Email: $email\n\n";
    $message .= "Thời gian gửi: " . date('Y-m-d H:i:s') . "\n";
    
    $headers = "From: no-reply@invamax.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($to, $subject, $message, $headers);

    // 3. Gửi email xác nhận cho Khách hàng
    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $customer_subject = "Xác nhận yêu cầu liên hệ - INVAMAX";
        $customer_message = "Kính gửi $name,\n\n";
        $customer_message .= "Cảm ơn bạn đã quan tâm và liên hệ với INVAMAX. Chúng tôi đã nhận được yêu cầu của bạn với các thông tin sau:\n\n";
        $customer_message .= "- Công ty: $company\n";
        $customer_message .= "- Số điện thoại: $phone\n";
        $customer_message .= "- Email: $email\n\n";
        $customer_message .= "Chuyên gia của chúng tôi sẽ xem xét thông tin và liên hệ lại với bạn trong thời gian sớm nhất.\n\n";
        $customer_message .= "Trân trọng,\nĐội ngũ INVAMAX\n";
        $customer_message .= "Website: https://invamax.com\n";
        $customer_message .= "Email: info@invamax.com\n";
        
        $customer_headers = "From: info@invamax.com\r\n";
        $customer_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        mail($email, $customer_subject, $customer_message, $customer_headers);
    }

    http_response_code(200);
    echo json_encode(["message" => "Gửi yêu cầu thành công!"]);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
?>
