/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

//исправлено identify -> render -> isPositive -> добавлена проверка event.attribute

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Widget from "esri/widgets/Widget";

import { renderable, tsx } from "esri/widgets/support/widget";

import MapView from "esri/views/MapView";

import Map from "esri/Map";

import GraphicsLayer from "esri/layers/GraphicsLayer";

import Graphic from "esri/Graphic";

import Geometry from "esri/geometry/Geometry";

import geometryEngineAsync from "esri/geometry/geometryEngineAsync";

import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";

import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";

import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";

import IdentifyTask from "esri/tasks/IdentifyTask";

import IdentifyParameters from "esri/tasks/support/IdentifyParameters";

import all from "dojo/promise/all";

const CSS = {
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
}

@subclass("esri.widgets.CircuitCreation")
class CircuitCreation extends declared(Widget) {
    CircuitLayer: any = null;
    signatureLayer: any;
    clickSign:any
    click:any;
    drag:any;
    move:any;
    dblclick:any;
    indicateLayerLength: Object = {};
    arrayLinks: Array<JSX.Element> = [];
    arrayContent: Array<JSX.Element> = [];
    constructor() {
        super();
    }
    postInitialize() {
        this.ready();
    }
    @property()
    @renderable()
    layersException: Array<any>; //Массив ID слоев которые не будут входить в идентификацию

    @property()
    @renderable()
    listLinks: Array<Object>; //Массив объектов которые хранят {name: Имя, alias: Псевдоним, color: Цвет}

    @property()
    @renderable()
    map: Map;

    @property()
    @renderable()
    view: MapView;
    
