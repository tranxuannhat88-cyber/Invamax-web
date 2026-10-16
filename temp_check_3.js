
        lucide.createIcons({ attrs: { "stroke-width": 2.2 } });

        // Interactive Filter & Search for Case Studies
        const searchInput = document.getElementById('resSearchInput');
        const pillBtns = document.querySelectorAll('.res-filter-pills-light .res-pill-btn');

        function filterCases() {
            const caseCards = document.querySelectorAll('.grid-custom-3 .feature-card');
            const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const activePill = document.querySelector('.res-filter-pills-light .res-pill-btn.active');
            const filterKey = activePill ? (activePill.getAttribute('data-filter') || activePill.innerText.trim().toLowerCase()) : 'all';

            caseCards.forEach(card => {
                const title = card.querySelector('.cs-title')?.innerText.toLowerCase() || '';
                const desc = card.querySelector('.cs-desc')?.innerText.toLowerCase() || '';
                const category = card.querySelector('.cs-category')?.innerText.toLowerCase() || '';
                const badge = card.querySelector('.cs-badge-top')?.innerText.toLowerCase() || '';
                const dataCats = (card.getAttribute('data-categories') || category).toLowerCase();

                const matchesQuery = !query || title.includes(query) || desc.includes(query) || category.includes(query) || badge.includes(query);
                
                let matchesPill = true;
                if (filterKey !== 'all' && !filterKey.includes('tất cả')) {
                    if (filterKey === 'lean' || filterKey.includes('lean') || filterKey.includes('cải tiến')) {
                        matchesPill = dataCats.includes('lean') || dataCats.includes('cải tiến');
                    } else if (filterKey === 'productivity' || filterKey.includes('năng suất')) {
                        matchesPill = dataCats.includes('năng suất');
                    } else if (filterKey === 'cost' || filterKey.includes('chi phí') || filterKey.includes('giảm chi phí')) {
                        matchesPill = dataCats.includes('chi phí') || dataCats.includes('cost');
                    } else if (filterKey === 'digital' || filterKey.includes('số hóa') || filterKey.includes('dữ liệu')) {
                        matchesPill = dataCats.includes('số hóa') || dataCats.includes('dữ liệu') || dataCats.includes('digital') || dataCats.includes('data');
                    }
                }

                if (matchesQuery && matchesPill) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', filterCases);
        }

        pillBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                pillBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterCases();
            });
        });

        // Dynamic Case Studies Loader
        async function loadDynamicCaseStudies() {
            let list = null;
            try {
                const local = localStorage.getItem('invamax_case_studies_v1');
                if (local) {
                    const parsed = JSON.parse(local);
                    if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
                }
            } catch(e) {}

            try {
                const res = await fetch('../assets/data/case-studies.json?t=' + Date.now());
                if (res.ok) {
                    const remote = await res.json();
                    if (Array.isArray(remote) && remote.length > 0) {
                        list = remote;
                        localStorage.setItem('invamax_case_studies_v1', JSON.stringify(remote));
                    }
                }
            } catch(e) {}

            if (list && list.length > 0) {
                renderCaseStudiesToDOM(list);
            }
        }

        function renderCaseStudiesToDOM(items) {
            const grid = document.getElementById('caseStudiesGrid');
            if (!grid) return;
            const published = items.filter(it => it.status !== 'draft');
            if (published.length === 0) return;

            grid.innerHTML = published.map(cs => {
                let link = cs.link || '#';
                if (!link.startsWith('http') && !link.startsWith('/') && !link.startsWith('case-study/')) {
                    link = 'case-study/' + link;
                }
                const cats = Array.isArray(cs.categories) && cs.categories.length > 0 
                    ? cs.categories 
                    : (cs.category ? cs.category.split(',').map(s => s.trim()).filter(Boolean) : ['Lean & Cải tiến']);
                const catDisplay = cats.join(' • ');
                const catAttr = cats.join(', ').toLowerCase();

                return `
                    <a href="${link}" class="feature-card" data-categories="${catAttr}">
                        <div class="cs-badge-top">${cs.badge || 'CASE STUDY'}</div>
                        <div class="cs-category">${catDisplay}</div>
                        <h3 class="cs-title">${cs.title}</h3>
                        <p class="cs-desc">${cs.desc || ''}</p>
                        <div class="cs-cta">
                            Xem Case Study <i data-lucide="arrow-right"></i>
                        </div>
                    </a>
                `;
            }).join('');

            lucide.createIcons({ attrs: { "stroke-width": 2.2 } });
            filterCases();
        }

        document.addEventListener('DOMContentLoaded', loadDynamicCaseStudies);
    