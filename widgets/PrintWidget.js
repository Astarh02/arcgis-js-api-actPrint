/// <amd-dependency path = "esri/core/tsSupport/declareExtendsHelper" name = "__extends" />
/// <amd-dependency path = "esri/core/tsSupport/decorateHelper" name = "__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/views/2d/viewpointUtils", "widgets/CircuitCreation/CircuitCreation", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/core/watchUtils", "esri/core/Handles", "esri/Graphic", "esri/geometry/Extent", "esri/geometry/Polygon", "esri/geometry/Point", "esri/Viewpoint", "esri/request", "esri/tasks/PrintTask", "esri/tasks/support/PrintParameters", "esri/tasks/support/PrintTemplate", "esri/layers/GraphicsLayer", "esri/geometry/geometryEngine"], function (require, exports, __extends, __decorate, viewpointUtils, CircuitCreation, decorators_1, Widget, widget_1, watchUtils, Handles_1, Graphic_1, Extent_1, Polygon_1, Point_1, Viewpoint_1, request_1, PrintTask_1, PrintParameters_1, PrintTemplate_1, GraphicsLayer_1, geometryEngine_1) {
    "use strict";
    Handles_1 = __importDefault(Handles_1);
    Graphic_1 = __importDefault(Graphic_1);
    Extent_1 = __importDefault(Extent_1);
    Polygon_1 = __importDefault(Polygon_1);
    Point_1 = __importDefault(Point_1);
    Viewpoint_1 = __importDefault(Viewpoint_1);
    request_1 = __importDefault(request_1);
    PrintTask_1 = __importDefault(PrintTask_1);
    PrintParameters_1 = __importDefault(PrintParameters_1);
    PrintTemplate_1 = __importDefault(PrintTemplate_1);
    GraphicsLayer_1 = __importDefault(GraphicsLayer_1);
    geometryEngine_1 = __importDefault(geometryEngine_1);
    var CSS = {
        base: "print-widget print-container esri-widget",
        headerTitle: "print-widget header-title",
        selection: "print-widget layout-section",
        pageName: "print-widget pageName",
        pageSettings: "print-widget pageSettings",
        countShtamp: "print-widget countShtamp",
        typeTopShtamp: "print-widget typeTopShtamp",
        scale: "print-widget scale",
        angleRotation_range: "print-widget angleRotation-range",
        angleRotation_number: "print-widget angleRotation-number",
        buttonExport: "print-widget buttonExport",
        listLinks: "print-widget list-links"
    };
    var PrintWidget = /** @class */ (function (_super) {
        __extends(PrintWidget, _super);
        function PrintWidget() {
            var _this = _super.call(this) || this;
            _this.defaultAngle = 0;
            _this.handles = new Handles_1.default();
            _this.paramsService = {};
            _this.angleRotationDubble = 0;
            _this.scaleNow = 25000;
            _this.listLinksResults = [];
            _this.resultsContainer = _this.renderList();
            _this.count = 0;
            _this.countElement = 0;
            _this.layoutTabSelected = !0;
            return _this;
        }
        PrintWidget.prototype.postInitialize = function () {
            var _this = this;
            // watchUtils.once(this, "view.extent.center", () => this._ready());
            request_1.default(this.serviceUrl, {
                query: {
                    f: "json"
                },
                responseType: "json"
            }).then(function (response) {
                response.data.parameters.forEach(function (object) {
                    _this.paramsService[object.name] = object;
                });
                _this.pageSettingsList = _this.paramsService["Layout_Template"].choiceList.map(function (element, i) {
                    if (i == 0) {
                        _this.pageSettingsNow = element;
                        return widget_1.tsx("option", { bind: _this, selected: true }, element);
                    }
                    else {
                        return widget_1.tsx("option", { bind: _this }, element);
                    }
                });
                _this.countShtampList = _this.paramsService["count_shtamp"].choiceList.map(function (element, i) {
                    if (i == 0) {
                        _this.countShtampNow = element;
                        return widget_1.tsx("option", { bind: _this, selected: true }, element);
                    }
                    else {
                        return widget_1.tsx("option", { bind: _this }, element);
                    }
                });
                _this.typeTopShtampList = _this.paramsService["top_shtamp"].choiceList.map(function (element, i) {
                    if (i == 0) {
                        _this.typeTopShtampNow = element;
                        return widget_1.tsx("option", { bind: _this, selected: true }, element);
                    }
                    else {
                        return widget_1.tsx("option", { bind: _this }, element);
                    }
                });
            });
            this.graphicsLayer = new GraphicsLayer_1.default({
                id: "print",
                title: "Слой печати",
                visible: true,
            });
            this.map.add(this.graphicsLayer);
            watchUtils.once(this, "view.extent.center", function () {
                var centroid = _this.view.extent.center;
                var sizeY = (_this.scaleNow / 200) * 41.45;
                var sizeX = (_this.scaleNow / 200) * 29;
                var fillSymbol = { type: "simple-fill", color: [0, 0, 0, 0], outline: { color: [0, 255, 0], width: 1 } };
                var polygonGraphic = new Graphic_1.default({
                    geometry: new Polygon_1.default({
                        rings: [
                            [
                                [centroid.x - sizeX, centroid.y + sizeY],
                                [centroid.x + sizeX, centroid.y + sizeY],
                                [centroid.x + sizeX, centroid.y - sizeY],
                                [centroid.x - sizeX, centroid.y - sizeY],
                                [centroid.x - sizeX, centroid.y + sizeY]
                            ]
                        ]
                    }),
                    symbol: fillSymbol
                });
                polygonGraphic.geometry.spatialReference = _this.view.spatialReference;
                _this.graphicsLayer.graphics.add(polygonGraphic);
            });
            this.own([
                this.handles.add([
                    this.view.on("drag", function (e) {
                        var graphic = _this.graphicsLayer.graphics.items[0];
                        var point = new Point_1.default(_this.view.toMap({ x: e.x, y: e.y }));
                        var contains = geometryEngine_1.default.contains(graphic.geometry, point);
                        if (contains) {
                            if (e.action == "start" || e.action == "end") {
                                _this._selectFrame(e);
                            }
                            else if (e.action == "update") {
                                _this._moveFrame(e);
                            }
                        }
                    })
                ])
            ]);
            this.circuitCreation = new CircuitCreation({
                listLinks: [
                    {
                        name: "Purple",
                        alias: "Фиолетовый",
                        color: [128, 0, 128]
                    },
                    {
                        name: "Red",
                        alias: "Красный",
                        color: [255, 0, 0]
                    },
                    {
                        name: "Green",
                        alias: "Зеленый",
                        color: [0, 128, 0]
                    },
                    {
                        name: "Pink",
                        alias: "Розовый",
                        color: [255, 192, 203]
                    },
                    {
                        name: "Orange",
                        alias: "Оранжевый",
                        color: [255, 165, 0]
                    },
                    {
                        name: "Yellow",
                        alias: "Желтый",
                        color: [255, 255, 0]
                    },
                    {
                        name: "Lime",
                        alias: "Лайм",
                        color: [0, 255, 0]
                    }
                ],
                map: this.map,
                view: this.view
            });
            this.circuitElements = widget_1.tsx("div", { bind: this }, this.circuitCreation.render());
        };
        PrintWidget.prototype.render = function () {
            var _this = this;
            var pageName = (widget_1.tsx("div", { bind: this, class: "print-widget formation" },
                widget_1.tsx("label", { bind: this, class: "print-widget labelFormation" }, "Название"),
                widget_1.tsx("input", { bind: this, class: CSS.pageName, placeholder: "Название", type: "text", oninput: function (event) {
                        _this.titlePageNow = event.target.value;
                    } })));
            var pageSettings = (widget_1.tsx("div", { bind: this, class: "print-widget formation" },
                widget_1.tsx("label", { bind: this, class: "print-widget labelFormation" }, "Параметры страницы"),
                widget_1.tsx("select", { bind: this, class: CSS.pageSettings, onchange: function (event) {
                        _this.pageSettingsNow = event.target.value;
                        if (event.target.value == "А4 портрет") {
                            _this.angleRotationDubble = 0;
                            _this.rotate(_this.angleRotationDubble);
                        }
                        else if (event.target.value == "А4 альбом") {
                            _this.angleRotationDubble = 90 || -90;
                            _this.rotate(_this.angleRotationDubble);
                        }
                    } }, this.pageSettingsList)));
            var countShtamp = (widget_1.tsx("div", { bind: this, class: "print-widget formation" },
                widget_1.tsx("label", { bind: this, class: "print-widget labelFormation" }, "Количество подписантов"),
                widget_1.tsx("select", { bind: this, class: CSS.countShtamp, onchange: function (event) {
                        _this.countShtampNow = event.target.value;
                    } }, this.countShtampList)));
            var typeTopShtamp = (widget_1.tsx("div", { bind: this, class: "print-widget formation" },
                widget_1.tsx("label", { bind: this, class: "print-widget labelFormation" }, "Тип верхнего штампа"),
                widget_1.tsx("select", { bind: this, class: CSS.typeTopShtamp, onchange: function (event) {
                        _this.typeTopShtampNow = event.target.value;
                    } }, this.typeTopShtampList)));
            var scale = (widget_1.tsx("div", { bind: this, class: "print-widget formation" },
                widget_1.tsx("label", { bind: this, class: "print-widget labelFormation" }, "Установить масштаб"),
                widget_1.tsx("input", { bind: this, class: CSS.scale, type: "number", min: "0", value: this.scaleNow, oninput: function (event) {
                        _this.scaleNow = event.target.value;
                    } })));
            var angleRotation = (widget_1.tsx("div", { bind: this, class: "print-widget formation" },
                widget_1.tsx("label", { bind: this, class: "print-widget labelFormation" }, "Поворот области печати"),
                widget_1.tsx("div", { bind: this, class: "angleRotation-range-container" },
                    widget_1.tsx("input", { bind: this, class: CSS.angleRotation_range, type: "range", min: "-90", max: "90", value: this.angleRotationDubble, step: "1", oninput: function (event) {
                            this.angleRotationDubble = event.target.value;
                            this.rotate(this.angleRotationDubble);
                        } })),
                widget_1.tsx("input", { bind: this, class: CSS.angleRotation_number, type: "number", min: "-90", max: "90", value: this.angleRotationDubble, step: "1", oninput: function (event) {
                        this.angleRotationDubble = event.target.value;
                        this.rotate(this.angleRotationDubble);
                    } })));
            var headerTitle = (widget_1.tsx("header", { bind: this, class: CSS.headerTitle }, "Экспорт"));
            var tabLinks = (widget_1.tsx("div", { bind: this, class: "printwidget tab-list-links" },
                widget_1.tsx("button", { bind: this, class: "print-widget tab-link-action", onclick: function (event) { _this._toggleLayoutPanel(event); } }, "Компоновка"),
                widget_1.tsx("button", { bind: this, class: "print-widget tab-link", onclick: function (event) { _this._toggleLayoutPanel(event); } }, "Сети")));
            this.printElements = widget_1.tsx("div", { bind: this },
                pageName,
                pageSettings,
                countShtamp,
                typeTopShtamp,
                scale,
                angleRotation);
            var section = (widget_1.tsx("section", { bind: this, class: CSS.selection }, this.elementWidget = this.layoutTabSelected ? this.printElements : this.circuitElements));
            var buttonExport = (widget_1.tsx("div", { bind: this, class: CSS.buttonExport, onclick: function () { _this._print(); } }, "Экспорт"));
            var listLinks = (widget_1.tsx("div", { bind: this, class: CSS.listLinks },
                widget_1.tsx("h3", { bind: this, class: "print-widget" }, "Экспортированные файлы"),
                this.resultsContainer));
            var base = (widget_1.tsx("div", { bind: this, class: CSS.base },
                headerTitle,
                tabLinks,
                section,
                buttonExport,
                listLinks));
            return base;
        };
        PrintWidget.prototype.renderList = function () {
            var _this = this;
            if (this.listLinksResults.length == 0) {
                return widget_1.tsx("div", { bind: this, class: "print-widget default-result" }, "\u0412\u0430\u0448\u0438 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u043A\u0430\u0440\u0442\u044B \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C.");
            }
            else {
                return this.listLinksResults.map(function (link) {
                    return widget_1.tsx("div", { bind: _this, key: link.count, class: "print-widget link-container" },
                        widget_1.tsx("a", { bind: _this, class: link.className, href: link.url, name: link.title, target: "_blank" },
                            widget_1.tsx("div", { bind: _this, class: "print-widget link-loader" }),
                            widget_1.tsx("span", { bind: _this, class: "print-widget link-title" }, link.title)));
                });
            }
        };
        PrintWidget.prototype._toggleLayoutPanel = function (event) {
            for (var i = 0; i < event.target.parentElement.children.length; i++) {
                event.target.parentElement.children[i].className = "print-widget tab-link";
            }
            event.target.className = "print-widget tab-link-action";
            if (event.target.innerText == "Компоновка") {
                this.layoutTabSelected = true;
            }
            else if (event.target.innerText == "Сети") {
                this.layoutTabSelected = false;
            }
        };
        PrintWidget.prototype._selectFrame = function (e) {
            var graphic = this.graphicsLayer.graphics.items[0];
            var fillSymbol;
            if (e.action == "start") {
                fillSymbol = { type: "simple-fill", color: null, outline: { color: [255, 0, 0], width: 1 } };
                graphic.symbol = fillSymbol;
            }
            else if (e.action == "end") {
                fillSymbol = { type: "simple-fill", color: null, outline: { color: [0, 255, 0], width: 1 } };
                graphic.symbol = fillSymbol;
            }
        };
        PrintWidget.prototype._moveFrame = function (e) {
            e.stopPropagation();
            var point = new Point_1.default(this.view.toMap({ x: e.x, y: e.y }));
            var graphic = this.graphicsLayer.graphics.items[0];
            if (!graphic && !point)
                return;
            var dx = point.x - graphic.geometry.centroid.x;
            var dy = point.y - graphic.geometry.centroid.y;
            var rings = graphic.geometry.rings[0].map(function (vertex) {
                return [
                    vertex[0] + dx,
                    vertex[1] + dy
                ];
            });
            var frameGraphic = new Polygon_1.default({ rings: [rings] });
            frameGraphic.spatialReference = this.view.spatialReference;
            graphic.geometry = frameGraphic;
        };
        PrintWidget.prototype._print = function () {
            var _this = this;
            var printTask = new PrintTask_1.default({
                url: this.serviceUrl
            });
            var printTemplate = new PrintTemplate_1.default({
                format: this.paramsService["Format"].defaultValue,
                layout: this.pageSettingsNow,
                outScale: this.scaleNow,
                layoutOptions: {
                    titleText: this.titlePageNow || "Без заголовка"
                }
            });
            printTemplate["countShtamp"] = this.countShtampNow;
            printTemplate["topShtamp"] = this.typeTopShtampNow;
            printTemplate["rotation"] = this.angleRotationDubble;
            var viewPoint = new Viewpoint_1.default({
                scale: this.scaleNow,
                targetGeometry: this.graphicsLayer.graphics.items[0].geometry
            });
            var sizeView = this.get("view.size");
            var viewPointUtils = viewpointUtils.getExtent(new Extent_1.default, viewPoint, sizeView);
            var params = new PrintParameters_1.default({
                view: this.view,
                template: printTemplate,
                extraParameters: {
                    count_shtamp: this.countShtampNow,
                    top_shtamp: this.typeTopShtampNow,
                    rotation: this.angleRotationDubble
                }
            });
            params["extent"] = viewPointUtils;
            var fullName;
            if (printTemplate.layoutOptions.titleText == "Без заголовка") {
                fullName = printTemplate.layoutOptions.titleText + "(" + this.count + ")." + printTemplate.format;
                this.count++;
            }
            else {
                fullName = printTemplate.layoutOptions.titleText + "." + printTemplate.format;
            }
            var newLinkObject = {
                url: "",
                title: fullName,
                count: this.countElement,
                className: "print-widget link-container--loading"
            };
            this.countElement++;
            this.listLinksResults.push(newLinkObject);
            printTask.execute(params).then(function (response) {
                var link = _this.listLinksResults[newLinkObject.count];
                link.url = response.url;
                link.className = "print-widget link-container--ready";
                _this.resultsContainer = _this.renderList();
            }, function (error) {
                var link = _this.listLinksResults[newLinkObject.count];
                link.className = "print-widget link-container--error";
                _this.resultsContainer = _this.renderList();
            });
            this.resultsContainer = this.renderList();
        };
        PrintWidget.prototype.rotate = function (value) {
            var graphic = this.graphicsLayer.graphics.items[0];
            var rotateAngle = -(value - this.defaultAngle);
            var cosAngle = Math.cos(rotateAngle * Math.PI / 180), sinAngle = Math.sin(rotateAngle * Math.PI / 180);
            graphic.geometry.rings[0] = graphic.geometry.rings[0].map(function (vertex) {
                var dx = vertex[0] - graphic.geometry.centroid.x;
                var dy = vertex[1] - graphic.geometry.centroid.y;
                return [
                    dx * cosAngle - dy * sinAngle + graphic.geometry.centroid.x,
                    dx * sinAngle + dy * cosAngle + graphic.geometry.centroid.y
                ];
            });
            var frameGraphic = new Polygon_1.default({ rings: graphic.geometry.rings });
            frameGraphic.spatialReference = this.view.spatialReference;
            this.graphicsLayer.graphics.items[0].geometry = frameGraphic;
            this.defaultAngle = value;
        };
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "map", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "handles", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "serviceUrl", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "graphicsLayer", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "polygonGraphic", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "paramsService", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], PrintWidget.prototype, "pageSettingsList", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], PrintWidget.prototype, "countShtampList", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], PrintWidget.prototype, "typeTopShtampList", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], PrintWidget.prototype, "angleRotationDubble", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "titlePageNow", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "pageSettingsNow", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "countShtampNow", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "typeTopShtampNow", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "scaleNow", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], PrintWidget.prototype, "listLinksResults", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], PrintWidget.prototype, "resultsContainer", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "count", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "countElement", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], PrintWidget.prototype, "circuitCreation", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], PrintWidget.prototype, "printElements", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], PrintWidget.prototype, "circuitElements", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], PrintWidget.prototype, "elementWidget", void 0);
        __decorate([
            decorators_1.property()
        ], PrintWidget.prototype, "layoutTabSelected", void 0);
        PrintWidget = __decorate([
            decorators_1.subclass("esri.widgets.PrintWidget")
        ], PrintWidget);
        return PrintWidget;
    }(decorators_1.declared(Widget)));
    return PrintWidget;
});
//# sourceMappingURL=PrintWidget.js.map