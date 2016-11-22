module.exports = {
    "targetPageId": "",
    "setTargetPage": function(targetPageId) { this.targetPageId = targetPageId; },
    "getTargetPage": function() { return this.pages[this.targetPageId]; },

    "config": {
        "copyright"         : "COREMIND",
        "isHTML5"           : true,
        "isSupportedMobile" : true,
        "isSupportedPC"     : true,
        "homeURL"           : "http://coremind.jp",
        "shortcutIconURL"   : "",

        //ソーシャルヘッダー
        "isSupportedSNS"    : false,
        "sns": {
            "title"         : "",
            "type"          : "",
            "url"           : "",
            "image"         : "",
            "siteName"      : "",
            "description"   : "",
            "locale"        : "ja_JP",
            //twitter
            "card"          : "",
            "site"          : "",
        },

        "useJavascriptExternalLibrary": true
    },
    //各ページの固有設定
    "pages": {
        //固有設定が存在しない場合に利用される設定
        "common": {
            "id": "common",
            "css": {
                "indivisual"  : false,
                "internalLibs": ["common"],
            },
            "js": {
                "indivisual"    : false,
                "insertPosition": "prepend",
                "internalLibs"  : [],
            },
            "head": {
                "title"      : "UnknownPage.",
                "keyword"    : "",
                "description": "",
            }
        },
        "index": {
            "id" : "index",
            "css": {
                "indivisual"  : true,
                "internalLibs": ["common"],
            },
            "js": {
                "indivisual"    : true,
                "insertPosition": "prepend",
                "internalLibs"  : ["common"],
            },
            "head": {
                "title"      : "",
                "keyword"    : "",
                "description": ""
            }
        }
    }
};