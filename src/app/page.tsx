import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <div className="container screen screen--no-nav">
        <div className="stack-lg">
          <div>
            <span className="kicker">住宅購入意思決定OS</span>
            <h1>「買った」ではなく、「自分で決めた」を目指す。</h1>
            <p className="lead">
              このサービスは「家を買わせる診断」ではありません。
              <br />
              SELF（自分を知る）→ MARKET（市場を知る）→ DECIDE（物件を決める）の順番で整理し、
              最終的に「自分はなぜこの選択をするのか」を自分の言葉で説明できる状態をつくります。
            </p>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>「買う」「待つ」「今は買わない」「まだ分からない」</h2>
            <p className="small" style={{ margin: 0 }}>
              このすべてを、正常な結論として扱います。営業誘導は行いません。
            </p>
          </div>

          <div className="stack-sm">
            <h3>画面の内部思想</h3>
            <p className="small muted" style={{ margin: 0 }}>
              WANT（何を実現したいか）→ CAN（無理なくできるか）→ MARKET（今の市場で成立するか）→
              WILL（それでも自分はどうしたいか）。CANとWILLは別物として扱います。
            </p>
          </div>

          <Link href="/demo" className="btn btn-primary" style={{ textDecoration: "none" }}>
            デモを試す（約90秒から）
          </Link>
          <p className="tiny muted">
            /demo はデータベースを使用しないデモです。入力内容はお使いの端末（ブラウザ）にのみ保存されます。
          </p>
        </div>
      </div>
    </main>
  );
}
