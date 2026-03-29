# 開発ガイドライン

**プロジェクト名:** AIレベルチェッククイズアプリ
**作成日:** 2026-03-29
**バージョン:** 1.0

---

## 1. ブランチ戦略

### ブランチ構成

| ブランチ | 役割 |
|---------|------|
| `main` | 本番環境（常に動作する状態を保つ） |
| `dev` | 開発環境（機能実装はここで行う） |

### 作業フロー

```
1. dev ブランチで実装・コミット
2. ローカルで動作確認
3. dev → main へマージ（本番反映）
```

### 基本ルール
- `main` への直接コミットは禁止
- `dev` で動作確認が取れたものだけ `main` にマージする
- マージ前に `npm run build` でビルドエラーがないことを確認する

---

## 2. コミットルール

### コミットメッセージの形式

```
<prefix>: <変更内容の要約>
```

### prefix 一覧

| prefix | 使うタイミング | 例 |
|--------|-------------|-----|
| `feat` | 新機能の追加 | `feat: クイズ画面を実装` |
| `fix` | バグ修正 | `fix: 正誤判定が逆になるバグを修正` |
| `style` | デザイン・CSS の変更（動作に影響しない） | `style: ボタンの色を調整` |
| `refactor` | 動作を変えないコードの整理 | `refactor: QuizCard を子コンポーネントに分割` |
| `docs` | ドキュメントの追加・更新 | `docs: 開発ガイドラインを追加` |
| `chore` | 設定ファイル・パッケージの更新 | `chore: tailwindcss を v4 に更新` |
| `data` | 問題データの追加・修正 | `data: リスク倫理カテゴリの問題を追加` |

### コミット粒度
- 1コミット = 1つの目的（複数の変更をまとめない）
- 動作しない状態でコミットしない

---

## 3. コーディング規約

### TypeScript
- `strict` モードを使用（`tsconfig.json` で設定済み）
- `any` 型の使用禁止。型が不明な場合は `unknown` を使い適切に絞り込む
- 型定義は `/types` ディレクトリに集約する

### コンポーネント設計
- UI パーツは `/components` に分離する（ページファイルに直書きしない）
- 1ファイル = 1コンポーネントを原則とする
- named export を使用する（default export は使わない）

```typescript
// Good
export const QuizCard = () => { ... }

// Bad
export default function QuizCard() { ... }
```

### データ
- 問題データはコンポーネントに直書きせず `/data/questions.ts` に集約する
- 定数・設定値は `/data` または `/constants` に置く

### ファイル名
| 種別 | 命名規則 | 例 |
|------|---------|-----|
| コンポーネント | PascalCase | `QuizCard.tsx` |
| ページ | Next.js規約（`page.tsx`） | `page.tsx` |
| データ・ユーティリティ | camelCase | `questions.ts` |
| 型定義 | camelCase | `quiz.ts` |

### インポート順序
```typescript
// 1. React / Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. 外部ライブラリ
import clsx from 'clsx'

// 3. 内部モジュール（絶対パス）
import { QuizCard } from '@/components/QuizCard'
import { questions } from '@/data/questions'
import type { Question } from '@/types/quiz'
```

---

## 4. ディレクトリ規約

```
/app              # Next.js App Router のページ（ルーティングのみ）
/components       # 再利用可能な UI コンポーネント
/data             # 静的データ・問題データ
/types            # TypeScript 型定義
/docs             # プロジェクトドキュメント
/public           # 静的アセット（画像・アイコン）
```

- `/app` 配下のファイルはルーティングと最小限のレイアウトのみ
- ロジックやUIはコンポーネントに切り出す

---

## 5. 環境構築手順

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd aichecker

# 2. dev ブランチに切り替え
git checkout dev

# 3. 依存パッケージをインストール
npm install

# 4. 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認する。

---

## 6. コマンド一覧

```bash
npm run dev      # 開発サーバー起動（http://localhost:3000）
npm run build    # 本番ビルド（マージ前に必ず実行）
npm run lint     # ESLint チェック
npm run start    # 本番ビルドをローカルで起動
```

---

## 7. デプロイ手順

### Vercel（自動デプロイ）

| ブランチ | デプロイ先 |
|---------|----------|
| `main` | 本番 URL |
| `dev` | プレビュー URL（自動生成） |

Vercel と GitHub を連携することで、`main` へのマージが自動的に本番環境へ反映される。

### マージ前チェックリスト
- [ ] `npm run build` がエラーなく完了する
- [ ] `npm run lint` が警告なく通る
- [ ] ブラウザで全画面の動作確認が取れている

---

## 8. バックエンド（Python）利用時のルール

Phase 2 以降で Python を使用する場合（Notion→Supabase 同期スクリプトなど）：

- `/scripts` ディレクトリに配置する
- 依存パッケージは `requirements.txt` で管理する
- 環境変数は `.env` ファイルで管理し、`.gitignore` に追加する（コミット禁止）
