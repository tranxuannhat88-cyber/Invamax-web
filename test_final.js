const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Restore original image
fs.copyFileSync(
  path.join(__dirname, 'assets/platform/hero-engineer-monitor-orig.jpg'),
  path.join(__dirname, 'assets/platform/hero-engineer-monitor.jpg')
);

const server = http.createServer((req, res) => {
  const reqPath = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  let file = path.join(__dirname, reqPath);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (fs.existsSync(file) && !fs.statSync(file).isDirectory()) {
    const ext = path.extname(file);
    const ct = ext === '.html' ? 'text/html' : (ext === '.css' ? 'text/css' : (ext === '.js' ? 'application/javascript' : (ext === '.jpg' ? 'image/jpeg' : 'application/octet-stream')));
    res.writeHead(200, {'Content-Type': ct});
    res.end(fs.readFileSync(file));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8122, async () => {
  const css = `
    .ifp-hero-bg-media {
      position: absolute !important;
      inset: 0 !important;
      overflow: hidden !important;
      z-index: 1 !important;
    }
    .ifp-hero-bg-img {
      position: absolute !important;
      right: -165px !important;
      top: 0 !important;
      height: 100% !important;
      width: auto !important;
      max-width: none !important;
      display: block !important;
    }
    .ifp-hero-bg-overlay {
      position: absolute !important;
      inset: 0 !important;
      background: linear-gradient(90deg, 
        #061a1e 0%, 
        #061a1e 32%, 
        rgba(6, 26, 30, 0.92) 42%, 
        rgba(6, 26, 30, 0.45) 58%, 
        transparent 78%
      ) !important;
    }
    @media (max-width: 991px) {
      .ifp-hero-bg-media {
        inset: 0 !important;
        opacity: 0.28 !important;
      }
      .ifp-hero-bg-img {
        position: relative !important;
        right: auto !important;
        top: auto !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center right !important;
      }
    }
  `;

  const viewports = [
    { w: 1920, h: 1080, name: 'final_1920' },
    { w: 1366, h: 768, name: 'final_1366' },
    { w: 768, h: 1024, name: 'final_768' },
    { w: 375, h: 667, name: 'final_375' }
  ];

  for (const vp of viewports) {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
      '--headless',
      '--disable-gpu',
      '--remote-debugging-port=9247',
      `--window-size=${vp.w},${vp.h}`
    ]);

    await new Promise(r => setTimeout(r, 1000));

    const target = await new Promise((res, rej) => {
      const req = http.request({
        host: '127.0.0.1',
        port: 9247,
        path: '/json/new?http://localhost:8122/vi/factory-assessment.html',
        method: 'PUT'
      }, r => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
      });
      req.on('error', rej);
      req.end();
    });

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(res => ws.onopen = res);
    await new Promise(r => setTimeout(r, 600));

    let msgId = 1;
    const send = (method, params = {}) => new Promise(resolve => {
      const id = ++msgId;
      const handler = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id === id) {
          ws.removeEventListener('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send('Runtime.evaluate', {
      expression: `(() => {
        let el = document.getElementById('override-style');
        if (!el) { el = document.createElement('style'); el.id = 'override-style'; document.head.appendChild(el); }
        el.textContent = ${JSON.stringify(css)};
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const clip = await send('Runtime.evaluate', {
      expression: `(() => {
        const rect = document.querySelector('.ifp-hero').getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 1 };
      })()`,
      returnByValue: true
    });

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: clip.value
    });

    fs.writeFileSync(vp.name + '.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved', vp.name);

    ws.close();
    chrome.kill();
    await new Promise(r => setTimeout(r, 300));
  }

  server.close();
  process.exit(0);
});
