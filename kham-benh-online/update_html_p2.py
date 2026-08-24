import io
import re

def update_html_page2(filepath):
    with io.open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    old_page2_block = r'<div class="a4-section-title">2\. BẢN ĐỒ 8 LÃNG PHÍ & PHÂN TÍCH LÃNG PHÍ <span style="float:right">Trang 2 / 6</span></div>.*?<div class="a4-footer"'
    
    new_page2_block = """<div class="a4-section-title">2. BẢN ĐỒ 8 LÃNG PHÍ & PHÂN TÍCH LÃNG PHÍ <span style="float:right">Trang 2 / 6</span></div>
                                
                                <div class="a4-box" style="margin-bottom: 20px; text-align: center;">
                                    <h3>BẢN ĐỒ 8 LÃNG PHÍ</h3>
                                    <div style="height: 320px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 15px;">
                                        <canvas id="radarChart"></canvas>
                                    </div>
                                </div>
                                
                                <div class="a4-box" style="margin-bottom: 20px;">
                                    <h3 style="text-align: center; margin-bottom: 15px;">ĐIỂM TỔNG HỢP 8 LÃNG PHÍ</h3>
                                    <div id="a4-waste-scores" style="display: flex; gap: 8px; justify-content: space-between;">
                                        <!-- JS will populate 8 cards -->
                                    </div>
                                </div>

                                <div class="a4-box">
                                    <h3 style="text-align: center; margin-bottom: 15px;">PHÂN TÍCH LÃNG PHÍ (TOP 3)</h3>
                                    <div id="a4-waste-analysis" style="display: flex; gap: 15px;">
                                        <!-- JS will populate 3 cards -->
                                    </div>
                                </div>
                            </div>
                            <div class="a4-footer\""""
    
    html = re.sub(old_page2_block, new_page2_block, html, flags=re.DOTALL)
    
    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated", filepath)

update_html_page2('index.html')
update_html_page2('admin.html')
