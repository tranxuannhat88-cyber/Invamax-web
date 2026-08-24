import io
import re

def update_file(filepath):
    with io.open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update Title
    html = html.replace('<h3 style="text-align: center;">ĐIỂM SỨC KHỎE TỔNG QUAN</h3>', '<h3 style="text-align: center;">ĐIỂM BỆNH LÝ NHÀ MÁY</h3>')
    # Just in case some have no style
    html = html.replace('<h3>ĐIỂM SỨC KHỎE TỔNG QUAN</h3>', '<h3>ĐIỂM BỆNH LÝ NHÀ MÁY</h3>')

    # 2. Add Score Scale to Legend
    html = html.replace('<strong>Khỏe mạnh</strong>', '<strong>Khỏe mạnh (0 - 19)</strong>')
    html = html.replace('<strong>Cảnh báo</strong>', '<strong>Cảnh báo (20 - 39)</strong>')
    html = html.replace('<strong>Mắc bệnh</strong>', '<strong>Mắc bệnh (40 - 59)</strong>')
    html = html.replace('<strong>Bệnh nặng</strong>', '<strong>Bệnh nặng (60 - 79)</strong>')
    html = html.replace('<strong>Nguy kịch</strong>', '<strong>Nguy kịch (80 - 100)</strong>')

    # 3. Replace 3 Gauge Cards in admin.html (if they still exist)
    old_metrics = """                                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
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
                                </div>"""

    new_metrics = """                                <div style="display: flex; justify-content: space-between; margin-top: 20px; gap: 15px;" id="a4-metric-cards">
                                    <!-- JS will render metric cards here -->
                                </div>"""
    
    html = html.replace(old_metrics, new_metrics)

    # 4. Remove (AI) from KẾT LUẬN TÌNH TRẠNG
    html = html.replace('KẾT LUẬN TÌNH TRẠNG (AI)', 'KẾT LUẬN TÌNH TRẠNG')

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated", filepath)

update_file('index.html')
update_file('admin.html')
