import io

mobile_css = """
<style>
/* Additional Mobile Fixes for Homepage */
@media (max-width: 768px) {
    .hero-h1 { font-size: 2.2rem !important; margin-bottom: 20px !important; }
    .grid-custom-3 { grid-template-columns: 1fr !important; gap: 16px !important; }
    .feature-card { padding: 16px !important; }
}
</style>
</head>
"""

for filename in ['vi/index.html', 'en/index.html']:
    with io.open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    if '/* Additional Mobile Fixes for Homepage */' not in content:
        content = content.replace('</head>', mobile_css)
        with io.open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filename}")
    else:
        print(f"Already patched {filename}")
