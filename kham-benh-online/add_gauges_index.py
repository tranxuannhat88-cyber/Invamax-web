import io

with io.open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_issues_html = """<div class="a4-box" style="margin-top: 20px;">
                                    <h3>BA VẤN ĐỀ NỔI BẬT</h3>
                                    <div class="a4-flex-3" id="a4-top-3-issues">
                                        <!-- JS will populate -->
                                    </div>
                                </div>"""

new_gauges_html = """<div class="grid-3" style="margin-top: 20px;">
                                    <div class="a4-box" style="padding: 15px;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; border-bottom: none;">TỔNG THỂ LÃNG PHÍ</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeWaste"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-waste">0/100</div>
                                        </div>
                                    </div>
                                    <div class="a4-box" style="padding: 15px;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; border-bottom: none;">DẤU HIỆU BẤT THƯỜNG</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeSymptoms"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-symptoms">0/100</div>
                                        </div>
                                    </div>
                                    <div class="a4-box" style="padding: 15px;">
                                        <h3 style="text-align: center; font-size: 11px; margin-bottom: 10px; border-bottom: none;">SỨC KHỎE HỆ THỐNG</h3>
                                        <div style="height: 100px; width: 100%; position: relative;">
                                            <canvas id="gaugeFos"></canvas>
                                            <div style="position: absolute; bottom: -5px; left: 0; right: 0; text-align: center; font-size: 20px; font-weight: bold; color: #1e293b;" id="score-fos">0/100</div>
                                        </div>
                                    </div>
                                </div>"""

html = html.replace(old_issues_html, new_gauges_html)

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html")
