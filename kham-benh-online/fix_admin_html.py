import io
import re

with io.open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add <div id="detailed-report"></div> right before <script src="assets/js/questions_data.js"></script>
new_content = content.replace('<script src="assets/js/questions_data.js"></script>', '<div id="detailed-report"></div>\n\n<script src="assets/js/questions_data.js"></script>')

with io.open('admin.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Successfully added detailed-report div")
