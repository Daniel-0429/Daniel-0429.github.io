// 移动端导航栏切换
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        navLinks?.classList.remove('active');
        document.querySelector(this.getAttribute('href'))?.scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 滚动时导航栏样式变化
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar && window.scrollY > 50) {
        navbar.style.padding = '0.8rem 0';
    } else if (navbar) {
        navbar.style.padding = '1rem 0';
    }
});

// 加载文章列表
async function loadArticles() {
    const articlesList = document.getElementById('articles-list');
    if (!articlesList) return;

    articlesList.innerHTML = '<div class="loading">加载最新文章中...</div>';
    try {
        // 读取最新的文章数据（禁用缓存）
        const response = await fetch(`./data/articles.json?t=${Date.now()}`, { cache: 'no-cache' });
        const data = await response.json();
        const articles = data.articles || [];

        if (articles.length === 0) {
            articlesList.innerHTML = '<p class="no-articles">暂无文章，敬请期待...</p>';
            return;
        }

        // 渲染文章列表
        articlesList.innerHTML = articles.map(article => `
            <div class="article-card">
                <h3>${article.title}</h3>
                <p class="article-desc">${article.desc}</p>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="article.html?id=${article.id}" class="article-link">
                    <i class="fas fa-book"></i> 阅读全文
                </a>
            </div>
        `).join('');
    } catch (err) {
        articlesList.innerHTML = `<p class="error">加载失败：${err.message} <button onclick="loadArticles()">重试</button></p>`;
    }
}

// 文章搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    if (!searchInput || !searchBtn) return;

    const searchArticles = async () => {
        const keyword = searchInput.value.trim().toLowerCase();
        const articlesList = document.getElementById('articles-list');
        if (!keyword) {
            loadArticles();
            return;
        }

        articlesList.innerHTML = '<div class="loading">搜索中...</div>';
        try {
            const response = await fetch(`./data/articles.json?t=${Date.now()}`, { cache: 'no-cache' });
            const data = await response.json();
            const articles = data.articles || [];

            const filtered = articles.filter(article => 
                article.title.toLowerCase().includes(keyword) || 
                article.desc.toLowerCase().includes(keyword) ||
                article.tags.some(tag => tag.toLowerCase().includes(keyword))
            );

            if (filtered.length === 0) {
                articlesList.innerHTML = '<p class="no-articles">未找到相关文章</p>';
                return;
            }

            articlesList.innerHTML = filtered.map(article => `
                <div class="article-card">
                    <h3>${article.title}</h3>
                    <p class="article-desc">${article.desc}</p>
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <a href="article.html?id=${article.id}" class="article-link">
                        <i class="fas fa-book"></i> 阅读全文
                    </a>
                </div>
            `).join('');
        } catch (err) {
            articlesList.innerHTML = `<p class="error">搜索失败：${err.message}</p>`;
        }
    };

    searchBtn.addEventListener('click', searchArticles);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchArticles();
    });
}

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    initSearch();
});