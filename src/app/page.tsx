import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="container screen screen--no-nav">
        <div className="stack-lg">
          <div>
            <span className="kicker">住まい探し整理</span>
            <h1>物件を探す前に、いちど「探し方」を整理してみる。</h1>
            <p className="lead">
              希望・予算・今の市場を整理しながら、自分に合った住まいの探し方を見つけます。
            </p>
            <p className="lead">
              買うことをおすすめする診断ではありません。「買う」「待つ」「今は買わない」も含めて、
              自分が納得できる選択を考えるためのツールです。
            </p>
          </div>

          <Link href="/demo" className="btn btn-primary" style={{ textDecoration: "none" }}>
            住まい探しを整理する（約90秒）
          </Link>
          <p className="tiny muted">入力内容はこの端末にのみ保存されます。</p>
        </div>
      </div>
    </main>
  );
}
