/* =====================================================================
   HIỆU ỨNG CHUYỂN ĐỘNG
   Tách chữ tiêu đề, đếm số, băng chữ chạy, ảnh mở bằng clip-path,
   parallax nhẹ khi cuộn. Mọi trạng thái ẩn đều do file này gắn class,
   nên tắt JS thì trang vẫn hiện đủ nội dung.
   ===================================================================== */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var small = matchMedia('(max-width: 760px)');
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------
     1. TÁCH CHỮ
     --------------------------------------------------------------- */

  /* tiêu đề hero: từng ký tự trượt lên, lệch nhịp 30ms */
  function splitChars(el, start, step, wave) {
    if (el.dataset.sp) return 0;
    var text = el.textContent;
    el.dataset.sp = '1';
    el.textContent = '';
    var n = 0;
    text.split('').forEach(function (ch) {
      if (ch === ' ') { el.appendChild(document.createTextNode(' ')); return; }
      var mask = document.createElement('span'); mask.className = 'sp-mask';
      var inner = document.createElement('span'); inner.className = 'sp-ch';
      inner.textContent = ch;
      /* wave: ký tự chẵn lẻ lệch nhau cho lên so le như bục trao giải */
      mask.style.setProperty('--d', (start + n * step + (wave && n % 2 ? 95 : 0)) + 'ms');
      mask.appendChild(inner);
      el.appendChild(mask);
      n++;
    });
    return n;
  }

  /* Tách theo từ, không theo ký tự. Mỗi ký tự một khối riêng thì máy có
     quyền xuống dòng ở giữa tên — màn hình hẹp đọc ra "VĂN HÓA & TH /
     Ể THAO". Gói trọn từ vào một khối thì chỉ còn xuống dòng ở dấu cách. */
  function splitWords(el, start, step) {
    if (el.dataset.sp) return 0;
    var words = el.textContent.split(/(\s+)/);
    el.dataset.sp = '1';
    el.textContent = '';
    var n = 0;
    words.forEach(function (w) {
      if (!w) return;
      if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(' ')); return; }
      var mask = document.createElement('span'); mask.className = 'sp-mask';
      var inner = document.createElement('span'); inner.className = 'sp-ch';
      inner.textContent = w;
      mask.style.setProperty('--d', (start + n * step) + 'ms');
      mask.appendChild(inner);
      el.appendChild(mask);
      n++;
    });
    return n;
  }

  /* tiêu đề mục: gom theo dòng thật rồi cho từng dòng trượt lên.
     Phải đo offsetTop của từng từ vì số dòng đổi theo bề ngang màn hình. */
  function splitLines(el, step) {
    var text = el.dataset.spText || el.textContent.trim();
    if (!text) return;
    el.dataset.spText = text;

    el.textContent = '';
    var probes = text.split(/\s+/).map(function (w, i, arr) {
      var s = document.createElement('span');
      s.textContent = w;
      s.style.display = 'inline-block';
      el.appendChild(s);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });

    var lines = [], top = null;
    probes.forEach(function (s) {
      if (top === null || Math.abs(s.offsetTop - top) > 2) { lines.push([]); top = s.offsetTop; }
      lines[lines.length - 1].push(s.textContent);
    });

    el.textContent = '';
    lines.forEach(function (words, i) {
      var mask = document.createElement('span'); mask.className = 'sp-mask sp-mask-line';
      var inner = document.createElement('span'); inner.className = 'sp-line-in';
      inner.textContent = words.join(' ');
      mask.style.setProperty('--d', (i * step) + 'ms');
      mask.appendChild(inner);
      el.appendChild(mask);
    });
  }

  /* Mọi tiêu đề mục đều tách theo DÒNG rồi trượt lên. Tách theo ký tự thì
     mỗi con chữ thành một inline-block và trình duyệt được phép ngắt dòng
     giữa hai cái, nên ở màn hẹp tiêu đề vỡ giữa từ. */
  function splitHeading(h) {
    splitLines(h, 90);
    return true;
  }

  function initHeroTitle() {
    var h1 = $('.hero h1');
    if (!h1 || h1.dataset.spDone) return;
    h1.dataset.spDone = '1';
    var l1 = $('.l1', h1), l2 = $('.l2', h1);
    /* dòng trên chữ nhỏ, luôn nằm gọn một dòng nên tách từng ký tự được;
       dòng tên ngày hội chữ to, phải tách theo từ kẻo gãy giữa tên */
    var n = l1 ? splitChars(l1, 0, 30) : 0;
    if (l2) splitWords(l2, n * 30 + 140, 85);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { h1.classList.add('sp-go'); });
    });
  }

  /* ---------------------------------------------------------------
     2. ĐẾM SỐ
     --------------------------------------------------------------- */
  function countUp(el) {
    var to = parseFloat(el.dataset.countup);
    if (!isFinite(to)) return;
    var dur = 1100, t0 = 0;
    function frame(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 4);          /* expo.out */
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    el.textContent = '0';
    requestAnimationFrame(frame);
  }

  /* đồng hồ đếm ngược tự nhảy mỗi giây, nên chỉ chạy số một lần đầu */
  function initCountdown() {
    var box = $('#countdown');
    if (!box || box.dataset.cnt) return;
    var nums = $$('.u b', box);
    if (!nums.length) return;
    box.dataset.cnt = '1';
    nums.forEach(function (b) {
      var v = parseInt(b.textContent, 10);
      if (!isFinite(v)) return;
      b.dataset.countup = v;
      countUp(b);
    });
  }

  /* ---------------------------------------------------------------
     3. ẢNH: MỞ BẰNG CLIP-PATH + PARALLAX
     --------------------------------------------------------------- */
  var pxLayers = [];

  function prepImage(frame) {
    if (frame.dataset.rv) return;
    if (!frame.firstElementChild) return;
    frame.dataset.rv = '1';
    frame.classList.add('img-rv');
    var layer = document.createElement('span');
    layer.className = 'px-layer';
    while (frame.firstChild) layer.appendChild(frame.firstChild);
    frame.appendChild(layer);
    if (!small.matches) pxLayers.push(layer);
  }

  function parallax() {
    if (small.matches) return;
    var vh = innerHeight, i, l, r;
    for (i = 0; i < pxLayers.length; i++) {
      l = pxLayers[i]; r = l.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      /* -1 khi khung còn ở đáy màn hình, 1 khi đã trôi hết lên trên */
      var k = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      l.style.transform = 'translate3d(0,' + (k * 14).toFixed(2) + 'px,0)';
    }
    var hero = $('.hero-ph');
    if (hero) {
      var hr = hero.getBoundingClientRect();
      if (hr.bottom > 0) {
        var hk = Math.min(1, Math.max(0, -hr.top / Math.max(1, hr.height)));
        hero.style.setProperty('--px', (hk * 34).toFixed(2) + 'px');
      }
    }
  }

  /* ---------------------------------------------------------------
     4. BĂNG CHỮ CHẠY
     --------------------------------------------------------------- */
  var mqRow = null, mqUnit = null, mqOne = 0;

  /* luôn giữ đủ bản sao phủ hai lần bề ngang, nếu không sẽ hở
     một khoảng trắng khi người dùng phóng to cửa sổ */
  function topUpMarquee() {
    if (!mqRow || !mqOne) return;
    var need = Math.ceil((innerWidth * 2) / mqOne) + 1;
    for (var i = mqRow.children.length; i < need; i++) {
      mqRow.appendChild(mqUnit.cloneNode(true));
    }
  }

  function initMarquee() {
    var row = $('#mq-row');
    if (!row || row.dataset.on) return;
    var unit = row.firstElementChild;
    if (!unit) return;
    var one = unit.getBoundingClientRect().width;
    if (!one) return;
    row.dataset.on = '1';
    mqRow = row; mqUnit = unit; mqOne = one;
    topUpMarquee();

    var x = 0, base = small.matches ? 0.35 : 0.5, boost = 0, last = performance.now();

    function step(now) {
      var dt = Math.min(48, now - last); last = now;
      boost *= 0.9;
      x -= (base + boost) * (dt / 16.67);
      if (x <= -one) x += one;
      row.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    /* tốc độ cuộn trang đẩy thêm cho băng chữ rồi tắt dần */
    if (!small.matches) {
      var prev = scrollY;
      addEventListener('scroll', function () {
        var v = Math.abs(scrollY - prev); prev = scrollY;
        boost = Math.min(9, boost + v * 0.07);
      }, { passive: true });
    }
  }

  /* ---------------------------------------------------------------
     5. QUÉT & THEO DÕI
     --------------------------------------------------------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      /* khung ảnh bị clip-path che kín nên diện tích giao luôn bằng 0 và
         không bao giờ tự kích hoạt được — phải canh thẻ cha rồi mở cho nó */
      if (el.rvTarget) el.rvTarget.classList.add('in');
      else if (el.fxTargets) el.fxTargets.forEach(function (t) { t.classList.add('sp-go'); });
      else if (el.dataset.countup != null) countUp(el);
      else el.classList.add('sp-go');
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

  function scan() {
    $$('.sec-head h2, .sec-head h3').forEach(function (h) {
      if (h.dataset.spDone) return;
      if (!splitHeading(h)) return;
      h.dataset.spDone = '1';
      var host = h.closest('.sec-head') || h;
      (host.fxTargets || (host.fxTargets = [])).push(h);
      io.observe(host);
    });
    $$('.pshot-img').forEach(function (f) {
      if (f.dataset.rv) return;
      prepImage(f);
      var host = f.parentElement || f;
      host.rvTarget = f;
      io.observe(host);
    });
    $$('[data-countup]').forEach(function (el) {
      if (el.dataset.cuDone) return;
      el.dataset.cuDone = '1';
      el.textContent = '0';
      io.observe(el);
    });
    initCountdown();
    initMarquee();
  }

  /* Lưới an toàn: nội dung chỉ hiện khi observer kích hoạt, nên nếu vì lý do
     gì đó nó không chạy thì chữ và ảnh sẽ nằm ẩn luôn. Quét lại một lượt,
     thứ nào đang nằm trong khung nhìn mà còn ẩn thì mở thẳng. */
  function sweep() {
    var vh = innerHeight;
    function onScreen(el) {
      var r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < vh && r.width > 0;
    }
    $$('.img-rv:not(.in)').forEach(function (e) { if (onScreen(e.parentElement || e)) e.classList.add('in'); });
    $$('.sec-head h2, .sec-head h3').forEach(function (e) {
      if (!e.classList.contains('sp-go') && onScreen(e)) e.classList.add('sp-go');
    });
    $$('.sec-head.reveal:not(.in)').forEach(function (e) { if (onScreen(e)) e.classList.add('in'); });
    $$('[data-countup]').forEach(function (e) {
      if (e.textContent === '0' && e.dataset.countup !== '0' && onScreen(e)) countUp(e);
    });
  }

  function boot() {
    initHeroTitle();
    scan();
    parallax();
    setTimeout(sweep, 2500);
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();
  /* app.js dựng phần lớn nội dung sau khi tải dữ liệu nên phải quét lại */
  addEventListener('load', boot);

  var pend = 0;
  new MutationObserver(function () {
    clearTimeout(pend);
    pend = setTimeout(scan, 120);
  }).observe(document.body, { childList: true, subtree: true });

  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { parallax(); ticking = false; });
  }, { passive: true });

  var rz = 0;
  addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      /* số dòng của tiêu đề đổi theo bề ngang nên phải chia lại */
      $$('.sec-head h2, .sec-head h3').forEach(function (h) {
        /* CHAR_FX là biến của bản cũ, đã bỏ khi mọi tiêu đề đều tách theo
           dòng. Còn sót lại ở đây nên mỗi lần đổi bề ngang là văng lỗi
           và tiêu đề không được chia lại dòng. */
        if (!h.dataset.spText) return;
        var shown = h.classList.contains('sp-go');
        splitLines(h, 90);
        if (shown) h.classList.add('sp-go');
      });
      topUpMarquee();
      parallax();
    }, 180);
  });
})();
