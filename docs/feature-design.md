# 機能設計書

**プロジェクト名:** AIレベルチェッククイズアプリ
**作成日:** 2026-03-29
**バージョン:** 1.0

---

## 1. 画面一覧と遷移フロー

```
[トップ画面 /]
    ↓ 「クイズを始める」ボタン
[クイズ画面 /quiz]
    ↓ 10問すべて回答
[結果画面 /result]
    ├─ 「もう一度挑戦する」ボタン → [クイズ画面 /quiz]
    └─ 「ホームに戻る」ボタン    → [トップ画面 /]
```

---

## 2. データ構造

### `Question` 型（`/types/quiz.ts`）

```typescript
export type Question = {
  id: number           // 問題番号（1〜10）
  category: Category   // カテゴリ
  text: string         // 問題文
  options: string[]    // 選択肢（4つ）
  answerIndex: number  // 正答のインデックス（0〜3）
  explanation: string  // 解説文
}

export type Category =
  | 'tool'      // AIツール紹介
  | 'term'      // 基礎用語
  | 'usage'     // 使い方・コツ
  | 'risk'      // リスク・倫理

export type Level = 'beginner' | 'user' | 'advanced' | 'expert'

export type QuizResult = {
  answers: number[]    // 各問題で選んだ選択肢のインデックス
  score: number        // 正解数（0〜10）
  level: Level         // 判定レベル
}
```

### 問題データ例（`/data/questions.ts`）

```typescript
export const questions: Question[] = [
  {
    id: 1,
    category: 'tool',
    text: '次のうち、OpenAI が開発した AI チャットツールはどれですか？',
    options: ['Claude', 'Gemini', 'ChatGPT', 'Copilot'],
    answerIndex: 2,
    explanation: 'ChatGPT は OpenAI が開発した AI チャットツールです。Claude は Anthropic、Gemini は Google が開発しています。',
  },
  // ... 残り9問
]
```

---

## 3. 画面別機能設計

### 3.1 トップ画面（`/app/page.tsx`）

**目的:** アプリの概要を伝え、クイズへ誘導する

**表示要素:**
- アプリタイトル
- 概要説明文（何のクイズか・何問か）
- 所要時間の目安（約3分）
- 「クイズを始める」ボタン

**動作:**
- 「クイズを始める」ボタン押下 → `/quiz` へ遷移
- `useRouter` による クライアントサイドナビゲーション

**状態管理:** なし（静的画面）

---

### 3.2 クイズ画面（`/app/quiz/page.tsx`）

**目的:** 10問を順番に出題し、各回答後に正誤と解説を表示する

**状態管理（`useState`）:**

| 変数名 | 型 | 初期値 | 説明 |
|--------|-----|--------|------|
| `currentIndex` | `number` | `0` | 現在の問題番号（0〜9） |
| `selectedIndex` | `number \| null` | `null` | 選択した選択肢のインデックス |
| `answers` | `number[]` | `[]` | 全問題の回答履歴 |
| `isAnswered` | `boolean` | `false` | 回答済みかどうか |

**動作フロー:**

```
1. 問題を表示（QuizCard）
2. ユーザーが選択肢をクリック
   → selectedIndex をセット
   → isAnswered を true にする
   → FeedbackBanner を表示（正誤・解説）
3. 「次へ」ボタンをクリック
   → answers に selectedIndex を追加
   → currentIndex を +1
   → selectedIndex を null にリセット
   → isAnswered を false にリセット
4. currentIndex が 10 になったら
   → スコアを計算
   → /result へ answers と score を渡して遷移
```

**結果データの受け渡し:**
- `sessionStorage` に `QuizResult` を JSON 保存して `/result` へ遷移
- URL パラメータへの直接埋め込みは避ける（データ量・セキュリティ）

**使用コンポーネント:**
- `QuizCard` — 問題表示・選択肢ボタン
- `FeedbackBanner` — 回答後の正誤・解説表示

