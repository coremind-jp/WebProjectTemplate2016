var glob    = require("glob");
var webpack = require("webpack");
var ccp     = new require("webpack/lib/optimize/CommonsChunkPlugin");

 module.exports = {
    watch     : true,
    cache     : true,
    output    : { filename: "[name].js" },
    resolve   : { extensions: ["", ".ts", ".tsx", ".js"] },
    ts        : { compilerOptions: {} },
    plugins   : [ new ccp({ name: "common", filename: "common.js" }) ],
    module    : {
        loaders:     [ { test:      /\.(ts|tsx)?$/, loader: 'ts-loader' } ],
        postLoaders: [ { test: /_test\.(ts|tsx)?$/, loader: 'webpack-espower-loader' } ],
    },

    initialize: initialize
};

function initialize(buildType, pageSrcDir)
{
    this.entry = createEntry(glob.sync(pageSrcDir+"/*.{ts,tsx}"));

    switch (buildType)
    {
        case "release":
            this.ts.compilerOptions.declaration = false;
            this.plugins.push(new webpack.optimize.UglifyJsPlugin());
            break;

        case "develop":
            this.devtool = "#inline-source-map";
            this.ts.compilerOptions.declaration = true;
            this.ts.compilerOptions.declarationDir = "/js/d.ts";
            break;
    }

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