import io
import re

admin_html_path = r"admin.html"
index_html_path = r"index.html"

replacement_c_d_html = """                                <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                                    <div style="flex: 1; background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 12px;">
                                        <div style="font-weight: bold; color: #0284c7; font-size: 11px; margin-bottom: 10px;"><i class="fas fa-brain"></i> C. TRI THỨC & SỐ HÓA</div>
                                        <div style="display: flex; gap: 8px;" id="a4-heatmap-group-c"></div>
                                    </div>
                                    <div style="flex: 1; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px; padding: 12px;">
                                        <div style="font-weight: bold; color: #7e22ce; font-size: 11px; margin-bottom: 10px;"><i class="fas fa-sync-alt"></i> D. CẢI TIẾN & DUY TRÌ</div>
                                        <div style="display: flex; gap: 8px;" id="a4-heatmap-group-d"></div>
                                    </div>
                                </div>"""

for path in [admin_html_path, index_html_path]:
    try:
        with io.open(path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Find start of Group C
        start_idx = html.find('<div style="background: #f0f9ff;')
        if start_idx == -1:
            # Maybe the background was slightly different in index? Let's find by id and step back
            idx_c = html.find('id="a4-heatmap-group-c"')
            # Find the `<div style="background:` before it
            start_idx = html.rfind('<div style="background:', 0, idx_c)
        
        # Find end of Group D
        idx_d = html.find('id="a4-heatmap-group-d"')
        if idx_d != -1 and start_idx != -1:
            # Find the closing div of group D
            end_d_content = html.find('</div>', idx_d)
            # Find the closing div of the parent
            end_parent = html.find('</div>', end_d_content + 6) + 6
            
            # Replace
            html = html[:start_idx] + replacement_c_d_html + html[end_parent:]
            
            with io.open(path, 'w', encoding='utf-8') as f:
                f.write(html)
            print("Successfully updated C & D in " + path)
        else:
            print("Could not find blocks in " + path)
            
    except Exception as e:
        print("Error with " + path + ": " + str(e))
