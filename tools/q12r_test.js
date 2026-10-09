/* Bài thử cho thể thức q12r — chạy: node q12r_test.js */
const fs = require('fs');
const path = require('path').join(__dirname, '..', 'assets/js/tournament.js');
const src = fs.readFileSync(path, 'utf8');
eval(src + '\nglobalThis.Tournament = Tournament;');

let pass = 0, fail = 0;
function ok(cond, msg, extra) {
  if (cond) { pass++; console.log('PASS  ' + msg); }
  else { fail++; console.log('FAIL  ' + msg + (extra ? '\n      ' + extra : '')); }
}

function teams(n, prefix) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push({ id: prefix + i, name: 'Đội ' + i, p1: prefix + '-A' + i, p2: prefix + '-B' + i });
  }
  return out;
}
/* seeds = thứ tự đã bốc thăm; chưa có thì mọi chỗ đứng đều là "chờ" */
function seedsOf(n, prefix) {
  const out = [];
  for (let i = 1; i <= n; i++) out.push(prefix + i);
  return out;
}

function makeData() {
  return {
    schedule: { roundRestMinutes: 1, playerRestMinutes: 10, endBy: '16:10' },
    venues: [
      { id: 'pb', name: 'Khu Pickleball', start: '13:40', slotMinutes: 10, gridMinutes: 5,
        courts: [{ id: 'pb1', name: 'PB 1' }, { id: 'pb2', name: 'PB 2' }],
        roundOrder: [
          ['pb-nam', 'VL'], ['pb-mix', 'TK'], ['pb-nam', 'VV'],
          ['pb-nam', 'TK'], ['pb-mix', 'BK'], ['pb-nam', 'BK'],
          ['pb-mix', 'CK'], ['pb-nam', 'CK']
        ] },
      { id: 'cl', name: 'Khu Cầu lông', start: '13:40', slotMinutes: 15, gridMinutes: 5,
        courts: [{ id: 'cl1', name: 'CL 1' }, { id: 'cl2', name: 'CL 2' }, { id: 'cl3', name: 'CL 3' }],
        roundOrder: [
          ['cl-nam', 'VL'], ['cl-mix', 'TK'], ['cl-nam', 'VV'],
          ['cl-nam', 'TK'], ['cl-mix', 'BK'], ['cl-nam', 'BK'],
          ['cl-mix', 'TB'], ['cl-nam', 'TB'], ['cl-mix', 'CK'], ['cl-nam', 'CK']
        ] }
    ],
    events: [
      { id: 'pb-nam', short: 'PB đôi nam', name: 'Pickleball đôi nam', venueId: 'pb',
        format: 'q12r', teamCount: 12, thirdPlace: false, targetScore: 11,
        durations: { VL: 10, VV: 10, TK: 10, BK: 16, CK: 16 },
        teams: teams(12, 'pbn'), seeds: seedsOf(12, 'pbn') },
      { id: 'pb-mix', short: 'PB đôi nam nữ', name: 'Pickleball đôi nam nữ', venueId: 'pb',
        format: 'ko8', teamCount: 8, thirdPlace: false, targetScore: 11,
        durations: { TK: 10, BK: 16, CK: 16 },
        teams: teams(8, 'pbm'), seeds: seedsOf(8, 'pbm') },
      { id: 'cl-nam', short: 'CL đôi nam', name: 'Cầu lông đôi nam', venueId: 'cl',
        format: 'q12r', teamCount: 12, thirdPlace: true, targetScore: 21,
        durations: { mac_dinh: 15 },
        teams: teams(12, 'cln'), seeds: seedsOf(12, 'cln') },
      { id: 'cl-mix', short: 'CL đôi nam nữ', name: 'Cầu lông đôi nam nữ', venueId: 'cl',
        format: 'ko8', teamCount: 8, thirdPlace: true, targetScore: 21,
        durations: { mac_dinh: 15 },
        teams: teams(8, 'clm'), seeds: seedsOf(8, 'clm') }
    ],
    results: {}
  };
}

const D = makeData();
const T = Tournament.make(D);

