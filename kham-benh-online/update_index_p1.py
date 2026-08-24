import io
import re

def update_html():
    with io.open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update H3 title
    html = html.replace('<h3>ĐIỂM SỨC KHỎE TỔNG QUAN</h3>', '<h3>ĐIỂM BỆNH LÝ NHÀ MÁY</h3>')

    # 2. Update Gauge container for the 3 metrics to Cards
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
    
    with io.open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated index.html")

update_html()
