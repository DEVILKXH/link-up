var Game = (function(){
    var continueClick = 0
    var clickTime = 0
    
    var refreshCount = 0
    var helpCount = 0
    
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
    var score = 0
    var active = {
        t: true,
        h: true,
        n: true,
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
        },

        init : function(){
            this.start();
            this.view.init(this,data);
            this.getMaxScore();
        },

        start : function(){
            this.initCell();
            this.fillCell();
            this.checkDeadlock();
            // this.update();
        },

        restart: function () {
            location.reload();  
        },

        
        refresh: function () {
            if (helpCount < config.maxHelpCount){
                helpCount ++
                this.randomReset()
            } else {
                alert({title: '', content: '<div style="text-align: center">每日刷新已经达到上限</div>'})
            }
        },
        
        help: function () {
            if (helpCount < config.maxHelpCount){
                helpCount ++
                this.judge.apply(this, hlepData);
            } else {
                alert({title: '', content:'<div style="text-align: center">每日帮助已经达到上限</div>'})
            }
        },

        boom: function () {
            if (helpCount < config.maxHelpCount){
                helpCount ++
                hlepData.push(true)
                this.judge.apply(this, hlepData);
            } else {
                alert({title: '', content:'<div style="text-align: center">每日帮助已经达到上限</div>'})
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
            frozen = true
            $(".current-time").stop()
            var offset = $("#frozen").offset()
            var offset2 = $(".current-time").offset()
            var dot = offset.top * offset2.top + offset.left * offset2.left
            var det = offset.left * offset2.top + offset.top * offset2.left
            var angle = Math.floor(Math.atan2(det, dot) / Math.PI * 180) - 10
            $(".frozen-move").offset(offset).css("transform", "rotate(-"+ angle +"deg)").fadeIn()
            this.move()
        },
        move: function () {
            var offset = $(".current-time").offset()
            let that = this
            $(".frozen-move").animate({top: Math.floor(offset.top) + 'px', left: Math.floor(offset.left) + 'px'}, 1000, "linear", function () {
                that.stop()
            })
        },
        
        pause: function () {
            $("#pause").hide();
            $("#start").show();
            $(".current-time").stop()
            frozen = true
        },

        
        startGame: function () {
            $("#pause").show();
            $("#start").hide();
            frozen = false
            this.update()
        },


        stop: function () {
            $(".frozen-move").fadeOut().removeClass("active")
            let that = this
            setTimeout(function () {
                frozen = false
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
            if (data.time == 0 || win || frozen) {
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
            pointConfig.itemCount -= 2;
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
            var _this = this;
            var status = this.isConnectable(before,after);
            if (status && status.success) {           
                if (true != type && status.pos.length>0){
                    status.pos.unshift(before);
                    status.pos.push(after);
                    this.view.showLine(status.pos,function(){
                        _this.removeItem(before,after);
                    });
                }else{
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
            $(".main-dialog").hide()
        },
        winning: function () {
            win = true
            let that = this
            score += data.time * 20
            $(".time-panel").stop()

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