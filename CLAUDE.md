@AGENTS.md

# CLAUDE.md

このファイルは、このリポジトリでClaude Code（および開発者自身）が作業する際のガイダンスです。
**汎用の設計規約は [ARCHITECTURE.md](ARCHITECTURE.md) を参照。ここにはこのプロジェクト固有の知識だけを書く。**
## プロジェクト概要

**my-waypoint-site** — 農業従事者が専門知識なしでドローンのグリッド飛行ルートを作成できるWebツール。
地図上で圃場のポリゴンを描くと、DJI Fly用ウェイポイント飛行ファイル（KMZ）を生成・ダウンロードできる。
生成したKMZをDJI Flyのウェイポイントファイルに上書きすることで自動飛行を実現する（DJI非公式手法）。

- 背景: アオタケプロジェクト「圃場を、空から見える化する」の中核ツール
- 参考アーキテクチャ: https://github.com/furarico/vibe-cooking （層分離・TDD・CIの思想を踏襲）

## 開発コマンド

- `npm run dev` — 開発サーバー起動（http://localhost:3000）
- `npm test` — Jestでユニットテスト実行
- `npm run test:watch` — ファイル変更を監視してテスト自動実行
- `npm run lint` — ESLint実行
- `npm run build` — 本番ビルド
- `npm run format` — Prettierで全ファイル整形
- `npm run format:check` — 整形チェック（CIと同じ）


## アーキテクチャ（3層構造）

```
UI層 (src/app/, src/components/)        … 画面描画のみ。ロジックを書かない
    ↓
Service層 (src/services/)               … ビジネスロジック。純粋なTS関数
    ↓
Repository層 (src/repositories/)        … データ保存の抽象化（interface + 実装）
```

| パス                                  | 内容                                                                  |
| ------------------------------------- | --------------------------------------------------------------------- |
| `src/types/domain.ts`                 | 全体で使う型定義（CameraSpec, FlightParams, Waypoint, PolygonCoords） |
| `src/services/route-generator.ts`     | 圃場ポリゴン→グリッド飛行経路の計算（Turf.js使用）                    |
| `src/services/kmz-builder.ts`         | ウェイポイント列→DJI Fly用KMZ生成（JSZip使用）                        |
| `src/services/__tests__/`             | Service層のユニットテスト                                             |
| `legacy/`                             | 移植元の旧静的サイト（HTML+JS）。参照用に保持、変更禁止               |
| `legacy/samples/dji-fly-original.kmz` | DJI Flyが出力した本物のKMZひな型。テストの正解データ                  |
| `public/template.kmz`                 | 実行時にfetchするKMZひな型（dji-fly-original.kmzのコピー）            |

## ルール

## プロジェクト固有ルール

- 座標の並びは**[経度, 緯度]**（Turf/GeoJSON標準）。Leafletは[緯度, 経度]なので変換箇所に注意
- Next.js固有のAPIを書く前に `node_modules/next/dist/docs/` の該当ガイドを確認すること（AGENTS.md参照）
- Service層の例外: kmz-builderのみDOMParserを使用（WPML書き換えのため）
- `legacy/` は参照用に保持、変更禁止
### ドメイン知識（重要な定数・制約）

- 対象機体: DJI Air 3S（広角、FOV 84°）/ DJI Lito X1（FOV 82.1°）。どちらも35mm判換算24mm・4:3
- カメラ既定値（`DEFAULT_CAMERA`）: **換算値で統一** 幅34.6×高さ26.0mm・焦点24mm（対角43.3=フルサイズ対角）。※2026-07-07にMavic 3系の実焦点仕様（17.3×13/24）から修正。換算焦点距離と物理センサー寸法を混ぜると画角が約半分に計算される
- **ウェイポイント上限: 200点/ミッション**（Air 3S・Lito X1とも）。超過時はUIが警告。目安: 詳細10mで約1,900㎡、圃場全体20mで約7,500㎡まで
- 撮影プリセット（検証済みパラメータ）: 高度20m/-90°、10m/-90°、10m/-60°
- KMZ内部構造: `wpmz/template.kml` + `wpmz/waylines.wpml`（WPML 1.0.2、Placemarkの複製で経路を書き換える）
- 撮影アクション: ひな型の`startRecord`（動画）を`takePhoto`（静止画）に置換して各点撮影。`buildKmz`のオプションで、フックは常に`takePhoto: true`を渡す
- DJI Fly上書きは非公式手法。動作確認済みバージョンをREADMEと/guideに記録すること
- 大圃場対応（ミッション分割、距離間隔撮影トリガー`multipleDistance`の実機検証）はPhase 4以降の課題

