export default function Home(){
  return (
    <main style={{padding:24,fontFamily:'sans-serif'}}>
      <h1>✅ 起動OK（新トップ）</h1>
      <ul>
        <li><a href="/upload">/upload</a>：追加（まずは手入力）</li>
        <li><a href="/ingredients">/ingredients</a>：食材（期限が近い順）</li>
        <li><a href="/recipes">/recipes</a>：レシピ提案</li>
      </ul>
    </main>
  );
}
