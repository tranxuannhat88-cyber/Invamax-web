/**
 * INVAMAX CASE STUDY STORE
 * Quản lý dữ liệu Case Study: Lưu trữ, Tải dữ liệu, Đồng bộ GitHub & Cập nhật website
 */

const INVAMAX_CASE_STUDY_STORE = (function () {
    const STORAGE_KEY = 'invamax_case_studies_v1';

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

    function getCategories(item) {
        if (!item) return [];
        if (Array.isArray(item.categories) && item.categories.length > 0) return item.categories;
        if (typeof item.category === 'string' && item.category.trim() !== '') {
            return item.category.split(',').map(s => s.trim()).filter(Boolean);
        }
        return ['Lean & Cải tiến'];
    }

    function getAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return DEFAULT_CASE_STUDIES;
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CASE_STUDIES;
        } catch (e) {
            console.warn('[CaseStudyStore] Lỗi đọc localStorage:', e);
            return DEFAULT_CASE_STUDIES;
        }
    }

    function saveAll(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            return true;
        } catch (e) {
            console.error('[CaseStudyStore] Lỗi ghi localStorage:', e);
            return false;
        }
    }

    function getById(id) {
        return getAll().find(item => item.id === id) || null;
    }

    function add(item) {
        const list = getAll();
        const id = item.id || ('cs-' + Date.now());
        const cats = Array.isArray(item.categories) && item.categories.length > 0 
            ? item.categories 
            : (item.category ? item.category.split(',').map(s => s.trim()).filter(Boolean) : ['Lean & Cải tiến']);
        const newItem = {
            id,
            badge: item.badge || ('CASE STUDY 0' + (list.length + 1)),
            categories: cats,
            category: cats.join(', '),
            title: item.title || 'Case Study mới',
            desc: item.desc || '',
            client: item.client || '',
            highlight: item.highlight || '',
            link: item.link || '#',
            thumbnail: item.thumbnail || '',
            pdfUrl: item.pdfUrl || item.fileUrl || '',
            fileUrl: item.fileUrl || item.pdfUrl || '',
            fileName: item.fileName || '',
            fileSize: item.fileSize || '',
            fileFormat: item.fileFormat || '',
            images: Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []),
            status: item.status || 'published',
            createdAt: item.createdAt || new Date().toISOString().split('T')[0],
            dateDisplay: item.dateDisplay || '',
            views: item.views || '1.2K lượt xem'
        };
        list.unshift(newItem);
        saveAll(list);
        return newItem;
    }

    function update(id, updatedFields) {
        const list = getAll();
        const index = list.findIndex(item => item.id === id);
        if (index === -1) return null;
        if (updatedFields.categories && Array.isArray(updatedFields.categories)) {
            updatedFields.category = updatedFields.categories.join(', ');
        } else if (updatedFields.category && typeof updatedFields.category === 'string') {
            updatedFields.categories = updatedFields.category.split(',').map(s => s.trim()).filter(Boolean);
        }
        
        // If fileUrl or pdfUrl is explicitly cleared
        if (updatedFields.pdfUrl === '' || updatedFields.fileUrl === '') {
            updatedFields.pdfUrl = '';
            updatedFields.fileUrl = '';
            updatedFields.fileName = '';
            updatedFields.fileFormat = '';
            updatedFields.fileSize = '';
        }

        list[index] = { ...list[index], ...updatedFields, updatedAt: new Date().toISOString().split('T')[0] };
        const saved = saveAll(list);
        return saved ? list[index] : null;
    }

    function remove(id) {
        const list = getAll().filter(item => item.id !== id);
        saveAll(list);
        return list;
    }

    async function fetchRemoteData() {
        try {
            const res = await fetch('assets/data/case-studies.json?t=' + Date.now());
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const localRaw = localStorage.getItem(STORAGE_KEY);
                    // Chỉ nạp và ghi đè localStorage nếu chưa có dữ liệu local
                    if (!localRaw) {
                        saveAll(data);
                    }
                    return data;
                }
            }
        } catch (e) {
            console.info('[CaseStudyStore] Chưa tải được remote case-studies.json, dùng dữ liệu local');
        }
        return null;
    }

    async function syncToGitHub(progressCallback = null) {
        if (!window.INVAMAX_GITHUB_SYNC || !window.INVAMAX_GITHUB_SYNC.isConfigured()) {
            return {
                success: false,
                skipped: true,
                message: 'Chưa cấu hình GitHub Token. Dữ liệu đã lưu tạm vào máy này.'
            };
        }

        const notify = (msg) => {
            if (typeof progressCallback === 'function') progressCallback(msg);
        };

        try {
            const listToSync = JSON.parse(JSON.stringify(getAll()));

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

            saveAll(listToSync);
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
        const list = getAll();
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
        saveAll(list);
        return list;
    }

    return {
        getAll,
        getById,
        getCategories,
        add,
        update,
        remove,
        move,
        fetchRemoteData,
        syncToGitHub,
        saveAll
    };
})();
