var Game = (function(){
    var continueClick = 0
    var clickTime = 0
    
    var refreshCount = 0
    var helpCount = 0
    var frozenCount = 0
    var boomCount = 0
    
    var timeCooldown = 60
    
    var hlepData = []
    
    var api = new Api()
    var storage = new MyStorage()
    var currentPoint = storage.getItem(global.CURRENT_POINT)
    if (undefined == currentPoint || null == currentPoint) {
        currentPoint = 1;
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
    var active = {
        t: true,
        h: true,
        n: true,
    }
    var boomIndex = 0
    var propType
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
            this.start();
            this.view.initPointText()
            this.view.init(this,data)
            this.view.initProps(helpCount, refreshCount, boomCount, frozenCount);
            this.getMaxScore();
        },

        start : function(){
            this.initCell();
            this.fillCell();
            this.checkDeadlock();
            // this.update();
        },

        updateProp: function() {
            var count = 0
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
                this.randomReset()
                this.view.initProp(config.maxHelpCount.refresh - refreshCount, $(".tips-refresh"))
            } else {
                confirm({title: '', content:'<div style="text-align: center">每日帮助已经达到上限,分享可增加次数</div>', cancelText: '取消', doneText: '去分享'}).then(() => {
                    that.pause()
                    propType = 'refresh'
                }).catch( () => {
                    console.log('cancel')
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
                this.judge.apply(this, hlepData);
                this.view.initProp(config.maxHelpCount.help - helpCount, $(".tips-help"))
            } else {
                confirm({title: '', content:'<div style="text-align: center">每日帮助已经达到上限,分享可增加次数</div>', cancelText: '取消', doneText: '去分享'}).then(() => {
                    that.pause()
                    propType = 'help'
                }).catch( () => {
                    console.log('cancel')
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
                this.startBoom()
            } else {
                confirm({title: '', content:'<div style="text-align: center">每日帮助已经达到上限,分享可增加次数</div>', cancelText: '取消', doneText: '去分享'}).then(() => {
                    that.pause()
                    propType = 'boom'
                }).catch( () => {
                    console.log('cancel')
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
                video.bomb.play()
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
                    $(".best-score-num").text(res.result)
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
                confirm({title: '', content:'<div style="text-align: center">每日帮助已经达到上限,分享可增加次数</div>', cancelText: '取消', doneText: '去分享'}).then(() => {
                    that.pause()
                    propType = 'frozen'
                }).catch( () => {
                    console.log('cancel')
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
            $(".current-time").stop().animate({width: '0px'}, data.time * 1000)
        },
        _update: function () {
            if (data.time == 0 || win || frozen || pause) {
                return
            }
            this.checkWinning()
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
                console.log(data.time)
                continueClick ++
                clickTime = timestamp
                data.time += 1
                // this.view.updateTime(data.time)
                this.startCountDown()
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
            this.view.updateScore(score)
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
                if (true != type && status.pos.length>0){
                    status.pos.unshift(before);
                    status.pos.push(after);
                    this.view.showLine(status.pos,function(){
                        video.biu.play()
                        _this.removeItem(before,after);
                    });
                } else{
                    this.removeItem(before,after);
                }
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
            let that = this
            score += data.time * 20
            $(".time-panel").stop()
            video.victory.play()
            setTimeout(function () {
                $(".fail-text").hide()
                $(".success-text").show()
                $(".next-point").show()
                $(".dialog-aword").show()
                $(".dialog-score-result").text(score)
                $(".main-dialog").show()
                that.saveScore()
            }, 50);
        },
        
        over: function () {
            video.fail.play()
            $(".time-panel").stop()
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
        checkWinning: function () {
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
                    return el.val !== 0 && el.val !== null; 
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