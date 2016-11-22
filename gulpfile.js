var isRelease = process.argv.slice(2).indexOf("--dev") == -1;
console.log("_/_/_/_/"+(isRelease ? "RELEASE TASK": "DEVELOP TASK")+"_/_/_/_/");

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

//----------------------------------------------------------------path parameter
var root     = "./workspace";
var rootSrc  = root+"/src";
var rootDest = root+"/www";
var dir = {
    src:  {
        ect   : rootSrc+"/ect",
        asset : rootSrc+"/asset",
        script: rootSrc+"/script",
        sass  : rootSrc+"/sass",
        common: {
            sass: rootSrc+"/sass/_common"
        },
        lib   : rootSrc+"/lib",
    },
    dest: {
        html   : rootDest,
        css    : rootDest+"/css",
        guide  : rootDest+"/guide",
        script : rootDest+"/js",
        typeDoc: rootDest+"/typedoc",
        tds    : rootDest+"/js/definitions",
        asset  : rootDest+"/asset",
        temp   : rootDest+"/_temp"
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
    typescript: {
        compiler  : require("typescript"),
        moduleList: ["common"],
        entryFile : "Main.ts",
        outputDir : dir.dest.script
    },
    typeDoc: {
            module: "commonjs",
            target: "es5",
            out: dir.dest.typeDoc,
            name: "typescript documentation"
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
        startPath: "/guide"
    }
};

//------------------------------------------------------------------------helper
function glob(extension, rootDirectory, advance)
{
    var defaultRule = [
            rootDirectory+"/**/*"    +extension,
        "!"+rootDirectory+"/**/_*"   +extension,//ignore '_' prefix files
        "!"+rootDirectory+"/_**/**/*"+extension //ignore '_' prefix directorys
    ];

    return advance ? advance(defaultRule): defaultRule;
};

var addedTaskSet = [];
function createTaskSet(taskName, srcGlob, watchGlob, buildFunction)
{
    // console.log("task created.", taskName);

    gulp.task("build-"+taskName, buildFunction);
    gulp.task("watch-"+taskName, function() {
        gulp.watch(watchGlob || srcGlob, ["reload-"+taskName]);
    });
    gulp.task("reload-"+taskName, function()
    {
        browser.active ?
            sequence("build-"+taskName, "refresh-browser"):
            browser.init(params.browserSync, sequence.call(null, "build-"+taskName, "refresh-browser"));
    });

    addedTaskSet.push(taskName);
};

//-------------------------------------------------------------------------image
/*
画像最適化
*/
var image = require("gulp-image");
(function(srcGlob, watchGlob)
{
    createTaskSet("image", srcGlob, srcGlob, function()
    {
        return isRelease ?
            gulp.src(srcGlob)
                .pipe(plumber(params.plumber))
                .pipe(image(params.image))
                .pipe(gulp.dest(dir.dest.asset)):

            gulp.src(srcGlob)
                .pipe(gulp.dest(dir.dest.asset));
    });
})(glob("{jpg,jpeg,png,gif,svg}", dir.src.asset));



//---------------------------------------------------------------------ECT(html)
/*
テンプレートからhtmlを生成
*/
var ect = require("gulp-ect-simple");
(function(srcGlob, watchGlob)
{
    createTaskSet("ect", srcGlob, srcGlob, function()
    {
        return gulp.src(srcGlob)
            .pipe(plumber(params.plumber))
            .pipe(ect(params.ect))
            .pipe(gulp.dest(dir.dest.html));
    });
})(glob(".ect", dir.src.ect));



//----------------------------------------------------------------typescript(js)
/*
共有ライブラリ(script/_common)からcommon.js生成
*/
var buffer     = require("vinyl-buffer");
var tsify      = require("tsify");
var source     = require('vinyl-source-stream');
var browserify = require("browserify");
for (var i = params.typescript.moduleList.length - 1; i >= 0; i--)
{
    (function createTypeScriptTask(moduleName)
    {
        var entryDir   = dir.src.script+"/_"+moduleName;
        var entryPath  = entryDir+"/"+params.typescript.entryFile;
        
        (function(srcGlob, watchGlob)
        {
            createTaskSet("typescript-"+moduleName, srcGlob, watchGlob, function()
            {
                return isRelease ?
                    browserify(entryPath, { debug: true })
                        .plugin('tsify', { typescript: params.typescript.compiler })
                        .bundle()
                        .pipe(source(moduleName+".js"))
                        .pipe(buffer())
                        .pipe(uglify(params.uglify))
                        .pipe(gulp.dest(params.typescript.outputDir)):

                    browserify(entryPath, { debug: true })
                        .plugin('tsify', { typescript: params.typescript.compiler })
                        .bundle()
                        .pipe(source(moduleName+".js"))
                        .pipe(gulp.dest(params.typescript.outputDir));
            });
        })(glob("{ts,tsx}", entryDir));
    })(params.typescript.moduleList[i]);
}

/*
個別ページ向けコンパイル
*/
var merge  = require("merge2");
var gulpTS = require("gulp-typescript");
(function(srcGlob, watchGlob)
{
    createTaskSet("typescript", srcGlob, watchGlob, function()
    {
        var project  = gulpTS.createProject("tsconfig.json", { typescript: params.typescript.compiler });
        var tsResult = gulp.src(srcGlob)
            .pipe(plumber(params.plumber))
            .pipe(project());

        if (isRelease)
            tsResult.js.pipe(buffer()).pipe(uglify(params.uglify));

        return merge([
            tsResult.dts.pipe(gulp.dest(dir.dest.tds)),
            tsResult.js.pipe(gulp.dest(dir.dest.script))
        ]);
    });
})(
    glob("{ts,tsx}", dir.src.script, function(f) { return ["typings/index.d.ts"].concat(f); }),
    glob("{ts,tsx}", dir.src.script)
);

//---------------------------------------------------------------------sass(css)
var sass      = require("gulp-sass");
var prefixer  = require("gulp-autoprefixer");
var frontnote = require("gulp-frontnote");
/*
共有ライブラリ(sass/_common)からスタイルシート生成・スタイルガイド更新
*/
(function(srcGlob, watchGlob)
{
    createTaskSet("sass-common", srcGlob, srcGlob, function()
    {
        return isRelease ?
            gulp.src(srcGlob)
                .pipe(plumber(params.plumber))
                .pipe(concat("common.css"))
                .pipe(sass(params.sass))
                .pipe(prefixer(params.prefixer))
                .pipe(gulp.dest(dir.dest.css)):

            gulp.src(srcGlob)
                .pipe(plumber(params.plumber))
                .pipe(frontnote(params.frontnote))
                .pipe(sourceMap.init())
                    .pipe(concat("common.css"))
                    .pipe(sass(params.sass))
                    .pipe(prefixer(params.prefixer))
                .pipe(sourceMap.write("./"))
                .pipe(gulp.dest(dir.dest.css));
    });
})([dir.src.common.sass+"/*.scss"]);

/*
個別ページ向けコンパイル
*/
(function(srcGlob, watchGlob)
{
    createTaskSet("sass", srcGlob, srcGlob, function()
    {
        return gulp.src(srcGlob)
            .pipe(plumber(params.plumber))
            .pipe(sass(params.sass))
            .pipe(prefixer(params.prefixer))
            .pipe(gulp.dest(dir.dest.css));
    });
})(glob(".scss", dir.src.sass));



//------------------------------------------------------------------------server
var browser = require("browser-sync");
gulp.task("refresh-browser", browser.reload);

/*
テストサーバー起動
*/
gulp.task("run-test-server", function()
{
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



//-------------------------------------------------------------task registration
(function createTopLevelTask()
{
    // console.log("\nTaskList(TopLevel)\n");
    // console.log("[AllInOne]");
    // console.log("\tclean\n\tbuild\n\twatch\n\treload");
    gulp.task("clean", function() {
        del([rootDest+"/**/**.*", "!"+rootDest+"/asset/**/*.*"]);
    });

    /*
    typescriptドキュメント生成
    */
    var typeDoc = require("gulp-typedoc");
    gulp.task("typedoc", function()
    {
        return gulp.src(dir.src.script+"/**/*.{ts,tsx}")
            .pipe(typeDoc(params.typeDoc));
    });

    /*
    外部ライブラリ結合
    */
    gulp.task("bundle", function()
    {
        return isRelease ?
            gulp.src(glob(".js", dir.src.lib))
                .pipe(plumber(params.plumber))
                .pipe(concat("lib.js"))
                .pipe(uglify(params.uglify))
                .pipe(gulp.dest(dir.dest.script)):

            gulp.src(glob(".js", dir.src.lib))
                .pipe(plumber(params.plumber))
                .pipe(sourceMap.init())
                    .pipe(concat("lib.js"))
                .pipe(sourceMap.write("./"))
                .pipe(gulp.dest(dir.dest.script));
    });

    /*
    外部ライブラリ結合
    */
    var taskSet = {
        build : [],
        watch : [],
        reload: []
    };
    // console.log("[StandAlone]");
    for (var i = addedTaskSet.length - 1; i >= 0; i--)
    {
        // console.log("\t(build-|watch-|reload-)"+addedTaskSet[i]);
        taskSet.build.push(  "build-"+addedTaskSet[i]);
        taskSet.watch.push(  "watch-"+addedTaskSet[i]);
        taskSet.reload.push("reload-"+addedTaskSet[i]);
    }

    for (var task in taskSet) gulp.task(task, taskSet[task]);
})();

gulp.task("default", ["watch"]);