# アーキテクチャ設計書

**プロジェクト名:** AIレベルチェッククイズアプリ
**作成日:** 2026-03-29
**バージョン:** 1.0

---

## 1. システム全体概要

本アプリは段階的に進化する設計を取る。
Phase 1 は外部依存なしの完全静的アプリとして構築し、
Phase 2 以降で問題データの外部管理・動的配信へ移行する。

---

## 2. Phase 1：静的アーキテクチャ

### 構成図

```
┌─────────────────────────────────────┐
│           ブラウザ（ユーザー）          │
└──────────────────┬──────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────┐
│             Vercel（CDN）            │
│                                     │
│  ┌───────────────────────────────┐  │
│  │       Next.js アプリ          │  │
│  │                               │  │
│  │  /app/page.tsx（トップ）       │  │
│  │  /app/quiz/page.tsx（クイズ）  │  │
│  │  /app/result/page.tsx（結果）  │  │
│  │                               │  │
│  │  /components/                 │  │
│  │  /data/questions.ts ←── 問題データ（直書き）
│  │  /types/                      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 特徴
- **外部API・DB なし** — 問題データはビルド時にバンドル済み
- **クライアントサイドのみで完結** — サーバー処理不要
- **Vercel へ自動デプロイ** — GitHub の `main` へのマージで反映

### データフロー

```
questions.ts（静的データ）
    ↓ import
quiz/page.tsx（状態管理・採点）
    ↓ sessionStorage
result/page.tsx（結果表示）
```

---

## 3. Phase 2：Notion → Supabase 連携アーキテクチャ

### 構成図

```
┌──────────────────┐     ┌───────────────────────────┐
│  Claude.ai /     │     │     Notion                 │
│  ChatGPT         │────▶│  （問題データベース）         │
│  （問題生成）     │     │  ステータス変更              │
└──────────────────┘     │  ↓ オートメーション          │
                         └──────────┬────────────────┘
                                    │ Webhook 発火
                                    ▼
                         ┌──────────────────┐
                         │  同期用 API      │
                         │  （Next.js       │
                         │   app/api/sync） │
                         └────────┬─────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │    Supabase      │
                        │  （PostgreSQL）   │
                        └────────┬─────────┘
                                  │ REST API / SDK
                                  ▼
┌─────────────────────────────────────────────┐
│                  Vercel                     │
│                                             │
│   Next.js アプリ                            │
│   app/api/ → Supabase からデータ取得         │
│   /app/quiz/page.tsx → API 経由で問題表示   │
└─────────────────────────────────────────────┘
```

### ステータス定義

| Notion ステータス | Supabase is_active | アプリへの影響 |
|-----------------|-------------------|--------------|
| 公開 | true | クイズに出題される |
| 公開停止 | false | 出題されない（データは保持） |
| 下書き | false | 出題されない（編集中） |

### 問題管理フロー

#### 新規追加
```
1. Claude.ai / ChatGPT で問題文・選択肢・解説を生成
       ↓
2. Notion のデータベースに入力（ステータス：下書き）
       ↓
3. 内容を確認後、ステータスを「公開」に変更
       ↓ Notion オートメーションが Webhook を発火
4. 同期用 API（app/api/sync）が Notion API からデータ取得
       ↓
5. Supabase へ upsert（is_active: true）
       ↓
6. Next.js アプリが Supabase から問題を取得して表示
```

#### 既存問題の編集
```
1. ステータスを「下書き」に変更
       ↓ Webhook 発火 → Supabase の is_active が false に（出題停止）
2. 問題文・選択肢・解説などを編集
       ↓
3. 編集完了後、ステータスを「公開」に変更
       ↓ Webhook 発火 → Supabase に最新内容で upsert・is_active: true
```

#### 公開停止
```
ステータスを「公開停止」に変更
    ↓ Webhook 発火 → Supabase の is_active が false に
    ↓ アプリから即座に非表示（データは Supabase に保持）
