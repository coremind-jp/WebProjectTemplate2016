var webpack = require("webpack");
var ccp     = new require("webpack/lib/optimize/CommonsChunkPlugin");

 module.exports = {
    release: {
        entry     : createEntry("./workspace/src/script/entry/**/*.{ts,tsx}"),
        output    : { filename: "[name].js" },
        resolve   : { extensions: ["", ".ts", ".tsx", ".js"] },
        plugins   : [
            new ccp({ name: "common", filename: "common.js" }),
            new webpack.optimize.UglifyJsPlugin()
        ],
        module    : { loaders: [ { test: /\.(ts|tsx)?$/, loader: 'ts-loader' } ] },
    },

    develop: function(overrideOptions)
    {
        return mergeOption({
            entry     : createEntry("./workspace/src/script/entry/**/*.{ts,tsx}"),
            output    : { filename: "[name].js" },
            resolve   : { extensions: ["", ".ts", ".tsx", ".js"] },
            devtool   : "#inline-source-map",
            plugins   : [ new ccp({ name: "common", filename: "common.js" }) ],
            module    : { loaders: [ { test: /\.(ts|tsx)?$/, loader: 'ts-loader' } ] },
        }, overrideOptions);
    },

    test: function(overrideOptions)
    {
        return mergeOption({
            entry     : createEntry("./workspace/src/script_test/entry/**/*.{ts,tsx}"),
            output    : { filename: "[name].js" },
            resolve   : { extensions: ["", ".ts", ".tsx", ".js"] },
            module: {
                // Disable handling of unknown requires
                unknownContextRegExp: /$^/,
                unknownContextCritical: false,

                // Disable handling of requires with a single expression
                exprContextRegExp: /$^/,
                exprContextCritical: false,

                loaders: [
                    { test: /\.(ts|tsx)?$/, loader: 'ts-loader' },
                    { test:      /\.json$/, loader: 'json-loader' }
                ],
                postLoaders: [ { test: /\.(ts|tsx)?$/, loader: 'webpack-espower-loader' } ],
            }
        }, overrideOptions);
    }
};

function createEntry(globPattern)
{
    var files = require("glob").sync(globPattern);
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

function mergeOption(src, additional)
{
    if (additional)
        for (var p in additional)
            src[p] = additional[p];
    return src;
}