/* ---------- 1. số trận từng nội dung ---------- */
const counts = {};
['pb-nam', 'pb-mix', 'cl-nam', 'cl-mix'].forEach(id => { counts[id] = T.matchesOf(id).length; });
ok(counts['pb-nam'] === 16, 'PB đôi nam (q12r, không tranh hạng Ba) = 16 trận', 'được ' + counts['pb-nam']);
ok(counts['pb-mix'] === 7, 'PB đôi nam nữ (ko8, không tranh hạng Ba) = 7 trận', 'được ' + counts['pb-mix']);
ok(counts['cl-nam'] === 17, 'CL đôi nam (q12r, có tranh hạng Ba) = 17 trận', 'được ' + counts['cl-nam']);
ok(counts['cl-mix'] === 8, 'CL đôi nam nữ (ko8, có tranh hạng Ba) = 8 trận', 'được ' + counts['cl-mix']);
ok(T.matches.length === 48, 'tổng cộng 48 trận', 'được ' + T.matches.length);

/* ---------- 2. cấu trúc vòng ---------- */
const byRound = {};
T.matchesOf('pb-nam').forEach(m => { byRound[m.round] = (byRound[m.round] || 0) + 1; });
ok(byRound.VL === 6 && byRound.VV === 3 && byRound.TK === 4 && byRound.BK === 2 && byRound.CK === 1,
  'q12r: 6 vòng loại, 3 vòng vớt, 4 tứ kết, 2 bán kết, 1 chung kết', JSON.stringify(byRound));

/* vòng loại ghép đúng Đội 1–2, 3–4 … 11–12 */
let pairOk = true, pairSeen = [];
T.matchesOf('pb-nam').filter(m => m.round === 'VL')
  .slice().sort((x, y) => x.index - y.index)      /* theo số trận, không theo giờ */
  .forEach((m, i) => {
    pairSeen.push(m.a.n + 'v' + m.b.n);
    if (m.a.k !== 'seed' || m.b.k !== 'seed' || m.a.n !== i * 2 + 1 || m.b.n !== i * 2 + 2) pairOk = false;
  });
ok(pairOk, 'vòng loại ghép lần lượt 1–2, 3–4 … 11–12', pairSeen.join(' '));

/* vòng vớt lấy đúng đội thua của hai trận loại liền nhau */
const vv = T.matchesOf('pb-nam').filter(m => m.round === 'VV');
ok(vv.every(m => m.a.k === 'loser' && m.b.k === 'loser'),
  'vòng vớt ghép từ đội thua vòng loại');
ok(vv[0].a.m === 'pb-nam-VL-1' && vv[0].b.m === 'pb-nam-VL-2' &&
   vv[2].a.m === 'pb-nam-VL-5' && vv[2].b.m === 'pb-nam-VL-6',
  'vòng vớt 1 = thua VL1 vs thua VL2, vòng vớt 3 = thua VL5 vs thua VL6');

/* hai đội vớt nằm ở hai nhánh khác nhau */
const tk = T.matchesOf('pb-nam').filter(m => m.round === 'TK');
/* T.matches đã sắp theo giờ nên phải đọc m.index, không phải vị trí trong mảng */
const pickSide = tk.filter(m => m.a.k === 'pick' || m.b.k === 'pick')
                   .map(m => m.index).sort((x, y) => x - y);
ok(pickSide.length === 2 && pickSide[0] === 1 && pickSide[1] === 4,
  'hai đội vớt vào TK 1 và TK 4 — hai nhánh khác nhau', JSON.stringify(pickSide));

/* ---------- 3. thời lượng theo vòng ---------- */
const durOk = T.matchesOf('pb-nam').every(m => {
  const want = (m.round === 'BK' || m.round === 'CK') ? 16 : 10;
  return (m.endMin - m.startMin) === want;
});
ok(durOk, 'Pickleball: vòng ngoài 10 phút, bán kết và chung kết 16 phút');
const clDur = T.matchesOf('cl-nam').every(m => (m.endMin - m.startMin) === 15);
ok(clDur, 'Cầu lông: mọi vòng 15 phút');

/* ---------- 4. xếp lịch ---------- */
ok(T.unscheduled.length === 0, 'không trận nào bị bỏ lại ngoài lịch',
  T.unscheduled.map(m => m.id).join(', '));

/* hai nội dung Pickleball dùng chung 2 sân */
const pbCourts = new Set();
['pb-nam', 'pb-mix'].forEach(id => T.matchesOf(id).forEach(m => m.court && pbCourts.add(m.court.id)));
ok(pbCourts.size === 2 && pbCourts.has('pb1') && pbCourts.has('pb2'),
  'hai nội dung Pickleball dùng chung đúng 2 sân', [...pbCourts].join(','));
const clCourts = new Set();
['cl-nam', 'cl-mix'].forEach(id => T.matchesOf(id).forEach(m => m.court && clCourts.add(m.court.id)));
ok(clCourts.size === 3, 'hai nội dung Cầu lông dùng chung đúng 3 sân', [...clCourts].join(','));

