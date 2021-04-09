import { Interaction as OLInteraction} from "ol/interaction";
import OlMap from "ol/Map";
import OlVectorLayer from "ol/layer/Vector";
import OlFeature from "ol/Feature";
import OlSelect from "ol/interaction/Select";
import OlBaseEvent from "ol/events/Event";
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
import InteractionType from "../InteractionType";
import BaseInteraction from "./BaseInteraction";
import SelectionType from "./SelectionType";
import Feature from "../../Feature/Feature";
import FeatureCollection from "../../Feature/FeatureCollection";
import Map from "../../Map/Map";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";

export default class SelectInteraction extends BaseInteraction {

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {SelectionType} type - type
     */
    constructor(type: SelectionType, map: Map, callback: (feature: FeatureCollection) => void) {
        super();
        this.type = InteractionType.Select;
        switch(type) {
            case SelectionType.Pin:
                const olMap: OlMap = map.getMap();
                this.eventHandlers = new EventHandlerCollection(olMap);
                this.eventHandlers.add(EventType.Click, "PinEventHanler", (e: OlBaseEvent): void => {
                    const fc: FeatureCollection = this.pin(olMap, e);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                })
                break;
            default:
                break;
        }
    }

    /**
     * Returns FeatureCollection of features below clicked map point 
     *
     * @function pin
     * @memberof Map
     * @param {Object} point - clicked point on map
     * @return {Object} FeatureCollection 
     */     
     private pin(map: OlMap, point: OlBaseEvent): FeatureCollection {
        const featureArr: Feature[] = [];
        map.forEachFeatureAtPixel((<OlMapBrowserEvent> point).pixel, (feature: OlFeature, layer: OlVectorLayer): void => {
            if (layer) {
                const accentFeature = new Feature(feature, layer);
                featureArr.push(accentFeature);
            }
        });
        return new FeatureCollection(featureArr, map.getView().getProjection().getCode());
    }
}