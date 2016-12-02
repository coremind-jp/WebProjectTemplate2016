 module.exports = {
    entry     : createEntry(
        require("glob")
            .sync(__dirname + "/workspace/src/script_test/**/*.{ts,tsx}")
    ),
    watch     : true,
    cache     : true,
    output    : { filename: "[name].js" },
    resolve   : { extensions: ["", ".ts", ".tsx", ".js"] },
    ts        : {
        compilerOptions: {
            declaration: false
        }
    },
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
};

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