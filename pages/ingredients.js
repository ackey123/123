import { useEffect, useState } from 'react';
import { loadItems } from '@/lib/storage';

export default function Ingredients(){
  const [ings,setIngs]=useState([]);
  useEffect(()=>{
    const items = loadItems();
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
    const arr = Array.from(m.entries())
      .map(([name,soonest])=>({name,soonest}))
      .sort((a,b)=>(a.soonest??999)-(b.soonest??999));
    setIngs(arr);
  },[]);

  return (
    <main style={{padding:24,fontFamily:'sans-serif'}}>
      <h1>食材（期限が近い順）</h1>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
        {ings.length ? ings.map(x=>(
          <span key={x.name} style={{background:'#eee',borderRadius:12,padding:'6px 10px'}}>
            {x.name} <small>({x.soonest}日)</small>
          </span>
        )) : <small>（まだありません。/upload で追加）</small>}
      </div>
    </main>
  );
}