## 開発の歩み（進捗ログ）

### Phase 0: 土台整備 ✅ 完了（2026-07-04）

| Step | 内容                                                      |
| ---- | --------------------------------------------------------- |
| 1    | 作業前の安全確認（git status / log）                      |
| 2    | 未使用の複製 `js/js/` を削除                              |
| 3    | 存在しないstyle.cssの404を解消                            |
| 4    | サンプルKMZを `samples/dji-fly-original.kmz` として保全   |
| 5    | READMEを全面改訂（目的・使い方・対応環境）                |
| 6    | .gitignore作成（※誤ってフォルダとして作成→Phase 1で修正） |
| 7    | push・GitHub Pagesで動作確認                              |

### Phase 1: Next.js + TypeScript移植 ✅ 完了（2026-07-05、ブランチ: feature/next-migration）

| Step | 内容                                                                                                           | 状態 |
| ---- | -------------------------------------------------------------------------------------------------------------- | ---- |
| 1-0  | push・Node.js導入（v24.18.0）・作業ブランチ作成                                                                | ✅   |
| 1-1  | 旧サイトを `legacy/` に退避                                                                                    | ✅   |
| 1-2  | Next.js 15 + TS + Tailwindスキャフォールド（.gitignoreフォルダ問題・legacy競合問題を解決）                     | ✅   |
| 1-3  | Leaflet/Turf/JSZip導入 + Jest設定（jest.config.mjs）                                                           | ✅   |
| 1-4  | **TDD第1弾**: 型定義（domain.ts）+ route-generator移植。7テストGREEN                                           | ✅   |
| 1-5  | **TDD第2弾**: kmz-builder移植（DI設計・Uint8Array返却）+ template.kmz 404問題の解決。12テストGREEN             | ✅   |
| 1-6  | field-repository（interface + localStorage実装、非同期契約）。19テストGREEN                                    | ✅   |
| 1-7  | react-leafletでUI再構築（save-file / use-waypoint-planner / draw-control / field-map / page）。手動確認7項目OK | ✅   |

### Phase 2: 品質レール＋公開 ✅ 完了（2026-07-06）

| Step | 内容                                                                        | 状態 |
| ---- | --------------------------------------------------------------------------- | ---- |
| 2-1  | CIワークフロー（PR/push時にlint→test→build）                                | ✅   |
| 2-2  | PRテンプレート                                                              | ✅   |
| 2-3  | 静的書き出し設定（output: export、basePath、fetch相対化、Blob型エラー修正） | ✅   |
| 2-4  | デプロイワークフロー + Pages SourceをGitHub Actionsに変更                   | ✅   |
| 2-5  | **PR #1作成→CI緑→mainマージ→自動デプロイ成功**                              | ✅   |

公開URL: https://akutodazo.github.io/my-waypoint-site/ （mainへのマージで自動デプロイ）

### Phase 3: プロダクト機能 🔄 進行中（7〜9月、空撮20回と並行ドッグフーディング）

