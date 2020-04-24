/// <amd-dependency path = "esri/core/tsSupport/declareExtendsHelper" name = "__extends" />
/// <amd-dependency path = "esri/core/tsSupport/decorateHelper" name = "__decorate" />

/// <amd-dependency path = "esri/views/2d/viewpointUtils" name = "viewpointUtils" />
/// <amd-dependency path = "widgets/CircuitCreation/CircuitCreation" name = "CircuitCreation" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import Widget = require ("esri/widgets/Widget");

import { renderable, tsx } from "esri/widgets/support/widget";

import watchUtils = require("esri/core/watchUtils");

import MapView from "esri/views/MapView";

import Handles from "esri/core/Handles";

import Map from "esri/Map";

import Graphic from "esri/Graphic";

import Extent from "esri/geometry/Extent";

import Polygon from "esri/geometry/Polygon";

import FillSymbol from "esri/symbols/FillSymbol"

import Point from "esri/geometry/Point";

import Viewpoint from "esri/Viewpoint";

import request from "esri/request";

import PrintTask from "esri/tasks/PrintTask";

import PrintParameters from "esri/tasks/support/PrintParameters";

import PrintTemplate from "esri/tasks/support/PrintTemplate";

import GraphicsLayer from "esri/layers/GraphicsLayer";

import geometryEngine from "esri/geometry/geometryEngine"

declare const viewpointUtils : any;
declare const CircuitCreation : any;

const CSS = {
    base: "print-widget print-container esri-widget",
        headerTitle : "print-widget header-title",
        selection : "print-widget layout-section",
            pageName : "print-widget pageName",
            pageSettings : "print-widget pageSettings",
            countShtamp : "print-widget countShtamp",
            typeTopShtamp : "print-widget typeTopShtamp",
            scale : "print-widget scale",
            angleRotation_range : "print-widget angleRotation-range",
            angleRotation_number : "print-widget angleRotation-number",
        buttonExport : "print-widget buttonExport",
        listLinks : "print-widget list-links"

}
@subclass("esri.widgets.PrintWidget")
class PrintWidget extends declared(Widget) {
    defaultAngle : any = 0;
    constructor() {
        super();
    }

    @property()
    map : Map;

    @property()
    view : MapView;

    @property()
    handles : any = new Handles();

    @property()
    serviceUrl : string;

    @property()
    graphicsLayer : any;

    @property()
    polygonGraphic : any;

    @property()
    paramsService : object = {};

    @renderable()
    @property()
    pageSettingsList : any;

    @renderable()
    @property()
    countShtampList : any;

    @renderable()
    @property()
    typeTopShtampList : any;

    @renderable()
    @property()
    angleRotationDubble : any = 0;

    @property()
    titlePageNow : any;
    @property()
    pageSettingsNow : any;
    @property()
    countShtampNow : any;
    @property()
    typeTopShtampNow : any;
    @property()
    scaleNow : any = 25000;

    @property()
    @renderable()
    listLinksResults : any = [];

    @property()
    @renderable()
    resultsContainer : any = this.renderList();

    @property()
    count : any = 0;

    @property()
    countElement : any = 0;

    @renderable()
    @property()
    circuitCreation : any;

    @renderable()
    @property()
    printElements : any;

    @renderable()
    @property()
    circuitElements : any;

    @renderable()
    @property()
    elementWidget :any;

    @property()
    layoutTabSelected : any = !0;

