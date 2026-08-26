import io

css_append = """
/* --- GLOBAL MOBILE FIXES --- */
@media (max-width: 768px) {
    /* Fix oversized inline h1 headers */
    h1[style*="font-size: 3.5rem"], 
    h1[style*="font-size:3.5rem"],
    .hero-h1 {
        font-size: 2.2rem !important;
        margin-bottom: 20px !important;
    }
    
    /* Fix deformed cards in custom grids */
    .grid-custom-3 {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
    }
    
    /* Ensure all feature cards fit comfortably on mobile */
    .feature-card, .platform-card, .solution-card {
        padding: 16px !important;
    }
}
"""

filename = 'assets/css/style.css'
with io.open(filename, 'a', encoding='utf-8') as f:
    f.write(css_append)

print("Appended mobile fixes to style.css")
