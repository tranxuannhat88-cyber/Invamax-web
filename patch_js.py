import io
import re

new_func = """window.switchLanguage = function(lang) {
    let currentPath = window.location.pathname;
    
    if (lang === 'en') {
        if (currentPath === '/' || currentPath === '/index.html') {
            window.location.href = '/en/';
        } else if (currentPath.includes('/vi/')) {
            let newPath = currentPath.replace('/vi/', '/en/');
            if (newPath === '/en/index.html') newPath = '/en/';
            window.location.href = newPath;
        } else if (!currentPath.includes('/en/')) {
            window.location.href = '/en/';
        }
    } else if (lang === 'vi') {
        if (currentPath.includes('/en/')) {
            let newPath = currentPath.replace('/en/', '/vi/');
            if (newPath === '/vi/index.html' || newPath === '/vi/') newPath = '/';
            window.location.href = newPath;
        } else if (!currentPath.includes('/vi/') && currentPath !== '/') {
            window.location.href = '/';
        }
    }
};"""

with io.open('assets/js/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'window\.switchLanguage = function\(lang\) \{.*?\};', re.DOTALL)
new_content = pattern.sub(new_func, content)

with io.open('assets/js/main.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Updated main.js")
