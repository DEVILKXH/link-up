var Game = (function(){
    var continueClick = 0
    var clickTime = 0
    
    var refreshCount = 0
    var helpCount = 0
    var frozenCount = 0
    var boomCount = 0
    
    var timeCooldown = 60
    
    var hlepData = []
    var maxScore = 0
    var totalScore = 0;
    var api = new Api()
    var storage = new MyStorage()
    var currentPoint = storage.getItem(global.CURRENT_POINT)
    var winpoint = storage.getItem(global.WIN)
    if (undefined == currentPoint || null == currentPoint) {
        currentPoint = 1;
    }
    if(undefined == winpoint || null == winpoint) {
        winpoint = 0
    }
    let pointConfig = {
        cell: ALLPOINTS.data[currentPoint - 1].cell,
        type: ALLPOINTS.data[currentPoint - 1].type,
        repeat: ALLPOINTS.data[currentPoint - 1].repeat,
        times: ALLPOINTS.data[currentPoint - 1].times,
        col: ALLPOINTS.data[currentPoint - 1].cell[0].length,
        row: ALLPOINTS.data[currentPoint - 1].cell.length,
        itemCount: ALLPOINTS.data[currentPoint - 1].itemCount
    }
    var data = {
        cell: [],
        time: pointConfig.times
    }
    var win = false
    var frozen = false
    var pause = false
    var score = 0
    var totalScoreShow = 0;
    var active = {
        t: true,
        h: true,
        n: true,
    }
    var boomIndex = 0
    var propType = 'GAME'
    var moving = false

    let video = {
        biu: $(".biu")[0] || undefined,
        victory: $(".victory")[0] || undefined,
        fail: $(".fail")[0] || undefined,
        bomb: $(".bomb")[0] || undefined
    }
    var Game = function(){
        
    };

    Game.prototype = {
        setup : function(){
            this.view = new View();
            this.init();
        },

        changeSetup: function () {
            data.time = pointConfig.times;
            this.initCell();
            this.fillCell();
            this.checkDeadlock();
            this.view.init(this,data);
            this.view.initProps(helpCount, refreshCount, boomCount, frozenCount);
        },

        init : function(){
            this.getMaxScore();
            this.start();
            this.view.initPointText()
            this.view.init(this,data)
            let that = this
            api.post({
                url: '/user/logLogin',
                data: openId,
                success: function (response) {
                    that.initProp();
                }
            })
        },

        start : function(){
            this.initCell();
            this.fillCell();
            this.checkDeadlock();
            // this.update();
        },

        initProp: function() {
            let that = this
            var openId = storage.getItem(global.OPENID)
            api.post({
                url: '/score/groupCount',
                data: JSON.stringify({openId: openId}),
                success: function (res) {
                    if(res.code == 200) {
                        let result = res.result;
                        for(let attr in result) {
                            if(attr == 'HELP') {
                                config.maxHelpCount.help = result[attr]
                            }
                            if(attr == 'BOOM') {
                                config.maxHelpCount.boom = result[attr]
                            }
                            if(attr == 'FROZEN') {
                                config.maxHelpCount.frozen = result[attr]
                            }
                            if(attr == 'REFRESH') {
                                config.maxHelpCount.refresh = result[attr]
                            }
                        }
                        that.view.initProps(helpCount, refreshCount, boomCount, frozenCount);
                    }
                }
            })
        },

        saveLog: function(propType) {
            var openId = storage.getItem(global.OPENID)
            api.post({
                url: '/log/save',
                data: JSON.stringify({openId: openId, type: propType.toUpperCase()}),
            })
        },

        share: function () {
            let that = this
            let shareData = { 
                title: '品牌连连看', // 分享标题
                desc: '我正在“品牌连连看”打擂第'+ currentPoint +'关，帮我助力复活赢戴森吹风机，！', // 分享描述
                link: window.origin + '/game/share.html?propType='+ propType +'&openId=' + openId, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: window.origin + '/game/bg/logo.jpg', // 分享图标
                success: function () {
                    // that.updateProp()
                    console.log({content: '分享成功'})
                }
            }
            wx.updateAppMessageShareData(shareData) 
            wx.onMenuShareAppMessage(shareData)
            wx.updateTimelineShareData(shareData)
            wx.onMenuShareQZone(shareData)
        },

        checkView: function () {
            this.view.checkView()
        },

        updateProp: function() {
            var count = 0
            console.log(propType)
            if(propType == 'help') {
                helpCount --
                count = config.maxHelpCount.help - helpCount
            }
            if(propType == 'refresh') {
                refreshCount --
                count = config.maxHelpCount.help - refreshCount
            }
            if(propType == 'boom') {
                boomCount --
                count = config.maxHelpCount.boom - boomCount
            }
            if(propType == 'frozen') {
                frozenCount --
                count = config.maxHelpCount.frozen - frozenCount
            }
            this.view.initProp(count, $(".tips-" + propType))
        },

        restart: function () {
            location.reload();  
        },

        
        refresh: function () {
            let that = this
            
            if(win || data.time == 0) {
                alert({title: '', content: '<div style="text-align: center">游戏结束</div>'})
                return ;
            }
            if (refreshCount < config.maxHelpCount.refresh){
                refreshCount ++
                this.saveLog('refresh')
                this.randomReset()
                this.view.initProp(config.maxHelpCount.refresh - refreshCount, $(".tips-refresh"))
            } else {
                that.pause()
                confirm({title: '', content:'<div style="text-align: center">每日帮助已经达到上限,分享可增加次数</div>', cancelText: '取消', doneText: '去分享'}).then(() => {
                    propType = 'refresh'
                    $(".share-dialog").show()
                    that.share()
                }).catch( () => {
                    console.log('cancel')
                    that.startGame()
                })
            }
        },
        
        help: function () {
            let that = this
            if(win || data.time == 0) {
                alert({title: '', content: '<div style="text-align: center">游戏结束</div>'})
                return ;
            }
            if (helpCount < config.maxHelpCount.help){
                helpCount ++
                this.saveLog('help')
                this.judge.apply(this, hlepData);
                this.view.initProp(config.maxHelpCount.help - helpCount, $(".tips-help"))

            } else {
                that.pause()
                confirm({title: '', content:'<div style="text-align: center">每日帮助已经达到上限,分享可增加次数</div>', cancelText: '取消', doneText: '去分享'}).then(() => {
                    propType = 'help'
                    $(".share-dialog").show()
                    that.share()
                }).catch( () => {
                    console.log('cancel')
                    that.startGame()
                })
            }
        },

        boom: function () {
            let that = this
            if(moving) {
                return 
            }

            if(win || data.time == 0) {
                alert({title: '', content: '<div style="text-align: center">游戏结束</div>'})
                return ;
            }
            if (boomCount < config.maxHelpCount.boom){
                this.saveLog('boom')
                this.startBoom()
            } else {
                that.pause()
                confirm({title: '', content:'<div style="text-align: center">每日帮助已经达到上限,分享可增加次数</div>', cancelText: '取消', doneText: '去分享'}).then(() => {
                    propType = 'boom'
                    $(".share-dialog").show()
                    that.share()
                }).catch( () => {
                    console.log('cancel')
                    that.startGame()
                })
            }
        },
        startBoom: function () {
            let that = this;
            let boom = $(".boom");
            let boom2 = $("#boom")
            boom.show()
            boom.offset(boom2.offset())
            let offset = $(".boom-boom-pos").offset()
            this.pause()
            moving = true
            boom.animate({top: offset.top, left: offset.left}, 1000, 'linear',  () => {
                if(storage.getItem("silence") == 'false') {
                    video.bomb.play()
                }
                boom.hide();
                boomIndex = 1;
                window.requestAnimationFrame(this.boomAnimate.bind(this));  
            })
        },
        boomAnimate: function () {
            let that = this
            $(".boom-animate").hide()
            if(boomIndex > 4) {
                $(".boom-boom").show()
                $(".boom-boom").addClass("animate-active");
                setTimeout( () => {
                    $(".boom-boom").hide()
                    boomCount ++
                    hlepData.push(true)
                    that.startGame()
                    that.judge.apply(this, hlepData);
                    moving = false
                    that.view.initProp(config.maxHelpCount.boom - boomCount, $(".tips-boom"))
                }, 500)
            } else {
                $(".boom-" + boomIndex).show()
                boomIndex ++
                setTimeout(this.boomAnimate.bind(this), 200)
            }
            
        },
        getMaxScore: function () {
            var openId = storage.getItem(global.OPENID)
            api.post({
                url: '/score/getMaxScore',
                data: JSON.stringify({openId: openId, point: currentPoint}),
                success: res => {
                    maxScore = res.result.max
                    totalScore = res.result.total
                    totalScoreShow = totalScore
                    
                    this.view.updateScore(totalScoreShow);
                    $(".best-score-num").text(maxScore + totalScore)
                }
            })
        },
        frozen: function () {
            var that = this
            if(moving) {
                return 
            }
            if(win || data.time == 0) {
                alert({title: '', content: '<div style="text-align: center">游戏结束</div>'})
                return ;
            }
            if (frozenCount < config.maxHelpCount.frozen){
                frozenCount ++
                this.saveLog('frozen')
                frozen = true
                moving = true
                $(".current-time").stop()
                var offset = $("#frozen").offset()
                var offset2 = $(".current-time").offset()
                var dot = offset.top * offset2.top + offset.left * offset2.left
                var det = offset.left * offset2.top + offset.top * offset2.left
                var angle = Math.floor(Math.atan2(det, dot) / Math.PI * 180) - 10
                $(".frozen-move").offset(offset).css("transform", "rotate(-"+ angle +"deg)").fadeIn()
                this.move()
            } else {
                that.pause()
                confirm({title: '', content:'<div style="text-align: center">每日帮助已经达到上限,分享可增加次数</div>', cancelText: '取消', doneText: '去分享'}).then(() => {
                    propType = 'frozen'
                    $(".share-dialog").show()
                    that.share()
                }).catch( () => {
                    console.log('cancel')
                    that.startGame()
                })
            }            
        },
        move: function () {
            var offset = $(".current-time").offset()
            let that = this
            $(".frozen-move").animate({top: Math.floor(offset.top) + 'px', left: Math.floor(offset.left) + 'px'}, 1000, "linear", function () {
                $(".time-frozen").fadeIn()
                that.stop()
            })
        },
        
        pause: function () {
            $("#pause").hide();
            $("#start").show();
            $(".current-time").stop()
            pause = true
        },

        
        startGame: function () {
            $("#pause").show();
            $("#start").hide();
            pause = false
            this.update()
        },


        stop: function () {
            $(".frozen-move").fadeOut().removeClass("active")
            this.view.initProp(config.maxHelpCount.frozen - frozenCount, $(".tips-frozen"))
            let that = this
            setTimeout(function () {
                moving = false
                frozen = false
                $(".time-frozen").fadeOut()
                that.update()
            }, 7000)
        },

        update: function () {
            this.startCountDown()
            this._update()
        },
        startCountDown: function () {
            let that = this
            // $(".current-time").stop().animate({width: '0px'}, data.time * 1000, function () {
            //     that.checkWinning()
            // })
            $(".current-time").stop().animate({width: '0px'}, data.time * 1000)
        },
        _update: function () {
            this.checkWinning()
            if (win || frozen || pause) {
                return
            }
            this.updateTime();
            window.requestAnimationFrame(this._update.bind(this));  
        },

        updateTime: function () {
            timeCooldown--;
            if (!timeCooldown) {
                timeCooldown = 60;
                data.time--;
                let timestamp = new Date().getTime()
                if (timestamp - clickTime > 1000) {
                    continueClick = 0
                    clickTime = timestamp
                }
            }
            let r = data.time / pointConfig.times;
            if (active.n && r < 0.9) {
                $(".time-night").attr("src", "bg/start-active.png")
                active.n = false
            }
            
            if (active.h && r < 0.6) {
                $(".time-half").attr("src", "bg/start-active.png")
                active.h = false
            }
            
            if (active.t && r < 0.35) {
                $(".time-ten").attr("src", "bg/start-active.png")
                active.t = false
            }
            if (data.time === 0) {
                this.over();
            }
        },

        initCell : function(){
            var index = -1;
            for (var i = 0; i < pointConfig.row; i++){
                data.cell[i] = [];
                for (var j = 0; j < pointConfig.col; j++){
                    index++;
                    data.cell[i][j] = {
                        val : null,
                        index : index,
                    }
                }
            }
        },
        fillCell : function(){
            for (var i = 0; i < pointConfig.type; i++){
                for (var j = 0; j < pointConfig.repeat; j++){
                    let index = 0;
                    while(true){
                        var x = random(1, pointConfig.col - 2);
                        var y = random(1, pointConfig.row - 2);
                        var item = data.cell[y][x];
                        if  (pointConfig.cell[y][x] == 1 && item.val === null){
                            data.cell[y][x].val = i;
                            break;
                        }
                        index ++;
                        if(index > 100) {
                            break;
                        }

                    }
                }
            }            
        },
        indexToPos : function(index){
            return {
                x : index % pointConfig.col,
                y : Math.floor(index / pointConfig.col),
            }
        },
        posToIndex : function(obj){
            return (
                obj.y * pointConfig.col + obj.x
            );
        },
        removeItem: function (before,after) {
            let timestamp = new Date().getTime()
            if (timestamp - clickTime < 500) {
                continueClick ++
                clickTime = timestamp
                // data.time += 1
                // this.view.updateTime(data.time)
                // this.startCountDown()
            } else {
                continueClick = 0
                clickTime = timestamp
            }
            this.getItem(before).val = null;
            this.getItem(after).val = null;
            this.view.removeItem(before);
            this.view.removeItem(after);
            pause = false
            pointConfig.itemCount -= 2;
            console.log(pointConfig.itemCount)
            score += continueClick * 10
            score += 20
            totalScoreShow += 20;
            this.view.updateScore(totalScoreShow)
            this.checkWinning();
        },
        isEmpty : function(obj){
            return obj.val === null;
        },
        isSame : function(before,after){
            return this.getItem(before).val === this.getItem(after).val;
        },
        identicalX : function(before,after){
            return this.indexToPos(before).x === this.indexToPos(after).x;
        },
        identicalY : function(before,after){
            return this.indexToPos(before).y === this.indexToPos(after).y;
        },
        getAround : function(index){
            return [
                -pointConfig.col,
                pointConfig.col,
                -1,
                1
            ]
        },
        getCorner : function(before,after){
            var min = Math.min.call(null,before,after);
            var max = Math.max.call(null,before,after);
            min = this.indexToPos(min);
            max = this.indexToPos(max);
            return [
                this.posToIndex({
                    x : max.x,
                    y : min.y,
                }),
                this.posToIndex({
                    x : min.x,
                    y : max.y,
                }),
            ];
        },
        connectable : function(before,after){
            var _this = this;
            var pos = [];
            var success = false;
            var min = Math.min.call(null,before,after);
            var max = Math.max.call(null,before,after);
            var called = function(dir){
                var i = min;
                var num = dir === 'x' ? pointConfig.col : 1;
                for (;i+=num; i<=max){
                    var current = _this.getItem(i);
                    if (current === _this.getItem(max)){
                        success = true;
                        break;
                    }else if (_this.isEmpty(current)){
                        pos.push(current.index);
                    }else{
                        break;
                    }
                }
            }
            if (this.identicalY(before,after)){
                called('y');
            }else if (this.identicalX(before,after)){
                called('x');
            }
            if (success){
                if (min !== before){
                    pos = pos.reverse();
                }
            }
            return {
                success : success,
                pos : pos,
            }
        },
        directlyConnectable : function(before,after){
            var status = this.connectable(before,after);
            return status;
        },
        onceCorner : function(before,after){
            var _this = this;
            var success = false;
            var pos = [];
            var corners = this.getCorner(before,after);
            corners.forEach(function(el){
                if ( !_this.isEmpty(_this.getItem(el)) || success){
                    return;
                }
                var _status = [
                    _this.connectable(before,el),
                    _this.connectable(el,after),
                ];
                var ok = _status.every(function(status){
                    return status.success;
                });
                if (ok){
                    _status[0].pos.push(el);
                    success = true;
                    pos = _status[0].pos.concat(_status[1].pos);
                }
            });
            return {
                success : success,
                pos : pos,
            };
        },
        twiceCorner : function(before,after){
            var success = false;
            var pos = [];   
            var arounds = this.getAround(before);
            call : for (var i=0; i<arounds.length; i++){
                var j = before;
                while(j+=arounds[i]){
                    var current = this.getItem(j);
                    if (!this.isEmpty(current)){
                        break;
                    }
                    var _status = this.onceCorner(j,after);
                    if (_status.success){
                        success = true;
                        var _pos = this.directlyConnectable(before,j).pos;
                        _pos.push(j);
                        pos = _pos.concat(_status.pos);
                        break call;
                    }
                    if (this.isLimit(j)){
                        break;
                    }
                }
            }
            return {
                success : success,
                pos : pos,
            }
        },
        isConnectable : function(before,after){
            var status = {};
            if (before === after) return false;
            if (!this.isSame(before,after)) return false;
            var calleds = [
                // 直连
                this.directlyConnectable,
                // 一次拐角
                this.onceCorner,
                // 两次拐角
                this.twiceCorner,
            ];
            for (var i=0; i<calleds.length; i++){
                var fn = calleds[i].bind(this);
                status = fn(before,after);
                if (status.success){
                    break;
                }
            }
            return status;
        },
        
        judge : function(before,after, type){
            if(pause) {
                return false;
            }
            var _this = this;
            var status = this.isConnectable(before,after);
            if (status && status.success) {           
                pause = true;
                console.log('true')
                if (true != type && status.pos.length>0){
                    status.pos.unshift(before);
                    status.pos.push(after);
                    this.view.showLine(status.pos,function(){
                        if(storage.getItem("silence") == 'false') {
                            video.biu.play()
                        }
                        _this.removeItem(before,after);
                    });
                } else{
                    this.removeItem(before,after);
                }
                pause = false;
                return true;
            }else{
                return false;
            }
        },

        isOutside : function(index){
            var pos = this.indexToPos(index);
            return (
                pos.x < 0 ||
                pos.y < 0 ||
                pos.x > pointConfig.col-1 ||
                pos.y > pointConfig.row-1
            );
        },

        isLimit : function(index){
            var pos = this.indexToPos(index);
            return (
                pos.x === 0 ||
                pos.y === 0 ||
                pos.x === pointConfig.col-1 ||
                pos.y === pointConfig.row-1
            );
        },

        getItem : function(index){
            if (this.isOutside(index)){
                return {};
            }
            var pos = this.indexToPos(index);
            return data.cell[pos.y][pos.x];
        },

        next: function  () {
            currentPoint ++;
            storage.setItem(global.CURRENT_POINT, currentPoint)
            window.location.reload()
        },
        again: function () {
            window.location.reload()
        }, 
        closeDialog: function() {
            // $(".main-dialog").hide()
            window.location = "/game/checkpoint.html"
        },
        winning: function () {
            win = true
            winpoint ++;
            storage.setItem(global.WIN, winpoint)
            let that = this
            score += data.time * 20
            totalScoreShow += data.time * 20
            $(".current-time").stop()
            if(storage.getItem("silence") == 'false') {
                video.victory.play()
            }
            let props = ["help", "refresh", "boom", "frozen"]
            let props2 = ["tips", "refresh", "boom", "hourglass"]
            let index = Math.floor(Math.random() * 4)
            setTimeout(function () {
                $(".fail-text").hide()
                $(".success-text").show()
                $(".next-point").show()
                $(".dialog-aword").show()
                $(".dialog-score-result").text(totalScoreShow)
                $(".main-dialog").show()
                $(".aword").attr("src", "bg/" + props[index] + ".png")
                if(winpoint % 5 == 0) {
                    let index2 = Math.floor(Math.random() * 4)
                    $(".dialog-aword").html(`<img src="bg/success-aword.png" /><img src="bg/${props2[index2]}.png"/> <img src="bg/add_one.png" />`)
                    that.saveAword(props[index2])
                }
                that.saveScore()
                // that.saveAword(props[index])
            }, 50);
        },
        
        over: function () {
            if(storage.getItem("silence") == 'false') {
                video.fail.play()
            }
            winpoint = 0;
            storage.setItem(global.WIN, 0)
            $(".current-time").stop()
            score = 0;
            $(".fail-text").show()
            $(".success-text").hide()
            $(".next-point").hide();
            $(".dialog-score-result").text(score)
            $(".dialog-aword").hide()
            $(".main-dialog").show()

            this.saveScore()
        },
        saveScore: function (fn) {
            let sucFn = fn || function () {}
            var openId = storage.getItem(global.OPENID)
            api.post({
                url: '/score/save',
                data: JSON.stringify({openId: openId, point: currentPoint, score: score}),
                success: sucFn
            })
        },
        saveAword: function (propType) {
            var openId = storage.getItem(global.OPENID)
            api.post({
                url: '/share/info/save',
                data: JSON.stringify({openId: openId, shareType: propType}),
                success: function (res) {
                    
                }
            })
        },
        checkWinning: function () {
            if(data.time == 0) {
                this.over()
                return 
            }
            if (pointConfig.itemCount === 0) {
                this.winning();
            } else {
                this.checkDeadlock();
            }
        },

        checkDeadlock: function () {
            if(pointConfig.itemCount < 3) {
                return ;
            }
            var count = pointConfig.type;
            var cell = reduceDimension(data.cell);
            var filter = function (i) {
                return cell.filter(function (el) {
                    return el.val === i; 
                });
            };
            for (var i = 0; i < count; i++){
                var result = filter(i);
                var len = result.length;
                for (var j = 0; j < len; j++) {
                    var el = result[j].index;
                    for (var k = 0; k < len; k++){
                        var status = this.isConnectable(el, result[k].index);
                        if (status && status.success) {
                            hlepData = [el, result[k].index];
                            return;
                        }
                    }
                }
            }
            this.randomReset();
        },

        randomReset: function () {
            var _this = this;
            var row = pointConfig.row
            var col = pointConfig.col
            var cell = (function () {
                return reduceDimension(data.cell).filter(function (el) {
                    return el.val !== null; 
                });
            })();
            this.initCell();
            cell.forEach(function (el) {
                while(true){
                    var x = random(1,col - 2);
                    var y = random(1,row - 2);
                    var item = data.cell[y][x];
                    if (item.val === null){
                        data.cell[y][x] = {
                            val: el.val,
                            index: _this.posToIndex({ x: x, y: y }),
                        }
                        break;
                    }
                }
            });
            this.view.init(this, data);
            this.checkDeadlock();
        }
    }


    return Game;

})();