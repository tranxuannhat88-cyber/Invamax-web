import io

index_html_path = r"index.html"

with io.open(index_html_path, 'r', encoding='utf-8') as f:
    html = f.read()

target_html = """                                <div class="a4-grid-2">
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
                                </div>"""
                                
replacement_html = """                                <div class="a4-box" style="margin-bottom: 10px; text-align: center;">
                                    <h3>BẢN ĐỒ 8 DẤU HIỆU BẤT THƯỜNG</h3>
                                    <div style="height: 260px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 10px;">
                                        <canvas id="radarSymptomsChart"></canvas>
                                    </div>
                                </div>
                                <div class="a4-box" style="margin-bottom: 10px;">
                                    <h3 style="text-align: center; margin-bottom: 10px;">ĐIỂM TỔNG HỢP 8 DẤU HIỆU BẤT THƯỜNG</h3>
                                    <div id="a4-symptoms-scores" style="display: flex; gap: 8px; justify-content: space-between;">
                                        <!-- JS will populate -->
                                    </div>
                                </div>
                                <div class="a4-box">
                                    <h3 style="text-align: center; margin-bottom: 10px;">PHÂN TÍCH DẤU HIỆU BẤT THƯỜNG (TOP 3)</h3>
                                    <div id="a4-symptoms-analysis" style="display: flex; gap: 15px;">
                                        <!-- JS will populate -->
                                    </div>
                                </div>"""

if target_html in html:
    html = html.replace(target_html, replacement_html)
    with io.open(index_html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated index.html Page 3 successfully")
else:
    print("Could not find the exact block in index.html.")
