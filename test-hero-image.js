const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
  let file = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (fs.existsSync(file) && !fs.statSync(file).isDirectory()) {
    const ext = path.extname(file);
    const ct = ext === '.html' ? 'text/html' : (ext === '.css' ? 'text/css' : (ext === '.js' ? 'application/javascript' : 'application/octet-stream'));
    res.writeHead(200, {'Content-Type': ct});
    res.end(fs.readFileSync(file));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8111, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9236',
    '--window-size=1366,768'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const target = await new Promise((res, rej) => {
    const req = http.request({
      host: '127.0.0.1',
      port: 9236,
      path: '/json/new?http://localhost:8111/vi/factory-assessment.html',
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

  // Test various styles
  const tests = [
    {
      name: 'test1_obj_pos_left',
      css: `
        .ifp-hero-bg-media { inset: 0 0 0 35% !important; }
        .ifp-hero-bg-img { object-position: 15% center !important; }
      `
    },
    {
      name: 'test2_obj_pos_0',
      css: `
        .ifp-hero-bg-media { inset: 0 0 0 32% !important; }
        .ifp-hero-bg-img { object-position: 0% center !important; }
      `
    },
    {
      name: 'test3_scale_shift',
      css: `
        .ifp-hero-bg-media { inset: 0 0 0 30% !important; overflow: hidden !important; }
        .ifp-hero-bg-img {
          width: 125% !important;
          max-width: none !important;
          object-fit: cover !important;
          object-position: left center !important;
          transform: translateX(10%) !important;
        }
      `
    },
    {
      name: 'test4_engineer_right_edge',
      css: `
        .ifp-hero-bg-media { inset: 0 0 0 30% !important; overflow: hidden !important; }
        .ifp-hero-bg-img {
          width: 135% !important;
          max-width: none !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: 20% center !important;
          transform: translateX(12%) !important;
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

    // Get hero bounding box
    const clip = await send('Runtime.evaluate', {
      expression: `(() => {
        const rect = document.querySelector('.ifp-hero').getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 1 };
      })()`,
      returnByValue: true
    });

    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: clip.result.value
    });

    const outPath = path.join(__dirname, `${t.name}.png`);
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Saved ${t.name}.png`);
  }

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
