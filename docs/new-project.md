# 新プロジェクト立ち上げ手順書

本書と ARCHITECTURE.md を開発者（人間・AI）に渡すと、このリポジトリと
同品質の新規プロジェクトが立ち上がる。これがテンプレートの完成形である。

## AIへの発注文（コピーして使う）

> ARCHITECTURE.md と docs/new-project.md を読み、その規約と手順に従って
> 「（作りたいものを1〜3行で）」のプロジェクトを立ち上げてください。
> 進め方: 小さなfeatureブランチ+PR単位で進め、各PRでCI（lint / format:check /
> test / build）が緑であること。ドメインの中核ロジック1つはTDD
> （REDコミット→GREENコミット）で実装すること。
> 完了条件: 本書末尾のチェックリスト全項目。

## 手順

### 1. スキャフォールド

- `npx create-next-app@latest <名前> --typescript --eslint --tailwind --src-dir --app --import-alias "@/*" --use-npm`
- Gitリポジトリ作成、mainをGitHubへpush。以降mainは常に動く状態を保つ

### 2. 品質レール（機能を書く前に敷く）

- Prettier: `npm i -D prettier eslint-config-prettier`
  - `.prettierrc`: `{ "singleQuote": true, "semi": true, "trailingComma": "all" }`
  - `.prettierignore`（ビルド成果物・ロックファイル等）
  - eslint設定に `prettierConfig` を追加（配列ではないのでスプレッドしない）
- Jest: `npm i -D jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/dom`
  - `jest.config.mjs`: next/jest利用、`testMatch: ['**/__tests__/**/*.test.ts']`
- scripts: `format` / `format:check` / `test` / `test:watch` /
  `check`（lint && format:check && test && buildを連結）
- CI: `.github/workflows/ci.yml` — PRとmain pushで install→lint→format:check→test→build
- デプロイ: 先を決めてworkflow化（GitHub Pagesなら output:'export'、公開パスは
  `src/config.ts` に集約し `next.config.ts` と `manifest.ts` からimport）
- 開発環境: エディタの保存時整形（Format On Save + Prettier）を有効化

### 3. 骨格フォルダ（ARCHITECTURE.mdの層構造どおり）

### 4. 文書一式

- `ARCHITECTURE.md` をコピーして同梱（本テンプレートの規約）
- `CLAUDE.md`: プロジェクト概要 / 開発コマンド / 固有ルール / ドメイン知識 /
  進捗ログ / 学んだ教訓 の6セクションで作成。冒頭でARCHITECTURE.mdを参照
- `docs/decisions.md`: 空の記録簿を作成（判断のたびに背景・決定・理由を追記）
- `README.md`: 目的 / できること / 使い方 / 技術構成（mermaid図）/
  設計判断のWhy表 / 開発方法
- `.github/pull_request_template.md`: 概要 / 変更内容 / 確認方法 / チェックリスト

### 5. 最初の機能はTDDで

ドメインの中核ロジック（入力→出力が明確なもの）を1つ選び、
テストを先に書き（REDコミット）、実装してGREENコミット。
可能なら本物のデータ（実機・実サービスの出力）を正解データにする。

## 完了チェックリスト

- [ ] フォルダ構成がARCHITECTURE.mdの層構造と一致している
- [ ] `npm run check` が緑（lint / format:check / test / build）
- [ ] PRでCIが動き、mainへのマージで自動デプロイされる
- [ ] RED/GREENのコミットペアが履歴にある
- [ ] 5文書（README / ARCHITECTURE / CLAUDE / decisions / PRテンプレ）が揃っている
- [ ] 環境依存値がconfig1ファイルに集約されている

## 検収（テンプレート自体の合否判定）

新しいAIセッションに ARCHITECTURE.md と本書**だけ**を渡し、小さな題材
（例: 買い物リストPWA）で発注文を実行させる。上のチェックリストが全項目
満たされればテンプレート合格。満たされない項目は本書か ARCHITECTURE.md の
記述不足なので、加筆して再試験する。
