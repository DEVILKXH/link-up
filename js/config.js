
var config = (function(){
    const levelPoint = [
        {repeat: 2, type: 4, time: 20}, {repeat: 2, type: 5, time: 20}, {repeat: 2, type: 6, time: 20}, {repeat: 2, type: 7, time: 20},
        {repeat: 2, type: 8, time: 22}, {repeat: 4, type: 4, time: 22}, {repeat: 2, type: 9, time: 22}, {repeat: 4, type: 5, time: 20},
        {repeat: 2, type: 10, time: 24}, {repeat: 2, type: 11, time: 24}, {repeat: 4, type: 6, time: 24}, {repeat: 6, type: 4, time: 24},
        {repeat: 2, type: 12, time: 26}, {repeat: 2, type: 13, time: 26}, {repeat: 4, type: 7, time: 26}, {repeat: 6, type: 5, time: 26},
        {repeat: 8, type: 4, time: 28}, {repeat: 4, type: 8, time: 28}, {repeat: 6, type: 6, time: 28}, {repeat: 4, type: 9, time: 28},
        {repeat: 8, type: 5, time: 30}, {repeat: 4, type: 10, time: 30}, {repeat: 6, type: 7, time: 30}, {repeat: 4, type: 30, time: 30}, 
        {repeat: 8, type: 6, time: 32}, {repeat: 6, type: 8, time: 32}, {repeat: 4, type: 12, time: 32}, {repeat: 4, type: 13, time: 32},
        {repeat: 6, type: 9, time: 34}, {repeat: 8, type: 7, time: 34}, {repeat: 6, type: 10, time: 34}, {repeat: 8, type: 8, time: 34},
        {repeat: 6, type: 11, time: 36}, {repeat: 8, type: 9, time: 36}, {repeat: 6, type: 12, time: 36}, {repeat: 6, type: 13, time: 36}, 
        {repeat: 8, type: 10, time: 38}, {repeat: 6, type: 14, time: 38}, {repeat: 8, type: 11, time: 38}, {repeat: 8, type: 12, time: 38}
    ]
    var objectCount = 14;
    var row = 10
    var col = 7
    var maxHelpCount = 30;
    var maxRefreshCount = 3;
    var time = 120;
    var imgUrl = "./img/";
    var imgExtension = ".png";
    var imgByName = function (name) {
        var src = imgUrl + name + imgExtension;
        return `<img draggable="false" src="${src}"></img>`;
    }

    var itemDirectionHTML = ` <div class="grid-item-direction">
                                    <div class="y up"></div>
                                    <div class="y down"></div>
                                    <div class="x left"></div>
                                    <div class="x right"></div>
                              </div>`;

    return {
        row: row,
        col: col,
        levelPoint: levelPoint,
        maxRefreshCount: maxRefreshCount,
        maxHelpCount: maxHelpCount,
        objectCount : objectCount,
        imgByName : imgByName,
        itemDirectionHTML: itemDirectionHTML,
        time : time,
        maxHelpCount: maxHelpCount
    
    }
})();