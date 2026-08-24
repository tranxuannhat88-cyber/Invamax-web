import io

new_engine_js_path = r"assets\js\new_engine.js"

try:
    with io.open(new_engine_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Update the prompt requirement
    old_req = '- Phân tích nguyên nhân gốc rễ (Root Cause Analysis). Xác định các vấn đề ưu tiên.\n- Đề xuất giải pháp đột phá. Xây dựng Roadmap 30-60-90 ngày. Đề xuất chỉ số đo lường (KPI).'
    new_req = '- Phân tích nguyên nhân gốc rễ (Root Cause Analysis). Xác định các vấn đề ưu tiên.\n- Đề xuất CHÍNH XÁC 5 hành động cầm máu (Quick Wins) BẮT BUỘC phải liên kết trực tiếp và logic để giải quyết các Dấu hiệu bất thường/Lãng phí nghiêm trọng nhất của 3 Module yếu kém nhất.\n- Đề xuất giải pháp đột phá. Xây dựng Roadmap 30-60-90 ngày. Đề xuất chỉ số đo lường (KPI).'
    
    if old_req in js:
        js = js.replace(old_req, new_req)
        print("Updated requirements in new_engine.js")

    # 2. Update the prompt JSON schema
    old_schema = '"quickWins": ["Hành động 1", "Hành động 2", "Hành động 3"],'
    new_schema = '"quickWins": ["Hành động cầm máu 1 giải quyết ngay triệu chứng module 1", "Hành động cầm máu 2 giải quyết ngay lãng phí module 2", "Hành động cầm máu 3 giải quyết ngay bất thường module 3", "Hành động cầm máu 4...", "Hành động cầm máu 5..."],'
    
    if old_schema in js:
        js = js.replace(old_schema, new_schema)
        print("Updated schema in new_engine.js")

    with io.open(new_engine_js_path, 'w', encoding='utf-8') as f:
        f.write(js)

except Exception as e:
    print("Error: ", e)
