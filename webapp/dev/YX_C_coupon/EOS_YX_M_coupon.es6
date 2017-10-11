let api = (() => {
    var num = () => {
        console.log(123);
    }
    var other = () => {
        console.log('extra');
    }
    return {
        num: num
    }
})();

window.api = api;