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
                    if(response.code != 200) {
                        alert({
                            title: '提示',
                            content: response.message,
                            doneText: '确定',
                        }).then(() => {
                            window.location = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI2ODQ2NDgxMw==&scene=110#wechat_redirect'    
                        })
                    } else {
                        if (response.result > 3) {
                            alert({
                                title: '提示',
                                content: '您今天的游戏次数已经用完，分享可增加次数',
                                doneText: '确定',
                            }).then(() => {
                                window.location = '/game/index.html'    
                            })
                        } else {
                            if (true != type) {
                                window.location = '/game/checkpoint.html'
                            }
                        }
                    }
                }
            })
        }
    }
    return User
})()
