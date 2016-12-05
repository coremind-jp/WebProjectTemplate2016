#WEB制作テンプレート

##概要
- html
  - ECTテンプレートエンジンを利用したhtml生成
- css
  - 共通スタイルと個別ページスタイルを分離してsass(scss)から生成
  - 共通スタイルをスタイルガイド(frontnote)として管理
- js
  - 共通モジュールと個別ページモジュールを分離してtypescriptから生成
  - typeDocによるドキュメント生成
  - mocha, karmaによるユニットテストの実行
- image
  - 最適化

##使用方法

```

git clone https://github.com/otn83/WebProjectTemplate.git

npm install

```

##gulpタスクコマンド　
####(いずれのコマンドも-Wオプションを追加すると対象ディレクトを監視して自動ビルドする)

```

//画像の最適化
gulp image [-W]

//ect to html
gulp ect [-W]

//scss to css
gulp sass [-W]

//scss(common) to common.css & generate style gulde
gulp sass-common [-W]

//ts|tsx to js
gulp ts [-W]

//テストを実行
gulp ts-test [-W]

//全タスク(image, ect, sass, sass-common, ts, ts-test)を一度に開始. -Bオプションを追加するとブラウザ同期も併用する
gulp [-W] [-B]

//全タスク(image, ect, sass, sass-common, ts, ts-test)をリリース向けに最適化して出力
gulp release

```

##ディレクトリ構成

```

root      各設定ファイル（npm, gulp, typings, karma, webpack, ect）は全てルートに配置)
┗workspace
  ┣ src
  ┃ ┣ asset         主に画像等のリソース
  ┃ ┃
  ┃ ┣ ect           **ect**
  ┃ ┃ ┗ _lib          汎用テンプレート
  ┃ ┃   ┣ block         ブロック単位(html, head, body, header, footer)
  ┃ ┃   ┣ layout        レイアウト
  ┃ ┃   ┗ parts         UIモジュール
  ┃ ┃
  ┃ ┣ external-lib  **css/javascriptの外部ライブラリ**
  ┃ ┃
  ┃ ┣ sass          **sass(scss)**
  ┃ ┃ ┣ common        共通スタイル
  ┃ ┃ ┗ entry         個別ページスタイル
  ┃ ┃
  ┃ ┣ script        **javascript**
  ┃ ┃ ┣ common        内製モジュール
  ┃ ┃ ┗ entry         個別ページモジュール
  ┃ ┃
  ┃ ┗ script-test   **unit test**
  ┃   ┣ common        内製モジュール
  ┃   ┗ entry         個別ページモジュール
  ┃
  ┗www              **output(dest|dist)** ※ectの出力はこのディレクトリの直下となる
    ┣ asset         src asset
    ┣ css           src sass(scss)
    ┣ js            src javascript, typescript
    ┣ _guide        スタイルガイド
    ┗ _typedoc      javascriptドキュメント

```