```

### Supabase テーブル設計（予定）

```sql
-- 問題テーブル
CREATE TABLE questions (
  id            serial PRIMARY KEY,
  notion_id     text UNIQUE NOT NULL,  -- Notion ページ ID（同期の重複防止）
  category      text NOT NULL,         -- 'tool' | 'term' | 'usage' | 'risk'
  question_text text NOT NULL,         -- 問題文
  options       jsonb NOT NULL,        -- 選択肢（配列）
  answer_index  integer NOT NULL,      -- 正答インデックス（0〜3）
  explanation   text NOT NULL,         -- 解説文
  is_active     boolean DEFAULT true,  -- 公開フラグ
  created_at    timestamp DEFAULT now(),
  updated_at    timestamp DEFAULT now()
);
```

#### Phase 3 以降：カテゴリ均等ランダム取得クエリ

問題数が増えた際は、カテゴリごとに指定数をランダム取得して出題する。

```sql
(SELECT * FROM questions WHERE category='tool'  AND is_active=true ORDER BY RANDOM() LIMIT 3)
UNION ALL
(SELECT * FROM questions WHERE category='term'  AND is_active=true ORDER BY RANDOM() LIMIT 3)
UNION ALL
(SELECT * FROM questions WHERE category='usage' AND is_active=true ORDER BY RANDOM() LIMIT 2)
UNION ALL
(SELECT * FROM questions WHERE category='risk'  AND is_active=true ORDER BY RANDOM() LIMIT 2)
```

---

## 4. 技術スタック

### Phase 1

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript 5（strict モード） |
| スタイリング | Tailwind CSS v4 |
| デプロイ | Vercel |
| バージョン管理 | GitHub |

### Phase 2 追加分

| 役割 | 技術 |
|------|------|
| 問題管理 CMS | Notion |
| データベース | Supabase（PostgreSQL） |
| 同期トリガー | Notion オートメーション（Webhook） |
| 同期 API | Next.js API Route（app/api/sync） |
| Notion 連携 | Notion API |
| Supabase 連携 | Supabase JS SDK |

---

## 5. 画面レンダリング方式

| 画面 | 方式 | 理由 |
|------|------|------|
| トップ（`/`） | Static（静的生成） | 変化しない画面のため |
| クイズ（`/quiz`） | Client Component | ユーザー操作・状態管理が必要 |
| 結果（`/result`） | Client Component | sessionStorage からデータ読み込みが必要 |

Phase 2 以降でクイズ画面の問題取得は Server Component または API Route 経由に切り替える。

---

## 6. 状態管理方針

本アプリはグローバルな状態管理ライブラリ（Redux / Zustand 等）は使用しない。
スコープが小さいため `useState` と `sessionStorage` で十分。

| データ | 管理方法 | 理由 |
|--------|---------|------|
| 現在の問題番号 | `useState` | クイズ画面内でのみ使用 |
| 選択した回答 | `useState` | クイズ画面内でのみ使用 |
| クイズの回答履歴・スコア | `sessionStorage` | 画面またぎで受け渡すため |

---

## 7. デプロイ・環境構成

```
GitHub リポジトリ
├── main ブランチ  →  Vercel 本番環境（https://xxx.vercel.app）
└── dev ブランチ   →  Vercel プレビュー環境（自動生成 URL）
```

### 環境変数（Phase 2 以降）

| 変数名 | 用途 |
|--------|------|
| `SUPABASE_URL` | Supabase の接続先 URL |
| `SUPABASE_ANON_KEY` | Supabase の公開キー |
| `NOTION_API_KEY` | Notion API 認証キー |
| `NOTION_DATABASE_ID` | 問題管理用 Notion DB の ID |

環境変数は `.env.local` で管理し、`.gitignore` でコミット対象外とする。
Vercel のダッシュボードで本番用の環境変数を設定する。
