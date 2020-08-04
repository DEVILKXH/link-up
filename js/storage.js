let MyStorage = (function (){
    let storage = function () {

    }

    storage.prototype = {
        setItem: (key, value) => {
            localStorage.setItem(key, value)
        },
        removeItem: key => {
            localStorage.removeItem(key)
        },
        getItem: key => {
            return localStorage.getItem(key)
        },
        clearStorage: () => {
            localStorage.clear()
        }
    }

    return storage
})()