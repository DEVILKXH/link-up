var View = (function(){

    var container = $$('.container')[0];
    var gridContainer = $$('.grid-container')[0];
    var timeDom = $$('.time')[0];
    var clickDom = $$(".continue-click")[0];
    var countTimeDom = $$(".time-panel")[0]

    var game = null;
    var api = new Api()
    var storage = new MyStorage()
    var openId = storage.getItem(global.OPENID)
    var currentPoint = storage.getItem(global.CURRENT_POINT)
    var level, totalTime
    var pause = false
    
    if (undefined == currentPoint || null == currentPoint) {
        currentPoint = 1;
    }
    level = ALLPOINTS.data[currentPoint - 1]
    totalTime = level.time

    var View = function(){ };

    View.prototype = {

        init : function(g,data){
            game = g;
            // this.updateTime(data.time);
            this.initGrid(data.cell);
        },
        initPointText: function() {
            let  r = currentPoint % 10;
            let html = `<img src="bg/point-${r}.png" class='current-point-text' />`;
            if(currentPoint > 9) {
                r = parseInt(currentPoint / 10);
                html = `<img src="bg/point-${r}.png" class='current-point-text' />` + html;
            }
            html = `<img src="bg/point-text-first.png" class='point-text'/>` + html + `<img src="bg/point-text-end.png" class='point-text'/>`;
            $(".current-point").append(html)
        },
        initProps:  function (helpCount, refreshCount, boomCount, frozenCount) {
            this.initProp(config.maxHelpCount.help - helpCount, $(".tips-help"))
            this.initProp(config.maxHelpCount.refresh - refreshCount, $(".tips-refresh"))
            this.initProp(config.maxHelpCount.boom - boomCount, $(".tips-boom"))
            this.initProp(config.maxHelpCount.frozen - frozenCount, $(".tips-frozen"))
        },
        initProp:  function (count, $obj) {
            $obj.text(count)
        },
        updateScore: function (score) {
            $(".current-score").text(score);
        },
        updateTime: function (time, continueClick) {
            timeDom.innerHTML = time;
            if (continueClick != undefined) {
                clickDom.innerHTML = continueClick + '连击'
            } else {
                clickDom.innerHTML = ''
            }
        },

        itemHTML : function(el){
            var empty = el.val === null;
            var img = config.imgByName(empty ? 0 : el.val);
            return (
                `<div class="grid-item ${empty ? 'hidden' : ''}" 
                    data-val="${el.val}"
                    data-index="${el.index}">
                 <div class="grid-item-content">
                    ${img}
                 </div>
                    ${config.itemDirectionHTML}
                </div>`
            );
            
        },

        initGrid : function(cell){
            var _this = this;
            var html = "";
            cell.forEach(function(arr){
                html += "<div class='grid-cell'>";
                arr.forEach(function(el){
                    html += _this.itemHTML(el);
                });
                html += '</div>';
            });
            gridContainer.innerHTML = html;
        },

        itemAction : function(item){
            item.classList.add('action');
        },
        itemCancelAction : function(item){
            item.classList.remove('action');
        },

        removeItem : function(index){
            var item = $$(`.grid-item[data-index="${index}"]`)[0];
            item.classList.add('hidden');
        },

        getRelationship : function(prev,next,current){
            var dir = [];
            var max = [
                prev > current,
                next > current
            ];
            var arr = [prev,next];
            arr.forEach(function(el,index){
                if (game.identicalY(el,current)){
                    dir[index] = max[index] ? 'right' : 'left';
                }else if (game.identicalX(el,current)){
                    dir[index] = max[index] ? 'down' : 'up';
                }
            });
            return dir;
        },

        showLine : function(pos,callback){
            var _this = this;
            pos.forEach(function(el,index){
                if (index === 0) return;
                if (index === pos.length-1) return;
                var item = $$(`.grid-item[data-index="${el}"] .grid-item-direction`)[0];
                var prev = pos[index-1];
                var next = pos[index+1];
                var dir = _this.getRelationship(prev,next,el);
                item.classList.add(dir[0],dir[1]);
            });
            setTimeout(function(){
                _this.clearLine();
                callback();
            },300);
        },

        clearLine : function(){
            var items = $$('.grid-item-direction');
            items.forEach(function(el){
                el.classList.remove('up','down','left','right');
            });
        },
        initPoint: function () {
            
            api.post({
                url: '/point/getCurrentPoint',
                data: JSON.stringify({openId: openId}),
                success: response => {
                    let len = ALLPOINTS.data.length
                    for (let i = 0; i < response.result + 1 && i < len; i ++) {
                        let activeHtml = `<div class="point-block point-active" data-index="${i + 1}"> <div class="point-number">${i + 1}</div> </div>`
                        $(".point-list").append(activeHtml);
                    }
                    for (let i = response.result + 1; i < len; i ++) {
                        let unActiveHtml = `<div class="point-block point-not-active"> <div class="point-bg"> <img src="bg/lock.png"> </div> </div>`
                        $(".point-list").append(unActiveHtml);
                    }
                }
            })
        }

    };


    return View;

})();
