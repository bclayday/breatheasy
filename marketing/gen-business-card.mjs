import puppeteer from 'puppeteer';
import { createWriteStream } from 'fs';

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();

// Standard business card: 3.5 x 2 inches at 300dpi = 1050 x 600px
await page.setViewport({ width: 1050, height: 600, deviceScaleFactor: 2 });

// FRONT
const front = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width:1050px; height:600px;
  background:#ffffff;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  position:relative; overflow:hidden;
  display:flex; flex-direction:row;
  align-items:stretch;
}
.left {
  flex:1;
  display:flex; flex-direction:column;
  justify-content:space-between;
  padding:55px 50px;
  position:relative;
}
.gradient-bar {
  position:absolute; top:0; left:0; right:0; height:6px;
  background:linear-gradient(90deg,#2196F3,#00BCD4,#4CAF50);
}
.logo-area {
  display:flex; align-items:center; gap:14px;
}
.logo-icon {
  width:54px; height:54px;
  background:linear-gradient(135deg,#2196F3,#00BCD4);
  border-radius:14px;
  display:flex; align-items:center; justify-content:center;
}
.logo-icon svg { width:30px; height:30px; fill:white; }
.brand-name {
  font-size:38px; font-weight:800;
  background:linear-gradient(135deg,#1565C0,#00838F);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  letter-spacing:-1px;
}
.tagline {
  font-size:17px; font-weight:500; color:#5a7a8a;
  margin-top:10px; line-height:1.4;
}
.service-tags {
  display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;
}
.tag {
  font-size:13px; font-weight:600; color:#1976D2;
  background:rgba(33,150,243,0.08);
  border:1px solid rgba(33,150,243,0.2);
  padding:5px 12px; border-radius:20px;
}
.contact { display:flex; flex-direction:column; gap:8px; }
.contact-item {
  display:flex; align-items:center; gap:8px;
  font-size:15px; color:#4a5568; font-weight:500;
}
.contact-item svg { width:16px; height:16px; fill:#2196F3; flex-shrink:0; }

.right {
  width:220px;
  background:linear-gradient(160deg,#f0f7ff,#e8f5f0);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:12px; padding:30px 20px;
  border-left:1px solid #e0e8f0;
}
.qr-placeholder {
  width:150px; height:150px;
  background:white;
  border-radius:10px;
  border:2px solid #e0e8f0;
  display:flex; align-items:center; justify-content:center;
  font-size:11px; color:#aaa;
  padding:8px;
}
.qr-placeholder img { width:100%; height:100%; object-fit:contain; }
.scan-text {
  font-size:11px; font-weight:700; color:#00838F;
  text-transform:uppercase; letter-spacing:1.5px;
}
.website {
  font-size:15px; font-weight:700; color:#1565C0;
}
</style></head>
<body>
<div class="left">
  <div class="gradient-bar"></div>
  <div>
    <div class="logo-area">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
      </div>
      <span class="brand-name">BreathEasy</span>
    </div>
    <div class="tagline">We don't just deliver your filter,<br>we install it. You never think about it again.</div>
    <div class="service-tags">
      <span class="tag">Air Filter Installation</span>
      <span class="tag">HVAC Maintenance</span>
    </div>
  </div>
  <div class="contact">
    <div class="contact-item">
      <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      Serving Greater Atlanta
    </div>
    <div class="contact-item">
      <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
      404-981-3457
    </div>
    <div class="contact-item">
      <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
      info@breatheasy.ac
    </div>
  </div>
</div>

<div class="right">
  <div class="qr-placeholder">
    <img src="qr-code.png" alt="QR">
  </div>
  <span class="scan-text">Scan to Book</span>
  <span class="website">breatheasy.ac</span>
</div>
</body></html>`;

await page.setContent(front, { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: '/Users/brucetaylor/Projects/breatheasy/marketing/business-card-front.png', type: 'png' });

// BACK
const back = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width:1050px; height:600px;
  background:linear-gradient(135deg,#1565C0 0%,#00838F 50%,#2E7D32 100%);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  position:relative; overflow:hidden;
  display:flex; flex-direction:column;
  justify-content:center; align-items:center;
  text-align:center; padding:60px;
}
.glow {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  width:700px; height:700px;
  background:radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%);
}
.content { position:relative; z-index:10; display:flex; flex-direction:column; align-items:center; gap:20px; }
.logo-row { display:flex; align-items:center; gap:14px; }
.logo-icon {
  width:56px; height:56px;
  background:rgba(255,255,255,0.2);
  border-radius:14px;
  display:flex; align-items:center; justify-content:center;
}
.logo-icon svg { width:30px; height:30px; fill:white; }
.brand { font-size:44px; font-weight:800; color:white; letter-spacing:-1px; }
.tagline { font-size:24px; font-weight:600; color:rgba(255,255,255,0.92); line-height:1.3; }
.divider { width:60px; height:2px; background:rgba(255,255,255,0.3); border-radius:2px; }
.services { font-size:17px; color:rgba(255,255,255,0.75); line-height:1.9; }
.location { font-size:13px; font-weight:700; color:rgba(255,255,255,0.55); text-transform:uppercase; letter-spacing:3px; }
</style></head>
<body>
<div class="glow"></div>
<div class="content">
  <div class="logo-row">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
    </div>
    <span class="brand">BreathEasy</span>
  </div>
  <div class="tagline">Amazon solves buying.<br>BreathEasy solves doing.</div>
  <div class="divider"></div>
  <div class="services">
    Air Filter Delivery &amp; Installation<br>
    HVAC Tune-Ups &amp; Maintenance
  </div>
  <div class="location">📍 Greater Atlanta, GA</div>
</div>
</body></html>`;

await page.setContent(back, { waitUntil: 'domcontentloaded' });
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: '/Users/brucetaylor/Projects/breatheasy/marketing/business-card-back.png', type: 'png' });

await browser.close();
console.log('Done! Front and back saved.');
