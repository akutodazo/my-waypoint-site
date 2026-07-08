# ARCHITECTURE.md — 汎用アーキテクチャ規約

この文書はプロジェクト非依存の設計規約集である。新しいWebアプリを始めるとき、
この文書を開発者（人間・AI）に渡し「この規約に従って構成せよ」と指示して使う。
プロジェクト固有の知識（ドメイン定数・進捗・教訓）はここに書かず、各リポジトリの
CLAUDE.md に書く。

## 技術スタック標準

- Next.js (App Router) + TypeScript + Tailwind CSS
- テスト: Jest（+ @testing-library/react の renderHook）
- 品質: ESLint + Prettier（eslint-config-prettier で調停）
- CI/CD: GitHub Actions（PR毎の検査 + mainマージで自動デプロイ）

## 層構造（4層 + 型）



### 依存の掟

- 依存は必ず上から下への一方向。下の層は上の層を知らない
- UI部品はデータと操作をpropsで受け取るだけ。フックやRepositoryを直接importしない
- Presenter同士は直接会話しない。必要な値は画面（page）が引数として配線する
- Repositoryの実体を知るのは、それを使うPresenter 1つだけ
- Serviceは純粋関数。ブラウザAPI・Reactに依存させない（例外は理由をコメントで明記）

### Repositoryの掟

- `interfaces/i-*.ts`（契約）と `implementations/*.ts`（実装）を分ける
- 契約は最初から非同期（Promise）で切る。将来のDB移行で呼び出し側を変えないため
- 外部リソース（ファイル・API・ひな型データ）は関数の引数で受け取る（依存性注入）。
  関数の中でfetchしない。テストでは本物のデータを渡せるようにする

## 状態管理の原則

- 表示は状態から描く（状態をnullにすれば消える、を基本形にする）
- 状態は「それを使う部品」の中に置く。複数部品で使うときだけPresenterへ上げる
- Presenterは責務ごとに分割する（「1フック1関心事」。肥大したら切り出す）

## 命名規約

- ファイル名は kebab-case（route-generator.ts）
- interface は i- 接頭辞（i-field-repository.ts）、フックは use- 接頭辞
- `any`型の使用禁止
- コミットは `feat:` `fix:` `test:` `refactor:` `style:` `chore:` `docs:` の接頭辞

## テスト規約

- 新機能はTDD: ①テストを先に書く ②RED（失敗）を確認 ③実装 ④GREEN を確認。
  REDとGREENは別コミットにする
- 後付けテストは「わざと壊して赤を確認→復元」で検査能力を証明する
- 全層にテストを置く（UI層のみ手動確認の割り切りを許容）
- 可能な限り本物のデータ（実機・実サービスの出力）を正解データにする
- `beforeEach`で状態をリセットし、テストを互いに独立させる
- 既存テストの変更は仕様変更時のみ。理由をコミットメッセージに書く

## Git / PR運用

- mainは常に動く状態を保つ。開発は feature/* ブランチ + PRで行う
- PRは小さく（1関心事1PR）。マージ後は即ブランチ削除
- コミット前に `git branch --show-current` で現在地を確認する
- push前にCIと同じ検査（lint / format:check / test / build）をローカルで通す
- ローカルmainは自動では進まない。ブランチ作成・merge前に必ず main で `git pull`

## CI（品質レール）

- PRとmainへのpushで実行: install → lint → format:check → test → build
- 1つでも落ちたらマージしない。CIを通らないコードは存在しないのと同じ扱い

## ドキュメント運用

- CLAUDE.md: プロジェクト固有の知識（概要・コマンド・ドメイン定数・進捗ログ・教訓）
- docs/decisions.md: 設計判断の記録（背景・決定・理由を各3行で）
- README.md: 外部向け。目的・使い方・技術構成・動作確認済み環境