import io

def fix_page2_layout(filepath):
    try:
        with io.open(filepath, 'r', encoding='utf-8') as f:
            html = f.read()

        # Reduce radar chart height on page 2
        html = html.replace('<div style="height: 320px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 15px;">\n                                        <canvas id="radarChart"></canvas>',
                            '<div style="height: 260px; width: 100%; display: flex; justify-content: center; align-items: center; margin-top: 10px;">\n                                        <canvas id="radarChart"></canvas>')
        
        # Reduce margins between boxes on page 2
        html = html.replace('<div class="a4-box" style="margin-bottom: 20px; text-align: center;">\n                                    <h3>BẢN ĐỒ 8 LÃNG PHÍ</h3>',
                            '<div class="a4-box" style="margin-bottom: 10px; text-align: center;">\n                                    <h3>BẢN ĐỒ 8 LÃNG PHÍ</h3>')
        
        html = html.replace('<div class="a4-box" style="margin-bottom: 20px;">\n                                    <h3 style="text-align: center; margin-bottom: 15px;">ĐIỂM TỔNG HỢP 8 LÃNG PHÍ</h3>',
                            '<div class="a4-box" style="margin-bottom: 10px;">\n                                    <h3 style="text-align: center; margin-bottom: 10px;">ĐIỂM TỔNG HỢP 8 LÃNG PHÍ</h3>')

        html = html.replace('<h3 style="text-align: center; margin-bottom: 15px;">PHÂN TÍCH LÃNG PHÍ (TOP 3)</h3>',
                            '<h3 style="text-align: center; margin-bottom: 10px;">PHÂN TÍCH LÃNG PHÍ (TOP 3)</h3>')

        with io.open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Updated " + filepath)
    except Exception as e:
        print("Error processing " + filepath + ": " + str(e))

fix_page2_layout('admin.html')
fix_page2_layout('index.html')
