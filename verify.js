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

server.listen(8109, async () => {
  const widths = [1024, 1280, 1440, 1920];

  for (const w of widths) {
    console.log(`\n=================== WIDTH ${w}px ===================`);
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const chrome = spawn(chromePath, [
      '--headless',
      '--disable-gpu',
      '--remote-debugging-port=9234',
      `--window-size=${w},800`
    ]);

    await new Promise(r => setTimeout(r, 1200));

    const pages = [
      { name: '1. Điều hành nhà máy (CHUẨN)', file: 'vi/operate-transform.html', sel: '.ivop-hero', mainSel: '.ivop-hero-main' },
      { name: '2. Tái cấu trúc & nâng cấp', file: 'vi/factory-transformation.html', sel: '.ivrs-hero', mainSel: '.ivrs-hero-main' },
      { name: '3. Nền tảng số (assessment)', file: 'vi/factory-assessment.html', sel: '.ifp-hero', mainSel: '.ifp-hero-main' }
    ];

    for (const p of pages) {
      const target = await new Promise((res, rej) => {
        const req = http.request({
          host: '127.0.0.1',
          port: 9234,
          path: '/json/new?http://localhost:8109/' + p.file,
          method: 'PUT'
        }, r => {
          let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
        });
        req.on('error', rej);
        req.end();
      });

      const ws = new WebSocket(target.webSocketDebuggerUrl);
      await new Promise((res) => ws.onopen = res);

      await new Promise(r => setTimeout(r, 600));

      const evalPromise = new Promise((resolve) => {
        ws.onmessage = (msg) => {
          const data = JSON.parse(msg.data);
          if (data.id === 1) resolve(data.result && data.result.result ? data.result.result.value : data);
        };
        const expr = `(() => {
          const hero = document.querySelector('${p.sel}');
          const main = document.querySelector('${p.mainSel}');
          return {
            heroHeight: hero ? hero.offsetHeight : null,
            mainHeight: main ? main.offsetHeight : null
          };
        })()`;
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: { expression: expr, returnByValue: true }
        }));
      });

      const result = await evalPromise;
      console.log(p.name + ': hero = ' + result.heroHeight + 'px, main = ' + result.mainHeight + 'px');
      ws.close();
    }

    chrome.kill();
    await new Promise(r => setTimeout(r, 400));
  }

  server.close();
  process.exit(0);
});
