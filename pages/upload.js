import { useState } from 'react';
import { loadItems, saveItems } from '@/lib/storage';

export default function Upload(){
  const [name,setName]=useState('');
  const [ingredients,setIngredients]=useState('');
  const [expiry,setExpiry]=useState('');

  function add(){
    const cur = loadItems();
    cur.push({
      id: String(Date.now()+Math.random()),
      name,
      ingredients: ingredients.split(',').map(s=>s.trim()).filter(Boolean),
      expiry_date: expiry || null,
      image_data: null,
      note: ''
    });
    saveItems(cur);
    alert('保存しました'); location.href='/ingredients';
  }

  return (
    <main style={{padding:24,fontFamily:'sans-serif'}}>
      <h1>アイテム追加（まずは手入力）</h1>
      <div style={{display:'grid',gap:8,maxWidth:480}}>
        <label>品名<input value={name} onChange={e=>setName(e.target.value)} /></label>
        <label>食材（カンマ区切り）<input value={ingredients} onChange={e=>setIngredients(e.target.value)} /></label>
        <label>賞味期限<input type="date" value={expiry} onChange={e=>setExpiry(e.target.value)} /></label>
        <button onClick={add}>保存</button>
      </div>
    </main>
  );
}
