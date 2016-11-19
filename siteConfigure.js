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
        }
    },
    //各ページの固有設定
    "pages": {
        //固有設定が存在しない場合に利用される設定
        "common": {
            "id"    : "common",
            "css"   : false,
            "js"    : false,
            "jsx"   : false,
            "head": {
                "title"      : "common",
                "keyword"    : "common 0",
                "description": "about common",
            },
        },
        "index": {
            "id"    : "index",
            "css"   : true,
            "js"    : "prepend",
            "jsx"   : true,
            "head": {
                "title"      : "index",
                "keyword"    : "index, 1",
                "description": "about index"
            }
        }
    }
};