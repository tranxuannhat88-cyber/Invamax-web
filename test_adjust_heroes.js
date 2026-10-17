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

server.listen(8140, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9265',
    '--window-size=1366,768'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  // Test capabilities.html
  {
    const target = await new Promise((res, rej) => {
      const req = http.request({
        host: '127.0.0.1',
        port: 9265,
        path: `/json/new?http://localhost:8140/vi/capabilities.html`,
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

    // Check default height of elements inside cap-hero
    const innerInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.cap-hero');
        const copy = document.querySelector('.cap-hero-copy');
        const visual = document.querySelector('.cap-hero-visual');
        return {
          heroH: hero.getBoundingClientRect().height,
          copyH: copy.getBoundingClientRect().height,
          visualH: visual.getBoundingClientRect().height
        };
      })()`,
      returnByValue: true
    });
    console.log('Capabilities elements:', innerInfo.value);

    // Test adjustment css
    const capCss = `
      .cap-hero {
        padding: 52px 0 0 !important;
        overflow: hidden !important;
      }
      .cap-hero-inner {
        min-height: 420px !important;
        max-height: 420px;
        align-items: center !important;
      }
      .cap-hero-desc {
        margin: 0 0 20px !important;
      }
      .cap-hero-copy h1 {
        margin: 0 0 12px !important;
      }
      .cap-hero-lead {
        margin: 0 0 12px !important;
      }
      .cycle-caption {
        margin-bottom: 10px !important;
      }
      .cycle-diagram {
        transform: scale(0.95);
        transform-origin: center center;
      }
    `;

    await send('Runtime.evaluate', {
      expression: `(() => {
        let el = document.createElement('style');
        el.textContent = ${JSON.stringify(capCss)};
        document.head.appendChild(el);
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    const adjustedCap = await send('Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.cap-hero');
        return { height: hero.getBoundingClientRect().height };
      })()`,
      returnByValue: true
    });
    console.log('Adjusted cap-hero height:', adjustedCap.value);

    // Take screenshot
    const clip = await send('Runtime.evaluate', {
      expression: `(() => {
        const rect = document.querySelector('.cap-hero').getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 1 };
      })()`,
      returnByValue: true
    });

    const shot = await send('Page.captureScreenshot', { format: 'png', clip: clip.value });
    fs.writeFileSync('test_cap_hero_472.png', Buffer.from(shot.data, 'base64'));

    ws.close();
  }

  // Test about.html
  {
    const target = await new Promise((res, rej) => {
      const req = http.request({
        host: '127.0.0.1',
        port: 9265,
        path: `/json/new?http://localhost:8140/vi/about.html`,
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

    const innerInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.ivp3-hero');
        const grid = document.querySelector('.ivp3-hero-grid');
        const copy = document.querySelector('.ivp3-hero-copy');
        return {
          heroH: hero.getBoundingClientRect().height,
          gridH: grid.getBoundingClientRect().height,
          copyH: copy.getBoundingClientRect().height
        };
      })()`,
      returnByValue: true
    });
    console.log('About elements:', innerInfo.value);

    const aboutCss = `
      .ivp3-hero {
        padding-top: 52px !important;
        padding-bottom: 0 !important;
        min-height: 472px !important;
        overflow: hidden !important;
      }
      .ivp3-hero-grid {
        min-height: 420px !important;
        align-items: center !important;
      }
      .ivp3-hero-copy {
        padding: 40px 0 36px !important;
      }
    `;

    await send('Runtime.evaluate', {
      expression: `(() => {
        let el = document.createElement('style');
        el.textContent = ${JSON.stringify(aboutCss)};
        document.head.appendChild(el);
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    const adjustedAbout = await send('Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.ivp3-hero');
        return { height: hero.getBoundingClientRect().height };
      })()`,
      returnByValue: true
    });
    console.log('Adjusted ivp3-hero height:', adjustedAbout.value);

    const clip = await send('Runtime.evaluate', {
      expression: `(() => {
        const rect = document.querySelector('.ivp3-hero').getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: 1 };
      })()`,
      returnByValue: true
    });

    const shot = await send('Page.captureScreenshot', { format: 'png', clip: clip.value });
    fs.writeFileSync('test_about_hero_472.png', Buffer.from(shot.data, 'base64'));

    ws.close();
  }

  chrome.kill();
  server.close();
  process.exit(0);
});
