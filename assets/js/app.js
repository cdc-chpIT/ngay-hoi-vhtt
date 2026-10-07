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

    $('#hero-stats').innerHTML = i.stats.map(function (s) {
      if (s.text != null) {
        return '<div class="stat"><b>' + esc(s.text) + '</b><span>' + esc(s.label) + '</span></div>';
      }
      var n = typeof s.value === 'number' ? s.value : (COUNTS[s.value] || 0);
      return '<div class="stat"><b data-to="' + n + '" data-pre="' + esc(s.prefix || '') + '">0</b>' +
             '<span>' + esc(s.label) + '</span></div>';
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
     Lịch chương trình: bày theo kiểu lịch một ngày — cột giờ bên trái,
     nội dung bên phải, chia theo buổi.
     --------------------------------------------------------------- */
  var PART_NAME = {
    morning:   'Buổi sáng · Phần Văn hóa',
    noon:      'Buổi trưa',
    afternoon: 'Buổi chiều · Đại hội thể thao',
    evening:   'Buổi tối'
  };

  function renderAgenda() {
    var host = $('#agenda');
    if (!host) return;

    var html = '', part = null;
    D.timeline.forEach(function (t, k) {
      var tm = slotTime(t);
      if (!tm || !tm.start) return;

      if (t.part !== part) {
        part = t.part;
        html += '<div class="ag-part"><b>' + esc(PART_NAME[part] || '') + '</b></div>';
      }

      var pillar = t.talk ? D.pillars[t.talk - 1] : null;
      html += '<div class="ag-item reveal" data-idx="' + k + '" data-part="' + esc(t.part) + '"' +
          (pillar ? ' data-pillar="' + esc(pillar.key) + '"' : '') +
          (t.sport ? ' data-sport="1"' : '') +
          ' style="--d:' + (Math.min(k, 8) * 35) + 'ms">' +
        '<div class="ag-t"><b>' + esc(tm.start) + '</b>' +
          (tm.end ? '<span>' + esc(tm.end) + '</span>' : '') + '</div>' +
        '<div class="ag-c">' +
          '<div class="ag-ic">' + icon(t.icon, 20) + '</div>' +
          '<div class="ag-b">' +
            '<h3>' + esc(t.title) + '</h3>' +
            '<p>' + esc(t.desc) + '</p>' +
            '<div class="ag-tags">' +
              (t.fixed ? '' : '<span class="chip dim">dự kiến</span>') +
              (t.tag ? '<span class="chip">' + esc(t.tag) + '</span>' : '') +
              (t.owner ? '<span class="chip">' + esc(t.owner) + '</span>' : '') +
              (t.sport ? '<a class="chip ok" href="#lich" data-go-sport="1">Xem lịch từng trận</a>' : '') +
              '<span class="chip ok ag-live" hidden>Đang diễn ra</span>' +
            '</div>' +
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

    var slot = $('#form-slot'), state = $('#form-state');
    if (CFG.formEmbedUrl) {
      slot.innerHTML =
        '<iframe class="form-frame" src="' + esc(CFG.formEmbedUrl) + '" loading="lazy" ' +
        'title="Form đặt câu hỏi cho diễn giả">Đang tải form…</iframe>' +
        '<div style="padding:12px 16px;border-top:1px solid var(--line);text-align:center">' +
          '<a class="btn btn-sm" target="_blank" rel="noopener" href="' +
            esc(CFG.formOpenUrl || CFG.formEmbedUrl) + '">Mở form ở tab mới ↗</a>' +
        '</div>';
      state.textContent = 'đang hoạt động';
      state.className = 'chip ok';
      state.style.marginLeft = 'auto';
    } else {
      slot.innerHTML =
        '<div class="form-empty">' +
          '<h4>Chưa gắn Google Form</h4>' +
          '<ul class="steps">' +
            '<li>Mở Google Form đặt câu hỏi, bấm <b>Gửi</b> (Send).</li>' +
            '<li>Chọn tab <code>&lt;&gt;</code> để lấy mã nhúng.</li>' +
            '<li>Copy giá trị trong <code>src="…"</code>, dán vào <code>formEmbedUrl</code> ' +
                'trong file <code>assets/js/config.js</code>.</li>' +
          '</ul>' +
          '<p style="margin-top:12px;color:var(--muted);font-size:.9rem">' +
            'Gắn xong, form sẽ hiện ngay tại đây và mọi người quét mã QR là đặt câu hỏi được.' +
          '</p>' +
        '</div>';
      state.textContent = 'chưa cấu hình';
      state.className = 'chip warn';
      state.style.marginLeft = 'auto';
    }
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
    var url = siteUrl();
    var askUrl = url + '#hoi-dap';          /* máy chiếu: vào thẳng mục đặt câu hỏi */
    var offline = location.protocol === 'file:' && !CFG.siteUrl;

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
  var EMBLEM = {
    truyenthong:
      '<svg class="emb" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M8 58h48" stroke-linecap="round"/>' +
      '<path d="M13 58V34a19 19 0 0 1 38 0v24"/>' +
      '<path d="M24 58V37a8 8 0 0 1 16 0v21"/>' +
      '<path d="M5 48h54" stroke-opacity=".4"/>' +
      '<path d="M9 63h46" stroke-opacity=".25"/>' +
      '<circle cx="32" cy="16" r="3.2" fill="currentColor" stroke="none"/></svg>',
    tuluc:
      '<svg class="emb" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M32 9v45" stroke-linecap="round"/>' +
      '<path d="M32 15 11 52M32 15 53 52M32 28 20 52M32 28 44 52" stroke-opacity=".45"/>' +
      '<path d="M6 54h52" stroke-linecap="round"/>' +
      '<path d="M22 60h20" stroke-opacity=".3"/>' +
      '<circle cx="32" cy="9" r="3.4" fill="currentColor" stroke="none"/></svg>',
    thichung:
      '<svg class="emb" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M5 46c8 0 10-14 15-14s7 9 12 9 8-15 13-15 8 7 14 7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="20" cy="32" r="3.6" fill="currentColor" stroke="none"/>' +
      '<circle cx="32" cy="41" r="3.6" fill="currentColor" stroke="none"/>' +
      '<circle cx="45" cy="26" r="3.6" fill="currentColor" stroke="none"/>' +
      '<path d="M6 57h52" stroke-opacity=".25"/>' +
      '<path d="M50 8l2.3 4.9L57 15l-4.7 2.1L50 22l-2.3-4.9L43 15l4.7-2.1z" fill="currentColor" stroke="none"/></svg>'
  };

  function fmtLeft(ms) {
    var mn = Math.max(0, Math.round(ms / 60000));
    if (mn < 60) return mn + ' phút';
    var h = Math.floor(mn / 60), m = mn % 60;
    if (h < 24) return h + ' giờ' + (m ? ' ' + m + ' phút' : '');
    var d = Math.floor(h / 24), hh = h % 24;
    return d + ' ngày' + (hh ? ' ' + hh + ' giờ' : '');
  }

  var liveTimer = null, liveKey = '';

  function renderLive(force) {
    var np = Live.nowOrPreview(CFG);
    var st = Live.compute(D, T, CFG, np.now);

    /* mốc thời gian trong khóa, nếu không bảng "sắp diễn ra" và "đang nghỉ"
       sẽ đứng im vì chúng không có minutesLeft */
    var tick = st.phase === 'before' ? Math.floor((st.msToStart || 0) / 60000)
             : st.phase === 'gap'    ? Math.floor((st.msToNext || 0) / 60000)
             : st.minutesLeft;
    var key = [st.phase, st.current ? st.current.idx : '', tick,
               st.next ? st.next.idx : '', np.preview ? np.label : ''].join('|');
    if (!force && key === liveKey) return;
    liveKey = key;

    var host = $('#live-panel');
    var cls = 'live is-' + st.phase;
    var html = '';

    if (st.phase === 'unknown') {
      html = '<div class="live"><div class="lh"><span class="flag"><i></i>Chưa chốt ngày</span></div>' +
             '<div class="live-main"><div class="live-body">' +
             '<h3>Ngày hội chưa có ngày chính thức</h3>' +
             '<p>Điền <code>eventDate</code> trong config.js để bật phần đang diễn ra.</p>' +
             '</div></div></div>';

    } else if (st.phase === 'before') {
      var d = st.startsAt;
      html = '<div class="' + cls + '">' +
        '<div class="lh"><span class="flag"><i></i>Sắp diễn ra</span>' +
        '<span class="when">' + esc(vnDate(d)) + '</span></div>' +
        '<div class="live-main">' +
          '<div class="live-ic" style="color:var(--gold)">' + icon(st.next.item.icon || 'cal', 28) + '</div>' +
          '<div class="live-body">' +
            '<h3>Còn ' + esc(fmtLeft(st.msToStart)) + ' nữa là bắt đầu</h3>' +
            '<p>Mở đầu bằng <b>' + esc(st.next.item.title) + '</b> lúc ' +
              esc(Live.toHHMM(st.next.startMin)) + ' tại ' +
              esc((st.next.item && st.next.item.part === 'afternoon'
                   ? (CFG.sportVenueName || CFG.venueName)
                   : CFG.venueName) || '') + '.</p>' +
          '</div>' +
        '</div>' +
        previewBox(np, true) +
      '</div>';

    } else if (st.phase === 'after') {
      html = '<div class="' + cls + '">' +
        '<div class="lh"><span class="flag"><i></i>Đã kết thúc</span></div>' +
        '<div class="live-main">' +
          '<div class="live-ic" style="color:var(--muted)">' + icon('camera', 28) + '</div>' +
          '<div class="live-body">' +
            '<h3>Ngày hội đã khép lại</h3>' +
            '<p>Cảm ơn cả nhà. Ảnh, video và bộ slide ba bài phát biểu sẽ được cập nhật ' +
            '.</p>' +
          '</div>' +
        '</div>' + previewBox(np, true) +
      '</div>';

    } else if (st.phase === 'gap') {
      html = '<div class="' + cls + '">' +
        '<div class="lh"><span class="flag"><i></i>Đang nghỉ</span>' +
        '<span class="when">' + esc(Live.toHHMM(st.nowMin)) + '</span></div>' +
        '<div class="live-main">' +
          '<div class="live-ic" style="color:var(--gold)">' + icon('rest', 28) + '</div>' +
          '<div class="live-body">' +
            '<h3>Đang giữa hai phần chương trình</h3>' +
            (st.next
              ? '<p>Tiếp theo là <b>' + esc(st.next.item.title) + '</b> lúc ' +
                 esc(Live.toHHMM(st.next.startMin)) + '.</p>'
              : '<p>Chương trình hôm nay đã xong.</p>') +
          '</div>' +
        '</div>' +
        (st.next ? '<div class="live-next"><span class="k">Bắt đầu sau</span>' +
          '<b>' + esc(st.next.item.title) + '</b>' +
          '<span class="in">' + esc(fmtLeft(st.msToNext)) + '</span></div>' : '') +
        previewBox(np) +
      '</div>';

    } else {
      var it = st.current.item;
      var pct = Math.round(st.progress * 100);
      html = '<div class="' + cls + '">' +
        '<div class="lh"><span class="flag"><i></i>Đang diễn ra</span>' +
        '<span class="when">' + esc(Live.toHHMM(st.current.startMin)) + ' – ' +
          esc(Live.toHHMM(st.current.endMin)) + ' · bây giờ ' + esc(Live.toHHMM(st.nowMin)) + '</span></div>' +

        '<div class="live-main">' +
          '<div class="live-ic">' + icon(it.icon || 'live', 28) + '</div>' +
          '<div class="live-body">' +
            '<h3>' + esc(it.title) + '</h3>' +
            (it.desc ? '<p>' + esc(it.desc) + '</p>' : '') +
            (it.owner ? '<div class="own">' + icon('users', 15) + esc(it.owner) + '</div>' : '') +
          '</div>' +
        '</div>' +

        '<div class="live-prog"><div class="track"><div class="fill" style="width:' + pct + '%"></div></div>' +
        '<div class="lbl"><span>Đã qua ' + pct + '%</span><span>Còn khoảng ' + st.minutesLeft + ' phút</span></div></div>' +

        (st.alsoNow && st.alsoNow.length
          ? '<div class="live-also"><span class="chip dim">Cùng lúc</span>' +
            st.alsoNow.map(function (x) { return '<span class="chip">' + esc(x.item.title) + '</span>'; }).join('') +
            '</div>'
          : '') +

        (st.courts && st.courts.length
          ? '<div class="live-courts">' + st.courts.map(function (c) {
              if (!c.match) {
                return '<div class="lc"><div class="n">' + esc(c.court.name) + '</div>' +
                       '<b>Đã đấu xong</b></div>';
              }
              var tagTxt = c.state === 'playing' ? ' · đang đánh'
                         : c.state === 'next'    ? ' · sắp tới'
                         : c.state === 'late'    ? ' · chờ trận trước' : '';
              return '<div class="lc' + (c.starting ? ' go' : '') + '">' +
                '<div class="n">' + esc(c.court.name) + esc(tagTxt) + '</div>' +
                '<b>' + esc(c.view.teamA.label) + '<br>' + esc(c.view.teamB.label) + '</b>' +
                '<div class="mt">' + esc(c.view.event.short + ' · ' + c.match.label + ' · ' + c.match.time) + '</div>' +
              '</div>';
            }).join('') + '</div>'
          : '') +

        (st.next
          ? '<div class="live-next"><span class="k">Tiếp theo</span>' +
            '<b>' + esc(st.next.item.title) + '</b>' +
            '<span class="in">' + esc(Live.toHHMM(st.next.startMin)) + '</span></div>'
          : '') +

        previewBox(np) +
      '</div>';
    }

    host.innerHTML = html;
    renderNowbar(st);
    markTimelineNow(st);
  }

  /* khung xem thử cho BTC */
  function previewBox(np, always) {
    var base = location.pathname + '?' + (CFG.previewParam || 'gio') + '=';
    if (np.preview) {
      return '<div class="preview-note">Đang xem thử trang như lúc <b>' + esc(np.label) +
        '</b> ngày hội.<a class="btn btn-sm" href="' + esc(location.pathname) + '">Thoát xem thử</a></div>';
    }
    if (!always) return '';
    return '<div class="preview-note">Muốn xem thử phần này chạy ra sao trong ngày hội?' +
      '<a class="btn btn-sm" href="' + esc(base) + '09:20">Xem thử 9:20</a>' +
      '<a class="btn btn-sm" href="' + esc(base) + '14:30">Xem thử 14:30</a></div>';
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
      bar.innerHTML = '<a href="#dang-dien-ra">' +
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
  function renderPillars() {
    $('#van-hoa-title').textContent = D.intro.theme;
    $('#van-hoa-msg').textContent = D.intro.message;
    $('#pillar-cards').innerHTML = D.pillars.map(function (p, k) {
      return '<article class="pillar reveal" data-k="' + esc(p.key) + '" style="--d:' + (k * 110) + 'ms">' +
        '<span class="no">0' + (k + 1) + '</span>' +
        (EMBLEM[p.key] || '') +
        '<h3>' + esc(p.name) + '</h3>' +
        '<span class="role">' + esc(p.role) + '</span>' +
        '<p>' + esc(p.body) + '</p>' +
        '<div class="short">' + esc(p.short) + '</div>' +
      '</article>';
    }).join('');
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
    $('#mg-lead').textContent =
      g.questions + '. Cả hội trường cùng chơi trên điện thoại, ' +
      'bảng xếp hạng hiện trực tiếp trên màn hình. ' +
      g.minutes + ' phút chơi và ' + g.awardMinutes + ' phút trao giải.';

    var join = CFG.quizJoinUrl
      ? '<a class="btn btn-pri btn-sm" target="_blank" rel="noopener" href="' + esc(CFG.quizJoinUrl) + '">Vào phòng chơi ↗</a>'
      : '<span class="chip warn">BTC sẽ chiếu mã QR phòng chơi lên màn hình</span>';

    $('#mg-body').innerHTML =
      '<div class="mg">' +
        '<div class="card reveal">' +
          '<h3 style="margin-bottom:10px">Cách tham gia</h3>' +
          '<ul class="steps">' + g.how.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
          '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
            '<span class="chip dim">' + esc(g.platform) + '</span>' + join +
          '</div>' +
        '</div>' +

        '<div class="reveal" style="--d:90ms">' +
          '<div class="card" style="margin-bottom:14px">' +
            '<h3 style="margin-bottom:12px">Câu hỏi xoay quanh</h3>' +
            '<div class="mg-topics">' + g.topics.map(function (t, i) {
              return '<div class="mgt"><span class="n">' + (i + 1) + '</span>' +
                     '<b>' + esc(t.name) + '</b><span>' + esc(t.desc) + '</span></div>';
            }).join('') + '</div>' +
          '</div>' +
          '<div class="card mg-prize">' +
            '<span class="tro">🏆</span>' +
            '<div><h3 style="font-size:1rem;margin-bottom:4px">Giải thưởng</h3>' +
            '<p style="font-size:.9rem">' + esc(g.prizes) + '.</p>' +
            '<p style="font-size:.84rem;color:var(--muted-2);margin-top:6px">' + esc(g.prizeNote) + '</p></div>' +
          '</div>' +
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
  function eventState(ev) {
    var ms = T.matchesOf(ev.id);
    if (!ms.length) return { k: 'soon', done: 0, total: 0, pct: 0 };
    var done = 0;
    ms.forEach(function (m) { if (T.view(m).done) done++; });
    var pct = Math.round(done / ms.length * 100);
    if (done >= ms.length) return { k: 'done', done: done, total: ms.length, pct: 100 };

    var mins = nowMinutes();
    var first = Math.min.apply(null, ms.map(function (m) { return m.startMin; }));
    var last = Math.max.apply(null, ms.map(function (m) { return m.endMin; }));
    var k = done > 0 ? 'live'
          : (mins != null && mins >= first && mins <= last) ? 'live'
          : 'soon';
    return { k: k, done: done, total: ms.length, pct: pct, first: first, last: last };
  }

  var STATE_LABEL = { live: 'Đang đấu', soon: 'Sắp đấu', done: 'Đã xong' };

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

  function evCard(ev) {
    var k = sportKey(ev.sport);
    var st = eventState(ev);
    var ms = T.matchesOf(ev.id);
    var from = Tournament.toHHMM(Math.min.apply(null, ms.map(function (m) { return m.startMin; })));
    var to = Tournament.toHHMM(Math.max.apply(null, ms.map(function (m) { return m.endMin; })));
    var venue = T.venues.filter(function (v) { return v.id === ev.venueId; })[0];
    var courts = venue ? venue.courts.length + ' sân' : '';
    var pod = T.podium(ev);

    return '<article class="ev ' + k + '" data-state="' + st.k + '" data-ev="' + esc(ev.id) + '">' +
      '<div class="ev-top">' +
        '<span class="ev-st ' + st.k + '"><i></i>' + STATE_LABEL[st.k] + '</span>' +
        '<span class="ev-sport">' + esc(ev.sport) + '</span>' +
      '</div>' +
      '<h3>' + esc(ev.name) + '</h3>' +
      '<p class="ev-fmt">' + esc(formatLabel(ev)) + '</p>' +
      '<dl class="ev-meta">' +
        '<div><dt>Đội</dt><dd>' + ev.teamCount + '</dd></div>' +
        '<div><dt>Trận</dt><dd>' + ms.length + '</dd></div>' +
        '<div><dt>Giờ</dt><dd>' + esc(from + '–' + to) + '</dd></div>' +
        '<div><dt>Sân</dt><dd>' + esc(courts) + '</dd></div>' +
      '</dl>' +
      '<div class="ev-bar" role="img" aria-label="Đã đấu ' + st.done + ' trên ' + st.total + ' trận">' +
        '<i style="width:' + st.pct + '%"></i>' +
      '</div>' +
      '<div class="ev-prog">' + st.done + '/' + st.total + ' trận · chạm ' + ev.targetScore + ' điểm</div>' +
      (pod.champion
        ? '<div class="ev-win"><b>Vô địch</b> ' + esc(pod.champion) + '</div>'
        : '') +
      '<div class="ev-chips">' + statusChip(ev) + '</div>' +
      '<div class="ev-go">' +
        '<a class="btn btn-sm" href="#lich">Lịch</a>' +
        '<a class="btn btn-sm" href="#nhanh-dau">Nhánh đấu</a>' +
        '<button class="btn btn-sm ev-enter" data-ev="' + esc(ev.id) + '">Nhập kết quả</button>' +
      '</div>' +
    '</article>';
  }

  function jrCard() {
    var jr = D.jumpRope;
    var total = jr.groups.reduce(function (n, g) { return n + g.athletes.length; }, 0);
    return '<article class="ev jr" data-state="soon" data-ev="jump-rope">' +
      '<div class="ev-top"><span class="ev-st soon"><i></i>Sắp đấu</span>' +
        '<span class="ev-sport">nhảy dây</span></div>' +
      '<h3>' + esc(jr.name) + '</h3>' +
      '<p class="ev-fmt">Thi cá nhân theo lượt, xếp hạng riêng nam và nữ</p>' +
      '<dl class="ev-meta">' +
        '<div><dt>Người</dt><dd>' + total + '</dd></div>' +
        '<div><dt>Lượt</dt><dd>' + jr.groups.reduce(function (n, g) { return n + g.heats; }, 0) + '</dd></div>' +
        '<div><dt>Bắt đầu</dt><dd>' + esc(jr.start) + '</dd></div>' +
        '<div><dt>Chỗ</dt><dd>' + esc(jr.station) + '</dd></div>' +
      '</dl>' +
      '<div class="ev-chips"><span class="chip">Không tính vào nhánh đấu</span></div>' +
      '<div class="ev-go"><a class="btn btn-sm" href="#lich">Lịch nhảy dây</a></div>' +
    '</article>';
  }

  function renderEvFilter() {
    var host = $('#ev-filter');
    if (!host) return;
    var counts = { all: D.events.length + 1, live: 0, soon: 1, done: 0 };
    D.events.forEach(function (ev) { counts[eventState(ev).k]++; });
    host.innerHTML = EV_FILTERS.map(function (f) {
      return '<button class="fchip' + (evFilter === f.k ? ' on' : '') + '" data-f="' + f.k + '"' +
        ' aria-pressed="' + (evFilter === f.k ? 'true' : 'false') + '">' +
        esc(f.label) + '<span>' + (counts[f.k] || 0) + '</span></button>';
    }).join('');
  }

  function applyEvFilter() {
    var shown = 0;
    $$('#event-cards .ev').forEach(function (el) {
      var ok = evFilter === 'all' || el.dataset.state === evFilter;
      el.hidden = !ok;
      if (ok) shown++;
    });
    var empty = $('#ev-empty');
    if (empty) empty.hidden = shown > 0;
  }

  function renderSport() {
    var from = Tournament.toHHMM(Math.min.apply(null, T.matches.map(function (m) { return m.startMin; })));
    $('#sport-lead').textContent =
      (CFG.sportVenueName ? CFG.sportVenueName + ' · ' : '') +
      COUNTS.courts + ' sân chạy song song, ' + T.matches.length + ' trận, ' +
      from + ' – ' + Tournament.toHHMM(lastEndMin()) + '. ' +
      'Mọi trận đánh 1 hiệp nên thắng là đi tiếp, thua là dừng.';

    $('#event-cards').innerHTML =
      D.events.map(evCard).join('') + jrCard();
    renderEvFilter();
    applyEvFilter();
    renderCourtBoard();
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

  function renderCourtBoard() {
    $('#court-board').innerHTML = T.liveByCourt().map(function (c) {
      var k = sportKey(c.venue.sport);
      var body;
      if (!c.next) {
        body = '<div class="nx"><b>Đã đấu xong</b>' + c.total + ' trận trên sân này</div>';
      } else {
        var v = T.view(c.next);
        body = '<div class="nx"><b>' + esc(v.teamA.label) + ' vs ' + esc(v.teamB.label) + '</b>' +
               esc(v.event.short + ' · ' + c.next.label + ' · ' + c.next.time) + '</div>';
      }
      return '<div class="court" data-sport="' + k + '">' +
        '<div class="ch"><b>' + esc(c.court.name) + '</b>' +
        (c.next ? '<span class="live"><i></i>Trận tiếp theo</span>' : '<span class="chip ok">xong</span>') +
        '</div>' + body + '</div>';
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
        'BTC có thể rút ngắn <code>slotMinutes</code> hoặc đổi thứ tự vòng trong ' +
        '<code>roundOrder</code> ở data.js.</div></div>';
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
  function bkCard(m, extraCls) {
    var v = T.view(m);
    function side(team, score, which) {
      var cls = team.pending ? 'pend' : (v.done ? (v.winnerSide === which ? 'win' : 'lose') : '');
      var bye = (m.byeTop && which === 'a') ? '<span class="bye">miễn VL</span>' : '';
      return '<div class="sd ' + cls + '">' +
        '<span class="nm" title="' + esc(team.label) + '">' + esc(team.label) + '</span>' + bye +
        '<span class="pt">' + (score == null ? '–' : score) + '</span></div>';
    }
    var tag = Tournament.ROUND_SHORT[m.round] + (m.round === 'CK' ? '' : ' ' + m.index);
    return '<div class="bkm ' + (extraCls || '') + '" title="' + esc(m.label) + '">' +
      '<div class="hd"><span>' + esc(tag) + '</span><span>' + esc(m.time + ' · ' + m.court.short) + '</span></div>' +
      side(v.teamA, v.scoreA, 'a') + side(v.teamB, v.scoreB, 'b') +
    '</div>';
  }

  /* cột nối: 'flat' = 1 đối 1, mặc định = ghép đôi */
  function connCol(n, flat) {
    var items = '';
    for (var i = 0; i < n; i++) items += '<i><s></s><b></b><s></s></i>';
    return '<div class="bk-conn' + (flat ? ' flat' : '') + '">' + items + '</div>';
  }

  function renderBracket(ev) {
    var k = sportKey(ev.sport);

    if (ev.format === 'r6diff') return renderR6(ev, k);

    /* Vòng vớt không chạy 1-1 vào tứ kết nên không vẽ thành một cột của
       nhánh; nó là một nhánh phụ, vẽ riêng ở dưới cùng bảng chọn 2 đội. */
    var rounds = [];
    ['VL', 'TK', 'BK', 'CK'].forEach(function (r) {
      var list = T.matchesOf(ev.id).filter(function (m) { return m.round === r; })
                  .sort(function (a, b) { return a.index - b.index; });
      if (list.length) rounds.push({ key: r, name: Tournament.ROUND_NAME[r], list: list });
    });

    var html = '<div class="bk-scroll"><div class="bk" data-sport="' + k + '">';
    rounds.forEach(function (rd, i) {
      html += '<div class="bk-wrapcol"><span class="rnd">' + esc(rd.name) + '</span>' +
              '<div class="bk-col">' +
              rd.list.map(function (m) { return bkCard(m, rd.key === 'CK' ? 'ck' : ''); }).join('') +
              '</div></div>';
      var next = rounds[i + 1];
      if (next) html += connCol(next.list.length, next.list.length === rd.list.length);
    });
    html += '</div></div>';

    return html + repechageHtml(ev) + thirdPlaceHtml(ev) + podiumHtml(ev);
  }

  /* Vòng vớt: 3 trận, lấy 2 đội theo hiệu số rồi tổng điểm. */
  function repechageHtml(ev) {
    var vv = T.matchesOf(ev.id).filter(function (m) { return m.round === 'VV'; })
              .sort(function (a, b) { return a.index - b.index; });
    if (!vv.length) return '';

    var rp = T.repechage(ev);
    var note;
    if (rp.tie) {
      note = '<span class="chip warn">Bằng cả hiệu số lẫn tổng điểm — BTC bốc thăm</span>';
    } else if (rp.clash) {
      note = '<span class="chip warn">Hai đội vớt đều gặp lại đội đã loại mình — BTC xếp tay</span>';
    } else if (rp.swapped) {
      note = '<span class="chip">Đã đổi chỗ hai đội vớt để không gặp lại đội đã loại mình</span>';
    } else if (rp.ready) {
      note = '<span class="chip ok">Đã chọn xong 2 đội vào tứ kết</span>';
    } else {
      note = '<span class="chip">Chờ đủ kết quả 3 trận vớt</span>';
    }

    var rows = rp.rows.map(function (r, i) {
      return '<li class="' + (i < 2 && rp.ready ? 'in' : '') + '">' +
        '<b>' + esc(r.label) + '</b>' +
        '<span class="sc">' + esc(r.score) + '</span>' +
        '<span class="df">hiệu số ' + r.diff + '</span>' +
        '<span class="st">' + (i < 2 && rp.ready ? 'Vào tứ kết' : 'Dừng') + '</span>' +
      '</li>';
    }).join('');

    return '<div class="vv">' +
      '<div class="vv-h"><b>Vòng vớt</b>' +
        '<span>Sáu đội thua vòng loại đấu tiếp. Hai đội thắng có hiệu số cao nhất ' +
        'đi tiếp vào tứ kết; bằng hiệu số thì xét tổng điểm.</span>' + note + '</div>' +
      '<div class="vv-m">' + vv.map(function (m) { return matchRow(m); }).join('') + '</div>' +
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
    function cell(cls, med, label, val) {
      var list = val == null ? [] : (Array.isArray(val) ? val : [val]);
      var body = list.length
        ? list.map(function (x) { return '<div class="nm">' + esc(x) + '</div>'; }).join('')
        : '<div class="nm pend">Chưa có</div>';
      return '<div class="pod ' + cls + '"><div class="r">' + med + ' ' + label + '</div>' + body + '</div>';
    }
    return '<div class="podium" style="margin-top:22px">' +
      cell('g1', '🥇', 'Giải nhất', p.champion) +
      cell('g2', '🥈', 'Giải nhì', p.runnerUp) +
      cell('g3', '🥉', ev.format === 'r6diff' ? 'Hạng ba' : 'Đồng giải ba', p.third) +
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
     GIẢI THƯỞNG + FAQ + FOOTER
     ===================================================================== */
  function renderAwards() {
    var a = D.awards;
    $('#award-note').textContent = a.note;
    var med = ['🥇', '🥈', '🥉'];
    $('#award-cards').innerHTML = a.perEvent.map(function (p, i) {
      return '<div class="awc r' + p.rank + ' reveal" style="--d:' + (i * 70) + 'ms">' +
        '<div class="med">' + med[i] + '</div><b>' + esc(p.label) + '</b>' +
        '<span>' + p.count + ' giải mỗi nội dung' + (p.note ? '<br>' + esc(p.note) : '') + '</span></div>';
    }).join('');
    $('#award-lines').innerHTML = a.lines.map(function (l) {
      return '<li>' + esc(l) + '</li>';
    }).join('');
  }

  function renderFaq() {
    $('#faq').innerHTML = D.faq.map(function (f) {
      return '<details><summary>' + esc(f.q) + '</summary><div class="ans">' + esc(f.a) + '</div></details>';
    }).join('');
  }

  /* các con số nhỏ trên tiêu đề mục: lấy từ dữ liệu để không bao giờ lệch */
  function renderEyebrows() {
    var set = {
      'eb-dangky': COUNTS.entries + ' lượt đăng ký',
      'eb-tran': T.matches.length + ' trận trên ' + COUNTS.courts + ' sân'
    };
    for (var id in set) { var el = document.getElementById(id); if (el) el.textContent = set[id]; }
  }

  function renderFoot() {
    $('#foot-note').textContent =
      'Trang nội bộ cho ngày hội. Thông tin tổng hợp từ Kế hoạch tổ chức Ngày hội Văn hóa ' +
      'CHP 2026, bộ luật thi đấu và bảng chia đội của Ban Tổ chức. ' + (CFG.adminHint || '');
  }

  /* =====================================================================
     TABS
     ===================================================================== */
  function buildTabs(host, items, onPick, accentCls) {
    var el = $(host);
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
  function renderAdmin() {
    var html = '<p class="hint">Nhập điểm rồi bấm ra ngoài là lưu. Điểm chỉ lưu trên máy này — ' +
               'bấm <b>Tải CSV</b> hoặc <b>Sao chép CSV</b> rồi dán lên Google Sheets để cả nhà cùng thấy.</p>' +
               '<div id="adm-msg" role="status" aria-live="polite"></div>';
    D.venues.forEach(function (vn) {
      vn.courts.forEach(function (c) {
        var list = T.matchesOfCourt(c.id);
        html += '<h4>' + esc(c.name) + '</h4>';
        list.forEach(function (m) {
          var v = T.view(m);
          function line(team, score, which) {
            return '<div class="sl">' +
              '<b title="' + esc(team.label) + '">' + esc(team.label) + '</b>' +
              '<input type="number" min="0" max="99" inputmode="numeric" data-s="' + which + '" ' +
              'aria-label="Điểm của ' + esc(team.label) + ' trong ' + esc(m.label) + '" value="' +
              (score == null ? '' : score) + '"></div>';
          }
          html += '<div class="arow" data-m="' + esc(m.id) + '" data-ev="' + esc(m.eventId) + '">' +
            '<div class="meta">' + esc(m.time + ' · ' + v.event.short + ' · ' + m.label) +
            ' · chạm ' + m.targetScore + '</div>' +
            line(v.teamA, v.scoreA, 'a') + line(v.teamB, v.scoreB, 'b') +
          '</div>';
        });
      });
    });
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
    renderAgenda();        /* dựng lại trước, để markTimelineNow còn chỗ mà tô */
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
    if (!CFG.resultsCsvUrl) {
      el.innerHTML = '<span class="live-flag off"><i></i>Kết quả đang lấy từ file dữ liệu của trang. ' +
                     'BTC có thể bật cập nhật trực tiếp qua Google Sheets trong config.js.</span>';
      return;
    }
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
  var io = null, counted = false;

  function revealScan() {
    if (reduce) { $$('.reveal').forEach(function (e) { e.classList.add('in'); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            /* bảng số nằm dưới màn hình lúc mở trang; chạy số ngay từ đầu
               thì đếm xong trước khi người xem cuộn tới, coi như không có */
            if (!counted && e.target.id === 'hero-stats') { counted = true; countUp(); }
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    }
    $$('.reveal:not(.in)').forEach(function (e) { io.observe(e); });
  }

  function countUp() {
    $$('#hero-stats b[data-to]').forEach(function (el) {
      var to = Number(el.dataset.to), pre = el.dataset.pre || '';
      if (reduce) { el.textContent = pre + to; return; }
      var t0 = null, dur = 1200;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(to * e);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
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

      var mid = y + window.innerHeight * 0.32, act = -1;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= mid) act = i; });
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
    /* --- "Nhập kết quả" trên thẻ nội dung mở thẳng Bảng BTC --- */
    var evs = $('#event-cards');
    if (evs) {
      evs.addEventListener('click', function (e) {
        var b = e.target.closest('.ev-enter');
        if (!b) return;
        openAdm(true);
        /* cuộn bảng tới đúng nội dung vừa bấm, không bắt người dùng tự tìm */
        var row = $('#adm-body .arow[data-ev="' + b.dataset.ev + '"]');
        if (row) row.scrollIntoView({ block: 'start' });
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
    $('#btn-proj').addEventListener('click', function () { openProj(true); });
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
    $('#btn-adm').addEventListener('click', function () { openAdm(true); });
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
    renderPillars();
    renderAgenda();
    renderAsk();
    renderMiniGame();
    renderPeopleWall();
    renderQr();
    renderSport();
    renderGeneral();
    renderAwards();
    renderFaq();
    renderFoot();
    renderEyebrows();

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

    buildTabs('#team-tabs', D.events.map(function (e) {
      return { id: e.id, label: e.short };
    }).concat([{ id: 'jump', label: 'Nhảy dây' }]), function (k) {
      cur.team = k; renderTeamPane(k); revealScan();
    });

    buildTabs('#rule-tabs', D.rules.groups.map(function (g) {
      return { id: g.key, label: g.label };
    }), function (k) { renderRulePane(k); revealScan(); });

    wire();
    revealScan();
    if (reduce) countUp();   /* tắt hiệu ứng thì hiện luôn số cuối */
    scrollFx();
    pollResults();
    startLive();
    sizeTabbar();
    window.addEventListener('resize', sizeTabbar);

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
