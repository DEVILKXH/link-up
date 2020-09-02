on(window,'load',function(){

    var user = new User()
    user.play(true)
    
    var game = new Game();
    game.setup();

    event(game);
    var content = $(".content")[0]
    // content.parentNode.style.display = 'none'
    content.innerHTML = 3
    content.parentNode.style.display = 'block'
    setTimeout(function () { content.innerHTML = 2}, 1000)
    setTimeout(function () { content.innerHTML = 1}, 2000)
    setTimeout(function () { content.innerHTML = 'GO'}, 3000)
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