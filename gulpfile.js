//package list---------------------------------
var gulp      = require("gulp");              //task runner
var del       = require("del");               //file, directory delete
var plumber   = require("gulp-plumber");      //Prevent pipe breaking caused by errors from gulp plugins
var notify    = require("gulp-notify");       //notification (dosnt work for win10)
var ect       = require("gulp-ect-simple");   //HTML Template Engene

//path list------------------------------------
var root     = "./workspace";
var rootSrc  = root+"/src";
var rootDest = root+"/public";
var dir = {
    dest: {
        html: rootDest,
        js  : rootDest+"/js",
        css : rootDest+"/css"
    },
    src:  {
        ect : rootSrc+"/ect",
        sass: rootSrc+"/sass"
    }
};

//utility variables, functions-----------------
var ectParams = {
    options: {
        root: dir.src.ect,
        ext : ".ect",
    },
    data: require("./siteConfigure.js")
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
gulp.task("build-ECT", function() {
    gulp.src(glob(".ect", dir.src.ect))
        .pipe(ect(ectParams))
        .pipe(gulp.dest(dir.dest.html));
});


gulp.task('default', ['build-ECT']);