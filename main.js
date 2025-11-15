// 简心小说网站主要JavaScript功能

// 全局变量
let currentChapter = 1;
let isDarkMode = false;
let fontSize = 18;
let lineHeight = 1.8;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    loadUserSettings();
    setupEventListeners();
});

// 初始化网站
function initializeWebsite() {
    // 检查是否是首次访问
    if (!localStorage.getItem('hasVisited')) {
        showWelcomeMessage();
        localStorage.setItem('hasVisited', 'true');
    }
    
    // 设置滚动动画
    setupScrollAnimations();
    
    // 初始化阅读进度
    updateReadingProgress();
}

// 显示欢迎消息
function showWelcomeMessage() {
    setTimeout(() => {
        const welcome = document.createElement('div');
        welcome.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: rgba(250, 248, 243, 0.95); backdrop-filter: blur(10px);
                        padding: 2rem; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        z-index: 10000; text-align: center; max-width: 400px;
                        border: 1px solid rgba(139, 115, 85, 0.2);">
                <h3 style="color: #8b7355; margin-bottom: 1rem; font-family: 'Noto Serif SC', serif;">欢迎来到简心</h3>
                <p style="color: #6b5b73; margin-bottom: 1.5rem; line-height: 1.6;">
                    这是一个温暖人心的故事，关于成长、学术与情感。
                    希望您能在这里找到属于自己的感动。
                </p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: linear-gradient(135deg, #8b7355 0%, #a68b5b 100%);
                        color: white; border: none; padding: 0.8rem 2rem; border-radius: 25px;
                        cursor: pointer; font-family: 'Noto Sans SC', sans-serif;">
                    开始阅读
                </button>
            </div>
        `;
        document.body.appendChild(welcome);
    }, 1000);
}

// 设置滚动动画
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // 添加一些随机延迟，让动画更自然
                const delay = Math.random() * 0.3;
                entry.target.style.animationDelay = delay + 's';
            }
        });
    }, observerOptions);

    // 观察所有需要动画的元素
    document.querySelectorAll('.fade-in, .story-card, .chapter-card').forEach(el => {
        observer.observe(el);
    });
}

// 加载用户设置
function loadUserSettings() {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        
        if (settings.darkMode) {
            toggleDarkMode();
        }
        
        fontSize = settings.fontSize || 18;
        lineHeight = settings.lineHeight || 1.8;
        currentChapter = settings.lastChapter || 1;
    }
}

// 保存用户设置
function saveUserSettings() {
    const settings = {
        darkMode: isDarkMode,
        fontSize: fontSize,
        lineHeight: lineHeight,
        lastChapter: currentChapter,
        lastVisit: new Date().toISOString()
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

// 设置事件监听器
function setupEventListeners() {
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // 滚动事件
    window.addEventListener('scroll', handleScroll);
    
    // 窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 鼠标移动效果
    document.addEventListener('mousemove', handleMouseMove);
}

// 处理键盘快捷键
function handleKeyboardShortcuts(e) {
    // 只在阅读页面有效
    if (!document.querySelector('.main-content')) return;
    
    if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        previousChapter();
    } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        nextChapter();
    } else if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault();
        toggleSidebar();
    } else if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        toggleDarkMode();
    } else if (e.key === 'h' && e.ctrlKey) {
        e.preventDefault();
        showHelp();
    }
}

// 处理滚动事件
function handleScroll() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // 视差效果
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
    
    // 更新阅读进度
    updateReadingProgress();
    
    // 导航栏效果
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (scrolled > 100) {
            navbar.style.background = 'rgba(248, 246, 240, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(248, 246, 240, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
}

// 处理窗口大小变化
function handleResize() {
    // 重新计算布局
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (window.innerWidth <= 768) {
        if (sidebar && mainContent) {
            mainContent.classList.remove('sidebar-open');
        }
    }
}

// 处理鼠标移动效果
function handleMouseMove(e) {
    const cards = document.querySelectorAll('.story-card, .chapter-card');
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
}

// 更新阅读进度
function updateReadingProgress() {
    if (!document.querySelector('.main-content')) return;
    
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    // 保存阅读位置
    localStorage.setItem('readingProgress', scrollPercent.toString());
}

// 恢复阅读位置
function restoreReadingPosition() {
    const saved = localStorage.getItem('readingProgress');
    if (saved) {
        const scrollPercent = parseFloat(saved);
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollTop = (scrollPercent / 100) * docHeight;
        
        window.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
}

// 显示帮助信息
function showHelp() {
    const help = document.createElement('div');
    help.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(250, 248, 243, 0.98); backdrop-filter: blur(15px);
                    padding: 2rem; border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.15);
                    z-index: 10000; max-width: 500px; max-height: 80vh; overflow-y: auto;
                    border: 1px solid rgba(139, 115, 85, 0.2);">
            <h3 style="color: #8b7355; margin-bottom: 1.5rem; text-align: center;">快捷键帮助</h3>
            <div style="color: #6b5b73; line-height: 1.8;">
                <p><strong>Ctrl + ←</strong> - 上一章</p>
                <p><strong>Ctrl + →</strong> - 下一章</p>
                <p><strong>Ctrl + B</strong> - 切换目录</p>
                <p><strong>Ctrl + D</strong> - 切换深色模式</p>
                <p><strong>Ctrl + H</strong> - 显示帮助</p>
                <p><strong>Esc</strong> - 关闭弹窗</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: linear-gradient(135deg, #8b7355 0%, #a68b5b 100%);
                    color: white; border: none; padding: 0.8rem 2rem; border-radius: 25px;
                    cursor: pointer; display: block; margin: 1.5rem auto 0;">
                知道了
            </button>
        </div>
    `;
    document.body.appendChild(help);
}

// 添加一些装饰性效果
function addDecorativeEffects() {
    // 创建浮动粒子效果
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 1; overflow: hidden;
    `;
    document.body.appendChild(particleContainer);
    
    // 创建粒子
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute; width: 2px; height: 2px;
            background: rgba(139, 115, 85, 0.3); border-radius: 50%;
            animation: float ${5 + Math.random() * 10}s infinite linear;
            left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
        `;
        particleContainer.appendChild(particle);
    }
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        saveUserSettings();
    }
});

// 页面卸载前保存设置
window.addEventListener('beforeunload', function() {
    saveUserSettings();
});

// 添加页面加载动画
function addLoadingAnimation() {
    const loader = document.createElement('div');
    loader.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(135deg, #f8f6f0 0%, #e8e2d5 100%);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 10000; transition: opacity 0.5s ease;">
            <div style="text-align: center;">
                <div style="width: 60px; height: 60px; border: 3px solid rgba(139, 115, 85, 0.3);
                           border-top: 3px solid #8b7355; border-radius: 50%;
                           animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p style="color: #8b7355; font-family: 'Noto Serif SC', serif;">加载中...</p>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loader);
    
    // 页面加载完成后移除加载动画
    window.addEventListener('load', function() {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }, 1000);
    });
}

// 初始化加载动画
addLoadingAnimation();

// 添加装饰性效果
addDecorativeEffects();

// 导出一些函数供其他脚本使用
window.ReadingApp = {
    goToChapter,
    previousChapter,
    nextChapter,
    toggleSidebar,
    toggleSettings,
    toggleDarkMode,
    showHelp,
    restoreReadingPosition
};