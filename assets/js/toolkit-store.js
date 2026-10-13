/**
 * INVAMAX TOOLKIT & RESOURCES STORE
 * Quản lý dữ liệu tài liệu Toolkit: Lưu trữ, Tải file, Đồng bộ & Render
 */

const INVAMAX_TOOLKIT_STORE = (function () {
    const STORAGE_KEY = 'invamax_toolkits_v1';
    const SETTINGS_KEY = 'invamax_admin_settings_v1';

    // Dữ liệu mặc định 4 tài liệu gốc
    const DEFAULT_TOOLKITS = [
        {
            id: 'tool-checklist-danh-gia',
            title: 'Checklist đánh giá hiện trạng nhà máy',
            format: 'XLSX',
            desc: 'Mẫu checklist giúp bạn rà soát hiện trạng và xác định cơ hội cải tiến.',
            fileUrl: '#',
            fileName: 'Checklist-danh-gia-hien-trang.xlsx',
            fileSize: '1.2 MB',
            createdAt: '2026-10-10',
            downloads: 240,
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
            const data = JSON.parse(raw);
            return Array.isArray(data) && data.length > 0 ? data : DEFAULT_TOOLKITS;
        } catch (e) {
            console.warn('[ToolkitStore] Không thể đọc từ localStorage, dùng mặc định:', e);
            return DEFAULT_TOOLKITS;
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

    // Render HTML card cho trang resources.html
    function renderCardHTML(tool) {
        const fmt = (tool.format || 'PDF').toUpperCase();
        let badgeClass = 'fmt-pdf';
        if (fmt === 'XLSX' || fmt === 'XLS' || fmt === 'EXCEL') badgeClass = 'fmt-xlsx';
        else if (fmt === 'DOCX' || fmt === 'DOC' || fmt === 'WORD') badgeClass = 'fmt-docx';

        const hasDirectLink = tool.fileUrl && (tool.fileUrl.startsWith('http://') || tool.fileUrl.startsWith('https://') || tool.fileUrl.startsWith('data:'));
        const downloadHref = hasDirectLink ? tool.fileUrl : '#';
        const downloadAttr = tool.fileUrl && tool.fileUrl.startsWith('data:') ? `download="${tool.fileName || 'tai-lieu'}"` : `target="_blank" rel="noopener"`;

        return `
            <div class="tool-card-light" data-id="${tool.id}">
                <div class="tool-top-row">
                    <div class="tool-preview-box">
                        <div class="doc-line title"></div>
                        <div class="doc-line w-80"></div>
                        <div class="doc-line w-60"></div>
                        <div class="doc-line w-90"></div>
                    </div>
                    <div class="tool-header-content">
                        <span class="tool-format-badge ${badgeClass}" style="align-self: flex-start; margin-bottom: 6px;">${fmt}</span>
                        <h3 class="tool-title-light">${escapeHTML(tool.title)}</h3>
                    </div>
                </div>
                <p class="tool-desc-light">${escapeHTML(tool.desc || '')}</p>
                <a href="${downloadHref}" ${downloadAttr} class="tool-download-btn" onclick="INVAMAX_TOOLKIT_STORE.handleDownload('${tool.id}', event)">
                    <i data-lucide="download"></i> Tải xuống
                </a>
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
        getFileFromDB,
        getFileDownloadUrl,
        hasRealFile,
        initResourcesPage
    };
})();

// Tự động khởi chạy trên trang resources
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        if (document.querySelector('#toolkit .res-grid-4')) {
            INVAMAX_TOOLKIT_STORE.initResourcesPage();
        }
    });
}
