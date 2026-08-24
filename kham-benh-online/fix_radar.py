import io

filepath = r"assets\js\admin.js"

with io.open(filepath, 'r', encoding='utf-8') as f:
    js = f.read()

# Fix radar chart min/max config for Chart.js v3+
target_scale = """                    r: {
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 10.5, family: "'Inter', sans-serif", weight: '600' }, color: '#475569' },
                        ticks: { display: false, min: 0, max: 100, stepSize: 20, count: 6 }
                    }"""
                    
replacement_scale = """                    r: {
                        min: 0,
                        max: 100,
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 10.5, family: "'Inter', sans-serif", weight: '600' }, color: '#475569' },
                        ticks: { display: false, stepSize: 20, count: 6 }
                    }"""

js = js.replace(target_scale, replacement_scale)

# Fix score bottom alignment by adding margin-top: auto
target_score = '<div style="font-size:16px; font-weight:900; color:${conf.text};">${item.score}</div>'
replacement_score = '<div style="font-size:16px; font-weight:900; color:${conf.text}; margin-top: auto;">${item.score}</div>'
js = js.replace(target_score, replacement_score)

with io.open(filepath, 'w', encoding='utf-8') as f:
    f.write(js)

print("Fixed chart config and score alignment")
