import { useEffect, useMemo, useState } from 'react';
import { loadItems } from '@/lib/storage';

const RULES = [
  { need:['卵','牛乳','砂糖'], name:'プリン', how:'卵・牛乳・砂糖を混ぜ湯せんで蒸す' },
  { need:['トマト','パスタ'], name:'トマトパスタ', how:'にんにく＋トマトを煮てパスタと和える' },
  { need:['豆腐','味噌','ねぎ'], name:'豆腐とねぎの味噌汁', how:'だし→豆腐→味噌→ねぎ' },
  { need:['キャベツ','ベーコン'], name:'キャベツとベーコンのソテー', how:'ベーコン炒め→キャベツ→塩胡椒' },
  { need:['卵'], name:'卵焼き', how:'卵＋砂糖/塩で焼く' },
  { need:['豆腐'], name:'冷奴', how:'豆腐に醤油・ねぎ・生姜' }
];

export default function Recipes(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ setItems(loadItems()); },[]);

  const urgencyByIng = useMemo(()=>{
    const m = new Map();
    const today = new Date().setHours(0,0,0,0);
    for(const it of items){
      if (!it.expiry_date) continue;
      const d = new Date(it.expiry_date).setHours(0,0,0,0);
      const left = Math.floor((d - today)/86400000);
      for(const ing of it.ingredients||[]){
        m.set(ing, Math.min(left, m.get(ing) ?? left));
      }
    }
    return m;
  },[items]);

  const haveSet = useMemo(()=>{
    const s = new Set(); for(const it of items) for(const ing of it.ingredients||[]) s.add(ing); return s;
  },[items]);

  const suggestions = useMemo(()=>{
    const arr = RULES.map(r=>{
      const hit = r.need.filter(n=>haveSet.has(n));
      if (!hit.length) return null;
      let bonus = 0;
      for(const h of hit){
        const dl = urgencyByIng.get(h) ?? 30;
        bonus += Math.max(0, (30 - dl)/30);
      }
      const score = hit.length + bonus;
      const soonest = Math.min(...hit.map(h=> urgencyByIng.get(h) ?? 365));
      return { ...r, hitCount: hit.length, score, soonest };
    }).filter(Boolean);
    arr.sort((a,b)=>(a.soonest-b.soonest) || (b.score-a.score));
    return arr;
  },[haveSet, urgencyByIng]);

  return (
    <main style={{padding:24,fontFamily:'sans-serif'}}>
      <h1>レシピ提案（期限が近い順）</h1>
      <div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))'}}>
        {suggestions.length ? suggestions.map((r,i)=>(
          <div key={i} style={{background:'#f7f7f7',borderRadius:14,padding:14}}>
            <div style={{fontSize:12,color:'#666'}}>必要: {r.need.join(', ')}</div>
            <div style={{fontWeight:800,fontSize:18,marginTop:6}}>{r.name}</div>
            <div style={{marginTop:6}}>{r.how}</div>
            <div style={{fontSize:12,color:'#666',marginTop:6}}>緊急度: 最短 {r.soonest} 日</div>
          </div>
        )) : <small>該当なし。/upload で食材を追加してください。</small>}
      </div>
    </main>
  );
}
