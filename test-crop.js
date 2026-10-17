const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

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

server.listen(8115, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9240',
    '--window-size=1366,768'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const target = await new Promise((res, rej) => {
    const req = http.request({
      host: '127.0.0.1',
      port: 9240,
      path: '/json/new?http://localhost:8115/vi/factory-assessment.html',
      method: 'PUT'
    }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    });
    req.on('error', rej);
    req.end();
  });

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);
  await new Promise(r => setTimeout(r, 800));

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

  const testCases = [
    {
      name: 'render_crop875',
      src: '/crop_875.jpg',
      css: '.ifp-hero-bg-media { inset: 0 0 0 28% !important; } .ifp-hero-bg-img { width: 100% !important; height: 100% !important; object-fit: cover !important; object-position: right center !important; }'
    },
    {
      name: 'render_cropfocused',
      src: '/crop_focused.jpg',
      css: '.ifp-hero-bg-media { inset: 0 0 0 28% !important; } .ifp-hero-bg-img { width: 100% !important; height: 100% !important; object-fit: cover !important; object-position: right center !important; }'
    },
    {
      name: 'render_crop875_inset22',
      src: '/crop_875.jpg',
      css: '.ifp-hero-bg-media { inset: 0 0 0 22% !important; } .ifp-hero-bg-img { width: 100% !important; height: 100% !important; object-fit: cover !important; object-position: right center !important; }'
    }
  ];

  for (const tc of testCases) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        let img = document.querySelector('.ifp-hero-bg-img');
        img.src = ${JSON.stringify(tc.src)};
        let el = document.getElementById('override-style');
        if (!el) { el = document.createElement('style'); el.id = 'override-style'; document.head.appendChild(el); }
        el.textContent = ${JSON.stringify(tc.css)};
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

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

    fs.writeFileSync(tc.name + '.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved', tc.name);
  }

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
