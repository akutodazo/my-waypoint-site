# my-waypoint-site — ドローン用ウェイポイント飛行ルート生成

農業従事者が専門知識なしでグリッド飛行ルートを作成できるWebツール。
地図上で圃場の範囲を指定すると、DJI Fly用のウェイポイント飛行ファイル
（KMZ）を生成・ダウンロードできる。

## 使い方
1. 地図上で圃場のポリゴンを描く
2. 高度・速度・オーバーラップ率を入力
3. ルート生成→KMZダウンロード
4. KMZをDJI Flyのウェイポイントファイルに上書きして自動飛行

## 動作確認済み環境
- ドローン: （mini4pro,litox1_1.00.0300）0704
- DJI Fly: （1.21.2）0704
- ※ 本ツールはDJI非公式の手法を利用。アプリ更新で動作しなくなる可能性あり

## 技術構成
- Leaflet 1.9.4 + Leaflet.draw（地図・ポリゴン描画）
- Turf.js 7（グリッド経路の地理計算）
- JSZip 3.10（KMZ = ZIP + WPMLの生成）

## 今後の計画
Next.js + TypeScript への移行を予定（route-generator / kmz-builder /
field-repository の3層構成、Jest によるTDD、CI導入）。