    render() {
        //-------------------------------PatternLinks
        const addSignature = (
            <div
                bind={this}
                class={CSS.addSignature}
                id={CSS.addSignature}
                onclick={function(){this.signature(event)}}
            >
            </div>
        )
        const tabs = (
            <div
                bind={this}
                class={CSS.tabs}
                id={CSS.tabs}
            >
                {this.arrayLinks}
            </div>
        )
        const tabBar = (
            <div
                bind={this}
                class={CSS.tabBar}
            >
                {tabs}
                {addSignature}
            </div>
        )
        //-------------------------------PatternContent
        const contentBar = (
            <div
                bind={this}
                class={CSS.contentBar}
            >
                {this.arrayContent}
            </div>
        )
        //-------------------------------
        const base = (
            <div
                bind={this}
                class={CSS.base}
                id={CSS.base}
            >
                {contentBar}
                {tabBar}
            </div>
        )
        return base;
    }
    private ready() {
        let inClass = this;
        this.listLinks.forEach(function(element) {
            let CircuitLayer = new GraphicsLayer({
                listMode: "hide",
                id: element["name"],
                title: "_",
                visible: true
            });
            inClass.map.add(CircuitLayer);
        })
        this.signatureLayer = new GraphicsLayer({
            listMode: "hide",
            id: "signature",
            title: "Signature",
            visible: true
        });
        this.map.add(this.signatureLayer);

        this.listLinks.forEach(function(element: any) {
            inClass.indicateLayerLength[element["name"]] = 0;
        });

        this.addLinks();
    }
    private open(event:any) {
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
        } else
        if (event.target.className == CSS.tabLinks + " active") {
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
    }
    private addGraphic(event:any, valueColor:Array<any>, name:any) {
        let inClass = this;
        let polygonGraphic:any;
        let rectangleGraphic:any;
        let blurGraphic:any;
        let action = event.target.id;
        let rings:Array<any> = [];
        let layer = function() {
            let a = inClass.map.layers["items"];
            let layer;
            for (let i = 0; i < a.length; i++) {
                if (a[i].id == name) {
                    layer = a[i];
                }
            }
            return layer;
        }
        this.CircuitLayer = layer();
        if (inClass.drag != undefined) {
            inClass.drag.remove();
            inClass.drag = undefined;
        };
        if (inClass.dblclick != undefined) {
            inClass.dblclick.remove();
            inClass.dblclick = undefined;
        };
        if (inClass.click != undefined) {
            inClass.click.remove();
            inClass.click = undefined;
        };
        if (inClass.move != undefined) {
            inClass.move.remove();
            inClass.move = undefined;
        }
        switch (event.target.id) {
            case "addPoint":
                inClass.click = this.view.on("click", function(event) {
                    inClass.identify(event.mapPoint, action, valueColor, name);
                    inClass.click.remove();
                    inClass.click = undefined;
                })
                break;
            case "addPolygon":
                rings = [];
                polygonGraphic = null;
                let graphMove:Array<any> = [];
                event.stopPropagation();
                inClass.click = this.view.on("click", function(event) {
                    let a = [event.mapPoint.x, event.mapPoint.y];
                    graphMove.push(a);
                    inClass.CircuitLayer.graphics.remove(polygonGraphic);
                    inClass.CircuitLayer.graphics.add(polygonGraphic);
                })
                inClass.move = inClass.view.on("pointer-move", function(pointer) {
                    inClass.CircuitLayer.graphics.remove(polygonGraphic);
                    let map = inClass.view.toMap({x: pointer.x, y: pointer.y})
                    graphMove.push([map.x, map.y]);
                    var polygon = {type: "polygon", rings: graphMove};
                    var fillSymbol = {type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: {color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5}};
                    polygonGraphic = new Graphic({geometry: polygon, symbol: fillSymbol});
                    polygonGraphic.geometry.spatialReference = inClass.view.spatialReference;
                    inClass.CircuitLayer.graphics.add(polygonGraphic);
                    graphMove.splice(graphMove.length-1, 1);
                })
                inClass.dblclick = this.view.on("double-click", function(event) {
                    event.stopPropagation();
                    inClass.click.remove();
                    inClass.dblclick.remove();
                    inClass.move.remove();
                    inClass.click = undefined;
                    inClass.dblclick = undefined;
                    inClass.move = undefined;
                    inClass.CircuitLayer.graphics.remove(polygonGraphic);
                    inClass.identify(polygonGraphic.geometry, action, valueColor, name);
                })
                break;
            case "addRectangle":
                rectangleGraphic = null;
                inClass.drag = this.view.on("drag", function(event) {
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
                    var polygon = {type: "polygon", rings: [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]};
                    var fillSymbol = {type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: {color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5}};
                    rectangleGraphic = new Graphic({geometry: polygon, symbol: fillSymbol});
                    rectangleGraphic.geometry.spatialReference = inClass.view.spatialReference;
                    inClass.CircuitLayer.graphics.add(rectangleGraphic);
                    if (event.action == "end") {
                        inClass.CircuitLayer.graphics.remove(rectangleGraphic);
                        inClass.identify(rectangleGraphic.geometry, action, valueColor, name);
                        inClass.drag.remove();
                        inClass.drag = undefined;
                    }
                })
                break;
            case "addBlur":
                rings = [];
                inClass.drag = this.view.on("drag", function(event) {
                    if (rings.length > 0) {
                        inClass.CircuitLayer.graphics.remove(blurGraphic);
                    }
                    event.stopPropagation();
                    var now = inClass.view.toMap(event);       
                    var xmax = now.x;
                    var ymax = now.y;
                    let a = [xmax, ymax];
                    rings.push(a);
                    var polygon = {type: "polygon", rings: rings};
                    var fillSymbol = {type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: {color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5}};
                    blurGraphic = new Graphic({geometry: polygon, symbol: fillSymbol});
                    blurGraphic.geometry.spatialReference = inClass.view.spatialReference;
                    inClass.CircuitLayer.graphics.add(blurGraphic);
                    if (event.action == "end") {
                        inClass.CircuitLayer.graphics.remove(blurGraphic);
                        inClass.identify(blurGraphic.geometry, action, valueColor, name);
                        inClass.drag.remove();
                        inClass.drag = undefined;
                    }
                })
                break;
        }
    }
    private removeGraphic(event:any, valueColor:Array<any>, name:any) {
        let inClass = this;
        let polygonGraphic:any;
        let rectangleGraphic:any;
        let blurGraphic:any;
        let action = event.target.id;
        let rings:Array<any> = [];
        let layer = function() {
            let a = inClass.map.layers["items"];
            let layer;
            for (let i = 0; i < a.length; i++) {
                if (a[i].id == name) {
                    layer = a[i];
                }
            }
            return layer;
        }
        this.CircuitLayer = layer();
        if (inClass.drag != undefined) {
            inClass.drag.remove();
            inClass.drag = undefined;
        };
        if (inClass.dblclick != undefined) {
            inClass.dblclick.remove();
            inClass.dblclick = undefined;
        };
        if (inClass.click != undefined) {
            inClass.click.remove();
            inClass.click = undefined;
        };
        if (inClass.move != undefined) {
            inClass.move.remove();
            inClass.move = undefined;
        }
        switch (event.target.id) {
            case "removePoint":
                inClass.click = this.view.on("click", function(event) {
                    inClass.identify(event.mapPoint, action, valueColor, name);
                    inClass.click.remove();
                    inClass.click = undefined;
                })
                break;
            case "removePolygon":
                rings = [];
                polygonGraphic = null;
                let graphMove:Array<any> = [];
                event.stopPropagation();
                inClass.click = this.view.on("click", function(event) {
                    inClass.CircuitLayer.graphics.remove(polygonGraphic);
                    let a = [event.mapPoint.x, event.mapPoint.y];
                    graphMove.push(a);
                    rings.push(a);
                    inClass.CircuitLayer.graphics.add(polygonGraphic);
                })
                inClass.move = inClass.view.on("pointer-move", function(pointer) {
                    inClass.CircuitLayer.graphics.remove(polygonGraphic);
                    let map = inClass.view.toMap({x: pointer.x, y: pointer.y})
                    graphMove.push([map.x, map.y]);
                    var polygon = {type: "polygon", rings: graphMove};
                    var fillSymbol = {type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: {color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5}};
                    polygonGraphic = new Graphic({geometry: polygon, symbol: fillSymbol});
                    polygonGraphic.geometry.spatialReference = inClass.view.spatialReference;
                    inClass.CircuitLayer.graphics.add(polygonGraphic);
                    graphMove.splice(graphMove.length-1, 1);
                })
                inClass.dblclick = this.view.on("double-click", function(event) {
                    event.stopPropagation();
                    inClass.click.remove();
                    inClass.dblclick.remove();
                    inClass.move.remove();
                    inClass.click = undefined;
                    inClass.dblclick = undefined;
                    inClass.move = undefined;
                    inClass.CircuitLayer.graphics.remove(polygonGraphic);
                    inClass.identify(polygonGraphic.geometry, action, valueColor, name);
                })
                break;
            case "removeRectangle":
                rectangleGraphic = null;
                inClass.drag = this.view.on("drag", function(event) {
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
                    var polygon = {type: "polygon", rings: [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]};
                    var fillSymbol = {type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: {color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5}};
                    rectangleGraphic = new Graphic({geometry: polygon, symbol: fillSymbol});
                    rectangleGraphic.geometry.spatialReference = inClass.view.spatialReference;
                    inClass.CircuitLayer.graphics.add(rectangleGraphic);
                    if (event.action == "end") {
                        inClass.CircuitLayer.graphics.remove(rectangleGraphic);
                        inClass.identify(rectangleGraphic.geometry, action, valueColor, name);
                        inClass.drag.remove();
                        inClass.drag = undefined;
                    }
                })
                break;
            case "removeBlur":
                rings = [];
                inClass.drag = this.view.on("drag", function(event) {
                    if (rings.length > 0) {
                        inClass.CircuitLayer.graphics.remove(blurGraphic);
                    }
                    event.stopPropagation();
                    var now = inClass.view.toMap(event);       
                    var xmax = now.x;
                    var ymax = now.y;
                    let a = [xmax, ymax];
                    rings.push(a);
                    var polygon = {type: "polygon", rings: rings};
                    var fillSymbol = {type: "simple-fill", color: [valueColor[0], valueColor[1], valueColor[2], 0.3], outline: {color: [valueColor[0], valueColor[1], valueColor[2]], width: 0.5}};
                    blurGraphic = new Graphic({geometry: polygon, symbol: fillSymbol});
                    blurGraphic.geometry.spatialReference = inClass.view.spatialReference;
                    inClass.CircuitLayer.graphics.add(blurGraphic);
                    if (event.action == "end") {
                        inClass.CircuitLayer.graphics.remove(blurGraphic);
                        inClass.identify(blurGraphic.geometry, action, valueColor, name);
                        inClass.drag.remove();
                        inClass.drag = undefined;
                    }
                })
                break;
        }
    }
    private identify(event:any, action:String, color:Array<any>, name:any) {
        let inClass = this;
        let params = new IdentifyParameters();
        params.tolerance = 2;
        params.returnGeometry = true;
        params.layerOption = "visible";
        params.width = this.view.width;
        params.height = this.view.height;
        params.geometry = event;
        params.mapExtent = this.view.extent;
        function filter() {
            resolution = inClass.map.layers["items"].map(function(layer:any) {
                return layer;                
            })
            if (inClass.layersException != undefined) {
                inClass.layersException.forEach(function(id:any) {
                    resolution.forEach(function(element:any, i:any) {
                        if (element.id == id) {
                            resolution.splice(i, 1)
                        }
                    })
                })
            }
            return resolution;
        }
        let resolution:any = filter();
        let layers = resolution.filter(function(layer:any) {
            return layer.getImageUrl && layer.visible && layer.id != "labels2";
        });
        let tasks = layers.map(function (layer:any) {  
            var task = new IdentifyTask(layer.url);  
            return task;
        });
        var promises = [];  
        for (let i = 0; i < tasks.length; i++) {  
            promises.push(tasks[i].execute(params));
        }
        var allPromises = new all(promises);
        if (action == "addPoint" || action == "addPolygon" || action == "addRectangle" || action == "addBlur") {
            allPromises.then(render);
        } else
        if (action == "removePoint" || action == "removePolygon" || action == "removeRectangle" || action == "removeBlur") {
            remove();
        }
        function render(response:any) {
            let results:Array<object> = [];
            for (let i = 0; i < response.length; i++) {
                response[i].results.forEach(function(item:any) {
                    results.push(item);
                });
            }
            function polygon(feature:any) {
                var polygon = feature.geometry;
                var fillSymbol = {type: "simple-fill", color: [color[0], color[1], color[2], 0.3], outline: {color: [color[0], color[1], color[2]], width: 2}};
                var polygonGraphic = new Graphic({geometry: polygon, symbol: fillSymbol});
                polygonGraphic.geometry.spatialReference = feature.geometry.spatialReference;
                polygonGraphic.attributes = {"GlobalID": feature.attributes.GlobalID, "tabID": name}
                inClass.CircuitLayer.graphics.add(polygonGraphic);
            }
            function polyline(feature:any) {
                var polyline = {type: "polyline", paths: feature.geometry.paths[0]};
                var lineSymbol = {type: "simple-line", color: [color[0], color[1], color[2]],  width: 2};
                var polylineGraphic = new Graphic({geometry: polyline, symbol: lineSymbol});  
                polylineGraphic.geometry.spatialReference = feature.geometry.spatialReference;
                polylineGraphic.attributes = {"GlobalID": feature.attributes.GlobalID, "tabID": name}
                inClass.CircuitLayer.graphics.add(polylineGraphic);
            }
            function point(feature:any) {
                let figure;
                if (feature.attributes["Тип"] == "Дождеприемный колодец") {
                    figure = "square";
                } else {
                    figure = "circle";
                };
                var point = {type: "point", longitude: feature.geometry.x, latitude: feature.geometry.y};
                var markerSymbol = {type: "simple-marker", style: figure, color: [color[0], color[1], color[2]], outline: {color: [color[0], color[1], color[2]], width: 1}};
                var pointGraphic = new Graphic({geometry: point, symbol: markerSymbol});
                pointGraphic.geometry.spatialReference = feature.geometry.spatialReference;
                pointGraphic.attributes = {"GlobalID": feature.attributes.GlobalID, "tabID": name};
                inClass.CircuitLayer.graphics.add(pointGraphic);
            }
            results.forEach(function(item) {
                let feature = item["feature"];
                let graphicsLayers = inClass.map.layers["items"].filter(function(layer:any) {
                    return layer.type == "graphics" && layer.id != "signature";
                })
                let graphicsMap:Array<any> = [];
                for (let a = 0; a < graphicsLayers.length; a++) {
                    let items = graphicsLayers[a].graphics.items.map(function(element:any) {
                        return element;
                    })
                    graphicsMap = graphicsMap.concat(items);
                }
                function isPositive(event:any) {
                    return event.attributes && event.attributes.GlobalID == feature.attributes.GlobalID;
                }
                let answer = graphicsMap.some(isPositive);
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
                };
            })
            let p_counter = document.getElementById(name + "_amount");
            inClass.indicateLayerLength[name] = inClass.CircuitLayer.graphics.length;
            p_counter.innerText = inClass.indicateLayerLength[name];
        }
        function remove() {
            inClass.CircuitLayer.graphics.items.forEach(function(element:any) {
                let crosses = geometryEngineAsync.crosses(event, element.geometry);
                let contains = geometryEngineAsync.contains(event, element.geometry);
                crosses.then(act);
                contains.then(act);
                function act(geometryElem:any) {
                    if (geometryElem == true) {
                        if (element.attributes.tabID == name) {
                            inClass.CircuitLayer.graphics.remove(element);
                            let p_counter = document.getElementById(name + "_amount");
                            inClass.indicateLayerLength[name] = inClass.CircuitLayer.graphics.length;
                            p_counter.innerText = inClass.indicateLayerLength[name];
                        }
                    }
                }
            })
        }
    }
    private updateTitleLayer(name:any, event:any) {
        let layer;
        for (let i = 0; i < this.map.layers["items"].length; i++) {
            if (this.map.layers["items"][i].id == name) {
                layer = this.map.layers["items"][i];
            }
        }
        if (event.target.value == "") {
            layer.title = "____________";
            let titleSpan;
            let arrayTitleSpan = document.getElementsByClassName(CSS.title);
            for (let i = 0; i < arrayTitleSpan.length; i++) {
                if (arrayTitleSpan[i].id == name) {
                    titleSpan = arrayTitleSpan[i];
                }
            };
            titleSpan.innerHTML = "";
        } else {
            layer.title = event.target.value;
            let titleSpan;
            let arrayTitleSpan = document.getElementsByClassName(CSS.title);
            for (let i = 0; i < arrayTitleSpan.length; i++) {
                if (arrayTitleSpan[i].id == name) {
                    titleSpan = arrayTitleSpan[i];
                }
            };
            titleSpan.innerHTML = layer.title;
        }
    }
    private signature(event:any) {
        let inClass = this;
        if (event.target.className == CSS.addSignature) {
            var i, signature;

            signature = document.getElementsByClassName(CSS.addSignature);
            for (i = 0; i < signature.length; i++) {
                signature[i].className = signature[i].className.replace(" active", "");
            }
            event.currentTarget.className += " active";
            inClass.clickSign = this.view.on("click", function(event) {
                iden(event);
            });
        } else
        if (event.target.className == CSS.addSignature + " active") {
            var i, signature;

            signature = document.getElementsByClassName(CSS.addSignature + " active");
            for (i = 0; i < signature.length; i++) {
                signature[i].className = signature[i].className.replace(" active", "");
            }
            event.currentTarget.className += "";
            inClass.clickSign.remove();
        }
        function iden(event:any) {
            let params = new IdentifyParameters();
            params.tolerance = 4;
            params.returnGeometry = true;
            params.layerOption = "visible";
            params.width = inClass.view.width;
            params.height = inClass.view.height;
            params.geometry = event.mapPoint;
            params.mapExtent = inClass.view.extent;
            let layers = inClass.map.layers["items"].filter(function(layer:any) {
                return layer.getImageUrl && layer.visible && layer.id != "labels2";
            });
            let tasks = layers.map(function (layer:any) {  
                var task = new IdentifyTask(layer.url);  
                return task;
            });
            var promises = [];  
            for (let i = 0; i < tasks.length; i++) {  
                promises.push(tasks[i].execute(params));
            }
            var allPromises = new all(promises);
            allPromises.then(graphics);
        };
        function graphics(response:any) {
            let result:Array<object> = [];
            for (let i = 0; i < response.length; i++) {
                response[i].results.forEach(function(item:any) {
                    if (item.feature.geometry.type == "point") {
                        result = item;
                    }
                });
            }
            var point = {type: "point", longitude: result["feature"].geometry.x, latitude: result["feature"].geometry.y};
            var markerSymbol = {type: "simple-marker", color: [176, 224, 230, 0.6], outline: {color: [0, 255, 255], width: 1.5}};
            var pointGraphic = new Graphic({geometry: point, symbol: markerSymbol});
            pointGraphic.geometry.spatialReference = result["feature"].geometry.spatialReference;
            pointGraphic.attributes = {"GlobalID": result["feature"].attributes.GlobalID + " sign"};
            inClass.signatureLayer.graphics.add(pointGraphic);
            setTimeout(text, 1500, result);
        }
        function text(info:any) {
            let feature = info["feature"];
            inClass.signatureLayer.graphics.items.forEach(function(event:any) {
                if (event.attributes["GlobalID"] == feature.attributes.GlobalID + " sign") {
                    inClass.signatureLayer.graphics.remove(event);
                }
            });
            function isPositive(event:any) {
                return event.attributes.GlobalID == feature.attributes.GlobalID + " text";
            }
            let answer = inClass.signatureLayer.graphics.items.some(isPositive);
            if (answer == false) {
                let a:String = prompt("Подпись", "");
                if (a == null) {
                    document.getElementById(CSS.addSignature).click();
                    return;
                } else if (a == "") {
                    inClass.signatureLayer.graphics.items.forEach(function(event:any) {
                        if (event.attributes["GlobalID"] == feature.attributes.GlobalID + " text") {
                            inClass.signatureLayer.graphics.remove(event);
                        }
                    });
                    document.getElementById(CSS.addSignature).click();
                    return;
                } else {
                    var point = info.feature.geometry;
                    var textSymbol = {type: "text", color: "black", haloColor: "white", haloSize: "2px", text: a, xoffset: 0, yoffset: 0, font: {size: 12}};
                    var pointGraphic = new Graphic({geometry: point, symbol: textSymbol});
                    pointGraphic.attributes = {"GlobalID": info["feature"].attributes.GlobalID + " text"};
                    inClass.signatureLayer.graphics.add(pointGraphic);
                    document.getElementById(CSS.addSignature).click();
                }
            } else {
                let a:String = prompt("Подпись", "");
                if (a == null) {
                    document.getElementById(CSS.addSignature).click();
                    return;
                } else if (a == "") {
                    inClass.signatureLayer.graphics.items.forEach(function(event:any) {
                        if (event.attributes["GlobalID"] == feature.attributes.GlobalID + " text") {
                            inClass.signatureLayer.graphics.remove(event);
                        }
                    });
                    document.getElementById(CSS.addSignature).click();
                    return;
                } else {
                    inClass.signatureLayer.graphics.items.forEach(function(event:any) {
                        if (event.attributes["GlobalID"] == feature.attributes.GlobalID + " text") {
                            inClass.signatureLayer.graphics.remove(event);
                        }
                    });
                    var point = info.feature.geometry;
                    var textSymbol = {type: "text", color: "black", haloColor: "white", haloSize: "1px", text: a, xoffset: 0, yoffset: 0, font: {size: 14}};
                    var pointGraphic = new Graphic({geometry: point, symbol: textSymbol});
                    pointGraphic.attributes = {"GlobalID": info["feature"].attributes.GlobalID + " text"};
                    inClass.signatureLayer.graphics.add(pointGraphic);
                    document.getElementById(CSS.addSignature).click();
                }
            }
        }
    }
    private addLinks() {
        let inClass = this;
        inClass.listLinks.forEach(function(parameters) {
        let link = <button
            bind={inClass}
            class={CSS.tabLinks}
            id={parameters["name"]}
            onclick={function(){inClass.open(event)}}
        >
            <p
                bind={inClass}
                class={CSS.span}
                style={"background: " + parameters["name"]}
            ></p>
            <p
                bind={inClass}
                class={CSS.title}
                id={parameters["name"]}
            >
            </p>
        </button>
        inClass.arrayLinks.push(link);

        let content = <div
            bind={inClass}
            class={CSS.tabContent}
            id={parameters["name"]}
        >
            <p>Имя слоя:</p>
            <input
                bind={inClass}
                class={CSS.input}
                type="text"
                onchange={function(event:any){this.updateTitleLayer(parameters["name"], event)}}
            >
            </input>
            <fieldset
                bind={inClass}
                class={CSS.fieldSet}
            >
                <legend
                    bind={inClass}
                    class={CSS.legend}
                >
                    Добавить
                </legend>
                <div
                    bind={inClass}
                    class={CSS.sketch}
                    id={"addPoint"}
                    style="background: url(sketch_point.png) no-repeat; background-position: center;"
                    title={"Щелкните, чтобы добавить точку"}
                    onclick={function(){inClass.addGraphic(event, parameters["color"],parameters["name"])}}
                >
                </div>
                <div
                    bind={inClass}
                    class={CSS.sketch}
                    id={"addRectangle"}
                    style="background: url(sketch_rectangle.png) no-repeat; background-position: center;"
                    title={"Нажмите, чтобы начать, и отпустите чтобы завершить"}
                    onclick={function(){inClass.addGraphic(event, parameters["color"],parameters["name"])}}
                >
                </div>
                <div
                    bind={inClass}
                    class={CSS.sketch}
                    id={"addPolygon"}
                    style="background: url(sketch_polygon.png) no-repeat; background-position: center;"
                    title={"Щелкните, чтобы начать рисовать - Дважды щелкните, для завершения"}
                    onclick={function(){inClass.addGraphic(event, parameters["color"],parameters["name"])}}
                >
                </div>
                <div
                    bind={inClass}
                    class={CSS.sketch}
                    id={"addBlur"}
                    style="background: url(sketch_blur.png) no-repeat; background-position: center;"
                    title={"Нажмите, чтобы начать, и отпустите чтобы завершить"}
                    onclick={function(){inClass.addGraphic(event, parameters["color"],parameters["name"])}}
                >
                </div>
            </fieldset>
            <fieldset
                bind={inClass}
                class={CSS.fieldSet}
            >
                <legend
                    bind={inClass}
                    class={CSS.legend}
                >
                    Удалить
                </legend>
                <div
                    bind={inClass}
                    class={CSS.sketch}
                    id={"removePoint"}
                    style="background: url(sketch_point.png) no-repeat; background-position: center;"
                    title={"Щелкните, чтобы добавить точку"}
                    onclick={function(){inClass.removeGraphic(event, parameters["color"], parameters["name"])}}
                >
                </div>
                <div
                    bind={inClass}
                    class={CSS.sketch}
                    id={"removeRectangle"}
                    style="background: url(sketch_rectangle.png) no-repeat; background-position: center;"
                    title={"Нажмите, чтобы начать, и отпустите чтобы завершить"}
                    onclick={function(){inClass.removeGraphic(event, parameters["color"], parameters["name"])}}
                >
                </div>
                <div
                    bind={inClass}
                    class={CSS.sketch}
                    id={"removePolygon"}
                    style="background: url(sketch_polygon.png) no-repeat; background-position: center;"
                    title={"Щелкните, чтобы начать рисовать - Дважды щелкните, для завершения"}
                    onclick={function(){inClass.removeGraphic(event, parameters["color"], parameters["name"])}}
                >
                </div>
                <div
                    bind={inClass}
                    class={CSS.sketch}
                    id={"removeBlur"}
                    style="background: url(sketch_blur.png) no-repeat; background-position: center;"
                    title={"Нажмите, чтобы начать, и отпустите чтобы завершить"}
                    onclick={function(){inClass.removeGraphic(event, parameters["color"], parameters["name"])}}
                >
                </div>
            </fieldset>
            <p
                class={CSS.elements}
                id={parameters["name"] + "_amount"}
            >
                {inClass.indicateLayerLength[parameters["name"]]}
            </p>
        </div>;
            inClass.arrayContent.push(content);
        })
    }
    // private print() {
    //     let globalID = this.CircuitLayer.graphics.items.map(function(item:any) {
    //         return item.attributes.GlobalID;
    //     });
    //     let TZ = document.getElementById(CSS.input + "TZ")["value"];
    //     let KS = document.getElementById(CSS.input + "KS")["value"];
    //     let Balans = document.getElementById(CSS.input + "CompanyBalans")["value"];
    //     let Exp = document.getElementById(CSS.input + "CompanyExp")["value"];
    //     let CreateOfDate = new Date();
    //     var options = {
    //         year: 'numeric',
    //         month: 'numeric',
    //         day: 'numeric',
    //         timezone: 'UTC'
    //     };
    //     let NowDate = CreateOfDate.toLocaleString("ru", options);
    //     let object = {
    //         "GlobalID": globalID,
    //         "TZ": TZ,
    //         "KS": KS,
    //         "Balans": Balans,
    //         "Exp": Exp,
    //         "Date": NowDate
    //     }
    //     let json = JSON.stringify(object);
    //     alert(json);
    //     console.log(json);
    // }
}
export = CircuitCreation;