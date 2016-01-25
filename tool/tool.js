function htmlToStr(html) {
    var htmlArr = html.replace(/\\/g, "\\\\").replace(/\\/g, "\\/").replace(/\'/g, "\\\'").replace(/\"/g, "\\\"").split('\n');
    var len = htmlArr.length;
    var outArr = [];
    outArr.push("[");
    for (var index = 0; index < len; index++) {
        var value = htmlArr[index];
        if (value !== "") {
            if (index === len - 1) {
                outArr.push("\"" + value + "\"");
            } else {
                outArr.push("\"" + value + "\",\n");
            }
        }
    }
    outArr.push("].join(\"\");");
    return outArr.join("");
}