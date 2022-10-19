import * as OlProj from "ol/proj";
import OlMapBrowserEvent from "ol/MapBrowserEvent";
import BaseInteraction from "./BaseInteraction";
import Map from "../../Map/Map";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import MethodNotImplemented from "../../../Exception/MethodNotImplemented";
import { MapCoordinatesCallbackFunction } from "../InteractionCallbackType";
import InteractionType from "../InteractionType";

/** MapCoordinatesInteraction */
export default class MapCoordinatesInteraction extends BaseInteraction {

    /**
     * @param map - map object
     * @param callback - callback function returning coordinates
     * @param srsId - SRS Id to return coordinates in
     */
    constructor(map: Map, type: EventType, callback: MapCoordinatesCallbackFunction, srsId?: number) {
        super();
        this.type = type == EventType.Click ? InteractionType.MapCoordinatesClick : InteractionType.MapCoordinatesPointerMove;
        const olMap = map.getMap();
        const mapProj = olMap.getView().getProjection().getCode();
        this.eventHandlers = new EventHandlerCollection(olMap);
        this.eventHandlers.add(type, "MapCoordinatesEventHandler", (e: OlMapBrowserEvent): void => {
            let coordinate = e.coordinate;
            if (srsId !== undefined) {
                const retProj = "EPSG:" + srsId.toString();
                if (mapProj != retProj) {
                    coordinate = OlProj.transform(coordinate, mapProj, retProj);
                }
            }
            if (typeof callback == 'function') {
                callback(coordinate, e.pixel, mapProj);
            }
        });
    }

    /**
     * Sets or unsets interaction active
     * @param active - activity flag
     */
    public setActive(active: boolean): void {
        throw new MethodNotImplemented();
    }
}