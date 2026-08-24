import io
import re

def update_html(filepath):
    with io.open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # We need to replace everything inside <div id="preliminary-report"> ... </div>
    # But wait, <div id="preliminary-report"> contains all the pages.
    # The end of this section is right before `<div style="display: flex; gap: 20px; margin: 30px auto 0; width: 100%; max-width: 210mm;" class="hide-in-pdf" id="a4-pdf-controls">`
    
    start_marker = '<div id="preliminary-report">'
    end_marker = '<div style="display: flex; gap: 20px; margin: 30px auto 0;'

    idx_start = html.find(start_marker)
    if idx_start == -1:
        print("Start marker not found in", filepath)
        return
        
    idx_start += len(start_marker)
    
    idx_end = html.find(end_marker, idx_start)
    if idx_end == -1:
        print("End marker not found in", filepath)
        return
        
    # We replace everything between idx_start and idx_end with our new pages
    header_html = """
                                <div>
                                    <div class="a4-logo" style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 1px;">INVA<span style="color:#f97316;">MAX</span></div>
                                    <div style="font-size: 10px; font-weight: bold; color: #f97316; margin-top: 2px;">NỀN FOS | AI / Digital | Supply Hub</div>
                                </div>
                                <div class="a4-title-center">BÁO CÁO KHÁM BỆNH NHÀ MÁY ONLINE<br>THEO HỆ ĐIỀU HÀNH NỀN FOS</div>
                                <div style="width: 160px;"></div>
"""

    new_content = f"""
<!-- Trang 1 -->
                        <div class="a4-page">
                            <div class="a4-header">{header_html}</div>
                            <div class="a4-content">
                                <div class="a4-section-title">1. THÔNG TIN NHÀ MÁY & TỔNG QUAN SỨC KHỎE VẬN HÀNH <span style="float:right">Trang 1 / 6</span></div>
                                <div class="a4-box" style="margin-bottom: 20px;">
                                    <h3>THÔNG TIN NHÀ MÁY</h3>
                                    <div class="a4-grid-2" style="gap: 10px 30px;">
                                        <div>
                                            <table class="a4-table-info">
                                                <tr><td>Tên công ty</td><td id="a4-company" style="font-weight: 600; color: #1e293b;">...</td></tr>
                                                <tr><td>Sản phẩm</td><td id="a4-product" style="font-weight: 600; color: #1e293b;">...</td></tr>
                                                <tr><td>Mã báo cáo</td><td id="a4-code-1" style="font-weight: 600; color: #1e293b;">FOS-25052026-001</td></tr>
                                            </table>
                                        </div>
                                        <div>
                                            <table class="a4-table-info">
                                                <tr><td>Người trả lời</td><td id="a4-name" style="font-weight: 600; color: #1e293b;">...</td></tr>
                                                <tr><td>Chức vụ</td><td id="a4-job" style="font-weight: 600; color: #1e293b;">...</td></tr>
                                                <tr><td>Số điện thoại</td><td id="a4-phone" style="font-weight: 600; color: #1e293b;">...</td></tr>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="a4-box" style="margin-top: 20px;">
                                    <h3 style="text-align: center;">ĐIỂM SỨC KHỎE TỔNG QUAN</h3>
                                    <div style="display: flex; align-items: center; justify-content: center; gap: 40px;">
                                        <div style="width: 280px; position: relative;">
                                            <div style="height: 140px; width: 100%;">
                                                <canvas id="gaugeChart"></canvas>
                                            </div>
                                            <div style="text-align: center; margin-top: -15px;">
                                                <div style="font-size: 32px; font-weight: bold; color: #1e293b;" id="a4-score-text">0 / 100</div>
                                                <div style="font-size: 14px; font-weight: bold; margin-top: 5px; color: #1e293b;" id="a4-level-text">MỨC ĐỘ: ...</div>
                                            </div>
                                        </div>
                                        <div style="text-align: left; font-size: 13px; color: #475569;">
                                            <div style="margin-bottom: 12px;"><span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#10b981; margin-right:10px; vertical-align:middle;"></span> <strong>Khỏe mạnh</strong></div>
                                            <div style="margin-bottom: 12px;"><span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#eab308; margin-right:10px; vertical-align:middle;"></span> <strong>Cảnh báo</strong></div>
                                            <div style="margin-bottom: 12px;"><span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#f97316; margin-right:10px; vertical-align:middle;"></span> <strong>Mắc bệnh</strong></div>
                                            <div style="margin-bottom: 12px;"><span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#ef4444; margin-right:10px; vertical-align:middle;"></span> <strong>Bệnh nặng</strong></div>
                                            <div><span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:#334155; margin-right:10px; vertical-align:middle;"></span> <strong>Nguy kịch</strong></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                                    <div class="a4-box" style="width: 31%; padding: 15px; margin-bottom: 0; box-sizing: border-box;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; padding-bottom: 0; border-bottom: none;">TỔNG THỂ LÃNG PHÍ</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeWaste"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-waste">0/100</div>
                                        </div>
                                    </div>
                                    <div class="a4-box" style="width: 31%; padding: 15px; margin-bottom: 0; box-sizing: border-box;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; padding-bottom: 0; border-bottom: none;">DẤU HIỆU BẤT THƯỜNG</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeSymptoms"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-symptoms">0/100</div>
                                        </div>
                                    </div>
                                    <div class="a4-box" style="width: 31%; padding: 15px; margin-bottom: 0; box-sizing: border-box;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; padding-bottom: 0; border-bottom: none;">SỨC KHỎE HỆ THỐNG</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeFos"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-fos">0/100</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="a4-box" style="text-align: center; margin-top: 20px; padding: 15px;">
                                    <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 14px; font-weight: 800; text-transform: uppercase;">KẾT LUẬN TÌNH TRẠNG (AI)</h4>
                                    <p id="a4-general-desc" style="font-size: 13px; color: #0f172a; line-height: 1.6; margin: 0;"></p>
                                </div>
                            </div>
                            <div class="a4-footer" style="text-align: right;">Trang 1 / 6</div>
                        </div>

<!-- Trang 2 -->
                        <div class="a4-page">
                            <div class="a4-header">{header_html}</div>
                            <div class="a4-content">
                                <div class="a4-section-title">2. BẢN ĐỒ 8 LÃNG PHÍ & PHÂN TÍCH LÃNG PHÍ <span style="float:right">Trang 2 / 6</span></div>
                                <div class="a4-grid-2">
                                    <div class="a4-box" style="text-align: center;">
                                        <h3>BẢN ĐỒ 8 LÃNG PHÍ</h3>
                                        <div style="height: 320px; width: 100%; margin: 20px 0; display: flex; justify-content: center; align-items: center;">
                                            <canvas id="radarChart"></canvas>
                                        </div>
                                        <h3 style="margin-top: 20px;">ĐIỂM TỔNG HỢP 8 LÃNG PHÍ</h3>
                                        <div class="a4-flex-8" id="a4-waste-scores" style="margin-top: 15px;">
                                            <!-- JS will populate -->
                                        </div>
                                    </div>
                                    <div class="a4-box">
                                        <h3>PHÂN TÍCH LÃNG PHÍ (TOP 3)</h3>
                                        <div id="a4-waste-analysis" style="margin-top: 15px;">
                                            <!-- JS will populate -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="a4-footer" style="text-align: right;">Trang 2 / 6</div>
                        </div>
                        
<!-- Trang 3 -->
                        <div class="a4-page">
                            <div class="a4-header">{header_html}</div>
                            <div class="a4-content">
                                <div class="a4-section-title">3. BẢN ĐỒ DẤU HIỆU BẤT THƯỜNG & PHÂN TÍCH <span style="float:right">Trang 3 / 6</span></div>
                                <div class="a4-grid-2">
                                    <div class="a4-box" style="text-align: center;">
                                        <h3>BẢN ĐỒ 8 DẤU HIỆU BẤT THƯỜNG</h3>
                                        <div style="height: 320px; width: 100%; margin: 20px 0; display: flex; justify-content: center; align-items: center;">
                                            <canvas id="radarSymptomsChart"></canvas>
                                        </div>
                                        <h3 style="margin-top: 20px;">ĐIỂM SỐ 8 DẤU HIỆU BẤT THƯỜNG</h3>
                                        <div class="a4-flex-8" id="a4-symptoms-scores" style="margin-top: 15px;">
                                            <!-- JS will populate -->
                                        </div>
                                    </div>
                                    <div class="a4-box">
                                        <h3>TOP 3 DẤU HIỆU BẤT THƯỜNG NỔI BẬT</h3>
                                        <div id="a4-symptoms-analysis" style="margin-top: 15px;">
                                            <!-- JS will populate -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="a4-footer" style="text-align: right;">Trang 3 / 6</div>
                        </div>

<!-- Trang 4 -->
                        <div class="a4-page">
                            <div class="a4-header">{header_html}</div>
                            <div class="a4-content">
                                <div class="a4-section-title">4. HEATMAP 11 MODULE NỀN FOS <span style="float:right">Trang 4 / 6</span></div>
                                <div style="font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 20px; color: #475569; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    THANG ĐIỂM: 0 - Rất tệ | 25 - Kém | 50 - Trung bình | 75 - Tốt | 100 - Xuất sắc
                                </div>
                                
                                <div style="background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                                    <div style="font-weight: bold; color: #059669; font-size: 12px; margin-bottom: 15px;"><i class="fas fa-layer-group"></i> A. NỀN MÓNG QUẢN TRỊ</div>
                                    <div style="display: flex; gap: 15px;" id="a4-heatmap-group-a">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                                
                                <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                                    <div style="font-weight: bold; color: #ea580c; font-size: 12px; margin-bottom: 15px;"><i class="fas fa-cogs"></i> B. VẬN HÀNH SẢN XUẤT</div>
                                    <div style="display: flex; gap: 15px;" id="a4-heatmap-group-b">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                                
                                <div style="background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                                    <div style="font-weight: bold; color: #0284c7; font-size: 12px; margin-bottom: 15px;"><i class="fas fa-brain"></i> C. TRI THỨC & SỐ HÓA</div>
                                    <div style="display: flex; gap: 15px; width: 66%;" id="a4-heatmap-group-c">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                                
                                <div style="background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                                    <div style="font-weight: bold; color: #7e22ce; font-size: 12px; margin-bottom: 15px;"><i class="fas fa-sync-alt"></i> D. CẢI TIẾN & DUY TRÌ</div>
                                    <div style="display: flex; gap: 15px; width: 66%;" id="a4-heatmap-group-d">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                                
                                <div class="a4-box" style="margin-top: 15px;">
                                    <h3 style="font-size: 13px; text-transform: uppercase;">ĐÁNH GIÁ TỔNG QUAN</h3>
                                    <div id="a4-top3-fos" style="margin-top: 10px; font-size: 13px; color: #1e293b;">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                            </div>
                            <div class="a4-footer" style="text-align: right;">Trang 4 / 6</div>
                        </div>

<!-- Trang 5 -->
                        <div class="a4-page">
                            <div class="a4-header">{header_html}</div>
                            <div class="a4-content">
                                <div class="a4-section-title">5. CHUỖI NGUYÊN NHÂN & QUICK WINS <span style="float:right">Trang 5 / 6</span></div>
                                <div class="a4-box" style="margin-bottom: 20px;">
                                    <h3 style="margin-bottom: 15px;">TOP 5 CHUỖI NGUYÊN NHÂN - TÁC ĐỘNG</h3>
                                    <div id="a4-cause-chains" style="display: flex; flex-direction: column; gap: 10px;">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                                <div class="a4-box">
                                    <h3 style="margin-bottom: 15px;">KHUYẾN NGHỊ HÀNH ĐỘNG SƠ BỘ (3 QUICK WINS)</h3>
                                    <ul id="a4-quick-wins" style="font-size: 13px; color: #475569; padding-left: 20px; line-height: 1.8; margin-bottom: 0;">
                                        <!-- JS will populate -->
                                    </ul>
                                </div>
                            </div>
                            <div class="a4-footer" style="text-align: right;">Trang 5 / 6</div>
                        </div>

<!-- Trang 6 (Trang 5.1 Preview) -->
                        <div class="a4-page page-5-1">
                            <div class="a4-header">{header_html}</div>
                            <div class="a4-content">
                                <div class="a4-section-title">6. BÁO CÁO CHI TIẾT <span style="float:right">Trang 6 / 6</span></div>
                                <div class="a4-box" style="padding: 0; overflow: hidden; border: 1px solid #f97316; margin-bottom: 20px;">
                                    <div style="background: #fff7ed; padding: 12px; text-align: center; color: #ea580c; font-weight: bold; font-size: 14px; border-bottom: 1px solid #ffedd5;">NỘI DUNG CHI TIẾT – MỞ KHÓA SAU KHI THANH TOÁN</div>
                                    
                                    <div style="display: flex; border-bottom: 1px solid #f1f5f9;">
                                        <div style="background: #f97316; color: white; width: 60px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">06</div>
                                        <div style="padding: 12px 15px; flex-grow: 1;">
                                            <div style="font-weight: bold; color: #1e293b; font-size: 14px;">PHÂN TÍCH NGUYÊN NHÂN</div>
                                            <div style="font-size: 12px; color: #475569; margin-top: 4px;">Phân tích nguyên nhân trực tiếp – hệ thống – gốc cho 3 vấn đề ưu tiên kết nối với 11 module NỀN FOS.</div>
                                        </div>
                                        <div style="width: 140px; padding: 10px; border-left: 1px solid #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ea580c; font-size: 11px; text-align: center; font-weight: bold;">
                                            <i class="fas fa-lock" style="margin-bottom:4px;"></i> Mở khóa sau khi thanh toán
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; border-bottom: 1px solid #f1f5f9;">
                                        <div style="background: #f97316; color: white; width: 60px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">07</div>
                                        <div style="padding: 12px 15px; flex-grow: 1;">
                                            <div style="font-weight: bold; color: #1e293b; font-size: 14px;">MA TRẬN ƯU TIÊN VẤN ĐỀ</div>
                                            <div style="font-size: 12px; color: #475569; margin-top: 4px;">Đánh giá và xếp hạng vấn đề theo mức độ tác động, tần suất, khả năng kiểm soát và mức độ nghiêm trọng.</div>
                                        </div>
                                        <div style="width: 140px; padding: 10px; border-left: 1px solid #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ea580c; font-size: 11px; text-align: center; font-weight: bold;">
                                            <i class="fas fa-lock" style="margin-bottom:4px;"></i> Mở khóa sau khi thanh toán
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; border-bottom: 1px solid #f1f5f9;">
                                        <div style="background: #f97316; color: white; width: 60px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">08</div>
                                        <div style="padding: 12px 15px; flex-grow: 1;">
                                            <div style="font-weight: bold; color: #1e293b; font-size: 14px;">GIẢI PHÁP ĐỀ XUẤT</div>
                                            <div style="font-size: 12px; color: #475569; margin-top: 4px;">Chi tiết giải pháp cho 3 vấn đề ưu tiên: mục tiêu, cách làm, nguồn lực, chỉ số, rủi ro và tiêu chí nghiệm thu.</div>
                                        </div>
                                        <div style="width: 140px; padding: 10px; border-left: 1px solid #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ea580c; font-size: 11px; text-align: center; font-weight: bold;">
                                            <i class="fas fa-lock" style="margin-bottom:4px;"></i> Mở khóa sau khi thanh toán
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; border-bottom: 1px solid #f1f5f9;">
                                        <div style="background: #f97316; color: white; width: 60px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">09</div>
                                        <div style="padding: 12px 15px; flex-grow: 1;">
                                            <div style="font-weight: bold; color: #1e293b; font-size: 14px;">ROADMAP 30 – 60 – 90 NGÀY</div>
                                            <div style="font-size: 12px; color: #475569; margin-top: 4px;">Kế hoạch hành động theo 3 giai đoạn: Ổn định – Chuẩn hóa – Duy trì và số hóa phù hợp.</div>
                                        </div>
                                        <div style="width: 140px; padding: 10px; border-left: 1px solid #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ea580c; font-size: 11px; text-align: center; font-weight: bold;">
                                            <i class="fas fa-lock" style="margin-bottom:4px;"></i> Mở khóa sau khi thanh toán
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex;">
                                        <div style="background: #f97316; color: white; width: 60px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">10</div>
                                        <div style="padding: 12px 15px; flex-grow: 1;">
                                            <div style="font-weight: bold; color: #1e293b; font-size: 14px;">CƠ CHẾ TRIỂN KHAI & DUY TRÌ</div>
                                            <div style="font-size: 12px; color: #475569; margin-top: 4px;">Phân công trách nhiệm (RACI), KPI theo dõi, tần suất họp, cơ chế duy trì và kiểm soát hiệu quả bền vững.</div>
                                        </div>
                                        <div style="width: 140px; padding: 10px; border-left: 1px solid #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ea580c; font-size: 11px; text-align: center; font-weight: bold;">
                                            <i class="fas fa-lock" style="margin-bottom:4px;"></i> Mở khóa sau khi thanh toán
                                        </div>
                                    </div>
                                
                                    <div style="background: #fff7ed; padding: 12px; text-align: center; color: #ea580c; font-weight: bold; font-size: 13px; border-top: 1px solid #ffedd5;">
                                        <i class="fas fa-lock" style="vertical-align:middle;margin-right:5px;"></i> Vui lòng thanh toán để mở khóa toàn bộ nội dung phân tích chi tiết và nhận báo cáo đầy đủ 10 trang.
                                    </div>
                                </div>
                                
                                <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; display: flex; align-items: center; justify-content: space-between;">
                                    <div style="flex-grow: 1;">
                                        <h4 style="color: #10b981; margin-bottom: 15px; font-size: 14px;">LIÊN HỆ HỖ TRỢ TRỰC TIẾP</h4>
                                        <div style="display: flex; gap: 20px;">
                                            <p style="font-size: 13px; color: #475569; margin: 0;"><strong>Hotline:</strong> 0945 530 699</p>
                                            <p style="font-size: 13px; color: #475569; margin: 0;"><strong>Email:</strong> contact@invamax.com.vn</p>
                                            <p style="font-size: 13px; color: #475569; margin: 0;"><strong>Website:</strong> www.invamax.com.vn</p>
                                        </div>
                                    </div>
                                    <div style="background: white; padding: 8px; border-radius: 8px; text-align: center; width: 140px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                                        <img id="a4-qr-img-inline" src="" style="width: 100%; border-radius: 4px;" alt="QR Thanh toán">
                                        <div style="color: black; font-weight: bold; font-size: 13px; margin-top: 5px;">990,000 VNĐ</div>
                                        <div style="color: #444; font-size: 10px; margin-top: 2px;">KBM <span id="a4-qr-phone-inline" style="font-weight: bold; color: #e11d48;"></span></div>
                                    </div>
                                </div>
                            </div>
                            <div class="a4-footer" style="text-align: right;">Trang 6 / 6</div>
                        </div>\n"""
                        
    html = html[:idx_start] + new_content + html[idx_end:]

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated", filepath)

update_html('admin.html')
update_html('index.html')
