/**
 * INVAMAX TOOLKIT & RESOURCES STORE
 * Quản lý dữ liệu tài liệu Toolkit: Lưu trữ, Tải file, Đồng bộ & Render
 */

var INVAMAX_TOOLKIT_STORE = (function () {
    const isEN = (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang === 'en') ||
                 (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/en/'));

    const STORAGE_KEY = isEN ? 'invamax_toolkits_en_v2' : 'invamax_toolkits_v2';
    const ARTICLES_STORAGE_KEY = isEN ? 'invamax_resources_articles_en_v4' : 'invamax_resources_articles_v4';
    const VIDEOS_STORAGE_KEY = isEN ? 'invamax_resources_videos_en_v1' : 'invamax_resources_videos_v1';
    const SETTINGS_KEY = 'invamax_admin_settings_v1';

    // Dữ liệu mặc định tiếng Anh
    const DEFAULT_TOOLKITS_EN = [
        {
                "id": "tool-huong-dan-giam-chi-phi",
                "title": "Manufacturing Cost Reduction Guide",
                "format": "PDF",
                "desc": "Comprehensive guide on factory cost-reduction methodology:\\n- Cost structure definition.\\n- Waste identification & elimination.\\n- Sustainable cost optimization.",
                "fileUrl": "idb:tool-huong-dan-giam-chi-phi",
                "fileName": "INVAMAX_Manufacturing_Cost_Reduction_Guide.pdf",
                "fileSize": "9.28 MB",
                "createdAt": "2026-10-05",
                "downloads": 311,
                "status": "published",
                "thumbnail": "assets/images/resources/thumb-tool-huong-dan-giam-chi-phi.jpg",
                "updatedAt": "2026-10-19T02:54:02.295Z"
        },
        {
                "id": "tool-checklist-danh-gia",
                "title": "Lean & Effective 5S Implementation Guide",
                "format": "PDF",
                "desc": "Practical step-by-step guidebook to deploy, standardize, and sustain 5S successfully on your factory floor.",
                "fileUrl": "assets/docs/IVM-Huong-dan-thuc-hien-5S-Tinh-gon-Hieu-qua.pdf",
                "fileName": "IVM - Lean & Effective 5S Implementation Guide.pdf",
                "fileSize": "6.16 MB",
                "thumbnail": "assets/images/resources/thumb-5s-guide.jpg",
                "createdAt": "2026-10-10",
                "downloads": 242,
                "status": "published"
        },
        {
                "id": "tool-ke-hoach-lean-a3",
                "title": "A3 Report - Structured Lean Problem-Solving Template",
                "format": "XLSX",
                "desc": "Standard Toyota-aligned 7-step A3 template for structured root-cause problem solving, planning, and Kaizen execution.",
                "fileUrl": "assets/docs/INVAMAX_A3_Report_7_Buoc_Editable.xlsx",
                "fileName": "INVAMAX_A3_Report_7_Steps_Editable.xlsx",
                "fileSize": "0.17 MB",
                "createdAt": "2026-10-08",
                "downloads": 185,
                "status": "published",
                "thumbnail": "assets/images/resources/thumb-tool-ke-hoach-lean-a3.jpg",
                "updatedAt": "2026-10-19T07:52:44.410Z"
        },
        {
                "id": "tool-bieu-mau-oee",
                "title": "OEE Tracking & Analysis Template",
                "format": "XLSX",
                "desc": "Standard spreadsheet template for tracking, analyzing, and reporting Overall Equipment Effectiveness in production.",
                "fileUrl": "assets/docs/INVAMAX_OEE_Tracking_Dashboard.xlsx",
                "fileName": "INVAMAX_OEE_Tracking_Dashboard.xlsx",
                "fileSize": "0.05 MB",
                "createdAt": "2026-10-01",
                "downloads": 295,
                "status": "published",
                "thumbnail": "assets/images/resources/thumb-tool-bieu-mau-oee.jpg",
                "updatedAt": "2026-10-19T08:43:46.474Z"
        }
];
    const DEFAULT_ARTICLES_EN = [
        {
                "id": "art-hieu-ve-lean",
                "title": "Understanding Lean Manufacturing in 10 Minutes",
                "category": "Lean & Improvement",
                "excerpt": "Lean is not just about waste elimination. It is an operational mindset and system design philosophy enabling factories to generate greater customer value with fewer resources.",
                "thumbnail": "assets/images/resources/lean-manufacturing-framework.jpg",
                "dateDisplay": "Oct 23, 2026",
                "views": "1.8K views",
                "link": "en/article-hieu-ve-lean-manufacturing.html",
                "status": "published",
                "createdAt": "2026-10-23"
        },

        {
                "id": "art-5-buoc-lean",
                "title": "5 Steps to Implement Lean Effectively in Manufacturing",
                "category": "Lean & Improvement",
                "excerpt": "Practical shopfloor insights from Lean deployment projects, helping manufacturers boost productivity and eliminate waste sustainably.",
                "thumbnail": "assets/images/resources/art-5steps.jpg",
                "dateDisplay": "Oct 12, 2026",
                "views": "2.4K views",
                "link": "en/article-5-buoc-trien-khai-lean.html",
                "status": "published",
                "createdAt": "2026-10-12"
        },
        {
                "id": "art-chi-so-oee",
                "title": "OEE Metric: How to Measure and Improve Equipment Effectiveness",
                "category": "Factory Management",
                "excerpt": "Demystifying OEE calculations, loss categorization, and proven steps to systematically boost equipment performance.",
                "thumbnail": "assets/images/resources/art-oee.jpg",
                "dateDisplay": "Oct 10, 2026",
                "views": "1.8K views",
                "link": "en/article-chi-so-oee.html",
                "status": "published",
                "createdAt": "2026-10-10"
        },
        {
                "id": "art-ung-dung-ai",
                "title": "Applying AI in Manufacturing: Opportunities and Implementation Roadmap",
                "category": "Digital & AI",
                "excerpt": "Real-world industrial AI use cases in quality, scheduling, and predictive maintenance with a tailored roadmap for enterprises.",
                "thumbnail": "assets/images/resources/ai-hero-conveyor.jpg?v=4",
                "dateDisplay": "Oct 08, 2026",
                "views": "1.6K views",
                "link": "en/article-ung-dung-ai.html",
                "status": "published",
                "createdAt": "2026-10-08"
        },
        {
                "id": "art-10-co-hoi-giam-chi-phi",
                "title": "10 Immediate Cost-Reduction Opportunities for Factories",
                "category": "Cost Down",
                "excerpt": "Actionable, high-impact cost down solutions that can be executed in 3–6 months based on actual manufacturing turnaround cases.",
                "thumbnail": "assets/images/resources/art-cost-10opp.jpg?v=2",
                "dateDisplay": "Oct 05, 2026",
                "views": "2.1K views",
                "link": "en/article-10-co-hoi-giam-chi-phi.html",
                "status": "published",
                "createdAt": "2026-10-05"
        }
];
    const DEFAULT_VIDEOS_EN = [
        {
                "id": "vid-lean-intro-12p",
                "title": "Introduction to Lean Manufacturing in 12 Minutes",
                "thumbnail": "assets/images/resources/vid-intro.jpg",
                "duration": "12:34",
                "views": "32K views",
                "timeAgo": "2 weeks ago",
                "videoUrl": "https://youtube.com/@invamax?si=5aj2VVcbw5KCaFhI",
                "status": "published",
                "createdAt": "2026-10-05"
        },
        {
                "id": "vid-5-loi-thuong-gap",
                "title": "5 Common Pitfalls When Implementing Kaizen in Factories",
                "thumbnail": "assets/images/resources/vid-mistakes.jpg",
                "duration": "18:20",
                "views": "24K views",
                "timeAgo": "3 weeks ago",
                "videoUrl": "https://youtube.com/@invamax?si=5aj2VVcbw5KCaFhI",
                "status": "published",
                "createdAt": "2026-09-28"
        },
        {
                "id": "vid-ai-du-bao-san-xuat",
                "title": "AI Applications in Manufacturing Demand & Scheduling",
                "thumbnail": "assets/images/resources/vid-ai-pred.jpg",
                "duration": "15:10",
                "views": "18K views",
                "timeAgo": "1 month ago",
                "videoUrl": "https://youtube.com/@invamax?si=5aj2VVcbw5KCaFhI",
                "status": "published",
                "createdAt": "2026-09-19"
        },
        {
                "id": "vid-xay-dung-cost-down",
                "title": "How to Build a Sustainable Cost Down Governance System",
                "thumbnail": "assets/images/resources/vid-costdown-sys.jpg",
                "duration": "10:45",
                "views": "21K views",
                "timeAgo": "1 month ago",
                "videoUrl": "https://youtube.com/@invamax?si=5aj2VVcbw5KCaFhI",
                "status": "published",
                "createdAt": "2026-09-15"
        }
];

    // Dữ liệu mặc định 4 tài liệu gốc tiếng Việt
    const DEFAULT_TOOLKITS_VI = [
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

    // Dữ liệu mặc định 4 bài viết mới & tiêu biểu tiếng Việt
    const DEFAULT_ARTICLES_VI = [
        {
            id: 'art-hieu-ve-lean',
            title: 'Hiểu về Lean Manufacturing trong 10 phút',
            category: 'Lean & Cải tiến',
            excerpt: 'Lean không chỉ là loại bỏ lãng phí. Đó là phương pháp tư duy và tổ chức vận hành giúp nhà máy tạo ra nhiều giá trị hơn với ít nguồn lực hơn.',
            thumbnail: 'assets/images/resources/lean-manufacturing-framework.jpg',
            dateDisplay: '23 thg 10, 2026',
            views: '1.8K lượt xem',
            link: 'vi/article-hieu-ve-lean-manufacturing.html',
            status: 'published',
            createdAt: '2026-10-23'
        },

        {
            id: 'art-5-buoc-lean',
            title: '5 bước triển khai Lean hiệu quả tại nhà máy sản xuất',
            category: 'Lean & Cải tiến',
            excerpt: 'Hướng dẫn thực tế từ các dự án triển khai Lean, giúp doanh nghiệp cải thiện năng suất và giảm lãng phí bền vững.',
            thumbnail: 'assets/images/resources/art-5steps.jpg?v=7',
            dateDisplay: '12 thg 10, 2026',
            views: '2.4K lượt xem',
            link: 'vi/article-5-buoc-trien-khai-lean.html',
            status: 'published',
            createdAt: '2026-10-12'
        },
        {
            id: 'art-chi-so-oee',
            title: 'Chỉ số OEE: Cách đo lường và cải thiện hiệu quả thiết bị',
            category: 'Quản trị nhà máy',
            excerpt: 'Hiểu đúng về OEE và các bước triển khai cải tiến hiệu quả trong nhà máy.',
            thumbnail: 'assets/images/resources/art-oee.jpg',
            dateDisplay: '10 thg 10, 2026',
            views: '1.8K lượt xem',
            link: 'vi/article-chi-so-oee.html',
            status: 'published',
            createdAt: '2026-10-10'
        },
        {
            id: 'art-ung-dung-ai',
            title: 'Ứng dụng AI trong sản xuất: Cơ hội và lộ trình triển khai',
            category: 'Digital & AI',
            excerpt: 'Những ứng dụng thực tế của AI trong sản xuất và gợi ý lộ trình phù hợp cho doanh nghiệp Việt Nam.',
            thumbnail: 'assets/images/resources/ai-hero-conveyor.jpg?v=4',
            dateDisplay: '8 thg 10, 2026',
            views: '1.6K lượt xem',
            link: 'vi/article-ung-dung-ai.html',
            status: 'published',
            createdAt: '2026-10-08'
        },
        {
            id: 'art-10-co-hoi-giam-chi-phi',
            title: '10 cơ hội giảm chi phí sản xuất nhanh chóng',
            category: 'Cost Down',
            excerpt: 'Những giải pháp cost down có thể triển khai trong 3–6 tháng, dựa trên các dự án thực tế.',
            thumbnail: 'assets/images/resources/art-cost-10opp.jpg?v=2',
            dateDisplay: '5 thg 10, 2026',
            views: '2.1K lượt xem',
            link: 'vi/article-10-co-hoi-giam-chi-phi.html',
            status: 'published',
            createdAt: '2026-10-05'
        }
    ];

    // Dữ liệu mặc định 4 video học nhanh tiếng Việt
    const DEFAULT_VIDEOS_VI = [
        {
            id: 'vid-lean-intro-12p',
            title: 'Giới thiệu Lean Manufacturing trong 12 phút',
            thumbnail: 'assets/images/resources/vid-intro.jpg',
            duration: '12:34',
            views: '32K lượt xem',
            timeAgo: '2 tuần trước',
            videoUrl: 'https://youtube.com/@invamax?si=5aj2VVcbw5KCaFhI',
            status: 'published',
            createdAt: '2026-10-05'
        },
        {
            id: 'vid-5-loi-thuong-gap',
            title: '5 lỗi thường gặp khi triển khai cải tiến tại nhà máy',
            thumbnail: 'assets/images/resources/vid-mistakes.jpg',
            duration: '18:20',
            views: '24K lượt xem',
            timeAgo: '3 tuần trước',
            videoUrl: 'https://youtube.com/@invamax?si=5aj2VVcbw5KCaFhI',
            status: 'published',
            createdAt: '2026-09-28'
        },
        {
            id: 'vid-ai-du-bao-san-xuat',
            title: 'Ứng dụng AI trong dự báo sản xuất',
            thumbnail: 'assets/images/resources/vid-ai-pred.jpg',
            duration: '15:10',
            views: '18K lượt xem',
            timeAgo: '1 tháng trước',
            videoUrl: 'https://youtube.com/@invamax?si=5aj2VVcbw5KCaFhI',
            status: 'published',
            createdAt: '2026-09-19'
        },
        {
            id: 'vid-xay-dung-cost-down',
            title: 'Cách xây dựng hệ thống Cost Down bền vững',
            thumbnail: 'assets/images/resources/vid-costdown-sys.jpg',
            duration: '10:45',
            views: '21K lượt xem',
            timeAgo: '1 tháng trước',
            videoUrl: 'https://youtube.com/@invamax?si=5aj2VVcbw5KCaFhI',
            status: 'published',
            createdAt: '2026-09-15'
        }
    ];

    const DEFAULT_TOOLKITS = isEN ? DEFAULT_TOOLKITS_EN : DEFAULT_TOOLKITS_VI;
    const DEFAULT_ARTICLES = isEN ? DEFAULT_ARTICLES_EN : DEFAULT_ARTICLES_VI;
    const DEFAULT_VIDEOS = isEN ? DEFAULT_VIDEOS_EN : DEFAULT_VIDEOS_VI;

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

            // In English mode, purge any stale Vietnamese items
            if (isEN && data.some(it => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(it.title || ''))) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TOOLKITS));
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

    // Kiểm tra kích thước chiều rộng thực tế của ảnh (để phát hiện ảnh thumbnail cũ bị mờ < 1200px)
    function getImageNaturalWidth(src) {
        return new Promise((resolve) => {
            if (!src || typeof src !== 'string') return resolve(0);
            const img = new Image();
            img.onload = () => resolve(img.naturalWidth || img.width || 0);
            img.onerror = () => resolve(0);
            img.src = src;
        });
    }

    // Trích xuất ảnh trang 1 của file PDF thực tế làm Thumbnail bằng PDF.js ở độ phân giải Ultra-HD (2000px)
    async function generatePdfThumbnail(pdfSource, targetWidth = 2000) {
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
            // Đảm bảo độ phân giải cực nét (tối thiểu 2000px chiều ngang hoặc scale >= 2.8x)
            const desiredWidth = Math.max(targetWidth || 2000, 2000);
            const scale = Math.max(desiredWidth / unscaledViewport.width, 2.8);
            const viewport = page.getViewport({ scale: scale });

            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext('2d', { alpha: false });

            // Đổ nền trắng tinh khiết để chữ, biểu đồ và bảng số liệu sắc nét tối đa
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            await page.render({
                canvasContext: ctx,
                viewport: viewport,
                intent: 'display'
            }).promise;

            const thumbData = canvas.toDataURL('image/jpeg', 0.95);
            return thumbData;
        } catch (err) {
            console.warn('[ToolkitStore] Lỗi trích xuất thumbnail PDF trang 1:', err);
            return null;
        }
    }

    // Tự động kiểm tra, sinh mới và nâng cấp độ nét Ultra-HD cho các thumbnail PDF bị mờ (< 1200px)
    async function autoGenerateMissingThumbnails() {
        if (!window.pdfjsLib) return;
        try {
            const items = getAll();
            let hasChanged = false;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const isPdf = (item.format || '').toUpperCase() === 'PDF' || (item.fileName && item.fileName.toLowerCase().endsWith('.pdf')) || (item.fileUrl && item.fileUrl.toLowerCase().endsWith('.pdf'));

                if (!isPdf) continue;

                if (item.thumbSource === 'custom') continue;

                let needsRegen = !item.thumbnail;
                if (!needsRegen && item.thumbnail && item.thumbnail.startsWith('data:image/')) {
                    const currentW = await getImageNaturalWidth(item.thumbnail);
                    if (currentW > 0 && currentW <= 280) {
                        needsRegen = true;
                    }
                }

                if (needsRegen) {
                    let fileData = item.fileUrl;
                    if (fileData && fileData.startsWith('idb:')) {
                        fileData = await getFileFromDB(item.id);
                    }
                    if (fileData && (fileData.startsWith('data:') || fileData.endsWith('.pdf'))) {
                        const resolvedSource = fileData.startsWith('data:') ? fileData : resolveAssetUrl(fileData);
                        const thumb = await generatePdfThumbnail(resolvedSource, 2000);
                        if (thumb) {
                            item.thumbnail = thumb;
                            item.thumbSource = 'pdf-auto';
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

    // Di chuyển tài liệu lên hoặc xuống
    function move(id, direction) {
        let items = getAll();
        const idx = items.findIndex(t => t.id === id);
        if (idx === -1) return null;
        if (direction === 'up' && idx > 0) {
            const temp = items[idx];
            items[idx] = items[idx - 1];
            items[idx - 1] = temp;
        } else if (direction === 'down' && idx < items.length - 1) {
            const temp = items[idx];
            items[idx] = items[idx + 1];
            items[idx + 1] = temp;
        }
        saveAll(items);
        return items;
    }

    // Di chuyển tài liệu đến vị trí chỉ định
    function moveToIndex(id, targetIndex) {
        let items = getAll();
        const fromIdx = items.findIndex(t => t.id === id);
        if (fromIdx === -1) return null;
        const clampedTarget = Math.max(0, Math.min(items.length - 1, Number(targetIndex)));
        if (fromIdx === clampedTarget) return items;
        const [movedItem] = items.splice(fromIdx, 1);
        items.splice(clampedTarget, 0, movedItem);
        saveAll(items);
        return items;
    }

    // Sắp xếp lại tài liệu theo danh sách IDs
    function reorderByIds(orderedIds) {
        if (!Array.isArray(orderedIds) || orderedIds.length === 0) return null;
        let items = getAll();
        const map = new Map(items.map(it => [it.id, it]));
        const reordered = [];
        orderedIds.forEach(id => {
            if (map.has(id)) {
                reordered.push(map.get(id));
                map.delete(id);
            }
        });
        map.forEach(item => reordered.push(item));
        saveAll(reordered);
        return reordered;
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
        if (isInSubdir) {
            if (url.startsWith('assets/')) return '../' + url;
            if (url.startsWith('vi/')) return url.substring(3);
            if (url.startsWith('en/')) return url.substring(3);
        }
        return url;
    }

    // Render HTML card cho trang insights.html
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
            <div class="tool-thumb-box" onclick="INVAMAX_TOOLKIT_STORE.handlePreview('${tool.id}', event)" title="${isEN ? 'Click to preview document' : 'Bấm để xem trước tài liệu'}">
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
                        <i data-lucide="eye"></i> ${isEN ? 'Preview' : 'Xem tài liệu'}
                    </button>
                    <a href="${downloadHref}" ${downloadAttr} class="tool-download-btn" onclick="INVAMAX_TOOLKIT_STORE.handleDownload('${tool.id}', event)">
                        <i data-lucide="download"></i> ${isEN ? 'Download' : 'Tải xuống'}
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

    // Tải dữ liệu chính thức từ assets/data/toolkits.json, articles.json, videos.json trên server
    async function fetchRemoteData() {
        const toolkitsFile = isEN ? 'assets/data/toolkits-en.json' : 'assets/data/toolkits.json';
        const articlesFile = isEN ? 'assets/data/articles-en.json' : 'assets/data/articles.json';
        const videosFile = isEN ? 'assets/data/videos-en.json' : 'assets/data/videos.json';

        try {
            const dataUrl = resolveAssetUrl(toolkitsFile) + '?t=' + Date.now();
            const res = await fetch(dataUrl);
            if (res.ok) {
                const remoteItems = await res.json();
                if (Array.isArray(remoteItems) && remoteItems.length > 0) {
                    saveAll(remoteItems);
                }
            }
        } catch (e) {
            console.warn('[ToolkitStore] Không thể tải ' + toolkitsFile + ':', e);
        }

        try {
            const artUrl = resolveAssetUrl(articlesFile) + '?t=' + Date.now();
            const resArt = await fetch(artUrl);
            if (resArt.ok) {
                const remoteArticles = await resArt.json();
                if (Array.isArray(remoteArticles) && remoteArticles.length > 0) {
                    saveArticles(remoteArticles);
                }
            }
        } catch (e) {
            console.warn('[ToolkitStore] Không thể tải ' + articlesFile + ':', e);
        }

        try {
            const vidUrl = resolveAssetUrl(videosFile) + '?t=' + Date.now();
            const resVid = await fetch(vidUrl);
            if (resVid.ok) {
                const remoteVideos = await resVid.json();
                if (Array.isArray(remoteVideos) && remoteVideos.length > 0) {
                    saveVideos(remoteVideos);
                }
            }
        } catch (e) {
            console.warn('[ToolkitStore] Không thể tải ' + videosFile + ':', e);
        }

        return getAll();
    }

    // ========================================================
    // QUẢN LÝ BÀI VIẾT MỚI & TIÊU BIỂU (ARTICLES)
    // ========================================================
    function getArticles() {
        try {
            const raw = localStorage.getItem(ARTICLES_STORAGE_KEY);
            if (!raw) {
                saveArticles(DEFAULT_ARTICLES);
                return DEFAULT_ARTICLES;
            }
            let parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                saveArticles(DEFAULT_ARTICLES);
                return DEFAULT_ARTICLES;
            }

            if (isEN && parsed.some(it => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(it.title || ''))) {
                saveArticles(DEFAULT_ARTICLES);
                return DEFAULT_ARTICLES;
            }

            // Sync with DEFAULT_ARTICLES: always ensure all built-in articles exist
            let needsUpdate = false;
            for (let i = DEFAULT_ARTICLES.length - 1; i >= 0; i--) {
                const def = DEFAULT_ARTICLES[i];
                if (!parsed.some(a => a.id === def.id)) {
                    parsed.unshift(def);
                    needsUpdate = true;
                }
            }
            if (needsUpdate) {
                saveArticles(parsed);
            }

            return parsed;
        } catch (e) {
            return DEFAULT_ARTICLES;
        }
    }

    function saveArticles(list) {
        if (!Array.isArray(list)) return [];
        localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(list));
        return list;
    }

    function saveArticle(item) {
        if (!item || !item.id) return null;
        let list = getArticles();
        const idx = list.findIndex(a => a.id === item.id);
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...item };
        } else {
            list.unshift(item);
        }
        return saveArticles(list);
    }

    function deleteArticle(id) {
        let list = getArticles();
        list = list.filter(a => a.id !== id);
        saveArticles(list);
        return true;
    }

    function moveArticle(id, direction) {
        let list = getArticles();
        const idx = list.findIndex(a => a.id === id);
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
        return saveArticles(list);
    }

    function moveArticleToIndex(id, targetIndex) {
        let list = getArticles();
        const fromIdx = list.findIndex(a => a.id === id);
        if (fromIdx === -1) return null;
        const clampedTarget = Math.max(0, Math.min(list.length - 1, Number(targetIndex)));
        if (fromIdx === clampedTarget) return list;
        const [movedItem] = list.splice(fromIdx, 1);
        list.splice(clampedTarget, 0, movedItem);
        return saveArticles(list);
    }

    function resetArticlesToDefault() {
        return saveArticles(DEFAULT_ARTICLES);
    }

    function renderArticleCardHTML(art) {
        const thumb = resolveAssetUrl(art.thumbnail || 'assets/images/resources/art-5steps.jpg');
        let artLink = art.link || (isEN ? 'en/articles.html' : 'vi/articles.html');
        if (isEN && artLink.startsWith('vi/')) {
            artLink = 'en/' + artLink.substring(3);
        } else if (!isEN && artLink.startsWith('en/')) {
            artLink = 'vi/' + artLink.substring(3);
        }
        const link = resolveAssetUrl(artLink);

        let dateDisplay = art.dateDisplay || '';
        if (isEN && dateDisplay.includes('thg ')) {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            dateDisplay = dateDisplay.replace(/(\d+)\s+thg\s+(\d+),\s+(\d+)/, (m, d, mo, y) => {
                return (months[parseInt(mo, 10)-1] || mo) + ' ' + d + ', ' + y;
            });
        }
        let viewsText = art.views || '';
        if (isEN && viewsText.includes('lượt xem')) {
            viewsText = viewsText.replace('lượt xem', 'views');
        }

        const categoryText = art.category || (isEN ? 'Insights' : 'Tri thức');

        return `
            <a href="${link}" class="art-card-light" data-id="${escapeHTML(art.id)}">
                <div class="art-thumb-wrap">
                    <img src="${thumb}" alt="${escapeHTML(art.title)}" loading="lazy">
                    <span class="art-tag-badge-solid">${escapeHTML(categoryText)}</span>
                </div>
                <div class="art-body-light">
                    <h3 class="art-title-light">${escapeHTML(art.title)}</h3>
                    <p class="art-excerpt-light">${escapeHTML(art.excerpt || '')}</p>
                    <div class="art-meta-footer-light">
                        <div class="art-meta-left">
                            <span class="art-meta-item"><i data-lucide="calendar" style="width: 12px; height: 12px;"></i> ${escapeHTML(dateDisplay)}</span>
                            <span class="art-meta-item"><i data-lucide="eye" style="width: 12px; height: 12px;"></i> ${escapeHTML(viewsText)}</span>
                        </div>
                        <span class="art-arrow-btn" aria-hidden="true"><i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i></span>
                    </div>
                </div>
            </a>
        `;
    }

    // ========================================================
    // QUẢN LÝ VIDEO HỌC NHANH (VIDEOS)
    // ========================================================
    function getVideos() {
        try {
            const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
            if (!raw) {
                saveVideos(DEFAULT_VIDEOS);
                return DEFAULT_VIDEOS;
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_VIDEOS;

            if (isEN && parsed.some(it => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(it.title || ''))) {
                saveVideos(DEFAULT_VIDEOS);
                return DEFAULT_VIDEOS;
            }
            return parsed;
        } catch (e) {
            return DEFAULT_VIDEOS;
        }
    }

    function saveVideos(list) {
        if (!Array.isArray(list)) return [];
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(list));
        return list;
    }

    function saveVideo(item) {
        if (!item || !item.id) return null;
        let list = getVideos();
        const idx = list.findIndex(v => v.id === item.id);
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...item };
        } else {
            list.unshift(item);
        }
        return saveVideos(list);
    }

    function deleteVideo(id) {
        let list = getVideos();
        list = list.filter(v => v.id !== id);
        saveVideos(list);
        return true;
    }

    function moveVideo(id, direction) {
        let list = getVideos();
        const idx = list.findIndex(v => v.id === id);
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
        return saveVideos(list);
    }

    function moveVideoToIndex(id, targetIndex) {
        let list = getVideos();
        const fromIdx = list.findIndex(v => v.id === id);
        if (fromIdx === -1) return null;
        const clampedTarget = Math.max(0, Math.min(list.length - 1, Number(targetIndex)));
        if (fromIdx === clampedTarget) return list;
        const [movedItem] = list.splice(fromIdx, 1);
        list.splice(clampedTarget, 0, movedItem);
        return saveVideos(list);
    }

    function resetVideosToDefault() {
        return saveVideos(DEFAULT_VIDEOS);
    }

    function renderVideoCardHTML(vid) {
        const thumb = resolveAssetUrl(vid.thumbnail || 'assets/images/resources/vid-intro.jpg');
        let viewsText = vid.views || (isEN ? '0 views' : '0 lượt xem');
        if (isEN && viewsText.includes('lượt xem')) {
            viewsText = viewsText.replace('lượt xem', 'views');
        }
        let timeAgoText = vid.timeAgo || '';
        if (isEN) {
            timeAgoText = timeAgoText.replace('tuần trước', 'weeks ago').replace('tháng trước', 'months ago');
        }

        return `
            <div class="vid-card-light" data-id="${escapeHTML(vid.id)}" style="cursor: default;">
                <div class="vid-thumb-wrap">
                    <img src="${thumb}" alt="${escapeHTML(vid.title)}" loading="lazy">
                    <div class="vid-play-btn-circle" style="pointer-events: none;"><i data-lucide="play"></i></div>
                    ${vid.duration ? `<span class="vid-duration-pill">${escapeHTML(vid.duration)}</span>` : ''}
                </div>
                <div class="vid-body-light">
                    <h3 class="vid-title-light">${escapeHTML(vid.title)}</h3>
                    <div class="vid-meta-footer-light">
                        <span class="vid-meta-item"><i data-lucide="play-circle" style="width: 12px; height: 12px;"></i> ${escapeHTML(viewsText)}</span>
                        <span class="vid-meta-item"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${escapeHTML(timeAgoText)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================================================
    // PHÂN TRANG (PAGINATION) TRÊN TRANG TRI THỨC (RESOURCES.HTML)
    // ==========================================================================
    const PAGE_SIZE = 4;
    let articlesCurrentPage = 1;
    let toolkitsCurrentPage = 1;
    let videosCurrentPage = 1;

    function renderPaginationHTML(totalItems, currentPage, pageSize, changePageFnName) {
        if (totalItems <= 0) return '';
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        
        let html = '<div class="res-pagination-wrap">';
        
        // Nút lùi (Trang trước)
        const prevDisabled = currentPage <= 1 ? 'disabled' : '';
        const prevClick = currentPage > 1 ? `onclick="${changePageFnName}(${currentPage - 1})"` : '';
        html += `<button type="button" class="res-page-btn res-page-prev" ${prevDisabled} ${prevClick} aria-label="${isEN ? 'Previous page' : 'Trang trước'}" title="${isEN ? 'Previous page' : 'Trang trước'}"><i data-lucide="chevron-left"></i></button>`;
        
        // Danh sách số trang
        let pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages = [1, 2, 3, 4, 5, '...', totalPages];
            } else if (currentPage >= totalPages - 3) {
                pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
            }
        }
        
        pages.forEach(p => {
            if (p === '...') {
                html += '<span class="res-page-dots">...</span>';
            } else {
                const activeClass = p === currentPage ? 'active' : '';
                const clickAttr = p !== currentPage ? `onclick="${changePageFnName}(${p})"` : '';
                html += `<button type="button" class="res-page-btn res-page-num ${activeClass}" ${clickAttr} aria-label="${(isEN ? 'Page ' : 'Trang ') + p}">${p}</button>`;
            }
        });
        
        // Nút tiến (Trang sau)
        const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
        const nextClick = currentPage < totalPages ? `onclick="${changePageFnName}(${currentPage + 1})"` : '';
        html += `<button type="button" class="res-page-btn res-page-next" ${nextDisabled} ${nextClick} aria-label="${isEN ? 'Next page' : 'Trang sau'}" title="${isEN ? 'Next page' : 'Trang sau'}"><i data-lucide="chevron-right"></i></button>`;
        
        html += '</div>';
        return html;
    }

    function renderArticlesSection(page = articlesCurrentPage, shouldScroll = false) {
        const artGrid = document.querySelector('#articles .res-grid-4');
        const artPag = document.getElementById('articles-pagination');
        if (!artGrid) return;

        const publishedArticles = getArticles().filter(a => a.status !== 'draft');
        const totalPages = Math.max(1, Math.ceil(publishedArticles.length / PAGE_SIZE));
        articlesCurrentPage = Math.max(1, Math.min(page, totalPages));

        const startIdx = (articlesCurrentPage - 1) * PAGE_SIZE;
        const pageItems = publishedArticles.slice(startIdx, startIdx + PAGE_SIZE);

        if (pageItems.length > 0) {
            artGrid.innerHTML = pageItems.map(renderArticleCardHTML).join('');
        } else {
            artGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 30px 0;">Chưa có bài viết nào.</p>';
        }

        if (artPag) {
            artPag.innerHTML = renderPaginationHTML(publishedArticles.length, articlesCurrentPage, PAGE_SIZE, 'INVAMAX_TOOLKIT_STORE.changeArticlesPage');
        }

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        if (shouldScroll) {
            const sec = document.getElementById('articles');
            if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function changeArticlesPage(page) {
        renderArticlesSection(page, true);
    }

    function renderToolkitsSection(page = toolkitsCurrentPage, shouldScroll = false) {
        const toolGrid = document.querySelector('#toolkit .res-grid-4');
        const toolPag = document.getElementById('toolkit-pagination');
        if (!toolGrid) return;

        const publishedTools = getAll().filter(t => t.status !== 'draft');
        const totalPages = Math.max(1, Math.ceil(publishedTools.length / PAGE_SIZE));
        toolkitsCurrentPage = Math.max(1, Math.min(page, totalPages));

        const startIdx = (toolkitsCurrentPage - 1) * PAGE_SIZE;
        const pageItems = publishedTools.slice(startIdx, startIdx + PAGE_SIZE);

        if (pageItems.length > 0) {
            toolGrid.innerHTML = pageItems.map(renderCardHTML).join('');
        } else {
            toolGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 30px 0;">Chưa có tài liệu nào.</p>';
        }

        if (toolPag) {
            toolPag.innerHTML = renderPaginationHTML(publishedTools.length, toolkitsCurrentPage, PAGE_SIZE, 'INVAMAX_TOOLKIT_STORE.changeToolkitPage');
        }

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        if (shouldScroll) {
            const sec = document.getElementById('toolkit');
            if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function changeToolkitPage(page) {
        renderToolkitsSection(page, true);
    }

    function renderVideosSection(page = videosCurrentPage, shouldScroll = false) {
        const vidGrid = document.querySelector('#video .res-grid-4');
        const vidPag = document.getElementById('video-pagination');
        if (!vidGrid) return;

        const publishedVideos = getVideos().filter(v => v.status !== 'draft');
        const totalPages = Math.max(1, Math.ceil(publishedVideos.length / PAGE_SIZE));
        videosCurrentPage = Math.max(1, Math.min(page, totalPages));

        const startIdx = (videosCurrentPage - 1) * PAGE_SIZE;
        const pageItems = publishedVideos.slice(startIdx, startIdx + PAGE_SIZE);

        if (pageItems.length > 0) {
            vidGrid.innerHTML = pageItems.map(renderVideoCardHTML).join('');
        } else {
            vidGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 30px 0;">Chưa có video nào.</p>';
        }

        if (vidPag) {
            vidPag.innerHTML = renderPaginationHTML(publishedVideos.length, videosCurrentPage, PAGE_SIZE, 'INVAMAX_TOOLKIT_STORE.changeVideosPage');
        }

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        if (shouldScroll) {
            const sec = document.getElementById('video');
            if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function changeVideosPage(page) {
        renderVideosSection(page, true);
    }

    // Khởi tạo và đồng bộ hiển thị lên trang insights.html
    async function initResourcesPage() {
        // 1. Render Articles với phân trang
        renderArticlesSection(1, false);

        // 2. Render Toolkit với phân trang
        renderToolkitsSection(1, false);

        // 3. Render Videos với phân trang
        renderVideosSection(1, false);

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        // 4. Tải ngầm dữ liệu mới nhất từ server/GitHub và cập nhật
        await fetchRemoteData();

        renderArticlesSection(articlesCurrentPage, false);
        renderToolkitsSection(toolkitsCurrentPage, false);
        renderVideosSection(videosCurrentPage, false);

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    return {
        getAll,
        saveAll,
        saveItem,
        deleteItem,
        move,
        moveToIndex,
        reorderByIds,
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
        resolveAssetUrl,
        fetchRemoteData,
        // Pagination API
        renderPaginationHTML,
        renderArticlesSection,
        changeArticlesPage,
        renderToolkitsSection,
        changeToolkitPage,
        renderVideosSection,
        changeVideosPage,
        // Articles API
        getArticles,
        saveArticles,
        saveArticle,
        deleteArticle,
        moveArticle,
        moveArticleToIndex,
        resetArticlesToDefault,
        renderArticleCardHTML,
        // Videos API
        getVideos,
        saveVideos,
        saveVideo,
        deleteVideo,
        moveVideo,
        moveVideoToIndex,
        resetVideosToDefault,
        renderVideoCardHTML
    };
})();

if (typeof window !== 'undefined') {
    window.INVAMAX_TOOLKIT_STORE = INVAMAX_TOOLKIT_STORE;
}

// Tự động khởi chạy trên trang resources
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        if (document.querySelector('#toolkit .res-grid-4') || document.querySelector('#articles .res-grid-4') || document.querySelector('#video .res-grid-4')) {
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
