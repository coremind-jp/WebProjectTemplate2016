var isWatch = process.argv.slice(2).indexOf("--watch") > -1;

//----------------------------------------------------------utility package list
var del       = require("del");           //file, directory delete
var gulp      = require("gulp");          //task runner
var plumber   = require("gulp-plumber");  //Prevent pipe breaking caused by errors from gulp plugins
var notify    = require("gulp-notify");   //notification (dosnt work for win10)
var uglify    = require("gulp-uglify");
var concat    = require("gulp-concat");
var _if       = require("gulp-if");
var sourceMap = require("gulp-sourcemaps");
var sequence  = require("run-sequence");
var source    = require('vinyl-source-stream');

//----------------------------------------------------------------path parameter
var root     = "./workspace";
var rootSrc  = root+"/src";
var rootDest = root+"/www";
var dir = {
    src:  {
        lib      : rootSrc+"/external-lib",
        asset    : rootSrc+"/asset",
        ect      : rootSrc+"/ect",
        script   : rootSrc+"/script/entry",
        sass     : rootSrc+"/sass",
    },
    dest: {
        guide  : rootDest+"/_guide",
        typeDoc: rootDest+"/_typedoc",

        html   : rootDest,
        css    : rootDest+"/css",
        script : rootDest+"/js",
        asset  : rootDest+"/asset",
    }
};

//-------------------------------------------------------------package parameter
var params = {
    plumber: {
        errorHandler: notify.onError("Error: <%= error.message %>")
    },
    image: {
        pngquant: true,
        optipng: false,
        zopflipng: true,
        jpegRecompress: false,
        jpegoptim: true,
        mozjpeg: true,
        gifsicle: true,
        svgo: true,
        concurrent: 10
    },
    ect: {
        options: { root: dir.src.ect, ext: ".ect" },
        data: require("./ectconfig.js")
    },
    typeDoc: {
            module: "commonjs",
            target: "es5",
            out: dir.dest.typeDoc,
            name: "TypeDoc for Common",
            hideGenerator: true
    },
    uglify: {
        preserveComments: "some"
    },
    sass: {
        outputStyle: "compressed",
        errLogToConsole: false,
        onError: function(e) { notify().writer(e); }
    },
    prefixer: {
        browser: [ 'last 2 versions', 'ie 9' ]
    },
    frontnote: {
        clean: true,
        verbose: true,
        out: dir.dest.guide,
        css: "../css/common.css"
    },
    browserSync: {
        server: {
            baseDir: rootDest,
        },
        open: false,
        startPath: "/_guide"
    }
};

//------------------------------------------------------------------------helper
function glob(extension, rootDirectory, advance, ignoreDirList)
{
    var rule = [
            rootDirectory+"/**/*"       +extension,
        "!"+rootDirectory+"/**/_*"      +extension,//ignore '_' prefix files
        "!"+rootDirectory+"/_**/**/*"   +extension //ignore '_' prefix directorys
    ];

    if (ignoreDirList && ignoreDirList.length > 0)
        for (var i = 0, len = ignoreDirList.length; i < len; i++)
            rule.push("!"+rootDirectory+"/"+ignoreDirList[i]+"/**/*"+extension);

    return advance ? advance(rule): rule;
};

function bindWatch(taskName, globPattern, buildTask)
{
    gulp.task(taskName, buildTask);
    if (isWatch) gulp.watch(globPattern, [taskName]);
};

//-------------------------------------------------------------------------image
/*
画像最適化
*/
var image = require("gulp-image");
var imageGlob = glob("{jpg,jpeg,png,gif,svg}", dir.src.asset);
bindWatch("image", imageGlob, function()
{
    return gulp.src(imageGlob).pipe(gulp.dest(dir.dest.asset));
});



//---------------------------------------------------------------------ECT(html)
/*
テンプレートからhtmlを生成
*/
var ect = require("gulp-ect-simple");
var ectGlob = glob(".ect", dir.src.ect);
bindWatch("ect", ectGlob, function()
{
    return gulp.src(ectGlob)
        .pipe(plumber(params.plumber))
        .pipe(ect(params.ect))
        .pipe(gulp.dest(dir.dest.html));
});



//----------------------------------------------------------------typescript(js)
/*
typescriptコンパイル
*/
var webpack = require("webpack-stream");
gulp.task("ts", function()
{
    return gulp.src([])
        .pipe(
            webpack(require("./webpack.config.js").develop({
                watch: true,
                cache: true
            })),
            webpack)
        .on("error", function(error) {
            notify().write(error.message);
        })
        .pipe(gulp.dest(dir.dest.script));
});

