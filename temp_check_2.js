
        function switchLanguage(lang) {
            localStorage.setItem('invamax_language', lang);
            let currentPath = window.location.pathname;
            if (currentPath.includes('/vi/')) {
                window.location.href = currentPath.replace('/vi/', '/' + lang + '/');
            } else if (currentPath.includes('/en/')) {
                window.location.href = currentPath.replace('/en/', '/' + lang + '/');
            } else {
                window.location.href = '/' + lang + '/index.html';
            }
        }
    