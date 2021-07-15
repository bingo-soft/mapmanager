import OlFeature from "ol/Feature";
import { LineString as OlLineString, Polygon as OlPolygon } from "ol/geom";
import { EventsKey as OlEventsKey } from "ol/events";
import OlDraw, { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import OlVectorLayer from "ol/layer/Vector";
import OlCollection from 'ol/Collection';
import OlGeometryType from "ol/geom/GeometryType";
import * as OlSphere from "ol/sphere";
import OlBaseEvent from "ol/events/Event";
import BaseInteraction from "./BaseInteraction";
import LayerInterface from "../../Layer/LayerInterface";
import Feature from "../../Feature/Feature";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import { DrawCallbackFunction } from "../InteractionCallbackType";
import MeasureType from "../MeasureType";
import LayerBuilder from "../../Layer/LayerBuilder";
import SourceType from "../../Source/SourceType";
import InteractionInterface from "../InteractionInterface";
import * as OlObservable from "ol/Observable";
import VectorLayer from "../../Layer/Impl/VectorLayer";
import Map from "../../Map/Map";
import { MeasureCallbackFunction } from "../InteractionCallbackType";

/** @class MeasureInteraction */
export default class MeasureInteraction extends BaseInteraction {

    //private map: Map;
    
    /**
     * @constructor
     * @memberof MeasureInteraction
     * @param {Object} type - measure type
     * @param {Object} units - units
     * @param {Object} map - map object
     * @param {Function} callback - callback function to call after measurement is done
     */
    constructor(type: MeasureType, units: unknown, map: Map , callback: MeasureCallbackFunction) {
        super();

        let realType: string;
        switch (type) {
            case MeasureType.Distance:
                realType = "LineString";
                break;
            case MeasureType.Area:
                realType = "Polygon";
                break;
            default:
        }
    
        const layer = map.createMeasureLayer();
        map.setDrawInteraction(layer, realType);
        const interaction = map.getInteraction();
        let geomChangelistener: OlEventsKey;
        let result: string;
        let tooltipCoord: number[];

        this.eventHandlers = new EventHandlerCollection(interaction.getInteraction());
        this.eventHandlers.add(EventType.DrawStart, "MeasureStartEventHandler", (e: OlBaseEvent): void => {
            const feature = (<OlDrawEvent> e).feature;
            geomChangelistener = feature.getGeometry().on("change", (evt: OlBaseEvent): void => {
                const geom: OlFeature = evt.target;
                if (geom instanceof OlPolygon) {
                    result = this.getArea(geom).toString() + " " + units["area"];
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof OlLineString) {
                    result = this.getLength(geom).toString() + " " + units["distance"];
                    tooltipCoord = geom.getLastCoordinate();
                }
            });
        });
        this.eventHandlers.add(EventType.DrawEnd, "MeasureEndEventHandler", (e: OlBaseEvent): void => {
            OlObservable.unByKey(geomChangelistener);
            //this.map.clearInteractions();
            const tooltip: HTMLElement = document.createElement("div");
            tooltip.className = "tooltip tooltip-static";
            tooltip.innerHTML = result;
            map.createMeasureOverlay(tooltip, tooltipCoord, [0, -7]);
            if (typeof callback === "function") {
                callback(result);
            }
        });
    }

    /**
     * Returns the length of linestring in meters
     *
     * @function getLength
     * @memberof MeasureInteraction
     * @param {Object} line - linestring instance
     * @return {Number} the length of linestring
     */
    private getLength(line: OlLineString): number {
        const length = OlSphere.getLength(line);
        return Math.round(length * 100) / 100;
    }

    /**
     * Returns the area of polygon in square meters
     *
     * @function getArea
     * @memberof MeasureInteraction
     * @param {Object} polygon - polygon instance
     * @return {Number} the area of polygon
     */
    private getArea(polygon: OlPolygon): number {
        const area = OlSphere.getArea(polygon);
        return Math.round(area * 100) / 100;
    }

}