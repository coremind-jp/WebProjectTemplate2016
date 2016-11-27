var glob    = require("glob");
var webpack = require("webpack");
var ccp     = new require("webpack/lib/optimize/CommonsChunkPlugin");

 module.exports = {
    watch     : true,
    cache     : true,
    output    : { filename: "[name].js" },
    module    : { loaders: [ { test: /\.(ts|tsx)?$/, loader: 'ts-loader' } ] },
    resolve   : { extensions: ["", ".ts", ".tsx", ".js"] },
    ts        : { compilerOptions: {} },
    plugins   : [ new ccp({ name: "common", filename: "common.js" }) ],

    initialize: initialize
};

function initialize(isRelease, pageSrcDir)
{
    this.entry = createEntry(glob.sync(pageSrcDir+"/*.{ts,tsx}"));

    if (isRelease)
    {
        this.ts.compilerOptions.declaration = false;
        this.plugins.push(new webpack.optimize.UglifyJsPlugin());
    }
    else
    {
        this.devtool = "#inline-source-map";
        this.ts.compilerOptions.declaration = true;
        this.ts.compilerOptions.declarationDir = "/js/d.ts";
    };

    return this;
}

function createEntry(files)
{
    var entry = {};

    for (var i = 0; i < files.length; i++)
    {
        var s = files[i].lastIndexOf("/");
        var e = files[i].lastIndexOf(".tsx");
        if (e == -1)
            e = files[i].lastIndexOf(".ts");

        entry[files[i].substring(s+1, e)] = files[i];
    }

    return entry;
}