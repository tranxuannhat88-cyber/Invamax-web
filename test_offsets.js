const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Restore original image first
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

server.listen(8119, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9244',
    '--window-size=1366,768'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const target = await new Promise((res, rej) => {
    const req = http.request({
      host: '127.0.0.1',
      port: 9244,
      path: '/json/new?http://localhost:8119/vi/factory-assessment.html',
      method: 'PUT'
    }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    });
    req.on('error', rej);
    req.end();
  });

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);
  await new Promise(r => setTimeout(r, 1000));

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

  // Test approaches:
  // Approach 1: Container from 0 to 100% or right-aligned image with right negative margin or transform
  // If .ifp-hero-bg-media has position: absolute; right: 0; top: 0; bottom: 0; width: ...
  // Or .ifp-hero-bg-img has width: auto; height: 100%; position: absolute; right: -140px / -160px / -180px;
  const tests = [
    {
      name: 'test_right_neg140',
      css: `
        .ifp-hero-bg-media {
          position: absolute;
          inset: 0 0 0 25%;
          overflow: hidden;
          z-index: 1;
        }
        .ifp-hero-bg-img {
          position: absolute;
          right: -135px;
          top: 0;
          height: 100%;
          width: auto;
          max-width: none;
        }
        .ifp-hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, 
            #061a1e 0%, 
            rgba(6, 26, 30, 0.95) 20%, 
            rgba(6, 26, 30, 0.50) 45%, 
            rgba(6, 26, 30, 0.10) 70%, 
            transparent 90%
          );
        }
      `
    },
    {
      name: 'test_right_neg170',
      css: `
        .ifp-hero-bg-media {
          position: absolute;
          inset: 0 0 0 25%;
          overflow: hidden;
          z-index: 1;
        }
        .ifp-hero-bg-img {
          position: absolute;
          right: -170px;
          top: 0;
          height: 100%;
          width: auto;
          max-width: none;
        }
        .ifp-hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, 
            #061a1e 0%, 
            rgba(6, 26, 30, 0.95) 20%, 
            rgba(6, 26, 30, 0.50) 45%, 
            rgba(6, 26, 30, 0.10) 70%, 
            transparent 90%
          );
        }
      `
    },
    {
      name: 'test_right_neg200',
      css: `
        .ifp-hero-bg-media {
          position: absolute;
          inset: 0 0 0 25%;
          overflow: hidden;
          z-index: 1;
        }
        .ifp-hero-bg-img {
          position: absolute;
          right: -200px;
          top: 0;
          height: 100%;
          width: auto;
          max-width: none;
        }
        .ifp-hero-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, 
            #061a1e 0%, 
            rgba(6, 26, 30, 0.95) 20%, 
            rgba(6, 26, 30, 0.50) 45%, 
            rgba(6, 26, 30, 0.10) 70%, 
            transparent 90%
          );
        }
      `
    }
  ];

  for (const t of tests) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        let el = document.getElementById('override-style');
        if (!el) { el = document.createElement('style'); el.id = 'override-style'; document.head.appendChild(el); }
        el.textContent = ${JSON.stringify(t.css)};
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

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

    fs.writeFileSync(t.name + '.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved', t.name);
  }

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
