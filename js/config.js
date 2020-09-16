
var config = (function(){
    var maxHelpCount = {
        refresh: 1,
        frozen: 1,
        boom: 1,
        help: 1,
    };
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
        maxHelpCount: maxHelpCount,
        imgByName : imgByName,
        itemDirectionHTML: itemDirectionHTML,
    }
})();