on(window,'load',function(){
    
    var user = new User()
    user.play(true)
    
    game.setup();

    event(game);
    var content = $(".content")[0]
    // content.parentNode.style.display = 'none'
    // content.innerHTML = 3
    game.checkView()
    
    $(".count-1").show()
    content.parentNode.style.display = 'block'
    setTimeout(function () { $(".count-1").hide(); $(".count-2").show()}, 1000)
    setTimeout(function () { $(".count-2").hide(); $(".count-3").show()}, 2000)
    setTimeout(function () { $(".count-3").hide(); $(".count-go").show()}, 3000)
    setTimeout(function () { content.parentNode.style.display = 'none'; saveLog(); 
        game.update()
    }, 4000)
});

function saveLog() {
    var api = new Api()
    var storage = new MyStorage()
    var openId = storage.getItem(global.OPENID)
    api.post({
        url: '/log/save',
        data: JSON.stringify({openId: openId, type: 'GAME'}),
    })
}