import type { Question } from '@/types/quiz'

export const questions: Question[] = [
  // AIツール紹介（3問）
  {
    id: 1,
    category: 'tool',
    text: 'ChatGPT を開発・提供している企業はどこですか？',
    options: ['Google', 'Microsoft', 'OpenAI', 'Meta'],
    answerIndex: 2,
    explanation:
      'ChatGPT は OpenAI が開発した AI チャットツールです。Microsoft は OpenAI に出資しており、Bing や Copilot に技術を活用しています。',
  },
  {
    id: 2,
    category: 'tool',
    text: 'Anthropic が開発した AI アシスタントの名称はどれですか？',
    options: ['Gemini', 'Claude', 'Copilot', 'Llama'],
    answerIndex: 1,
    explanation:
      'Claude は Anthropic が開発した AI アシスタントです。安全性と有用性のバランスを重視した設計が特徴です。Gemini は Google、Copilot は Microsoft、Llama は Meta が開発しています。',
  },
  {
    id: 3,
    category: 'tool',
    text: 'Google が提供する生成 AI サービスの名称はどれですか？',
    options: ['ChatGPT', 'Claude', 'Gemini', 'Grok'],
    answerIndex: 2,
    explanation:
      'Gemini は Google が開発・提供する生成 AI サービスです。旧称は Bard で、2024年に Gemini に改称されました。Grok は X（旧Twitter）が開発した AI です。',
  },

  // 基礎用語（3問）
  {
    id: 4,
    category: 'term',
    text: 'LLM の正式名称として正しいものはどれですか？',
    options: [
      'Large Logic Model',
      'Large Language Model',
      'Linear Learning Machine',
      'Layered Language Module',
    ],
    answerIndex: 1,
    explanation:
      'LLM は Large Language Model（大規模言語モデル）の略です。大量のテキストデータを学習し、文章の生成・要約・翻訳などを行う AI モデルの総称です。',
  },
  {
    id: 5,
    category: 'term',
    text: 'AI が事実と異なる情報を自信満々に生成してしまう現象を何と呼びますか？',
    options: ['オーバーフィット', 'バイアス', 'ハルシネーション', 'トークン切れ'],
    answerIndex: 2,
    explanation:
      'ハルシネーション（幻覚）とは、AI が存在しない情報や誤った情報をもっともらしく生成してしまう現象です。AI の出力は必ず人間が確認・検証することが重要です。',
  },
  {
    id: 6,
    category: 'term',
    text: 'AI に対して与える指示文・入力文のことを何と呼びますか？',
    options: ['スクリプト', 'プロンプト', 'クエリ', 'コマンド'],
    answerIndex: 1,
    explanation:
      'プロンプトとは AI に与える指示文・質問文のことです。プロンプトの書き方によって AI の回答の質が大きく変わるため、「プロンプトエンジニアリング」という分野も生まれています。',
  },

  // 使い方・コツ（2問）
  {
    id: 7,
    category: 'usage',
    text: 'AI から質の高い回答を得るためのプロンプトの書き方として、最も効果的なものはどれですか？',
    options: [
      '短く簡潔に一言で伝える',
      '役割・背景・出力形式を具体的に指定する',
      '敬語を使って丁寧にお願いする',
      '同じ質問を何度も繰り返す',
    ],
    answerIndex: 1,
    explanation:
      '「あなたは〇〇の専門家です」のように役割を与え、背景情報を共有し、「箇条書きで3点」のように出力形式を指定すると、AI は大幅に精度の高い回答を返します。',
  },
  {
    id: 8,
    category: 'usage',
    text: 'AI を業務に活用する際、出力結果の扱い方として正しいのはどれですか？',
    options: [
      'AI の回答は正確なので、そのまま使用してよい',
      '有料プランであれば内容を確認しなくてよい',
      '必ず人間が内容を確認・検証してから使用する',
      '英語で質問すれば確認は不要になる',
    ],
    answerIndex: 2,
    explanation:
      'AI はハルシネーションにより誤情報を生成することがあります。有料・無料・言語に関わらず、AI の出力は必ず人間が確認・検証してから使用することが鉄則です。',
  },

  // リスク・倫理（2問）
  {
    id: 9,
    category: 'risk',
    text: '業務で AI チャットを使用する際、個人情報や機密情報の取り扱いとして適切なのはどれですか？',
    options: [
      '有名サービスなので安心して入力してよい',
      '社内ルールを確認し、機密情報は入力しない',
      '匿名化すれば問題なく入力できる',
      '社外秘でなければ自由に入力してよい',
    ],
    answerIndex: 1,
    explanation:
      'AI サービスへの入力データは学習データとして利用される場合があります。個人情報・機密情報・社外秘情報の入力は原則避け、必ず社内のAI利用ガイドラインに従いましょう。',
  },
  {
    id: 10,
    category: 'risk',
    text: 'AI が生成した文章や画像の著作権について、現在の日本の考え方として最も近いものはどれですか？',
    options: [
      'AI が生成したものはすべて著作権フリーで自由に使える',
      'AI を使った時点でユーザーに著作権が発生する',
      '人間の創作的関与がある部分に著作権が認められる可能性がある',
      'AI 開発会社がすべての著作権を保有する',
    ],
    answerIndex: 2,
    explanation:
      '日本の著作権法では、著作物は「人間の思想・感情を創作的に表現したもの」とされています。AI 生成物そのものには著作権は発生しないとされていますが、人間が創作的に関与した部分については保護される可能性があります。この分野は法整備が進んでいます。',
  },
]
