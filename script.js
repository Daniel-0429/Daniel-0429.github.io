// 1. 移动端导航栏切换
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// 2. 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        navLinks?.classList.remove('active');
        document.querySelector(this.getAttribute('href'))?.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 3. 滚动时导航栏样式变化
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar && window.scrollY > 50) {
        navbar.style.padding = '0.8rem 0';
    } else if (navbar) {
        navbar.style.padding = '1rem 0';
    }
});

// 4. 加载文章列表（核心：全链路容错，唯一版本）
async function loadArticles() {
    const articlesList = document.getElementById('articles-list');
    // 容错：确保容器存在
    if (!articlesList) return;

    try {
        // 读取JSON（加时间戳防缓存）
        const response = await fetch(`./data/articles.json?t=${Date.now()}`, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`请求失败：${response.status}`);

        const data = await response.json();
        // 容错：确保data.articles是数组
        const articles = Array.isArray(data?.articles) ? data.articles : [];

        // 渲染空列表
        if (articles.length === 0) {
            articlesList.innerHTML = '<p class="empty">暂无文章</p>';
            return;
        }

        // 渲染文章列表（每个字段全容错）
        articlesList.innerHTML = articles.map(article => {
            // 容错：tags必须是数组，否则显示空
            const tagsHtml = (article.tags && Array.isArray(article.tags)) 
                ? article.tags.map(tag => `<span class="tag">${tag || ''}</span>`).join('') 
                : '';
            // 容错：时间/标题/摘要/ID
            const createTime = article.createTime ? new Date(article.createTime).toLocaleDateString() : '未知时间';
            const title = article.title || '无标题';
            const desc = article.desc || '无摘要';
            const id = article.id || '';

            return `
                <div class="article-card">
                    <h3><a href="article.html?id=${id}">${title}</a></h3>
                    <p class="article-desc">${desc}</p>
                    <div class="article-meta">
                        <span>${createTime}</span>
                        <div class="article-tags">${tagsHtml}</div>
                    </div>
                    <a href="article.html?id=${id}" class="article-link">
                        <i class="fas fa-book"></i> 阅读全文
                    </a>
                </div>
            `;
        }).join('');

    } catch (err) {
        // 兜底提示+重试按钮
        articlesList.innerHTML = `<p class="error">加载失败：${err.message} <button onclick="loadArticles()">重试</button></p>`;
        console.error('文章列表加载错误：', err);
    }
}

// 5. 文章搜索功能（整合版，无重复，全容错）
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    // 容错：搜索控件不存在则退出
    if (!searchInput || !searchBtn) return;

    // 搜索核心逻辑
    const searchArticles = async () => {
        const keyword = searchInput.value.trim().toLowerCase();
        const articlesList = document.getElementById('articles-list');
        if (!articlesList) return;

        // 空关键词：重新加载全部文章
        if (!keyword) {
            loadArticles();
            return;
        }

        // 显示加载状态
        articlesList.innerHTML = '<div class="loading">搜索中...</div>';

        try {
            const response = await fetch(`./data/articles.json?t=${Date.now()}`, { cache: 'no-cache' });
            if (!response.ok) throw new Error(`请求失败：${response.status}`);

            const data = await response.json();
            const articles = Array.isArray(data?.articles) ? data.articles : [];

            // 过滤文章（支持标题/摘要/标签搜索，全容错）
            const filtered = articles.filter(article => {
                const title = (article.title || '').toLowerCase();
                const desc = (article.desc || '').toLowerCase();
                const tags = (article.tags && Array.isArray(article.tags)) 
                    ? article.tags.map(tag => (tag || '').toLowerCase()) 
                    : [];
                return title.includes(keyword) || desc.includes(keyword) || tags.some(tag => tag.includes(keyword));
            });

            // 无搜索结果
            if (filtered.length === 0) {
                articlesList.innerHTML = '<p class="no-articles">未找到相关文章</p>';
                return;
            }

            // 渲染搜索结果
            articlesList.innerHTML = filtered.map(article => {
                const tagsHtml = (article.tags && Array.isArray(article.tags)) 
                    ? article.tags.map(tag => `<span class="tag">${tag || ''}</span>`).join('') 
                    : '';
                const title = article.title || '无标题';
                const desc = article.desc || '无摘要';
                const id = article.id || '';
                return `
                    <div class="article-card">
                        <h3><a href="article.html?id=${id}">${title}</a></h3>
                        <p class="article-desc">${desc}</p>
                        <div class="article-tags">${tagsHtml}</div>
                        <a href="article.html?id=${id}" class="article-link">
                            <i class="fas fa-book"></i> 阅读全文
                        </a>
                    </div>
                `;
            }).join('');

        } catch (err) {
            articlesList.innerHTML = `<p class="error">搜索失败：${err.message} <button onclick="searchArticles()">重试</button></p>`;
            console.error('文章搜索错误：', err);
        }
    };

    // 绑定搜索事件（点击+回车）
    searchBtn.addEventListener('click', searchArticles);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchArticles();
    });
}

// 6. 页面初始化（唯一入口，无重复）
document.addEventListener('DOMContentLoaded', () => {
    loadArticles(); // 加载文章列表
    initSearch();   // 初始化搜索功能
});