    postInitialize() {
        // watchUtils.once(this, "view.extent.center", () => this._ready());
        request(this.serviceUrl, {
            query: {
                f: "json"
            },
            responseType: "json"
        }).then( (response) => {
            response.data.parameters.forEach( (object:any) => {
                this.paramsService[object.name] = object;
            });
            this.pageSettingsList = this.paramsService["Layout_Template"].choiceList.map( (element:any, i:any) => {
                if (i == 0) {
                    this.pageSettingsNow = element;
                    return <option bind = {this} selected>{element}</option>
                }
                else {return <option bind = {this}>{element}</option>}
            });
            this.countShtampList = this.paramsService["count_shtamp"].choiceList.map( (element:any, i:any) => {
                if (i == 0) {
                    this.countShtampNow = element;
                    return <option bind = {this} selected>{element}</option>
                }
                else {return <option bind = {this}>{element}</option>}
            });
            this.typeTopShtampList = this.paramsService["top_shtamp"].choiceList.map( (element:any, i:any) => {
                if (i == 0) {
                    this.typeTopShtampNow = element;
                    return <option bind = {this} selected>{element}</option>
                }
                else {return <option bind = {this}>{element}</option>}
            })
        });

        this.graphicsLayer = new GraphicsLayer({
            id : "print",
            title : "Слой печати",
            visible : true,
        });
        this.map.add(this.graphicsLayer);
        
        watchUtils.once(this, "view.extent.center", () => {
            let centroid = this.view.extent.center;
            let sizeY = (this.scaleNow/200) * 41.45;
            let sizeX = (this.scaleNow/200) * 29;
            
            let fillSymbol = {type: "simple-fill", color: [0, 0, 0, 0], outline: {color: [0, 255, 0], width: 1}};
    
            let polygonGraphic = new Graphic({
                geometry: new Polygon({
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
            polygonGraphic.geometry.spatialReference = this.view.spatialReference;
            this.graphicsLayer.graphics.add(polygonGraphic);
        });

        this.own([
            this.handles.add([
                this.view.on("drag", (e) => {
                    let graphic = this.graphicsLayer.graphics.items[0];
                    let point = new Point(this.view.toMap({x:e.x,y:e.y}));
                    let contains = geometryEngine.contains(graphic.geometry, point);
                    if (contains) {
                        if (e.action == "start" || e.action == "end") {
                            this._selectFrame(e);
                        } else if (e.action == "update") {
                            this._moveFrame(e);
                        }
                    }
                })
            ])
        ])

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

        this.circuitElements = <div
            bind = {this}
        >
            {this.circuitCreation.render()}
        </div>

    }

    render() {
        const pageName = (
            <div
                bind = {this}
                class = {"print-widget formation"}
            >
                <label
                    bind = {this}
                    class = {"print-widget labelFormation"}
                >{"Название"}</label>
                <input
                    bind = {this}
                    class = {CSS.pageName}
                    placeholder = {"Название"}
                    type = {"text"}
                    oninput = { (event:any) => {
                        this.titlePageNow = event.target.value;
                    }}
                ></input>
            </div>
        )
        const pageSettings = (
            <div
                bind = {this}
                class = {"print-widget formation"}
            >
                <label
                    bind = {this}
                    class = {"print-widget labelFormation"}
                >{"Параметры страницы"}</label>
                <select
                    bind = {this}
                    class = {CSS.pageSettings}
                    onchange = { (event:any) => {
                        this.pageSettingsNow = event.target.value;
                        if (event.target.value == "А4 портрет") {
                            this.angleRotationDubble = 0;
                            this.rotate(this.angleRotationDubble);
                        } else
                        if (event.target.value == "А4 альбом") {
                            this.angleRotationDubble = 90 || -90;
                            this.rotate(this.angleRotationDubble);
                        }
                    }}
                >
                    {this.pageSettingsList}
                </select>
            </div>
        )
        const countShtamp = (
            <div
                bind = {this}
                class = {"print-widget formation"}
            >
                <label
                    bind = {this}
                    class = {"print-widget labelFormation"}
                >{"Количество подписантов"}</label>
                <select
                    bind = {this}
                    class = {CSS.countShtamp}
                    onchange = { (event:any) => {
                        this.countShtampNow = event.target.value;
                    }}
                >
                    {this.countShtampList}
                </select>
            </div>
        )
        const typeTopShtamp = (
            <div
                bind = {this}
                class = {"print-widget formation"}
            >
                <label
                    bind = {this}
                    class = {"print-widget labelFormation"}
                >{"Тип верхнего штампа"}</label>
                <select
                    bind = {this}
                    class = {CSS.typeTopShtamp}
                    onchange = { (event:any) => {
                        this.typeTopShtampNow = event.target.value;
                    }}
                >
                    {this.typeTopShtampList}
                </select>
            </div>
        )
        const scale = (
            <div
                bind = {this}
                class = {"print-widget formation"}
            >
                <label
                    bind = {this}
                    class = {"print-widget labelFormation"}
                >{"Установить масштаб"}</label>
                <input
                    bind = {this}
                    class = {CSS.scale}
                    type = {"number"}
                    min = {"0"}
                    value = {this.scaleNow}
                    oninput = { (event:any) => {
                        this.scaleNow = event.target.value
                    }}
                ></input>
            </div>
        )
        const angleRotation = (
            <div
                bind = {this}
                class = {"print-widget formation"}
            >
                <label
                    bind = {this}
                    class = {"print-widget labelFormation"}
                >{"Поворот области печати"}</label>
                <div
                    bind = {this}
                    class = {"angleRotation-range-container"}
                >
                    <input
                        bind = {this}
                        class = {CSS.angleRotation_range}
                        type = {"range"}
                        min = {"-90"}
                        max = {"90"}
                        value = {this.angleRotationDubble}
                        step = {"1"}
                        oninput = {function(event:any) {
                            this.angleRotationDubble = event.target.value;
                            this.rotate(this.angleRotationDubble);
                        }}
                    ></input>
                </div>
                <input
                    bind = {this}
                    class = {CSS.angleRotation_number}
                    type = {"number"}
                    min = {"-90"}
                    max = {"90"}
                    value = {this.angleRotationDubble}
                    step = {"1"}
                    oninput = {function(event:any) {
                        this.angleRotationDubble = event.target.value;
                        this.rotate(this.angleRotationDubble);
                    }}
                ></input>
            </div>
        )
        const headerTitle = (
            <header
                bind = {this}
                class = {CSS.headerTitle}
            >{"Экспорт"}</header>
        )
        const tabLinks = (
            <div
                bind = {this}
                class = {"printwidget tab-list-links"}
            >
                <button
                    bind = {this}
                    class = {"print-widget tab-link-action"}
                    onclick = { (event : any) => {this._toggleLayoutPanel(event)}}
                >{"Компоновка"}</button>
                <button
                    bind = {this}
                    class = {"print-widget tab-link"}
                    onclick = { (event : any) => {this._toggleLayoutPanel(event)}}
                >{"Сети"}</button>
            </div>
        )
        this.printElements = <div
            bind = {this}
        >
            {pageName}
            {pageSettings}
            {countShtamp}
            {typeTopShtamp}
            {scale}
            {angleRotation}
        </div>
        const section = (
            <section
                bind = {this}
                class = {CSS.selection}
            >   
                {this.elementWidget = this.layoutTabSelected ? this.printElements : this.circuitElements}
                {/* {pageName}
                {pageSettings}
                {countShtamp}
                {typeTopShtamp}
                {scale}
                {angleRotation} */}
            </section>
        )
        const buttonExport = (
            <div
                bind = {this}
                class = {CSS.buttonExport}
                onclick = { () => {this._print()}}
            >
                {"Экспорт"}
            </div>
        )
        const listLinks = (
            <div
                bind = {this}
                class = {CSS.listLinks}
            >
                <h3
                    bind = {this}
                    class = {"print-widget"}
                >{"Экспортированные файлы"}</h3>
                {this.resultsContainer}
            </div>
        )
        const base = (
            <div
                bind = {this}
                class = {CSS.base}
            >
                {headerTitle}
                {tabLinks}
                {section}
                {buttonExport}
                {listLinks}
            </div>
        )
        return base;
    }
    private renderList() {
        if (this.listLinksResults.length == 0) {
            return <div
                bind = {this}
                class = {"print-widget default-result"}
            >Ваши экспортированные карты появятся здесь.</div>;
        } else {
            return this.listLinksResults.map( (link:any) => {
                return <div
                    bind = {this}
                    key = {link.count}
                    class = "print-widget link-container"
                >
                    <a
                        bind = {this}
                        class = {link.className}
                        href = {link.url}
                        name = {link.title}
                        target = {"_blank"}
                    >
                        <div
                            bind = {this}
                            class = {"print-widget link-loader"}
                        ></div>
                        <span
                            bind = {this}
                            class = {"print-widget link-title"}
                        >
                            {link.title}
                        </span>
                    </a>
                </div>
            });
        }
    }
    private _toggleLayoutPanel(event:any) {
        for (let i = 0; i < event.target.parentElement.children.length; i++) {
            event.target.parentElement.children[i].className = "print-widget tab-link"
        }
        event.target.className = "print-widget tab-link-action"

        if (event.target.innerText == "Компоновка") {
            this.layoutTabSelected = true
        } else if (event.target.innerText == "Сети") {
            this.layoutTabSelected = false
        }
    }
    private _selectFrame(e:any) {
        let graphic = this.graphicsLayer.graphics.items[0];
        let fillSymbol;
        if (e.action == "start") {
            fillSymbol = {type: "simple-fill", color: null, outline: {color: [255, 0, 0], width: 1}};
            graphic.symbol = fillSymbol
        } else
        if (e.action == "end") {
            fillSymbol = {type: "simple-fill", color: null, outline: {color: [0, 255, 0], width: 1}};
            graphic.symbol = fillSymbol
        }
    }
    private _moveFrame(e:any) {
        e.stopPropagation();
        let point = new Point(this.view.toMap({x:e.x,y:e.y}));
        var graphic = this.graphicsLayer.graphics.items[0];
        if(!graphic && !point) return;
        var dx = point.x - graphic.geometry.centroid.x;
        var dy = point.y - graphic.geometry.centroid.y;
        let rings = graphic.geometry.rings[0].map(function(vertex:any){
            return [
                vertex[0] + dx,
                vertex[1] + dy
            ];
        });
        var frameGraphic = new Polygon({rings: [rings]});
        frameGraphic.spatialReference = this.view.spatialReference;
        graphic.geometry = frameGraphic;
    }
    private _print() {
        var printTask = new PrintTask({
            url: this.serviceUrl
        });
        let printTemplate = new PrintTemplate({
            format: this.paramsService["Format"].defaultValue,
            layout: this.pageSettingsNow,
            outScale : this.scaleNow,
            layoutOptions : {
                titleText : this.titlePageNow || "Без заголовка"
            }
        })
        printTemplate["countShtamp"] = this.countShtampNow;
	    printTemplate["topShtamp"] = this.typeTopShtampNow;
		printTemplate["rotation"] = this.angleRotationDubble;
        
        let viewPoint = new Viewpoint({
            scale : this.scaleNow,
            targetGeometry : this.graphicsLayer.graphics.items[0].geometry
        })
        var sizeView=this.get("view.size");
        let viewPointUtils = viewpointUtils.getExtent(new Extent, viewPoint, sizeView)
        var params = new PrintParameters({
            view: this.view,
            template: printTemplate,
            extraParameters : {
                count_shtamp : this.countShtampNow,
                top_shtamp : this.typeTopShtampNow,
                rotation : this.angleRotationDubble
            }
        });
        params["extent"] = viewPointUtils;

        let fullName;
        if (printTemplate.layoutOptions.titleText == "Без заголовка") {
            fullName = `${printTemplate.layoutOptions.titleText}(${this.count}).${printTemplate.format}`;
            this.count++;
        } else {
            fullName = `${printTemplate.layoutOptions.titleText}.${printTemplate.format}`;
        }
        let newLinkObject = {
            url : "",
            title : fullName,
            count : this.countElement,
            className : "print-widget link-container--loading"
        }
        this.countElement++;

        this.listLinksResults.push(newLinkObject);

        printTask.execute(params).then( (response) => {
            let link = this.listLinksResults[newLinkObject.count];
            link.url = response.url
            link.className = "print-widget link-container--ready"

            this.resultsContainer = this.renderList();
        }, (error) => {
            let link = this.listLinksResults[newLinkObject.count];
            link.className = "print-widget link-container--error"

            this.resultsContainer = this.renderList();
        })
        this.resultsContainer = this.renderList();
    }
    private rotate(value:any) {
        let graphic = this.graphicsLayer.graphics.items[0];
        var rotateAngle = -(value - this.defaultAngle);
        var cosAngle = Math.cos(rotateAngle*Math.PI/180), sinAngle = Math.sin(rotateAngle*Math.PI/180);
        graphic.geometry.rings[0] = graphic.geometry.rings[0].map(function(vertex:any){
            var dx = vertex[0] - graphic.geometry.centroid.x;
            var dy = vertex[1] - graphic.geometry.centroid.y;
            return [
                dx*cosAngle - dy*sinAngle + graphic.geometry.centroid.x,
                dx*sinAngle + dy*cosAngle + graphic.geometry.centroid.y
            ];
        });
        var frameGraphic = new Polygon({rings: graphic.geometry.rings});
		frameGraphic.spatialReference = this.view.spatialReference;
        this.graphicsLayer.graphics.items[0].geometry = frameGraphic;
        this.defaultAngle = value;
    }
}
export = PrintWidget;