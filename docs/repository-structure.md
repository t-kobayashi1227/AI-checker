# リポジトリ構造定義書

**プロジェクト名:** AIレベルチェッククイズアプリ
**作成日:** 2026-03-29
**バージョン:** 1.0

---

## 1. ディレクトリ全体構成

```
aichecker/
├── app/                        # Next.js App Router（ページ・ルーティング）
│   ├── layout.tsx              # 全画面共通レイアウト
│   ├── page.tsx                # トップ画面（クイズ開始）
│   ├── globals.css             # グローバルスタイル
│   ├── favicon.ico             # ファビコン
│   ├── quiz/
│   │   └── page.tsx            # クイズ画面（10問）
│   └── result/
│       └── page.tsx            # 結果・レベル判定画面
│
├── components/                 # 再利用可能な UI コンポーネント
│   ├── QuizCard.tsx            # 問題文・4択選択
│   ├── FeedbackBanner.tsx      # 正誤・解説の即時表示
│   └── ResultCard.tsx          # レベル・スコア・アドバイス表示
│
├── data/                       # 静的データ
│   └── questions.ts            # 問題データ（10問）
│
├── types/                      # TypeScript 型定義
│   └── quiz.ts                 # クイズ関連の型
│
├── docs/                       # プロジェクトドキュメント
│   ├── product-requirements.md     # プロダクト要求仕様書
│   ├── development-guidelines.md   # 開発ガイドライン
│   ├── repository-structure.md     # リポジトリ構造定義書（本文書）
│   ├── feature-design.md           # 機能設計書
│   └── architecture.md             # アーキテクチャ設計書
│
├── public/                     # 静的アセット
│   └── （画像・アイコン等）
│
├── CLAUDE.md                   # AI エージェント向けプロジェクト指示書
├── README.md                   # プロジェクト概要
├── next.config.ts              # Next.js 設定
├── tsconfig.json               # TypeScript 設定
├── eslint.config.mjs           # ESLint 設定
├── postcss.config.mjs          # PostCSS 設定（Tailwind CSS）
├── package.json                # 依存パッケージ
└── package-lock.json           # パッケージバージョンのロック
```

---

## 2. 各ディレクトリの責務

### `/app`
Next.js App Router のページファイルを置く。
**ルーティングと最小限のレイアウトのみ**を担当し、ロジックや UI は `/components` に委ねる。

| ファイル | 役割 |
|---------|------|
| `layout.tsx` | 全画面共通のHTMLラッパー・フォント設定など |
| `page.tsx` | トップ画面。クイズ開始ボタンのみのシンプルな画面 |
| `quiz/page.tsx` | クイズ進行画面。`QuizCard` と `FeedbackBanner` を使用 |
| `result/page.tsx` | 結果画面。`ResultCard` を使用 |

### `/components`
再利用可能な UI コンポーネントを置く。
1ファイル = 1コンポーネント。named export を使用。

| ファイル | 役割 |
|---------|------|
| `QuizCard.tsx` | 問題文と4択ボタンを表示。選択状態を管理 |
| `FeedbackBanner.tsx` | 回答後に正誤（○/✕）と解説文を表示 |
| `ResultCard.tsx` | スコア・レベル名・アドバイスを表示 |

### `/data`
静的データを置く。コンポーネントへの直書きは禁止。

| ファイル | 役割 |
|---------|------|
| `questions.ts` | 10問分の問題データ（問題文・選択肢・正答・解説） |

### `/types`
TypeScript の型定義を置く。型はここに集約し、各ファイルで import して使う。

| ファイル | 役割 |
|---------|------|
| `quiz.ts` | `Question` 型・`Level` 型・`QuizResult` 型など |

### `/docs`
プロジェクトのドキュメント一式。コードと同じリポジトリで管理する。

### `/public`
Next.js の静的ファイル配信ディレクトリ。画像・OGP画像などを置く。

---

## 3. 命名規則まとめ

| 種別 | 規則 | 例 |
|------|------|----|
| コンポーネントファイル | PascalCase | `QuizCard.tsx` |
| ページファイル | Next.js 規約 | `page.tsx` |
| データファイル | camelCase | `questions.ts` |
| 型定義ファイル | camelCase | `quiz.ts` |
| ドキュメント | kebab-case | `feature-design.md` |

---

## 4. Phase 2 以降の追加予定ディレクトリ

```
aichecker/
├── scripts/                    # バックエンドスクリプト（Python）
│   └── sync_notion_to_supabase.py  # Notion → Supabase 同期スクリプト
│
└── app/
    └── api/                    # Next.js API Routes（必要になった時点で追加）
```

| ディレクトリ | 追加タイミング | 目的 |
|-------------|-------------|------|
| `scripts/` | Phase 2 | Notion→Supabase 同期スクリプト（Python） |
| `app/api/` | Phase 2 | Supabase からの問題取得 API |

---

## 5. コミットしないファイル（.gitignore）

| ファイル・フォルダ | 理由 |
|-----------------|------|
| `node_modules/` | 依存パッケージ（npm install で再生成可能） |
| `.next/` | ビルド成果物 |
| `.env` / `.env.local` | API キー・DB 接続情報（機密情報） |
