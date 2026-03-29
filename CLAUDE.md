# Project: AI レベルチェッククイズアプリ

AIに関する知識・活用度をチェックできる10問4択クイズアプリ。
結果に応じたレベル判定とアドバイスを表示する。

## Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Language (UI): 日本語のみ

## Architecture

詳細は `docs/repository-structure.md` 参照。

```
/app          # ページ・ルーティング
/components   # UI コンポーネント
/data         # 問題データ
/types        # 型定義
/docs         # プロジェクトドキュメント
```

## Quiz Design

### カテゴリ構成（10問）

| カテゴリ | 問題数 |
|---|---|
| AIツール紹介 | 3問 |
| 基礎用語（LLM・プロンプト・ハルシネーションなど） | 3問 |
| 使い方・コツ | 2問 |
| リスク・倫理 | 2問 |

### レベル判定

| スコア | レベル |
|---|---|
| 0〜4点 | AI入門者 |
| 5〜7点 | AI活用者 |
| 8〜9点 | AI上級者 |
| 10点 | AIエキスパート |

## UI/UX

- ビジネス向け・落ち着いたデザイン（派手なアニメーションは避ける）
- 各問題回答後に即時で正誤と解説を表示する
- 全10問終了後にレベル・スコア・アドバイスを表示する

## Code Style

- TypeScript strict モード、`any` 型は禁止
- named exports を使用
- コンポーネントは `/components` に分離
- 問題データは `/data/questions.ts` に集約し、コンポーネントに直書きしない

## Documentation

プロジェクトの設計ドキュメントは `/docs` に格納されている。実装前に必ず参照すること。

| ファイル | 内容 |
|---------|------|
| `docs/product-requirements.md` | プロダクト要求仕様書（目的・機能要件・フェーズ計画） |
| `docs/development-guidelines.md` | 開発ガイドライン（ブランチ・コミット・コーディング規約） |
| `docs/repository-structure.md` | リポジトリ構造定義書（ファイル配置ルール） |
| `docs/feature-design.md` | 機能設計書（画面設計・状態管理・コンポーネント仕様） |
| `docs/architecture.md` | アーキテクチャ設計書（Phase 1〜2 の構成・技術スタック） |

## Commands

- `npm run dev` - 開発サーバー起動
- `npm run build` - ビルド
- `npm run lint` - ESLint チェック
