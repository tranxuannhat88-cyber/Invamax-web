import io

css_append = """
    /* Fix articles grid on mobile */
    .articles-grid {
        grid-template-columns: 1fr !important;
    }
"""

filename = 'assets/css/style.css'
with io.open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of the mobile block we appended earlier, or just append another block.
# Let's just append another @media block to be safe.
new_block = """
@media (max-width: 768px) {
    /* Fix articles grid on mobile */
    .articles-grid {
        grid-template-columns: 1fr !important;
    }
    
    /* Ensure article title is readable */
    .articles-hero h1 {
        font-size: 2.2rem !important;
    }
}
"""

with io.open(filename, 'a', encoding='utf-8') as f:
    f.write(new_block)

print("Appended articles-grid mobile fixes to style.css")
