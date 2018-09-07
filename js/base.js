function left(page) {
    $("#learn-sider").html(need("./templete/left.html!text"));
    $("[data-index =\"" + page + "\"]").addClass("active");
    $("#learn-sider").on("click", "li", function () {
        window.location.href = $(this).attr("data-index") + ".html";
    })
}
