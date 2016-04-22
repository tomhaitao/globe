/**
 * Created by vision on 16/4/7.
 */
var webSocket;
var earth;
$(function () {
    var logos = {};
    var $eventList = $(".detail-4");
    var innerHeight = $(document).height();
    var offsetTop = $(".detail-2")[0].offsetTop;
    var maxHeight = innerHeight - offsetTop - 105;

    $(".detail-2").css("height", maxHeight + "px");

    //累计事件数
    var eventCount = 10023;
    var todayEventCount = 5;

    earth = new Earth($("#webgl-canvas")[0], {antialias: true});

    var metrics = {
        up: {
            color: "38b349"
        },
        down: {
            color: "ed1c24"
        }
    };

    $(".detail-4").delegate(".event .left", "click", function () {
        var id = $(this).closest(".event").data("id");
        var logo = logos[id];
        earth.geocam.coord_target[0] = logo.longitude;
        earth.geocam.coord_target[1] = logo.latitude;
    });
    /**
     * 填充
     * @param number
     * @param length
     * @returns {string}
     */
    function pad(number, length) {
        return new Array((length || 2) + 1 - String(number).length).join(0) + number;
    }

    function addEvent(name, type, id) {
        var time = new Date();
        var timeString = pad(time.getHours()) + ":" + pad(time.getMinutes()) + ":" + pad(time.getSeconds());

        var $event = $('<div class="clearfix event ' + type + '" data-id="' + id + '"><a><div class="left">' + name + '</div> <div class="right">' + timeString + '<i class="arrow"></i></div></a></div>');
        var color = metrics[type].color;
        $event.find(".left").css("color", "#" + color);

        $eventList.find("h5").after($event);

        eventCount++;
        todayEventCount++;
        $("#event-num").text(eventCount);
        $("#today-event-num").text(todayEventCount);

        if ($(".detail-4").height() > maxHeight) {
            $eventList.find(".event:last").remove();
        }
    }

    if (MAP_OPTIONS.metrics && MAP_OPTIONS.metrics.up && MAP_OPTIONS.metrics.down) {
        earth.registerMetric(MAP_OPTIONS.metrics);
        metrics = {
            up: {
                color: MAP_OPTIONS.metrics.up.color
            },
            down: {
                color: MAP_OPTIONS.metrics.down.color
            }
        }
    }

    earth.render();
    earth.resize();

    if (MAP_OPTIONS.api) {

        if (MAP_OPTIONS.api.getInfo) {
            earth.logo.addLogo({
                coord: [115.2529, 39.542, 0],
                name: "北京",
                id: 233
            });
            earth.logo.addLogo({
                coord: [114.26, 38.03, 0],
                name: "石家庄",
                id: 109
            });
            earth.logo.addLogo({
                coord: [106.33, 29.34, 0],
                name: "重庆",
                id: 3
            });
            $.getJSON(MAP_OPTIONS.api.getInfo, function (ret) {
                var num = 0;
                logos = ret;

                $.each(ret, function (id, logo) {
                    if (id != "001") {
                        earth.logo.addLogo({
                            coord: [logo.longitude, logo.latitude, 0],
                            name: logo.hospitalName,
                            id: logo.hospitalID
                        });
                    }

                    num++;
                });
                $("#event-num").text(eventCount);
                $("#today-event-num").text(todayEventCount);
                $("#hospita-num").text(num);
            });
        }
      
    }

    $(function () {
        //控制按钮
        /**
         * 绑定控制按钮的鼠标移动和离开效果
         */
        $("#controls > li > a").each(function () {
            var $li = $(this).closest("li"),
                $label = $(".label", $li),
                $label_arrow = $(".label-arrow", $li),
                $label_text = $(".label-text", $label);

            $(this).on("mouseenter", function (e) {

                $label_arrow.fadeIn(250);
                $label.stop(true, true);
                $label_arrow.stop(true, true);
                $label.animate({
                    width: parseInt($label_text.innerWidth()) + "px",
                    right: -1 * parseInt($label_text.innerWidth()) + "px"
                }, {duration: 250});
            });
            $(this).on("mouseleave", function () {
                $label.animate({width: "0px", right: "0px"}, {});
                $label_arrow.fadeOut(250, function () {
                })
            })
        });
        /**
         * 切换地球类型
         */
        $("#controls > li.map-type > a").click(function () {
            $(this).closest(".map-type").toggleClass("plane");
            earth.toggleViewModel();
        });
        /**
         * 地球缩小
         */
        $("#controls > li.map-zoom-in > a").click(function () {
            earth.zoomIn();
        });
        /**
         * 地球放大
         */
        $("#controls > li.map-zoom-out > a").click(function () {
            earth.zoomOut();
        });

    });
});