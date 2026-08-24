import io
import re

def update_file(filepath):
    with io.open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # We need to find the start of the 'ĐIỂM SỨC KHỎE TỔNG QUAN' box.
    # It is right after the info box.
    start_marker = '<h3 style="text-align: center;">ĐIỂM SỨC KHỎE TỔNG QUAN</h3>'
    # The end of the section is just before the footer
    end_marker = '<div class="a4-footer" style="text-align: right;">Trang 1 / 5</div>'

    if start_marker not in html or end_marker not in html:
        print("Markers not found in", filepath)
        return

    # Find the start index (we need to include the <div class="a4-box" style="margin-top: 20px;"> before the start_marker)
    # Let's use regex to find the div that contains the start_marker
    pattern = r'<div class="a4-box" style="margin-top: 20px;">\s*<h3 style="text-align: center;">ĐIỂM SỨC KHỎE TỔNG QUAN</h3>.*?</div>\s*</div>\s*<div class="a4-footer" style="text-align: right;">Trang 1 / 5</div>'
    
    # We need a more precise regex or manual string manipulation because the gauges are also there.
    # Let's find the exact string to replace.
    
    # Actually, we can just find the <div class="a4-box" style="margin-top: 20px;"> right before ĐIỂM SỨC KHỎE
    idx_h3 = html.find(start_marker)
    idx_start = html.rfind('<div class="a4-box" style="margin-top: 20px;">', 0, idx_h3)
    idx_end = html.find(end_marker, idx_start)

    if idx_start == -1 or idx_end == -1:
        print("Could not isolate block in", filepath)
        return

    new_html = """<div class="a4-box" style="margin-top: 20px;">
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
                                
                                <div style="display: flex; gap: 15px; margin-top: 20px;">
                                    <div class="a4-box" style="flex: 1; padding: 15px; margin-bottom: 0;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; padding-bottom: 0; border-bottom: none;">TỔNG THỂ LÃNG PHÍ</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeWaste"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-waste">0/100</div>
                                        </div>
                                    </div>
                                    <div class="a4-box" style="flex: 1; padding: 15px; margin-bottom: 0;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; padding-bottom: 0; border-bottom: none;">DẤU HIỆU BẤT THƯỜNG</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeSymptoms"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-symptoms">0/100</div>
                                        </div>
                                    </div>
                                    <div class="a4-box" style="flex: 1; padding: 15px; margin-bottom: 0;">
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
                            """

    html = html[:idx_start] + new_html + html[idx_end:]

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

    print("Updated", filepath)

update_file('admin.html')
update_file('index.html')