/*
ユニットテスト
 */
var karmaServer = require("karma").Server;
gulp.task("ts-test", function(done)
{
    new karmaServer({
        configFile: __dirname + "/karma.conf.js"
    }, done).start();
});

/*
typescriptドキュメント生成
*/
var typeDoc = require("gulp-typedoc");
gulp.task("ts-doc", function()
{
    return gulp.src(rootSrc+"/script/common/**/*.{ts,tsx}")
        .pipe(typeDoc(params.typeDoc));
});

/*
型定義生成
*/
var typescript = require("typescript");
gulp.task("d.ts", function()
{
    return gulp.src(dir.src.script+"/common/**/*.{ts,tsx}")
        .pipe(typeDoc(params.typeDoc));
});

/*
外部ライブラリ結合
*/
var libBandleGlob = glob(".js", dir.src.lib);
bindWatch("lib-bundle", libBandleGlob, function()
{
    return gulp.src(libBandleGlob)
        .pipe(plumber(params.plumber))
        .pipe(sourceMap.init())
            .pipe(concat("lib.js"))
        .pipe(sourceMap.write("./"))
        .pipe(gulp.dest(dir.dest.script));
});



//---------------------------------------------------------------------sass(css)
/*
共有ライブラリ(sass/lib)からスタイルシート生成・スタイルガイド更新
*/
var sass = require("gulp-sass");
var prefixer = require("gulp-autoprefixer");
var frontnote = require("gulp-frontnote");
var sassCommonGlob = [dir.src.sass+"/common/*.scss"];
bindWatch("sass-common", sassCommonGlob, function()
{
    return gulp.src(sassCommonGlob)
        .pipe(plumber(params.plumber))
        .pipe(frontnote(params.frontnote))
        .pipe(sourceMap.init())
            .pipe(concat("common.css"))
            .pipe(sass(params.sass))
            .pipe(prefixer(params.prefixer))
        .pipe(sourceMap.write("./"))
        .pipe(gulp.dest(dir.dest.css));
});

/*
個別ページ向けコンパイル
*/
var sassGlob = glob(".scss", dir.src.sass, null, ["common"]);
bindWatch("sass", sassGlob, function()
{
    return gulp.src(sassGlob)
        .pipe(plumber(params.plumber))
        .pipe(sass(params.sass))
        .pipe(prefixer(params.prefixer))
        .pipe(gulp.dest(dir.dest.css));
});



//------------------------------------------------------------------------server
if (isWatch)
{
    var browser = require("browser-sync");
    browser.init(params.browserSync);
    gulp.watch(dir.dest.html+"/**/*.*").on("change", browser.reload);
}



//-------------------------------------------------------------task registration
gulp.task("clean", function() {
    del([rootDest+"/**/*.*", "!"+rootDest+"/asset/**/*.*"]);
});

gulp.task("release", ["clean"], function() {
    //image
    gulp.src(imageGlob)
        .pipe(plumber(params.plumber))
        .pipe(image(params.image))
        .pipe(gulp.dest(dir.dest.asset));

    //ect
    gulp.src(ectGlob)
        .pipe(plumber(params.plumber))
        .pipe(ect(params.ect))
        .pipe(gulp.dest(dir.dest.html));

    //sass common
    gulp.src(sassCommonGlob)
        .pipe(plumber(params.plumber))
        .pipe(concat("common.css"))
        .pipe(sass(params.sass))
        .pipe(prefixer(params.prefixer))
        .pipe(gulp.dest(dir.dest.css));

    //sass indivisual
    gulp.src(sassGlob)
        .pipe(plumber(params.plumber))
        .pipe(sass(params.sass))
        .pipe(prefixer(params.prefixer))
        .pipe(gulp.dest(dir.dest.css));

    //external js lib
    gulp.src(libBandleGlob)
        .pipe(plumber(params.plumber))
        .pipe(concat("lib.js"))
        .pipe(uglify(params.uglify))
        .pipe(gulp.dest(dir.dest.script));

    //typescript
    gulp.src([])
        .pipe(webpack(require("./webpack.config.js").release), webpack)
        .pipe(gulp.dest(dir.dest.script));
});

gulp.task("default", ["ts", "ts-test"]);