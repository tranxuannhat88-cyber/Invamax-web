/**
 * INVAMAX CASE STUDY STORE
 * Quản lý dữ liệu Case Study: Lưu trữ (IndexedDB + LocalStorage + Memory Cache),
 * Tải dữ liệu, Đồng bộ GitHub & Cập nhật website không giới hạn dung lượng file/ảnh.
 */

const INVAMAX_CASE_STUDY_STORE = (function () {
    const STORAGE_KEY = 'invamax_case_studies_v1';
    const LOCAL_MODIFIED_KEY = 'invamax_case_studies_local_modified';

    // IndexedDB configuration for unlimited file & image storage (hundreds of MBs)
    const IDB_NAME = 'invamax_case_studies_db';
    const IDB_VERSION = 1;
    const IDB_STORE = 'case_studies_store';
    const IDB_MAIN_KEY = 'all_case_studies';

    const DEFAULT_CASE_STUDIES = [
        {
            id: 'cs-productivity-pencil',
            badge: 'CASE STUDY 01',
            categories: ['Tăng năng suất', 'Lean & Cải tiến'],
            category: 'Tăng năng suất, Lean & Cải tiến',
            title: 'Tăng 42,3% năng suất tại nhà máy sản xuất bút chì',
            desc: 'Từ 742 lên 1.056 UPH sau 4 năm cải tiến hệ thống vận hành với INVAMAX FOS.',
            client: 'Nhà máy sản xuất bút chì',
            highlight: 'Tăng 42,3% UPH',
            link: '',
            thumbnail: 'assets/images/resources/art-5steps.jpg',
            pdfUrl: '',
            fileUrl: '',
            images: [
                'assets/images/report_dashboard.png',
                'assets/images/report_matrix.png',
                'assets/images/report_wastes.png'
            ],
            status: 'published',
            createdAt: '2026-10-12',
            dateDisplay: '12 thg 10, 2026',
            views: '2.4K lượt xem'
        },
        {
            id: 'cs-kaizen-cost-pencil',
            badge: 'CASE STUDY 02',
            categories: ['Giảm chi phí', 'Lean & Cải tiến'],
            category: 'Giảm chi phí, Lean & Cải tiến',
            title: '432.873 USD/năm giá trị cải tiến tại nhà máy sản xuất bút chì',
            desc: '4 năm liên tục loại bỏ lãng phí, tối ưu nguồn lực và cải thiện hệ thống vận hành với INVAMAX FOS.',
            client: 'Nhà máy sản xuất bút chì',
            highlight: '432.873 USD/năm',
            link: 'case-study/kaizen-cost-saving-pencil-factory.html',
            thumbnail: 'assets/images/resources/art-costdown.jpg',
            pdfUrl: 'assets/docs/IVM-Huong-dan-thuc-hien-5S-Tinh-gon-Hieu-qua.pdf',
            fileUrl: 'assets/docs/IVM-Huong-dan-thuc-hien-5S-Tinh-gon-Hieu-qua.pdf',
            images: [
                'assets/images/report_matrix.png',
                'assets/images/report_roadmap.png'
            ],
            status: 'published',
            createdAt: '2026-10-08',
            dateDisplay: '08 thg 10, 2026',
            views: '1.8K lượt xem'
        },
        {
            id: 'cs-operating-model-pencil',
            badge: 'CASE STUDY 03',
            categories: ['Lean & Cải tiến', 'Tăng năng suất'],
            category: 'Lean & Cải tiến, Tăng năng suất',
            title: 'Thay đổi Mô hình quản lý tại nhà máy sản xuất bút chì',
            desc: 'Từ quản lý theo Mini Factory sang quản lý chuyên trách theo công đoạn, tối ưu nhân sự trực tiếp.',
            client: 'Nhà máy sản xuất bút chì',
            highlight: 'Tối ưu quản lý chuyên trách',
            link: 'case-study/operating-model-pencil-factory.html',
            thumbnail: 'assets/images/operations/operations.jpg',
            pdfUrl: 'assets/docs/IVM-Huong-dan-thuc-hien-5S-Tinh-gon-Hieu-qua.pdf',
            fileUrl: 'assets/docs/IVM-Huong-dan-thuc-hien-5S-Tinh-gon-Hieu-qua.pdf',
            images: [
                'assets/images/report_roadmap.png',
                'assets/images/operations/factory.jpg'
            ],
            status: 'published',
            createdAt: '2026-10-05',
            dateDisplay: '05 thg 10, 2026',
            views: '3.1K lượt xem'
        }
    ];

    // In-memory cache so synchronous getAll() / getById() always returns full data immediately
    let memoryList = null;

    function cloneList(list) {
        try {
            return JSON.parse(JSON.stringify(list));
        } catch (e) {
            return Array.isArray(list) ? [...list] : [];
        }
    }

    function openDB() {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) {
                return reject(new Error('IndexedDB không khả dụng'));
            }
            const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
            req.onupgradeneeded = function (e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) {
                    db.createObjectStore(IDB_STORE, { keyPath: 'key' });
                }
            };
            req.onsuccess = function (e) {
                resolve(e.target.result);
            };
            req.onerror = function (e) {
                reject(e.target.error);
            };
        });
    }

    async function saveListToIDB(list) {
        try {
            const db = await openDB();
            return new Promise((resolve) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                const store = tx.objectStore(IDB_STORE);
                const req = store.put({
                    key: IDB_MAIN_KEY,
                    list: list,
                    updatedAt: Date.now()
                });
                req.onsuccess = () => resolve(true);
                req.onerror = (e) => {
                    console.warn('[CaseStudyStore] Lỗi ghi IndexedDB:', e);
                    resolve(false);
                };
            });
        } catch (e) {
            console.warn('[CaseStudyStore] Không thể ghi IndexedDB:', e);
            return false;
        }
    }

    async function getListFromIDB() {
        try {
            const db = await openDB();
            return new Promise((resolve) => {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const store = tx.objectStore(IDB_STORE);
                const req = store.get(IDB_MAIN_KEY);
                req.onsuccess = (e) => {
                    const res = e.target.result;
                    if (res && Array.isArray(res.list) && res.list.length > 0) {
                        resolve(res.list);
                    } else {
                        resolve(null);
                    }
                };
                req.onerror = () => resolve(null);
            });
        } catch (e) {
            return null;
        }
    }

    async function clearIDB() {
        try {
            const db = await openDB();
            return new Promise((resolve) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                const store = tx.objectStore(IDB_STORE);
                const req = store.delete(IDB_MAIN_KEY);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        } catch (e) {
            return false;
        }
    }

    function getCategories(item) {
        if (!item) return [];
        if (Array.isArray(item.categories) && item.categories.length > 0) return item.categories;
        if (typeof item.category === 'string' && item.category.trim() !== '') {
            return item.category.split(',').map(s => s.trim()).filter(Boolean);
        }
        return ['Lean & Cải tiến'];
    }

    function normalizeItem(item) {
        if (!item) return item;
        const copy = { ...item };
        if (!copy.fileUrl && copy.pdfUrl) copy.fileUrl = copy.pdfUrl;
        if (!copy.pdfUrl && copy.fileUrl) copy.pdfUrl = copy.fileUrl;
        return copy;
    }

    function getAll() {
        if (Array.isArray(memoryList) && memoryList.length > 0) {
            return memoryList.map(normalizeItem);
        }
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                memoryList = cloneList(DEFAULT_CASE_STUDIES);
                return memoryList;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                memoryList = parsed.map(normalizeItem);
                return memoryList;
            }
        } catch (e) {
            console.warn('[CaseStudyStore] Lỗi đọc localStorage:', e);
        }
        memoryList = cloneList(DEFAULT_CASE_STUDIES);
        return memoryList;
    }

    function saveToLocalStorageFallback(list) {
        // Avoid duplicating base64 in both pdfUrl and fileUrl when serializing to localStorage
        const deduplicated = list.map(item => {
            const copy = { ...item };
            if (copy.fileUrl && copy.fileUrl.startsWith('data:') && copy.pdfUrl === copy.fileUrl) {
                delete copy.pdfUrl;
            }
            return copy;
        });

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicated));
            return true;
        } catch (e1) {
            console.info('[CaseStudyStore] Dữ liệu lớn hơn giới hạn localStorage (5MB), tự động lưu file nặng vào IndexedDB và bản rút gọn vào localStorage.');
            // Strip large data: URLs from localStorage copy (full data is safely stored in IndexedDB & memoryList)
            try {
                const lightList = deduplicated.map(item => {
                    const copy = { ...item };
                    if (copy.fileUrl && copy.fileUrl.startsWith('data:')) {
                        copy.fileUrl = '';
                    }
                    if (copy.pdfUrl && copy.pdfUrl.startsWith('data:')) {
                        copy.pdfUrl = '';
                    }
                    if (Array.isArray(copy.images)) {
                        copy.images = copy.images.filter(img => !img || !img.startsWith('data:') || img.length < 150000);
                    }
                    return copy;
                });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(lightList));
                return true;
            } catch (e2) {
                try {
                    const ultraLight = deduplicated.map(item => {
                        const copy = { ...item };
                        if (copy.fileUrl && copy.fileUrl.startsWith('data:')) copy.fileUrl = '';
                        if (copy.pdfUrl && copy.pdfUrl.startsWith('data:')) copy.pdfUrl = '';
                        if (copy.thumbnail && copy.thumbnail.startsWith('data:') && copy.thumbnail.length > 1800000) {
                            copy.thumbnail = 'assets/images/resources/art-5steps.jpg';
                        }
                        if (Array.isArray(copy.images)) {
                            copy.images = copy.images.filter(img => !img || !img.startsWith('data:'));
                        }
                        return copy;
                    });
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(ultraLight));
                    return true;
                } catch (e3) {
                    console.warn('[CaseStudyStore] Không thể ghi bản rút gọn vào localStorage, dữ liệu vẫn được giữ trong IndexedDB:', e3);
                    return true; // Still saved in memoryList & IndexedDB
                }
            }
        }
    }

    function saveAll(list, markLocalModified = true) {
        const normalized = (Array.isArray(list) ? list : []).map(normalizeItem);
        memoryList = normalized;
        if (markLocalModified) {
            try {
                localStorage.setItem(LOCAL_MODIFIED_KEY, Date.now().toString());
            } catch (e) {}
        }
        saveListToIDB(normalized);
        return saveToLocalStorageFallback(normalized);
    }

    function getById(id) {
        return getAll().find(item => item.id === id) || null;
    }

    function formatVietnameseDate(isoDate) {
        try {
            const parts = (isoDate || '').split('-');
            if (parts.length === 3) {
                return `${parts[2]} thg ${parseInt(parts[1], 10)}, ${parts[0]}`;
            }
        } catch (e) {}
        return isoDate || '';
    }

    function add(item) {
        const list = cloneList(getAll());
        const id = item.id || ('cs-' + Date.now());
        const cats = Array.isArray(item.categories) && item.categories.length > 0 
            ? item.categories 
            : (item.category ? item.category.split(',').map(s => s.trim()).filter(Boolean) : ['Lean & Cải tiến']);
        const createdAt = item.createdAt || new Date().toISOString().split('T')[0];
        const fileData = item.fileUrl || item.pdfUrl || '';
        const imgs = Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []);
        const thumb = item.thumbnail || (imgs.length > 0 ? imgs[0] : 'assets/images/resources/art-5steps.jpg');

        const newItem = {
            id,
            badge: item.badge || ('CASE STUDY ' + String(list.length + 1).padStart(2, '0')),
            categories: cats,
            category: cats.join(', '),
            title: item.title || 'Case Study mới',
            desc: item.desc || item.highlight || item.title || '',
            client: item.client || '',
            highlight: item.highlight || '',
            link: item.link !== undefined ? item.link : '',
            thumbnail: thumb,
            thumbSource: item.thumbSource || (item.thumbnail ? 'custom' : 'auto'),
            pdfUrl: fileData,
            fileUrl: fileData,
            fileName: item.fileName || '',
            fileSize: item.fileSize || '',
            fileFormat: item.fileFormat || '',
            images: imgs,
            status: item.status || 'published',
            createdAt: createdAt,
            dateDisplay: item.dateDisplay || formatVietnameseDate(createdAt),
            views: item.views || '1.2K lượt xem'
        };
        list.unshift(newItem);
        saveAll(list, true);
        return newItem;
    }

    function update(id, updatedFields) {
        const list = cloneList(getAll());
        const index = list.findIndex(item => item.id === id);
        if (index === -1) return null;
        if (updatedFields.categories && Array.isArray(updatedFields.categories)) {
            updatedFields.category = updatedFields.categories.join(', ');
        } else if (updatedFields.category && typeof updatedFields.category === 'string') {
            updatedFields.categories = updatedFields.category.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        // If fileUrl or pdfUrl is explicitly cleared
        if (updatedFields.pdfUrl === '' && updatedFields.fileUrl === '') {
            updatedFields.pdfUrl = '';
            updatedFields.fileUrl = '';
            updatedFields.fileName = '';
            updatedFields.fileFormat = '';
            updatedFields.fileSize = '';
        } else if (updatedFields.fileUrl || updatedFields.pdfUrl) {
            const f = updatedFields.fileUrl || updatedFields.pdfUrl;
            updatedFields.fileUrl = f;
            updatedFields.pdfUrl = f;
        }

        list[index] = {
            ...list[index],
            ...updatedFields,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        saveAll(list, true);
        return list[index];
    }

    function remove(id) {
        const list = cloneList(getAll()).filter(item => item.id !== id);
        saveAll(list, true);
        return list;
    }

    async function resetToDefault() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(LOCAL_MODIFIED_KEY);
        } catch (e) {}
        await clearIDB();
        memoryList = cloneList(DEFAULT_CASE_STUDIES);
        saveAll(memoryList, false);
        return memoryList;
    }

    function getImageNaturalWidth(src) {
        return new Promise((resolve) => {
            if (!src || typeof src !== 'string') return resolve(0);
            const img = new Image();
            img.onload = () => resolve(img.naturalWidth || img.width || 0);
            img.onerror = () => resolve(0);
            img.src = src;
        });
    }

    async function ensurePdfJsLoaded() {
        if (typeof window !== 'undefined' && window.pdfjsLib) return true;
        if (typeof document === 'undefined') return false;
        const isInSubdir = window.location && (window.location.pathname.includes('/vi/') || window.location.pathname.includes('/en/'));
        const prefix = isInSubdir ? '../' : '';
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = prefix + 'assets/js/vendor/pdf.min.js';
            script.onload = () => {
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = prefix + 'assets/js/vendor/pdf.worker.min.js';
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });
    }

    // Trích xuất trang 1 của PDF ở độ phân giải Ultra-HD (2000px chiều ngang, chất lượng 0.95)
    async function generatePdfThumbnail(pdfSource, targetWidth = 2000) {
        const ready = await ensurePdfJsLoaded();
        if (!ready || !window.pdfjsLib) {
            return null;
        }
        try {
            let loadingTask;
            if (typeof pdfSource === 'string' && pdfSource.startsWith('data:')) {
                const parts = pdfSource.split(';base64,');
                const base64Str = parts.length > 1 ? parts[1] : parts[0];
                const binaryStr = window.atob(base64Str);
                const len = binaryStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryStr.charCodeAt(i);
                }
                loadingTask = window.pdfjsLib.getDocument({ data: bytes });
            } else {
                loadingTask = window.pdfjsLib.getDocument(pdfSource);
            }

            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const unscaledViewport = page.getViewport({ scale: 1 });
            const desiredWidth = Math.max(targetWidth || 2000, 2000);
            const scale = Math.max(desiredWidth / unscaledViewport.width, 2.8);
            const viewport = page.getViewport({ scale: scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext('2d', { alpha: false });

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            await page.render({
                canvasContext: ctx,
                viewport: viewport,
                intent: 'display'
            }).promise;

            return canvas.toDataURL('image/jpeg', 0.95);
        } catch (err) {
            console.warn('[CaseStudyStore] Lỗi trích xuất thumbnail PDF Ultra-HD:', err);
            return null;
        }
    }

    // Tự động nâng cấp các ảnh thumbnail PDF tự động cũ (260px) lên chuẩn Ultra-HD 2000px
    // Tuyệt đối KHÔNG ghi đè ảnh đại diện do người dùng tự tải lên (custom thumbnail)
    async function autoUpgradePdfThumbnails(onUpdated = null) {
        if (!Array.isArray(memoryList) || memoryList.length === 0) return false;
        let hasUpgraded = false;
        const isInSubdir = typeof window !== 'undefined' && window.location && (window.location.pathname.includes('/vi/') || window.location.pathname.includes('/en/'));

        for (let i = 0; i < memoryList.length; i++) {
            const item = memoryList[i];
            const titleLower = (item.title || '').toLowerCase();

            // Khôi phục lại ảnh xưởng thực tế cho dự án "Chuẩn hóa Layout & thực hiện 5S" nếu trước đó bị tự động ghi đè bởi trang 1 PDF
            if (titleLower.includes('chuẩn hóa layout') && titleLower.includes('5s') && item.thumbSource !== 'custom') {
                item.thumbnail = 'assets/images/case-study/layout-5s-gia-nghia.jpg';
                item.thumbSource = 'custom';
                hasUpgraded = true;
                continue;
            }

            // Nếu người dùng đã chủ động thiết lập ảnh đại diện riêng trong Admin thì giữ nguyên 100%
            if (item.thumbSource === 'custom') {
                continue;
            }

            const pdfSrc = item.fileUrl || item.pdfUrl || '';
            if (!pdfSrc) continue;

            const isPdf = pdfSrc.startsWith('data:application/pdf') ||
                          pdfSrc.toLowerCase().endsWith('.pdf') ||
                          (item.fileFormat || '').toUpperCase() === 'PDF';
            if (!isPdf) continue;

            let needsUpgrade = false;
            if (!item.thumbnail) {
                needsUpgrade = true;
            } else if (item.thumbnail.startsWith('data:image/')) {
                const w = await getImageNaturalWidth(item.thumbnail);
                // Chỉ nâng cấp đúng các ảnh thumbnail PDF tự động thế hệ cũ (vốn cố định ở 260px), không chạm vào ảnh chụp thực tế (480px+)
                if (w > 0 && w <= 280) {
                    needsUpgrade = true;
                }
            }

            if (needsUpgrade) {
                let resolvedPdf = pdfSrc;
                if (!pdfSrc.startsWith('data:') && !pdfSrc.startsWith('http') && !pdfSrc.startsWith('/') && isInSubdir && !pdfSrc.startsWith('../')) {
                    resolvedPdf = '../' + pdfSrc;
                }
                const hdThumb = await generatePdfThumbnail(resolvedPdf, 2000);
                if (hdThumb) {
                    item.thumbnail = hdThumb;
                    item.thumbSource = 'pdf-auto';
                    hasUpgraded = true;
                }
            }
        }

        if (hasUpgraded) {
            await saveListToIDB(memoryList);
            saveToLocalStorageFallback(memoryList);
            if (typeof onUpdated === 'function') {
                onUpdated(memoryList);
            }
        }
        return hasUpgraded;
    }

    // Initialize store from IndexedDB -> localStorage -> Remote JSON
    async function init(remoteJsonUrl = 'assets/data/case-studies.json') {
        const isLocalModified = Boolean(localStorage.getItem(LOCAL_MODIFIED_KEY));

        // 1. Check IndexedDB first (contains full high-res images & files)
        const idbList = await getListFromIDB();
        if (idbList && idbList.length > 0) {
            memoryList = idbList.map(normalizeItem);
        } else {
            // 2. Check localStorage
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        memoryList = parsed.map(normalizeItem);
                        await saveListToIDB(memoryList);
                    }
                }
            } catch (e) {}
        }

        // 3. Only overwrite with remote JSON if there are no unsynced local modifications
        //    OR if we have no local data yet
        if (!isLocalModified || !memoryList || memoryList.length === 0) {
            try {
                const res = await fetch(remoteJsonUrl + '?t=' + Date.now());
                if (res.ok) {
                    const remoteData = await res.json();
                    if (Array.isArray(remoteData) && remoteData.length > 0) {
                        memoryList = remoteData.map(normalizeItem);
                        await saveListToIDB(memoryList);
                        saveToLocalStorageFallback(memoryList);
                    }
                }
            } catch (e) {
                console.info('[CaseStudyStore] Dùng dữ liệu Case Study trong bộ nhớ trình duyệt.');
            }
        }

        if (!memoryList || memoryList.length === 0) {
            memoryList = cloneList(DEFAULT_CASE_STUDIES);
        }

        // 4. Tự động kiểm tra và nâng cấp độ nét Ultra-HD 2000px cho các thumbnail PDF bị mờ
        await autoUpgradePdfThumbnails();

        return memoryList;
    }

    async function fetchRemoteData(remoteJsonUrl = 'assets/data/case-studies.json') {
        return await init(remoteJsonUrl);
    }

    function base64ToBlobUrl(base64Data, defaultMime = 'application/pdf') {
        if (!base64Data || typeof base64Data !== 'string') return base64Data;
        if (!base64Data.startsWith('data:')) return base64Data;
        try {
            const parts = base64Data.split(';base64,');
            if (parts.length < 2) return base64Data;
            const mime = parts[0].replace('data:', '') || defaultMime;
            const bstr = window.atob(parts[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            return URL.createObjectURL(blob);
        } catch (e) {
            console.warn('[CaseStudyStore] Không thể chuyển DataURL sang BlobURL:', e);
            return base64Data;
        }
    }

    async function syncToGitHub(progressCallback = null) {
        if (!window.INVAMAX_GITHUB_SYNC || !window.INVAMAX_GITHUB_SYNC.isConfigured()) {
            return {
                success: false,
                skipped: true,
                message: 'Chưa cấu hình GitHub Token. Dữ liệu đã lưu trên trình duyệt máy này.'
            };
        }

        const notify = (msg) => {
            if (typeof progressCallback === 'function') progressCallback(msg);
        };

        try {
            // Ensure we have full data from IndexedDB before syncing
            const idbList = await getListFromIDB();
            const sourceList = (idbList && idbList.length > 0) ? idbList : getAll();
            const listToSync = cloneList(sourceList);

            for (let i = 0; i < listToSync.length; i++) {
                const item = listToSync[i];
                if (item.thumbnail && item.thumbnail.startsWith('data:')) {
                    const safeName = `thumb-${item.id}.jpg`;
                    const path = `assets/images/case-study/${safeName}`;
                    notify(`Đang tải ảnh bìa Case Study "${item.title}" lên GitHub...`);
                    await window.INVAMAX_GITHUB_SYNC.uploadDataUrlFile(path, item.thumbnail, `Upload case study thumb: ${safeName}`);
                    item.thumbnail = path;
                }

                const fileData = item.fileUrl || item.pdfUrl;
                if (fileData && fileData.startsWith('data:')) {
                    const ext = (item.fileFormat || 'pdf').toLowerCase().replace('.', '');
                    const safeName = `cs-file-${item.id}.${ext}`;
                    const path = `assets/docs/${safeName}`;
                    notify(`Đang tải tệp dữ liệu Case Study "${item.title}" lên GitHub...`);
                    await window.INVAMAX_GITHUB_SYNC.uploadDataUrlFile(path, fileData, `Upload case study file: ${safeName}`);
                    item.fileUrl = path;
                    item.pdfUrl = path;
                }

                if (Array.isArray(item.images)) {
                    for (let j = 0; j < item.images.length; j++) {
                        if (item.images[j] && item.images[j].startsWith('data:')) {
                            const safeName = `cs-detail-${item.id}-${j + 1}.jpg`;
                            const path = `assets/images/case-study/${safeName}`;
                            notify(`Đang tải ảnh chi tiết ${j + 1} lên GitHub...`);
                            await window.INVAMAX_GITHUB_SYNC.uploadDataUrlFile(path, item.images[j], `Upload case study detail image: ${safeName}`);
                            item.images[j] = path;
                        }
                    }
                }
            }

            notify('Đang cập nhật danh sách Case Study lên GitHub...');
            const commitResult = await window.INVAMAX_GITHUB_SYNC.commitJson('assets/data/case-studies.json', listToSync, 'Update case studies database from INVAMAX Admin portal');

            // Save synced list and clear local modified flag since remote is now up-to-date
            saveAll(listToSync, false);
            try {
                localStorage.removeItem(LOCAL_MODIFIED_KEY);
            } catch (e) {}

            return {
                success: true,
                message: 'Đã xuất bản Case Study lên GitHub thành công!',
                commit: commitResult
            };
        } catch (err) {
            console.error('[CaseStudyStore] Lỗi đồng bộ GitHub:', err);
            return {
                success: false,
                message: 'Lỗi đồng bộ Case Study lên GitHub: ' + err.message
            };
        }
    }

    function move(id, direction) {
        const list = cloneList(getAll());
        const idx = list.findIndex(item => item.id === id);
        if (idx === -1) return null;
        if (direction === 'up' && idx > 0) {
            const temp = list[idx];
            list[idx] = list[idx - 1];
            list[idx - 1] = temp;
        } else if (direction === 'down' && idx < list.length - 1) {
            const temp = list[idx];
            list[idx] = list[idx + 1];
            list[idx + 1] = temp;
        }
        saveAll(list, true);
        return list;
    }

    function moveToIndex(id, targetIndex) {
        const list = cloneList(getAll());
        const fromIdx = list.findIndex(item => item.id === id);
        if (fromIdx === -1) return null;
        const clampedTarget = Math.max(0, Math.min(list.length - 1, Number(targetIndex)));
        if (fromIdx === clampedTarget) return list;
        const [movedItem] = list.splice(fromIdx, 1);
        list.splice(clampedTarget, 0, movedItem);
        saveAll(list, true);
        return list;
    }

    function reorderByIds(orderedIds) {
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) return null;
        const list = cloneList(getAll());
        const map = new Map(list.map(it => [it.id, it]));
        const newList = [];
        orderedIds.forEach(id => {
            if (map.has(id)) {
                newList.push(map.get(id));
                map.delete(id);
            }
        });
        map.forEach(val => newList.push(val));
        saveAll(newList, true);
        return newList;
    }

    return {
        init,
        getAll,
        getById,
        getCategories,
        add,
        update,
        remove,
        move,
        moveToIndex,
        reorderByIds,
        resetToDefault,
        fetchRemoteData,
        syncToGitHub,
        saveAll,
        base64ToBlobUrl,
        generatePdfThumbnail,
        autoUpgradePdfThumbnails
    };
})();
