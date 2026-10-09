/* =====================================================================
   GIAO DIỆN TRANG NGÀY HỘI
   Dựng toàn bộ nội dung từ data.js + tournament.js, rồi gắn hiệu ứng.
   ===================================================================== */

(function () {
  'use strict';

  var D   = window.VHTT_DATA;
  var CFG = window.SITE_CONFIG || {};
  var LS_RESULTS = 'vhtt.results.v1';
  var LS_SEEDS   = 'vhtt.seeds.v1';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function icon(name, size) {
    return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function sportKey(s) { return s === 'pickleball' ? 'pb' : 'cl'; }

  /* ---------------- lưu trữ cục bộ (an toàn với chế độ riêng tư) --------------- */
  function lsGet(k) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }
    catch (e) { return null; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ---------------- trạng thái ---------------- */
  var localSeeds = lsGet(LS_SEEDS) || {};
  var baseSeeds = {};                      /* bản gốc trong data.js, để khôi phục được */
  D.events.forEach(function (ev) {
    baseSeeds[ev.id] = (ev.seeds || []).slice();
    if (localSeeds[ev.id] && localSeeds[ev.id].length) ev.seeds = localSeeds[ev.id].slice();
  });

  var T = Tournament.make(D);
  var baseResults   = JSON.parse(JSON.stringify(D.results || {}));
  var remoteResults = {};
  var localResults  = lsGet(LS_RESULTS) || {};

  function mergeResults() {
    var out = {};
    [baseResults, remoteResults, localResults].forEach(function (src) {
      for (var k in src) if (src[k]) out[k] = src[k];
    });
    T.setResults(out);
  }
  mergeResults();

  /* =====================================================================
     SỐ LIỆU TỰ ĐẾM TỪ DỮ LIỆU  (không hard-code để khỏi lệch khi sửa data.js)
     ===================================================================== */
  function peopleIndex() {
    var map = {};
    function add(name, where) {
      if (!name) return;
      var k = String(name).trim();
      if (!k) return;
      (map[k] = map[k] || []).push(where);
    }
    D.events.forEach(function (ev) {
      (ev.teams || []).forEach(function (t) { add(t.p1, ev.short); add(t.p2, ev.short); });
      (ev.players || []).forEach(function (p) { add(p.name, ev.short); });
      if (ev.waiting) ev.waiting.names.forEach(function (n) { add(n, ev.short + ' (chờ ghép)'); });
    });
    D.jumpRope.groups.forEach(function (g) {
      g.athletes.forEach(function (a) { add(a.name, D.jumpRope.name); });
    });
    return map;
  }

  var PEOPLE = peopleIndex();

  var COUNTS = {
    entries: Object.keys(PEOPLE).reduce(function (n, k) { return n + PEOPLE[k].length; }, 0),
    people: Object.keys(PEOPLE).length,
    events: D.events.length + 1,
    courts: D.venues.reduce(function (n, v) { return n + v.courts.length; }, 0),
    medals: D.events.length * 8 + D.jumpRope.groups.length * 4,
    matches: T.matches.length
  };

  /* người đăng ký từ 2 nội dung trở lên — BTC cần biết để tránh xếp trùng giờ */
  function multiEntrants() {
    return Object.keys(PEOPLE)
      .filter(function (k) { return PEOPLE[k].length > 1; })
      .map(function (k) { return { name: k, where: PEOPLE[k] }; })
      .sort(function (a, b) { return b.where.length - a.where.length || a.name.localeCompare(b.name, 'vi'); });
  }

  function lastEndMin() {
    return T.matches.reduce(function (n, m) { return Math.max(n, m.endMin || 0); }, 0);
  }
  function firstFinalMin() {
    return T.matches.filter(function (m) { return m.isFinal; })
      .reduce(function (n, m) { return Math.min(n, m.startMin); }, 1e9);
  }

  /* =====================================================================
     HERO
     ===================================================================== */
  function renderHero() {
    var i = D.intro;
    $('#hero-theme').textContent = i.theme;

    $('#hero-pillars').innerHTML = D.pillars.map(function (pl, k) {
      return (k ? '<i aria-hidden="true">/</i>' : '') + '<span style="--i:' + k + '">' + esc(pl.name) + '</span>';
    }).join('');

    var when = eventDateOrNull();
    var dateTxt = when ? vnDate(when) : (CFG.eventDateLabel || 'Đang chốt ngày');

    if ($('#hero-date')) $('#hero-date').textContent = dateTxt;

    $('#hero-meta').innerHTML = [
      ['clock', (CFG.doorsOpen || '08:00') + ' – 18:00'],
      ['pin',   'Sáng: ' + (CFG.venueName || '')],
      ['ball',  'Chiều: ' + (CFG.sportVenueName || CFG.venueName || '') +
                ' · ' + COUNTS.courts + ' sân'],
      ['users', '60 – 80 người · ' + (D.intro.members || []).join(' · ')]
    ].filter(function (r) { return r[1]; })
     .map(function (r) {
       return '<div>' + icon(r[0], 17) + '<b>' + esc(r[1]) + '</b></div>';
     }).join('');

    /* đang xem thử thì đếm ngược theo giờ thật sẽ mâu thuẫn với bảng đang diễn ra */
    if (when && !Live.nowOrPreview(CFG).preview) startCountdown(when.getTime());
  }

  /* ngày tháng luôn in theo giờ Việt Nam, bất kể máy người xem đặt múi giờ nào */
  function vnDate(d) {
    try {
      return d.toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (e) {
      return d.toLocaleDateString('vi-VN');
    }
  }

  /* eventDate chỉ dùng khi đúng định dạng; gõ sai thì coi như chưa chốt ngày.
     Luôn gắn múi giờ Việt Nam để người xem ở múi giờ khác vẫn đếm ngược đúng. */
  function eventDateOrNull() {
    if (!CFG.eventDate) return null;
    var txt = String(CFG.eventDate);
    if (!/(Z|[+-]\d{2}:?\d{2})$/.test(txt)) txt += '+07:00';
    var d = new Date(txt);
    if (isNaN(d.getTime())) {
      if (window.console) console.warn(
        'SITE_CONFIG.eventDate không đọc được: "' + CFG.eventDate +
        '". Hãy dùng dạng YYYY-MM-DDTHH:mm, ví dụ 2026-11-14T08:30.');
      return null;
    }
    return d;
  }

  function startCountdown(target) {
    var box = $('#countdown');
    box.style.display = 'flex';
    var units = [['ngày', 864e5], ['giờ', 36e5], ['phút', 6e4], ['giây', 1e3]];
    function tick() {
      var left = target - Date.now();
      if (left <= 0) {
        box.innerHTML = '<div class="u" style="min-width:auto;padding:10px 16px"><b>Hôm nay!</b><span>chúc cả nhà vui</span></div>';
        return;
      }
      box.innerHTML = units.map(function (u) {
        var v = Math.floor(left / u[1]); left -= v * u[1];
        return '<div class="u"><b>' + v + '</b><span>' + u[0] + '</span></div>';
      }).join('');
      setTimeout(tick, 1000);
    }
    tick();
  }

  /* =====================================================================
     TIMELINE
     ===================================================================== */
  function slotTime(t) {
    if (t.derive === 'firstFinal') {
      var f = T.matches.filter(function (m) { return m.isFinal; });
      if (!f.length) return null;
      return {
        start: Tournament.toHHMM(Math.min.apply(null, f.map(function (m) { return m.startMin; }))),
        end: Tournament.toHHMM(Math.max.apply(null, f.map(function (m) { return m.endMin; })))
      };
    }
    if (t.derive === 'awards') {
      var last = lastEndMin();
      if (!last) return null;
      var a = Math.ceil((last + 5) / 5) * 5;
      return { start: Tournament.toHHMM(a), end: Tournament.toHHMM(a + 30) };
    }
    return { start: t.start, end: t.end };
  }

  /* ---------------------------------------------------------------
     Lịch chương trình: lưới thẻ vuông, mỗi thẻ một mốc trong ngày.
     --------------------------------------------------------------- */
  function renderAgenda() {
    var host = $('#agenda');
    if (!host) return;

    var html = '';
    D.timeline.forEach(function (t, k) {
      var tm = slotTime(t);
      if (!tm || !tm.start) return;

      var pillar = t.talk ? D.pillars[t.talk - 1] : null;
      html += '<div class="ag-item reveal" data-idx="' + k + '" data-part="' + esc(t.part) + '"' +
          (pillar ? ' data-pillar="' + esc(pillar.key) + '"' : '') +
          (t.sport ? ' data-sport="1"' : '') +
          ' style="--d:' + (Math.min(k, 8) * 35) + 'ms">' +
        '<div class="ag-c">' +
          '<div class="ag-top">' +
            '<div class="ag-ic">' + icon(t.icon, 20) + '</div>' +
            '<div class="ag-t"><b>' + esc(tm.start) + '</b>' +
              (tm.end ? '<span>' + esc(tm.end) + '</span>' : '') + '</div>' +
          '</div>' +
          '<div class="ag-b">' +
            '<h3>' + esc(t.title) + '</h3>' +
            '<p>' + esc(t.desc) + '</p>' +
          '</div>' +
          '<div class="ag-tags">' +
            (t.fixed ? '' : '<span class="chip dim">dự kiến</span>') +
            (t.tag ? '<span class="chip">' + esc(t.tag) + '</span>' : '') +
            (t.owner ? '<span class="chip">' + esc(t.owner) + '</span>' : '') +
            (t.sport ? '<a class="chip ok" href="#lich" data-go-sport="1">Xem lịch từng trận</a>' : '') +
            '<span class="chip ok ag-live" hidden>Đang diễn ra</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    });

    host.innerHTML = html;
  }

  /* đánh dấu mốc đang diễn ra trên dòng thời gian */
  function markTimelineNow(st) {
    var on = (st && st.phase === 'live' && st.current && !st.current.synthetic)
      ? st.current.idx : -1;
    /* bài nào đang trình bày thì ảnh của trục đó phóng to */
    var liveItem = (st && st.phase === 'live' && st.current) ? st.current.item : null;
    if (liveItem && liveItem.talk && D.pillars[liveItem.talk - 1]) {
      setShot(D.pillars[liveItem.talk - 1].key);
    }
    $$('#agenda .ag-item').forEach(function (el) {
      var is = Number(el.dataset.idx) === on;
      el.classList.toggle('now', is);
      var chip = $('.ag-live', el);
      if (chip) chip.hidden = !is;
    });
  }

  /* =====================================================================
     HỎI ĐÁP + FORM + QR
     ===================================================================== */
  function siteUrl() {
    if (CFG.siteUrl) return CFG.siteUrl;
    return location.origin + location.pathname;
  }

  function renderAsk() {
    $('#ask-steps').innerHTML = D.culture.howToAsk.map(function (s) {
      return '<li>' + esc(s) + '</li>';
    }).join('');
  }

  function makeQr(el, text, cell) {
    if (!el) return;
    if (typeof qrcode !== 'function') { el.innerHTML = '<p style="color:#333;padding:8px">Không tạo được mã QR.</p>'; return; }
    try {
      var q = qrcode(0, 'M');
      q.addData(text);
      q.make();
      el.innerHTML = q.createSvgTag({ cellSize: cell || 4, margin: 2, scalable: true, alt: 'Mã QR: ' + text });
    } catch (e) {
      el.innerHTML = '<p style="color:#333;padding:8px;font-size:.8rem">Địa chỉ quá dài để tạo mã QR.</p>';
    }
  }

  function renderQr() {
    /* Mục này là để đặt câu hỏi, nên mã QR trỏ thẳng vào form.
       Chưa gắn form thì quay về địa chỉ trang như trước. */
    var form = CFG.formOpenUrl || CFG.formEmbedUrl || '';
    var url = form || siteUrl();
    var askUrl = form || (siteUrl() + '#hoi-dap');
    var offline = !form && location.protocol === 'file:' && !CFG.siteUrl;

    if (offline) {
      var warn = '<p style="color:#333;padding:14px;font-size:.84rem;max-width:220px">' +
        'Trang đang mở từ ổ đĩa nên chưa có địa chỉ để tạo mã QR. ' +
        'Sau khi đưa web lên mạng, điền <b>siteUrl</b> trong config.js.</p>';
      $('#qr-main').innerHTML = warn;
      $('#qr-proj').innerHTML = warn;
      $('#qr-url').textContent = 'Chưa có địa chỉ công khai';
      $('#proj-url').textContent = 'Chưa có địa chỉ công khai';
      return;
    }

    makeQr($('#qr-main'), url, 4);
    makeQr($('#qr-proj'), askUrl, 8);
    $('#qr-url').textContent = url;
    $('#proj-url').textContent = askUrl;
  }

  /* =====================================================================
     ĐANG DIỄN RA
     ===================================================================== */

  function fmtLeft(ms) {
    var mn = Math.max(0, Math.round(ms / 60000));
    if (mn < 60) return mn + ' phút';
    var h = Math.floor(mn / 60), m = mn % 60;
    if (h < 24) return h + ' giờ' + (m ? ' ' + m + ' phút' : '');
    var d = Math.floor(h / 24), hh = h % 24;
    return d + ' ngày' + (hh ? ' ' + hh + ' giờ' : '');
  }

  var liveTimer = null, liveKey = '';

  /* =====================================================================
     THẺ MỞ ĐẦU LÀ SLIDE
     Slide đầu là tên ngày hội; từ slide thứ hai trở đi là nội dung chạy
     theo thời gian thực: đang diễn ra gì, từng sân đang đánh trận nào,
     còn bao lâu tới phần tiếp theo.
     ===================================================================== */
  var lsIdx = 0, lsTimer = null, lsPaused = false;

  function hsSlide(k, tagCls, tag, title, sub, extra) {
    return '<div class="hs" data-k="' + k + '">' +
      '<span class="hs-tag' + (tagCls ? ' ' + tagCls : '') + '">' + tag + '</span>' +
      '<h2>' + title + '</h2>' +
      (sub ? '<p>' + sub + '</p>' : '') +
      (extra || '') +
    '</div>';
  }

  /* các slide chạy theo giờ — slide tên ngày hội nằm sẵn trong HTML */
  function buildLiveSlides(st) {
    var out = [];

    if (st.phase === 'unknown' || st.phase === 'before') return out;

    if (st.phase === 'after') {
      out.push(hsSlide('end', '', 'Đã kết thúc', 'Ngày hội đã khép lại',
        'Cảm ơn cả nhà đã tham gia.'));
      return out;
    }

    if (st.phase === 'gap') {
      out.push(hsSlide('rest', 'soon', 'Đang nghỉ', 'Giữa hai phần chương trình',
        st.next ? 'Tiếp theo lúc ' + esc(Live.toHHMM(st.next.startMin)) : 'Hôm nay đã xong'));
      if (st.next) {
        out.push(hsSlide('next', 'soon', 'Tiếp theo', esc(st.next.item.title),
          'Bắt đầu sau ' + esc(fmtLeft(st.msToNext))));
      }
      return out;
    }

    /* ---------- đang diễn ra ---------- */
    var it = st.current.item;
    var pct = Math.round(st.progress * 100);
    out.push(hsSlide('now', 'live', 'Đang diễn ra', esc(it.title),
      esc(Live.toHHMM(st.current.startMin)) + ' – ' + esc(Live.toHHMM(st.current.endMin)) +
        ' · còn ' + st.minutesLeft + ' phút' + (it.owner ? ' · ' + esc(it.owner) : ''),
      '<div class="hs-bar"><i style="width:' + pct + '%"></i></div>'));

    /* buổi chiều: mỗi sân một slide */
    (st.courts || []).forEach(function (c) {
      if (!c.match) {
        out.push(hsSlide('court', '', esc(c.court.name), 'Đã đấu xong', ''));
        return;
      }
      var k = sportKey(c.view.event.sport);
      var tagTxt = c.state === 'playing' ? 'đang đánh'
                 : c.state === 'next'    ? 'sắp tới'
                 : c.state === 'late'    ? 'chờ trận trước' : '';
      out.push(hsSlide('court', k,
        esc(c.court.name) + (tagTxt ? ' · ' + tagTxt : ''),
        esc(c.view.teamA.label) + ' <i>vs</i> ' + esc(c.view.teamB.label),
        esc(c.view.event.short + ' · ' + c.match.label + ' · ' +
            c.match.time + '–' + c.match.endTime)));
    });

    if (st.next) {
      out.push(hsSlide('next', 'soon', 'Tiếp theo', esc(st.next.item.title),
        esc(Live.toHHMM(st.next.startMin)) + ' · sau ' + esc(fmtLeft(st.msToNext))));
    }
    return out;
  }

  function lsShow(n) {
    var slides = $$('#hero-slides .hs');
    if (!slides.length) return;
    lsIdx = (n + slides.length) % slides.length;
    slides.forEach(function (el, i) {
      var on = i === lsIdx;
      el.classList.toggle('on', on);
      el.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    $$('#hs-dots button').forEach(function (b, i) {
      var on = i === lsIdx;
      b.classList.toggle('on', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  function lsAuto() {
    if (lsTimer) clearInterval(lsTimer);
    if (reduce || $$('#hero-slides .hs').length < 2) return;
    lsTimer = setInterval(function () {
      if (!lsPaused) lsShow(lsIdx + 1);
    }, 6000);
  }

  function renderLive(force) {
    var host = $('#hero-slides');
    if (!host) return;

    var np = Live.nowOrPreview(CFG);
    var st = Live.compute(D, T, CFG, np.now);

    var tick = st.phase === 'before' ? Math.floor((st.msToStart || 0) / 60000)
             : st.phase === 'gap'    ? Math.floor((st.msToNext || 0) / 60000)
             : st.minutesLeft;
    var courtKey = (st.courts || []).map(function (c) {
      return c.match ? c.match.id + c.state : '-';
    }).join(',');
    var key = [st.phase, st.current ? st.current.idx : '', tick,
               st.next ? st.next.idx : '', courtKey, np.preview ? np.label : ''].join('|');

    /* đồng hồ góc thẻ, cập nhật mỗi lần chạy kể cả khi slide không đổi */
    var mins = st.nowMin != null ? st.nowMin : nowMinutes();
    var clock = $('#hs-clock');
    if (clock) {
      var onDay = st.phase === 'live' || st.phase === 'gap';
      clock.hidden = !onDay || mins == null;
      if (!clock.hidden) {
        clock.classList.toggle('is-live', st.phase === 'live');
        $('b', clock).textContent = Live.toHHMM(mins);
        $('.hs-lbl', clock).textContent = st.phase === 'live' ? 'Trực tiếp' : 'Đang nghỉ';
      }
    }

    if (!force && key === liveKey) { renderNowbar(st); markTimelineNow(st); return; }
    liveKey = key;

    /* dựng lại các slide chạy theo giờ, giữ nguyên slide tên ngày hội */
    $$('#hero-slides .hs').forEach(function (el) {
      if (el.dataset.k !== 'intro') el.parentNode.removeChild(el);
    });
    var live = buildLiveSlides(st);
    if (live.length) host.insertAdjacentHTML('beforeend', live.join(''));

    var total = $$('#hero-slides .hs').length;
    var many = total > 1;
    ['#hs-prev', '#hs-next'].forEach(function (sel) {
      var b = $(sel); if (b) b.hidden = !many;
    });
    var dots = $('#hs-dots');
    if (dots) {
      dots.hidden = total < 2;
      dots.innerHTML = total < 2 ? '' : Array.apply(null, Array(total)).map(function (_, i) {
        return '<button type="button" data-i="' + i + '" aria-label="Xem slide ' + (i + 1) + '"></button>';
      }).join('');
    }

    /* trong ngày hội thì mở thẳng slide đang diễn ra, không bắt xem bìa trước */
    lsShow(live.length ? 1 : 0);
    lsAuto();

    var pn = $('#preview-note');
    if (pn) {
      pn.hidden = !np.preview;
      if (np.preview) {
        pn.innerHTML = 'Đang xem thử trang như lúc <b>' + esc(np.label) + '</b> ngày hội.' +
          '<a class="btn btn-sm" href="' + esc(location.pathname) + '">Thoát xem thử</a>';
      }
    }

    renderNowbar(st);
    markTimelineNow(st);
  }

  /* thanh mỏng bám đầu trang */
  function renderNowbar(st) {
    var bar = $('#nowbar');
    if (!bar) return;
    if (st.phase !== 'live') {
      bar.classList.remove('on');
      bar.innerHTML = '';
      bar.dataset.t = '';
      document.documentElement.style.setProperty('--nowbar-h', '0px');
      return;
    }
    var title = st.current.item.title;
    if (bar.dataset.t !== title) {
      bar.dataset.t = title;
      bar.innerHTML = '<a href="#top">' +
        '<span class="tag"><i></i>Đang diễn ra</span>' +
        '<span class="t">' + esc(title) + '</span>' +
        '<span class="r" aria-hidden="true"></span></a>';
    }
    var rem = $('.r', bar);
    if (rem) rem.textContent = 'còn ' + st.minutesLeft + "'";
    bar.classList.add('on');
    /* chừa chỗ cho thanh này khi nhảy tới một mục bằng link #... */
    requestAnimationFrame(function () {
      document.documentElement.style.setProperty('--nowbar-h', bar.offsetHeight + 'px');
    });
  }

  function startLive() {
    renderLive(true);
    if (liveTimer) clearInterval(liveTimer);
    liveTimer = setInterval(function () { renderLive(false); }, 30000);
  }

  /* =====================================================================
     BA TRỤC VĂN HÓA · DIỄN GIẢ · MINI GAME · ẢNH
     ===================================================================== */
  /* Tranh vẽ riêng cho ba trục văn hóa — hình kiến trúc trừu tượng, không
     phải ảnh người. Có ảnh thật thì khai `photo` trong pillars ở data.js,
     trang sẽ dùng ảnh thay cho tranh này. */
  var POSTER = {
    truyenthong:
      '<svg viewBox="0 0 320 200" role="img" aria-label="Tranh minh họa Truyền thống: vòm cầu đá">' +
      '<defs><linearGradient id="pgA" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#f6ece3"/><stop offset="1" stop-color="#e6d3c3"/></linearGradient></defs>' +
      '<rect width="320" height="200" fill="url(#pgA)"/>' +
      '<g fill="none" stroke="#a6592e" stroke-width="2.4" opacity=".28">' +
        '<path d="M0 150h320M0 164h320M0 178h320"/></g>' +
      '<g fill="#a6592e">' +
        '<path d="M44 150V96a44 44 0 0 1 88 0v54h-16V96a28 28 0 0 0-56 0v54z" opacity=".92"/>' +
        '<path d="M172 150V110a34 34 0 0 1 68 0v40h-13v-40a21 21 0 0 0-42 0v40z" opacity=".6"/>' +
        '<rect x="30" y="150" width="260" height="10" rx="2" opacity=".95"/>' +
        '<rect x="38" y="160" width="244" height="7" rx="2" opacity=".55"/></g>' +
      '<g fill="#7b3f1d" opacity=".35">' +
        '<rect x="60" y="60" width="56" height="5" rx="2"/>' +
        '<rect x="74" y="48" width="28" height="5" rx="2"/></g>' +
      '</svg>',
    tuluc:
      '<svg viewBox="0 0 320 200" role="img" aria-label="Tranh minh họa Tự lực: trụ cầu dây văng">' +
      '<defs><linearGradient id="pgB" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#e6f3ea"/><stop offset="1" stop-color="#cfe6d7"/></linearGradient></defs>' +
      '<rect width="320" height="200" fill="url(#pgB)"/>' +
      '<g stroke="#28763a" stroke-width="1.6" opacity=".5" fill="none">' +
        '<path d="M160 34 L84 150M160 34 L106 150M160 34 L128 150M160 34 L192 150M160 34 L214 150M160 34 L236 150"/></g>' +
      '<path d="M152 32h16l6 118h-28z" fill="#28763a"/>' +
      '<path d="M146 72h28M146 100h28" stroke="#1c5a2b" stroke-width="5" fill="none"/>' +
      '<rect x="20" y="150" width="280" height="11" rx="2" fill="#28763a"/>' +
      '<rect x="20" y="161" width="280" height="6" rx="2" fill="#1c5a2b" opacity=".55"/>' +
      '<g fill="#1c5a2b" opacity=".32">' +
        '<rect x="54" y="167" width="12" height="28" rx="2"/>' +
        '<rect x="252" y="167" width="12" height="28" rx="2"/></g>' +
      '</svg>',
    thichung:
      '<svg viewBox="0 0 320 200" role="img" aria-label="Tranh minh họa Thích ứng: đường cong đi lên">' +
      '<defs><linearGradient id="pgC" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#e2f2f7"/><stop offset="1" stop-color="#c8e4ee"/></linearGradient></defs>' +
      '<rect width="320" height="200" fill="url(#pgC)"/>' +
      '<g stroke="#0a7089" stroke-width="1" opacity=".22" fill="none">' +
        '<path d="M0 60h320M0 100h320M0 140h320M80 0v200M160 0v200M240 0v200"/></g>' +
      '<g fill="#0a7089" opacity=".3">' +
        '<rect x="34" y="128" width="26" height="42" rx="3"/>' +
        '<rect x="70" y="112" width="26" height="58" rx="3"/>' +
        '<rect x="106" y="138" width="26" height="32" rx="3"/></g>' +
      '<path d="M28 150 L86 120 L134 134 L186 86 L236 96 L292 44" fill="none" ' +
        'stroke="#0a7089" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<g fill="#0a7089">' +
        '<circle cx="186" cy="86" r="7"/><circle cx="292" cy="44" r="8"/></g>' +
      '<g fill="none" stroke="#0a7089" stroke-width="2.6" stroke-linecap="round" opacity=".75">' +
        '<path d="M268 28l5-10 5 10 10 5-10 5-5 10-5-10-10-5z"/></g>' +
      '<rect x="0" y="170" width="320" height="30" fill="#0a7089" opacity=".12"/>' +
      '</svg>'
  };

  /* Ảnh nào ứng với bài đang trình bày thì phóng to, hai ảnh kia thu nhỏ. */
  var shotActive = null;

  /* Ảnh nền khối mở đầu. Có ảnh thì tranh vẽ cầu dây văng lùi đi,
     nhiều ảnh thì chạy mờ chuyển qua lại. */
  function renderHeroPhotos() {
    var list = (CFG.heroPhotos || []).filter(Boolean);
    var art = $('.hero-art'), card = $('.hero-card');
    if (!art || !card || !list.length) return;

    card.classList.add('has-photo');
    art.insertAdjacentHTML('afterbegin',
      '<div class="hero-ph">' + list.map(function (src, i) {
        return '<img src="' + esc(src) + '" alt="" aria-hidden="true"' +
               (i === 0 ? ' class="on"' : '') +
               (i ? ' loading="lazy"' : '') + '>';
      }).join('') + '</div>');

    if (list.length < 2 || reduce) return;
    var imgs = $$('.hero-ph img'), k = 0;
    setInterval(function () {
      imgs[k].classList.remove('on');
      k = (k + 1) % imgs.length;
      imgs[k].classList.add('on');
    }, Math.max(4, CFG.heroPhotoSeconds || 9) * 1000);
  }

  function renderPillarShots() {
    var host = $('#pillar-shots');
    if (!host) return;
    host.innerHTML = D.pillars.map(function (pl, k) {
      var art = pl.photo
        ? '<img src="' + esc(pl.photo) + '" alt="' + esc(pl.name) + '"' +
          (pl.focus ? ' style="object-position:' + esc(pl.focus) + '"' : '') + '>'
        : (POSTER[pl.key] || '');
      return '<figure class="pshot" data-k="' + esc(pl.key) + '" tabindex="0" role="button" ' +
          'aria-label="Phóng to ' + esc(pl.name) + '" style="--d:' + (k * 90) + 'ms">' +
        '<div class="pshot-img">' + art + '</div>' +
        '<figcaption>' +
          '<span class="pshot-no">0' + (k + 1) + '</span>' +
          '<b>' + esc(pl.name) + '</b>' +
          '<span class="pshot-role">' + esc(pl.role) + '</span>' +
          '<p>' + esc(pl.body) + '</p>' +
          '<span class="pshot-short">' + esc(pl.short) + '</span>' +
        '</figcaption>' +
        '<i class="pshot-live" hidden>Đang trình bày</i>' +
      '</figure>';
    }).join('');
    setShot(shotActive || D.pillars[0].key, true);
  }

  function setShot(key, silent) {
    shotActive = key;
    var all = $$('#pillar-shots .pshot');
    var a = 0;
    all.forEach(function (el, i) { if (el.dataset.k === key) a = i; });
    var n = all.length;
    all.forEach(function (el, i) {
      var on = i === a;
      el.classList.toggle('on', on);
      /* xếp kiểu album: ảnh to ở giữa, hai ảnh kia nép sang hai bên */
      el.dataset.pos = on ? 'mid' : (i === (a + n - 1) % n ? 'left' : 'right');
      var tag = $('.pshot-live', el);
      if (tag) tag.hidden = !(on && !silent);
    });
  }

  /* wire() giữ lockBehind trong phạm vi của nó, nên để lại một cầu nối */
  var lockShot = null;

  /* mở ô phóng to */
  function openShot(key) {
    var pl = D.pillars.filter(function (x) { return x.key === key; })[0];
    if (!pl) return;
    var box = $('#lbox');
    $('#lbox-img').innerHTML = pl.photo
      ? '<img src="' + esc(pl.photo) + '" alt="' + esc(pl.name) + '">'
      : (POSTER[pl.key] || '');
    $('#lbox-t').textContent = pl.name;
    $('#lbox-r').textContent = pl.role;
    $('#lbox-p').textContent = pl.body;
    box.classList.add('on');
    box.dataset.k = key;
    if (typeof lockShot === 'function') lockShot(true);
    $('#lbox-x').focus();
  }


  /* chân dung minh họa cho ba bài chia sẻ — thay bằng ảnh thật khi có */
  var PORTRAIT = {
    /* Bài 1 — người gắn bó lâu năm, áo sơ mi, kính */
    truyenthong:
      '<svg class="pt" viewBox="0 0 120 120" role="img" aria-label="Chân dung minh họa diễn giả Bài 1">' +
      '<defs><clipPath id="pcA"><circle cx="60" cy="60" r="58"/></clipPath></defs>' +
      '<g clip-path="url(#pcA)">' +
        '<rect width="120" height="120" fill="currentColor" opacity=".1"/>' +
        '<circle cx="60" cy="40" r="60" fill="currentColor" opacity=".08"/>' +
        /* vai + áo */
        '<path d="M14 120c0-23 20-35 46-35s46 12 46 35z" fill="currentColor" opacity=".85"/>' +
        '<path d="M60 85 48 120h24z" fill="#fff" opacity=".5"/>' +
        '<path d="M52 86l8 9 8-9-8-5z" fill="#fff" opacity=".85"/>' +
        /* cổ + đầu */
        '<path d="M50 70h20v16H50z" fill="#e8c9a8"/>' +
        '<ellipse cx="60" cy="52" rx="20" ry="23" fill="#f0d5b6"/>' +
        /* tóc */
        '<path d="M38 50c0-14 10-23 22-23s22 9 22 23c0-6-6-10-12-10-7 0-9 3-16 3-8 0-16 2-16 7z" fill="#2c2420"/>' +
        /* kính */
        '<g fill="none" stroke="#2c2420" stroke-width="2">' +
          '<circle cx="51" cy="53" r="7"/><circle cx="69" cy="53" r="7"/><path d="M58 53h4"/>' +
        '</g>' +
        '<path d="M54 64q6 4 12 0" fill="none" stroke="#2c2420" stroke-width="2" stroke-linecap="round"/>' +
      '</g></svg>',

    /* Bài 2 — kỹ sư công trường, mũ bảo hộ */
    tuluc:
      '<svg class="pt" viewBox="0 0 120 120" role="img" aria-label="Chân dung minh họa diễn giả Bài 2">' +
      '<defs><clipPath id="pcB"><circle cx="60" cy="60" r="58"/></clipPath></defs>' +
      '<g clip-path="url(#pcB)">' +
        '<rect width="120" height="120" fill="currentColor" opacity=".1"/>' +
        '<circle cx="60" cy="40" r="60" fill="currentColor" opacity=".08"/>' +
        /* áo phản quang */
        '<path d="M14 120c0-23 20-35 46-35s46 12 46 35z" fill="currentColor" opacity=".85"/>' +
        '<path d="M44 90l6 30h5l-5-30zM76 90l-6 30h-5l5-30z" fill="#fff" opacity=".75"/>' +
        '<path d="M50 85h20l-10 10z" fill="#fff" opacity=".45"/>' +
        /* cổ + đầu */
        '<path d="M50 70h20v16H50z" fill="#dcb492"/>' +
        '<ellipse cx="60" cy="54" rx="20" ry="22" fill="#e8c29c"/>' +
        /* mũ bảo hộ */
        '<path d="M34 46a26 26 0 0 1 52 0z" fill="#e6a62b"/>' +
        '<rect x="30" y="44" width="60" height="6" rx="3" fill="#f0bb4c"/>' +
        '<path d="M60 20v24" stroke="#c98d18" stroke-width="2.5"/>' +
        /* mắt + miệng */
        '<circle cx="52" cy="57" r="2.4" fill="#2c2420"/><circle cx="68" cy="57" r="2.4" fill="#2c2420"/>' +
        '<path d="M54 67q6 4 12 0" fill="none" stroke="#2c2420" stroke-width="2" stroke-linecap="round"/>' +
      '</g></svg>',

    /* Bài 3 — người làm dữ liệu, tai nghe/headset */
    thichung:
      '<svg class="pt" viewBox="0 0 120 120" role="img" aria-label="Chân dung minh họa diễn giả Bài 3">' +
      '<defs><clipPath id="pcC"><circle cx="60" cy="60" r="58"/></clipPath></defs>' +
      '<g clip-path="url(#pcC)">' +
        '<rect width="120" height="120" fill="currentColor" opacity=".1"/>' +
        '<circle cx="60" cy="40" r="60" fill="currentColor" opacity=".08"/>' +
        /* áo */
        '<path d="M14 120c0-23 20-35 46-35s46 12 46 35z" fill="currentColor" opacity=".85"/>' +
        '<path d="M50 85h20l-10 12z" fill="#fff" opacity=".4"/>' +
        /* cổ + đầu */
        '<path d="M50 70h20v16H50z" fill="#e3bb98"/>' +
        '<ellipse cx="60" cy="53" rx="20" ry="22" fill="#eecfae"/>' +
        /* tóc ngắn */
        '<path d="M39 50c1-14 10-22 21-22s20 8 21 22c-3-8-10-12-21-12s-18 4-21 12z" fill="#241f1c"/>' +
        /* tai nghe */
        '<path d="M36 54a24 24 0 0 1 48 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="31" y="50" width="8" height="14" rx="4" fill="currentColor"/>' +
        '<rect x="81" y="50" width="8" height="14" rx="4" fill="currentColor"/>' +
        /* mắt + miệng */
        '<circle cx="52" cy="55" r="2.4" fill="#241f1c"/><circle cx="68" cy="55" r="2.4" fill="#241f1c"/>' +
        '<path d="M54 65q6 4 12 0" fill="none" stroke="#241f1c" stroke-width="2" stroke-linecap="round"/>' +
      '</g></svg>'
  };

  function initials(name) {
    var w = String(name).replace(/^Ô\.\s*|^Bà\s*|^Ông\s*/, '').trim().split(/\s+/);
    if (w.length === 1) return w[0].slice(0, 2).toUpperCase();
    return (w[w.length - 2][0] + w[w.length - 1][0]).toUpperCase();
  }


  function renderMiniGame() {
    var g = D.miniGame;

    var join = CFG.quizJoinUrl
      ? '<div style="margin-top:14px"><a class="btn btn-pri btn-sm" target="_blank" rel="noopener" href="' +
        esc(CFG.quizJoinUrl) + '">Vào phòng chơi ↗</a></div>'
      : '';

    $('#mg-body').innerHTML =
      '<div class="mg">' +
        '<div class="card reveal">' +
          '<h3 style="margin-bottom:10px">Cách tham gia</h3>' +
          '<ul class="steps">' + g.how.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
          join +
        '</div>' +
        '<div class="reveal" style="--d:90ms">' + prizeBox(g) + '</div>' +
      '</div>';
  }

  /* đổi số tiền sang dạng dễ đọc: 100000 -> "100.000đ" */
  function money(n) {
    return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  /* Ô giải thưởng: mức thưởng mỗi câu đúng, kèm danh sách người đạt giải. */
  function prizeBox(g) {
    var per = g.prizePerCorrect || 0;
    var list = g.winners || [];

    var rows = list.length
      ? '<ol class="win">' + list.slice().sort(function (a, b) {
          return (b.correct || 0) - (a.correct || 0);
        }).map(function (w) {
          return '<li>' +
            '<span class="wn">' + esc(w.name) + '</span>' +
            (w.dept ? '<span class="wd">' + esc(w.dept) + '</span>' : '') +
            '<span class="wc">' + (w.correct || 0) + ' câu đúng</span>' +
            '<b class="wm">' + money((w.correct || 0) * per) + '</b>' +
          '</li>';
        }).join('') + '</ol>'
      : '<p class="win-empty">Chưa có kết quả. BTC cập nhật ngay trong lúc chơi.</p>';

    var total = list.reduce(function (n, w) { return n + (w.correct || 0) * per; }, 0);

    return '<div class="card prize">' +
      '<div class="prize-top">' +
        '<span class="tro">🏆</span>' +
        '<div>' +
          '<h3>Giải thưởng</h3>' +
          '<p class="prize-rate">Mỗi câu trả lời đúng được <b>' + esc(money(per)) + '</b></p>' +
        '</div>' +
      '</div>' +
      '<div class="prize-list">' +
        '<div class="prize-h"><b>Người đạt giải</b>' +
          (list.length ? '<span class="chip ok">' + list.length + ' người · ' + esc(money(total)) + '</span>' : '') +
        '</div>' +
        rows +
      '</div>' +
    '</div>';
  }


  /* =====================================================================
     TỔNG QUAN THỂ THAO
     ===================================================================== */
  /* ---------------------------------------------------------------
     Trang thể thao: một hàng nút lọc theo trạng thái, bên dưới là lưới
     thẻ nội dung. Mỗi thẻ cho biết đang tới đâu và dẫn thẳng tới lịch,
     nhánh đấu, hoặc ô nhập kết quả.
     --------------------------------------------------------------- */
  var EV_FILTERS = [
    { k: 'all',  label: 'Tất cả' },
    { k: 'live', label: 'Đang đấu' },
    { k: 'soon', label: 'Sắp đấu' },
    { k: 'done', label: 'Đã xong' }
  ];
  var evFilter = 'all';

  /* Trạng thái một nội dung: đã xong / đang đấu / sắp đấu.
     Ưu tiên kết quả thật; chưa có kết quả nào thì xét theo giờ. */

  /* Số phút đã trôi trong ngày hội, tính theo giờ Việt Nam. Trả null nếu
     hôm nay không phải ngày hội — khi đó trạng thái chỉ dựa vào kết quả. */
  function nowMinutes() {
    var day = Live.eventDay(CFG);
    if (!day) return null;
    var base = new Date(day + 'T00:00:00+07:00');
    if (isNaN(base)) return null;
    var mins = Math.floor((Live.nowOrPreview(CFG).now - base) / 60000);
    return (mins < 0 || mins > 1440) ? null : mins;
  }



  function renderEvFilter() {
    var host = $('#ev-filter');
    if (!host) return;
    var counts = { all: 0, live: 0, soon: 0, done: 0 };
    $$('#court-board .court').forEach(function (el) {
      counts.all++;
      counts[el.dataset.state] = (counts[el.dataset.state] || 0) + 1;
    });
    host.innerHTML = EV_FILTERS.map(function (f) {
      return '<button class="fchip' + (evFilter === f.k ? ' on' : '') + '" data-f="' + f.k + '"' +
        ' aria-pressed="' + (evFilter === f.k ? 'true' : 'false') + '">' +
        esc(f.label) + '<span>' + (counts[f.k] || 0) + '</span></button>';
    }).join('');
  }

  function applyEvFilter() {
    var shown = 0;
    $$('#court-board .court').forEach(function (el) {
      var ok = evFilter === 'all' || el.dataset.state === evFilter;
      el.hidden = !ok;
      if (ok) shown++;
    });
    /* khu nào không còn sân nào hiện thì ẩn luôn cả khu */
    $$('#court-board .crt-zone').forEach(function (z) {
      z.hidden = !$$('.court:not([hidden])', z).length;
    });
    var empty = $('#ev-empty');
    if (empty) empty.hidden = shown > 0;
  }

  function renderSport() {
    var from = Tournament.toHHMM(Math.min.apply(null, T.matches.map(function (m) { return m.startMin; })));
    $('#sport-lead').textContent =
      (CFG.sportVenueName ? CFG.sportVenueName + ' · ' : '') +
      COUNTS.courts + ' sân chạy song song, ' + T.matches.length + ' trận, ' +
      from + ' – ' + Tournament.toHHMM(lastEndMin()) + '.';

    renderCourtBoard();
    renderEvFilter();
    applyEvFilter();
  }

  function formatLabel(ev) {
    if (ev.format === 'q12r')   return 'Vòng loại + vòng vớt, rồi loại trực tiếp';
    if (ev.format === 'ko12b4') return 'Loại trực tiếp, 4 đội miễn vòng loại';
    if (ev.format === 'ko8')    return 'Loại trực tiếp từ tứ kết';
    if (ev.format === 'r6diff') return '3 trận vòng đầu, xếp hạng theo hiệu số';
    return '';
  }
  function statusChip(ev) {
    if (ev.status === 'pending-draw')   return '<span class="chip warn">Chờ bốc thăm chia đội</span>';
    if (ev.status === 'needs-decision') return '<span class="chip warn">BTC cần chốt</span>';
    if ((ev.seeds || []).length)        return '<span class="chip ok">Đã bốc thăm vị trí</span>';
    return '<span class="chip ok">Đã đủ đội</span><span class="chip">Chờ bốc vị trí</span>';
  }

  var CRT_STATE = {
    playing: { k: 'live', t: 'Đang đánh' },
    next:    { k: 'soon', t: 'Sắp tới' },
    late:    { k: 'soon', t: 'Chờ trận trước' },
    done:    { k: 'done', t: 'Đã xong' }
  };

  /* Mỗi sân một thẻ: đang đánh trận nào, tiếp theo là trận nào. */
  /* Tên một đội tách thành từng dòng: mỗi vận động viên một dòng, không
     để tên bị ngắt giữa chừng. Chỗ đứng chưa rõ ai thì chỉ có một dòng. */
  function teamLines(ev, side) {
    if (side.teamId != null && ev.teamById[side.teamId]) {
      var t = ev.teamById[side.teamId];
      if (t.name) return [t.name];
      return [t.p1, t.p2].filter(Boolean);
    }
    return [side.label];
  }

  function sideHtml(ev, side, score, win) {
    var lines = teamLines(ev, side).map(function (n) {
      return '<span class="pl">' + esc(n) + '</span>';
    }).join('');
    return '<div class="crt-s' + (win ? ' win' : '') + (side.pending ? ' pend' : '') + '">' +
      '<span class="nm">' + lines + '</span>' +
      '<span class="pt">' + (score == null ? '–' : score) + '</span>' +
    '</div>';
  }

  function courtCard(c, live) {
    var m = (live && live.match) || c.next;
    var state = m ? ((live && live.state) || 'next') : 'done';
    var tag = CRT_STATE[state] || CRT_STATE.next;
    var played = T.matchesOfCourt(c.court.id).filter(function (x) { return T.view(x).done; }).length;

    var body;
    if (!m) {
      body = '<div class="crt-empty">Đã đấu xong cả ' + c.total + ' trận</div>';
    } else {
      var v = T.view(m);
      var ev = T.eventById[m.eventId];
      body =
        '<div class="crt-m">' +
          sideHtml(ev, v.teamA, v.scoreA, v.done && v.winnerSide === 'a') +
          '<span class="crt-vs">vs</span>' +
          sideHtml(ev, v.teamB, v.scoreB, v.done && v.winnerSide === 'b') +
        '</div>' +
        '<div class="crt-f">' + esc(v.event.short + ' · ' + m.label) +
          '<span>' + esc(m.time + '–' + m.endTime) + '</span></div>';
    }

    return '<div class="court" data-state="' + tag.k + '">' +
      '<div class="ch">' +
        '<b>' + esc(c.court.short || c.court.name) + '</b>' +
        '<span class="crt-tag ' + tag.k + '"><i></i>' + tag.t + '</span>' +
      '</div>' +
      body +
      '<div class="crt-bar" role="img" aria-label="Đã đấu ' + played + ' trên ' + c.total + ' trận">' +
        '<i style="width:' + (c.total ? Math.round(played / c.total * 100) : 0) + '%"></i>' +
      '</div>' +
      '<div class="crt-n">' + played + '/' + c.total + ' trận</div>' +
    '</div>';
  }

  /* Hai khu sân xếp riêng, các sân trong cùng khu nằm sát nhau như ngoài
     nhà thi đấu; nền mỗi khu vẽ theo màu mặt sân của môn đó. */
  function renderCourtBoard() {
    var np = Live.nowOrPreview(CFG);
    var st = Live.compute(D, T, CFG, np.now);
    var byId = {};
    (st.courts || []).forEach(function (c) { byId[c.court.id] = c; });

    var all = T.liveByCourt();
    $('#court-board').innerHTML = D.venues.map(function (vn) {
      var mine = all.filter(function (c) { return c.venue.id === vn.id; });
      if (!mine.length) return '';
      var k = sportKey(vn.sport);
      return '<section class="crt-zone" data-sport="' + k + '">' +
        '<header class="crt-zh"><b>' + esc(vn.name) + '</b>' +
          '<span>' + mine.length + ' sân</span></header>' +
        '<div class="crt-grid">' +
          mine.map(function (c) { return courtCard(c, byId[c.court.id]); }).join('') +
        '</div>' +
      '</section>';
    }).join('');
  }

  /* =====================================================================
     THẺ TRẬN ĐẤU
     ===================================================================== */
  function matchRow(m, opts) {
    opts = opts || {};
    var v = T.view(m);
    var k = sportKey(v.event.sport);
    function side(team, score, which) {
      var cls = team.pending ? 'pend' : (v.done ? (v.winnerSide === which ? 'win' : 'lose') : '');
      return '<div class="ln ' + cls + '"><span class="nm" title="' + esc(team.label) + '">' +
             esc(team.label) + '</span></div>';
    }
    var sc = v.done || v.scoreA != null
      ? '<div class="sc"><span>' + v.scoreA + '</span><span class="d">–</span><span>' + v.scoreB + '</span></div>'
      : '<div class="sc todo">chưa đấu</div>';

    return '<div class="m' + (v.done ? ' done' : '') + '" data-sport="' + k + '">' +
      '<div class="when"><b>' + esc(m.time) + '</b><span>' + esc(m.court.short) + '</span></div>' +
      '<div class="who">' +
        side(v.teamA, v.scoreA, 'a') +
        '<div class="vs">vs</div>' +
        side(v.teamB, v.scoreB, 'b') +
        '<div class="tags">' +
          (opts.showEvent ? '<span class="chip dim">' + esc(v.event.short) + '</span>' : '') +
          '<span class="chip dim">' + esc(m.label) + '</span>' +
          '<span class="mid">' + esc(m.id) + '</span>' +
        '</div>' +
      '</div>' + sc +
    '</div>';
  }

  /* =====================================================================
     LỊCH THI ĐẤU
     ===================================================================== */
  var schedViews = [
    { id: 'cal',   label: 'Lịch sân' },
    { id: 'court', label: 'Theo sân' },
    { id: 'time',  label: 'Theo giờ' },
    { id: 'event', label: 'Theo nội dung' },
    { id: 'jump',  label: 'Nhảy dây' }
  ];

  /* cảnh báo xếp giờ: tổng thời lượng và người đăng ký nhiều nội dung */
  function scheduleNotes() {
    var endBy = (D.schedule || {}).endBy;
    var end = lastEndMin(), html = '';

    if (endBy && end > Tournament.toMin(endBy)) {
      html += '<div class="note" style="margin-bottom:12px"><div>Lịch hiện tại kéo đến <b>' +
        Tournament.toHHMM(end) + '</b>, quá mốc ' + esc(endBy) + '. ' +
        'Cách xử lý: thêm sân cho khu đang quá tải, rút thời lượng trong ' +
        '<code>durations</code>, hoặc đổi thứ tự vòng trong <code>roundOrder</code> ' +
        '— tất cả ở data.js.</div></div>';
    }

    var multi = multiEntrants();
    if (!multi.length) return html;

    var drawn = D.events.filter(function (e) { return (e.seeds || []).length; }).length;
    html += '<details class="card" style="margin-bottom:16px">' +
      '<summary style="cursor:pointer;font-weight:650;list-style:none">' +
      '⚠️ ' + multi.length + ' người đăng ký từ 2 nội dung trở lên — bấm để xem</summary>' +
      '<p style="font-size:.9rem;color:var(--muted);margin:10px 0">' +
      (drawn === D.events.length
        ? 'Lịch đã tự giãn để không ai phải đánh hai trận cùng lúc, mỗi người nghỉ ít nhất ' +
          ((D.schedule || {}).playerRestMinutes || 10) + ' phút giữa hai trận.'
        : 'Lịch chỉ tự tránh trùng giờ sau khi đã bốc thăm vị trí cho cả bốn nội dung. ' +
          'Hiện mới có ' + drawn + '/' + D.events.length + ' nội dung đã bốc, nên BTC lưu ý ' +
          'những người dưới đây khi gọi tên vào sân.') +
      '</p><div class="plist">' +
      multi.map(function (p) {
        return '<div class="pl"><span class="n">' + esc(p.name) + '</span>' +
               '<span class="d">' + esc(p.where.join(' · ')) + '</span></div>';
      }).join('') + '</div></details>';
    return html;
  }

  /* ---------------------------------------------------------------
     Lịch sân: mỗi sân một cột, giờ chạy dọc, mỗi trận là một khối cao
     đúng bằng thời lượng của nó. Nhìn phát biết sân nào đang trống.
     --------------------------------------------------------------- */
  function courtCalendar() {
    var ms = T.matches.filter(function (m) { return m.court && m.startMin != null; });
    if (!ms.length) return '';

    var from = Math.min.apply(null, ms.map(function (m) { return m.startMin; }));
    var to   = Math.max.apply(null, ms.map(function (m) { return m.endMin; }));
    from = Math.floor(from / 30) * 30;
    to   = Math.ceil(to / 30) * 30;

    /* nhảy dây chạy song song, cho vào một cột riêng cho đủ bức tranh */
    var cols = [];
    D.venues.forEach(function (vn) {
      vn.courts.forEach(function (c) {
        cols.push({ id: c.id, name: c.short || c.name, venue: vn, list: T.matchesOfCourt(c.id) });
      });
    });

    var marks = '';
    for (var t = from; t <= to; t += 30) {
      marks += '<div class="cc-mark" style="--t:' + (t - from) + '"><span>' +
               Tournament.toHHMM(t) + '</span></div>';
    }

    var body = cols.map(function (c) {
      var blocks = c.list.map(function (m) {
        var v = T.view(m);
        var dur = m.endMin - m.startMin;
        var k = sportKey(v.event.sport);
        return '<div class="cc-b ' + k + (v.done ? ' done' : '') + '"' +
          ' style="--s:' + (m.startMin - from) + ';--d:' + dur + '"' +
          ' title="' + esc(m.time + '–' + m.endTime + ' · ' + v.event.short + ' · ' + m.label +
                           ': ' + v.teamA.label + ' vs ' + v.teamB.label) + '">' +
          '<b>' + esc(m.label) + '</b>' +
          '<span class="cc-ev">' + esc(v.event.short) + '</span>' +
          '<span class="cc-tm">' + esc(m.time) + '</span>' +
        '</div>';
      }).join('');
      return '<div class="cc-col"><header>' + esc(c.name) + '</header>' +
             '<div class="cc-body">' + blocks + '</div></div>';
    }).join('');

    return '<div class="cc-wrap"><div class="cc" style="--from:' + from + ';--to:' + to + '">' +
      '<div class="cc-rail"><header></header><div class="cc-body">' + marks + '</div></div>' +
      body +
    '</div></div>' +
    '<p class="cc-hint">Chiều cao mỗi khối đúng bằng thời lượng trận. ' +
      'Khoảng trống là lúc sân đó nghỉ. Kéo ngang để xem hết các sân.</p>';
  }

  function renderSchedule(view) {
    var host = $('#sched-pane'), html = scheduleNotes();

    if (view === 'cal') {
      host.innerHTML = html + courtCalendar();
      return;

    } else if (view === 'court') {
      D.venues.forEach(function (vn) {
        vn.courts.forEach(function (c) {
          var list = T.matchesOfCourt(c.id);
          html += '<div class="m-group"><h3><b>' + esc(c.name) + '</b>' +
                  '<span class="chip dim">' + list.length + ' trận</span></h3>' +
                  '<div class="m-list">' +
                  list.map(function (m) { return matchRow(m, { showEvent: true }); }).join('') +
                  '</div></div>';
        });
      });

    } else if (view === 'time') {
      var slots = {};
      T.matches.forEach(function (m) { (slots[m.time] = slots[m.time] || []).push(m); });
      Object.keys(slots).sort().forEach(function (t) {
        html += '<div class="m-group"><h3><b>' + esc(t) + '</b>' +
                '<span class="chip dim">' + slots[t].length + ' sân cùng đánh</span></h3>' +
                '<div class="m-list">' +
                slots[t].map(function (m) { return matchRow(m, { showEvent: true }); }).join('') +
                '</div></div>';
      });

    } else if (view === 'event') {
      D.events.forEach(function (ev) {
        var list = T.matchesOf(ev.id).slice().sort(function (a, b) { return a.startMin - b.startMin; });
        html += '<div class="m-group"><h3><b>' + esc(ev.name) + '</b>' +
                '<span class="chip dim">' + list.length + ' trận</span></h3>' +
                '<div class="m-list">' + list.map(function (m) { return matchRow(m); }).join('') +
                '</div></div>';
      });

    } else {
      var jr = D.jumpRope;
      html += '<div class="note" style="margin-bottom:16px"><div><b>' + esc(jr.station) + '</b> — ' +
              esc(jr.rule) + '</div></div>';
      T.jumpHeats.forEach(function (h) {
        html += '<div class="heat"><div class="hh"><b>' + esc(h.time) + ' – ' + esc(h.endTime) + '</b>' +
                '<span class="chip">' + esc(h.groupLabel) + ' · lượt ' + h.heat + '</span></div>' +
                '<div class="bibs">' + h.athletes.map(function (a) {
                  return '<span class="bib"><i>' + esc(a.bib) + '</i>' + esc(a.name) +
                         ' <span class="chip dim">' + esc(a.dept) + '</span></span>';
                }).join('') + '</div></div>';
      });
      html += '<p style="color:var(--muted-2);font-size:.86rem;margin-top:10px">' + esc(jr.note) + '</p>';
    }

    host.innerHTML = '<div class="pane">' + html + '</div>';
  }

  /* =====================================================================
     NHÁNH ĐẤU
     ===================================================================== */
  var RND_FULL = { VL: 'Vòng loại', VV: 'Nhánh thua', TK: 'Tứ kết', BK: 'Bán kết', CK: 'Chung kết', TB: 'Tranh hạng Ba' };

  function parseTeamPlayers(team, ev) {
    if (team.teamId != null && ev && ev.teamById && ev.teamById[team.teamId]) {
      var t = ev.teamById[team.teamId];
      if (t.p1 && t.p2) return { p1: t.p1, p2: t.p2, single: false };
      if (t.name) return { p1: t.name, p2: '', single: true };
    }
    if (team.label) {
      var parts = team.label.split(' / ');
      if (parts.length === 2) return { p1: parts[0], p2: parts[1], single: false };
      return { p1: team.label, p2: '', single: true };
    }
    return { p1: '—', p2: '', single: true };
  }

  function bkCard(m, extraCls) {
    var v = T.view(m);
    var tpA = parseTeamPlayers(v.teamA, v.event);
    var tpB = parseTeamPlayers(v.teamB, v.event);

    var clsA = v.teamA.pending ? 'pend' : (v.done ? (v.winnerSide === 'a' ? 'win' : 'lose') : '');
    var clsB = v.teamB.pending ? 'pend' : (v.done ? (v.winnerSide === 'b' ? 'win' : 'lose') : '');

    var byeA = (m.byeTop) ? '<span class="bye">miễn VL</span>' : '';

    var scA = v.scoreA == null ? '–' : v.scoreA;
    var scB = v.scoreB == null ? '–' : v.scoreB;
    var winA = v.done && v.winnerSide === 'a';
    var winB = v.done && v.winnerSide === 'b';

    var tag = Tournament.ROUND_SHORT[m.round] + (m.round === 'CK' ? '' : ' ' + m.index);
    return '<div class="bkm ' + (extraCls || '') + '" data-mid="' + esc(m.id) + '" title="' + esc(m.label) + '">' +
      '<div class="hd"><span class="tag">' + esc(tag) + '</span><span class="meta">' + esc(m.time + ' · ' + m.court.short) + '</span></div>' +
      '<div class="bkm-body">' +
        '<div class="sd sd-a ' + clsA + '">' +
          '<span class="nm" title="' + esc(tpA.p1) + '">' + esc(tpA.p1) + '</span>' +
          (tpA.single ? (byeA ? ' ' + byeA : '') : '<span class="nm" title="' + esc(tpA.p2) + '">' + esc(tpA.p2) + '</span>' + byeA) +
        '</div>' +
        '<div class="bkm-score">' +
          '<span class="pt ' + (winA ? 'win' : '') + '">' + scA + '</span>' +
          '<span class="sep">:</span>' +
          '<span class="pt ' + (winB ? 'win' : '') + '">' + scB + '</span>' +
        '</div>' +
        '<div class="sd sd-b ' + clsB + '">' +
          '<span class="nm" title="' + esc(tpB.p1) + '">' + esc(tpB.p1) + '</span>' +
          (tpB.single ? '' : '<span class="nm" title="' + esc(tpB.p2) + '">' + esc(tpB.p2) + '</span>') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function updateBracketSvg() {
    $$('.bk').forEach(function (bk) {
      var svg = bk.querySelector('.bk-svg-lines');
      if (!svg) return;

      var bkRect = bk.getBoundingClientRect();
      if (bkRect.width === 0 || bkRect.height === 0) return;

      var sport = bk.getAttribute('data-sport') || 'pb';
      var winColor = sport === 'cl' ? '#0284c7' : '#22703a';
      var winArrId = sport === 'cl' ? 'arr-cl' : 'arr-pb';

      var w = Math.max(bk.scrollWidth, bk.clientWidth);
      var h = Math.max(bk.scrollHeight, bk.clientHeight);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);

      var defs = '<defs>' +
        '<marker id="arr-def" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">' +
          '<path d="M 1 1.5 L 6.5 4 L 1 6.5 Z" fill="#94a3b8" />' +
        '</marker>' +
        '<marker id="' + winArrId + '" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">' +
          '<path d="M 1 1.5 L 6.5 4 L 1 6.5 Z" fill="' + winColor + '" />' +
        '</marker>' +
      '</defs>';

      var paths = '';
      var cards = bk.querySelectorAll('.bkm[data-mid]');
      var cardMap = {};
      cards.forEach(function (c) { cardMap[c.getAttribute('data-mid')] = c; });

      cards.forEach(function (destCard) {
        var mid = destCard.getAttribute('data-mid');
        var m = T.matchById ? T.matchById[mid] : null;
        if (!m) return;

        var destRect = destCard.getBoundingClientRect();
        var tx = destRect.left - bkRect.left;
        var ty = (destRect.top + destRect.bottom) / 2 - bkRect.top;

        var srcA = (m.a && m.a.k === 'winner') ? cardMap[m.a.m] : null;
        var srcB = (m.b && m.b.k === 'winner') ? cardMap[m.b.m] : null;

        if (!srcA && !srcB) return;

        if (srcA && srcB) {
          var rectA = srcA.getBoundingClientRect();
          var rectB = srcB.getBoundingClientRect();

          var upperIsA = rectA.top <= rectB.top;
          var rTop = upperIsA ? rectA : rectB;
          var rBot = upperIsA ? rectB : rectA;
          var mTop = upperIsA ? m.a.m : m.b.m;
          var mBot = upperIsA ? m.b.m : m.a.m;

          var sxTop = rTop.right - bkRect.left;
          var syTop = (rTop.top + rTop.bottom) / 2 - bkRect.top;
          var sxBot = rBot.right - bkRect.left;
          var syBot = (rBot.top + rBot.bottom) / 2 - bkRect.top;

          var sx = Math.max(sxTop, sxBot);
          var mx = sx + (tx - sx) * 0.48;

          var vTop = T.view(T.matchById[mTop]);
          var vBot = T.view(T.matchById[mBot]);
          var winTop = vTop && vTop.done;
          var winBot = vBot && vBot.done;

          var r = Math.min(8, Math.abs(ty - syTop) / 2, Math.abs(syBot - ty) / 2, (tx - sx) / 4);

          var pathTop = 'M ' + sxTop + ' ' + syTop +
                        ' L ' + (mx - r) + ' ' + syTop +
                        ' Q ' + mx + ' ' + syTop + ' ' + mx + ' ' + (syTop + r) +
                        ' L ' + mx + ' ' + ty;

          var pathBot = 'M ' + sxBot + ' ' + syBot +
                        ' L ' + (mx - r) + ' ' + syBot +
                        ' Q ' + mx + ' ' + syBot + ' ' + mx + ' ' + (syBot - r) +
                        ' L ' + mx + ' ' + ty;

          var hasAdv = winTop || winBot;
          var stemCls = hasAdv ? 'bk-path win' : 'bk-path';
          var stemMarker = hasAdv ? 'url(#' + winArrId + ')' : 'url(#arr-def)';
          var stemPath = 'M ' + mx + ' ' + ty + ' L ' + tx + ' ' + ty;

          paths += '<path class="' + (winTop ? 'bk-path win' : 'bk-path') + '" d="' + pathTop + '" />';
          paths += '<path class="' + (winBot ? 'bk-path win' : 'bk-path') + '" d="' + pathBot + '" />';
          paths += '<path class="' + stemCls + '" marker-end="' + stemMarker + '" d="' + stemPath + '" />';

        } else {
          var srcCard = srcA || srcB;
          var srcRef = srcA ? m.a : m.b;
          var srcRect = srcCard.getBoundingClientRect();
          var sx = srcRect.right - bkRect.left;
          var sy = (srcRect.top + srcRect.bottom) / 2 - bkRect.top;
          var mx = sx + (tx - sx) * 0.48;

          var vSrc = T.view(T.matchById[srcRef.m]);
          var isWin = vSrc && vSrc.done;
          var pCls = isWin ? 'bk-path win' : 'bk-path';
          var pMarker = isWin ? 'url(#' + winArrId + ')' : 'url(#arr-def)';

          var pathStr = '';
          if (Math.abs(ty - sy) < 3) {
            pathStr = 'M ' + sx + ' ' + sy + ' L ' + tx + ' ' + ty;
          } else {
            var r = Math.min(8, Math.abs(ty - sy) / 2, (tx - sx) / 4);
            var dir = ty > sy ? 1 : -1;
            pathStr = 'M ' + sx + ' ' + sy +
                      ' L ' + (mx - r) + ' ' + sy +
                      ' Q ' + mx + ' ' + sy + ' ' + mx + ' ' + (sy + r * dir) +
                      ' L ' + mx + ' ' + (ty - r * dir) +
                      ' Q ' + mx + ' ' + ty + ' ' + (mx + r) + ' ' + ty +
                      ' L ' + tx + ' ' + ty;
          }

          paths += '<path class="' + pCls + '" marker-end="' + pMarker + '" d="' + pathStr + '" />';
        }
      });

      svg.innerHTML = defs + paths;
    });
  }

  function renderBracket(ev) {
    var k = sportKey(ev.sport);

    if (ev.format === 'r6diff') return renderR6(ev, k);

    var rounds = [];
    ['VL', 'TK', 'BK', 'CK'].forEach(function (r) {
      var list = T.matchesOf(ev.id).filter(function (m) { return m.round === r; })
                  .sort(function (a, b) { return a.index - b.index; });
      if (list.length) rounds.push({ key: r, name: Tournament.ROUND_NAME[r], list: list });
    });

    var html = '<div class="bk-scroll"><div class="bk" data-sport="' + k + '">';
    html += '<svg class="bk-svg-lines" aria-hidden="true"></svg>';
    rounds.forEach(function (rd) {
      html += '<div class="bk-wrapcol"><span class="rnd">' + esc(rd.name) + '</span>' +
              '<div class="bk-col">' +
              rd.list.map(function (m) { return bkCard(m, rd.key === 'CK' ? 'ck' : ''); }).join('') +
              '</div></div>';
    });
    html += '</div></div>';

    var lose = loserBranch(ev);
    var win = lose
      ? '<div class="bk-branch win"><div class="bk-bh"><b>Nhánh thắng</b>' +
        '<span>Thắng là đi tiếp tới chung kết.</span></div>' + html + '</div>'
      : html;
    return win + lose + thirdPlaceHtml(ev) + podiumHtml(ev);
  }

  /* Nhánh thua: sáu đội thua vòng loại đấu tiếp, hai đội tốt nhất quay lại
     tứ kết. Vẽ thành một nhánh riêng nằm dưới nhánh thắng. */
  function loserBranch(ev) {
    var vv = T.matchesOf(ev.id).filter(function (m) { return m.round === 'VV'; })
              .sort(function (a, b) { return a.index - b.index; });
    if (!vv.length) return '';

    var rp = T.repechage(ev);
    var note;
    if (rp.tie) {
      note = '<span class="chip warn">Bằng cả hiệu số lẫn tổng điểm — BTC bốc thăm</span>';
    } else if (rp.clash) {
      note = '<span class="chip warn">Hai đội đều gặp lại đội đã loại mình — BTC xếp tay</span>';
    } else if (rp.swapped) {
      note = '<span class="chip">Đã đổi chỗ hai đội để không gặp lại đội đã loại mình</span>';
    } else if (rp.ready) {
      note = '<span class="chip ok">Đã chọn xong 2 đội lên tứ kết</span>';
    } else {
      note = '<span class="chip">Chờ đủ kết quả 3 trận</span>';
    }

    var rows = rp.rows.map(function (r, i) {
      return '<li class="' + (i < 2 && rp.ready ? 'in' : '') + '">' +
        '<b>' + esc(r.label) + '</b>' +
        '<span class="sc">' + esc(r.score) + '</span>' +
        '<span class="df">hiệu số ' + r.diff + '</span>' +
        '<span class="st">' + (i < 2 && rp.ready ? 'Lên tứ kết' : 'Dừng') + '</span>' +
      '</li>';
    }).join('');

    var k = sportKey(ev.sport);
    return '<div class="bk-branch lose">' +
      '<div class="bk-bh"><b>Nhánh thua</b>' +
        '<span>Sáu đội thua vòng loại đấu tiếp. Hai đội thắng có hiệu số cao nhất quay lại tứ kết; ' +
        'bằng hiệu số thì xét tổng điểm.</span>' + note + '</div>' +
      '<div class="bk-scroll"><div class="bk" data-sport="' + k + '">' +
        '<div class="bk-wrapcol"><span class="rnd">Nhánh thua</span>' +
          '<div class="bk-col bk-row">' + vv.map(function (m) { return bkCard(m); }).join('') + '</div>' +
        '</div>' +
      '</div></div>' +
      (rows ? '<ol class="vv-r">' + rows + '</ol>' : '') +
    '</div>';
  }

  /* Trận tranh hạng Ba, nếu nội dung đó có. */
  function thirdPlaceHtml(ev) {
    var tb = T.matchById[ev.id + '-TB-1'];
    if (!tb) return '';
    return '<div class="vv tb"><div class="vv-h"><b>Tranh hạng Ba</b>' +
      '<span>Hai đội thua bán kết gặp nhau.</span></div>' +
      '<div class="vv-m">' + matchRow(tb) + '</div></div>';
  }

  function renderR6(ev, k) {
    var r1 = T.matchesOf(ev.id).filter(function (m) { return m.round === 'R1'; });
    var ck = T.matchById[ev.id + '-CK-1'];
    var rank = T.diffRanking(ev);

    var rows = rank.rows.length
      ? rank.rows.map(function (r, i) {
          return '<tr class="' + (i < 2 ? 'q1' : '') + '"><td class="n">' + (i + 1) + '</td>' +
                 '<td>' + esc(r.label) + '</td><td class="n">+' + r.diff + '</td>' +
                 '<td class="n">' + esc(r.score) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="4" class="pend">Chờ kết quả 3 trận vòng đầu</td></tr>';

    var warn = rank.tie
      ? '<div class="note" style="margin-top:12px"><div>Hai đội có hiệu số bằng nhau — ' +
        'theo luật thì bốc thăm để chọn đội vào chung kết.</div></div>'
      : '';

    return '<div class="r6">' +
      '<div><div class="m-group"><h3><b>Vòng đầu</b><span class="chip dim">3 trận</span></h3>' +
        '<div class="m-list">' + r1.map(function (m) { return matchRow(m); }).join('') + '</div></div>' +
        '<div class="m-group"><h3><b>Chung kết</b></h3><div class="m-list">' + matchRow(ck) + '</div></div>' +
      '</div>' +
      '<div class="card"><h3 style="font-size:.98rem;margin-bottom:8px">Bảng hiệu số đội thắng</h3>' +
        '<table class="dtab"><thead><tr><th>Hạng</th><th>Đội thắng</th><th>Hiệu số</th><th>Tỉ số</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>' +
        '<p style="font-size:.84rem;color:var(--muted-2);margin-top:10px">' +
        'Hai đội hạng 1 và 2 vào chung kết. Đội thắng còn lại nhận hạng ba.</p>' + warn +
      '</div>' +
    '</div>' + podiumHtml(ev);
  }

  function podiumHtml(ev) {
    var p = T.podium(ev);
    var isR6 = ev.format === 'r6diff';

    function podCard(rankCls, icon, medal, title, val, hint) {
      var list = val == null ? [] : (Array.isArray(val) ? val : [val]);
      var hasWinner = list.length > 0;
      var bodyHtml = hasWinner
        ? list.map(function (x) {
            return '<div class="pod-winner"><span class="pod-star">★</span><span class="pod-name">' + esc(x) + '</span></div>';
          }).join('')
        : '<div class="pod-winner pend"><span class="pod-dot"></span><i>' + esc(hint || 'Chờ kết quả') + '</i></div>';

      return '<div class="pod-card ' + rankCls + (hasWinner ? ' has-winner' : '') + '">' +
        '<div class="pod-top">' +
          '<span class="pod-badge">' + medal + ' ' + title + '</span>' +
          '<span class="pod-icon">' + icon + '</span>' +
        '</div>' +
        '<div class="pod-body">' + bodyHtml + '</div>' +
      '</div>';
    }

    return '<div class="podium-shell">' +
      '<div class="podium-header">' +
        '<div class="podium-title"><svg class="ic" width="18" height="18"><use href="#i-trophy"/></svg><b>Bảng vinh danh giải thưởng</b></div>' +
        '<span class="podium-sub">' + esc(ev.name) + '</span>' +
      '</div>' +
      '<div class="podium-grid">' +
        podCard('gold',   '🏆', '🥇', 'Giải Nhất', p.champion, 'Chờ trận chung kết') +
        podCard('silver', '🥈', '🥈', 'Giải Nhì',  p.runnerUp,  'Chờ trận chung kết') +
        podCard('bronze', '🥉', '🥉', isR6 ? 'Hạng Ba' : 'Đồng Giải Ba', p.third, 'Chờ trận bán kết') +
      '</div>' +
    '</div>';
  }

  function renderBracketPane(evId) {
    var ev = T.eventById[evId];
    var head = '';
    if (ev.statusNote) {
      head = '<div class="note" style="margin-bottom:16px"><div><b>' + esc(ev.name) + ':</b> ' +
             esc(ev.statusNote) + '</div></div>';
    }
    if (localSeeds[ev.id] && localSeeds[ev.id].length) {
      head += '<p class="bk-hint">Nhánh này đang dùng kết quả <b>bốc thăm lưu trên máy này</b>, ' +
              'máy khác sẽ thấy khác. Dán đoạn <code>seeds</code> vào data.js để chốt cho cả nhà, ' +
              'hoặc bấm “Xóa dữ liệu máy này” trong Bảng BTC để quay về bản gốc.</p>';
    }
    if (!(ev.seeds || []).length) {
      head += '<p class="bk-hint">Vị trí trên nhánh chưa bốc thăm nên đang hiện ' +
              '<b>Đội 1 … Đội ' + ev.teamCount + '</b>. ' +
              (window.innerWidth < 760 ? 'Kéo ngang để xem hết nhánh đấu.' : '') + '</p>';
    } else if (window.innerWidth < 760) {
      head += '<p class="bk-hint">Kéo ngang để xem hết nhánh đấu.</p>';
    }
    $('#bracket-pane').innerHTML = '<div class="pane">' + head + renderBracket(ev) + '</div>';
    requestAnimationFrame(function () {
      updateBracketSvg();
      setTimeout(updateBracketSvg, 60);
    });
  }

  /* =====================================================================
     ĐỘI & VẬN ĐỘNG VIÊN
     ===================================================================== */
  /* --------- tường người tham dự: lấy thẳng từ danh sách đăng ký --------- */
  var DEPT_HUE = {};
  function deptHue(d) {
    if (DEPT_HUE[d] != null) return DEPT_HUE[d];
    var h = 0;
    for (var i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) % 360;
    DEPT_HUE[d] = h;
    return h;
  }

  function renderPeopleWall() {
    var host = $('#people-wall');
    if (!host) return;

    /* gom tất cả người kèm bộ phận và các nội dung họ đăng ký */
    var map = {};
    function add(name, dept, ev) {
      if (!name) return;
      var k = String(name).trim();
      if (!k) return;
      if (!map[k]) map[k] = { name: k, dept: dept || '', events: [] };
      if (dept && !map[k].dept) map[k].dept = dept;
      if (ev && map[k].events.indexOf(ev) < 0) map[k].events.push(ev);
    }
    D.events.forEach(function (ev) {
      (ev.players || []).forEach(function (pl) { add(pl.name, pl.dept, ev.short); });
      (ev.teams || []).forEach(function (t) {
        var parts = String(t.dept || '').split('·');
        add(t.p1, (parts[0] || '').trim(), ev.short);
        add(t.p2, (parts[1] || parts[0] || '').trim(), ev.short);
      });
      if (ev.waiting) ev.waiting.names.forEach(function (n) { add(n, '', ev.short); });
    });
    D.jumpRope.groups.forEach(function (g) {
      g.athletes.forEach(function (a) { add(a.name, a.dept, D.jumpRope.name); });
    });

    var list = Object.keys(map).map(function (k) { return map[k]; })
      .sort(function (a, b) { return b.events.length - a.events.length || a.name.localeCompare(b.name, 'vi'); });

    host.innerHTML =
      '<div class="people-h">' +
        '<b>' + list.length + ' người đã đăng ký thi đấu</b>' +
        '<span>Màu theo bộ phận · số nội dung ghi ở góc</span>' +
      '</div>' +
      '<div class="people-grid">' + list.map(function (pp, i) {
        var hue = deptHue(pp.dept || '—');
        return '<span class="pw" style="--h:' + hue + 'deg;--d:' + (Math.min(i, 24) * 18) + 'ms" ' +
          'title="' + esc(pp.name + (pp.dept ? ' · ' + pp.dept : '') + ' — ' + pp.events.join(', ')) + '">' +
          '<i class="fc">' + esc(initials(pp.name)) + '</i>' +
          (pp.events.length > 1 ? '<i class="cn">' + pp.events.length + '</i>' : '') +
          '<i class="nm">' + esc(pp.name) + '</i>' +
        '</span>';
      }).join('') + '</div>';
  }

  function renderTeamPane(key) {
    var host = $('#team-pane');

    if (key === 'jump') {
      var jr = D.jumpRope;
      host.innerHTML = '<div class="pane">' + jr.groups.map(function (g) {
        return '<div class="m-group"><h3><b>' + esc(g.label) + '</b>' +
          '<span class="chip dim">' + g.athletes.length + ' người · ' + g.heats + ' lượt</span></h3>' +
          '<div class="plist">' + g.athletes.map(function (a) {
            return '<div class="pl"><span class="i">' + esc(a.bib) + '</span>' +
                   '<span class="n">' + esc(a.name) + '</span>' +
                   '<span class="d">' + esc(a.dept) + '</span></div>';
          }).join('') + '</div></div>';
      }).join('') + '</div>';
      return;
    }

    var ev = T.eventById[key], html = '';
    if (ev.statusNote) {
      html += '<div class="note" style="margin-bottom:16px"><div>' + esc(ev.statusNote) + '</div></div>';
    }
    html += '<p style="color:var(--muted);font-size:.92rem;margin-bottom:16px">' +
            esc(ev.drawRule) + '</p>';

    if ((ev.teams || []).length) {
      var k = sportKey(ev.sport);
      html += '<div class="m-group"><h3><b>Các cặp đã ghép</b>' +
              '<span class="chip dim">' + ev.teams.length + ' đội</span></h3>' +
              '<div class="teams">' + ev.teams.map(function (t) {
                return '<div class="team ' + k + '"><span class="no">' + t.id + '</span>' +
                  '<span class="pp"><b>' + esc(t.p1) + '</b><b>' + esc(t.p2) + '</b>' +
                  '<span>' + esc(t.dept || '') + '</span>' +
                  (t.note ? '<span class="chip warn" style="margin-top:5px">' + esc(t.note) + '</span>' : '') +
                  '</span></div>';
              }).join('') + '</div></div>';
    }

    if ((ev.players || []).length) {
      html += '<div class="m-group"><h3><b>Danh sách đăng ký</b>' +
              '<span class="chip dim">' + ev.players.length + ' người</span></h3>' +
              '<div class="plist">' + ev.players.map(function (p) {
                return '<div class="pl"><span class="i">' + p.no + '</span>' +
                  '<span class="n">' + esc(p.name) + '</span>' +
                  (p.note ? '<span class="chip warn" style="font-size:.66rem;padding:1px 6px">' + esc(p.note) + '</span>' : '') +
                  '<span class="d">' + esc(p.dept) + '</span></div>';
              }).join('') + '</div></div>';
    }

    if (ev.waiting && ev.waiting.names.length) {
      html += '<div class="m-group"><h3><b>' + esc(ev.waiting.label) + '</b>' +
              '<span class="chip warn">' + ev.waiting.names.length + ' người</span></h3>' +
              '<div class="plist">' + ev.waiting.names.map(function (n) {
                return '<div class="pl"><span class="n">' + esc(n) + '</span></div>';
              }).join('') + '</div></div>';
    }

    host.innerHTML = '<div class="pane">' + html + '</div>';
  }

  /* =====================================================================
     LUẬT
     ===================================================================== */
  var COURT_SVG = {
    pickleball:
      '<svg viewBox="0 0 420 200" role="img" aria-label="Sơ đồ sân pickleball">' +
      '<rect x="10" y="12" width="400" height="176" rx="4" fill="rgba(185,242,74,.07)" stroke="rgba(185,242,74,.5)" stroke-width="2"/>' +
      '<rect x="146" y="12" width="128" height="176" fill="rgba(185,242,74,.1)"/>' +
      '<line x1="210" y1="4" x2="210" y2="196" stroke="#fff" stroke-width="3" stroke-dasharray="7 5" opacity=".8"/>' +
      '<line x1="146" y1="12" x2="146" y2="188" stroke="rgba(185,242,74,.8)" stroke-width="2"/>' +
      '<line x1="274" y1="12" x2="274" y2="188" stroke="rgba(185,242,74,.8)" stroke-width="2"/>' +
      '<line x1="10" y1="100" x2="146" y2="100" stroke="rgba(185,242,74,.55)" stroke-width="1.5"/>' +
      '<line x1="274" y1="100" x2="410" y2="100" stroke="rgba(185,242,74,.55)" stroke-width="1.5"/>' +
      '<text x="210" y="106" fill="#b9f24a" font-size="11" text-anchor="middle" font-weight="700">LƯỚI</text>' +
      '<text x="178" y="106" fill="#9aa0b4" font-size="10" text-anchor="middle">bếp</text>' +
      '<text x="242" y="106" fill="#9aa0b4" font-size="10" text-anchor="middle">bếp</text>' +
      '<text x="78" y="56" fill="#9aa0b4" font-size="10" text-anchor="middle">ô trái</text>' +
      '<text x="78" y="150" fill="#9aa0b4" font-size="10" text-anchor="middle">ô phải</text>' +
      '<text x="342" y="56" fill="#9aa0b4" font-size="10" text-anchor="middle">ô phải</text>' +
      '<text x="342" y="150" fill="#9aa0b4" font-size="10" text-anchor="middle">ô trái</text>' +
      '<path d="M60 150 C140 150 260 60 350 56" fill="none" stroke="#ffc24b" stroke-width="2" stroke-dasharray="6 5"/>' +
      '<path d="M350 56 l-11 -4 l2 9 z" fill="#ffc24b"/>' +
      '</svg>',
    caulong:
      '<svg viewBox="0 0 420 200" role="img" aria-label="Sơ đồ sân cầu lông đôi">' +
      '<rect x="10" y="12" width="400" height="176" rx="4" fill="rgba(69,216,243,.07)" stroke="rgba(69,216,243,.5)" stroke-width="2"/>' +
      '<line x1="210" y1="4" x2="210" y2="196" stroke="#fff" stroke-width="3" stroke-dasharray="7 5" opacity=".8"/>' +
      '<line x1="152" y1="12" x2="152" y2="188" stroke="rgba(69,216,243,.75)" stroke-width="1.5"/>' +
      '<line x1="268" y1="12" x2="268" y2="188" stroke="rgba(69,216,243,.75)" stroke-width="1.5"/>' +
      '<line x1="36" y1="12" x2="36" y2="188" stroke="rgba(69,216,243,.55)" stroke-width="1.5"/>' +
      '<line x1="384" y1="12" x2="384" y2="188" stroke="rgba(69,216,243,.55)" stroke-width="1.5"/>' +
      '<line x1="10" y1="100" x2="152" y2="100" stroke="rgba(69,216,243,.55)" stroke-width="1.5"/>' +
      '<line x1="268" y1="100" x2="410" y2="100" stroke="rgba(69,216,243,.55)" stroke-width="1.5"/>' +
      '<rect x="268" y="12" width="116" height="88" fill="rgba(255,194,75,.2)"/>' +
      '<text x="326" y="60" fill="#ffc24b" font-size="10" text-anchor="middle" font-weight="700">ô nhận giao</text>' +
      '<text x="90" y="152" fill="#9aa0b4" font-size="10" text-anchor="middle">người giao (ô phải)</text>' +
      '<text x="210" y="106" fill="#45d8f3" font-size="11" text-anchor="middle" font-weight="700">LƯỚI</text>' +
      '<path d="M90 142 C150 130 240 80 320 62" fill="none" stroke="#ffc24b" stroke-width="2" stroke-dasharray="6 5"/>' +
      '<path d="M320 62 l-11 -4 l2 9 z" fill="#ffc24b"/>' +
      '</svg>'
  };

  function renderRulePane(key) {
    var g = D.rules.groups.filter(function (x) { return x.key === key; })[0];
    var html = '<div class="pane" data-accent="' + g.accent + '">';

    if (g.court && COURT_SVG[key]) {
      html += '<figure class="diag" style="margin:0 0 16px">' + COURT_SVG[key] +
              '<figcaption><b>' + esc(g.court.size) + '.</b> ' + esc(g.court.detail) +
              ' Mũi tên vàng là hướng giao.</figcaption></figure>';
    }

    html += '<div class="rule-cols">' + g.blocks.map(function (b) {
      return '<div class="rblock"><h4>' + esc(b.title) + '</h4><ul>' +
             b.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
             '</ul></div>';
    }).join('') + '</div>';

    if (g.examples.length) {
      html += '<div class="grid g-2" style="margin-top:14px">' + g.examples.map(function (ex) {
        return '<div class="tblwrap"><table class="ex"><caption>' + esc(ex.title) + '</caption>' +
          '<thead><tr>' + ex.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>' +
          '<tbody>' + ex.rows.map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table></div>';
      }).join('') + '</div>';
    }

    if (g.tip) html += '<div class="tip">' + esc(g.tip) + '</div>';
    $('#rule-pane').innerHTML = html + '</div>';
  }

  function renderGeneral() {
    $('#gen-rules').innerHTML = D.rules.common.items.map(function (it, i) {
      return '<div class="it reveal" style="--d:' + (i * 55) + 'ms">' +
        '<span class="k">' + (i + 1) + '</span>' +
        '<div><b>' + esc(it.n) + '</b><p>' + esc(it.t) + '</p></div>' +
      '</div>';
    }).join('');
  }

  /* =====================================================================
     GIẢI THƯỞNG
     ===================================================================== */
  function renderAwards() {
    var a = D.awards;
    $('#award-note').textContent = a.note;
    var med = ['🥇', '🥈', '🥉'];
    $('#award-cards').innerHTML = a.perEvent.map(function (p, i) {
      return '<div class="awc r' + p.rank + ' reveal" style="--d:' + (i * 70) + 'ms">' +
        '<div class="med">' + med[i] + '</div><b>' + esc(p.label) + '</b>' +
        '<span><i data-countup="' + p.count + '" style="font-style:normal">' + p.count + '</i> giải mỗi nội dung' + (p.note ? '<br>' + esc(p.note) : '') + '</span></div>';
    }).join('');
    $('#award-lines').innerHTML = a.lines.map(function (l) {
      return '<li>' + esc(l) + '</li>';
    }).join('');
  }

  /* các con số nhỏ trên tiêu đề mục: lấy từ dữ liệu để không bao giờ lệch */
  /* =====================================================================
     TABS
     ===================================================================== */
  function buildTabs(host, items, onPick, accentCls) {
    var el = $(host);
    if (!el) return;
    var panelId = el.id.replace('-tabs', '-pane');
    if (accentCls) el.className = 'tabs reveal ' + accentCls;
    el.innerHTML = items.map(function (it, i) {
      return '<button role="tab" aria-controls="' + panelId + '" aria-selected="' + (i === 0) +
             '" tabindex="' + (i === 0 ? 0 : -1) + '" data-k="' + esc(it.id) + '">' +
             esc(it.label) + '</button>';
    }).join('');

    /* làm mờ mép phải khi còn tab bị khuất */
    function markOverflow() {
      el.classList.toggle('more', el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
    }
    el.addEventListener('scroll', markOverflow, { passive: true });
    window.addEventListener('resize', markOverflow);

    function pick(b) {
      $$('button', el).forEach(function (x) {
        var on = x === b;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
      });
      markOverflow();
      if (el.scrollWidth > el.clientWidth) {
        var r = b.getBoundingClientRect(), er = el.getBoundingClientRect();
        if (r.left < er.left + 8) el.scrollLeft += r.left - er.left - 12;
        else if (r.right > er.right - 8) el.scrollLeft += r.right - er.right + 12;
      }
      onPick(b.dataset.k);
    }

    el.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-k]');
      if (b) pick(b);
    });

    /* điều hướng bằng phím mũi tên như chuẩn tablist */
    el.addEventListener('keydown', function (e) {
      var bs = $$('button', el), i = bs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = bs[(i + 1) % bs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = bs[(i - 1 + bs.length) % bs.length];
      else if (e.key === 'Home') n = bs[0];
      else if (e.key === 'End') n = bs[bs.length - 1];
      if (!n) return;
      e.preventDefault();
      pick(n);
      n.focus();
    });

    onPick(items[0].id);
    requestAnimationFrame(markOverflow);
    /* đo lại sau khi font web tải xong, lúc đó bề rộng tab mới đúng */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(markOverflow);
    setTimeout(markOverflow, 600);
  }

  /* =====================================================================
     BẢNG BTC
     ===================================================================== */
  /* Thư ký đứng ngoài sân chỉ cầm điện thoại, nên bảng mặc định lọc theo
     đúng sân mình phụ trách. Chọn một lần, lần sau mở là nhớ. */
  var K_COURT = 'vhtt.court.v1';
  var admCourt = lsGet(K_COURT) || 'all';

  function allCourts() {
    var out = [];
    D.venues.forEach(function (vn) {
      vn.courts.forEach(function (c) { out.push(c); });
    });
    return out;
  }

  function renderAdmin() {
    var courts = allCourts();
    if (admCourt !== 'all' && !courts.some(function (c) { return c.id === admCourt; })) {
      admCourt = 'all';
    }

    var chips = '<div class="adm-courts" id="adm-courts">' +
      '<button class="fchip' + (admCourt === 'all' ? ' on' : '') + '" data-c="all">Tất cả' +
        '<span>' + T.matches.length + '</span></button>' +
      courts.map(function (c) {
        var n = T.matchesOfCourt(c.id).length;
        return '<button class="fchip' + (admCourt === c.id ? ' on' : '') + '" data-c="' + esc(c.id) + '">' +
          esc(c.short || c.name) + '<span>' + n + '</span></button>';
      }).join('') + '</div>';

    var html =
      '<p class="hint">Chọn sân mình phụ trách, rồi nhập điểm từng trận. ' +
      'Bấm ra ngoài ô là lưu — không cần nút Lưu.</p>' +
      chips +
      '<div class="adm-jump"><button class="btn btn-sm btn-pri" id="adm-now">' +
        'Tới trận chưa đấu đầu tiên</button></div>' +
      '<div id="adm-msg" role="status" aria-live="polite"></div>';

    var shown = 0;
    D.venues.forEach(function (vn) {
      vn.courts.forEach(function (c) {
        if (admCourt !== 'all' && c.id !== admCourt) return;
        var list = T.matchesOfCourt(c.id);
        if (!list.length) return;
        html += '<h4>' + esc(c.name) + '</h4>';
        list.forEach(function (m) {
          shown++;
          var v = T.view(m);
          function line(team, score, which) {
            return '<div class="sl">' +
              '<b title="' + esc(team.label) + '">' + esc(team.label) + '</b>' +
              '<span class="stp">' +
                '<button type="button" class="stp-b" data-d="-1" aria-label="Bớt 1 điểm cho ' + esc(team.label) + '">–</button>' +
                '<input type="number" min="0" max="99" inputmode="numeric" data-s="' + which + '" ' +
                'aria-label="Điểm của ' + esc(team.label) + ' trong ' + esc(m.label) + '" value="' +
                (score == null ? '' : score) + '">' +
                '<button type="button" class="stp-b" data-d="1" aria-label="Thêm 1 điểm cho ' + esc(team.label) + '">+</button>' +
              '</span></div>';
          }
          html += '<div class="arow' + (v.done ? ' done' : '') + '" data-m="' + esc(m.id) + '" data-ev="' + esc(m.eventId) + '">' +
            '<div class="meta">' + esc(m.time + ' · ' + v.event.short + ' · ' + m.label) +
            ' · chạm ' + m.targetScore + '</div>' +
            line(v.teamA, v.scoreA, 'a') + line(v.teamB, v.scoreB, 'b') +
          '</div>';
        });
      });
    });

    if (!shown) html += '<p class="hint">Sân này chưa có trận nào.</p>';
    $('#adm-body').innerHTML = html;
  }

  function onAdminInput(e) {
    var inp = e.target.closest('.arow input');
    if (!inp) return;
    var row = inp.closest('.arow'), id = row.dataset.m;
    var a = $('input[data-s="a"]', row).value.trim();
    var b = $('input[data-s="b"]', row).value.trim();
    if (a === '' || b === '') delete localResults[id];
    else localResults[id] = [Number(a), Number(b)];
    lsSet(LS_RESULTS, localResults);
    mergeResults();
    refreshResults();
    syncAdminLabels();
    markAdminDone();
  }

  /* đánh dấu hàng đã có kết quả, để nút "tới trận chưa đấu" biết nhảy đâu */
  function markAdminDone() {
    $$('#adm-body .arow').forEach(function (row) {
      var m = T.matchById[row.dataset.m];
      if (m) row.classList.toggle('done', T.view(m).done);
    });
  }

  /* cập nhật tên đội trong bảng BTC tại chỗ, không dựng lại DOM để khỏi mất con trỏ */
  function syncAdminLabels() {
    $$('#adm-body .arow').forEach(function (row) {
      var m = T.matchById[row.dataset.m];
      if (!m) return;
      var v = T.view(m);
      $$('.sl', row).forEach(function (sl, i) {
        var team = i === 0 ? v.teamA : v.teamB;
        var b = $('b', sl);
        if (b && b.textContent !== team.label) { b.textContent = team.label; b.title = team.label; }
      });
    });
  }

  function admSay(msg, pre) {
    var box = $('#adm-msg');
    if (!box) return;
    box.innerHTML = '<p class="hint" style="margin:0">' + esc(msg) + '</p>' +
      (pre ? '<textarea class="ta" readonly spellcheck="false">' + esc(pre) + '</textarea>' : '');
    box.scrollIntoView({ block: 'nearest' });
  }

  function drawSeeds() {
    var NL = String.fromCharCode(10);
    var over = D.events.filter(function (ev) {
      return (ev.teams || []).length > ev.teamCount;
    });

    /* nhiều cặp hơn số suất trên nhánh -> phải hỏi trước, không âm thầm bỏ ai */
    if (over.length) {
      var q = 'Có nội dung đang nhiều cặp hơn số suất trên nhánh đấu:' + NL + NL +
        over.map(function (ev) {
          return '· ' + ev.name + ': ' + ev.teams.length + ' cặp / ' + ev.teamCount + ' suất';
        }).join(NL) + NL + NL +
        'Bốc thăm bây giờ sẽ bốc ngẫu nhiên cả suất thi lẫn cặp phải nghỉ. ' +
        'Nếu BTC muốn tự chọn thì bấm Hủy, sửa teams/teamCount trong data.js rồi bốc lại.' + NL + NL +
        'Vẫn bốc ngẫu nhiên?';
      if (!confirm(q)) {
        admSay('Chưa bốc thăm. Hãy chốt số đội cho ' +
               over.map(function (ev) { return ev.short; }).join(', ') + ' trong data.js trước.');
        return;
      }
    }

    var done = [], skipped = [], dropped = [];
    D.events.forEach(function (ev) {
      if ((ev.teams || []).length < ev.teamCount) {
        skipped.push(ev.short + ' (mới có ' + (ev.teams || []).length + '/' + ev.teamCount + ' đội)');
        return;
      }
      var ids = ev.teams.map(function (t) { return t.id; });
      for (var i = ids.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
      }
      ev.seeds = ids.slice(0, ev.teamCount);
      ids.slice(ev.teamCount).forEach(function (id) {
        dropped.push(ev.short + ': ' + T.teamLabel(ev, id));
      });
      localSeeds[ev.id] = ev.seeds.slice();
      done.push(ev);
    });

    lsSet(LS_SEEDS, localSeeds);
    T.replan();            /* bốc thăm xong mới biết ai đánh trận nào -> xếp lại giờ */
    renderAgenda();            /* dựng lại trước, để markTimelineNow còn chỗ mà tô */
    refreshResults();
    renderSport();
    renderAdmin();
    revealScan();

    var msg = done.length
      ? 'Đã bốc thăm vị trí cho ' + done.length + ' nội dung. Dán đoạn dưới vào data.js để lưu lâu dài.'
      : 'Chưa bốc được nội dung nào.';
    if (skipped.length) msg += ' Chưa bốc: ' + skipped.join('; ') + '.';
    if (dropped.length) msg += ' Cặp phải nghỉ: ' + dropped.join('; ') + '.';

    admSay(msg, done.map(function (ev) {
      return '// ' + ev.name + NL + 'seeds: [' + ev.seeds.join(', ') + '],';
    }).join(NL + NL));
  }

  /* =====================================================================
     ĐỒNG BỘ KẾT QUẢ TỪ GOOGLE SHEETS
     ===================================================================== */
  function splitCsvLine(line) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line.charAt(i);
      if (q) {
        if (ch === '"') { if (line.charAt(i + 1) === '"') { cur += '"'; i++; } else q = false; }
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map(function (x) { return x.trim(); });
  }

  function parseCsv(text) {
    var out = {};
    text.replace(/^\uFEFF/, '').split(/\r?\n/).forEach(function (line, i) {
      if (!line.trim()) return;
      var c = splitCsvLine(line);
      if (i === 0 && /match/i.test(c[0])) return;
      if (!c[0] || c[1] === '' || c[2] === '' || c[1] == null || c[2] == null) return;
      var a = Number(c[1]), b = Number(c[2]);
      if (isNaN(a) || isNaN(b)) return;
      out[c[0]] = [a, b];
    });
    return out;
  }

  function setLiveState(ok, msg) {
    var el = $('#live-state');
    if (!CFG.resultsCsvUrl) { el.innerHTML = ''; return; }
    el.innerHTML = '<span class="live-flag' + (ok ? '' : ' off') + '"><i></i>' + esc(msg) + '</span>';
  }

  function pollResults() {
    if (!CFG.resultsCsvUrl) { setLiveState(false, ''); return; }
    var url = CFG.resultsCsvUrl + (CFG.resultsCsvUrl.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now();
    fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        remoteResults = parseCsv(txt);
        mergeResults();
        refreshResults();
        setLiveState(true, 'Kết quả trực tiếp · cập nhật ' +
          new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(function () { setLiveState(false, 'Chưa đọc được bảng kết quả trực tiếp, đang dùng số liệu sẵn có.'); })
      .then(function () {
        setTimeout(pollResults, Math.max(10, CFG.pollSeconds || 30) * 1000);
      });
  }

  /* =====================================================================
     VẼ LẠI PHẦN PHỤ THUỘC KẾT QUẢ
     ===================================================================== */
  var cur = { sched: 'court', bracket: null, team: null };

  function refreshResults() {
    renderSchedule(cur.sched);
    if (cur.bracket) renderBracketPane(cur.bracket);
    renderCourtBoard();
    if (typeof renderLive === 'function') renderLive(true);
  }

  /* =====================================================================
     HIỆU ỨNG
     ===================================================================== */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;

  function revealScan() {
    if (reduce) { $$('.reveal').forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    }
    $$('.reveal:not(.in)').forEach(function (e) { io.observe(e); });
  }


  /* Chiều cao thanh điều hướng dưới đáy thay đổi theo cỡ chữ và vùng an toàn
     của máy khuyết đỉnh, nên phải đo chứ không đoán — chân trang và nút
     "Về đầu trang" đều chừa chỗ theo biến này. */
  function sizeTabbar() {
    var rail = $('.rail');
    if (!rail) return;
    var bottom = window.matchMedia('(max-width: 999px)').matches;
    document.documentElement.style.setProperty(
      '--tabbar-h', bottom ? rail.offsetHeight + 'px' : '0px');
  }

  function scrollFx() {
    var bar = $('#progbar'), tt = $('#totop');
    var art = $('.hero-art .bridge'), rays = $('.hero-art .rays');
    var links = $$('#nav a');
    var secs = links.map(function (a) { return document.getElementById(a.hash.slice(1)); });
    var raf = false;

    function run() {
      raf = false;
      var y = window.scrollY || window.pageYOffset;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
      tt.classList.toggle('on', y > 700);

      /* Chọn mục có mép trên gần nhất phía trên vạch giữa — không lấy mục
         cuối cùng theo thứ tự menu, vì thứ tự menu không còn trùng thứ tự
         các mục trên trang. */
      var mid = y + window.innerHeight * 0.32, act = -1, best = -1;
      secs.forEach(function (s, i) {
        if (s && s.offsetTop <= mid && s.offsetTop > best) { best = s.offsetTop; act = i; }
      });
      links.forEach(function (a, i) {
        var on = i === act;
        a.classList.toggle('active', on);
        /* trình đọc màn hình cần biết đang ở mục nào, không chỉ đổi màu */
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });

      if (art && !reduce) {
        art.style.setProperty('--py', Math.min(90, y * 0.16) + 'px');
        if (rays) rays.style.setProperty('--py2', Math.min(140, y * 0.26) + 'px');
      }

    }
    function onScroll() { if (!raf) { raf = true; requestAnimationFrame(run); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    run();
  }

  /* =====================================================================
     SỰ KIỆN
     ===================================================================== */
  function wire() {
    /* --- tua slide bằng hai nút mũi tên --- */
    var pv = $('#hs-prev'), nx = $('#hs-next');
    if (pv) pv.addEventListener('click', function () { lsShow(lsIdx - 1); lsAuto(); });
    if (nx) nx.addEventListener('click', function () { lsShow(lsIdx + 1); lsAuto(); });

    /* --- ba ảnh phần Văn hóa: bấm hoặc Enter để phóng to --- */
    var shots = $('#pillar-shots');
    if (shots) {
      shots.addEventListener('click', function (e) {
        var f = e.target.closest('.pshot');
        if (f) { lastFocus = f; openShot(f.dataset.k); }
      });
      shots.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var f = e.target.closest('.pshot');
        if (!f) return;
        e.preventDefault();
        lastFocus = f;
        openShot(f.dataset.k);
      });
    }
    var lb = $('#lbox'), lbx = $('#lbox-x');
    function closeLbox() {
      if (!lb.classList.contains('on')) return;
      lb.classList.remove('on');
      lockBehind(adm.classList.contains('on') || proj.classList.contains('on'));
      restoreFocus();
    }
    if (lb) {
      lb.addEventListener('click', function (e) {
        /* bấm ra ngoài khung ảnh là đóng */
        if (e.target === lb) closeLbox();
      });
      if (lbx) lbx.addEventListener('click', closeLbox);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLbox();
      });
    }

    /* --- thẻ mở đầu chạy slide: bấm chấm để chuyển, rê chuột thì dừng --- */
    var card = $('.hero-card');
    if (card) {
      card.addEventListener('click', function (e) {
        var b = e.target.closest('#hs-dots button');
        if (!b) return;
        lsShow(Number(b.dataset.i));
        lsAuto();                       /* bấm tay thì đếm lại từ đầu */
      });
      card.addEventListener('mouseenter', function () { lsPaused = true; });
      card.addEventListener('mouseleave', function () { lsPaused = false; });
      card.addEventListener('focusin',  function () { lsPaused = true; });
      card.addEventListener('focusout', function () { lsPaused = false; });
    }

    /* --- hàng nút lọc nội dung thể thao --- */
    var filt = $('#ev-filter');
    if (filt) {
      filt.addEventListener('click', function (e) {
        var b = e.target.closest('.fchip');
        if (!b) return;
        evFilter = b.dataset.f;
        renderEvFilter();
        applyEvFilter();
      });
    }

    /* trả con trỏ bàn phím về chỗ cũ khi đóng lớp phủ */
    var lastFocus = null;
    function restoreFocus() {
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
      lastFocus = null;
    }

    /* khóa phần trang phía sau để phím Tab không chạy ra ngoài lớp phủ */
    var behind = [$('main'), $('.foot'), $('.rail'), $('#totop'), $('#nowbar')].filter(Boolean);
    lockShot = function (on) { lockBehind(on); };
    function lockBehind(on) {
      behind.forEach(function (el) {
        if (on) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
        else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
      });
    }
    /* trình duyệt chưa hỗ trợ inert: tự vòng phím Tab trong lớp phủ */
    var inertOk = 'inert' in HTMLElement.prototype;
    var FOCUSABLE = 'a[href], button, input, textarea, select, [tabindex]';
    function trap(box) {
      return function (e) {
        if (e.key !== 'Tab' || inertOk) return;
        var f = $$(FOCUSABLE, box).filter(function (x) {
          return !x.disabled && x.tabIndex >= 0 && x.offsetParent !== null;
        });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      };
    }

    /* máy chiếu */
    var proj = $('#proj');
    proj.addEventListener('keydown', trap(proj));
    function openProj(v) {
      if (v) lastFocus = document.activeElement;
      proj.classList.toggle('on', v);
      proj.setAttribute('aria-hidden', String(!v));
      lockBehind(v || adm.classList.contains('on'));
      if (v) $('#proj-x').focus(); else restoreFocus();
    }
    var bp = $('#btn-proj');
    if (bp) bp.addEventListener('click', function () { openProj(true); });
    $('#proj-x').addEventListener('click', function () { openProj(false); });

    /* bảng BTC */
    var adm = $('#adm'), scrim = $('#scrim');
    adm.addEventListener('keydown', trap(adm));
    function openAdm(v) {
      if (v) { lastFocus = document.activeElement; renderAdmin(); }
      adm.classList.toggle('on', v);
      scrim.classList.toggle('on', v);
      adm.setAttribute('aria-hidden', String(!v));
      lockBehind(v || proj.classList.contains('on'));
      if (v) $('#adm-x').focus(); else restoreFocus();
    }
    var bAdm = $('#btn-adm');
    if (bAdm) bAdm.addEventListener('click', function () { openAdm(true); });

    /* chọn sân + nút cộng trừ điểm + nhảy tới trận chưa đấu */
    $('#adm-body').addEventListener('click', function (e) {
      var chip = e.target.closest('#adm-courts .fchip');
      if (chip) {
        admCourt = chip.dataset.c;
        lsSet(K_COURT, admCourt);
        renderAdmin();
        return;
      }
      var stp = e.target.closest('.stp-b');
      if (stp) {
        var inp = $('input', stp.parentNode);
        var n = parseInt(inp.value, 10);
        if (isNaN(n)) n = 0;
        n = Math.max(0, Math.min(99, n + Number(stp.dataset.d)));
        inp.value = n;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      if (e.target.closest('#adm-now')) {
        var rows = $$('#adm-body .arow');
        for (var i = 0; i < rows.length; i++) {
          if (!rows[i].classList.contains('done')) {
            rows[i].scrollIntoView({ block: 'center' });
            var f = $('input', rows[i]);
            if (f) f.focus();
            return;
          }
        }
        admSay('Sân này đã nhập xong hết.');
      }
    });

    /* Lối vào kín cho thư ký ngoài sân: chạm vào logo CHP 5 lần liên tiếp. */
    var mark = $('.rail .mark') || $('.mark');
    if (mark) {
      var taps = 0, tapTimer = null;
      mark.addEventListener('click', function (e) {
        taps++;
        if (tapTimer) clearTimeout(tapTimer);
        if (taps >= 5) {
          e.preventDefault();
          e.stopPropagation();
          taps = 0;
          openAdm(true);
          return;
        }
        tapTimer = setTimeout(function () {
          taps = 0;
        }, 1200);
      });
    }
    $('#adm-x').addEventListener('click', function () { openAdm(false); });
    scrim.addEventListener('click', function () { openAdm(false); });
    adm.addEventListener('change', onAdminInput);
    adm.addEventListener('input', onAdminInput);

    $('#adm-csv').addEventListener('click', function () {
      var blob = new Blob([T.toCsv()], { type: 'text/csv;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ket-qua-ngay-hoi.csv';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
    $('#adm-copy').addEventListener('click', function () {
      var txt = T.toCsv();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(
          function () { admSay('Đã sao chép CSV vào bộ nhớ tạm. Dán thẳng vào Google Sheets.'); },
          function () { admSay('Trình duyệt không cho sao chép tự động, hãy chọn và copy đoạn dưới.', txt); }
        );
      } else {
        admSay('Chọn và copy đoạn dưới rồi dán vào Google Sheets.', txt);
      }
    });
    $('#adm-seed').addEventListener('click', drawSeeds);
    $('#adm-clear').addEventListener('click', function () {
      if (!confirm('Xóa toàn bộ điểm và kết quả bốc thăm đã lưu trên máy này?')) return;
      localResults = {}; localSeeds = {};
      lsDel(LS_RESULTS); lsDel(LS_SEEDS);
      D.events.forEach(function (ev) { ev.seeds = (baseSeeds[ev.id] || []).slice(); });
      T.replan();
      renderAgenda();
      mergeResults(); refreshResults(); renderAdmin(); renderSport(); revealScan();
      admSay('Đã xóa điểm và kết quả bốc thăm lưu trên máy này.');
    });

    /* phím tắt + tham số URL */
    var q = new URLSearchParams(location.search);
    if (q.get('btc') === '1') openAdm(true);
    if (q.get('qr') === '1') openProj(true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { openAdm(false); openProj(false); return; }
      if (e.target.matches('input, textarea, select')) return;
      if (e.shiftKey && (e.key === 'B' || e.key === 'b')) openAdm(!adm.classList.contains('on'));
      if (e.shiftKey && (e.key === 'Q' || e.key === 'q')) openProj(!proj.classList.contains('on'));
    });

    $('#totop').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    /* chỉ dựng lại nhánh đấu khi thật sự đổi giữa khổ điện thoại và khổ lớn:
       trình duyệt trên điện thoại bắn resize liên tục khi ẩn/hiện thanh địa chỉ */
    var wasNarrow = window.innerWidth < 760, rzTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(rzTimer);
      rzTimer = setTimeout(function () {
        var narrow = window.innerWidth < 760;
        if (narrow === wasNarrow) return;
        wasNarrow = narrow;
        if (cur.bracket) renderBracketPane(cur.bracket);
      }, 180);
    });
  }

  /* =====================================================================
     KHỞI ĐỘNG
     ===================================================================== */
  function init() {
    var gr = document.createElement('div');
    gr.className = 'grain';
    gr.setAttribute('aria-hidden', 'true');
    document.body.appendChild(gr);

    renderHero();
    renderHeroPhotos();
    renderPillarShots();
    renderAgenda();
    renderAsk();
    renderMiniGame();
    renderQr();
    renderSport();
    renderGeneral();
    renderAwards();

    buildTabs('#cal-tabs', [
      { id: 'prog',  label: 'Chương trình' },
      { id: 'sport', label: 'Thể thao' }
    ], function (k) {
      var prog = $('#cal-prog'), sport = $('#cal-sport');
      if (prog)  prog.hidden  = k !== 'prog';
      if (sport) sport.hidden = k !== 'sport';
      revealScan();
    });

    /* chip "Xem lịch từng trận" trong lịch chương trình nhảy sang lịch thi đấu */
    var calPane = $('#cal-pane');
    if (calPane) {
      calPane.addEventListener('click', function (e) {
        var a = e.target.closest('[data-go-sport]');
        if (!a) return;
        e.preventDefault();
        var b = $('#cal-tabs button[data-k="sport"]');
        if (b) b.click();
      });
    }

    buildTabs('#sched-tabs', schedViews, function (k) {
      cur.sched = k; renderSchedule(k); revealScan();
    });

    buildTabs('#bracket-tabs', D.events.map(function (e) {
      return { id: e.id, label: e.short };
    }), function (k) {
      cur.bracket = k; renderBracketPane(k); revealScan();
    });

    buildTabs('#rule-tabs', D.rules.groups.map(function (g) {
      return { id: g.key, label: g.label };
    }), function (k) { renderRulePane(k); revealScan(); });

    wire();
    revealScan();
    scrollFx();
    pollResults();
    startLive();
    sizeTabbar();
    window.addEventListener('resize', sizeTabbar);
    window.addEventListener('resize', updateBracketSvg);

    /* nội dung dựng bằng JS nên mốc #... phải cuộn lại sau khi dựng xong */
    if (location.hash.length > 1) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) requestAnimationFrame(function () {
        requestAnimationFrame(function () { jumpTo(target); });
      });
    }
  }

  /* cuộn tức thì, không chạy animation của scroll-behavior: smooth */
  function jumpTo(el) {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    el.scrollIntoView();
    root.style.scrollBehavior = prev;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
