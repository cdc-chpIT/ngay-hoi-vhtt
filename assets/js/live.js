/* =====================================================================
   "ĐANG DIỄN RA"
   ---------------------------------------------------------------------
   Tính xem ngay lúc này ngày hội đang ở hoạt động nào, còn bao lâu nữa,
   và tiếp theo là gì.

   Hai nguồn dẫn:
     - Buổi sáng  : theo đồng hồ, vì chương trình đã chốt từng phút.
     - Buổi chiều : theo kết quả đã nhập (trận nào chưa có điểm thì
                    trận đó đang/sắp đánh), đồng hồ chỉ là dự phòng.

   Mọi mốc giờ đều quy về giờ Việt Nam (+07:00) để người ở xa xem
   trên điện thoại lệch múi giờ vẫn thấy đúng.
   ===================================================================== */

var Live = (function () {
  'use strict';

  var TZ = '+07:00';

  function toMin(hhmm) {
    var p = String(hhmm).split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function toHHMM(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  /* ngày diễn ra, lấy phần ngày của SITE_CONFIG.eventDate */
  function eventDay(cfg) {
    if (!cfg.eventDate) return null;
    var m = String(cfg.eventDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[1] + '-' + m[2] + '-' + m[3] : null;
  }

  /* mốc giờ tuyệt đối của ngày hội, theo giờ Việt Nam */
  function atMinute(day, min) {
    return new Date(day + 'T' + toHHMM(min) + ':00' + TZ);
  }

  /* ---------------------------------------------------------------
     Dựng danh sách mốc từ timeline + lịch thi đấu
     --------------------------------------------------------------- */
  function buildSlots(data, T) {
    var slots = [];

    data.timeline.forEach(function (t, i) {
      var start = t.start, end = t.end;
      if (t.derive === 'firstFinal' && T) {
        var f = T.matches.filter(function (m) { return m.isFinal; });
        if (!f.length) return;
        var s = Math.min.apply(null, f.map(function (m) { return m.startMin; }));
        var e = Math.max.apply(null, f.map(function (m) { return m.endMin; }));
        start = toHHMM(s); end = toHHMM(e);
      } else if (t.derive === 'awards' && T) {
        var last = T.matches.reduce(function (n, m) { return Math.max(n, m.endMin || 0); }, 0);
        if (!last) return;
        start = toHHMM(Math.ceil((last + 5) / 5) * 5);
        end = toHHMM(Math.ceil((last + 5) / 5) * 5 + 30);
      }
      if (!start) return;
      slots.push({
        idx: i,
        startMin: toMin(start),
        endMin: end ? toMin(end) : toMin(start) + 15,
        item: t
      });
    });

    /* buổi chiều có nhiều sân chạy song song: thêm một mốc bao trọn
       khoảng thi đấu để không bị "trống" giữa hai hoạt động nhỏ */
    if (T && T.matches.length) {
      var s0 = Math.min.apply(null, T.matches.map(function (m) { return m.startMin; }));
      var e0 = T.matches.reduce(function (n, m) { return Math.max(n, m.endMin || 0); }, 0);
      slots.push({
        idx: -1, startMin: s0, endMin: e0, synthetic: true,
        item: {
          part: 'sport', icon: 'ball',
          title: 'Đang thi đấu trên ' + T.venues.reduce(function (n, v) { return n + v.courts.length; }, 0) + ' sân',
          desc: 'Xem trận đang đánh trên từng sân ở bảng bên dưới.'
        }
      });
    }

    slots.sort(function (a, b) {
      return a.startMin - b.startMin || (a.endMin - a.startMin) - (b.endMin - b.startMin);
    });
    return slots;
  }

  /* ---------------------------------------------------------------
     Trạng thái ngay lúc này
     --------------------------------------------------------------- */
  function compute(data, T, cfg, now) {
    var day = eventDay(cfg);
    var slots = buildSlots(data, T);
    if (!day || !slots.length) return { phase: 'unknown', slots: slots };

    var first = slots[0], last = slots[slots.length - 1];
    var dayStart = atMinute(day, first.startMin);
    var dayEnd = atMinute(day, last.endMin);

    /* trước ngày hội */
    if (now < dayStart) {
      return {
        phase: 'before', day: day, slots: slots,
        startsAt: dayStart,
        msToStart: dayStart - now,
        next: first
      };
    }
    /* đã xong */
    if (now >= dayEnd) {
      return { phase: 'after', day: day, slots: slots, endedAt: dayEnd };
    }

    /* trong ngày: tính theo phút kể từ 00:00 giờ Việt Nam */
    var mins = Math.floor((now - atMinute(day, 0)) / 60000);

    /* nhiều hoạt động có thể cùng diễn ra; lấy cái cụ thể nhất làm tiêu đề */
    var holding = slots.filter(function (s) { return mins >= s.startMin && mins < s.endMin; });
    holding.sort(function (a, b) {
      return (a.endMin - a.startMin) - (b.endMin - b.startMin) || a.startMin - b.startMin;
    });
    var cur = holding[0] || null;
    var alsoNow = holding.slice(1).filter(function (s) { return !s.synthetic; });

    var later = slots.filter(function (s) { return s.startMin > mins && !s.synthetic; });
    later.sort(function (a, b) { return a.startMin - b.startMin; });
    var next = later[0] || null;

    /* kẽ hở giữa hai mốc (ví dụ nghỉ giữa các phần) */
    if (!cur) {
      return {
        phase: 'gap', day: day, slots: slots, nowMin: mins,
        next: next, msToNext: next ? atMinute(day, next.startMin) - now : 0
      };
    }

    var span = cur.endMin - cur.startMin;
    var done = mins - cur.startMin;

    var out = {
      phase: 'live', day: day, slots: slots, nowMin: mins,
      current: cur,
      alsoNow: alsoNow,
      progress: span > 0 ? Math.max(0, Math.min(1, done / span)) : 0,
      minutesLeft: Math.max(0, cur.endMin - mins),
      next: next,
      msToNext: next ? atMinute(day, next.startMin) - now : 0
    };

    /* buổi chiều: trên mỗi sân, trận nào đang đánh / sắp đánh.
       Ưu tiên kết quả đã nhập; chưa có kết quả thì bám theo đồng hồ.   */
    if (cur.item.part === 'sport' && T) {
      out.courts = T.liveByCourt().map(function (c) {
        var open = T.matchesOfCourt(c.court.id).filter(function (m) { return !T.view(m).done; });
        var pick = null, state = 'done';

        for (var i = 0; i < open.length; i++) {
          if (mins >= open[i].startMin && mins < open[i].endMin) { pick = open[i]; state = 'playing'; break; }
        }
        if (!pick) {
          for (var j = 0; j < open.length; j++) {
            if (open[j].startMin > mins) { pick = open[j]; state = 'next'; break; }
          }
        }
        if (!pick && open.length) { pick = open[0]; state = 'late'; }

        return {
          court: c.court, venue: c.venue,
          match: pick, view: pick ? T.view(pick) : null,
          state: state, starting: state === 'playing'
        };
      });
    }
    return out;
  }

  /* giờ hiện tại, cho phép xem thử bằng ?gio=09:20 */
  function nowOrPreview(cfg) {
    var p = new URLSearchParams(location.search);
    var key = cfg.previewParam || 'gio';
    var v = p.get(key);
    var day = eventDay(cfg);
    if (!v || !day) return { now: new Date(), preview: false };

    var m = String(v).match(/^(\d{1,2})[:h]?(\d{2})?$/);
    if (!m) return { now: new Date(), preview: false };
    var min = parseInt(m[1], 10) * 60 + parseInt(m[2] || '0', 10);
    return { now: atMinute(day, min), preview: true, label: toHHMM(min) };
  }

  return {
    compute: compute,
    nowOrPreview: nowOrPreview,
    buildSlots: buildSlots,
    eventDay: eventDay,
    atMinute: atMinute,
    toHHMM: toHHMM,
    toMin: toMin
  };
})();