| Step | 内容                                                                                             | 状態 |
| ---- | ------------------------------------------------------------------------------------------------ | ---- |
| 3-1  | 撮影プリセット（検証済みパラメータ3種をワンタップ選択）                                          | ✅   |
| 3-2  | ジンバル角のKMZ書き込み（kmz-builder拡張、TDD）                                                  | ✅   |
| 3-3  | 圃場の保存・呼び出しUI（field-repositoryを画面に接続）                                           | ✅   |
| 3-4  | モバイルUI調整（タッチ操作・ボタンサイズ）                                                       | ✅   |
| 3-5  | PWA化（manifest.ts・sw.js・アイコン生成）。実機でホーム画面追加・機内モード動作確認済            | ✅   |
| 3-6  | DJI Fly転送手順ガイドページ（/guide）※動作確認済み環境の記入は3-7で                              | ✅   |
| 3-8a | カメラ定数を実機（Air 3S/Lito X1、換算24mm 4:3）に修正。仕様変更としてテスト期待値も更新         | ✅   |
| 3-8b | 各点で静止画撮影（startRecord→takePhoto置換・actionGroup番号修正）＋200点超過警告。32テストGREEN | ✅   |
| 3-9a | ルート・圃場選択のクリア機能（clearRoute / clearPolygon）                                        | ✅   |
| 3-9b | 日光下視認性ファーストのUI改修（白背景固定・大型ボタン・琥珀色ルート・点数表示）                 | ✅   |
| 3-7  | 実地ドッグフーディング（ジンバル角・各点撮影・点数上限の実機確認、/guideとREADMEに環境記入）     | ⬜   |

### Phase 3.5: テンプレート化 🔄 進行中（空撮の合間に実施）

| Step | 内容                                                             | 状態 |
| ---- | ---------------------------------------------------------------- | ---- |
| S4   | Prettier導入（設定・スクリプト・CI検問）                         | ✅   |
| S1   | page.tsxを4部品に分割（62行の組立係に）                          | ✅   |
| S2   | use-fieldsフック切り出し（Presenter分割・Repository参照の一元化）| ✅   |
| S3   | renderHookテスト6本追加（計38本・全層に検査網）                  | ✅   |
| S6   | 汎用規約をARCHITECTURE.mdへ分離（テンプレート本体）              | ✅   |
| S5   | 設定の一元化（basePath等）                                       | ⬜   |
| S7   | README刷新（構成図・設計判断の理由）                             | ⬜   |
| S8   | docs/decisions.md（設計判断の記録）                              | ⬜   |
| S9   | docs/new-project.md（立ち上げ手順書＝完成の定義）                | ⬜   |

### 今後の予定

- Phase 4: 共有基盤（OpenAPI + Prisma、オルソ画像の地図重畳表示）※2026年10月〜

### 学んだ教訓

- `.gitignore`や`jest.config.mjs`は**ファイル**。`mkdir`で作るとフォルダになる
- `create-next-app`は空でないフォルダを拒否する（`legacy/`も競合対象だった）
- Windowsでは`npm`（npm.ps1）がPowerShell実行ポリシーの影響を受ける → `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`で解決
- PATHの変更は開き直したターミナルにしか反映されない
- 旧サイトのKMZダウンロードは`template.kmz`不在で404だった（Step 1-5で根本解決）
- 実際に入ったNext.jsは**16.2.10**（想定は15）。AGENTS.mdの警告どおり`node_modules/next/dist/docs/`の確認が必須（例: `ssr: false`はClient Component内のみ可）
- leaflet-draw 1.0.4のrectangleは`showArea: false`必須（既知バグ回避）
- ESLintの警告はまずファイル名を確認する（今回の7警告は全て`legacy/`由来→除外設定で解決、新コードは無警告だった）
- JSXは`>{children}`のように行末に要素が隠れていることがある。行を足す前に右端まで読む（layout.tsxのchildren二重描画の教訓）
- カメラ仕様は「35mm判換算」と「物理センサー寸法＋実焦点距離」を混ぜない。換算なら換算で統一する
- 「'xxx' is assigned a value but never used」警告は、フックで作った値をreturnし忘れているサインのことがある
- 屋外向けUIは白背景固定（ダークモード無効化）が最強。階層は色よりサイズと太さで作る
- **コミット前に`git branch --show-current`**（VS Codeなら左下のブランチ名を確認）。mainへの誤コミットが2回発生。復旧は「ブランチでmerge main→push→mainをreset --hard origin/main」
- HTMLの規格でbuttonの中にbuttonは入れられない（hydrationエラーになる）。エラーは1行目とCode Frameの2か所を読む
