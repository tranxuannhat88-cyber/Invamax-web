function calculateResults(answers) {
    const getGroupScore = (group) => {
        let totalWeightedScore = 0;
        let totalWeights = 0;
        
        group.forEach(q => {
            if (answers[q.id] !== undefined && q.trongSo !== undefined && q.trongSo > 0) {
                const ansStr = String(answers[q.id]);
                if (ansStr.trim() !== "") {
                    let score = 0;
                    if (q.loaiTraLoi === 'Thang điểm 0-4' || (q.dapAn && q.dapAn.length > 0 && !q.loaiTraLoi.includes('Nhiều lựa chọn'))) {
                        score = parseInt(ansStr);
                    } else {
                        score = parseInt(ansStr);
                    }
                    if (!isNaN(score)) {
                        totalWeightedScore += score * q.trongSo;
                        totalWeights += q.trongSo;
                    }
                }
            }
        });
        
        return totalWeights > 0 ? (totalWeightedScore / totalWeights) : 0;
    };

    let wScore = getGroupScore(AppQuestions.partB);
    let sScore = getGroupScore(AppQuestions.partC);
    let mScore = getGroupScore(AppQuestions.partD);
    
    // Scale 0-4 to 0-100 (where 4 = worst = 100)
    let warningScore = ((wScore * 0.4 + sScore * 0.4 + mScore * 0.2) / 4) * 100;
    warningScore = Math.round(warningScore);

    const wasteScores = [];
    const wasteModules = [...new Set(AppQuestions.partB.map(q => q.nhom))];
    wasteModules.forEach(module => {
        const questions = AppQuestions.partB.filter(q => q.nhom === module);
        wasteScores.push({
            module: module,
            score: isNaN(getGroupScore(questions)) ? 0 : Math.round((getGroupScore(questions) / 4) * 100)
        });
    });

    const fosScores = [];
    const fosModules = [...new Set(AppQuestions.partD.map(q => q.nhom))];
    fosModules.forEach(module => {
        const questions = AppQuestions.partD.filter(q => q.nhom === module);
        // Convert to 0-100 where 100 is excellent (original 0 is excellent)
        fosScores.push({
            module: module,
            score: isNaN(getGroupScore(questions)) ? 100 : 100 - Math.round((getGroupScore(questions) / 4) * 100)
        });
    });

    const symptomsScores = [];
    const symptomsModules = [...new Set(AppQuestions.partC.map(q => q.nhom))];
    symptomsModules.forEach(module => {
        const questions = AppQuestions.partC.filter(q => q.nhom === module);
        symptomsScores.push({
            module: module,
            score: isNaN(getGroupScore(questions)) ? 0 : Math.round((getGroupScore(questions) / 4) * 100)
        });
    });
    symptomsScores.sort((a,b) => b.score - a.score);
    const top3Symptoms = symptomsScores.slice(0, 3).map(item => item.module);

    let assessmentLevel = "";
    let generalAssessment = "";
    let diseases = [];
    let nextSteps = "";

    let healthScore = 100 - warningScore;

    if (healthScore >= 80) {
        assessmentLevel = "Khỏe mạnh";
        generalAssessment = "Hệ thống vận hành trơn tru, tiêu chuẩn được duy trì tốt. Doanh nghiệp có nền tảng vững chắc để mở rộng hoặc chuyển đổi số.";
        diseases = ["Không phát hiện bệnh nghiêm trọng"];
        nextSteps = "Tiếp tục cải tiến liên tục (Kaizen) và bắt đầu số hóa các quy trình cốt lõi.";
    } else if (healthScore >= 60) {
        assessmentLevel = "Cảnh báo nhẹ";
        generalAssessment = "Hệ thống cơ bản hoạt động nhưng đã xuất hiện các điểm nghẽn và lãng phí rải rác. Nếu không xử lý kịp thời có thể làm giảm biên lợi nhuận.";
        diseases = ["Lãng phí tiềm ẩn", "Quy trình chưa chuẩn hóa đồng bộ"];
        nextSteps = "Tập trung chuẩn hóa quy trình tại các điểm nghẽn, đào tạo lại nhân sự về tiêu chuẩn.";
    } else if (healthScore >= 40) {
        assessmentLevel = "Mắc bệnh (Cần điều trị)";
        generalAssessment = "Rối loạn hệ thống hiện diện rõ. Lãng phí xảy ra thường xuyên làm tăng chi phí và ảnh hưởng đến tiến độ, chất lượng giao hàng.";
        diseases = ["Tắc nghẽn cục bộ", "Lỗi và làm lại thường xuyên", "Chỉ số OEE thấp"];
        nextSteps = "Thực hiện dự án cải tiến điểm (Kaizen Blitz) tại khu vực yếu nhất, xây dựng lại hệ thống đo lường hiệu quả.";
    } else if (healthScore >= 20) {
        assessmentLevel = "Bệnh nặng (Nguy hiểm)";
        generalAssessment = "Hệ thống vận hành lỏng lẻo, chi phí sản xuất mất kiểm soát. Doanh nghiệp đang đối mặt với rủi ro lớn về dòng tiền và phàn nàn từ khách hàng.";
        diseases = ["Rối loạn luồng chảy", "Mất kiểm soát chất lượng diện rộng", "Tồn kho quá mức/Thiếu vật tư liên tục"];
        nextSteps = "Cần chuyên gia can thiệp ngay lập tức. Tái thiết lập luồng giá trị và áp dụng các biện pháp kiểm soát khẩn cấp.";
    } else {
        assessmentLevel = "Báo động đỏ (Nguy kịch)";
        generalAssessment = "Hệ thống đang trong tình trạng khủng hoảng. Rủi ro đứt gãy dây chuyền cực kỳ cao và gây thiệt hại nghiêm trọng.";
        diseases = ["Mất kiểm soát hoàn toàn chất lượng và tiến độ", "Đứt gãy toàn bộ chuỗi cung ứng nội bộ", "Thiếu hụt hoàn toàn khả năng quản trị hiện trường"];
        nextSteps = "Dừng ngay các hoạt động lãng phí, triệu tập ban lãnh đạo để tái cơ cấu toàn diện hệ thống quản lý.";
    }

    const sortDesc = (a, b) => b.score - a.score;
    wasteScores.sort(sortDesc);
    fosScores.sort((a, b) => a.score - b.score);

    const top3Wastes = wasteScores.slice(0, 3).map(item => item.module);
    const top3FOS = fosScores.slice(0, 3).map(item => item.module);

    
    let pWaste = Math.round((wScore / 4) * 100);
    let pSymptoms = Math.round((sScore / 4) * 100);
    let pFos = 100 - Math.round((mScore / 4) * 100);
    return { warningScore, assessmentLevel, generalAssessment, diseases, nextSteps, top3Wastes, top3FOS, wasteScores, fosScores, symptomsScores, top3Symptoms, pWaste, pSymptoms, pFos };
    
}