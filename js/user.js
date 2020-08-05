let User = (function () {
    let storage = new MyStorage()
    let api = new Api()
    
    let User = function () {

    }

    User.prototype = {
        wechatLogin: (code,fn) => {
            api.wechatLogin(code, function (response) {
                storage.setItem("OPEN_ID", response.result)
                if (fn) {
                    fn();
                }
            })
        },
        play: (type) => {
            let openId = storage.getItem(global.OPENID)
            api.post({
                url: '/score/count',
                data: JSON.stringify({openId: openId}),
                success: function (response) {
                    if (response.result > 3) {
                        alert({
                            title: '提示',
                            content: '您今天的游戏次数已经用完，分享可增加次数',
                            doneText: '确定',
                        }).then(() => {
                            window.location = '/html/index.html'    
                        })
                    } else {
                        if (true != type) {
                            window.location = '/html/checkpoint.html'
                        }
                    }
                }
            })
        }
    }
    return User
})()
