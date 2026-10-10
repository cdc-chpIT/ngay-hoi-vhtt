const fs=require('fs'),vm=require('vm');
function load(mutate){
  const ctx={console};vm.createContext(ctx);
  for (const f of ['assets/js/config.js','assets/js/data.js','assets/js/tournament.js'])
    vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..',f),'utf8'),ctx,{filename:f});
  if(mutate) mutate(ctx.VHTT_DATA);
  return vm.runInContext('Tournament.make(VHTT_DATA)',ctx);
}
function ok(n,c){console.log((c?'PASS':'FAIL')+'  '+n)}
// A. baseline
let S=load();
// 47 tu 10/10/2026: cl-mix len 8 doi (ko8) nen co 7 tran thay vi 4
ok('baseline builds, 47 matches, none unscheduled', S.matches.length===47 && (S.unscheduled||[]).length===0 && S.matches.every(m=>m.court));
// B. neu BTC rut lai hai doi bo sung thi cl-mix ve r6diff 6 doi
S=load(d=>{const e=d.events.find(x=>x.id==='cl-mix');e.format='r6diff';e.teamCount=6;e.teams=e.teams.slice(0,6);e.seeds=[1,2,3,4,5,6]});
ok('cl-mix -> r6diff does not crash and schedules everything',
   S.matches.every(m=>m.court && m.startMin!=null) && (S.unscheduled||[]).length===0);
console.log('   matches now:', S.matches.length, 'last end', Tournament_toHHMM(S));
function Tournament_toHHMM(S){const e=S.matches.reduce((a,m)=>Math.max(a,m.endMin),0);return Math.floor(e/60)+':'+String(e%60).padStart(2,'0')}
// C. pb-mix -> r6diff
S=load(d=>{const e=d.events.find(x=>x.id==='pb-mix');e.format='r6diff';e.teamCount=6});
ok('pb-mix -> r6diff does not crash', S.matches.every(m=>m.court && m.startMin!=null));
// D. brand new event with no roundOrder entry
S=load(d=>{d.events.push({id:'extra',name:'Thử',short:'Thử',sport:'cầu lông',venueId:'cl',format:'ko8',teamCount:8,targetScore:21,teams:[],seeds:[],scoring:'',drawRule:''})});
ok('unknown event still scheduled, no crash', S.matches.every(m=>m.court && m.startMin!=null) && (S.unscheduled||[]).length===0);
// E. blank scores must not become 0
S=load();
S.setResults({'pb-mix-TK-1':['',7],'pb-mix-TK-2':[11,''],'pb-mix-TK-3':[null,null],'pb-mix-TK-4':[11,5]});
ok('blank halves rejected, full row kept', Object.keys(S.results).join()==='pb-mix-TK-4');
// F. pb-mix da khop dung 8 doi theo bang chia 2026
S=load();
const pm=S.eventById['pb-mix'];
ok('pb-mix now has exactly 8 teams (no overflow)', pm.teams.length === 8 && pm.teamCount===8 && pm.status==='ok');

// G. replan is idempotent and applies the player constraint after a draw
(function(){
  const fs=require('fs'),vm=require('vm');
  const ctx={console};vm.createContext(ctx);
  for (const f of ['assets/js/config.js','assets/js/data.js','assets/js/tournament.js'])
    vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..',f),'utf8'),ctx,{filename:f});
  const S=vm.runInContext('Tournament.make(VHTT_DATA)',ctx);
  const before=S.matches.map(m=>m.id+'@'+m.time).join('|');
  S.replan();
  const same=S.matches.map(m=>m.id+'@'+m.time).join('|');
  ok('replan with no change is a no-op', before===same);
  // now draw the two mixed events and replan
  for (const id of ['pb-mix','cl-mix']) { const e=S.eventById[id]; e.seeds=e.teams.map(t=>t.id).slice(0,e.teamCount); }
  S.replan();
  const names=m=>{const ev=S.eventById[m.eventId];const out=[];for(const ref of [m.a,m.b]){if(!ref||ref.k!=='seed')continue;const tid=(ev.seeds||[])[ref.n-1];const t=tid!=null?ev.teamById[tid]:null;if(!t)continue;if(t.p1)out.push(t.p1.trim());if(t.p2)out.push(t.p2.trim());}return out.length?out:null};
  let clash=0;
  for(let i=0;i<S.matches.length;i++)for(let j=i+1;j<S.matches.length;j++){
    const A=S.matches[i],B=S.matches[j],na=names(A),nb=names(B);
    if(!na||!nb)continue;
    if(na.some(x=>nb.includes(x)) && A.startMin<B.endMin && B.startMin<A.endMin) clash++;
  }
  ok('after drawing both mixed events, zero player clashes', clash===0);
  const end=S.matches.reduce((a,m)=>Math.max(a,m.endMin),0);
  console.log('   last match ends', Math.floor(end/60)+':'+String(end%60).padStart(2,'0'));
  let crt=0;
  for(let i=0;i<S.matches.length;i++)for(let j=i+1;j<S.matches.length;j++){
    const A=S.matches[i],B=S.matches[j];
    if(A.court.id===B.court.id && A.startMin<B.endMin && B.startMin<A.endMin) crt++;
  }
  ok('no court double-booking after replan', crt===0);
  let dep=0;
  S.matches.forEach(m=>[m.a,m.b].forEach(r=>{if(r&&r.k==='winner'&&S.matchById[r.m].endMin>m.startMin)dep++}));
  ok('no dependency violation after replan', dep===0);
})();

// H. mot nguoi KHONG duoc dung ten o hai doi cua cung mot noi dung.
// Them 10/10/2026 vi bang cau long doi nam nu bo sung dang vi pham dieu nay:
// hai doi cung thang thi chung ket la chinh nguoi do gap chinh minh.
(function(){
  const S=load();
  let dup=[];
  for (const ev of S.events){
    const seen={};
    for (const t of (ev.teams||[]))
      for (const n of [t.p1,t.p2]) {
        if(!n) continue;
        const k=n.trim();
        if(seen[k]) dup.push(ev.id+': '+k+' (doi '+seen[k]+' va doi '+t.id+')');
        else seen[k]=t.id;
      }
  }
  ok('khong ai dung ten o hai doi cua cung mot noi dung', dup.length===0);
  if(dup.length) console.log('   ', dup.join(' | '));
})();
