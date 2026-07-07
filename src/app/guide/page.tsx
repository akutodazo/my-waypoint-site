import Link from 'next/link';

export const metadata = {
  title: '転送手順 | ウェイポイントルート作成',
};

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-2xl p-4 pb-12">
      <Link href="/" className="text-sm text-blue-700 underline">
        ← 地図に戻る
      </Link>

      <h1 className="mt-4 text-xl font-bold">
        作ったルートをドローンで飛ばすまで
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        ダウンロードしたKMZファイルをDJI Flyアプリに取り込む手順です。
        初回は10分ほどかかりますが、2回目からは2〜3分でできます。
      </p>

      <section className="mt-6">
        <h2 className="text-base font-bold">準備するもの</h2>
        <ul className="mt-2 list-disc pl-5 text-sm leading-6">
          <li>DJI Flyが入ったスマホ／タブレット（機体と接続済みのもの）</li>
          <li>このサイトでダウンロードした route.kmz</li>
          <li>ファイル操作アプリ（Androidの「Files」など）</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold">手順</h2>
        <ol className="mt-2 list-decimal space-y-3 pl-5 text-sm leading-6">
          <li>
            <b>DJI Flyでウェイポイント飛行を1つ作る</b><br />
            機体に接続し、ウェイポイント飛行モードで適当な地点を2〜3個
            置いて保存します。これが「上書きされる側の器」になります。
          </li>
          <li>
            <b>保存されたKMZファイルを探す</b><br />
            ファイルアプリで DJI Fly のウェイポイント保存フォルダを開きます。
            英数字の長い名前（例: 0313D9C0-....kmz）のファイルが
            手順1で作った器です。
          </li>
          <li>
            <b>route.kmz で上書きする</b><br />
            ダウンロードした route.kmz の名前を器と同じ名前に変更してから、
            器のファイルに置き換えます（元の器は消してよい）。
          </li>
          <li>
            <b>DJI Flyを完全に終了して開き直す</b><br />
            ウェイポイント飛行の一覧に、このサイトで作ったルートが
            表示されていれば成功です。
          </li>
          <li>
            <b>飛行前の確認</b><br />
            離陸前に「経路が圃場の上にあるか」「高度・速度が意図通りか」
            「ジンバル角が動くか」を必ず画面と実機で確認してください。
          </li>
        </ol>
      </section>

      <section className="mt-6 rounded border border-amber-400 bg-amber-50 p-3">
        <h2 className="text-base font-bold text-amber-900">重要な注意</h2>
        <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-amber-900">
          <li>
            この方法はDJI非公式の手法です。DJI Flyのアップデートで
            使えなくなる可能性があります。
          </li>
          <li>
            飛行は航空法の範囲内（日中・目視内・高度150m未満・
            第三者の上空を飛ばない）で行ってください。
          </li>
          <li>
            初めてのルートは必ず人のいない場所で試験飛行してください。
          </li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold">動作確認済みの環境</h2>
        <ul className="mt-2 list-disc pl-5 text-sm leading-6">
          <li>機体: （機種名・ファームウェアverを記入）</li>
          <li>DJI Fly: （アプリverを記入）</li>
          <li>確認日: （日付を記入）</li>
        </ul>
      </section>
    </main>
  );
}