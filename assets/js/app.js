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
  /* viewBox LÀ BẮT BUỘC. Sprite ở đầu index.html dựng bằng <g>, không phải
     <symbol>, nên <use> không mang theo khung toạ độ nào. Thiếu viewBox thì
     hình vẽ trong hệ 24x24 bị xén còn đúng góc trên bên trái 15x15 hay 20x20
     — ra một mẩu nét cụt, mà không có lỗi console nào báo. */
  function icon(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) +
           '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
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
  /* Khối mở đầu chỉ còn tên ngày hội, dòng trạng thái và phần đếm ngược.
     Dòng trạng thái do renderHeroNow dựng, chạy cùng nhịp với đồng hồ. */
  function renderHero() {
    var when = eventDateOrNull();
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

  /* giờ phút theo đồng hồ Việt Nam, bất kể máy người xem đặt múi giờ nào */
  function vnHHMM(d) {
    try {
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit', hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (e) {
      return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
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
  /* Lịch xếp theo buổi như thời khóa biểu. Thứ tự buổi cố định ở đây,
     còn thứ tự mốc trong một buổi thì giữ nguyên như trong data.js.    */
  var AG_PARTS = [
    { k: 'morning',   label: 'Buổi sáng' },
    { k: 'noon',      label: 'Buổi trưa' },
    { k: 'afternoon', label: 'Buổi chiều' },
    { k: 'evening',   label: 'Buổi tối' }
  ];

  /* Mỗi mốc là một nhà ga trên tuyến: giờ ở trên, chấm ga nằm đúng trên
     đường ray, tên ga và các nhãn ở dưới. Không còn khung thẻ nào.
     Tên ga để nằm ngang chứ không viết nghiêng như bản đồ tàu thật — chữ
     nghiêng 45° đẹp nhưng đọc khó, mà đây là thứ người ta tra vội giữa
     hội trường.                                                          */
  function agItem(t, k, tm, i) {
    var pillar = t.talk ? D.pillars[t.talk - 1] : null;
    return '<div class="ag-item mt-st reveal" data-idx="' + k + '" data-part="' + esc(t.part) + '"' +
        (pillar ? ' data-pillar="' + esc(pillar.key) + '"' : '') +
        (t.sport ? ' data-sport="1"' : '') +
        ' style="--d:' + (Math.min(i, 8) * 35) + 'ms">' +
      '<div class="mt-when"><b>' + esc(tm.start) + '</b>' +
        (tm.end ? '<span>' + esc(tm.end) + '</span>' : '') + '</div>' +
      '<i class="mt-dot" aria-hidden="true"></i>' +
      '<div class="ag-b">' +
        '<h3>' + esc(t.title) + '</h3>' +
        /* chỉ mục nào có địa điểm riêng mới in thêm một dòng */
        (t.place ? '<p class="ag-pl">' + icon('pin', 14) + esc(t.place) + '</p>' : '') +
        '<div class="ag-tags">' +
          (t.fixed ? '' : '<span class="chip dim">dự kiến</span>') +
          (t.tag ? '<span class="chip">' + esc(t.tag) + '</span>' : '') +
          (t.owner ? '<span class="chip">' + esc(t.owner) + '</span>' : '') +
          (t.sport ? '<a class="chip ok" href="#the-thao" data-go-sport="1">Xem lịch từng trận</a>' : '') +
          '<span class="chip ok ag-live" hidden>Đang diễn ra</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* khoảng giờ của cả buổi, in cạnh tên buổi */
  function agSpan(list) {
    var a = list[0].tm.start;
    var b = list[list.length - 1].tm.end;
    return b ? a + ' – ' + b : 'từ ' + a;
  }

  function renderAgenda() {
    var host = $('#agenda');
    if (!host) return;

    var bucket = {};
    D.timeline.forEach(function (t, k) {
      var tm = slotTime(t);
      if (!tm || !tm.start) return;
      var p = t.part || 'morning';
      (bucket[p] = bucket[p] || []).push({ t: t, k: k, tm: tm });
    });

    var n = 0, parts = '';
    AG_PARTS.forEach(function (p) {
      var list = bucket[p.k];
      if (!list || !list.length) return;
      parts += '<section class="tl-part" data-part="' + p.k + '">' +
          '<header class="tlp-h"><span class="tlp-in"><b>' + esc(p.label) + '</b>' +
            '<span>' + esc(agSpan(list)) + '</span></span></header>' +
          '<div class="tl-row">' +
            list.map(function (x) { return agItem(x.t, x.k, x.tm, n++); }).join('') +
          '</div>' +
        '</section>';
    });

    host.innerHTML =
      '<div class="tl-scroll" tabindex="0" role="region"' +
          ' aria-label="Lịch chương trình cả ngày, kéo ngang để xem tiếp">' +
        '<div class="tl-track">' + parts + '</div>' +
      '</div>';

    wireTl();
    tlLast = -2;
  }

  /* --------------------------------------------------------------
     Kéo dải lịch bằng chuột. Điện thoại đã cuộn ngang sẵn nên chỉ cần
     lo con chuột. Kéo quá 5px thì nuốt luôn cú click, không thì thả tay
     ra là trúng vào thẻ bên dưới.
     -------------------------------------------------------------- */
  /* --------------------------------------------------------------
     Kéo dải lịch bằng chuột. Điện thoại đã cuộn ngang sẵn nên chỉ cần
     lo con chuột. Kéo quá 5px thì nuốt luôn cú click, không thì thả tay
     ra là trúng vào thẻ bên dưới.
     Gắn một lần ở cấp trang: bảng BTC có thể dựng lại dải lịch, gắn vào
     từng dải thì mỗi lần dựng lại là chồng thêm một bộ nghe sự kiện.
     -------------------------------------------------------------- */
  var tlWired = false;
  function wireTl() {
    if (tlWired) return;
    tlWired = true;
    var sc = null, down = false, moved = false, x0 = 0, s0 = 0;

    function scrollerOf(e) {
      return e.target && e.target.closest ? e.target.closest('.tl-scroll') : null;
    }

    document.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      var el = scrollerOf(e);
      if (!el) return;
      sc = el; down = true; moved = false; x0 = e.pageX; s0 = el.scrollLeft;
    });
    document.addEventListener('mousemove', function (e) {
      if (!down || !sc) return;
      var dx = e.pageX - x0;
      if (!moved && Math.abs(dx) > 5) { moved = true; sc.classList.add('drag'); }
      if (moved) { e.preventDefault(); sc.scrollLeft = s0 - dx; }
    });
    document.addEventListener('mouseup', function () {
      if (!down) return;
      down = false;
      if (moved && sc) {
        var el = sc;
        setTimeout(function () { el.classList.remove('drag'); }, 0);
      }
    });
    document.addEventListener('click', function (e) {
      var el = scrollerOf(e);
      if (el && el.classList.contains('drag')) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    /* Đường chân trời trôi chậm hơn hàng thẻ cho ra chiều sâu. Nền của
       thẻ cuộn không tự dịch theo nội dung nên phải tự dời lấy. */
    var pTick = false;
    document.addEventListener('scroll', function (e) {
      var el = e.target;
      if (!el || !el.classList || !el.classList.contains('tl-scroll')) return;
      if (reduce || pTick) return;
      pTick = true;
      requestAnimationFrame(function () {
        pTick = false;
        el.style.backgroundPosition =
          '0 0, ' + Math.round(-el.scrollLeft * 0.34) + 'px calc(100% - 10px)';
      });
    }, true);

    /* Vị trí con trỏ "đang ở đây" đo bằng pixel của bố cục thật, nên bố
       cục đổi là phải đo lại: đổi bề ngang màn, và lúc font hiển thị xong
       (chữ đổi bề ngang thì thẻ cũng xê dịch theo). Truyền lại tlLast để
       nó chỉ đặt lại chỗ chứ không tự kéo, giành tay người đang xem. */
    var rz = 0;
    addEventListener('resize', function () {
      clearTimeout(rz);
      rz = setTimeout(function () { placeTlNow(tlLast); }, 150);
    });
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(function () { placeTlNow(tlLast); });
    }
  }

  /* Tô phần tuyến đã chạy qua: mỗi buổi tự tô đoạn ray của mình bằng màu
     của nó, cắt đúng ở ga đang dừng. Đo bằng toạ độ màn hình vì ga nằm
     lồng trong buổi, offsetLeft chỉ tính trong buổi đó.                 */
  var tlLast = -2;
  function placeTlNow(on) {
    var track = $('#agenda .tl-track');
    if (!track) return;
    var card = $('#agenda .ag-item.now');
    var tr = track.getBoundingClientRect();
    var x = -1;
    if (card) {
      var cr = card.getBoundingClientRect();
      x = Math.round(cr.left - tr.left + 12);   /* 12px: đúng tâm chấm ga */
    }

    $$('.tl-part', track).forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      var a = r.left - tr.left;
      var run = x < 0 ? 0 : Math.max(0, Math.min(r.width, x - a));
      sec.style.setProperty('--run', Math.round(run) + 'px');
    });

    if (x < 0) { tlLast = on; return; }

    /* chỉ tự kéo khi ga đang dừng vừa đổi, không giành tay người xem */
    if (on !== tlLast) {
      tlLast = on;
      var sc = $('#agenda .tl-scroll');
      if (!sc) return;
      var to = Math.max(0, x - sc.clientWidth / 2);
      if (!reduce && sc.scrollTo) {
        try { sc.scrollTo({ left: to, behavior: 'smooth' }); return; } catch (e) {}
      }
      sc.scrollLeft = to;
    }
  }

  /* đánh dấu mốc đang diễn ra trên dòng thời gian */
  function markTimelineNow(st) {
    /* Buổi chiều, live.js dựng thêm một mốc "bao" cả khoảng thi đấu (idx -1)
       và mốc đó ngắn hơn mốc thật nên được chọn làm current. Nếu chỉ nhìn
       current thì suốt từ 13:40 đến 16:10 lịch không sáng ô nào. Gặp mốc
       bao thì lùi về mốc thật đang chạy cùng lúc.                       */
    var pick = (st && st.phase === 'live' && st.current) ? st.current : null;
    if (pick && pick.synthetic) pick = (st.alsoNow && st.alsoNow[0]) || null;
    var on = pick ? pick.idx : -1;
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
    /* buổi nào đang chứa mốc đó thì tên buổi cũng sáng lên */
    $$('#agenda .tl-part').forEach(function (sec) {
      sec.classList.toggle('now', !!$('.ag-item.now', sec));
    });
    placeTlNow(on);
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

  /* Địa chỉ cho từng mã QR. Trả về '' nghĩa là chưa có gì để tạo mã. */
  function qrTarget(kind) {
    if (kind === 'quiz') return CFG.quizJoinUrl || '';
    var form = CFG.formOpenUrl || CFG.formEmbedUrl || '';
    if (form) return form;
    if (location.protocol === 'file:' && !CFG.siteUrl) return '';
    /* chưa gắn form thì dẫn thẳng xuống mục Hỏi diễn giả, đừng thả người
       quét xuống đầu trang rồi bắt họ tự tìm. */
    return siteUrl() + '#hoi-dap';
  }

  function renderQr() {
    /* Mục này là để đặt câu hỏi, nên mã QR trỏ thẳng vào form.
       Chưa gắn form thì quay về địa chỉ trang như trước.
       Mã trong cửa sổ máy chiếu dựng lúc bấm mở, xem showProj().    */
    var url = qrTarget('ask');
    if (!url) {
      $('#qr-main').innerHTML = '<p style="color:#333;padding:14px;font-size:.84rem;max-width:200px">' +
        'Trang đang mở từ ổ đĩa nên chưa có địa chỉ để tạo mã QR. ' +
        'Sau khi đưa web lên mạng, điền <b>siteUrl</b> trong config.js.</p>';
      $('#qr-url').textContent = 'Chưa có địa chỉ công khai';
      return;
    }
    makeQr($('#qr-main'), url, 4);
    $('#qr-url').textContent = url;
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

  /* ---------------- dòng "mấy giờ rồi, đang tới mục nào" ----------------
     Một dòng duy nhất ngay dưới tên ngày hội, đổi theo năm trạng thái của
     ngày hội. Phần chữ đọc được thì để máy đọc màn hình đọc; phần số giờ và
     phần "còn mấy phút" đổi liên tục nên đánh dấu ẩn khỏi máy đọc, nếu
     không cứ mỗi lượt cập nhật là nó đọc lại cả dòng.                   */
  var HNOW = {
    before:  { cls: 'soon', tag: 'Sắp diễn ra' },
    live:    { cls: 'live', tag: 'Đang diễn ra' },
    gap:     { cls: 'rest', tag: 'Đang nghỉ' },
    after:   { cls: 'end',  tag: 'Đã kết thúc' },
    unknown: { cls: 'idle', tag: '' }
  };

  function heroNowInfo(st) {
    var base = HNOW[st.phase] || HNOW.unknown;
    var out = { cls: base.cls, tag: base.tag, txt: '', sub: '' };

    if (st.phase === 'live') {
      out.txt = st.current.item.title;
      /* Tên mục buổi chiều đã nói sẵn "trên 5 sân". Khi vài sân đã đấu xong
         thì câu đó nói quá, nên đếm lại theo số sân còn đang đánh. */
      var all = (st.courts || []).length;
      var play = (st.courts || []).filter(function (c) {
        return c.state === 'playing';
      }).length;
      if (play && play < all) out.txt = 'Đang thi đấu trên ' + play + ' sân';
      out.sub = 'còn ' + fmtLeft(st.minutesLeft * 60000);

    } else if (st.phase === 'gap') {
      out.txt = st.next
        ? 'Tiếp theo ' + Live.toHHMM(st.next.startMin) + ' · ' + st.next.item.title
        : 'Hôm nay đã xong';

    } else if (st.phase === 'after') {
      out.txt = 'Cảm ơn cả nhà đã tới chung vui';

    } else {
      var when = eventDateOrNull();
      var mo = CFG.doorsOpen || '08:00';
      var hours = CFG.dayEnd ? 'từ ' + mo + ' đến ' + CFG.dayEnd : 'đón khách từ ' + mo;
      out.txt = (when ? vnDate(when) : (CFG.eventDateLabel || 'Đang chốt ngày')) +
                ' · ' + hours;
    }
    return out;
  }

  /* Trong ngày thì lấy giờ của bộ đếm sự kiện; ngoài ngày đó lấy đồng hồ thật.
     Khi đang xem thử bằng ?gio=... thì np.now đã bị ghim nên vẫn đúng.     */
  function heroNowClock(st, np) {
    if ((st.phase === 'live' || st.phase === 'gap') && st.nowMin != null) {
      return Live.toHHMM(st.nowMin);
    }
    return vnHHMM(np.now);
  }

  function renderHeroNow(st, np) {
    var host = $('#hero-now');
    if (!host) return;

    var info = heroNowInfo(st);
    var key = [st.phase, info.cls, info.tag, info.txt].join('|');
    if (host.dataset.k !== key) {
      host.dataset.k = key;
      host.innerHTML =
        '<span class="hnow-in" data-s="' + info.cls + '">' +
          '<span class="hn-dot" aria-hidden="true"><i></i></span>' +
          '<b class="hn-time" aria-hidden="true"></b>' +
          (info.tag ? '<span class="hn-tag">' + esc(info.tag) + '</span>' : '') +
          '<span class="hn-txt">' + esc(info.txt) + '</span>' +
          '<span class="hn-sub" aria-hidden="true"></span>' +
        '</span>';
    }

    var t = $('.hn-time', host);
    if (t) {
      var now = heroNowClock(st, np);
      t.textContent = now || '';
      t.hidden = !now;
    }
    var sub = $('.hn-sub', host);
    if (sub) {
      sub.textContent = info.sub;
      sub.hidden = !info.sub;
    }
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
    /* slide mở đầu đã có giờ ngay trong dòng trạng thái, đồng hồ ở góc thẻ
       lúc đó là thừa — chỉ để nó cho các slide chạy theo giờ. */
    var card = $('.hero-card');
    if (card) {
      card.classList.toggle('on-intro',
        !!(slides[lsIdx] && slides[lsIdx].dataset.k === 'intro'));
    }
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

    /* dòng trạng thái ở slide mở đầu — cập nhật cả khi các slide không đổi */
    renderHeroNow(st, np);

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
      /* mỗi trụ cột gắn với đúng một bài chia sẻ; lấy tên bài và diễn giả
         từ D.talks để chỉ phải sửa tên người ở một chỗ */
      var talk = null;
      D.talks.forEach(function (t) { if (t.pillar === pl.key) talk = t; });
      var art = pl.photo
        ? '<img src="' + esc(pl.photo) + '" alt="' + esc(pl.name) + '"' +
          (pl.focus ? ' style="object-position:' + esc(pl.focus) + '"' : '') + '>'
        : (POSTER[pl.key] || '');
      return '<figure class="pshot" data-k="' + esc(pl.key) + '" style="--d:' + (k * 90) + 'ms">' +
        '<div class="pshot-img">' + art + '</div>' +
        '<figcaption>' +
          '<span class="pshot-role">Bài ' + (talk ? talk.no : k + 1) + '</span>' +
          '<b>' + esc(talk ? talk.name : pl.name) + '</b>' +
          (talk && talk.speaker
            ? '<span class="pshot-sp">Diễn giả ' + esc(talk.speaker) + '</span>' : '') +
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
    all.forEach(function (el, i) {
      var on = i === a;
      el.classList.toggle('on', on);
      /* .now là "đang trình bày thật", chỉ bật cùng lúc với nhãn trên thẻ */
      el.classList.toggle('now', on && !silent);
      var tag = $('.pshot-live', el);
      if (tag) tag.hidden = !(on && !silent);
    });
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


  /* Ô mã QR của mini game, xếp cạnh các bước y như mục Hỏi diễn giả.
     Chưa có link phòng chơi thì để ô trống có ghi chú — không bịa ra một
     mã QR dẫn tới chỗ không có thật. */
  function quizSide() {
    var url = CFG.quizJoinUrl || '';
    if (!url) {
      return '<b class="qs-t">Mã QR phòng chơi</b>' +
        '<div class="qr-box qr-wait">BTC chiếu mã lên màn hình hội trường khi bắt đầu chơi</div>';
    }
    return '<b class="qs-t">Quét mã để vào phòng chơi</b>' +
      '<div class="qr-box" id="qr-quiz" aria-label="Mã QR dẫn tới phòng chơi mini game"></div>' +
      '<div class="qr-url">' + esc(url) + '</div>' +
      '<button class="btn btn-sm btn-pri" type="button" data-proj="quiz" ' +
        'aria-label="Phóng to mã QR phòng chơi ra toàn màn hình">' +
        '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><use href="#i-qr"/></svg>Phóng to</button>' +
      '<a class="btn btn-sm qs-go" target="_blank" rel="noopener" href="' + esc(url) + '">Vào phòng chơi ↗</a>';
  }

  function renderMiniGame() {
    var g = D.miniGame;

    $('#mg-body').innerHTML =
      '<div class="card qa-card reveal">' +
        '<div class="qa-main">' +
          '<h3 style="margin-bottom:10px">Cách tham gia</h3>' +
          '<ul class="steps">' + g.how.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="qa-side">' + quizSide() + '</div>' +
      '</div>';

    if (CFG.quizJoinUrl) makeQr($('#qr-quiz'), CFG.quizJoinUrl, 4);
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
  /* Bảng sân có hai mức: gọn (chỉ trận đang/sắp đánh) và mở (đủ mọi trận
     của từng sân). Nút "Chi tiết từng trận" lật qua lại. */
  var courtOpen = false;

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
    $('#sport-lead').textContent =
      [CFG.sportVenueName, CFG.sportHours].filter(Boolean).join(', ');

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
  /* Icon của từng môn: vợt cho pickleball, quả cầu cho cầu lông, sợi dây
     cho nhảy dây. Nhận cả id nội dung (pb-nam, cl-mix) lẫn key nhóm luật
     (pickleball, caulong, nhayday). */
  function sportIcon(k) {
    k = String(k || '');
    if (k.indexOf('cl') === 0 || k.indexOf('cau') === 0) return 'i-shuttle';
    if (k.indexOf('nhay') === 0 || k.indexOf('jump') === 0) return 'i-rope';
    return 'i-paddle';
  }

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

  /* Một trận trong danh sách mở rộng: vẫn là bảng tên trắng đặt trên mặt
     sân như thẻ gọn, chỉ dồn mỗi đội vào một dòng cho đỡ cao — 44 trận mà
     dựng nguyên khối như thẻ gọn thì cuộn mỏi tay.                      */
  function crtMatchRow(m, now) {
    var v = T.view(m);
    var ev = T.eventById[m.eventId];

    function side(team, score, which) {
      var cls = team.pending ? ' pend' : (v.done && v.winnerSide === which ? ' win' : '');
      return '<div class="crm-s' + cls + '">' +
        '<span class="crm-n">' + teamLines(ev, team).map(function (n) {
          return '<span class="crm-p">' + esc(n) + '</span>';
        }).join('') + '</span>' +
        '<b>' + (score == null ? '–' : score) + '</b></div>';
    }

    return '<div class="crm' + (now ? ' now' : '') + '">' +
      '<div class="crm-h">' +
        '<b>' + esc(m.time) + '</b>' +
        '<span>' + esc(v.event.short + ' · ' + m.label) + '</span>' +
        (now ? '<i>đang đánh</i>' : '') +
      '</div>' +
      side(v.teamA, v.scoreA, 'a') +
      side(v.teamB, v.scoreB, 'b') +
    '</div>';
  }

  function courtCard(c, live) {
    var m = (live && live.match) || c.next;
    var state = m ? ((live && live.state) || 'next') : 'done';
    /* m lùi về c.next khi chưa có trận nào chạy, nên không được lấy m để
       đánh dấu "đang đánh" — trước ngày hội sẽ thành mỗi sân một trận đỏ
       trong khi thẻ sân vẫn ghi "Sắp tới". Chỉ 'playing' mới là đang đánh. */
    var nowId = (live && live.state === 'playing' && live.match) ? live.match.id : null;
    var tag = CRT_STATE[state] || CRT_STATE.next;
    var played = T.matchesOfCourt(c.court.id).filter(function (x) { return T.view(x).done; }).length;

    var body;
    if (courtOpen) {
      /* mở: thay hẳn ô trận hiện tại bằng danh sách đủ các trận của sân,
         trận đang đánh được đánh dấu — không xếp chồng hai thứ lên nhau */
      var all = T.matchesOfCourt(c.court.id);
      body = '<div class="crt-all">' + all.map(function (x) {
        return crtMatchRow(x, x.id === nowId);
      }).join('') + '</div>';

    } else if (!m) {
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
    var board = $('#court-board');
    board.classList.toggle('open', !!courtOpen);
    board.innerHTML = D.venues.map(function (vn) {
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
  /* Lịch từng trận nay nằm ngay trong mục Thể thao (nút "Chi tiết từng
     trận" mở ô sân ra), nên mục Lịch chỉ còn chương trình cả ngày.
     Bộ dựng lịch cũ — renderSchedule, courtCalendar, scheduleNotes — đã
     bỏ cùng với khung chứa nó.                                          */

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
      ? '<div class="bk-branch win"><div class="bk-bh"><b>Nhánh thắng</b></div>' +
        html + '</div>'
      : html;
    /* Bảng vinh danh đã tách sang mục Giải thưởng — để lại ở đây nữa thì
       cùng một nội dung hiện hai lần trên cùng màn hình. */
    return win + lose + thirdPlaceHtml(ev);
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
      /* chưa có kết quả thì chưa có gì để nói, để trống cho đỡ rối */
      note = '';
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
      '<div class="bk-bh"><b>Nhánh thua</b>' + note + '</div>' +
      '<div class="bk-scroll"><div class="bk" data-sport="' + k + '">' +
        '<div class="bk-wrapcol">' +
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
    return '<div class="vv tb"><div class="vv-h"><b>Tranh hạng Ba</b></div>' +
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
    '</div>';
  }

  /* =====================================================================
     GIẢI THƯỞNG
     Một mục riêng, chia theo TAB từng hạng mục. Mỗi tab: ba thẻ lớn cho
     hạng nhất nhì ba, rồi tới bảng xếp hạng bên dưới.
     Huy chương vẽ bằng icon SVG trong sprite đầu index.html, không dùng
     emoji — emoji mỗi máy một kiểu và trình đọc màn hình đọc ra cả tên.
     ===================================================================== */

  /* 100000 -> "100.000đ". Không dùng toLocaleString vì WebView cũ trong
     Zalo/Facebook trả về đúng chuỗi "100000" khi không có dữ liệu vùng. */
  function money(n) {
    var s = String(Math.round(Math.abs(n))), out = '', i;
    for (i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) out += '.';
      out += s.charAt(i);
    }
    return out + 'đ';
  }

  /* Tiền thưởng từng hạng. CHƯA CHỐT thì trả null và cột bên phải hiện TÊN
     GIẢI chứ không hiện số — cơ cấu giải thưởng trong data.js còn ghi "ở mức
     đề xuất", mà trang này ai có link cũng xem được. Bịa một con số lên đó
     là sai việc thật. BTC chốt rồi thì điền vào D.awards.prize. */
  function prizeOf(evId, rank) {
    var p = (D.awards && D.awards.prize) || {};
    var t = p[evId] || p.all || {};
    return t[rank] == null ? null : t[rank];
  }

  /* Đội thắng (win=true) hoặc thua của một trận đã xong. Lấy qua T.view để
     khỏi phải đụng vào hàm nội bộ của tournament.js. */
  function sideOf(v, win) {
    if (!v.done) return null;
    var s = ((v.winnerSide === 'a') === !!win) ? v.teamA : v.teamB;
    return (s && !s.pending) ? s : null;
  }

  function winCount(ev, label) {
    var n = 0;
    T.matchesOf(ev.id).forEach(function (m) {
      var w = sideOf(T.view(m), true);
      if (w && w.label === label) n++;
    });
    return n;
  }

  function roundLosers(ev, round) {
    var out = [];
    T.matchesOf(ev.id).forEach(function (m) {
      if (m.round !== round) return;
      var l = sideOf(T.view(m), false);
      if (l && out.indexOf(l.label) < 0) out.push(l.label);
    });
    return out;
  }

  function asList(v) {
    if (v == null) return [];
    return Array.isArray(v) ? v.slice() : [v];
  }

  /* --------- huy chương vàng cho thẻ hạng nhất ---------
     Vẽ phẳng hai tông, KHÔNG dùng <defs> hay gradient có id: một trang có
     thể in hai bục (nhảy dây nam và nữ) nên id sẽ trùng nhau. */
  function goldMedal() {
    return '<svg class="aw-medal" viewBox="0 0 52 70" aria-hidden="true">' +
      '<path d="M13 2 4 5l11 27 9-5z" fill="#a8402c"/>' +
      '<path d="M39 2l9 3-11 27-9-5z" fill="#c9523a"/>' +
      '<circle cx="26" cy="48" r="20" fill="#e7c070"/>' +
      '<path d="M26 28a20 20 0 0 1 0 40z" fill="#c99a3f"/>' +
      '<circle cx="26" cy="48" r="14.5" fill="none" stroke="#8a6a22" stroke-width="1.8" opacity=".5"/>' +
      '<text x="26" y="56" text-anchor="middle" font-size="20" font-weight="900" fill="#5a4210">1</text>' +
    '</svg>';
  }

  /* --------- thẻ lớn: hạng #1 #2 #3 ---------
     size: 'lg' cho hạng nhất (ở giữa bục), 'sm' cho các ô hạng ba. */
  function awBig(pos, kind, lines, pend, stats, iconId, size) {
    var has = lines.length > 0;
    return '<article class="aw-big g' + pos + (has ? ' got' : '') +
      (size ? ' ' + size : '') + '">' +
      '<span class="aw-pos"><i>Hạng</i><b>#' + pos + '</b></span>' +
      (pos === 1 ? goldMedal() : '') +
      '<span class="aw-kind">' + esc(kind) + '</span>' +
      '<h4>' + (has
        ? lines.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('')
        : '<span class="pend">' + esc(pend) + '</span>') + '</h4>' +
      '<div class="aw-sts">' + stats.map(function (s) {
        return '<div><i>' + esc(s.k) + '</i><b>' + esc(s.v) + '</b></div>';
      }).join('') + '</div>' +
      '<svg class="aw-wm" viewBox="0 0 24 24" aria-hidden="true"><use href="#' + iconId + '"/></svg>' +
    '</article>';
  }

  /* --------- bục trao giải ---------
     Bạc bên trái, vàng ở giữa và to nhất, các ô đồng hạng ba bên phải và
     nhỏ hơn bạc — đúng dáng bục thật. Vàng đứng ĐẦU trong DOM để trình
     đọc màn hình và trình duyệt không hiểu grid vẫn đọc đúng thứ hạng;
     vị trí trái–giữa–phải do CSS order lo. */
  function awPodium(gold, silver, bronzes) {
    return '<div class="aw-top">' +
      '<div class="aw-col c1">' + gold + '</div>' +
      '<div class="aw-col c2">' + silver + '</div>' +
      '<div class="aw-col c3">' + bronzes.join('') + '</div>' +
    '</div>';
  }

  /* --------- một dòng trong bảng xếp hạng --------- */
  /* pend = dòng hiện khi chưa có tên. Có pend thì dòng vẫn hiện (để người
     xem thấy trước cơ cấu giải), không có pend thì dòng rỗng bị bỏ hẳn —
     dùng cho nhóm "dừng ở tứ kết" lúc chưa đá xong vòng nào. */
  function awRow(rank, sub, names, right, cls, pend) {
    if (!names.length && !pend) return '';
    return '<div class="aw-row' + (cls ? ' ' + cls : '') + '">' +
      '<span class="aw-rk">' + esc(rank) + (sub ? '<i>' + esc(sub) + '</i>' : '') + '</span>' +
      '<span class="aw-who">' + (names.length
        ? names.map(function (n) { return '<b>' + esc(n) + '</b>'; }).join('')
        : '<b class="pend">' + esc(pend) + '</b>') + '</span>' +
      '<span class="aw-pz">' + esc(right) + '</span>' +
    '</div>';
  }

  function awTable(rows) {
    if (!rows) return '';
    return '<div class="aw-tab">' +
      '<div class="aw-th"><span>Hạng</span><span>Đội</span><span>Giải thưởng</span></div>' +
      rows + '</div>';
  }

  /* --------- bốn nội dung đôi --------- */
  function evAwardPane(ev) {
    var p = T.podium(ev);
    var medal = ['Giải nhất', 'Giải nhì', ev.format === 'r6diff' ? 'Hạng ba' : 'Đồng giải ba'];
    var pendText = ['Chờ trận chung kết', 'Chờ trận chung kết', 'Chờ trận bán kết'];
    var vals = [asList(p.champion), asList(p.runnerUp), asList(p.third)];
    var icon = sportIcon(ev.id);

    function cardFor(pos, list, size) {
      var pz = prizeOf(ev.id, pos);
      return awBig(pos, 'Đội', list, pendText[pos - 1], [
        { k: 'Trận thắng', v: list.length ? String(winCount(ev, list[0])) : '–' },
        { k: pz == null ? 'Giải' : 'Tiền thưởng', v: pz == null ? medal[pos - 1] : money(pz) }
      ], icon, size);
    }
    /* Bao nhiêu ô hạng ba là do thể thức quyết: có trận tranh hạng Ba thì
       đúng một đội, không có thì hai đội thua bán kết đồng hạng. */
    var n3 = ev.thirdPlace ? 1 : 2, cards3 = [];
    for (var i3 = 0; i3 < n3; i3++) {
      cards3.push(cardFor(3, vals[2][i3] ? [vals[2][i3]] : [], 'sm'));
    }
    var big = awPodium(cardFor(1, vals[0], 'lg'), cardFor(2, vals[1], ''), cards3);

    var rows = '';
    [1, 2, 3].forEach(function (pos) {
      var pz = prizeOf(ev.id, pos);
      rows += awRow(String(pos), '', vals[pos - 1],
        pz == null ? medal[pos - 1] : money(pz), 'g' + pos, pendText[pos - 1]);
    });

    /* Nhóm dừng ở tứ kết — đúng như bảng kết quả thật hay làm: mấy đội cùng
       dừng một vòng thì đứng chung một dòng, KHÔNG xếp thứ tự 5-6-7-8 vì
       nhánh đấu loại trực tiếp không đẻ ra thứ tự đó. Bịa ra là sai. */
    var onTop = [];
    vals.forEach(function (l) { onTop = onTop.concat(l); });
    var tk = roundLosers(ev, 'TK').filter(function (n) { return onTop.indexOf(n) < 0; });
    rows += awRow('', 'Tứ kết', tk, 'Dừng ở tứ kết', 'grp');

    return big + awTable(rows);
  }

  /* --------- nhảy dây: xếp hạng riêng nam và nữ --------- */
  function jumpAwardPane(g) {
    var list = g.athletes || [];
    var done = list.filter(function (a) {
      return typeof a.count === 'number' && isFinite(a.count);
    });
    /* Chỉ xếp hạng khi đã đo ĐỦ cả nhóm: đo được 3/11 người mà đã gọi người
       dẫn đầu là trao giải nhầm. Bằng điểm thì đồng hạng. */
    var full = list.length > 0 && done.length === list.length;
    var pend = done.length ? 'Đã đo ' + done.length + '/' + list.length + ' lượt' : 'Chờ thi đấu';
    var ranks = [[], [], []], byRank = [];

    if (full) {
      var sorted = done.slice().sort(function (a, b) { return b.count - a.count; });
      var r = -1, last = null;
      sorted.forEach(function (a) {
        if (a.count !== last) { r++; last = a.count; }
        byRank.push({ r: r + 1, a: a });
        if (r < 3) ranks[r].push(a);
      });
    }

    function jcard(pos, size) {
      var top = ranks[pos - 1], first = top[0];
      return awBig(pos, g.label, top.map(function (a) { return a.name; }), pend, [
        { k: 'Số lần nhảy', v: first ? String(first.count) : '–' },
        { k: 'Bộ phận', v: first ? first.dept : '–' }
      ], 'i-rope', size);
    }
    var big = awPodium(jcard(1, 'lg'), jcard(2, ''), [jcard(3, 'sm')]);

    var medal3 = ['Giải nhất', 'Giải nhì', 'Giải ba'];
    var rows = '', seen = {};
    if (!full) {
      /* Chưa đo đủ thì vẫn bày sẵn ba dòng giải, để người xem biết trước cơ
         cấu — chỉ là chưa có tên ai. */
      [1, 2, 3].forEach(function (r3) {
        rows += awRow(String(r3), '', [], medal3[r3 - 1], 'g' + r3, pend);
      });
    }
    byRank.forEach(function (x) {
      if (seen[x.r]) return;
      seen[x.r] = 1;
      var same = byRank.filter(function (y) { return y.r === x.r; });
      rows += awRow(String(x.r), '', same.map(function (y) {
        return y.a.name + ' · ' + y.a.count + ' lần';
      }), x.r <= 3 ? medal3[x.r - 1] : '—', x.r <= 3 ? 'g' + x.r : '');
    });

    return '<h4 class="aw-sub">' + esc(g.label) + '</h4>' + big + awTable(rows);
  }

  /* --------- mini game: thưởng theo số câu đúng, không có nhất nhì ba --------- */
  function miniAwardPane() {
    var g = D.miniGame, w = (g.winners || []).slice();
    w.sort(function (a, b) { return (b.correct || 0) - (a.correct || 0); });

    function cash(p) { return (p.correct || 0) * (g.prizePerCorrect || 0); }

    function mcard(pos, size) {
      var p = w[pos - 1];
      return awBig(pos, 'Nhiều câu đúng nhất', p ? [p.name] : [],
        'Công bố ngay sau khi chơi', [
          { k: 'Câu đúng', v: p ? String(p.correct || 0) : '–' },
          { k: 'Tiền thưởng', v: p ? money(cash(p)) : money(g.prizePerCorrect) + '/câu' }
        ], 'i-game', size);
    }
    var big = awPodium(mcard(1, 'lg'), mcard(2, ''), [mcard(3, 'sm')]);

    if (!w.length) {
      return big + '<p class="aw-empty"><span class="pod-dot"></span>' +
        'Chưa có kết quả. Mỗi câu trả lời đúng được thưởng ' +
        money(g.prizePerCorrect) + '; danh sách người trúng hiện ngay sau khi chơi xong.</p>';
    }
    var rows = w.map(function (p, i) {
      return awRow(String(i + 1), p.dept || '',
        [p.name + ' · ' + (p.correct || 0) + ' câu đúng'],
        money(cash(p)), i < 3 ? 'g' + (i + 1) : '');
    }).join('');
    return big + awTable(rows);
  }

  /* --------- dựng tab và khung nội dung --------- */
  /* Mỗi hạng mục MỘT icon riêng, không dùng chung sportIcon: bốn nội dung
     đôi mà chỉ có hai icon thì hai tab cạnh nhau trông y hệt, nhìn lướt là
     bấm nhầm. Nội dung nam nữ dùng icon "đôi" (hai vợt / hai quả cầu) nên
     vẫn đọc ra đúng môn, chỉ khác dáng. Màu từng tab đặt trong style.css
     theo data-k, không nhét vào đây. */
  var AWARD_ICON = {
    'pb-nam': 'i-paddle',
    'pb-mix': 'i-paddle-duo',
    'cl-nam': 'i-shuttle',
    'cl-mix': 'i-shuttle-duo'
  };

  function awardItems() {
    var out = D.events.map(function (e) {
      return { id: e.id, label: e.name, icon: AWARD_ICON[e.id] || sportIcon(e.id) };
    });
    out.push({ id: 'jump', label: 'Nhảy dây', icon: 'i-rope' });
    out.push({ id: 'mini', label: 'Mini game', icon: 'i-game' });
    return out;
  }

  function awHead(name, tag, done) {
    return '<div class="aw-h">' +
      '<h3>' + esc(name) + '</h3>' +
      /* "Đã có kết quả" chứ không phải "Đã trao giải": trận chung kết xong
         là biết người thắng, nhưng lễ trao giải tới 15:35 mới diễn ra. */
      (done ? '<span class="aw-tag done">Đã có kết quả</span>' : '') +
      '<span class="aw-tag">' + esc(tag) + '</span>' +
    '</div>';
  }

  function renderAwardPane(key) {
    var host = $('#award-pane');
    if (!host) return;
    var head, body;

    if (key === 'jump') {
      head = awHead(D.jumpRope.name, 'Xếp hạng riêng nam và nữ', false);
      /* nam và nữ đứng song song hai cột, không chồng dọc */
      body = '<div class="aw-two">' +
        D.jumpRope.groups.map(function (g) {
          return '<div>' + jumpAwardPane(g) + '</div>';
        }).join('') + '</div>';
    } else if (key === 'mini') {
      head = awHead(D.miniGame.name,
        money(D.miniGame.prizePerCorrect) + ' mỗi câu đúng',
        (D.miniGame.winners || []).length > 0);
      body = miniAwardPane();
    } else {
      var ev = T.eventById[key];
      if (!ev) return;
      head = awHead(ev.name, ev.teamCount + ' đội', !!T.podium(ev).champion);
      body = evAwardPane(ev);
    }
    host.innerHTML = '<div class="pane">' + head + body + '</div>';
  }

  /* Vẽ lại đúng tab đang mở khi có kết quả mới về. */
  function renderAwards() {
    if (cur.award) renderAwardPane(cur.award);
  }

  function renderBracketPane(evId) {
    var ev = T.eventById[evId];
    /* Suất chưa chốt người đã được đánh dấu ngay trên thẻ trận (.pend),
       nên không cần thêm một dòng báo nữa ở đầu nhánh. */
    var head = '';
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
  /* =====================================================================
     LUẬT — SÁCH LẬT TRANG
     Mỗi trang một ý luật kèm MỘT hình minh họa. Các trang xếp chồng đúng
     một ô lưới và lật quanh mép trái như lật sách: trang đang xem nằm trên,
     các trang sau nằm dưới sẵn rồi, lật là trang trên quay đi và lộ trang
     dưới ra — không có trang nào phải "bay vào". Bấm thẳng vào nửa phải của
     trang để sang trang, nửa trái để quay lại; không cần tìm nút mũi tên.

     BỘ HÌNH VẼ THEO ĐÚNG BẢN TRÌNH CHIẾU CỦA BTC: mặt sân tô đặc, vạch kẻ
     trắng, vùng cần nhớ tô vàng, lưới là nét đậm màu mực. Đây là cách mọi
     người đã nhìn thấy trên slide nên khỏi phải học lại ký hiệu.

     Màu lấy thẳng từ theme của file .pptx rồi CHỈNH TỐI LẠI cho đủ tương
     phản: xanh sân pickleball #2F7FB5 của slide chỉ cho chữ trắng 4.36:1,
     hạ xuống #2a75a8 được 4.89:1; xanh cầu lông #2E8B57 được 4.24:1, hạ
     xuống #28794b được 5.22:1. Vàng #f2b84b giữ nguyên vì chữ trên nó là
     màu mực #14213d — 8.66:1.
     ===================================================================== */
  var NAVY  = '#14213d';   /* mực, lưới, chữ trên nền vàng      14.26:1 */
  var PBC   = '#2a75a8';   /* mặt sân pickleball, chữ trắng      4.89:1 */
  var CLC   = '#28794b';   /* mặt sân cầu lông,  chữ trắng       5.22:1 */
  var AMB   = '#f2b84b';   /* vùng phải nhớ: bếp, ô nhận giao           */
  var PANEL = '#eef2f6';   /* nền khung hình                            */
  var FLOOR = '#dbe2ea';   /* mặt sàn khi nhìn ngang                    */
  var EDGE  = '#cfd8e3';   /* viền thẻ con                              */
  var DIM   = '#4e5663';   /* nhãn phụ                           6.48:1 */
  var BAD   = '#b3161f';   /* lỗi                                6.09:1 */
  var OK    = '#1f7a43';   /* hợp lệ                             4.64:1 */
  var A_JR  = '#b63957';   /* nhảy dây                           5.03:1 */

  function svg(label, body) {
    return '<svg viewBox="0 0 400 220" role="img" aria-label="' + esc(label) + '">' +
      '<rect x="0" y="0" width="400" height="220" rx="10" fill="' + PANEL + '"/>' + body + '</svg>';
  }
  /* Người vẽ thành bóng đặc chứ không phải hình que: ở cỡ nhỏ trên điện
     thoại nét que 2px mảnh tới mức gãy, bóng đặc thì luôn đọc ra. */
  function man(x, y, c, s) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + (s || 1) + ')">' +
      '<circle cx="0" cy="0" r="10" fill="' + c + '"/>' +
      '<path d="M-14 46v-18a14 14 0 0 1 28 0v18z" fill="' + c + '"/></g>';
  }
  function tick(x, y, good) {
    var c = good ? OK : BAD;
    return '<circle cx="' + x + '" cy="' + y + '" r="13" fill="#fff" stroke="' + c + '" stroke-width="2.4"/>' +
      (good
        ? '<path d="M' + (x - 6) + ' ' + y + 'l4.5 5 8-9.5"'
        : '<path d="M' + (x - 5) + ' ' + (y - 5) + 'l10 10M' + (x + 5) + ' ' + (y - 5) + 'l-10 10"') +
      ' fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function lb(x, y, t, c, anchor, bold, size) {
    return '<text x="' + x + '" y="' + y + '" fill="' + (c || DIM) + '"' +
      ' font-size="' + (size || 13) + '"' +
      (anchor ? ' text-anchor="' + anchor + '"' : '') +
      (bold ? ' font-weight="700"' : '') + '>' + esc(t) + '</text>';
  }
  function arrow(d, c, w) {
    return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (w || 2.6) +
      '" stroke-dasharray="9 6" stroke-linecap="round"/>';
  }
  function head(x, y, c, rot) {
    return '<path d="M0 0l-14-5.5 3 11z" fill="' + c + '" transform="translate(' + x + ',' + y +
      ') rotate(' + (rot || 0) + ')"/>';
  }
  /* vạch kẻ sân: luôn trắng, luôn 3px — đúng như sân thật và như slide */
  function ln(x1, y1, x2, y2, w) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" stroke="#fff" stroke-width="' + (w || 3) + '"/>';
  }
  function card(x, y, w, h, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="' +
      (fill || '#fff') + '" stroke="' + EDGE + '" stroke-width="1.6"/>';
  }
  function pill(x, y, t, c, bg) {
    var w = t.length * 7.4 + 24;
    return '<rect x="' + (x - w / 2) + '" y="' + (y - 15) + '" width="' + w + '" height="26" rx="13" fill="' + bg + '"/>' +
      lb(x, y + 4, t, c, 'middle', 1, 12.5);
  }

  var RULE_ART = {
    /* ---------- sân pickleball nhìn từ trên xuống ---------- */
    'pb-san': svg('Sơ đồ sân pickleball: bếp tô vàng hai bên lưới, mũi tên là hướng giao chéo sân',
      '<rect x="16" y="34" width="368" height="152" fill="' + PBC + '"/>' +
      '<rect x="152" y="34" width="96" height="152" fill="' + AMB + '"/>' +
      '<rect x="16" y="34" width="368" height="152" fill="none" stroke="#fff" stroke-width="3"/>' +
      ln(152, 34, 152, 186) + ln(248, 34, 248, 186) +
      ln(16, 110, 152, 110) + ln(248, 110, 384, 110) +
      arrow('M116 166 C170 166 256 86 310 78', '#fff', 3) + head(314, 77, '#fff', -28) +
      lb(70, 76, 'Ô trái', '#fff', 'middle') + lb(70, 148, 'Ô phải', '#fff', 'middle') +
      lb(320, 162, 'Ô trái', '#fff', 'middle') + lb(320, 58, 'Ô phải', '#fff', 'middle') +
      lb(176, 115, 'Bếp', NAVY, 'middle', 1) + lb(224, 115, 'Bếp', NAVY, 'middle', 1) +
      '<line x1="200" y1="24" x2="200" y2="196" stroke="' + NAVY + '" stroke-width="5"/>' +
      lb(200, 18, 'LƯỚI', NAVY, 'middle', 1) +
      lb(200, 212, 'Sân 13,41 × 6,10 m — bếp rộng 2,13 m mỗi bên lưới', DIM, 'middle', 0, 12)),

    /* ---------- giao bóng pickleball, nhìn ngang ---------- */
    'pb-giao': svg('Giao bóng pickleball: vung từ dưới lên, điểm chạm bóng thấp hơn thắt lưng',
      '<rect x="10" y="118" width="380" height="58" rx="6" fill="#fbe7b9"/>' +
      '<rect x="10" y="176" width="380" height="28" rx="8" fill="' + FLOOR + '"/>' +
      '<line x1="10" y1="118" x2="390" y2="118" stroke="' + BAD + '" stroke-width="2.6" stroke-dasharray="9 6"/>' +
      lb(18, 111, 'thắt lưng', BAD, '', 1, 12.5) +
      lb(200, 26, 'Vung từ dưới lên, chạm bóng dưới thắt lưng', NAVY, 'middle', 1) +
      man(104, 48, NAVY) +
      '<path d="M104 76 L146 106" stroke="' + NAVY + '" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="164" cy="126" rx="16" ry="20" fill="' + AMB + '" stroke="' + NAVY + '" stroke-width="2.6"/>' +
      '<circle cx="198" cy="144" r="10" fill="#fff" stroke="' + NAVY + '" stroke-width="2.6"/>' +
      arrow('M212 138 C258 126 304 94 342 64', PBC, 3) + head(346, 61, PBC, -34) +
      tick(228, 164, true) +
      lb(382, 136, 'vùng chạm bóng hợp lệ', NAVY, 'end', 1, 12.5) +
      lb(200, 218, 'Đứng sau vạch cuối sân, giao chéo sân, mỗi lượt một quả', DIM, 'middle', 0, 12)),

    /* ---------- luật hai lần nảy ---------- */
    'pb-hai-nay': svg('Luật hai lần nảy: quả giao nảy một lần, quả trả nảy một lần, từ quả thứ ba mới được vô lê',
      '<rect x="10" y="168" width="380" height="30" rx="8" fill="' + FLOOR + '"/>' +
      '<line x1="200" y1="36" x2="200" y2="174" stroke="' + NAVY + '" stroke-width="5"/>' +
      lb(200, 26, 'LƯỚI', NAVY, 'middle', 1) +
      arrow('M50 148 C120 46 250 46 296 162', PBC, 3) +
      arrow('M286 158 C230 62 150 62 110 162', PBC, 3) +
      '<path d="M118 154 C180 94 262 94 318 128" fill="none" stroke="' + OK + '" stroke-width="3.4"/>' +
      head(322, 130, OK, 28) +
      '<circle cx="300" cy="166" r="13" fill="' + AMB + '"/>' + lb(300, 171, '1', NAVY, 'middle', 1) +
      '<circle cx="106" cy="166" r="13" fill="' + AMB + '"/>' + lb(106, 171, '2', NAVY, 'middle', 1) +
      lb(50, 140, 'giao', DIM, 'middle', 1, 12) +
      lb(330, 96, 'quả 3: được vô lê', OK, 'middle', 1, 12.5) +
      lb(200, 212, 'Số trong vòng tròn vàng là lần nảy — hai quả đầu đều phải nảy', DIM, 'middle', 0, 12)),

    /* ---------- vùng bếp ---------- */
    'pb-bep': svg('Vùng bếp tô vàng sát lưới: đứng trong bếp không được vô lê, đứng sau vạch bếp thì được',
      '<rect x="16" y="42" width="368" height="134" fill="' + PBC + '"/>' +
      '<rect x="16" y="42" width="368" height="50" fill="' + AMB + '"/>' +
      '<rect x="16" y="42" width="368" height="134" fill="none" stroke="#fff" stroke-width="3"/>' +
      ln(16, 92, 384, 92) +
      '<line x1="14" y1="34" x2="386" y2="34" stroke="' + NAVY + '" stroke-width="5"/>' +
      lb(200, 26, 'LƯỚI', NAVY, 'middle', 1) +
      lb(376, 76, 'BẾP — vùng cấm vô lê', NAVY, 'end', 1, 12.5) +
      man(74, 56, '#fff', .62) + tick(114, 70, false) +
      man(250, 116, '#fff', .78) + tick(296, 136, true) +
      lb(176, 112, 'vạch bếp', '#fff', 'end', 0, 12) +
      lb(100, 194, 'Trong bếp: không vô lê', BAD, 'middle', 1, 12.5) +
      lb(290, 194, 'Sau vạch bếp: được vô lê', OK, 'middle', 1, 12.5) +
      lb(200, 214, 'Vô lê xong bị đà kéo vào bếp cũng là lỗi', DIM, 'middle', 0, 12)),

    /* ---------- bốn cách mất bóng ---------- */
    'pb-loi': svg('Bốn cách mất bóng: đánh ra ngoài, không qua lưới, để nảy hai lần, phạm luật bếp',
      card(10, 14, 186, 78) + card(204, 14, 186, 78) +
      card(10, 100, 186, 78) + card(204, 100, 186, 78) +
      /* 1 — ra ngoài sân */
      '<rect x="22" y="30" width="44" height="44" fill="' + PBC + '"/>' +
      '<circle cx="74" cy="66" r="7" fill="none" stroke="' + BAD + '" stroke-width="2.4"/>' +
      lb(86, 48, 'Đánh ra ngoài', NAVY, '', 1, 11.5) +
      lb(86, 65, 'chạm vạch là trong', DIM, '', 0, 10.5) +
      /* 2 — không qua lưới */
      '<line x1="244" y1="28" x2="244" y2="78" stroke="' + NAVY + '" stroke-width="4"/>' +
      '<circle cx="226" cy="62" r="7" fill="none" stroke="' + BAD + '" stroke-width="2.4"/>' +
      arrow('M216 38 C224 48 228 54 226 59', BAD, 2.2) +
      lb(262, 48, 'Không qua lưới', NAVY, '', 1, 11.5) +
      lb(262, 65, 'hoặc mắc lưới', DIM, '', 0, 10.5) +
      /* 3 — nảy hai lần */
      '<line x1="22" y1="152" x2="74" y2="152" stroke="' + DIM + '" stroke-width="2.4"/>' +
      '<circle cx="30" cy="146" r="6.5" fill="' + AMB + '"/>' +
      '<circle cx="66" cy="146" r="6.5" fill="' + AMB + '"/>' +
      '<path d="M30 146 C42 126 56 126 66 146" fill="none" stroke="' + BAD + '" stroke-width="2.4" stroke-dasharray="6 4"/>' +
      lb(86, 134, 'Bóng nảy 2 lần', NAVY, '', 1, 11.5) +
      lb(86, 151, 'ở bên sân mình', DIM, '', 0, 10.5) +
      /* 4 — phạm bếp */
      '<rect x="216" y="128" width="46" height="36" fill="' + AMB + '"/>' +
      man(239, 136, NAVY, .4) +
      lb(274, 134, 'Phạm luật bếp', NAVY, '', 1, 11.5) +
      lb(274, 151, 'hoặc hai lần nảy', DIM, '', 0, 10.5) +
      lb(200, 200, 'Mất bóng thì đổi quyền giao, hoặc đối thủ được điểm', DIM, 'middle', 0, 12)),

    /* ---------- ăn điểm trực tiếp ---------- */
    'pb-diem-tt': svg('Ăn điểm trực tiếp: bên nào thắng pha bóng bên đó được một điểm, dù đang giao hay đang nhận',
      '<rect x="18" y="40" width="158" height="92" rx="14" fill="' + PBC + '"/>' +
      lb(97, 76, 'ĐỘI A', '#fff', 'middle', 1, 17) +
      lb(97, 100, 'đang giao', '#fff', 'middle', 0, 12.5) +
      card(224, 40, 158, 92) +
      lb(303, 76, 'ĐỘI B', NAVY, 'middle', 1, 17) +
      lb(303, 100, 'đang nhận', DIM, 'middle', 0, 12.5) +
      arrow('M182 68 h30', DIM, 2.4) + head(218, 68, DIM, 0) +
      arrow('M218 106 h-30', DIM, 2.4) + head(182, 106, DIM, 180) +
      pill(97, 160, '+1 điểm', OK, '#e1f2e7') +
      pill(303, 160, '+1 điểm', OK, '#e1f2e7') +
      lb(200, 200, 'Thắng pha bóng nào được điểm pha đó — chạm 11 là thắng', NAVY, 'middle', 1, 12.5) +
      lb(200, 216, 'Áp dụng ở vòng loại', DIM, 'middle', 0, 11.5)),

    /* ---------- ăn điểm theo lượt giao ---------- */
    'pb-diem-lg': svg('Tính điểm theo lượt giao: chỉ đội đang giao mới ghi điểm, đội nhận thắng pha chỉ giành lại lượt giao',
      '<rect x="18" y="40" width="158" height="92" rx="14" fill="' + PBC + '"/>' +
      lb(97, 74, 'ĐANG GIAO', '#fff', 'middle', 1, 15) +
      lb(97, 98, 'thắng pha', '#fff', 'middle', 0, 12.5) +
      lb(97, 116, 'được 1 điểm', '#fff', 'middle', 0, 12.5) +
      card(224, 40, 158, 92) +
      lb(303, 74, 'ĐANG NHẬN', NAVY, 'middle', 1, 15) +
      lb(303, 98, 'thắng pha', DIM, 'middle', 0, 12.5) +
      lb(303, 116, 'chỉ giành lượt giao', DIM, 'middle', 0, 12.5) +
      tick(97, 158, true) + tick(303, 158, false) +
      lb(97, 190, 'có điểm', OK, 'middle', 1, 12.5) +
      lb(303, 190, 'không có điểm', BAD, 'middle', 1, 12.5) +
      lb(200, 214, 'Mỗi đội 2 lượt giao; đội giao đầu trận chỉ có 1 lượt', DIM, 'middle', 0, 12)),

    /* ---------- sân cầu lông đôi ---------- */
    'cl-san': svg('Sơ đồ sân cầu lông đôi: ô nhận giao tô vàng ở phía chéo sân',
      '<rect x="16" y="30" width="368" height="160" fill="' + CLC + '"/>' +
      '<rect x="230" y="48" width="132" height="62" fill="' + AMB + '"/>' +
      '<rect x="16" y="30" width="368" height="160" fill="none" stroke="#fff" stroke-width="3"/>' +
      ln(16, 48, 384, 48, 2.4) + ln(16, 172, 384, 172, 2.4) +
      ln(38, 30, 38, 190, 2.4) + ln(362, 30, 362, 190, 2.4) +
      ln(170, 30, 170, 190) + ln(230, 30, 230, 190) +
      ln(38, 110, 170, 110, 2.4) + ln(230, 110, 362, 110, 2.4) +
      arrow('M112 150 C170 138 230 108 272 94', '#fff', 3) + head(276, 92, '#fff', -20) +
      lb(300, 72, 'Ô nhận giao', NAVY, 'middle', 1, 12.5) +
      lb(104, 166, 'Người giao (ô phải)', '#fff', 'middle', 1, 12.5) +
      '<line x1="200" y1="20" x2="200" y2="200" stroke="' + NAVY + '" stroke-width="5"/>' +
      lb(200, 14, 'LƯỚI', NAVY, 'middle', 1) +
      lb(200, 212, 'Sân đôi 13,40 × 6,10 m — vạch giao ngắn cách lưới 1,98 m', DIM, 'middle', 0, 12)),

    /* ---------- giao cầu ---------- */
    'cl-giao': svg('Giao cầu: điểm chạm cầu thấp hơn 1,15 mét, vung từ dưới lên, đầu vợt chúc xuống',
      '<rect x="10" y="122" width="380" height="54" rx="6" fill="#fbe7b9"/>' +
      '<rect x="10" y="176" width="380" height="28" rx="8" fill="' + FLOOR + '"/>' +
      '<line x1="10" y1="122" x2="390" y2="122" stroke="' + BAD + '" stroke-width="2.6" stroke-dasharray="9 6"/>' +
      lb(18, 115, '1,15 m', BAD, '', 1, 12.5) +
      lb(200, 26, 'Chạm cầu dưới 1,15 m, vung từ dưới lên', NAVY, 'middle', 1) +
      man(104, 50, NAVY) +
      '<path d="M104 78 L144 108" stroke="' + NAVY + '" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="162" cy="130" rx="14" ry="19" fill="' + CLC + '" stroke="' + NAVY + '" stroke-width="2.6"/>' +
      '<path d="M196 140 l-9-12 18 0z" fill="#fff" stroke="' + NAVY + '" stroke-width="2"/>' +
      '<circle cx="196" cy="146" r="6" fill="' + NAVY + '"/>' +
      arrow('M210 140 C256 128 302 96 340 68', CLC, 3) + head(344, 65, CLC, -34) +
      tick(228, 166, true) +
      lb(382, 138, 'điểm chạm cầu hợp lệ', NAVY, 'end', 1, 12.5) +
      lb(200, 218, 'Hai chân chạm sân, không giẫm vạch, giao chéo sân', DIM, 'middle', 0, 12)),

    /* ---------- tính điểm cầu lông ---------- */
    'cl-diem': svg('Tính điểm cầu lông: chạm 21 điểm là thắng, hòa 20 đều phải hơn hai điểm, trần 30',
      '<rect x="24" y="78" width="352" height="34" rx="17" fill="' + AMB + '"/>' +
      '<path d="M41 78h231v34H41a17 17 0 0 1 0-34z" fill="' + CLC + '"/>' +
      '<rect x="24" y="78" width="352" height="34" rx="17" fill="none" stroke="#fff" stroke-width="2.4"/>' +
      ln(272, 72, 272, 118, 3) +
      lb(26, 66, '0', DIM, '', 1, 12) +
      lb(272, 66, '21', CLC, 'middle', 1) +
      lb(376, 66, '30', BAD, 'end', 1) +
      lb(148, 101, 'chạm 21 trước là thắng', '#fff', 'middle', 1, 12.5) +
      lb(324, 101, 'trần 30', NAVY, 'middle', 1, 12.5) +
      lb(200, 38, 'Mỗi trận 1 hiệp (BO1), đánh đến 21 điểm', NAVY, 'middle', 1) +
      lb(200, 148, 'Hòa 20 đều: phải hơn đối thủ 2 điểm mới thắng', NAVY, 'middle', 1, 12.5) +
      lb(200, 170, 'Hòa 29 đều: ai chạm 30 trước là thắng', NAVY, 'middle', 1, 12.5) +
      lb(200, 198, 'Thắng pha cầu được 1 điểm và giành quyền giao quả sau', DIM, 'middle', 0, 12)),

    /* ---------- lỗi cầu lông ---------- */
    'cl-loi': svg('Ba lỗi hay gặp: cầu rơi ngoài sân, người hoặc vợt chạm lưới, cầu chạm người',
      card(10, 26, 122, 130) + card(139, 26, 122, 130) + card(268, 26, 122, 130) +
      /* cầu ngoài sân */
      '<rect x="30" y="46" width="62" height="54" fill="' + CLC + '"/>' +
      '<rect x="30" y="46" width="62" height="54" fill="none" stroke="#fff" stroke-width="2"/>' +
      '<circle cx="104" cy="112" r="8" fill="none" stroke="' + BAD + '" stroke-width="2.6"/>' +
      lb(71, 136, 'Cầu ngoài sân', NAVY, 'middle', 1, 12) +
      lb(71, 151, 'chạm vạch là trong', DIM, 'middle', 0, 11) +
      /* chạm lưới */
      '<line x1="200" y1="42" x2="200" y2="108" stroke="' + NAVY + '" stroke-width="4"/>' +
      man(176, 58, NAVY, .52) +
      '<path d="M178 76 L196 68" stroke="' + NAVY + '" stroke-width="4" stroke-linecap="round"/>' +
      tick(214, 92, false) +
      lb(200, 136, 'Chạm lưới', NAVY, 'middle', 1, 12) +
      lb(200, 151, 'người hoặc vợt', DIM, 'middle', 0, 11) +
      /* cầu chạm người */
      man(320, 58, NAVY, .62) +
      '<circle cx="348" cy="88" r="8" fill="' + AMB + '" stroke="' + NAVY + '" stroke-width="2"/>' +
      '<path d="M360 70 l-9 12" stroke="' + BAD + '" stroke-width="2.6" stroke-linecap="round"/>' +
      lb(329, 136, 'Cầu chạm người', NAVY, 'middle', 1, 12) +
      lb(329, 151, 'hoặc quần áo', DIM, 'middle', 0, 11) +
      lb(200, 180, 'Còn: đánh khi cầu chưa sang sân mình,', DIM, 'middle', 0, 12) +
      lb(200, 198, 'một đội chạm cầu hai lần liên tiếp', DIM, 'middle', 0, 12)),

    /* ---------- nhảy dây ---------- */
    'jr-nhay': svg('Nhảy dây: mỗi lần dây qua trọn vẹn dưới hai chân tính một lần, mỗi người một lượt 60 giây',
      '<rect x="10" y="158" width="380" height="28" rx="8" fill="' + FLOOR + '"/>' +
      '<ellipse cx="112" cy="102" rx="72" ry="60" fill="none" stroke="' + A_JR +
        '" stroke-width="3.4" stroke-dasharray="11 7"/>' +
      man(112, 80, NAVY, 1.7) +
      '<circle cx="40" cy="102" r="6.5" fill="' + A_JR + '"/>' +
      '<circle cx="184" cy="102" r="6.5" fill="' + A_JR + '"/>' +
      lb(112, 202, 'Dây qua dưới hai chân = 1 lần', A_JR, 'middle', 1, 12.5) +
      '<rect x="232" y="44" width="150" height="64" rx="14" fill="' + AMB + '"/>' +
      lb(307, 80, '60 giây', NAVY, 'middle', 1, 23) +
      lb(307, 98, 'mỗi người một lượt', NAVY, 'middle', 0, 11.5) +
      '<rect x="232" y="120" width="150" height="56" rx="14" fill="#fae9ea"/>' +
      lb(307, 145, 'Vấp dây là dừng', BAD, 'middle', 1, 12.5) +
      lb(307, 163, 'không tính tiếp', DIM, 'middle', 0, 11.5))
  };

  /* Luật trình bày thành sách lật. Trước đây đổ hết sơ đồ, mọi khối luật và
     các bảng ví dụ nối đuôi nhau nên mục này dài gấp ba mục khác, đọc mệt.
     Giờ mỗi trang một ý kèm một hình; các trang xếp chồng trong cùng một ô
     lưới nên khung giữ đúng chiều cao trang cao nhất, lật qua lại không giật. */
  var rdIdx = 0;

  /* Một Ô NỘI DUNG: hình ở trên, chữ ở dưới. Hai ô này đứng cạnh nhau
     thành một trang, nên mỗi trang có HAI hình — trước đây mỗi trang một
     hình thì cột chữ ngắn để hở nửa trang giấy trắng. */
  function ruleItem(label, art, body, wide) {
    return {
      label: label,
      wide: !!wide,
      html: '<div class="fp-it">' +
        (art && RULE_ART[art] ? '<div class="fp-art">' + RULE_ART[art] + '</div>' : '') +
        '<div class="fp-txt">' + body + '</div>' +
      '</div>'
    };
  }

  /* Ghép hai ô một trang. Bảng ví dụ cuộn ngang được nên chiếm trọn trang,
     không ghép với ai. */
  function pairPages(items) {
    var out = [], i = 0;
    while (i < items.length) {
      var a = items[i], b = items[i + 1];
      if (a.wide || !b || b.wide) {
        out.push({ label: a.label, html: a.html, solo: true });
        i += 1;
      } else {
        out.push({ label: a.label + ' · ' + b.label, html: a.html + b.html, solo: false });
        i += 2;
      }
    }
    return out;
  }

  function ruleSlides(g, key) {
    var items = [];

    if (g.court && RULE_ART[key === 'pickleball' ? 'pb-san' : 'cl-san']) {
      items.push(ruleItem('Sân thi đấu', key === 'pickleball' ? 'pb-san' : 'cl-san',
        '<h4>Sân thi đấu</h4><ul><li>' + esc(g.court.size) + '.</li><li>' +
        esc(g.court.detail) + '</li><li>Đường nét đứt trong hình là hướng giao chéo.</li></ul>'));
    }

    g.blocks.forEach(function (b) {
      items.push(ruleItem(b.title, b.art,
        '<h4>' + esc(b.title) + '</h4><ul>' +
        b.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
        '</ul>'));
    });

    /* Nhảy dây trong data.js chỉ có đúng một khối luật. Thêm một ô lấy
       thẳng từ D.jumpRope — chỗ thi, giờ bắt đầu, độ dài mỗi lượt. CỐ TÌNH
       KHÔNG ĐƯA SỐ NGƯỜI: ba nguồn đang ghi 33 / 24 / 30, BTC chưa chốt. */
    if (key === 'nhayday' && D.jumpRope) {
      var jr = D.jumpRope, heats = 0;
      (jr.groups || []).forEach(function (x) { heats += x.heats || 0; });
      items.push(ruleItem('Thi ở đâu, lúc nào', null,
        '<h4>Thi ở đâu, lúc nào</h4><ul>' +
        '<li>Khu thi: ' + esc(jr.station) + '.</li>' +
        '<li>Bắt đầu lúc ' + esc(jr.start) + '.</li>' +
        '<li>Mỗi lượt gói trong ' + jr.heatMinutes + ' phút, tất cả ' + heats + ' lượt.</li>' +
        '<li>' + esc(jr.rule) + '</li>' +
        '</ul>'));
    }

    (g.examples || []).forEach(function (ex) {
      items.push(ruleItem(ex.title, null,
        '<h4>' + esc(ex.title) + '</h4>' +
        '<div class="tblwrap"><table class="ex">' +
        '<thead><tr>' + ex.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody>' + ex.rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>', true));
    });

    var pages = pairPages(items);

    /* "Mẹo nhớ" KHÔNG còn là một trang riêng: nó chỉ có hai dòng chữ nên
       trang đó gần như trắng trơn. Đưa xuống chân trang cuối, chữ vẫn còn
       nguyên, bớt được một trang. */
    if (g.tip && pages.length) {
      pages[pages.length - 1].html +=
        '<p class="fp-tipbar"><b>Mẹo nhớ</b>' + esc(g.tip) + '</p>';
    }
    return pages;
  }

  function renderRulePane(key) {
    var g = D.rules.groups.filter(function (x) { return x.key === key; })[0];
    if (!g) return;
    var sl = ruleSlides(g, key);
    rdIdx = 0;

    var nav = sl.length < 2 ? '' :
      '<div class="rdeck-nav">' +
        '<div class="rd-dots">' + sl.map(function (x, i) {
          return '<button type="button" data-i="' + i + '" class="' + (i ? '' : 'on') +
                 '" aria-label="' + esc(x.label) + '"></button>';
        }).join('') + '</div>' +
        '<p class="rd-hint">Bấm vào nửa phải của trang để lật sang, nửa trái để quay lại</p>' +
      '</div>';

    $('#rule-pane').innerHTML =
      '<div class="pane" data-accent="' + esc(g.accent) + '">' +
        '<div class="rdeck">' +
          '<div class="rd-head"><b class="rd-label">' + esc(sl[0] ? sl[0].label : '') + '</b>' +
            /* Nhảy dây chỉ có một trang; in "1 / 1" thì người đọc tưởng còn
               trang nữa mà bấm mãi không sang. */
            (sl.length < 2 ? '' : '<span class="rd-count">1 / ' + sl.length + '</span>') + '</div>' +
          '<div class="rdeck-track" aria-live="polite">' + sl.map(function (x, i) {
            /* Trang trước nằm TRÊN trang sau, đúng như sách: lật trang đang
               xem đi là lộ ngay trang kế bên dưới, không phải chờ nó bay vào. */
            return '<section class="rslide' + (i ? ' turned' : ' on') + (x.solo ? ' solo' : '') +
                   '" style="z-index:' + (sl.length - i) +
                   '" aria-hidden="' + (i ? 'true' : 'false') +
                   '" aria-label="' + esc(x.label) + '">' + x.html +
                   '<span class="fp-no" aria-hidden="true">' + (i + 1) + '</span></section>';
          }).join('') + '</div>' +
          nav +
        '</div>' +
      '</div>';

  }

  /* KHÔNG CÒN ĐO CHIỀU CAO KHUNG BẰNG JAVASCRIPT.
     Bản cũ đo trang đang xem rồi đặt height cố định cho khung. Cách đó sai
     ở hai chỗ, và cả hai đều để trang luật ĐÈ LÊN mục Lịch bên dưới:
       — phép đo hụt chừng 31px (cộng thiếu lề của khối cuối trong trang);
       — mỗi lần đổi bề ngang cửa sổ là số dòng đổi theo, mà con số cũ vẫn
         nằm nguyên trong thuộc tính style cho tới khi đo lại xong.
     Giờ các trang CHƯA XEM nằm position:absolute nên không chiếm chỗ, chỉ
     trang đang xem (.on) nằm trong dòng chảy. Khung tự cao đúng bằng trang
     đang xem, mọi lúc, không cần đo. Không thể đè lên nhau nữa. */

  function rdShow(n) {
    var sl = $$('#rule-pane .rslide');
    if (!sl.length) return;
    rdIdx = n < 0 ? 0 : (n > sl.length - 1 ? sl.length - 1 : n);
    sl.forEach(function (el, i) {
      /* Mọi trang trước trang đang xem đều ở trạng thái ĐÃ LẬT (quay quanh
         mép trái); trang đang xem và các trang sau nằm phẳng. Nhờ vậy nhảy
         thẳng từ trang 1 sang trang 7 bằng chấm tròn vẫn ra đúng một cú lật,
         không phải lật qua năm trang giữa. */
      var turned = i < rdIdx;
      el.classList.toggle('turned', turned);
      /* chỉ trang đang xem mới chiếm chỗ; xem CSS mục 14 */
      el.classList.toggle('on', i === rdIdx);
      el.setAttribute('aria-hidden', i === rdIdx ? 'false' : 'true');
    });
    $$('#rule-pane .rd-dots button').forEach(function (b, i) {
      b.classList.toggle('on', i === rdIdx);
      b.setAttribute('aria-current', i === rdIdx ? 'true' : 'false');
    });
    var lb2 = $('#rule-pane .rd-label'), ct = $('#rule-pane .rd-count');
    if (lb2) lb2.textContent = sl[rdIdx].getAttribute('aria-label') || '';
    if (ct) ct.textContent = (rdIdx + 1) + ' / ' + sl.length;
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
             (it.icon ? '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><use href="#' +
                        it.icon + '"/></svg>' : '') +
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
  var cur = { bracket: null, team: null, award: null };

  function refreshResults() {
    if (cur.bracket) renderBracketPane(cur.bracket);
    renderAwards();
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
    /* Một cửa sổ máy chiếu dùng chung cho cả hai mã QR: bấm nút nào thì
       dựng mã của nút đó. Bắt ở cấp trang vì nút của mini game do JS dựng. */
    var PROJ = {
      ask: {
        t: 'Quét mã để đặt câu hỏi',
        s: 'Mở trang Ngày hội trên điện thoại rồi gửi câu hỏi cho diễn giả'
      },
      quiz: {
        t: 'Quét mã để vào phòng chơi',
        s: 'Mở trên điện thoại, đăng nhập bằng họ tên và bộ phận của mình'
      }
    };
    function showProj(kind) {
      var m = PROJ[kind] || PROJ.ask;
      $('#proj-t').textContent = m.t;
      $('#proj-s').textContent = m.s;
      var u = qrTarget(kind);
      if (u) {
        makeQr($('#qr-proj'), u, 8);
        $('#proj-url').textContent = u;
      } else {
        $('#qr-proj').innerHTML = '<p style="color:#333;padding:16px;max-width:320px">' +
          'Chưa có địa chỉ để tạo mã QR.</p>';
        $('#proj-url').textContent = '';
      }
      openProj(true);
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-proj]') : null;
      if (b) showProj(b.getAttribute('data-proj'));
    });
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

    /* lật trang luật */
    $('#rule-pane').addEventListener('click', function (e) {
      /* Bấm thẳng vào trang: nửa phải sang trang sau, nửa trái quay lại.
         Bỏ qua khi đang bấm vào bảng ví dụ (bảng đó cuộn ngang được) và khi
         người đọc đang bôi đen chữ — hai thứ đó không phải ý muốn lật. */
      var pg = e.target.closest('.rslide');
      if (pg && !e.target.closest('.tblwrap')) {
        var sel = window.getSelection && window.getSelection();
        if (!(sel && String(sel).length > 1)) {
          var r = pg.getBoundingClientRect();
          rdShow(rdIdx + (e.clientX - r.left > r.width * 0.38 ? 1 : -1));
          return;
        }
      }
      var d = e.target.closest('.rd-dots button');
      if (d) rdShow(Number(d.dataset.i));
    });
    $('#rule-pane').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { rdShow(rdIdx - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { rdShow(rdIdx + 1); e.preventDefault(); }
    });

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

    /* Nút "Chi tiết từng trận": mở từng ô sân ra thành danh sách đủ các
       trận của sân đó, ngay tại chỗ. */
    function setCourtOpen(v) {
      courtOpen = !!v;
      var btn = $('#go-all');
      if (btn) btn.setAttribute('aria-expanded', courtOpen ? 'true' : 'false');
      renderCourtBoard();
      renderEvFilter();
      applyEvFilter();
      revealScan();
    }
    var goAll = $('#go-all');
    if (goAll) goAll.addEventListener('click', function () { setCourtOpen(!courtOpen); });

    /* chip "Xem lịch từng trận" trong lịch chương trình: nhảy tới mục Thể
       thao để href="#the-thao" lo, ở đây chỉ lo mở sẵn bảng sân ra. */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-go-sport]')) return;
      if (!courtOpen) setCourtOpen(true);
    });

    /* Nhãn lấy e.name chứ không e.short: "PB" và "CL" là chữ viết tắt nội bộ
       của BTC, người đi xem không biết đó là Pickleball hay Cầu lông. Icon
       dùng chung bảng với mục Giải thưởng để mỗi nội dung một hình riêng. */
    buildTabs('#bracket-tabs', D.events.map(function (e) {
      return { id: e.id, label: e.name, icon: AWARD_ICON[e.id] || sportIcon(e.id) };
    }), function (k) {
      cur.bracket = k; renderBracketPane(k); revealScan();
    });

    buildTabs('#award-tabs', awardItems(), function (k) {
      cur.award = k; renderAwardPane(k); revealScan();
    });

    buildTabs('#rule-tabs', D.rules.groups.map(function (g) {
      return { id: g.key, label: g.label, icon: sportIcon(g.key) };
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
