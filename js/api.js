let Api = (function (){

    let Api = function () {

    }

    let host = "http://lrans.xin:8888/app"
    // let host = "http://localhost:8888/app"

    Api.prototype = {
        wechatLogin: function (data, fn) {
            this.post({
                url: "/user/login",
                data: data,
                success: fn
            })
        },
        post: optioin => {
            let url = host + optioin.url
            let data = optioin.data
            let successFn = optioin.success || function () {}
            $.ajax ({
                url: url,
                data: data,
                type: 'POST',
                dataType : 'json',
                contentType: 'application/json',
                xhrFields: {'Access-Control-Allow-Origin': '*'},
                success: successFn,
                error: function (err) {
                    console.log(err)
                }
            })
        }
    }

    return Api
})()