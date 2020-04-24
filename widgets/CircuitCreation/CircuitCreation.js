/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/geometry/geometryEngineAsync", "esri/tasks/IdentifyTask", "esri/tasks/support/IdentifyParameters", "dojo/promise/all"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, widget_1, GraphicsLayer_1, Graphic_1, geometryEngineAsync_1, IdentifyTask_1, IdentifyParameters_1, all_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    GraphicsLayer_1 = __importDefault(GraphicsLayer_1);
    Graphic_1 = __importDefault(Graphic_1);
    geometryEngineAsync_1 = __importDefault(geometryEngineAsync_1);
    IdentifyTask_1 = __importDefault(IdentifyTask_1);
    IdentifyParameters_1 = __importDefault(IdentifyParameters_1);
    all_1 = __importDefault(all_1);
    var CSS = {
        base: "circuitCreation-tabs-list esri-widget",
        contentBar: "circuitCreation-content-bar",
        tabContent: "circuitCreation-tab-content",
        input: "circuitCreation-input-family",
        fieldSet: "circuitCreation-fieldset-family",
        legend: "circuitCreation-legend-title",
        sketch: "circuitCreation-sketch-family",
        elements: "circuitCreation-elements-amount",
        tabBar: "circuitCreation-tab-bar",
        tabs: "circuitCreation-tabs",
        tabLinks: "circuitCreation-tab-links",
        title: "circuitCreation-layer-title",
        span: "circuitCreation-links-color",
        addTab: "circuitCreation-add-tab",
        addSignature: "circuitCreation-add-signature"
    };
    var CircuitCreation = /** @class */ (function (_super) {
        __extends(CircuitCreation, _super);
        function CircuitCreation() {
            var _this = _super.call(this) || this;
            _this.CircuitLayer = null;
            _this.indicateLayerLength = {};
            _this.arrayLinks = [];
            _this.arrayContent = [];
            _this.listLayers = [];
            return _this;
        }
        CircuitCreation.prototype.postInitialize = function () {
            this.ready();
        };
        CircuitCreation.prototype.render = function () {
            //-------------------------------PatternLinks
            var addSignature = (widget_1.tsx("div", { bind: this, class: CSS.addSignature, id: CSS.addSignature, onclick: function () { this.signature(event); } }));
            var tabs = (widget_1.tsx("div", { bind: this, class: CSS.tabs, id: CSS.tabs }, this.arrayLinks));
            var tabBar = (widget_1.tsx("div", { bind: this, class: CSS.tabBar },
                tabs,
                addSignature));
            //-------------------------------PatternContent
            var contentBar = (widget_1.tsx("div", { bind: this, class: CSS.contentBar }, this.arrayContent));
            //-------------------------------
            var base = (widget_1.tsx("div", { bind: this, class: CSS.base, id: CSS.base },
                contentBar,
                tabBar));
            return base;
        };
        CircuitCreation.prototype.ready = function () {
            var inClass = this;
            this.listLinks.forEach(function (element) {
                var CircuitLayer = new GraphicsLayer_1.default({
                    listMode: "hide",
                    id: element["name"],
                    title: "_",
                    visible: true
                });
                inClass.map.add(CircuitLayer);
            });
            //-------------------------------------------------------------------
            var names = this.listLinks.map(function (object) {
                return object.name;
            });
            this.listLayers = this.map.layers["items"].filter(function (layer) {
                var a = names.some(function (id) { return id == layer.id; });
                if (a == true)
                    return layer;
            });
            //-----------------------------------------------------------------------
            this.signatureLayer = new GraphicsLayer_1.default({
                listMode: "hide",
                id: "signature",
                title: "Signature",
                visible: true
            });
            this.map.add(this.signatureLayer);
            this.listLinks.forEach(function (element) {
                inClass.indicateLayerLength[element["name"]] = 0;
            });
            this.addLinks();
        };
        CircuitCreation.prototype.open = function (event) {
            if (event.target.className == CSS.tabLinks) {
                var i, tabcontent, tablinks;
                tabcontent = document.getElementsByClassName(CSS.tabContent);
                for (i = 0; i < tabcontent.length; i++) {
                    tabcontent[i]["style"].display = "none";
                }
                tablinks = document.getElementsByClassName(CSS.tabLinks);
                for (i = 0; i < tablinks.length; i++) {
                    tablinks[i].className = tablinks[i].className.replace(" active", "");
                }
                document.getElementById(event.target.id).style.display = "block";
                event.currentTarget.className += " active";
            }
            else if (event.target.className == CSS.tabLinks + " active") {
                var i, tabcontent, tablinks;
                tabcontent = document.getElementsByClassName(CSS.tabContent);
                for (i = 0; i < tabcontent.length; i++) {
                    tabcontent[i]["style"].display = "none";
                }
                tablinks = document.getElementsByClassName(CSS.tabLinks + " active");
                for (i = 0; i < tablinks.length; i++) {
                    tablinks[i].className = tablinks[i].className.replace(" active", "");
                }
                document.getElementById(event.target.id).style.display = "none";
                event.currentTarget.className += "";
            }
        };
        CircuitCreation.prototype.addGraphic = function (event, valueColor, name) {
            var inClass = this;
            var polygonGraphic;
            var rectangleGraphic;
            var blurGraphic;
            var action = event.target.id;
            var rings = [];
            // let layer = function() {
            //     let a = inClass.map.layers["items"];
            //     let layer;
            //     for (let i = 0; i < a.length; i++) {
            //         if (a[i].id == name) {
            //             layer = a[i];
            //         }
            //     }
            //     return layer;
            // }
            //----------------------------------------------------------------------------------
            function layer() {
                for (var i = 0; i < inClass.listLayers.length; i++) {
                    if (inClass.listLayers[i].id == name)
                        return inClass.listLayers[i];
                }
            }
            //--------------------------------------------------------------------------------------
            this.CircuitLayer = layer();
            if (inClass.drag != undefined) {
                inClass.drag.remove();
                inClass.drag = undefined;
            }
            ;
            if (inClass.dblclick != undefined) {
                inClass.dblclick.remove();
                inClass.dblclick = undefined;
            }
            ;
            if (inClass.click != undefined) {
                inClass.click.remove();
                inClass.click = undefined;
            }
            ;
            if (inClass.move != undefined) {
                inClass.move.remove();
                inClass.move = undefined;
            }
            switch (event.target.id) {
                case "addPoint":
                    inClass.click = this.view.on("click", function (event) {
                        inClass.identify(event.mapPoint, action, valueColor, name);
                        inClass.click.remove();
                        inClass.click = undefined;
                    });
                    break;
                case "addPolygon":
                    rings = [];
                    polygonGraphic = null;
                    var graphMove_1 = [];
                    event.stopPropagation();
                    inClass.click = this.view.on("click", function (event) {
                        var a = [event.mapPoint.x, event.mapPoint.y];
                        graphMove_1.push(a);
                        inClass.CircuitLayer.graphics.remove(polygonGraphic);
                        inClass.CircuitLayer.graphics.add(polygonGraphic);
                    });
                    inClass.move = inClass.view.on("pointer-move", function (pointer) {
                        inClass.CircuitLayer.graphics.remove(polygonGraphic);
                        var map = inClass.view.toMap({ x: pointer.x, y: pointer.y });
                        graphMove_1.push([map.x, map.y]);
                        var polygon = { type: "polygon", rings: graphMove_1 };
                        var fillSymbol = { type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: { color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5 } };
                        polygonGraphic = new Graphic_1.default({ geometry: polygon, symbol: fillSymbol });
                        polygonGraphic.geometry.spatialReference = inClass.view.spatialReference;
                        inClass.CircuitLayer.graphics.add(polygonGraphic);
                        graphMove_1.splice(graphMove_1.length - 1, 1);
                    });
                    inClass.dblclick = this.view.on("double-click", function (event) {
                        event.stopPropagation();
                        inClass.click.remove();
                        inClass.dblclick.remove();
                        inClass.move.remove();
                        inClass.click = undefined;
                        inClass.dblclick = undefined;
                        inClass.move = undefined;
                        inClass.CircuitLayer.graphics.remove(polygonGraphic);
                        inClass.identify(polygonGraphic.geometry, action, valueColor, name);
                    });
                    break;
                case "addRectangle":
                    rectangleGraphic = null;
                    inClass.drag = this.view.on("drag", function (event) {
                        if (rectangleGraphic != undefined || rectangleGraphic != null) {
                            inClass.CircuitLayer.graphics.remove(rectangleGraphic);
                        }
                        event.stopPropagation();
                        var origin = inClass.view.toMap(event.origin);
                        var now = inClass.view.toMap(event);
                        var xmin = origin.x;
                        var xmax = now.x;
                        var ymin = origin.y;
                        var ymax = now.y;
                        var polygon = { type: "polygon", rings: [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]] };
                        var fillSymbol = { type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: { color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5 } };
                        rectangleGraphic = new Graphic_1.default({ geometry: polygon, symbol: fillSymbol });
                        rectangleGraphic.geometry.spatialReference = inClass.view.spatialReference;
                        inClass.CircuitLayer.graphics.add(rectangleGraphic);
                        if (event.action == "end") {
                            inClass.CircuitLayer.graphics.remove(rectangleGraphic);
                            inClass.identify(rectangleGraphic.geometry, action, valueColor, name);
                            inClass.drag.remove();
                            inClass.drag = undefined;
                        }
                    });
                    break;
                case "addBlur":
                    rings = [];
                    inClass.drag = this.view.on("drag", function (event) {
                        if (rings.length > 0) {
                            inClass.CircuitLayer.graphics.remove(blurGraphic);
                        }
                        event.stopPropagation();
                        var now = inClass.view.toMap(event);
                        var xmax = now.x;
                        var ymax = now.y;
                        var a = [xmax, ymax];
                        rings.push(a);
                        var polygon = { type: "polygon", rings: rings };
                        var fillSymbol = { type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: { color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5 } };
                        blurGraphic = new Graphic_1.default({ geometry: polygon, symbol: fillSymbol });
                        blurGraphic.geometry.spatialReference = inClass.view.spatialReference;
                        inClass.CircuitLayer.graphics.add(blurGraphic);
                        if (event.action == "end") {
                            inClass.CircuitLayer.graphics.remove(blurGraphic);
                            inClass.identify(blurGraphic.geometry, action, valueColor, name);
                            inClass.drag.remove();
                            inClass.drag = undefined;
                        }
                    });
                    break;
            }
        };
        CircuitCreation.prototype.removeGraphic = function (event, valueColor, name) {
            var inClass = this;
            var polygonGraphic;
            var rectangleGraphic;
            var blurGraphic;
            var action = event.target.id;
            var rings = [];
            //----------------------------------------------------------------------------------
            function layer() {
                for (var i = 0; i < inClass.listLayers.length; i++) {
                    if (inClass.listLayers[i].id == name)
                        return inClass.listLayers[i];
                }
            }
            //--------------------------------------------------------------------------------------
            this.CircuitLayer = layer();
            if (inClass.drag != undefined) {
                inClass.drag.remove();
                inClass.drag = undefined;
            }
            ;
            if (inClass.dblclick != undefined) {
                inClass.dblclick.remove();
                inClass.dblclick = undefined;
            }
            ;
            if (inClass.click != undefined) {
                inClass.click.remove();
                inClass.click = undefined;
            }
            ;
            if (inClass.move != undefined) {
                inClass.move.remove();
                inClass.move = undefined;
            }
            switch (event.target.id) {
                case "removePoint":
                    inClass.click = this.view.on("click", function (event) {
                        inClass.identify(event.mapPoint, action, valueColor, name);
                        inClass.click.remove();
                        inClass.click = undefined;
                    });
                    break;
                case "removePolygon":
                    rings = [];
                    polygonGraphic = null;
                    var graphMove_2 = [];
                    event.stopPropagation();
                    inClass.click = this.view.on("click", function (event) {
                        inClass.CircuitLayer.graphics.remove(polygonGraphic);
                        var a = [event.mapPoint.x, event.mapPoint.y];
                        graphMove_2.push(a);
                        rings.push(a);
                        inClass.CircuitLayer.graphics.add(polygonGraphic);
                    });
                    inClass.move = inClass.view.on("pointer-move", function (pointer) {
                        inClass.CircuitLayer.graphics.remove(polygonGraphic);
                        var map = inClass.view.toMap({ x: pointer.x, y: pointer.y });
                        graphMove_2.push([map.x, map.y]);
                        var polygon = { type: "polygon", rings: graphMove_2 };
                        var fillSymbol = { type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: { color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5 } };
                        polygonGraphic = new Graphic_1.default({ geometry: polygon, symbol: fillSymbol });
                        polygonGraphic.geometry.spatialReference = inClass.view.spatialReference;
                        inClass.CircuitLayer.graphics.add(polygonGraphic);
                        graphMove_2.splice(graphMove_2.length - 1, 1);
                    });
                    inClass.dblclick = this.view.on("double-click", function (event) {
                        event.stopPropagation();
                        inClass.click.remove();
                        inClass.dblclick.remove();
                        inClass.move.remove();
                        inClass.click = undefined;
                        inClass.dblclick = undefined;
                        inClass.move = undefined;
                        inClass.CircuitLayer.graphics.remove(polygonGraphic);
                        inClass.identify(polygonGraphic.geometry, action, valueColor, name);
                    });
                    break;
                case "removeRectangle":
                    rectangleGraphic = null;
                    inClass.drag = this.view.on("drag", function (event) {
                        if (rectangleGraphic != undefined || rectangleGraphic != null) {
                            inClass.CircuitLayer.graphics.remove(rectangleGraphic);
                        }
                        event.stopPropagation();
                        var origin = inClass.view.toMap(event.origin);
                        var now = inClass.view.toMap(event);
                        var xmin = origin.x;
                        var xmax = now.x;
                        var ymin = origin.y;
                        var ymax = now.y;
                        var polygon = { type: "polygon", rings: [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]] };
                        var fillSymbol = { type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: { color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5 } };
                        rectangleGraphic = new Graphic_1.default({ geometry: polygon, symbol: fillSymbol });
                        rectangleGraphic.geometry.spatialReference = inClass.view.spatialReference;
                        inClass.CircuitLayer.graphics.add(rectangleGraphic);
                        if (event.action == "end") {
                            inClass.CircuitLayer.graphics.remove(rectangleGraphic);
                            inClass.identify(rectangleGraphic.geometry, action, valueColor, name);
                            inClass.drag.remove();
                            inClass.drag = undefined;
                        }
                    });
                    break;
                case "removeBlur":
                    rings = [];
                    inClass.drag = this.view.on("drag", function (event) {
                        if (rings.length > 0) {
                            inClass.CircuitLayer.graphics.remove(blurGraphic);
                        }
                        event.stopPropagation();
                        var now = inClass.view.toMap(event);
                        var xmax = now.x;
                        var ymax = now.y;
                        var a = [xmax, ymax];
                        rings.push(a);
                        var polygon = { type: "polygon", rings: rings };
                        var fillSymbol = { type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: { color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5 } };
                        blurGraphic = new Graphic_1.default({ geometry: polygon, symbol: fillSymbol });
                        blurGraphic.geometry.spatialReference = inClass.view.spatialReference;
                        inClass.CircuitLayer.graphics.add(blurGraphic);
                        if (event.action == "end") {
                            inClass.CircuitLayer.graphics.remove(blurGraphic);
                            inClass.identify(blurGraphic.geometry, action, valueColor, name);
                            inClass.drag.remove();
                            inClass.drag = undefined;
                        }
                    });
                    break;
            }
        };
        CircuitCreation.prototype.identify = function (event, action, color, name) {
            var inClass = this;
            var params = new IdentifyParameters_1.default();
            params.tolerance = 2;
            params.returnGeometry = true;
            params.layerOption = "visible";
            params.width = this.view.width;
            params.height = this.view.height;
            params.geometry = event;
            params.mapExtent = this.view.extent;
            function filter() {
                resolution = inClass.map.layers["items"].map(function (layer) {
                    return layer;
                });
                if (inClass.layersException != undefined) {
                    inClass.layersException.forEach(function (id) {
                        resolution.forEach(function (element, i) {
                            if (element.id == id) {
                                resolution.splice(i, 1);
                            }
                        });
                    });
                }
                return resolution;
            }
            var resolution = filter();
            var layers = resolution.filter(function (layer) {
                return layer.getImageUrl && layer.visible && layer.id != "labels2";
            });
            var tasks = layers.map(function (layer) {
                var task = new IdentifyTask_1.default(layer.url);
                return task;
            });
            var promises = [];
            for (var i = 0; i < tasks.length; i++) {
                promises.push(tasks[i].execute(params));
            }
            var allPromises = new all_1.default(promises);
            if (action == "addPoint" || action == "addPolygon" || action == "addRectangle" || action == "addBlur") {
                allPromises.then(render);
            }
            else if (action == "removePoint" || action == "removePolygon" || action == "removeRectangle" || action == "removeBlur") {
                remove();
            }
            function render(response) {
                var results = [];
                for (var i = 0; i < response.length; i++) {
                    response[i].results.forEach(function (item) {
                        results.push(item);
                    });
                }
                function polygon(feature) {
                    var polygon = feature.geometry;
                    var fillSymbol = { type: "simple-fill", color: [color[0], color[1], color[2], 0.3], outline: { color: [color[0], color[1], color[2]], width: 2 } };
                    var polygonGraphic = new Graphic_1.default({ geometry: polygon, symbol: fillSymbol });
                    polygonGraphic.geometry.spatialReference = feature.geometry.spatialReference;
                    polygonGraphic.attributes = { "GlobalID": feature.attributes.GlobalID, "tabID": name };
                    inClass.CircuitLayer.graphics.add(polygonGraphic);
                }
                function polyline(feature) {
                    var polyline = { type: "polyline", paths: feature.geometry.paths[0] };
                    var lineSymbol = { type: "simple-line", color: [color[0], color[1], color[2]], width: 2 };
                    var polylineGraphic = new Graphic_1.default({ geometry: polyline, symbol: lineSymbol });
                    polylineGraphic.geometry.spatialReference = feature.geometry.spatialReference;
                    polylineGraphic.attributes = { "GlobalID": feature.attributes.GlobalID, "tabID": name };
                    inClass.CircuitLayer.graphics.add(polylineGraphic);
                }
                function point(feature) {
                    var figure;
                    if (feature.attributes["Тип"] == "Дождеприемный колодец") {
                        figure = "square";
                    }
                    else {
                        figure = "circle";
                    }
                    ;
                    var point = { type: "point", longitude: feature.geometry.x, latitude: feature.geometry.y };
                    var markerSymbol = { type: "simple-marker", style: figure, color: [color[0], color[1], color[2]], outline: { color: [color[0], color[1], color[2]], width: 1 } };
                    var pointGraphic = new Graphic_1.default({ geometry: point, symbol: markerSymbol });
                    pointGraphic.geometry.spatialReference = feature.geometry.spatialReference;
                    pointGraphic.attributes = { "GlobalID": feature.attributes.GlobalID, "tabID": name };
                    inClass.CircuitLayer.graphics.add(pointGraphic);
                }
                results.forEach(function (item) {
                    var feature = item["feature"];
                    // let graphicsLayers = inClass.map.layers["items"].filter(function(layer:any) {
                    //     return layer.type == "graphics" && layer.id != "signature";
                    // })
                    var graphicsMap = [];
                    for (var a = 0; a < inClass.listLayers.length; a++) { //----------------------------------------------------------
                        var items = inClass.listLayers[a].graphics.items.map(function (element) {
                            return element;
                        });
                        graphicsMap = graphicsMap.concat(items);
                    }
                    function isPositive(event) {
                        return event.attributes && event.attributes.GlobalID == feature.attributes.GlobalID;
                    }
                    var answer = graphicsMap.some(isPositive);
                    if (answer == false) {
                        switch (feature.geometry.type) {
                            case "polygon":
                                polygon(feature);
                                break;
                            case "polyline":
                                polyline(feature);
                                break;
                            case "point":
                                point(feature);
                                break;
                        }
                    }
                    ;
                });
                var p_counter = document.getElementById(name + "_amount");
                inClass.indicateLayerLength[name] = inClass.CircuitLayer.graphics.length;
                p_counter.innerText = inClass.indicateLayerLength[name];
            }
            function remove() {
                inClass.CircuitLayer.graphics.items.forEach(function (element) {
                    var crosses = geometryEngineAsync_1.default.crosses(event, element.geometry);
                    var contains = geometryEngineAsync_1.default.contains(event, element.geometry);
                    crosses.then(act);
                    contains.then(act);
                    function act(geometryElem) {
                        if (geometryElem == true) {
                            if (element.attributes.tabID == name) {
                                inClass.CircuitLayer.graphics.remove(element);
                                var p_counter = document.getElementById(name + "_amount");
                                inClass.indicateLayerLength[name] = inClass.CircuitLayer.graphics.length;
                                p_counter.innerText = inClass.indicateLayerLength[name];
                            }
                        }
                    }
                });
            }
        };
        CircuitCreation.prototype.updateTitleLayer = function (name, event) {
            var layer;
            for (var i = 0; i < this.listLayers.length; i++) { //------------------------------------------------------
                if (this.listLayers[i].id == name) { //-----------------------------------------------------
                    layer = this.map.layers["items"][i];
                }
            }
            if (event.target.value == "") {
                layer.title = "____________";
                var titleSpan = void 0;
                var arrayTitleSpan = document.getElementsByClassName(CSS.title);
                for (var i = 0; i < arrayTitleSpan.length; i++) {
                    if (arrayTitleSpan[i].id == name) {
                        titleSpan = arrayTitleSpan[i];
                    }
                }
                ;
                titleSpan.innerHTML = "";
            }
            else {
                layer.title = event.target.value;
                var titleSpan = void 0;
                var arrayTitleSpan = document.getElementsByClassName(CSS.title);
                for (var i = 0; i < arrayTitleSpan.length; i++) {
                    if (arrayTitleSpan[i].id == name) {
                        titleSpan = arrayTitleSpan[i];
                    }
                }
                ;
                titleSpan.innerHTML = layer.title;
            }
        };
        CircuitCreation.prototype.signature = function (event) {
            var inClass = this;
            if (event.target.className == CSS.addSignature) {
                var i, signature;
                signature = document.getElementsByClassName(CSS.addSignature);
                for (i = 0; i < signature.length; i++) {
                    signature[i].className = signature[i].className.replace(" active", "");
                }
                event.currentTarget.className += " active";
                inClass.clickSign = this.view.on("click", function (event) {
                    iden(event);
                });
            }
            else if (event.target.className == CSS.addSignature + " active") {
                var i, signature;
                signature = document.getElementsByClassName(CSS.addSignature + " active");
                for (i = 0; i < signature.length; i++) {
                    signature[i].className = signature[i].className.replace(" active", "");
                }
                event.currentTarget.className += "";
                inClass.clickSign.remove();
            }
            function iden(event) {
                var params = new IdentifyParameters_1.default();
                params.tolerance = 4;
                params.returnGeometry = true;
                params.layerOption = "visible";
                params.width = inClass.view.width;
                params.height = inClass.view.height;
                params.geometry = event.mapPoint;
                params.mapExtent = inClass.view.extent;
                var layers = inClass.map.layers["items"].filter(function (layer) {
                    return layer.getImageUrl && layer.visible && layer.id != "labels2";
                });
                var tasks = layers.map(function (layer) {
                    var task = new IdentifyTask_1.default(layer.url);
                    return task;
                });
                var promises = [];
                for (var i_1 = 0; i_1 < tasks.length; i_1++) {
                    promises.push(tasks[i_1].execute(params));
                }
                var allPromises = new all_1.default(promises);
                allPromises.then(graphics);
            }
            ;
            function graphics(response) {
                var result = [];
                for (var i_2 = 0; i_2 < response.length; i_2++) {
                    response[i_2].results.forEach(function (item) {
                        if (item.feature.geometry.type == "point") {
                            result = item;
                        }
                    });
                }
                var point = { type: "point", longitude: result["feature"].geometry.x, latitude: result["feature"].geometry.y };
                var markerSymbol = { type: "simple-marker", color: [176, 224, 230, 0.6], outline: { color: [0, 255, 255], width: 1.5 } };
                var pointGraphic = new Graphic_1.default({ geometry: point, symbol: markerSymbol });
                pointGraphic.geometry.spatialReference = result["feature"].geometry.spatialReference;
                pointGraphic.attributes = { "GlobalID": result["feature"].attributes.GlobalID + " sign" };
                inClass.signatureLayer.graphics.add(pointGraphic);
                setTimeout(text, 1500, result);
            }
            function text(info) {
                var feature = info["feature"];
                inClass.signatureLayer.graphics.items.forEach(function (event) {
                    if (event.attributes["GlobalID"] == feature.attributes.GlobalID + " sign") {
                        inClass.signatureLayer.graphics.remove(event);
                    }
                });
                function isPositive(event) {
                    return event.attributes.GlobalID == feature.attributes.GlobalID + " text";
                }
                var answer = inClass.signatureLayer.graphics.items.some(isPositive);
                if (answer == false) {
                    var a = prompt("Подпись", "");
                    if (a == null) {
                        document.getElementById(CSS.addSignature).click();
                        return;
                    }
                    else if (a == "") {
                        inClass.signatureLayer.graphics.items.forEach(function (event) {
                            if (event.attributes["GlobalID"] == feature.attributes.GlobalID + " text") {
                                inClass.signatureLayer.graphics.remove(event);
                            }
                        });
                        document.getElementById(CSS.addSignature).click();
                        return;
                    }
                    else {
                        var point = info.feature.geometry;
                        var textSymbol = { type: "text", color: "black", haloColor: "white", haloSize: "2px", text: a, xoffset: 0, yoffset: 0, font: { size: 12 } };
                        var pointGraphic = new Graphic_1.default({ geometry: point, symbol: textSymbol });
                        pointGraphic.attributes = { "GlobalID": info["feature"].attributes.GlobalID + " text" };
                        inClass.signatureLayer.graphics.add(pointGraphic);
                        document.getElementById(CSS.addSignature).click();
                    }
                }
                else {
                    var a = prompt("Подпись", "");
                    if (a == null) {
                        document.getElementById(CSS.addSignature).click();
                        return;
                    }
                    else if (a == "") {
                        inClass.signatureLayer.graphics.items.forEach(function (event) {
                            if (event.attributes["GlobalID"] == feature.attributes.GlobalID + " text") {
                                inClass.signatureLayer.graphics.remove(event);
                            }
                        });
                        document.getElementById(CSS.addSignature).click();
                        return;
                    }
                    else {
                        inClass.signatureLayer.graphics.items.forEach(function (event) {
                            if (event.attributes["GlobalID"] == feature.attributes.GlobalID + " text") {
                                inClass.signatureLayer.graphics.remove(event);
                            }
                        });
                        var point = info.feature.geometry;
                        var textSymbol = { type: "text", color: "black", haloColor: "white", haloSize: "1px", text: a, xoffset: 0, yoffset: 0, font: { size: 14 } };
                        var pointGraphic = new Graphic_1.default({ geometry: point, symbol: textSymbol });
                        pointGraphic.attributes = { "GlobalID": info["feature"].attributes.GlobalID + " text" };
                        inClass.signatureLayer.graphics.add(pointGraphic);
                        document.getElementById(CSS.addSignature).click();
                    }
                }
            }
        };
        CircuitCreation.prototype.addLinks = function () {
            var inClass = this;
            inClass.listLinks.forEach(function (parameters) {
                var link = widget_1.tsx("button", { bind: inClass, class: CSS.tabLinks, id: parameters["name"], onclick: function () { inClass.open(event); } },
                    widget_1.tsx("p", { bind: inClass, class: CSS.span, style: "background: " + parameters["name"] }),
                    widget_1.tsx("p", { bind: inClass, class: CSS.title, id: parameters["name"] }));
                inClass.arrayLinks.push(link);
                var content = widget_1.tsx("div", { bind: inClass, class: CSS.tabContent, id: parameters["name"] },
                    widget_1.tsx("p", null, "\u0418\u043C\u044F \u0441\u043B\u043E\u044F:"),
                    widget_1.tsx("input", { bind: inClass, class: CSS.input, type: "text", onchange: function (event) { this.updateTitleLayer(parameters["name"], event); } }),
                    widget_1.tsx("fieldset", { bind: inClass, class: CSS.fieldSet },
                        widget_1.tsx("legend", { bind: inClass, class: CSS.legend }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"),
                        widget_1.tsx("div", { bind: inClass, class: CSS.sketch, id: "addPoint", style: "background: url(sketch_point.png) no-repeat; background-position: center;", title: "Щелкните, чтобы добавить точку", onclick: function () { inClass.addGraphic(event, parameters["color"], parameters["name"]); } }),
                        widget_1.tsx("div", { bind: inClass, class: CSS.sketch, id: "addRectangle", style: "background: url(sketch_rectangle.png) no-repeat; background-position: center;", title: "Нажмите, чтобы начать, и отпустите чтобы завершить", onclick: function () { inClass.addGraphic(event, parameters["color"], parameters["name"]); } }),
                        widget_1.tsx("div", { bind: inClass, class: CSS.sketch, id: "addPolygon", style: "background: url(sketch_polygon.png) no-repeat; background-position: center;", title: "Щелкните, чтобы начать рисовать - Дважды щелкните, для завершения", onclick: function () { inClass.addGraphic(event, parameters["color"], parameters["name"]); } }),
                        widget_1.tsx("div", { bind: inClass, class: CSS.sketch, id: "addBlur", style: "background: url(sketch_blur.png) no-repeat; background-position: center;", title: "Нажмите, чтобы начать, и отпустите чтобы завершить", onclick: function () { inClass.addGraphic(event, parameters["color"], parameters["name"]); } })),
                    widget_1.tsx("fieldset", { bind: inClass, class: CSS.fieldSet },
                        widget_1.tsx("legend", { bind: inClass, class: CSS.legend }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"),
                        widget_1.tsx("div", { bind: inClass, class: CSS.sketch, id: "removePoint", style: "background: url(sketch_point.png) no-repeat; background-position: center;", title: "Щелкните, чтобы добавить точку", onclick: function () { inClass.removeGraphic(event, parameters["color"], parameters["name"]); } }),
                        widget_1.tsx("div", { bind: inClass, class: CSS.sketch, id: "removeRectangle", style: "background: url(sketch_rectangle.png) no-repeat; background-position: center;", title: "Нажмите, чтобы начать, и отпустите чтобы завершить", onclick: function () { inClass.removeGraphic(event, parameters["color"], parameters["name"]); } }),
                        widget_1.tsx("div", { bind: inClass, class: CSS.sketch, id: "removePolygon", style: "background: url(sketch_polygon.png) no-repeat; background-position: center;", title: "Щелкните, чтобы начать рисовать - Дважды щелкните, для завершения", onclick: function () { inClass.removeGraphic(event, parameters["color"], parameters["name"]); } }),
                        widget_1.tsx("div", { bind: inClass, class: CSS.sketch, id: "removeBlur", style: "background: url(sketch_blur.png) no-repeat; background-position: center;", title: "Нажмите, чтобы начать, и отпустите чтобы завершить", onclick: function () { inClass.removeGraphic(event, parameters["color"], parameters["name"]); } })),
                    widget_1.tsx("p", { class: CSS.elements, id: parameters["name"] + "_amount" }, inClass.indicateLayerLength[parameters["name"]]));
                inClass.arrayContent.push(content);
            });
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], CircuitCreation.prototype, "layersException", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], CircuitCreation.prototype, "listLinks", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], CircuitCreation.prototype, "map", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], CircuitCreation.prototype, "view", void 0);
        CircuitCreation = __decorate([
            decorators_1.subclass("esri.widgets.CircuitCreation")
        ], CircuitCreation);
        return CircuitCreation;
    }(decorators_1.declared(Widget_1.default)));
    return CircuitCreation;
});
//# sourceMappingURL=CircuitCreation.js.map