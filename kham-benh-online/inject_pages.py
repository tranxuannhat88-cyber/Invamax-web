import io

with io.open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('id="report-a4-wrapper"')
if start_idx != -1:
    # Find the start of the inner HTML
    inner_start = content.find('>', start_idx) + 1
    
    # We need to find the matching closing </div> for report-a4-wrapper
    div_count = 1
    inner_end = inner_start
    while div_count > 0 and inner_end < len(content):
        next_div = content.find('<div', inner_end)
        next_end_div = content.find('</div', inner_end)
        
        if next_div == -1:
            next_div = len(content)
        if next_end_div == -1:
            break
            
        if next_div < next_end_div:
            div_count += 1
            inner_end = next_div + 4
        else:
            div_count -= 1
            inner_end = next_end_div + 6
            if div_count == 0:
                inner_end = next_end_div # The start of the closing tag
                break
                
    preliminary_html = content[inner_start:inner_end].strip()
    
    with io.open('admin.html', 'r', encoding='utf-8') as f:
        admin_content = f.read()
        
    # Replace inside <div id="preliminary-report"></div>
    # Using python string find and replace to be safe
    rep_start = admin_content.find('<div id="preliminary-report">')
    if rep_start != -1:
        rep_inner_start = admin_content.find('>', rep_start) + 1
        rep_end = admin_content.find('</div>', rep_inner_start)
        
        # But wait, preliminary-report might already have stuff inside from our previous bad injection!
        # So we need to find the MATCHING closing div for preliminary-report.
        div_count = 1
        rep_inner_end = rep_inner_start
        while div_count > 0 and rep_inner_end < len(admin_content):
            next_div = admin_content.find('<div', rep_inner_end)
            next_end_div = admin_content.find('</div', rep_inner_end)
            if next_div == -1: next_div = len(admin_content)
            if next_end_div == -1: break
            if next_div < next_end_div:
                div_count += 1
                rep_inner_end = next_div + 4
            else:
                div_count -= 1
                rep_inner_end = next_end_div + 6
                if div_count == 0:
                    rep_inner_end = next_end_div
                    break
        
        new_admin = admin_content[:rep_inner_start] + '\n' + preliminary_html + '\n' + admin_content[rep_inner_end:]
        
        with io.open('admin.html', 'w', encoding='utf-8') as f:
            f.write(new_admin)
        print('Successfully copied preliminary report HTML from index.html to admin.html')
    else:
        print('Could not find preliminary-report in admin.html')
else:
    print('Could not find report-a4-wrapper in index.html')
