import OlFeature from "ol/Feature";
import { LineString as OlLineString, Polygon as OlPolygon } from "ol/geom";
import { EventsKey as OlEventsKey } from "ol/events";
import { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import OlOverlay from "ol/Overlay";
import { Coordinate as  OlCoordinate} from "ol/coordinate";
import * as OlSphere from "ol/sphere";
import OlBaseEvent from "ol/events/Event";
import BaseInteraction from "./BaseInteraction";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import MeasureType from "../MeasureType";
import * as OlObservable from "ol/Observable";
import Map from "../../Map/Map";
import { MeasureCallbackFunction } from "../InteractionCallbackType";
import { Coordinate } from "ol/coordinate";

/** MeasureInteraction */
export default class MeasureInteraction extends BaseInteraction {
  
    /**
     * @param type - measure type
     * @param popupSettings - popup settings
     * @param map - map object
     * @param callback - callback function to call after measurement is done
     */
    constructor(type: MeasureType, popupSettings: unknown, map: Map , callback: MeasureCallbackFunction) {
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
            let overlay: OlOverlay;
            tooltipCoord = (<any> e).coordinate;
            const feature = (<OlDrawEvent> e).feature;
            geomChangelistener = feature.getGeometry().on("change", (evt: OlBaseEvent): void => {
                const geom: OlFeature = evt.target;
                if (geom instanceof OlPolygon) {
                    result = this.getArea(geom).toString() + " " + popupSettings["area_units"];
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    tooltip.innerHTML = result;
                } else if (geom instanceof OlLineString) {
                    result = this.getLength(geom).toString() + " " + popupSettings["distance_units"];
                    tooltipCoord = geom.getLastCoordinate();
                    tooltip.innerHTML = result;
                    const angles = this.getAngles(<OlLineString> geom);
                    if (angles["rotation"] != null && !isNaN(angles["rotation"])) {
                        tooltip.innerHTML += ", " + popupSettings["rotation_caption"] + ": " + angles["rotation"].toFixed(2).toString() + "\u00B0";
                    }
                    if (angles["angle"] != null && !isNaN(angles["angle"])) {
                        tooltip.innerHTML += ", " + popupSettings["angle_caption"] + ": " + angles["angle"].toFixed(2).toString() + "\u00B0";
                    }
                }
                overlay.setPosition(tooltipCoord);
            });
            const tooltip: HTMLElement = document.createElement("div");
            tooltip.className = "tooltip tooltip-static";
            overlay = map.createMeasureOverlay(tooltip, tooltipCoord, [0, -7]);
        });
        this.eventHandlers.add(EventType.DrawEnd, "MeasureEndEventHandler", (e: OlBaseEvent): void => {
            OlObservable.unByKey(geomChangelistener);
           /*  const tooltip: HTMLElement = document.createElement("div");
            tooltip.className = "tooltip tooltip-static";
            tooltip.innerHTML = result; 
            map.createMeasureOverlay(tooltip, tooltipCoord, [0, -7]); */
            if (typeof callback === "function") {
                callback(result);
            }
        });
    }

    /**
     * Returns the length of linestring in meters
     * @param line - linestring instance
     * @return length of linestring
     */
    private getLength(line: OlLineString): number {
        const length = OlSphere.getLength(line);
        return Math.round(length * 100) / 100;
    }

    /**
     * Returns the area of polygon in square meters
     * @param polygon - polygon instance
     * @return area of polygon
     */
    private getArea(polygon: OlPolygon): number {
        const area = OlSphere.getArea(polygon);
        return Math.round(area * 100) / 100;
    }

    /**
     * Returns rotation of line and angle between two last segments of line
     * @param line - linestring instance
     * @return rotation of line and angle between two last segments of line
     */
    private getAngles(line: OlLineString): unknown {
        let rotation1: number;
        let rotation2: number;
        let angle: number;
        const segments: number[][] = [];
        line.forEachSegment((start: OlCoordinate, end: OlCoordinate): boolean => {
            segments.push([start[0], start[1], end[0], end[1]]);
            return false;
        });   
        if (segments.length) {
            const lastSegment = segments[segments.length-1];
            rotation1 = Math.atan2(lastSegment[2] - lastSegment[0], lastSegment[3] - lastSegment[1]) * 180 / Math.PI;
            const lastButOneSegment = segments[segments.length-2];
            if (lastButOneSegment) {
                rotation2 = Math.atan2(lastButOneSegment[2] - lastButOneSegment[0], lastButOneSegment[3] - lastButOneSegment[1]) * 180 / Math.PI;
                if (rotation2 && rotation2 < 0) {
                    rotation2 += 360;
                }
                angle = rotation2 - rotation1;
            }
            if (rotation1 && rotation1 < 0) {
                rotation1 += 360;
            }
            angle -= 180;
            if (angle && angle < 0) {
                angle += 360;
            }
            if (angle && angle > 360) {
                angle -= 360;
            }
        }    
        return {"rotation": rotation1, "angle": angle};
    }

}