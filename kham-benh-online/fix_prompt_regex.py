import io
import re

admin_js_path = r"assets\js\admin.js"

try:
    with io.open(admin_js_path, 'r', encoding='utf-8') as f:
        js = f.read()

    # 1. Update the System Prompt JSON Schema correctly
    old_causeChains = r'"causeChains":\s*\[.*?\]'
    new_deepDiveCards = '''"deepDiveCards": [
      {
        "module": "Tên 1 trong 3 Module FOS yếu nhất",
        "surveyReality": "Nhắc lại Dấu hiệu bất thường hoặc Lãng phí nghiêm trọng nhất mà nhà máy ĐANG gặp phải (lấy từ top3Symptoms và top3Wastes) CÓ LIÊN QUAN mật thiết đến module này.",
        "aiInsight": "Phân tích logic của chuyên gia: Tại sao sự yếu kém của Module này lại sinh ra bề nổi (dấu hiệu/lãng phí) kia? Nếu khách hàng đánh giá module rất thấp nhưng lại bảo KHÔNG CÓ lãng phí/dấu hiệu liên quan, hãy thẳng thắn chỉ ra sự mâu thuẫn và rủi ro tiềm ẩn (ngầm).",
        "businessImpact": "Tác động tiêu cực đến doanh thu, chi phí, năng lực cạnh tranh."
      }
    ]'''
    
    # We replace "causeChains": [ ... ] with the new deepDiveCards schema
    js = re.sub(old_causeChains, new_deepDiveCards, js, flags=re.DOTALL)

    # 2. Update the quickWins prompt example to use "Sắp xếp"
    # Current prompt has: "quickWins": ["Hnh d?ng 1", "Hnh d?ng 2", "Hnh d?ng 3"]
    # We will replace it
    js = re.sub(
        r'"quickWins":\s*\["Hnh d\?ng 1",\s*"Hnh d\?ng 2",\s*"Hnh d\?ng 3"\]',
        '"quickWins": ["Hành động cầm máu 1 (ví dụ: Sắp xếp và dọn dẹp hiện trường)", "Hành động 2", "Hành động 3"]',
        js
    )

    # 3. Add fallback in JS rendering to support older cached responses
    js = js.replace(
        "if(el_chains && aiJsonData.consulting.deepDiveCards) {",
        "const cardsData = aiJsonData.consulting.deepDiveCards || aiJsonData.consulting.causeChains;\n        if(el_chains && cardsData) {"
    )
    js = js.replace(
        "el_chains.innerHTML = aiJsonData.consulting.deepDiveCards.slice(0,3).map(c => `",
        "el_chains.innerHTML = cardsData.slice(0,3).map(c => `"
    )
    
    # 4. Also handle if it's falling back to causeChains (c.waste, c.sign) so the UI doesn't break
    js = js.replace(
        r"${c.surveyReality}",
        r"${c.surveyReality || (c.sign + ' - ' + c.waste)}"
    )
    js = js.replace(
        r"${c.aiInsight}",
        r"${c.aiInsight || c.hypothesis || c.logic}"
    )

    with io.open(admin_js_path, 'w', encoding='utf-8') as f:
        f.write(js)
    print("Fixed admin.js successfully.")

except Exception as e:
    print("Error JS: " + str(e))
