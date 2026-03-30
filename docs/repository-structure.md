# リポジトリ構造定義書

**プロジェクト名:** AIレベルチェック＆ユースケースサイト
**作成日:** 2026-03-29
**更新日:** 2026-03-31
**バージョン:** 2.0

---

## 1. ディレクトリ全体構成

```
aichecker/
├── app/                              # Next.js App Router（ページ・ルーティング）
│   ├── layout.tsx                    # 全画面共通レイアウト・フォント設定
│   ├── page.tsx                      # トップ画面（クイズ開始 + ユースケース導線）
│   ├── globals.css                   # グローバルスタイル
│   ├── favicon.ico                   # ファビコン
│   ├── quiz/
│   │   └── page.tsx                  # クイズ画面（Supabase から問題取得）
│   ├── result/
│   │   └── page.tsx                  # 結果・レベル判定画面
│   ├── usecases/
│   │   ├── page.tsx                  # ユースケース一覧（カテゴリフィルタ付き）
│   │   └── [slug]/
│   │       └── page.tsx              # ユースケース記事詳細
│   └── api/
│       └── sync/
│           └── route.ts              # Notion → Supabase 問題同期 Webhook
│
├── components/                       # UI コンポーネント（1ファイル = 1コンポーネント）
│   │
│   │  ── AIチェッカー ──
│   ├── QuizCard.tsx                  # 問題文・4択ボタン（正誤ハイライト）
│   ├── QuizGame.tsx                  # クイズ進行の状態管理（Client Component）
│   ├── FeedbackBanner.tsx            # 回答後の正誤・解説・次へボタン
│   ├── ResultCard.tsx                # スコア・レベル・アドバイス・ボタン
│   │
│   │  ── ユースケース ──
│   ├── ArticleCard.tsx               # 記事一覧カード（サムネイル・カテゴリ・タイトル）
│   ├── ArticleContent.tsx            # Notion ブロックを HTML にレンダリング
│   └── CategoryFilter.tsx            # カテゴリ絞り込みサイドバー（Client Component）
│
├── data/                             # 静的データ（Phase 1 フォールバック用）
│   └── questions.ts                  # 問題データ（10問）
│
├── lib/                              # 共通ライブラリ
│   └── supabase.ts                   # Supabase クライアント
│
├── types/                            # TypeScript 型定義
│   ├── quiz.ts                       # Question・Level・QuizResult 型
│   └── article.ts                    # Article・Block・ArticleSummary 型
│
├── docs/                             # プロジェクトドキュメント
│   ├── product-requirements.md       # プロダクト要求仕様書
│   ├── development-guidelines.md     # 開発ガイドライン
│   ├── repository-structure.md       # リポジトリ構造定義書（本文書）
│   ├── feature-design.md             # 機能設計書（クイズ）
│   ├── architecture.md               # アーキテクチャ設計書
│   └── usecases-design.md            # ユースケースページ設計書
│
├── public/                           # 静的アセット（画像・OGP等）
├── CLAUDE.md                         # AI エージェント向けプロジェクト指示書
├── next.config.ts                    # Next.js 設定
├── tsconfig.json                     # TypeScript 設定
├── eslint.config.mjs                 # ESLint 設定
├── postcss.config.mjs                # PostCSS 設定（Tailwind CSS）
├── package.json                      # 依存パッケージ
└── package-lock.json                 # パッケージバージョンのロック
```

---

## 2. ページ一覧

| URL | ファイル | レンダリング | 説明 |
|-----|---------|------------|------|
| `/` | `app/page.tsx` | Static | トップ。クイズ開始 + ユースケースへの導線 |
| `/quiz` | `app/quiz/page.tsx` | Dynamic | クイズ進行。Supabase から問題取得 |
| `/result` | `app/result/page.tsx` | Static | 結果表示。sessionStorage からスコア読み込み |
| `/usecases` | `app/usecases/page.tsx` | Dynamic | 記事一覧。カテゴリフィルタ対応 |
| `/usecases/[slug]` | `app/usecases/[slug]/page.tsx` | Dynamic | 記事詳細。スラッグで記事を取得 |
| `/api/sync` | `app/api/sync/route.ts` | Dynamic | Notion Webhook 受信・Supabase 同期 |

---

## 3. コンポーネント一覧

### AIチェッカー

| ファイル | 種別 | Props | 役割 |
|---------|------|-------|------|
| `QuizGame.tsx` | Client | `questions: Question[]` | クイズ全体の状態管理・進行制御 |
| `QuizCard.tsx` | Client | `question` `selectedIndex` `isAnswered` `onSelect` | 問題文・4択ボタン表示 |
| `FeedbackBanner.tsx` | Client | `isCorrect` `explanation` `onNext` `isLast` | 回答後フィードバック表示 |
| `ResultCard.tsx` | Client | `score` `level` `onRetry` `onHome` | 結果・レベル・アドバイス表示 |

### ユースケース

| ファイル | 種別 | Props | 役割 |
|---------|------|-------|------|
| `ArticleCard.tsx` | Server | `article: ArticleSummary` | 記事一覧カード |
| `ArticleContent.tsx` | Server | `blocks: Block[]` | Notion ブロックを HTML レンダリング |
| `CategoryFilter.tsx` | Client | なし（URL params で管理） | カテゴリ絞り込みボタン |

---

## 4. 型定義一覧

### `types/quiz.ts`

| 型 | 説明 |
|----|------|
| `Question` | 問題データ（id・category・text・options・answerIndex・explanation） |
| `Category` | `'tool'` `'term'` `'usage'` `'risk'` |
| `Level` | `'beginner'` `'user'` `'advanced'` `'expert'` |
| `QuizResult` | クイズ結果（answers・score・level） |

### `types/article.ts`

| 型 | 説明 |
|----|------|
| `Article` | 記事全データ |
| `ArticleSummary` | 一覧表示用の抜粋（id・title・slug・category・excerpt・thumbnail_url・published_at） |
| `ArticleCategory` | `'導入ヒント'` `'実践ガイド'` |
| `Block` | Notion ブロックの Union 型（paragraph・heading_2/3・image・quote など） |

---

## 5. 外部サービスとの接続

| サービス | 用途 | 接続ファイル |
|---------|------|------------|
| Supabase | 問題データ・記事データの取得 | `lib/supabase.ts` |
| Notion API | Webhook 受信後のデータ取得 | `app/api/sync/route.ts` |
| Supabase Storage | 記事画像の永続保存（`article-images` バケット） | `app/api/sync-article/route.ts`（実装予定） |

---

## 6. 命名規則

| 種別 | 規則 | 例 |
|------|------|----|
| コンポーネントファイル | PascalCase | `ArticleCard.tsx` |
| ページファイル | Next.js 規約 | `page.tsx` |
| データ・ライブラリ | camelCase | `supabase.ts` |
| 型定義ファイル | camelCase | `article.ts` |
| ドキュメント | kebab-case | `usecases-design.md` |

---

## 7. コミットしないファイル（.gitignore）

| ファイル・フォルダ | 理由 |
|-----------------|------|
| `node_modules/` | 依存パッケージ（npm install で再生成可能） |
| `.next/` | ビルド成果物 |
| `.env` / `.env.local` | API キー・DB 接続情報（機密情報） |
| `__pycache__/` `*.py[cod]` `.venv/` | Python 関連（Phase 2 以降） |
