import OlFeature from "ol/Feature";
import { LineString as OlLineString, Polygon as OlPolygon } from "ol/geom";
import * as OlSphere from "ol/sphere";
import OlBaseEvent from "ol/events/Event";
import { Interaction as OLInteraction } from "ol/interaction";
import { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import { EventsKey as OlEventsKey } from "ol/events";
import * as OlObservable from "ol/Observable";
import { Coordinate } from "ol/coordinate";
import EventType from "../../Domain/Model/EventHandlerCollection/EventType";
import InteractionInterface from "../../Domain/Model/Interaction/InteractionInterface";
import EventHandlerCollection from "../../Domain/Model/EventHandlerCollection/EventHandlerCollection";
import VectorLayer from "../../Domain/Model/Layer/Impl/VectorLayer";
import LayerBuilder from "../../Domain/Model/Layer/LayerBuilder";
import LayerInterface from "../../Domain/Model/Layer/LayerInterface";
import Map from "../../Domain/Model/Map/Map";
import SourceType from "../../Domain/Model/Source/SourceType";

export enum MeasureType {
    Distance = "LineString",
    Area = "Polygon"
}

/** @class Measure */
export default class Measure { 
    
    private map: Map;

    /**
     * @constructor
     * @memberof Measure
     * @param {Object} type - measure type
     * @param {Object} map - map object
     * @param {Function} callback - callback function to call after measure is done, measure result and coordinates of tooltip point (in map projection) are passed as parameters
     */
    constructor(type: MeasureType, map: Map, callback: (measureResult: number, tooltipCoord: number[]) => void) {
        const builder: LayerBuilder = new LayerBuilder(new VectorLayer());
        builder.setSource(SourceType.Vector);
        const layer: LayerInterface = builder.build();

        map.setDrawInteraction(layer, type);
        const interaction: InteractionInterface = map.getInteraction();
        let geomChangelistener: OlEventsKey;
        let result: number;
        let tooltipCoord: number[];

        const eventHandlers: EventHandlerCollection = new EventHandlerCollection(interaction.getInteraction());
        eventHandlers.add(EventType.DrawStart, "MeasureStartEventHandler", (e: OlBaseEvent): void => {
            const feature = (<OlDrawEvent> e).feature;
            geomChangelistener = feature.getGeometry().on("change", (evt: OlBaseEvent): void => {
                const geom: OlFeature = evt.target;
                if (geom instanceof OlPolygon) {
                    result = this.getArea(geom);
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof OlLineString) {
                    result = this.getLength(geom);
                    tooltipCoord = geom.getLastCoordinate();
                }
            });
        });
        eventHandlers.add(EventType.DrawEnd, "MeasureEndEventHandler", (e: OlBaseEvent): void => {
            OlObservable.unByKey(geomChangelistener);
            this.map.clearInteractions();
            if (typeof callback === "function") {
                callback(result, tooltipCoord);
            }
        });

        map.addLayer(layer);
        this.map = map;
    }

    /**
     * Returns the length of linestring in meters
     *
     * @function getLength
     * @memberof Measure
     * @param {Object} line - linestring instance
     * @return {Number} the length of linestring
     */
    private getLength(line: OlLineString): number {
        const length: number = OlSphere.getLength(line);
        return Math.round(length * 100) / 100;
    }

    /**
     * Returns the area of polygon in square meters
     *
     * @function getArea
     * @memberof Measure
     * @param {Object} polygon - polygon instance
     * @return {Number} the area of polygon
     */
    private getArea(polygon: OlPolygon): number {
        const area: number = OlSphere.getArea(polygon);
        return Math.round(area * 100) / 100;
    }
}