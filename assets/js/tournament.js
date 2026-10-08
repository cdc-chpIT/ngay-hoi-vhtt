/* =====================================================================
   BỘ MÁY GIẢI ĐẤU
   ---------------------------------------------------------------------
   Sinh ra toàn bộ trận đấu, xếp sân, xếp giờ và tính đội đi tiếp
   từ dữ liệu trong data.js. Không có trận nào được viết tay.
   ===================================================================== */

var Tournament = (function () {
  'use strict';

  /* ---------- tên vòng ---------- */
  var ROUND_NAME = {
    VL: 'Vòng loại',
    VV: 'Vòng vớt',
    R1: 'Vòng đầu',
    TK: 'Tứ kết',
    BK: 'Bán kết',
    CK: 'Chung kết',
    TB: 'Tranh hạng Ba'
  };
  var ROUND_SHORT = { VL: 'VL', VV: 'VV', R1: 'Trận', TK: 'TK', BK: 'BK', CK: 'CK', TB: 'HB' };

  /* ---------- tiện ích thời gian ---------- */
  function toMin(hhmm) {
    var p = String(hhmm).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function toHHMM(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  /* ---------- tham chiếu chỗ đứng của 1 đội trong trận ---------- */
  function seedRef(n)        { return { k: 'seed', n: n }; }
  function winnerRef(id)     { return { k: 'winner', m: id }; }
  function diffRankRef(n)    { return { k: 'diffRank', n: n }; }
  function loserRef(id)      { return { k: 'loser', m: id }; }
  function pickRef(n)        { return { k: 'pick', n: n }; }

  /* =====================================================================
     1. SINH TRẬN THEO THỂ THỨC
     ===================================================================== */
  function buildMatches(ev) {
    var ms = [];
    function add(round, idx, a, b, extra) {
      var m = {
        id: ev.id + '-' + round + '-' + idx,
        eventId: ev.id,
        round: round,
        roundName: ROUND_NAME[round] || round,
        index: idx,
        label: (ROUND_NAME[round] || round) +
             (round === 'CK' || round === 'TB' ? '' : ' ' + idx),
        a: a,
        b: b,
        isFinal: round === 'CK',
        targetScore: ev.targetScore
      };
      if (extra) for (var k in extra) m[k] = extra[k];
      ms.push(m);
      return m;
    }

    if (ev.format === 'ko12b4') {
      /* 12 đội: 4 đội bốc được miễn vòng loại, vào thẳng tứ kết */
      for (var i = 1; i <= 4; i++) {
        add('VL', i, seedRef(4 + i * 2 - 1), seedRef(4 + i * 2));
      }
      for (var j = 1; j <= 4; j++) {
        add('TK', j, seedRef(j), winnerRef(ev.id + '-VL-' + j), { byeTop: true });
      }
      add('BK', 1, winnerRef(ev.id + '-TK-1'), winnerRef(ev.id + '-TK-2'));
      add('BK', 2, winnerRef(ev.id + '-TK-3'), winnerRef(ev.id + '-TK-4'));
      add('CK', 1, winnerRef(ev.id + '-BK-1'), winnerRef(ev.id + '-BK-2'));

    } else if (ev.format === 'ko8') {
      /* 8 đội: loại trực tiếp từ tứ kết */
      for (var t = 1; t <= 4; t++) {
        add('TK', t, seedRef(t * 2 - 1), seedRef(t * 2));
      }
      add('BK', 1, winnerRef(ev.id + '-TK-1'), winnerRef(ev.id + '-TK-2'));
      add('BK', 2, winnerRef(ev.id + '-TK-3'), winnerRef(ev.id + '-TK-4'));
      add('CK', 1, winnerRef(ev.id + '-BK-1'), winnerRef(ev.id + '-BK-2'));
      if (ev.thirdPlace) {
        add('TB', 1, loserRef(ev.id + '-BK-1'), loserRef(ev.id + '-BK-2'));
      }

    } else if (ev.format === 'q12r') {
      /* 12 đội, không ai được miễn vòng loại:
           - Vòng loại 6 trận, ghép lần lượt Đội 1–2, 3–4 … 11–12.
             Sáu đội thắng vào thẳng Tứ kết.
           - Vòng vớt 3 trận, sáu đội thua đấu tiếp theo cặp.
             Trong ba đội thắng vớt, lấy 2 đội theo hiệu số, rồi tổng điểm.
           - Hai đội vớt nằm ở hai nhánh khác nhau; nếu rơi vào đúng đội
             đã loại mình thì đổi chỗ cho nhau (xử lý trong repechage()). */
      for (var q = 1; q <= 6; q++) {
        add('VL', q, seedRef(q * 2 - 1), seedRef(q * 2));
      }
      for (var vv = 1; vv <= 3; vv++) {
        add('VV', vv, loserRef(ev.id + '-VL-' + (vv * 2 - 1)),
                      loserRef(ev.id + '-VL-' + (vv * 2)));
      }
      add('TK', 1, winnerRef(ev.id + '-VL-1'), pickRef(1));
      add('TK', 2, winnerRef(ev.id + '-VL-2'), winnerRef(ev.id + '-VL-3'));
      add('TK', 3, winnerRef(ev.id + '-VL-4'), winnerRef(ev.id + '-VL-5'));
      add('TK', 4, winnerRef(ev.id + '-VL-6'), pickRef(2));
      add('BK', 1, winnerRef(ev.id + '-TK-1'), winnerRef(ev.id + '-TK-2'));
      add('BK', 2, winnerRef(ev.id + '-TK-3'), winnerRef(ev.id + '-TK-4'));
      add('CK', 1, winnerRef(ev.id + '-BK-1'), winnerRef(ev.id + '-BK-2'));
      if (ev.thirdPlace) {
        add('TB', 1, loserRef(ev.id + '-BK-1'), loserRef(ev.id + '-BK-2'));
      }

    } else if (ev.format === 'r6diff') {
      /* 6 đội: 3 trận vòng đầu, 2 đội thắng hiệu số cao nhất vào chung kết */
      for (var r = 1; r <= 3; r++) {
        add('R1', r, seedRef(r * 2 - 1), seedRef(r * 2));
      }
      add('CK', 1, diffRankRef(1), diffRankRef(2));

    } else if (typeof console !== 'undefined' && console.warn) {
      /* gõ sai tên thể thức thì nội dung đó sẽ trống trơn mà không ai biết */
      console.warn('Thể thức không nhận ra: "' + ev.format + '" ở nội dung ' + ev.id +
                   '. Nội dung này sẽ không có trận nào.');
    }
    return ms;
  }

  /* =====================================================================
     2. XẾP SÂN & GIỜ  (list scheduling, tôn trọng phụ thuộc giữa các vòng)
     ===================================================================== */
  function planSchedule(state) {
    var byId = state.matchById;

    /* xóa kết quả xếp lịch của lần trước để chạy lại được sau khi bốc thăm */
    state.matches.forEach(function (m) {
      m.court = null; m.venueId = null; m.venue = null;
      m.startMin = null; m.endMin = null; m.time = null; m.endTime = null; m.rank = null;
    });
    var cfg = state.data.schedule || {};
    var roundRest  = cfg.roundRestMinutes  == null ? 1  : cfg.roundRestMinutes;
    var playerRest = cfg.playerRestMinutes == null ? 10 : cfg.playerRestMinutes;

    /* --- thứ tự ưu tiên: theo roundOrder của từng khu sân, trộn xen kẽ --- */
    var queues = state.venues.map(function (v) {
      var seq = [];
      v.roundOrder.forEach(function (pair) {
        var group = state.matches.filter(function (m) {
          return m.eventId === pair[0] && m.round === pair[1];
        });
        /* sắp theo số trận cho ổn định — cuối hàm này mảng matches bị sắp
           lại theo giờ, nếu lấy luôn thứ tự đó thì chạy lại sẽ ra lịch khác */
        group.sort(function (a, b) { return a.index - b.index; });
        seq = seq.concat(group);
      });
      return { venue: v, seq: seq, i: 0 };
    });
    /* vòng nào quên khai báo trong roundOrder thì xếp vào cuối hàng của khu sân
       tương ứng, để đổi thể thức trong data.js không làm hỏng cả lịch */
    var queued = {};
    queues.forEach(function (q) {
      q.seq.forEach(function (m) { queued[m.id] = true; });
    });
    var leftovers = state.matches.filter(function (m) { return !queued[m.id]; });
    leftovers.sort(function (a, b) {
      return a.eventId.localeCompare(b.eventId) ||
             a.round.localeCompare(b.round) ||
             a.index - b.index;
    });
    leftovers.forEach(function (m) {
      var ev = state.eventById[m.eventId];
      var q = null;
      queues.forEach(function (x) { if (x.venue.id === ev.venueId) q = x; });
      if (!q) q = queues[0];
      if (q) { q.seq.push(m); queued[m.id] = true; }
    });

    var pending = [], rank = 0, remaining = true;
    while (remaining) {
      remaining = false;
      queues.forEach(function (q) {
        if (q.i < q.seq.length) {
          var m = q.seq[q.i++];
          m.venue = q.venue;
          m.rank = rank++;
          pending.push(m);
          remaining = true;
        }
      });
    }

    /* --- trạng thái sân --- */
    var courtFree = {};
    state.venues.forEach(function (v) {
      v.courts.forEach(function (c) { courtFree[c.id] = toMin(v.start); });
    });
    var finalLockByVenue = {};   /* hai chung kết cùng khu sân không trùng giờ */
    var booked = [];             /* {names, endMin} của những trận đã biết chắc người đánh */

    /* Những người CHẮC CHẮN có mặt ở trận này: các chỗ đứng đã bốc thăm xong.
       Chỗ nào còn là "thắng trận X" thì bỏ qua vì chưa biết ai đánh — riêng
       đội được miễn vòng loại vẫn được bảo vệ khỏi trùng giờ.
       Không biết ai thì trả null, nghĩa là chưa ràng buộc được gì.         */
    function fixedPlayers(m) {
      var ev = state.eventById[m.eventId], refs = [m.a, m.b], names = [];
      for (var i = 0; i < refs.length; i++) {
        var r = refs[i];
        if (!r || r.k !== 'seed') continue;
        var tid = (ev.seeds || [])[r.n - 1];
        var t = tid != null ? ev.teamById[tid] : null;
        if (!t) continue;
        if (t.p1) names.push(String(t.p1).trim());
        if (t.p2) names.push(String(t.p2).trim());
        if (t.name) names.push(String(t.name).trim());
      }
      return names.length ? names : null;
    }
    function shares(a, b) {
      for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) return true;
      return false;
    }

    /* Trận này đã sẵn sàng xếp chưa (mọi trận nó phụ thuộc đã có giờ)? */
    function depsReady(m) {
      var ok = true;
      [m.a, m.b].forEach(function (ref) {
        if (!ref) return;
        if (ref.k === 'winner' || ref.k === 'loser') {
          var dep = byId[ref.m];
          if (!dep || dep.startMin == null) ok = false;
        } else if (ref.k === 'diffRank') {
          state.matches.forEach(function (x) {
            if (x.eventId === m.eventId && x.round === 'R1' && x.startMin == null) ok = false;
          });
        } else if (ref.k === 'pick') {
          state.matches.forEach(function (x) {
            if (x.eventId === m.eventId && x.round === 'VV' && x.startMin == null) ok = false;
          });
        }
      });
      return ok;
    }

    /* Thời lượng một trận. Pickleball vòng ngoài đánh luật ăn điểm trực tiếp
       nên nhanh hơn bán kết và chung kết, vì vậy thời lượng tính theo vòng
       chứ không theo khu sân. Không khai báo gì thì lấy mặc định của khu sân. */
    function slotFor(m) {
      var ev = state.eventById[m.eventId] || {};
      var d = ev.durations || {};
      if (d[m.round] != null) return d[m.round];
      if (d.mac_dinh != null) return d.mac_dinh;
      return m.venue.slotMinutes;
    }

    /* Giờ sớm nhất có thể bắt đầu, và sân nào nhận trận này */
    function plan(m) {
      var v = m.venue, slot = slotFor(m), base = toMin(v.start);
      var earliest = base;

      [m.a, m.b].forEach(function (ref) {
        if (!ref) return;
        if (ref.k === 'winner' || ref.k === 'loser') {
          var dep = byId[ref.m];
          if (dep && dep.endMin != null) earliest = Math.max(earliest, dep.endMin + roundRest);
        } else if (ref.k === 'diffRank') {
          state.matches.forEach(function (x) {
            if (x.eventId === m.eventId && x.round === 'R1' && x.endMin != null) {
              earliest = Math.max(earliest, x.endMin + roundRest);
            }
          });
        } else if (ref.k === 'pick') {
          state.matches.forEach(function (x) {
            if (x.eventId === m.eventId && x.round === 'VV' && x.endMin != null) {
              earliest = Math.max(earliest, x.endMin + roundRest);
            }
          });
        }
      });

      var mine = fixedPlayers(m);
      if (mine) {
        booked.forEach(function (bk) {
          if (shares(mine, bk.names)) earliest = Math.max(earliest, bk.endMin + playerRest);
        });
      }
      /* Mặc định hai chung kết cùng một khu sân xếp lần lượt để mọi người xem
         được cả hai. Khu sân nào đặt finalsTogether thì cho đá đồng thời trên
         hai sân — khán giả tập trung một chỗ, trao giải và chụp ảnh luôn. */
      if (m.isFinal && !v.finalsTogether) {
        earliest = Math.max(earliest, finalLockByVenue[v.id] || 0);
      }

      var best = null;
      v.courts.forEach(function (c) {
        if (best === null || courtFree[c.id] < courtFree[best.id]) best = c;
      });
      /* Lưới giờ phải cố định theo khu sân. Nếu lấy theo slot thì từ khi
         thời lượng đổi theo vòng, giờ bắt đầu các sân sẽ lệch nhau. */
      var grid = v.gridMinutes || v.slotMinutes || slot;
      var start = Math.max(earliest, courtFree[best.id]);
      start = base + Math.ceil((start - base) / grid) * grid;   /* về đúng lưới giờ */
      return { start: start, court: best, slot: slot, players: mine };
    }

    /* --- xếp lần lượt: mỗi vòng lấy trận có giờ sớm nhất trong số đã sẵn sàng.
           Nhờ vậy giờ bắt đầu luôn tăng dần và ràng buộc "một người một trận
           tại một thời điểm" không bao giờ bị bỏ sót.                        --- */
    var guard = 0;
    while (pending.length && guard++ < 10000) {
      var pick = null, pickPlan = null, pickIdx = -1;
      for (var i = 0; i < pending.length; i++) {
        var m = pending[i];
        if (!depsReady(m)) continue;
        var pl = plan(m);
        if (!pick || pl.start < pickPlan.start ||
            (pl.start === pickPlan.start && m.rank < pick.rank)) {
          pick = m; pickPlan = pl; pickIdx = i;
        }
      }
      if (!pick) break;   /* phụ thuộc vòng tròn — không nên xảy ra */

      pending.splice(pickIdx, 1);
      pick.court = pickPlan.court;
      pick.venueId = pick.venue.id;
      pick.startMin = pickPlan.start;
      pick.endMin = pickPlan.start + pickPlan.slot;
      pick.time = toHHMM(pick.startMin);
      pick.endTime = toHHMM(pick.endMin);
      courtFree[pickPlan.court.id] = pick.endMin;
      if (pick.isFinal) finalLockByVenue[pick.venue.id] = pick.endMin;
      if (pickPlan.players) booked.push({ names: pickPlan.players, endMin: pick.endMin });
    }

    state.unscheduled = pending.slice();   /* bình thường là rỗng */
    state.matches.sort(function (x, y) {
      var dx = x.startMin == null ? 1e9 : x.startMin;
      var dy = y.startMin == null ? 1e9 : y.startMin;
      if (dx !== dy) return dx - dy;
      return String(x.court && x.court.id).localeCompare(String(y.court && y.court.id));
    });
  }

  /* =====================================================================
     3. LỊCH NHẢY DÂY
     ===================================================================== */
  function planJumpRope(jr) {
    if (!jr) return [];
    var heats = [], cursors = jr.groups.map(function () { return 1; }), more = true;
    while (more) {
      more = false;
      jr.groups.forEach(function (g, gi) {
        if (cursors[gi] <= g.heats) {
          heats.push({ groupKey: g.key, groupLabel: g.label, heat: cursors[gi]++ });
          more = true;
        }
      });
    }
    var t = toMin(jr.start);
    heats.forEach(function (h) {
      var g = jr.groups.filter(function (x) { return x.key === h.groupKey; })[0];
      h.athletes = g.athletes.filter(function (a) { return a.heat === h.heat; });
      h.time = toHHMM(t);
      h.endTime = toHHMM(t + jr.heatMinutes);
      t += jr.heatMinutes;
    });
    return heats;
  }

  /* =====================================================================
     4. TRẠNG THÁI + GIẢI KẾT QUẢ
     ===================================================================== */
  /* ---------- API trên state ---------- */
  var proto = {};

  function teamLabel(ev, teamId) {
    var t = ev.teamById[teamId];
    if (!t) return null;
    if (t.name) return t.name;
    return t.p1 + ' / ' + t.p2;
  }

  /* giải một tham chiếu chỗ đứng thành đội cụ thể (hoặc nhãn chờ) */
  function resolve(state, ev, ref) {
    if (!ref) return { pending: true, label: '—' };

    if (ref.k === 'seed') {
      var seeds = ev.seeds || [];
      var tid = seeds[ref.n - 1];
      if (tid != null && ev.teamById[tid]) {
        return { teamId: tid, label: teamLabel(ev, tid), seed: ref.n, pending: false };
      }
      return { pending: true, seed: ref.n, label: 'Đội ' + ref.n, awaitingDraw: true };
    }

    if (ref.k === 'winner') {
      var dep = state.matchById[ref.m];
      if (!dep) return { pending: true, label: '—' };
      var w = winnerOf(state, dep);
      if (w && w.teamId != null) {
        return { teamId: w.teamId, label: teamLabel(ev, w.teamId), pending: false, via: dep.id };
      }
      return {
        pending: true,
        label: 'Thắng ' + ROUND_SHORT[dep.round] + ' ' + dep.index,
        via: dep.id
      };
    }

    if (ref.k === 'loser') {
      var dl = state.matchById[ref.m];
      if (!dl) return { pending: true, label: '—' };
      var lo = loserOf(state, dl);
      if (lo && lo.teamId != null) {
        return { teamId: lo.teamId, label: teamLabel(ev, lo.teamId), pending: false, via: dl.id };
      }
      return {
        pending: true,
        label: 'Thua ' + ROUND_SHORT[dl.round] + ' ' + dl.index,
        via: dl.id
      };
    }

    if (ref.k === 'pick') {
      var rp = repechage(state, ev);
      var tid2 = rp.picks[ref.n - 1];
      if (rp.ready && tid2 != null) {
        return { teamId: tid2, label: teamLabel(ev, tid2), pending: false };
      }
      return { pending: true, label: 'Đội vớt ' + ref.n };
    }

    if (ref.k === 'diffRank') {
      var rank = diffRanking(state, ev);
      if (rank.ready && rank.rows[ref.n - 1]) {
        var row = rank.rows[ref.n - 1];
        return { teamId: row.teamId, label: teamLabel(ev, row.teamId), pending: false };
      }
      return { pending: true, label: 'Hiệu số hạng ' + ref.n };
    }
    return { pending: true, label: '—' };
  }

  /* Chọn 2 trong 3 đội thắng vòng vớt.
     Thứ tự xét: hiệu số trận vớt → tổng điểm ghi được → còn bằng nhau thì
     BTC bốc thăm (trang báo "cần bốc thăm" chứ không tự chọn hộ).
     Chọn xong còn phải tránh cho đội vớt gặp lại đúng đội đã loại mình ở
     vòng loại: TK 1 gặp đội thắng VL 1, TK 4 gặp đội thắng VL 6, nên nếu
     trùng thì đổi chỗ hai đội vớt cho nhau. */
  function repechage(state, ev) {
    var rows = [], ready = true;
    state.matches.forEach(function (m) {
      if (m.eventId !== ev.id || m.round !== 'VV') return;
      var w = winnerOf(state, m);
      var sc = state.results[m.id];
      if (!w || !sc || w.teamId == null) { ready = false; return; }
      rows.push({
        matchId: m.id,
        matchLabel: m.label,
        teamId: w.teamId,
        label: teamLabel(ev, w.teamId),
        diff: Math.abs(sc[0] - sc[1]),
        pts: Math.max(sc[0], sc[1]),
        score: Math.max(sc[0], sc[1]) + ' – ' + Math.min(sc[0], sc[1])
      });
    });
    rows.sort(function (x, y) { return (y.diff - x.diff) || (y.pts - x.pts); });

    var out = { rows: rows, ready: false, tie: false, swapped: false, picks: [null, null] };
    if (!ready || rows.length !== 3) return out;

    /* hai đội đứng đầu phải hơn đội thứ ba, không thì phải bốc thăm */
    if (rows[1].diff === rows[2].diff && rows[1].pts === rows[2].pts) {
      out.tie = true;
      return out;
    }

    var picks = [rows[0].teamId, rows[1].teamId];

    /* đội nào đã loại đội vớt này ở vòng loại */
    function eliminator(teamId) {
      var who = null;
      state.matches.forEach(function (m) {
        if (m.eventId !== ev.id || m.round !== 'VL') return;
        var lo = loserOf(state, m);
        if (lo && lo.teamId === teamId) {
          var w = winnerOf(state, m);
          if (w) who = w.teamId;
        }
      });
      return who;
    }
    function sideOpponent(n) {           /* đối thủ của đội vớt thứ n ở tứ kết */
      var vl = state.matchById[ev.id + '-VL-' + (n === 1 ? 1 : 6)];
      var w = vl ? winnerOf(state, vl) : null;
      return w ? w.teamId : null;
    }

    var clash = (eliminator(picks[0]) === sideOpponent(1)) ||
                (eliminator(picks[1]) === sideOpponent(2));
    if (clash) {
      var swapped = [picks[1], picks[0]];
      var stillClash = (eliminator(swapped[0]) === sideOpponent(1)) ||
                       (eliminator(swapped[1]) === sideOpponent(2));
      if (!stillClash) { picks = swapped; out.swapped = true; }
      else out.clash = true;   /* cả hai cách đều trùng — BTC tự xếp */
    }

    out.picks = picks;
    out.ready = true;
    return out;
  }

  /* bảng xếp hạng hiệu số cho thể thức 6 đội */
  function diffRanking(state, ev) {
    var rows = [], ready = true;
    state.matches.forEach(function (m) {
      if (m.eventId !== ev.id || m.round !== 'R1') return;
      var w = winnerOf(state, m);
      var sc = state.results[m.id];
      if (!w || !sc) { ready = false; return; }
      rows.push({
        matchId: m.id,
        matchLabel: m.label,
        teamId: w.teamId,
        label: w.teamId != null ? teamLabel(ev, w.teamId) : w.label,
        diff: Math.abs(sc[0] - sc[1]),
        score: Math.max(sc[0], sc[1]) + ' – ' + Math.min(sc[0], sc[1])
      });
    });
    rows.sort(function (x, y) { return y.diff - x.diff; });
    var tie = rows.length === 3 && (rows[1].diff === rows[2].diff);
    return { rows: rows, ready: ready && rows.length === 3 && !tie, tie: tie };
  }

  /* đội thắng 1 trận, nếu đã có điểm hợp lệ */
  function winnerOf(state, m) {
    var sc = state.results[m.id];
    if (!sc || sc[0] == null || sc[1] == null || sc[0] === sc[1]) return null;
    var ev = state.eventById[m.eventId];
    var side = sc[0] > sc[1] ? 'a' : 'b';
    var side2 = side === 'a' ? m.a : m.b;
    var r = resolve(state, ev, side2);
    if (r.pending) return null;
    return { teamId: r.teamId, label: r.label, side: side };
  }
  function loserOf(state, m) {
    var sc = state.results[m.id];
    if (!sc || sc[0] === sc[1]) return null;
    var ev = state.eventById[m.eventId];
    var ref = sc[0] > sc[1] ? m.b : m.a;
    var r = resolve(state, ev, ref);
    return r.pending ? null : r;
  }

  proto.view = function (m) {
    var ev = this.eventById[m.eventId];
    var sc = this.results[m.id] || null;
    var A = resolve(this, ev, m.a), B = resolve(this, ev, m.b);
    var done = !!(sc && sc[0] !== sc[1]);
    return {
      match: m, event: ev, scoreA: sc ? sc[0] : null, scoreB: sc ? sc[1] : null,
      teamA: A, teamB: B, done: done,
      winnerSide: done ? (sc[0] > sc[1] ? 'a' : 'b') : null,
      ready: !A.pending && !B.pending
    };
  };

  proto.matchesOf = function (eventId) {
    return this.matches.filter(function (m) { return m.eventId === eventId; });
  };
  proto.matchesOfCourt = function (courtId) {
    return this.matches.filter(function (m) { return m.court && m.court.id === courtId; });
  };
  proto.diffRanking = function (ev) { return diffRanking(this, ev); };
  proto.repechage = function (ev) { return repechage(this, ev); };
  proto.teamLabel = function (ev, id) { return teamLabel(ev, id); };

  /* bục trao giải */
  proto.podium = function (ev) {
    var self = this, out = { champion: null, runnerUp: null, third: [] };
    var ck = this.matchById[ev.id + '-CK-1'];
    if (ck) {
      var w = winnerOf(this, ck), l = loserOf(this, ck);
      if (w) out.champion = w.label;
      if (l) out.runnerUp = l.label;
    }
    var tb = this.matchById[ev.id + '-TB-1'];
    if (tb) {
      /* có trận tranh hạng Ba thì hạng Ba là đội thắng trận đó, không phải
         cả hai đội thua bán kết */
      var tw = winnerOf(this, tb);
      if (tw) out.third = [tw.label];
      return out;
    }
    if (ev.format === 'r6diff') {
      var rank = diffRanking(this, ev);
      if (rank.ready && rank.rows[2]) out.third = [rank.rows[2].label];
    } else {
      [1, 2].forEach(function (i) {
        var bk = self.matchById[ev.id + '-BK-' + i];
        if (!bk) return;
        var ll = loserOf(self, bk);
        if (ll) out.third.push(ll.label);
      });
    }
    return out;
  };

  /* tiến độ chung */
  proto.progress = function () {
    var total = this.matches.length, done = 0, self = this;
    this.matches.forEach(function (m) { if (self.view(m).done) done++; });
    return { done: done, total: total, pct: total ? Math.round(done / total * 100) : 0 };
  };

  /* trận đang / sắp diễn ra trên từng sân */
  proto.liveByCourt = function () {
    var self = this, out = [];
    this.venues.forEach(function (v) {
      v.courts.forEach(function (c) {
        var list = self.matchesOfCourt(c.id);
        var next = null;
        for (var i = 0; i < list.length; i++) {
          if (!self.view(list[i]).done) { next = list[i]; break; }
        }
        out.push({ venue: v, court: c, next: next, total: list.length });
      });
    });
    return out;
  };

  /* xếp lại lịch — gọi sau khi bốc thăm để tránh một người đánh hai trận cùng lúc */
  proto.replan = function () {
    planSchedule(this);
    return this;
  };

  proto.setResults = function (obj) {
    var clean = {};
    for (var id in obj) {
      if (!this.matchById[id]) continue;
      var v = obj[id];
      if (!v) continue;
      if (v[0] === '' || v[0] == null || v[1] === '' || v[1] == null) continue;
      var a = Number(v[0]), b = Number(v[1]);
      if (isNaN(a) || isNaN(b)) continue;
      clean[id] = [a, b];
    }
    this.results = clean;
    return this;
  };

  proto.toCsv = function () {
    var lines = ['match_id,score_a,score_b'];
    var self = this;
    this.matches.forEach(function (m) {
      var sc = self.results[m.id];
      if (sc) lines.push(m.id + ',' + sc[0] + ',' + sc[1]);
    });
    return lines.join('\n');
  };

  /* ---------- khởi tạo ---------- */
  function make(data) {
    var state = Object.create(proto);
    state.data = data;
    state.venues = data.venues;
    state.events = data.events;
    state.eventById = {};
    state.matches = [];
    state.matchById = {};
    state.results = {};

    data.events.forEach(function (ev) {
      state.eventById[ev.id] = ev;
      ev.teamById = {};
      (ev.teams || []).forEach(function (t) { ev.teamById[t.id] = t; });
      buildMatches(ev).forEach(function (m) {
        state.matches.push(m);
        state.matchById[m.id] = m;
      });
    });

    planSchedule(state);
    state.jumpHeats = planJumpRope(data.jumpRope);
    state.setResults(data.results || {});
    return state;
  }

  return {
    make: make,
    ROUND_NAME: ROUND_NAME,
    ROUND_SHORT: ROUND_SHORT,
    toMin: toMin,
    toHHMM: toHHMM
  };
})();
