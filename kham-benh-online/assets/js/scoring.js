import { questionsData } from './questions.js';

/**
 * Tính toán kết quả dựa trên các câu trả lời của user
 * @param {Object} answers - Object map id câu hỏi -> số điểm (0-4)
 */
export function calculateResults(answers) {
    let totalScore = 0;
    let questionCount = 0;
    
    const wasteScores = [];
    const fosScores = [];

    // Tính điểm 8W
    questionsData.waste8.forEach(q => {
        const score = answers[q.id] !== undefined ? parseInt(answers[q.id]) : 0;
        totalScore += score;
        questionCount++;
        wasteScores.push({ module: q.module, score: score });
    });

    // Hàm tiện ích tính điểm các nhóm FOS
    const calculateFOSGroup = (group) => {
        group.forEach(q => {
            const score = answers[q.id] !== undefined ? parseInt(answers[q.id]) : 0;
            totalScore += score;
            questionCount++;
            fosScores.push({ module: q.module, score: score });
        });
    };

    calculateFOSGroup(questionsData.fosGroup1);
    calculateFOSGroup(questionsData.fosGroup2);
    calculateFOSGroup(questionsData.fosGroup3);

    // Tính điểm cảnh báo vận hành (thang 0-100)
    // Điểm trung bình max = 4. Lấy (TB / 4) * 100 = TB * 25
    const averageScore = questionCount > 0 ? (totalScore / questionCount) : 0;
    const warningScore = Math.round(averageScore * 25);

    // Phân loại đánh giá
    let assessmentLevel = "";
    let generalAssessment = "";
    let diseases = [];
    let nextSteps = "";

    if (warningScore <= 25) {
        assessmentLevel = "Vận hành tương đối ổn định";
        generalAssessment = "Nhà máy đang duy trì được các quy trình cơ bản khá tốt. Các lãng phí được kiểm soát ở mức cho phép.";
        diseases = ["Chưa phát hiện bệnh nghiêm trọng", "Một số điểm nghẽn cục bộ nhỏ", "Thiếu sự bứt phá tối ưu"];
        nextSteps = "Tiếp tục duy trì và bắt đầu áp dụng Kaizen nhỏ ở từng bộ phận để tối ưu thêm.";
    } else if (warningScore <= 50) {
        assessmentLevel = "Có dấu hiệu rối vận hành";
        generalAssessment = "Hệ thống bắt đầu bộc lộ các vấn đề ở giai đoạn đầu. Sự liên kết giữa các bộ phận chưa mượt mà.";
        diseases = ["Nút thắt cổ chai ở một số công đoạn", "Bắt đầu xuất hiện lãng phí thời gian chờ", "Quản lý dữ liệu chậm trễ"];
        nextSteps = "Cần rà soát lại quy trình chuẩn (Standard) và tối ưu hóa luồng chảy (Flow) cơ bản.";
    } else if (warningScore <= 75) {
        assessmentLevel = "Bệnh vận hành rõ ràng";
        generalAssessment = "Các triệu chứng lãng phí đang ăn mòn lợi nhuận. Sự thiếu hụt nền tảng quản trị khiến mọi thứ bị phụ thuộc vào con người.";
        diseases = ["Sản xuất ùn ứ, tồn kho mất kiểm soát", "Lỗi hỏng nhiều, chi phí làm lại cao", "Họp hành kém hiệu quả, không có KPI rõ ràng"];
        nextSteps = "Tiến hành khám bệnh chuyên sâu toàn diện 3 ngày, thiết lập lại hệ thống Core & Daily Management.";
    } else {
        assessmentLevel = "Cần cải tổ nền vận hành";
        generalAssessment = "Hệ thống đang trong tình trạng báo động đỏ. Mọi hoạt động đều mang tính đối phó, rủi ro đứt gãy dây chuyền rất cao.";
        diseases = ["Mất kiểm soát hoàn toàn chất lượng và tiến độ", "Chảy máu dòng tiền do lãng phí khổng lồ", "Mất niềm tin nội bộ, quy trình đứt gãy"];
        nextSteps = "Lập tức áp dụng hệ điều hành INVAMAX FOS Premium để đập đi xây lại nền tảng quản trị xưởng.";
    }

    // Tìm Top 3
    const sortDesc = (a, b) => b.score - a.score;
    wasteScores.sort(sortDesc);
    fosScores.sort((a, b) => a.score - b.score);

    const top3Wastes = wasteScores.slice(0, 3).map(item => item.module);
    const top3FOS = fosScores.slice(0, 3).map(item => item.module);

    return {
        warningScore,
        assessmentLevel,
        generalAssessment,
        diseases,
        nextSteps,
        top3Wastes,
        top3FOS,
        details: {
            wasteScores,
            fosScores
        }
    };
}

