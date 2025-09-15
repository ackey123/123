
import Link from 'next/link'

export default function Home(){
  return (
    <main className="card">
      <h1 style={{margin:0, fontWeight:800}}>Expiry Recipe Minimal (pages/JS)</h1>
      <p>この修正版は <b>pages ルーター</b> & 純JSです。TypeScript不要、Vercelでそのままビルドできます。</p>
      <p><Link className="a" href="https://vercel.com/docs">Vercel Docs</Link></p>
    </main>
  )
}
