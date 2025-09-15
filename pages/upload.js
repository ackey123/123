import { useState } from 'react';
import { loadItems, saveItems } from '@/lib/storage';

async function ocrImage(file) {
  const Tesseract = (await import('tesseract.js')).default; // 動的 import で型/SSR問題回避
  const { data } = await Tesseract.recognize(file, 'jpn+eng');
  return data.text || '';
}

function extractExpiry(text) {
  const norm = s => s.replace(/年|\.|-/g, '/').replace(/月/g, '/').replace(/日/g, '');
  const m = norm(text).match(/(\d{2,4})\/(\d{1,2})\/(\d{1,2})/);
  if (!m) return '';
  const y = m[1].length === 2 ? String(2000 + Number(m[1])) : m[1];
  return `${y}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
}

function guessName(text){ return (text.split(/\n/).map(s=>s.trim()).find(s=> s.length>=2) || '食品').slice(0,30); }

function extractIngredients(text){
  const vocab = ['卵','牛乳','豆腐','納豆','味噌','ねぎ','玉ねぎ','トマト','キャベツ','レタス','にんじん','じゃがいも','鶏肉','豚肉','牛肉','ベーコン','ハム','ソーセージ','ヨーグルト','チーズ','パン','米','パスタ','うどん','そば','ツナ','しめじ','えのき','しいたけ','まいたけ','小松菜','ピーマン','なす','キムチ','バター','砂糖','塩','醤油','みりん','酒','ごま油','オリーブオイル','にんにく','生姜'];
  const set = new Set(); for (const w of vocab) if (text.includes(w)) set.add(w);
  return Array.from(set).join(',');
}

export default function Upload(){
  const [rows, setRows] = useState([]);     // {file, preview, name, expiry, ingredients, raw}
  const [saving, setSaving] = useState(false);

  async function onFiles(e){
    const files = Array.from(e.target.files || []);
    const next = [];
    for (const f of files) {
      const raw = await ocrImage(f);
      next.push({
        file: f,
        preview: URL.createObjectURL(f),
        name: guessName(raw),
        expiry: extractExpiry(raw),
        ingredients: extractIngredients(raw),
        raw
      });
    }
    setRows(next);
  }

  function fileToDataURL(file){
    return new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
  }

  async function saveAll(){
    setSaving(true);
    const cur = loadItems();
    for (const r of rows) {
      const image_data = r.file ? await fileToDataURL(r.file) : null;
      const item = {
        id: String(Date.now() + Math.random()),
        name: r.name,
        ingredients: r.ingredients ? r.ingredients.split(',').map(s=>s.trim()).filter(Boolean) : [],
        expiry_date: r.expiry || null,
        image_data,
        note: r.raw
      };
      cur.push(item);
    }
    saveItems(cur);
    setSaving(false);
    alert('保存しました');
    location.href = '/ingredients';
  }

  return (
    <main style={{padding:24, fontFamily:'sans-serif'}}>
      <h1>写真をアップロード（OCR→編集→保存）</h1>
      <input type="file" accept="image/*" multiple onChange={onFiles} />
      {rows.length>0 && (
        <div style={{overflowX:'auto', marginTop:12}}>
          <table style={{borderCollapse:'collapse', width:'100%'}}>
            <thead><tr><th>画像</th><th>品名</th><th>食材（カンマ区切り）</th><th>賞味期限</th><th>元テキスト</th></tr></thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i} style={{borderTop:'1px solid #ddd'}}>
                  <td><img src={r.preview} style={{width:64,height:64,objectFit:'cover',borderRadius:8}}/></td>
                  <td><input value={r.name} onChange={e=> setRows(s=> s.map((x,j)=> j===i? {...x, name:e.target.value}:x))} /></td>
                  <td><input value={r.ingredients} onChange={e=> setRows(s=> s.map((x,j)=> j===i? {...x, ingredients:e.target.value}:x))} /></td>
                  <td><input type="date" value={r.expiry} onChange={e=> setRows(s=> s.map((x,j)=> j===i? {...x, expiry:e.target.value}:x))} /></td>
                  <td><textarea value={r.raw} onChange={e=> setRows(s=> s.map((x,j)=> j===i? {...x, raw:e.target.value}:x))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:12}}>
            <button disabled={saving} onClick={saveAll}>{saving?'保存中...':'保存'}</button>
          </div>
        </div>
      )}
    </main>
  );
}
