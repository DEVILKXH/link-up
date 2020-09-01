function event(game){
    var gridContainer = $$('.grid-container')[0];
    var before;
    on(gridContainer,'click',function(e){
        var target = e.target;
        if (target.tagName !== 'IMG') return;
        var item = target.parentNode.parentNode;
        if (hasClassName(item, 'hidden')) return ;
        game.view.itemAction(item);
        if (!before){
            before = item;
            return;
        }
        if (before === item) return;
        var beforeIndex = parseInt(before.getAttribute('data-index'));
        var afterIndex = parseInt(item.getAttribute('data-index'));
        var same = game.judge(beforeIndex,afterIndex);
        if (same){
            before = null;
        }else{
            game.view.itemCancelAction(before);
            before = item;
        }
    });

    var helpBtn = $$('#help')[0];
    on(helpBtn, 'click', function (e) {
        game.help();
    });

    // var restartBtn = $$('#restart')[0];
    // on(restartBtn, 'click', function (e) {
    //     game.restart();
    // });
    var refresh = $$("#refresh")[0];
    on(refresh, 'click', function (e) {
        game.refresh();
    })
    // var oLevel = $$("#level")[0]
    // on(oLevel, 'change', function (e) {
    //     game.changeLevel(oLevel.value)
    // })

    var boomBtn = $$('#boom')[0];
    on(boomBtn, 'click', function (e) {
        game.boom();
    });

    var frozenBtn = $$('#frozen')[0];
    on(frozenBtn, 'click', function (e) {
        game.frozen();
    })

    var pause = $$("#pause")[0]
    on(pause, 'click', function (e) {
        game.pause()
    })

    
    var start = $$("#start")[0]
    on(start, 'click', function (e) {
        game.startGame()
    })

    var next = $$("#next-point")[0]
    on(next, 'click', function (e) {
        game.next()
    })

    var again = $$("#play-again")[0]
    on(again, 'click', function (e) {
        game.again()
    })

    var close = $$("#dialog-bg")[0]
    on(close, 'click', function (e) {
        game.closeDialog()
    })
}