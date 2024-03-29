import OlBaseEvent from "ol/events/Event";
import OlMapBrowserEvent from "ol/MapBrowserEvent";
import BaseInteraction from "./BaseInteraction";
import ZoomType from "./ZoomType";
import Map from "../../Map/Map";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import MethodNotImplemented from "../../../Exception/MethodNotImplemented";
import InteractionType from "../InteractionType";

/** ZoomInteraction */
export default class ZoomInteraction extends BaseInteraction {

    /**
     * @param type - zoom type
     * @param map - map object to zoom
     */
    constructor(type: ZoomType, map: Map) {
        super();
        this.type = InteractionType.Zoom;
        this.eventHandlers = new EventHandlerCollection(map.getMap());
        this.eventHandlers.add(EventType.Click, "ZoomEventHandler", (e: OlBaseEvent): void => {
            const zoom = map.getMap().getView().getZoom();
            map.getMap().getView().setCenter((<OlMapBrowserEvent<UIEvent>> e).coordinate);
            if (type == ZoomType.In) {   
                map.getMap().getView().setZoom(zoom + 1);
            } else {
                map.getMap().getView().setZoom(zoom - 1);
            }
        });
    }

    /**
     * Sets or unsets interaction active
     * @param active - activity flag
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setActive(active: boolean): void {
        throw new MethodNotImplemented();
    }
}