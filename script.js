// script.js
(function() {
    // ---------- 检测 HarmonyOS ----------
    const ua = navigator.userAgent || navigator.platform || '';
    if (ua.includes('HarmonyOS') || ua.includes('Harmony')) {
        document.getElementById('harmony-error').style.display = 'flex';
        document.getElementById('os-container').style.display = 'none';
        return; // 停止执行后续代码
    } else {
        document.getElementById('harmony-error').style.display = 'none';
        document.getElementById('os-container').style.display = 'block';
    }

    // ---------- 全局变量 ----------
    const desktopIcons = document.getElementById('desktop-icons');
    const wallpaperDiv = document.getElementById('wallpaper');
    const windowContainer = document.getElementById('app-window-container');
    const windowTitle = document.getElementById('window-title');
    const appIframe = document.getElementById('app-iframe');
    const closeBtn = document.getElementById('closeWindowBtn');

    // 应用列表 (名称, 图标, 对应文件/url, 类型: local/page 本地html或外部url)
    const apps = [
        { name: '电话', icon: '📞', file: 'phone.html', type: 'local' },
        { name: '短信', icon: '✉️', file: 'sms.html', type: 'local' },
        { name: '相机', icon: '📷', file: 'camera.html', type: 'local' },
        { name: '相册', icon: '🖼️', file: 'album.html', type: 'local' },
        { name: '地图', icon: '🗺️', file: 'map.html', type: 'local' },  // map.html 会嵌入百度地图
        { name: '日历', icon: '📅', file: 'calendar.html', type: 'local' },
        { name: 'App Store', icon: '🛍️', file: 'appstore.html', type: 'local' },
        { name: '设置', icon: '⚙️', file: 'settings.html', type: 'local' },
        { name: '提示', icon: '💡', file: 'hint.html', type: 'local' },
        { name: '天气预报', icon: '☁️', file: 'weather.html', type: 'local' },
        { name: '浏览器', icon: '🌐', file: 'browser.html', type: 'local' },
        { name: 'AI助手', icon: '🤖', file: 'ai.html', type: 'local' }
    ];

    // 动态绘制桌面图标
    function renderIcons() {
        desktopIcons.innerHTML = '';
        apps.forEach((app, index) => {
            const iconDiv = document.createElement('div');
            iconDiv.className = 'app-icon';
            iconDiv.dataset.index = index;
            iconDiv.dataset.name = app.name;
            iconDiv.dataset.file = app.file;
            iconDiv.dataset.type = app.type;
            iconDiv.setAttribute('aria-label', app.name);
            iconDiv.innerHTML = `
                <div class="icon-img">${app.icon}</div>
                <span class="app-label">${app.name}</span>
            `;
            iconDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                openApp(app);
            });
            desktopIcons.appendChild(iconDiv);
        });
    }

    // 打开应用 (展示窗口)
    function openApp(app) {
        let src = '';
        if (app.type === 'local') {
            src = app.file;  // 本地html文件
        } else {
            src = app.file;  // 也可以是外链
        }
        // 特殊情况：部分直接嵌入外部页面（已在file指定）
        appIframe.src = src;
        windowTitle.innerText = app.name;
        windowContainer.classList.remove('hidden');
        // 添加进入动画（已由CSS负责）
    }

    // 关闭窗口
    closeBtn.addEventListener('click', () => {
        // 关闭动画：先添加透明缩小，然后隐藏并清空src
        windowContainer.style.animation = 'none';
        windowContainer.offsetHeight; // 强制重绘
        windowContainer.style.transition = 'opacity 0.2s, transform 0.25s';
        windowContainer.style.opacity = '0';
        windowContainer.style.transform = 'scale(0.8)';
        setTimeout(() => {
            windowContainer.classList.add('hidden');
            windowContainer.style.opacity = '';
            windowContainer.style.transform = '';
            windowContainer.style.transition = '';
            appIframe.src = 'about:blank';  // 释放资源
        }, 250);
    });

    // 点击窗口外部不关闭(只有点X关闭)，但防止冒泡
    windowContainer.addEventListener('click', (e) => e.stopPropagation());

    // 实时时间更新
    function updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('live-time').innerText = timeStr;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // ---------- 设置通信 (监听来自settings.html的postMessage) ----------
    window.addEventListener('message', (event) => {
        // 简单验证来源 (因本地文件，origin可能为null，故根据数据内容)
        const data = event.data;
        if (!data || typeof data !== 'object') return;

        // 更换壁纸
        if (data.type === 'changeWallpaper') {
            const wallpaper = data.wallpaper; // 'default', 'dark', 'light', 'forest'
            switch (wallpaper) {
                case 'forest':
                    wallpaperDiv.style.backgroundImage = "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400')";
                    break;
                case 'light':
                    wallpaperDiv.style.backgroundImage = "url('https://images.unsplash.com/photo-1507525425510-1f2d3990b3f9?w=400')";
                    break;
                default:
                    wallpaperDiv.style.backgroundImage = ''; // 恢复默认
                    wallpaperDiv.style.backgroundColor = '#1a1e2b';
                    wallpaperDiv.style.backgroundImage = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMxYTFhMWEiLz48cGF0aCBkPSJNMjAgMTBhMTAgMTAgMCAwIDEgMCAyMCAxMCAxMCAwIDAgMSAwLTIweiIgZmlsbD0iIzJhMmEyYSIvPjwvc3ZnPg==')";
                    break;
            }
        }

        // 更换桌面布局
        if (data.type === 'changeLayout') {
            const layout = data.layout; // 'icons', 'start', 'tiles'
            const container = document.getElementById('desktop-icons');
            // 移除现有布局类
            container.classList.remove('layout-icons', 'layout-start', 'layout-tiles');
            if (layout === 'icons') container.classList.add('layout-icons');
            else if (layout === 'start') container.classList.add('layout-start');
            else if (layout === 'tiles') container.classList.add('layout-tiles');
        }
    });

    // 初始化渲染
    renderIcons();

    // 辅助：阻止页面滚动（避免拖拽）
    document.body.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    // 模拟通知：加载完成后小提示（可选）
    setTimeout(() => {
        console.log('✨ 幻界OS 已启动，享受丝滑动画 ✨');
    }, 500);
})();