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

server.listen(8135, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9260',
    '--window-size=1366,768'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const pages = [
    { url: '/vi/operate-transform.html', selector: '.ivop-hero', name: 'Dieu hanh nha may (Standard)' },
    { url: '/vi/capabilities.html', selector: '.hero-capabilities, .hero, header, section:first-of-type', name: 'Nang luc' },
    { url: '/vi/about.html', selector: '.hero-about, .hero, header, section:first-of-type', name: 'Triet ly INVAMAX' },
    { url: '/vi/platform.html', selector: '.ifp-hero', name: 'Nen tang so (platform.html)' },
    { url: '/vi/factory-assessment.html', selector: '.ifp-hero', name: 'Nen tang so (factory-assessment.html)' },
    { url: '/vi/factory-transformation.html', selector: '.ft-hero, .hero, main > section:first-of-type', name: 'Chuyen doi nha may' }
  ];

  for (const p of pages) {
    const target = await new Promise((res, rej) => {
      const req = http.request({
        host: '127.0.0.1',
        port: 9260,
        path: `/json/new?http://localhost:8135${p.url}`,
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
          resolve(data.result && data.result.result ? data.result.result : data.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

    const info = await send('Runtime.evaluate', {
      expression: `(() => {
        // Find hero element
        const candidates = ['.ivop-hero', '.ifp-hero', '.hero', 'section.hero', 'header.hero', 'main > section:first-of-type'];
        let heroEl = null;
        let matchedSel = '';
        for (const sel of candidates) {
          const el = document.querySelector(sel);
          if (el) { heroEl = el; matchedSel = sel; break; }
        }
        if (!heroEl) return { error: 'Not found' };
        const rect = heroEl.getBoundingClientRect();
        const style = window.getComputedStyle(heroEl);
        return {
          selector: matchedSel,
          tag: heroEl.tagName,
          className: heroEl.className,
          height: rect.height,
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom,
          minHeight: style.minHeight
        };
      })()`,
      returnByValue: true
    });

    console.log(`=== ${p.name} (${p.url}) ===:`, info.value);
    ws.close();
  }

  chrome.kill();
  server.close();
  process.exit(0);
});