---

### 3.3 結果画面（`/app/result/page.tsx`）

**目的:** スコアとレベルを表示し、次のアクションを促す

**データ取得:**
- `sessionStorage` から `QuizResult` を読み込む
- データがない場合（直接URLアクセス）はトップ画面にリダイレクト

**レベル判定ロジック:**

```typescript
const getLevel = (score: number): Level => {
  if (score <= 4) return 'beginner'   // AI入門者
  if (score <= 7) return 'user'       // AI活用者
  if (score <= 9) return 'advanced'   // AI上級者
  return 'expert'                     // AIエキスパート
}
```

**レベル別表示データ:**

| Level | 表示名 | アドバイス概要 |
|-------|--------|-------------|
| `beginner` | AI入門者 | AIツールの基本的な使い方から始めましょう |
| `user` | AI活用者 | 業務での活用シーンを増やしていきましょう |
| `advanced` | AI上級者 | プロンプト設計など高度な活用を目指しましょう |
| `expert` | AIエキスパート | 知識を周囲にも広めていきましょう |

**表示要素:**
- スコア（例: 7 / 10）
- レベル名
- レベルの説明文
- アドバイス
- 「もう一度挑戦する」ボタン（`sessionStorage` をクリアして `/quiz` へ）
- 「ホームに戻る」ボタン（`sessionStorage` をクリアして `/` へ）

**使用コンポーネント:**
- `ResultCard` — スコア・レベル・アドバイス表示

---

## 4. コンポーネント別設計

### 4.1 `QuizCard`

**役割:** 問題文と4択ボタンを表示する

**Props:**

```typescript
type QuizCardProps = {
  question: Question
  selectedIndex: number | null
  isAnswered: boolean
  onSelect: (index: number) => void
}
```

**動作:**
- 選択肢ボタンを4つ表示
- `isAnswered` が `false` のとき：クリックで `onSelect` を呼ぶ
- `isAnswered` が `true` のとき：すべてのボタンを非活性にする
- 正解の選択肢：緑色でハイライト
- 不正解で選んだ選択肢：赤色でハイライト

---

### 4.2 `FeedbackBanner`

**役割:** 回答直後に正誤と解説を表示する

**Props:**

```typescript
type FeedbackBannerProps = {
  isCorrect: boolean
  explanation: string
  onNext: () => void
  isLast: boolean       // 最後の問題かどうか（ボタンラベルの切り替え）
}
```

**表示:**
- 正解時：「○ 正解！」（緑）＋ 解説文
- 不正解時：「✕ 不正解」（赤）＋ 解説文
- ボタン：`isLast` が `false` →「次の問題へ」 / `true` →「結果を見る」

---

### 4.3 `ResultCard`

**役割:** スコア・レベル・アドバイスをまとめて表示する

**Props:**

```typescript
type ResultCardProps = {
  score: number
  level: Level
  onRetry: () => void  // 「もう一度挑戦する」→ /quiz へ遷移
  onHome: () => void   // 「ホームに戻る」→ / へ遷移
}
```

**表示:**
- スコア（数字を大きく表示）
- レベル名
- レベル説明文・アドバイス
- 「もう一度挑戦する」ボタン（`onRetry` を呼ぶ）
- 「ホームに戻る」ボタン（`onHome` を呼ぶ）

---

## 5. 進捗表示

クイズ画面上部に進捗を表示する。

```
問題 3 / 10
[████████░░░░░░░░░░░░] 30%
```

- 進捗バーは CSS で実装（Tailwind の `w-[30%]` など）
- `currentIndex + 1` / `questions.length` で計算

---

## 6. スコア計算ロジック

```typescript
const calcScore = (questions: Question[], answers: number[]): number => {
  return answers.reduce((score, answerIndex, i) => {
    return answerIndex === questions[i].answerIndex ? score + 1 : score
  }, 0)
}
```