/* không trùng sân */
let clash = null;
const byCourt = {};
T.matches.forEach(m => {
  if (!m.court) return;
  (byCourt[m.court.id] = byCourt[m.court.id] || []).push(m);
});
Object.keys(byCourt).forEach(c => {
  const list = byCourt[c].slice().sort((a, b) => a.startMin - b.startMin);
  for (let i = 1; i < list.length; i++) {
    if (list[i].startMin < list[i - 1].endMin) clash = c + ': ' + list[i - 1].id + ' & ' + list[i].id;
  }
});
ok(!clash, 'không có trận nào trùng sân trùng giờ', clash);

/* phụ thuộc: trận sau phải bắt đầu sau khi trận trước kết thúc */
let depBad = null;
T.matches.forEach(m => {
  [m.a, m.b].forEach(ref => {
    if (!ref || (ref.k !== 'winner' && ref.k !== 'loser')) return;
    const dep = T.matchById[ref.m];
    if (dep && dep.endMin > m.startMin) depBad = m.id + ' bắt đầu trước khi ' + dep.id + ' xong';
  });
});
ok(!depBad, 'không trận nào bắt đầu trước trận nó phụ thuộc', depBad);

const last = Math.max(...T.matches.map(m => m.endMin));
const hh = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
console.log('      giờ kết thúc dự kiến (chưa bốc thăm): ' + hh(last));

/* ---------- 5. vòng vớt chọn đúng 2 đội ---------- */
const res = {};
/* 6 đội số lẻ thắng vòng loại */
T.matchesOf('pb-nam').filter(m => m.round === 'VL').forEach(m => { res[m.id] = [11, 5]; });
T.setResults(res);
/* ba trận vớt: hiệu số 6, 4, 2 -> lấy đội thắng VV1 và VV2 */
const vvm = T.matchesOf('pb-nam').filter(m => m.round === 'VV');
res[vvm[0].id] = [11, 5];   /* hiệu số 6 */
res[vvm[1].id] = [11, 7];   /* hiệu số 4 */
res[vvm[2].id] = [11, 9];   /* hiệu số 2 */
T.setResults(res);
const rp = T.repechage(T.eventById['pb-nam']);
ok(rp.ready, 'chọn xong 2 đội vớt khi đã đủ kết quả');
ok(rp.rows.length === 3 && rp.rows[0].diff === 6 && rp.rows[2].diff === 2,
  'xếp hạng vòng vớt theo hiệu số giảm dần', rp.rows.map(r => r.diff).join(','));
ok(rp.picks.filter(Boolean).length === 2 && rp.picks[0] !== rp.picks[1],
  'chọn đúng 2 đội khác nhau', JSON.stringify(rp.picks));

/* bằng hiệu số thì xét tổng điểm */
res[vvm[1].id] = [11, 9];   /* hiệu số 2, 11 điểm */
res[vvm[2].id] = [9, 7];    /* hiệu số 2, 9 điểm  */
T.setResults(res);
const rp2 = T.repechage(T.eventById['pb-nam']);
ok(rp2.ready && rp2.rows[1].pts === 11,
  'hiệu số bằng nhau thì đội ghi nhiều điểm hơn được chọn', JSON.stringify(rp2.rows.map(r => r.diff + '/' + r.pts)));

/* bằng cả hai thì báo phải bốc thăm, không tự chọn */
res[vvm[2].id] = [11, 9];
T.setResults(res);
const rp3 = T.repechage(T.eventById['pb-nam']);
ok(rp3.tie && !rp3.ready, 'bằng cả hiệu số lẫn tổng điểm thì báo cần bốc thăm');

/* ---------- 6. tranh hạng Ba ---------- */
const tbCl = T.matchById['cl-nam-TB-1'];
ok(!!tbCl, 'CL đôi nam có trận tranh hạng Ba');
ok(tbCl && tbCl.a.k === 'loser' && tbCl.a.m === 'cl-nam-BK-1' &&
   tbCl.b.k === 'loser' && tbCl.b.m === 'cl-nam-BK-2',
  'tranh hạng Ba ghép hai đội thua bán kết');
ok(!T.matchById['pb-nam-TB-1'], 'PB đôi nam không có trận tranh hạng Ba');

console.log('\n' + pass + ' đạt, ' + fail + ' hỏng');
process.exit(fail ? 1 : 0);
