/**
 * INVAMAX TOOLKIT & RESOURCES STORE
 * Quản lý dữ liệu tài liệu Toolkit: Lưu trữ, Tải file, Đồng bộ & Render
 */

const INVAMAX_TOOLKIT_STORE = (function () {
    const STORAGE_KEY = 'invamax_toolkits_v2';
    const SETTINGS_KEY = 'invamax_admin_settings_v1';

    // Dữ liệu mặc định 4 tài liệu gốc
    const DEFAULT_TOOLKITS = [
        {
            id: 'tool-checklist-danh-gia',
            title: 'Hướng dẫn thực hiện 5S Tinh gọn & Hiệu quả',
            format: 'PDF',
            desc: 'Tài liệu giúp bạn triển khai thực hiện và duy trì 5S hiệu quả.',
            fileUrl: 'assets/docs/IVM-Huong-dan-thuc-hien-5S-Tinh-gon-Hieu-qua.pdf',
            fileName: 'IVM - Hướng dẫn thực hiện 5S Tinh gọn & Hiệu quả.pdf',
            fileSize: '6.16 MB',
            thumbnail: 'assets/images/resources/thumb-5s-guide.jpg',
            createdAt: '2026-10-10',
            downloads: 242,
            status: 'published'
        },
        {
            id: 'tool-ke-hoach-lean-a3',
            title: 'Khung lập kế hoạch triển khai Lean (A3)',
            format: 'DOCX',
            desc: 'Mẫu A3 chuẩn giúp lập kế hoạch, triển khai và theo dõi tiến độ.',
            fileUrl: '#',
            fileName: 'Khung-ke-hoach-Lean-A3.docx',
            fileSize: '850 KB',
            createdAt: '2026-10-08',
            downloads: 185,
            status: 'published'
        },
        {
            id: 'tool-huong-dan-giam-chi-phi',
            title: 'Tài liệu hướng dẫn Giảm chi phí sản xuất',
            format: 'PDF',
            desc: 'Hướng dẫn chi tiết phương pháp phân tích chi phí theo IPO và các công cụ thực hành.',
            fileUrl: '#',
            fileName: 'Huong-dan-giam-chi-phi-san-xuat.pdf',
            fileSize: '3.4 MB',
            createdAt: '2026-10-05',
            downloads: 310,
            status: 'published'
        },
        {
            id: 'tool-bieu-mau-oee',
            title: 'Biểu mẫu quản lý chỉ số OEE',
            format: 'XLSX',
            desc: 'Bộ biểu mẫu theo dõi, phân tích và báo cáo OEE trong sản xuất.',
            fileUrl: '#',
            fileName: 'Bieu-mau-quan-ly-OEE.xlsx',
            fileSize: '1.5 MB',
            createdAt: '2026-10-01',
            downloads: 295,
            status: 'published'
        }
    ];

    // IndexedDB Cấu hình để lưu file thực tế (Dung lượng không giới hạn: lên tới hàng GB)
    const IDB_NAME = 'invamax_toolkit_files_db';
    const IDB_VERSION = 1;
    const IDB_STORE = 'files_store';

    function openFileDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                return reject(new Error('IndexedDB không được hỗ trợ trên trình duyệt này'));
            }
            const req = indexedDB.open(IDB_NAME, IDB_VERSION);
            req.onupgradeneeded = function (e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) {
                    db.createObjectStore(IDB_STORE, { keyPath: 'id' });
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

    // Lưu file vào IndexedDB
    async function setFileInDB(id, fileData) {
        try {
            const db = await openFileDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                const store = tx.objectStore(IDB_STORE);
                const req = store.put({ id: id, data: fileData, updatedAt: Date.now() });
                req.onsuccess = () => resolve(true);
                req.onerror = (e) => reject(e.target.error);
            });
        } catch (e) {
            console.error('[ToolkitStore] Không thể lưu file vào IndexedDB:', e);
            return false;
        }
    }

    // Lấy file từ IndexedDB
    async function getFileFromDB(id) {
        try {
            const db = await openFileDB();
            return new Promise((resolve) => {
                const tx = db.transaction(IDB_STORE, 'readonly');
                const store = tx.objectStore(IDB_STORE);
                const req = store.get(id);
                req.onsuccess = (e) => {
                    resolve(e.target.result ? e.target.result.data : null);
                };
                req.onerror = () => resolve(null);
            });
        } catch (e) {
            return null;
        }
    }

    // Xóa file khỏi IndexedDB
    async function removeFileFromDB(id) {
        try {
            const db = await openFileDB();
            return new Promise((resolve) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                const store = tx.objectStore(IDB_STORE);
                const req = store.delete(id);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            });
        } catch (e) {
            return false;
        }
    }

    // Lấy danh sách tài liệu
    function getAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TOOLKITS));
                return DEFAULT_TOOLKITS;
            }
            let data = JSON.parse(raw);
            if (!Array.isArray(data) || data.length === 0) {
                return DEFAULT_TOOLKITS;
            }

            // Dọn sạch các thumbnail giả lập topic- từ phiên bản trước
            let needsUpdate = false;
            data = data.map(item => {
                if (item.thumbnail && (item.thumbnail.includes('../assets/images/resources/topic-') || item.thumbnail.includes('assets/images/resources/topic-') || item.thumbnail.includes('topic-mgmt') || item.thumbnail.includes('topic-cost') || item.thumbnail.includes('topic-lean'))) {
                    needsUpdate = true;
                    const copy = { ...item };
                    delete copy.thumbnail;
                    return copy;
                }
                return item;
            });

            if (needsUpdate) {
                saveAll(data);
            }

            return data;
        } catch (e) {
            console.warn('[ToolkitStore] Không thể đọc từ localStorage, dùng mặc định:', e);
            return DEFAULT_TOOLKITS;
        }
    }

    // Chuyển đổi Data URL Base64 thành Blob URL (blob:http...) để iframe hiển thị PDF mượt mà không bị chặn
    function base64ToBlobUrl(base64Data, contentType = 'application/pdf') {
        if (!base64Data) return null;
        if (base64Data.startsWith('blob:') || base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
            return base64Data;
        }
        try {
            const parts = base64Data.split(';base64,');
            const base64Str = parts.length > 1 ? parts[1] : parts[0];
            const binaryStr = window.atob(base64Str);
            const len = binaryStr.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: contentType });
            return URL.createObjectURL(blob);
        } catch (err) {
            console.error('[ToolkitStore] Lỗi khi tạo Blob URL từ Base64:', err);
            return null;
        }
    }

    // Trích xuất ảnh trang 1 của file PDF thực tế làm Thumbnail bằng PDF.js
    async function generatePdfThumbnail(pdfSource, targetWidth = 260) {
        if (!window.pdfjsLib) {
            console.warn('[ToolkitStore] PDF.js chưa được nạp, bỏ qua trích xuất thumbnail.');
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
                loadingTask = pdfjsLib.getDocument({ data: bytes });
            } else {
                loadingTask = pdfjsLib.getDocument(pdfSource);
            }

            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const unscaledViewport = page.getViewport({ scale: 1 });
            const scale = targetWidth / unscaledViewport.width;
            const viewport = page.getViewport({ scale: scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext('2d');

            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            const thumbData = canvas.toDataURL('image/jpeg', 0.85);
            return thumbData;
        } catch (err) {
            console.warn('[ToolkitStore] Lỗi trích xuất thumbnail PDF trang 1:', err);
            return null;
        }
    }

    // Tự động kiểm tra và sinh thumbnail trang 1 cho các tài liệu PDF thực tế chưa có thumbnail
    async function autoGenerateMissingThumbnails() {
        if (!window.pdfjsLib) return;
        try {
            const items = getAll();
            let hasChanged = false;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const isPdf = (item.format || '').toUpperCase() === 'PDF' || (item.fileName && item.fileName.toLowerCase().endsWith('.pdf'));
                
                // Nếu là PDF và chưa có thumbnail thực tế
                if (isPdf && !item.thumbnail) {
                    let fileData = item.fileUrl;
                    if (fileData && fileData.startsWith('idb:')) {
                        fileData = await getFileFromDB(item.id);
                    }
                    if (fileData && (fileData.startsWith('data:application/pdf') || fileData.startsWith('data:'))) {
                        const thumb = await generatePdfThumbnail(fileData);
                        if (thumb) {
                            item.thumbnail = thumb;
                            hasChanged = true;
                        }
                    }
                }
            }

            if (hasChanged) {
                saveAll(items);
                // Cập nhật lại giao diện trên trang resources nếu đang mở
                if (typeof document !== 'undefined' && document.querySelector('#toolkit .res-grid-4')) {
                    initResourcesPage();
                }
                // Cập nhật lại giao diện trên trang admin nếu đang mở
                if (typeof renderDashboard === 'function') {
                    renderDashboard();
                }
            }
        } catch (e) {
            console.warn('[ToolkitStore] autoGenerateMissingThumbnails error:', e);
        }
    }

    // Lưu danh sách tài liệu vào localStorage (Tự động chuyển file lớn sang IndexedDB nếu cần)
    function saveAll(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            return true;
        } catch (e) {
            console.warn('[ToolkitStore] QuotaExceeded trên localStorage, kích hoạt cơ chế tách file sang IndexedDB...', e);
            // Nếu bị vượt hạn mức localStorage, chuyển toàn bộ fileBase64 vào IndexedDB và chỉ lưu con trỏ `idb:{id}` vào localStorage
            const sanitized = items.map(item => {
                if (item.fileUrl && item.fileUrl.startsWith('data:')) {
                    setFileInDB(item.id, item.fileUrl);
                    return {
                        ...item,
                        fileUrl: 'idb:' + item.id
                    };
                }
                return item;
            });
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
                return true;
            } catch (err2) {
                console.error('[ToolkitStore] Thất bại khi lưu sau khi chuyển sang IDB:', err2);
                return false;
            }
        }
    }

    // Thêm hoặc cập nhật tài liệu (hỗ trợ async lưu file dung lượng lớn)
    async function saveItem(item) {
        const items = getAll();
        let targetId = item.id;

        if (!targetId) {
            targetId = 'tool-' + Date.now();
            item.id = targetId;
            item.createdAt = new Date().toISOString().split('T')[0];
            item.downloads = item.downloads || 0;
            item.status = item.status || 'published';
        }

        // Nếu fileUrl là Data URL Base64 (upload file trực tiếp từ máy), luôn lưu bản sao chuẩn vào IndexedDB trước
        if (item.fileUrl && item.fileUrl.startsWith('data:')) {
            await setFileInDB(targetId, item.fileUrl);
        }

        const index = items.findIndex(t => t.id === targetId);
        if (index !== -1) {
            items[index] = { ...items[index], ...item, updatedAt: new Date().toISOString() };
        } else {
            items.unshift(item);
        }

        const saved = saveAll(items);
        return saved;
    }

    // Xóa tài liệu
    async function deleteItem(id) {
        let items = getAll();
        items = items.filter(t => t.id !== id);
        saveAll(items);
        await removeFileFromDB(id);
        return true;
    }

    // Reset về mặc định
    function resetToDefault() {
        saveAll(DEFAULT_TOOLKITS);
        return DEFAULT_TOOLKITS;
    }

    // Tăng lượt tải
    function incrementDownload(id) {
        const items = getAll();
        const item = items.find(t => t.id === id);
        if (item) {
            item.downloads = (item.downloads || 0) + 1;
            saveAll(items);
        }
    }

    // Lấy cài đặt Cloud / Admin
    function getSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : {
                supabaseUrl: '',
                supabaseKey: '',
                adminEmail: 'admin@invamax.com',
                requireLeadCapture: false
            };
        } catch (e) {
            return {};
        }
    }

    function saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }

    // Kiểm tra xem item có file thực tế hay chưa
    async function hasRealFile(item) {
        if (!item || !item.fileUrl || item.fileUrl === '#') return false;
        if (item.fileUrl.startsWith('http://') || item.fileUrl.startsWith('https://')) return true;
        if (item.fileUrl.startsWith('data:')) return true;
        if (item.fileUrl.startsWith('idb:')) {
            const fileData = await getFileFromDB(item.id);
            return !!fileData;
        }
        return false;
    }

    // Lấy nội dung link tải file (giải quyết nếu lưu trong IDB)
    async function getFileDownloadUrl(item) {
        if (!item || !item.fileUrl || item.fileUrl === '#') return '#';
        if (item.fileUrl.startsWith('idb:')) {
            const dataUrl = await getFileFromDB(item.id);
            return dataUrl || '#';
        }
        return item.fileUrl;
    }

    // Xử lý khi bấm nút "Xem tài liệu"
    async function handlePreview(id, event) {
        if (event) event.preventDefault();
        const item = getAll().find(t => t.id === id);
        if (!item) return;

        // Nếu có preview modal trên trang, mở popup xem trước
        if (typeof openDocPreviewModal === 'function') {
            openDocPreviewModal(item);
            return;
        }

        // Tự động kiểm tra fileUrl
        let targetUrl = item.fileUrl;
        if (targetUrl && targetUrl.startsWith('idb:')) {
            targetUrl = await getFileFromDB(item.id);
        }

        if (targetUrl && targetUrl !== '#') {
            // Mở tab mới xem trước trực tiếp (PDF, link Drive, hình ảnh, văn bản)
            const win = window.open();
            if (win) {
                if (targetUrl.startsWith('data:application/pdf') || targetUrl.startsWith('http')) {
                    win.location.href = targetUrl;
                } else {
                    win.document.write(`
                        <html>
                        <head><title>Xem trước: ${escapeHTML(item.title)}</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; text-align: center; background: #0f172a; color: #f8fafc; }
                            .box { max-width: 600px; margin: 40px auto; background: #1e293b; padding: 30px; border-radius: 14px; border: 1px solid #334155; }
                            h2 { color: #f97316; margin-bottom: 12px; }
                            p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
                            .btn { display: inline-flex; align-items: center; gap: 8px; background: #ea580c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; }
                        </style>
                        </head>
                        <body>
                            <div class="box">
                                <h2>${escapeHTML(item.title)}</h2>
                                <p>${escapeHTML(item.desc || '')}</p>
                                <p style="font-size: 13px; color: #64748b;">Định dạng: <strong>${escapeHTML(item.format || '')}</strong> &bull; Dung lượng: ${escapeHTML(item.fileSize || '')}</p>
                                <a class="btn" href="${targetUrl}" download="${escapeHTML(item.fileName || 'tai-lieu')}">Tải về máy để xem toàn bộ</a>
                            </div>
                        </body>
                        </html>
                    `);
                }
            }
        } else {
            alert('Tài liệu "' + item.title + '" đang được chuẩn bị bản xem trước số hóa. Bạn có thể liên hệ INVAMAX để nhận tài liệu ngay!');
        }
    }

    // Giải quyết đường dẫn tương đối khi trang hiện tại nằm trong thư mục con (ví dụ /vi/ hoặc /en/)
    function resolveAssetUrl(url) {
        if (!url || url === '#' || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('idb:')) {
            return url;
        }
        const isInSubdir = typeof window !== 'undefined' && window.location && (window.location.pathname.includes('/vi/') || window.location.pathname.includes('/en/'));
        if (isInSubdir && url.startsWith('assets/')) {
            return '../' + url;
        }
        return url;
    }

    // Render HTML card cho trang resources.html
    function renderCardHTML(tool) {
        const fmt = (tool.format || 'PDF').toUpperCase();
        let badgeClass = 'fmt-pdf';
        if (fmt === 'XLSX' || fmt === 'XLS' || fmt === 'EXCEL') badgeClass = 'fmt-xlsx';
        else if (fmt === 'DOCX' || fmt === 'DOC' || fmt === 'WORD') badgeClass = 'fmt-docx';

        const isRealLink = tool.fileUrl && tool.fileUrl !== '#' && !tool.fileUrl.startsWith('idb:');
        const resolvedFileUrl = isRealLink ? resolveAssetUrl(tool.fileUrl) : '#';
        const downloadHref = resolvedFileUrl;
        const downloadAttr = tool.fileUrl && (tool.fileUrl.startsWith('data:') || tool.fileUrl.endsWith('.pdf')) ? `download="${tool.fileName || 'tai-lieu'}"` : `target="_blank" rel="noopener"`;

        // Thumbnail thực tế nếu có, ngược lại dùng icon mặc định như cũ
        const resolvedThumb = resolveAssetUrl(tool.thumbnail);
        const hasRealThumb = !!resolvedThumb;
        const thumbHTML = hasRealThumb ? `
            <div class="tool-thumb-box" onclick="INVAMAX_TOOLKIT_STORE.handlePreview('${tool.id}', event)" title="Bấm để xem trước tài liệu">
                <img src="${resolvedThumb}" alt="${escapeHTML(tool.title)}" class="tool-thumb-img">
                <div class="tool-thumb-overlay">
                    <i data-lucide="eye" style="width: 16px; height: 16px; color: #ffffff;"></i>
                </div>
            </div>
        ` : `
            <div class="tool-preview-box">
                <div class="doc-line title"></div>
                <div class="doc-line w-80"></div>
                <div class="doc-line w-60"></div>
                <div class="doc-line w-90"></div>
            </div>
        `;

        return `
            <div class="tool-card-light" data-id="${tool.id}">
                <div class="tool-top-row">
                    ${thumbHTML}
                    <div class="tool-header-content">
                        <span class="tool-format-badge ${badgeClass}" style="align-self: flex-start; margin-bottom: 6px;">${fmt}</span>
                        <h3 class="tool-title-light">${escapeHTML(tool.title)}</h3>
                    </div>
                </div>
                <p class="tool-desc-light">${escapeHTML(tool.desc || '')}</p>
                <div class="tool-card-actions">
                    <button type="button" class="tool-btn-preview" onclick="INVAMAX_TOOLKIT_STORE.handlePreview('${tool.id}', event)">
                        <i data-lucide="eye"></i> Xem tài liệu
                    </button>
                    <a href="${downloadHref}" ${downloadAttr} class="tool-download-btn" onclick="INVAMAX_TOOLKIT_STORE.handleDownload('${tool.id}', event)">
                        <i data-lucide="download"></i> Tải xuống
                    </a>
                </div>
            </div>
        `;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Xử lý khi bấm nút Tải xuống
    async function handleDownload(id, event) {
        incrementDownload(id);
        const item = getAll().find(t => t.id === id);
        if (!item || item.fileUrl === '#') {
            if (event) event.preventDefault();
            if (typeof openContactModal === 'function') {
                openContactModal();
            } else {
                alert('Tài liệu "' + (item ? item.title : '') + '" đang được cập nhật bản mới. Vui lòng liên hệ INVAMAX!');
            }
            return;
        }

        // Nếu file được lưu trong IndexedDB, lấy dữ liệu và kích hoạt download tự động
        if (item.fileUrl.startsWith('idb:')) {
            if (event) event.preventDefault();
            const fileData = await getFileFromDB(item.id);
            if (fileData) {
                const tempLink = document.createElement('a');
                tempLink.href = fileData;
                tempLink.download = item.fileName || (item.title + '.' + (item.format || 'pdf').toLowerCase());
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
            } else {
                alert('Không tìm thấy file tải trong bộ nhớ. Vui lòng thử tải lại tài liệu!');
            }
        }
    }

    // Khởi tạo và đồng bộ hiển thị lên trang resources.html
    function initResourcesPage() {
        const grid = document.querySelector('#toolkit .res-grid-4');
        if (!grid) return;

        const items = getAll().filter(t => t.status !== 'draft');
        if (items && items.length > 0) {
            grid.innerHTML = items.map(renderCardHTML).join('');
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        }
    }

    return {
        getAll,
        saveAll,
        saveItem,
        deleteItem,
        resetToDefault,
        incrementDownload,
        getSettings,
        saveSettings,
        renderCardHTML,
        handleDownload,
        handlePreview,
        getFileFromDB,
        getFileDownloadUrl,
        hasRealFile,
        initResourcesPage,
        base64ToBlobUrl,
        generatePdfThumbnail,
        autoGenerateMissingThumbnails,
        resolveAssetUrl
    };
})();

// Tự động khởi chạy trên trang resources
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        if (document.querySelector('#toolkit .res-grid-4')) {
            INVAMAX_TOOLKIT_STORE.initResourcesPage();
        }
        // Tự động quét và sinh thumbnail thực tế nếu có tài liệu PDF chưa có ảnh bìa
        setTimeout(() => {
            if (typeof INVAMAX_TOOLKIT_STORE.autoGenerateMissingThumbnails === 'function') {
                INVAMAX_TOOLKIT_STORE.autoGenerateMissingThumbnails();
            }
        }, 300);
    });
}
