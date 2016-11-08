//package list---------------------------------
var gulp      = require("gulp");              //task runner
var del       = require("del");               //file, directory delete
var plumber   = require("gulp-plumber");      //Prevent pipe breaking caused by errors from gulp plugins
var notify    = require("gulp-notify");       //notification (dosnt work for win10)
var concat    = require("gulp-concat");
var _if       = require("gulp-if");
var browser   = null;

//path variable & utility function-------------
var root     = "./workspace";
var rootSrc  = root+"/src";
var rootDest = root+"/www";
var dir = {
    src:  {
        ect  : rootSrc+"/ect",
        sass : rootSrc+"/sass",
        guide: rootSrc+"/sass/_guide"
    },
    dest: {
        html : rootDest,
        js   : rootDest+"/js",
        css  : rootDest+"/css",
        asset: rootDest+"/asset",
        guide: rootDest+"/guide"
    }
};

//module parameter-----------------------------
var params = {
    plumber: {
        errorHandler: notify.onError("Error: <%= error.message %>")
    },
    sass: {
        outputStyle: "compressed",
        errLogToConsole: false,
        onError: function(e) { notify().writer(e); }
    },
    frontnote: {
        clean: true,
        verbose: true,
        out: dir.dest.guide,
        css: "../css/guide.css"
    },
    prefixer: {
        browser: [ 'last 2 versions', 'ie 9' ]
    },
    ect: {
        options: { root: dir.src.ect, ext: ".ect" },
        data: require("./siteConfigure.js")
    }
};

function isExistBrowser() { return browser !== null; };

function glob(extension, rootDirectory, advance)
{
    var defaultRule = [
            rootDirectory+"/**/*"    +extension,
        "!"+rootDirectory+"/**/_*"   +extension,//ignore '_' prefix files
        "!"+rootDirectory+"/_**/**/*"+extension //ignore '_' prefix directorys
    ];

    return advance ? advance(defaultRule): defaultRule;
};

//task list-----------------------------------
/*
テンプレートからhtmlを生成
*/
var ect = require("gulp-ect-simple");
gulp.task("build-ect", function()
{
    return gulp
        .src(glob(".ect", dir.src.ect))
        .pipe(plumber(params.plumber))
        .pipe(ect(params.ect))
        .pipe(gulp.dest(dir.dest.html))
        .pipe(_if(isExistBrowser, browser.stream({ once: true })));
});
gulp.task("dev-ect", ["try-start-server"], function() {
    gulp.watch(glob(".ect", dir.src.ect), ["build-ect"]);
});

/*
個別ページ向けsassからスタイルシート生成
*/
var sass      = require("gulp-sass");
var prefixer  = require("gulp-autoprefixer");
var sourceMap = require("gulp-sourcemaps");
gulp.task("build-sass", function()
{
    return gulp
        .src(glob(".scss", dir.src.sass))
        .pipe(plumber(params.plumber))
        .pipe(sourceMap.init())
            .pipe(sass(params.sass))
            .pipe(prefixer(params.prefixer))
        .pipe(sourceMap.write("../map"))
        .pipe(gulp.dest(dir.dest.css))
        .pipe(_if(isExistBrowser, browser.stream({ once: true })));
});
gulp.task("dev-sass", ["try-start-server"], function() {
    gulp.watch(glob(".scss", dir.src.sass), ["build-sass"]);
});

/*
スタイルガイドsassからスタイルシート生成・スタイルガイド更新
*/
var frontnote = require("gulp-frontnote");
gulp.task("build-guide", function()
{
    return gulp
        .src([dir.src.guide+"/*.scss"])
        .pipe(plumber(params.plumber))
        .pipe(frontnote(params.frontnote))
        .pipe(sourceMap.init())
            .pipe(concat("guide.css"))
            .pipe(sass(params.sass))
            .pipe(prefixer(params.prefixer))
        .pipe(sourceMap.write("../map"))
        .pipe(gulp.dest(dir.dest.css))
        .pipe(_if(isExistBrowser, browser.stream({ once: true })));
});
gulp.task("dev-guide", ["try-start-server"], function() {
    gulp.watch(glob(".scss", dir.src.guide), ["build-guide"]);
});

/*
開発タスク
*/
gulp.task("try-start-server", function() {
    if (isExistBrowser())
        return;

    (browser = require("browser-sync")).init({
        server: rootDest
    });
});
gulp.task('default', ["dev-sass", "dev-ect", "dev-guide"]);