import io

css_append = """
@media (max-width: 768px) {
    /* Comprehensive catch-all to fix deformed cards on mobile */
    .knowledge-grid,
    .articles-grid,
    .components-grid,
    .solutions-grid-5,
    .values-grid-5,
    .grid-custom-3,
    .grid-3,
    .grid-4,
    .grid-5,
    .grid-6 {
        grid-template-columns: 1fr !important;
    }
}
"""

filename = 'assets/css/style.css'
with io.open(filename, 'a', encoding='utf-8') as f:
    f.write(css_append)

print("Appended comprehensive grid fixes to style.css")
