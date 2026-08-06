// Dữ liệu câu hỏi giả lập cho hệ thống Khám bệnh nhà máy
// Mỗi câu hỏi có 5 lựa chọn tương ứng với số điểm 0, 1, 2, 3, 4
// 0: Rất tốt (Không có bệnh) -> 4: Rất tệ (Bệnh nặng)

const optionsTemplate = [
    "Hoàn toàn không có / Được kiểm soát rất tốt",
    "Thỉnh thoảng xảy ra / Có kiểm soát cơ bản",
    "Thường xuyên xảy ra / Khó kiểm soát",
    "Xảy ra liên tục, ảnh hưởng nghiêm trọng",
    "Không hề đo lường, hoàn toàn mất kiểm soát"
];

const fosOptionsTemplate = [
    "Đã áp dụng triệt để, có hệ thống chuẩn xác",
    "Có áp dụng nhưng chưa đồng bộ",
    "Mới bắt đầu triển khai, còn nhiều bất cập",
    "Chưa triển khai nhưng đang có kế hoạch",
    "Hoàn toàn không có khái niệm hoặc bỏ mặc"
];

export const questionsData = {
    // Phần 1: Soi triệu chứng bằng 8W
    waste8: [
        { id: "w1", module: "Lỗi / làm lại", text: "Mức độ sản phẩm bị lỗi, hỏng và phải làm lại trên dây chuyền của bạn?", options: optionsTemplate },
        { id: "w2", module: "Sản xuất thừa", text: "Tình trạng sản xuất vượt quá nhu cầu thực tế của khách hàng hoặc đơn hàng?", options: optionsTemplate },
        { id: "w3", module: "Chờ đợi", text: "Thời gian công nhân hoặc máy móc phải đứng chờ nguyên vật liệu, thông tin?", options: optionsTemplate },
        { id: "w4", module: "Không tận dụng năng lực con người", text: "Mức độ lãng phí chất xám, kỹ năng và ý tưởng đóng góp của nhân viên?", options: optionsTemplate },
        { id: "w5", module: "Vận chuyển thừa", text: "Tình trạng di chuyển nguyên vật liệu, bán thành phẩm qua lại quá nhiều lần?", options: optionsTemplate },
        { id: "w6", module: "Tồn kho", text: "Lượng nguyên vật liệu, bán thành phẩm và thành phẩm tồn đọng trong xưởng?", options: optionsTemplate },
        { id: "w7", module: "Thao tác / di chuyển thừa", text: "Công nhân phải đi lại, tìm kiếm dụng cụ, cúi gập người không cần thiết?", options: optionsTemplate },
        { id: "w8", module: "Gia công thừa", text: "Thực hiện các công đoạn gia công, kiểm tra vượt quá yêu cầu chất lượng của khách hàng?", options: optionsTemplate }
    ],

    // Phần 2: INVAMAX FOS Nhóm 1
    fosGroup1: [
        { id: "f1", module: "Core", text: "Sự rõ ràng của mục tiêu cốt lõi (Core) và chiến lược dài hạn được truyền đạt xuống xưởng?", options: fosOptionsTemplate },
        { id: "f2", module: "People", text: "Hệ thống đánh giá, đào tạo và giữ chân nhân sự (People) tại nhà máy?", options: fosOptionsTemplate },
        { id: "f3", module: "Flow", text: "Mức độ trơn tru của dòng chảy sản xuất (Flow) và thông tin xuyên suốt xưởng?", options: fosOptionsTemplate },
        { id: "f4", module: "Standard", text: "Việc áp dụng và tuân thủ các quy trình thao tác chuẩn (Standard Work) của công nhân?", options: fosOptionsTemplate }
    ],

    // Phần 3: INVAMAX FOS Nhóm 2
    fosGroup2: [
        { id: "f5", module: "Capacity", text: "Khả năng đo lường, phân bổ và tối ưu hóa năng lực thiết bị, máy móc (Capacity)?", options: fosOptionsTemplate },
        { id: "f6", module: "Daily Management", text: "Hiệu quả của các cuộc họp giao ban hàng ngày (Daily Management) tại xưởng?", options: fosOptionsTemplate },
        { id: "f7", module: "Quality", text: "Hệ thống quản lý chất lượng (Quality) từ đầu vào, trên chuyền đến đầu ra?", options: fosOptionsTemplate },
        { id: "f8", module: "Knowledge", text: "Quá trình lưu trữ, quản trị và kế thừa tri thức (Knowledge), bài học kinh nghiệm?", options: fosOptionsTemplate }
    ],

    // Phần 4: INVAMAX FOS Nhóm 3
    fosGroup3: [
        { id: "f9", module: "Digital", text: "Mức độ ứng dụng số hóa (Digital), phần mềm trong quản lý hiện trường?", options: fosOptionsTemplate },
        { id: "f10", module: "Kaizen", text: "Phong trào cải tiến liên tục (Kaizen) và sự chủ động của cấp quản lý / công nhân?", options: fosOptionsTemplate },
        { id: "f11", module: "Sustain", text: "Khả năng duy trì (Sustain) các thành quả cải tiến sau khi dự án kết thúc?", options: fosOptionsTemplate }
    ]
};

