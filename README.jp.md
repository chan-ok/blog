# 韓国語ブログプロジェクト

[한국어](./README.ko.md) | [English](./README.md) | **日本語**

React 19 + TypeScript + Supabaseを活用したモダンなブログアプリケーションです。

## ✨ 主な特徴

- **Feature Slice Design (FSD)** アーキテクチャ適用
- **英語優先開発** - すべてのコード識別子は英語で記述
- **Markdownサポート** - ブログ記事作成とシンタックスハイライト機能
- **リアルタイムデータベース** - Supabaseによる認証とデータ管理
- **レスポンシブデザイン** - Tailwind CSS v4 + shadcn/ui

## 🚀 始め方

### 環境設定

```bash
pnpm install
pnpm start
```

### プロダクションビルド

```bash
pnpm build
```

## 🛠️ 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルド**: Vite
- **ルーティング**: TanStack Router（ファイルベース）
- **状態管理**: TanStack Query
- **バックエンド**: Supabase（認証、データベース、ストレージ）
- **スタイリング**: Tailwind CSS v4 + shadcn/ui
- **テスト**: Vitest + Testing Library
- **リンティング**: Biome

## 📁 プロジェクト構造

```
src/
├── app/              # アプリケーションレイヤー
├── pages/            # ページレイヤー
├── features/         # 機能レイヤー
├── entities/         # エンティティレイヤー
├── shared/           # 共有レイヤー
└── routes/           # TanStack Routerファイル
```

## 🧪 テストと検証

```bash
pnpm test              # Vitestテスト実行
pnpm lint              # Biomeリンティング
pnpm format            # コードフォーマット
pnpm check             # 型チェック
```

## 📚 開発ガイド

このプロジェクトは**英語優先開発**を原則としています。詳細な開発ガイドについては、以下のドキュメントを参照してください：

### 主要ドキュメント

- **[CLAUDE.md](./CLAUDE.md)** - プロジェクト全体ガイド
- **[アーキテクチャガイド](./docs/japanese/architecture.md)** - FSDアーキテクチャ詳細説明
- **[開発プロセス](./docs/japanese/develop-process.md)** - TDD開発ワークフロー
- **[コードフォーマット](./docs/japanese/code-format.md)** - 英語命名規則
- **[データフロー](./docs/japanese/data-flow.md)** - Supabase連携ガイド

### レイヤー別ガイド

- **[エンティティレイヤー](./src/entities/CLAUDE.md)** - ドメインモデル定義
- **[機能レイヤー](./src/features/CLAUDE.md)** - UIとビジネスロジック

## 🎯 開発原則

1. **英語コード**: すべての変数名、関数名、コメントは英語で記述
2. **TDD**: テスト駆動開発（Red → Green → Refactor）
3. **FSDアーキテクチャ**: レイヤー別役割分離と依存関係ルールの遵守
4. **型安全性**: TypeScriptを活用した厳格な型チェック

このプロジェクトはTanStack Routerを使用してファイルベースルーティングを実装しています。`src/routes`フォルダにファイルを追加すると自動的にルートが生成されます。

## 🌐 主要ページ

- **ホーム**: 最新ブログ記事一覧
- **記事詳細**: Markdownレンダリングとコメントシステム
- **記事作成/編集**: リアルタイムプレビューエディター
- **管理者**: ユーザーとコンテンツ管理

## 🔧 環境変数

```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 コントリビューション

1. イシューの作成または既存イシューの確認
2. 機能ブランチの作成: `git checkout -b feature/新機能`
3. TDD開発プロセスの遵守
4. テスト作成と通過確認
5. プルリクエストの作成

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。
