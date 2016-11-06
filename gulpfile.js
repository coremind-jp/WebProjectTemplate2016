//package list---------------------------------
var gulp      = require("gulp");              //task runner
var del       = require("del");               //file, directory delete
var plumber   = require("gulp-plumber");      //Prevent pipe breaking caused by errors from gulp plugins
var notify    = require("gulp-notify");       //notification (dosnt work for win10)
var ect       = require("gulp-ect-simple");   //html template Engene
var frontNote = require("gulp-frontNote");    //styleguide generator

//path list------------------------------------
var root     = "./workspace";
var rootSrc  = root+"/src";
var rootDest = root+"/www";
var dir = {
    src:  {
        ect  : rootSrc+"/ect",
        sass : rootSrc+"/sass",
        guide: rootSrc+"/sass/guide"
    },
    dest: {
        html : rootDest,
        js   : rootDest+"/js",
        css  : rootDest+"/css",
        guide: rootDest+"/guide"
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
テンプレートからhtmlを生成
*/
gulp.task("build-ect", function()
{
    var params = {
        options: { root: dir.src.ect, ext: ".ect", },
        data: require("./siteConfigure.js")
    };

    gulp
        .src(glob(".ect", dir.src.ect))
        .pipe(plumber())
        .pipe(ect(params))
        .pipe(gulp.dest(dir.dest.html));
});

/*
スタイルガイド更新
*/
gulp.task("update-frontnote", function()
{
    var params = {
        clean: true,
        verbose: true,
        out: dir.dest.guide
    };

    gulp.src(glob(".sass", dir.src.guide))
        .pipe(plumber())
        .pipe(frontNote(params))
});

gulp.task('default', ['build-ect']);