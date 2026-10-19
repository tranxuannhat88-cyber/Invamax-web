/**
 * INVAMAX GITHUB SYNC ENGINE
 * Đồng bộ tự động tài liệu và hình ảnh lên GitHub Repository (tranxuannhat88-cyber/Invamax-web)
 * Cho phép chỉnh sửa ở trang Admin và tự động cập nhật lên Website cho tất cả người dùng
 */

const INVAMAX_GITHUB_SYNC = (function () {
    const CONFIG_KEY = 'invamax_github_sync_config_v1';
    
    const DEFAULT_CONFIG = {
        owner: 'tranxuannhat88-cyber',
        repo: 'Invamax-web',
        branch: 'main',
        token: ''
    };

    function getConfig() {
        try {
            const raw = localStorage.getItem(CONFIG_KEY);
            return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG };
        } catch (e) {
            return { ...DEFAULT_CONFIG };
        }
    }

    function saveConfig(config) {
        const merged = { ...getConfig(), ...config };
        localStorage.setItem(CONFIG_KEY, JSON.stringify(merged));
        return merged;
    }

    function isConfigured() {
        const cfg = getConfig();
        return !!(cfg.token && cfg.token.trim().length > 10);
    }

    // Header cho GitHub REST API
    function getHeaders(token) {
        return {
            'Authorization': `Bearer ${token.trim()}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        };
    }

    // Kiểm tra kết nối với kho lưu trữ GitHub
    async function testConnection(customToken = null) {
        const cfg = getConfig();
        const token = customToken || cfg.token;
        if (!token) return { success: false, message: 'Chưa nhập GitHub Personal Access Token!' };

        try {
            const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}`, {
                headers: getHeaders(token)
            });

            if (res.status === 200) {
                const data = await res.json();
                const canPush = data.permissions ? data.permissions.push : true;
                return {
                    success: true,
                    message: `Kết nối thành công tới kho "${data.full_name}"!`,
                    repoName: data.full_name,
                    canPush: canPush
                };
            } else if (res.status === 401) {
                return { success: false, message: 'Token không hợp lệ hoặc đã hết hạn (Lỗi 401 Unauthorized).' };
            } else if (res.status === 404) {
                return { success: false, message: `Không tìm thấy kho "${cfg.owner}/${cfg.repo}" hoặc Token không có quyền truy cập kho riêng tư (Lỗi 404).` };
            } else {
                const err = await res.json().catch(() => ({}));
                return { success: false, message: err.message || `Lỗi GitHub API (Status: ${res.status})` };
            }
        } catch (e) {
            return { success: false, message: 'Lỗi mạng khi kết nối tới api.github.com: ' + e.message };
        }
    }

    // Lấy SHA của tệp hiện có trên GitHub
    async function getFileSha(path) {
        const cfg = getConfig();
        try {
            const cleanPath = path.replace(/^\/+/, '');
            const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cleanPath}?ref=${cfg.branch}`, {
                headers: getHeaders(cfg.token)
            });
            if (res.ok) {
                const data = await res.json();
                return data.sha || null;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    // Mã hóa UTF-8 sang Base64 chuẩn cho trình duyệt
    function utf8ToBase64(str) {
        return window.btoa(unescape(encodeURIComponent(str)));
    }

    // Commit hoặc cập nhật 1 tệp bất kỳ lên GitHub
    async function commitFile(path, contentBase64, commitMessage) {
        const cfg = getConfig();
        if (!cfg.token) throw new Error('Chưa thiết lập GitHub Token!');

        const cleanPath = path.replace(/^\/+/, '');
        const sha = await getFileSha(cleanPath);

        const payload = {
            message: commitMessage || `Update ${cleanPath} via INVAMAX Admin`,
            content: contentBase64,
            branch: cfg.branch
        };

        if (sha) {
            payload.sha = sha;
        }

        const res = await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cleanPath}`, {
            method: 'PUT',
            headers: getHeaders(cfg.token),
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Lỗi khi commit file ${cleanPath} (Status: ${res.status})`);
        }

        return await res.json();
    }

    // Commit file JSON
    async function commitJson(path, dataObject, commitMessage) {
        const jsonStr = JSON.stringify(dataObject, null, 2);
        const base64Content = utf8ToBase64(jsonStr);
        return await commitFile(path, base64Content, commitMessage);
    }

    // Tải lên tệp Data URL (File nhị phân PDF/Word/Excel hoặc Hình ảnh)
    async function uploadDataUrlFile(path, dataUrl, commitMessage) {
        let base64 = dataUrl;
        if (dataUrl.includes(';base64,')) {
            base64 = dataUrl.split(';base64,')[1];
        } else if (dataUrl.includes(',')) {
            base64 = dataUrl.split(',')[1];
        }
        return await commitFile(path, base64, commitMessage);
    }

    // Hàm chuyển đổi tên file tiếng Việt có dấu thành không dấu an toàn trên URL
    function slugifyFileName(fileName) {
        if (!fileName) return 'file-' + Date.now();
        const parts = fileName.split('.');
        const ext = parts.length > 1 ? '.' + parts.pop() : '';
        let base = parts.join('.');
        
        base = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        base = base.replace(/[đĐ]/g, 'd');
        base = base.replace(/[^a-zA-Z0-9_\-\s]/g, '');
        base = base.trim().replace(/\s+/g, '-');
        
        return base + ext;
    }

    /**
     * Đồng bộ toàn bộ dữ liệu Toolkit lên GitHub:
     * 1. Tải lên tệp đính kèm (nếu là file mới Base64) -> assets/docs/{fileName}
     * 2. Tải lên ảnh bìa (nếu là ảnh mới Base64) -> assets/images/resources/{thumbName}
     * 3. Commit tệp assets/data/toolkits.json
     */
    async function syncToolkitsToGitHub(toolkitsList, progressCallback = null) {
        if (!toolkitsList && window.INVAMAX_TOOLKIT_STORE) {
            toolkitsList = INVAMAX_TOOLKIT_STORE.getAll();
        }

        if (!isConfigured()) {
            return {
                success: false,
                skipped: true,
                message: 'Chưa cấu hình GitHub Token. Dữ liệu đã lưu tạm vào bộ nhớ máy này.'
            };
        }

        const notify = (msg) => {
            if (typeof progressCallback === 'function') progressCallback(msg);
        };

        try {
            const listToSync = JSON.parse(JSON.stringify(toolkitsList));

            // Quét từng item để upload tệp đính kèm và thumbnail nếu có Base64
            for (let i = 0; i < listToSync.length; i++) {
                const item = listToSync[i];

                // 1. Upload File đính kèm nếu là Base64 Data URL
                if (item.fileUrl && item.fileUrl.startsWith('data:')) {
                    const safeName = slugifyFileName(item.fileName || (item.title + '.' + (item.format || 'pdf').toLowerCase()));
                    const targetDocPath = `assets/docs/${safeName}`;
                    notify(`Đang tải tệp đính kèm lên GitHub: "${safeName}"...`);
                    
                    await uploadDataUrlFile(targetDocPath, item.fileUrl, `Upload document: ${safeName}`);
                    item.fileUrl = targetDocPath;
                }

                // 2. Upload Thumbnail nếu là Base64 Data URL
                if (item.thumbnail && item.thumbnail.startsWith('data:')) {
                    const safeThumbName = `thumb-${item.id || ('doc-' + Date.now())}.jpg`;
                    const targetThumbPath = `assets/images/resources/${safeThumbName}`;
                    notify(`Đang tải ảnh bìa lên GitHub: "${safeThumbName}"...`);
                    
                    await uploadDataUrlFile(targetThumbPath, item.thumbnail, `Upload document thumbnail: ${safeThumbName}`);
                    item.thumbnail = targetThumbPath;
                }
            }

            // 3. Commit tệp assets/data/toolkits.json
            notify('Đang cập nhật danh sách tài liệu vào kho GitHub...');
            const commitResult = await commitJson('assets/data/toolkits.json', listToSync, 'Update toolkits database from INVAMAX Admin portal');

            // 4. Đồng bộ Bài viết (Articles) nếu có store
            if (window.INVAMAX_TOOLKIT_STORE && typeof window.INVAMAX_TOOLKIT_STORE.getArticles === 'function') {
                const rawArticles = window.INVAMAX_TOOLKIT_STORE.getArticles();
                const articlesToSync = JSON.parse(JSON.stringify(rawArticles));
                for (let i = 0; i < articlesToSync.length; i++) {
                    const art = articlesToSync[i];
                    if (art.thumbnail && art.thumbnail.startsWith('data:')) {
                        const safeThumbName = `art-thumb-${art.id || ('art-' + Date.now())}.jpg`;
                        const targetThumbPath = `assets/images/resources/${safeThumbName}`;
                        notify(`Đang tải ảnh bìa bài viết lên GitHub: "${safeThumbName}"...`);
                        await uploadDataUrlFile(targetThumbPath, art.thumbnail, `Upload article thumbnail: ${safeThumbName}`);
                        art.thumbnail = targetThumbPath;
                    }
                }
                notify('Đang cập nhật danh sách bài viết vào kho GitHub...');
                await commitJson('assets/data/articles.json', articlesToSync, 'Update articles database from INVAMAX Admin portal');
                window.INVAMAX_TOOLKIT_STORE.saveArticles(articlesToSync);
            }

            // 5. Đồng bộ Video nếu có store
            if (window.INVAMAX_TOOLKIT_STORE && typeof window.INVAMAX_TOOLKIT_STORE.getVideos === 'function') {
                const rawVideos = window.INVAMAX_TOOLKIT_STORE.getVideos();
                const videosToSync = JSON.parse(JSON.stringify(rawVideos));
                for (let i = 0; i < videosToSync.length; i++) {
                    const vid = videosToSync[i];
                    if (vid.thumbnail && vid.thumbnail.startsWith('data:')) {
                        const safeThumbName = `vid-thumb-${vid.id || ('vid-' + Date.now())}.jpg`;
                        const targetThumbPath = `assets/images/resources/${safeThumbName}`;
                        notify(`Đang tải ảnh bìa video lên GitHub: "${safeThumbName}"...`);
                        await uploadDataUrlFile(targetThumbPath, vid.thumbnail, `Upload video thumbnail: ${safeThumbName}`);
                        vid.thumbnail = targetThumbPath;
                    }
                }
                notify('Đang cập nhật danh sách video vào kho GitHub...');
                await commitJson('assets/data/videos.json', videosToSync, 'Update videos database from INVAMAX Admin portal');
                window.INVAMAX_TOOLKIT_STORE.saveVideos(videosToSync);
            }

            return {
                success: true,
                message: 'Đã xuất bản toàn bộ Tri thức (Bài viết, Tài liệu, Video) lên GitHub thành công! Web sẽ tự động cập nhật trong 30-60 giây.',
                updatedList: listToSync,
                commit: commitResult
            };
        } catch (err) {
            console.error('[GitHubSync] Lỗi trong quá trình đồng bộ GitHub:', err);
            return {
                success: false,
                message: 'Lỗi khi đồng bộ lên GitHub: ' + err.message
            };
        }
    }

    return {
        getConfig,
        saveConfig,
        isConfigured,
        testConnection,
        commitFile,
        commitJson,
        uploadDataUrlFile,
        syncToolkitsToGitHub,
        slugifyFileName
    };
})();

if (typeof window !== 'undefined') {
    window.INVAMAX_GITHUB_SYNC = INVAMAX_GITHUB_SYNC;
}
