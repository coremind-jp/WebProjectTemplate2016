//package list---------------------------------
var gulp      = require("gulp");              //task runner
var del       = require("del");               //file, directory delete
var plumber   = require("gulp-plumber");      //Prevent pipe breaking caused by errors from gulp plugins
var notify    = require("gulp-notify");       //notification (dosnt work for win10)
var concat    = require("gulp-concat");
var _if       = require("gulp-if");
var rename    = require("gulp-rename");

//path variable & utility function-------------
var root     = "./workspace";
var rootSrc  = root+"/src";
var rootDest = root+"/www";
var dir = {
    src:  {
        ect  : rootSrc+"/ect",
        sass : rootSrc+"/sass",
        guide: rootSrc+"/sass/_guide",
        js   : rootSrc+"/js",
        jsx  : rootSrc+"/jsx",
        ts   : rootSrc+"/ts",
        asset: rootSrc+"/asset"
    },
    dest: {
        html : rootDest,
        css  : rootDest+"/css",
        guide: rootDest+"/guide",
        js   : rootDest+"/js",
        asset: rootDest+"/asset",
        maps : {
            relative: "../map",
            absolute: rootDest+"/map"
        },
        temp : rootDest+"/_temp"
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
    },
    typescript: {
        target: "ES6",
        newLine: 'CRLF', //'LF' for linux
        noEmitOnError: true,
        jsx: "react",
        //outFile: false,
        removeComments: true
    }
};


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
テストサーバー起動
*/
gulp.task("run-server", function() {
    var http = require("http");
    var fs = require("fs");
    server = http.createServer();
    server.listen(80, "localhost");

    var responseData = "";
    function readJson(callback) {
        fs.readFile(dir.dest.temp+"/comments.json", 'utf-8', function(err, data) {
            callback(err ? "[]": data);
        });
    };

    server.on("request", function(req, res)
    {
        function finalize(comments)
        {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(comments);
            res.end();
        };

        if (req.method === "POST")
        {
            console.log("POST process");
            var plane = "";

            req.on("readable", function(chunk) { plane += req.read(); });
            req.on("end", function()
            {
                console.log("read complete. for post data", plane);

                var comment = {};

                var v = plane.split("&");
                console.log(v);
                for (var i = v.length - 1; i >= 0; i--)
                {
                    var w = v[i].split("=");
                    console.log(w);
                    comment[w[0]] = w[1];
                }

                readJson(function(comments)
                {
                    comments = JSON.parse(comments);
                    comments.push(comment);
                    comments = JSON.stringify(comments);

                    fs.writeFileSync(dir.dest.temp+"/comments.json", comments);

                    finalize(comments);
                });
            });
        }
        else readJson(finalize);
    });
});
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
js圧縮
*/
var uglify = require("gulp-uglify");
gulp.task("build-js", function()
{
    return gulp
        .src(glob(".js", dir.src.js))
        .pipe(plumber(params.plumber))
        //.pipe(uglify())
        .pipe(gulp.dest(dir.dest.js))
        .pipe(_if(isExistBrowser, browser.stream({ once: true })));
});
gulp.task("dev-js", ["try-start-server"], function() {
    gulp.watch(glob(".js", dir.src.js), ["build-js"]);
});

/*
typescriptプリコンパイル
*/
var typescript = require("gulp-typescript");
gulp.task("build-typescript", function()
{
    return gulp
        .src(glob("{ts, tsx}", dir.src.ts))
        .pipe(plumber(params.plumber))
        .pipe(sourceMap.init())
            .pipe(typescript(params.typescript))
        .pipe(sourceMap.write(dir.dest.maps.relative))
        .pipe(gulp.dest(dir.dest.js))
        .pipe(_if(isExistBrowser, browser.stream({ once: true })));
});
gulp.task("dev-typescript", ["try-start-server"], function() {
    gulp.watch(glob("{ts, tsx}", dir.src.ts), ["build-typescript"]);
});

/*
Reactプリコンパイル
*/
var react = require("gulp-react");
gulp.task("build-react", function()
{
    return gulp
        .src(glob(".jsx", dir.src.jsx))
        .pipe(plumber(params.plumber))
        .pipe(rename({ suffix: ".react" }))
        .pipe(react())
        .pipe(gulp.dest(dir.dest.js))
        .pipe(_if(isExistBrowser, browser.stream({ once: true })));
});
gulp.task("dev-react", ["try-start-server"], function() {
    gulp.watch(glob(".jsx", dir.src.jsx), ["build-react"]);
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
        .pipe(sourceMap.write(dir.dest.maps.relative))
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
        .pipe(sourceMap.write(dir.dest.maps.relative))
        .pipe(gulp.dest(dir.dest.css))
        .pipe(_if(isExistBrowser, browser.stream({ once: true })));
});
gulp.task("dev-guide", ["try-start-server"], function() {
    gulp.watch(glob(".scss", dir.src.guide), ["build-guide"]);
});

/*
出力ファイル削除
*/
gulp.task("clean", function() {
    del(glob("*.*", rootDest));
});

/*
開発タスク
*/
var browser = null;
function isExistBrowser() { return browser !== null; };
gulp.task("try-start-server", function() {
    if (isExistBrowser())
        return;

    (browser = require("browser-sync")).init({
        server: {
            baseDir: rootDest,
        },
        open: false,
        startPath: "/guide"
    });
});
gulp.task('default', [
    //"clean",
    "dev-sass", "dev-ect", "dev-guide", "dev-js", "dev-react", "dev-typescript"]);