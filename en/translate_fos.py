import re
import sys

file_path = r"C:\Users\MAY TINH 2K\Desktop\invamax-website\en\article-fos-la-gi.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'Quay lại danh sách bài viết': 'Back to articles',
    'Đăng ngày': 'Published on',
    'Bởi <strong>Chuyên gia INVAMAX</strong>': 'By <strong>INVAMAX Expert</strong>',
    '<p>Thuật ngữ "Hệ điều hành nhà máy" (Factory Operating System - FOS) không còn quá xa lạ đối với các doanh nghiệp sản xuất tiên tiến. Tuy nhiên, nhiều nhà quản lý vẫn nhầm lẫn giữa FOS với các phần mềm quản trị như ERP hay MES.</p>': '<p>The term "Factory Operating System" (FOS) is no longer unfamiliar to advanced manufacturing enterprises. However, many managers still confuse FOS with management software such as ERP or MES.</p>',
    '<h2>Bản chất của FOS</h2>': '<h2>The Essence of FOS</h2>',
    '<p>FOS không phải là một phần mềm. FOS là một <strong>mô hình tổ chức và vận hành toàn diện</strong>, là cách thức mà con người, thiết bị, quy trình và dữ liệu tương tác với nhau mỗi ngày để tạo ra giá trị.</p>': '<p>FOS is not software. FOS is a <strong>comprehensive organizational and operating model</strong>, defining how people, equipment, processes, and data interact every day to create value.</p>',
    '<blockquote>"Một nhà máy có thể mua phần mềm đắt tiền nhất, nhưng nếu không có một hệ điều hành rõ ràng, phần mềm đó chỉ là một công cụ ghi chép dữ liệu rời rạc."</blockquote>': '<blockquote>"A factory can buy the most expensive software, but without a clear operating system, that software is just a disjointed data recording tool."</blockquote>',
    '<p>INVAMAX FOS được xây dựng dựa trên triết lý "Vận hành nhẹ". Một nhà máy vận hành nhẹ là nhà máy mà:</p>': '<p>INVAMAX FOS is built on the philosophy of "Lean Operations". A lean-operating factory is one where:</p>',
    '<li>Các vấn đề bất thường (abnormality) được nhận diện ngay lập tức mà không cần đợi báo cáo cuối tháng.</li>': '<li>Abnormalities are identified immediately without waiting for month-end reports.</li>',
    '<li>Người lao động biết rõ tiêu chuẩn công việc và tự chủ cải tiến.</li>': '<li>Workers clearly understand work standards and proactively make continuous improvements.</li>',
    '<li>Các dòng chảy (đơn hàng, vật tư, thông tin) lưu thông trơn tru mà không bị tắc nghẽn ở các bộ phận trung gian.</li>': '<li>Flows (orders, materials, information) circulate smoothly without bottlenecks at intermediate departments.</li>',
    '<h2>Xây "nền vững" là xây gì?</h2>': '<h2>What does building a "solid foundation" mean?</h2>',
    '<p>Nền tảng của INVAMAX FOS bắt đầu từ những cấu phần cơ bản nhất: Kiến trúc hệ thống, Quản trị hằng ngày, và Chuẩn hóa công việc. Thay vì vội vã đưa AI hay robot vào tự động hóa những quy trình còn đang rối rắm, FOS giúp làm sạch quy trình, thiết lập nhịp điệu vận hành chuẩn mực trước khi số hóa.</p>': '<p>The foundation of INVAMAX FOS starts with the most fundamental components: System Architecture, Daily Management, and Standardized Work. Instead of rushing to implement AI or robots to automate messy processes, FOS helps clean up operations and establish a standard operating rhythm prior to digitalization.</p>',
    '<p>Khi nền đã vững, doanh nghiệp hoàn toàn có thể mở rộng, tích hợp thêm các công nghệ mới mà không sợ hệ thống bị sập hay quá tải. Đó chính là chìa khóa để đạt được sự trường tồn trong sản xuất.</p>': '<p>Once the foundation is solid, the enterprise can confidently expand and integrate new technologies without fear of system crashes or overload. That is the key to achieving longevity in manufacturing.</p>'
}

for vi, en in replacements.items():
    if vi in content:
        content = content.replace(vi, en)
    else:
        print(f"Warning: Could not find '{vi}'")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Translation completed successfully.")
