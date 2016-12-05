var isWatch = process.argv.slice(2).indexOf("-W") > -1;
var syncBrowser = process.argv.slice(2).indexOf("-B") > -1;

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
        lib         : rootSrc+"/external-lib",
        asset       : rootSrc+"/asset",
        ect         : rootSrc+"/ect",
        script      : rootSrc+"/script",
        scriptEntry : rootSrc+"/script/entry",
        scriptCommon: rootSrc+"/script/common",
        sass        : rootSrc+"/sass",
        sassCommon  : rootSrc+"/sass/common",
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

var globPattern = {
    image      : glob(".{jpg,jpeg,png,gif,svg}", dir.src.asset),
    ect        : glob(".ect", dir.src.ect),
    libBundle  : glob(".js", dir.src.lib),
    typeDoc    : glob(".{ts,tsx}", dir.src.script),
    sass       : glob(".scss", dir.src.sass, function(patterns) {
        return patterns.concat("!"+dir.src.sassCommon+"/**/*.scss");
    }),
    sassCommon : [dir.src.sass+"/common/*.scss"]
};

//-------------------------------------------------------------package parameter
var params = {
    plumber: {
        errorHandler: notify.onError("<%= error.message %>")
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
            name: "TypeDoc",
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
        browsers: [ 'last 2 versions', 'ie 9' ]
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
function glob(extension, rootDirectory, advance)
{
    var rule = [
            rootDirectory+"/**/*"       +extension,
        "!"+rootDirectory+"/**/_*"      +extension,//ignore '_' prefix files
        "!"+rootDirectory+"/_**/**/*"   +extension //ignore '_' prefix directorys
    ];

    return advance ? advance(rule): rule;
};

function bindWatch(taskName, pattern, buildTask)
{
    if (isWatch)
    {
        gulp.task(taskName, function(done)
        {
            gulp.task("build-"+taskName, buildTask);
            gulp.watch(pattern, ["build-"+taskName]);

            done();
        });
    }
    else gulp.task(taskName, buildTask);
};



//-----------------------------------------------------------------------browser
var browser = require("browser-sync");
gulp.task("activate-browser", function(done)
{
    browser.init(params.browserSync, function()
    {
        browser.watch([
                dir.dest.html   +"/*.html",
                dir.dest.asset  +"/**/*.*",
                dir.dest.css    +"/**/*.css",
                dir.dest.script +"/**/*.js"
        ]).on("change", browser.reload);

        done();
    });
});



//-------------------------------------------------------------------------image
/*
画像最適化
*/
var image = require("gulp-image");
bindWatch("image", globPattern.image, function()
{
    return gulp.src(globPattern.image).pipe(gulp.dest(dir.dest.asset));
});



//---------------------------------------------------------------------ECT(html)
/*
テンプレートからhtmlを生成
*/
var ect = require("gulp-ect-simple");
bindWatch("ect", globPattern.ect, function()
{
    return gulp.src(globPattern.ect)
        .pipe(plumber(params.plumber))
        .pipe(ect(params.ect))
        .pipe(gulp.dest(dir.dest.html));
});



//---------------------------------------------------------------------sass(css)
/*
共有ライブラリ(sass/common)からスタイルシート生成・スタイルガイド更新
*/
var sass = require("gulp-sass");
var prefixer = require("gulp-autoprefixer");
var frontnote = require("gulp-frontnote");
bindWatch("sass-common", globPattern.sassCommon, function()
{
    return gulp.src(globPattern.sassCommon)
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
bindWatch("sass", globPattern.sass, function()
{
    return gulp.src(globPattern.sass)
        .pipe(plumber(params.plumber))
        .pipe(sass(params.sass))
        .pipe(prefixer(params.prefixer))
        .pipe(gulp.dest(dir.dest.css));
});



//----------------------------------------------------------------typescript(js)
/*
typescriptコンパイル
*/
var webpack = require("webpack-stream");
gulp.task("ts", function()
{
    var config = isWatch ?
        require("./webpack.config.js").develop({
                watch: true,
                cache: true
            }):
        require("./webpack.config.js").develop();

    return gulp.src([])
        .pipe(webpack(config), webpack)
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
        configFile: __dirname + "/karma.conf.js",
        autoWatch:  isWatch,
        singleRun: !isWatch
    }, done).start();
});

/*
typescriptドキュメント生成
*/
var typeDoc = require("gulp-typedoc");
gulp.task("ts-doc", function()
{
    return gulp.src(globPattern.typeDoc)
        .pipe(typeDoc(params.typeDoc));
});

/*
型定義生成
*/
var typescript = require("typescript");
gulp.task("d.ts", function()
{
});

/*
外部ライブラリ結合
*/
bindWatch("lib-bundle", globPattern.libBundle, function()
{
    return gulp.src(globPattern.libBundle)
        .pipe(plumber(params.plumber))
        .pipe(sourceMap.init())
            .pipe(concat("lib.js"))
        .pipe(sourceMap.write("./"))
        .pipe(gulp.dest(dir.dest.script));
});



//-------------------------------------------------------------task registration
gulp.task("clean", function() {
    del([rootDest+"/**/*.*", "!"+rootDest+"/asset/**/*.*"]);
});

gulp.task("release", ["clean"], function() {
    //image
    gulp.src(globPattern.image)
        .pipe(plumber(params.plumber))
        .pipe(image(params.image))
        .pipe(gulp.dest(dir.dest.asset));

    //ect
    gulp.src(globPattern.ect)
        .pipe(plumber(params.plumber))
        .pipe(ect(params.ect))
        .pipe(gulp.dest(dir.dest.html));

    //sass common
    gulp.src(globPattern.sassCommon)
        .pipe(plumber(params.plumber))
        .pipe(concat("common.css"))
        .pipe(sass(params.sass))
        .pipe(prefixer(params.prefixer))
        .pipe(gulp.dest(dir.dest.css));

    //sass indivisual
    gulp.src(globPattern.sass)
        .pipe(plumber(params.plumber))
        .pipe(sass(params.sass))
        .pipe(prefixer(params.prefixer))
        .pipe(gulp.dest(dir.dest.css));

    //external js lib
    gulp.src(globPattern.libBundle)
        .pipe(plumber(params.plumber))
        .pipe(concat("lib.js"))
        .pipe(uglify(params.uglify))
        .pipe(gulp.dest(dir.dest.script));

    //typescript
    gulp.src([])
        .pipe(webpack(require("./webpack.config.js").release), webpack)
        .pipe(gulp.dest(dir.dest.script));
});

var defaultTask = [
    "image",
    "ect",
    "ts",
    "ts-test",
    "lib-bundle",
    "sass",
    "sass-common"
];

syncBrowser ?
    gulp.task("default", ["activate-browser"].concat(defaultTask)):
    gulp.task("default", defaultTask);