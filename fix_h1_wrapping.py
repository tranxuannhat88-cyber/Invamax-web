import io

for filename in ['vi/index.html', 'en/index.html']:
    with io.open(filename, 'r', encoding='utf-8-sig') as f:
        content = f.read()

    # 1. Fix the media query that makes it wrap on laptops
    content = content.replace('@media (max-width: 1400px) {', '@media (max-width: 991px) {')

    # 2. Add class="nowrap-desktop" to the h1 spans
    # The current HTML looks like:
    # <h1 class="hero-h1" style="display: block !important;"><span >Chuyển đổi mô hình vận hành,</span><br><span >thay đổi vị thế thị trường</span></h1>
    # or
    # <h1 class="hero-h1" style="display: block !important;"><span>Chuyển đổi mô hình vận hành,</span>...
    
    if 'vi/' in filename:
        content = content.replace('<span >Chuyển đổi mô hình vận hành,</span>', '<span class="nowrap-desktop">Chuyển đổi mô hình vận hành,</span>')
        content = content.replace('<span>Chuyển đổi mô hình vận hành,</span>', '<span class="nowrap-desktop">Chuyển đổi mô hình vận hành,</span>')
        content = content.replace('<span >thay đổi vị thế thị trường</span>', '<span class="nowrap-desktop">thay đổi vị thế thị trường</span>')
        content = content.replace('<span>thay đổi vị thế thị trường</span>', '<span class="nowrap-desktop">thay đổi vị thế thị trường</span>')
    else:
        content = content.replace('<span >Transform operating model,</span>', '<span class="nowrap-desktop">Transform operating model,</span>')
        content = content.replace('<span>Transform operating model,</span>', '<span class="nowrap-desktop">Transform operating model,</span>')
        content = content.replace('<span >change market position</span>', '<span class="nowrap-desktop">change market position</span>')
        content = content.replace('<span>change market position</span>', '<span class="nowrap-desktop">change market position</span>')
        
    with io.open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Fixed h1 wrapping and laptop media query!")
