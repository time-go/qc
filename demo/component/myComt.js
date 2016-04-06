exports = function (element, name, data) {
    element.innerHTML = require("myComt.html!text");
    qc.view(name, function (vm, ve) {
        vm.name = data;
    })
}
