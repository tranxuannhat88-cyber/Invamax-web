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

server.listen(8118, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9243',
    '--window-size=1366,768'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const target = await new Promise((res, rej) => {
    const req = http.request({
      host: '127.0.0.1',
      port: 9243,
      path: '/json/new?http://localhost:8118/vi/factory-assessment.html',
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

  const tests = [
    {
      name: 'comp_inset_45',
      css: '.ifp-hero-bg-media { inset: 0 0 0 45% !important; }'
    },
    {
      name: 'comp_inset_38',
      css: '.ifp-hero-bg-media { inset: 0 0 0 38% !important; }'
    },
    {
      name: 'comp_inset_32',
      css: '.ifp-hero-bg-media { inset: 0 0 0 32% !important; } .ifp-hero-bg-overlay { background: linear-gradient(90deg, #061a1e 0%, rgba(6, 26, 30, 0.95) 20%, rgba(6, 26, 30, 0.55) 45%, rgba(6, 26, 30, 0.1) 70%, transparent 90%) !important; }'
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
