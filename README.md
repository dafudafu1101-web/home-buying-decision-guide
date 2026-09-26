# 住宅購入 vs 賃貸比較ツール

住宅購入と賃貸継続を、単純な支払総額ではなく、キャッシュフロー・実質住居費・元本返済・住宅純資産・賃貸側金融資産まで分けて比較するWebツールです。

## 正式仕様

最新版の仕様上の正本は [`SPECIFICATION.md`](./SPECIFICATION.md) です。

- 基準日: 2026-09-26
- 2026-09-25時点の完成済み実装を維持しつつ、「住宅ローン実質負担｜理論・営業説明」で確定した考え方を統合
- 購入・賃貸のどちらかを推奨するためのツールではなく、お客様自身が判断するための比較材料を提供

## 本番URL

https://home-buying-decision-guide.vercel.app

## 開発・公開

- `main` を正本としてGitHub更新
- Vercelが自動デプロイ
- GitHub側でVercel statusを確認
- GitHub Actionsで本番URL疎通確認

詳細は [`OPERATIONS.md`](./OPERATIONS.md) を参照してください。
