import { Interaction as OLInteraction} from "ol/interaction";
import OlMap from "ol/Map";
import OlVectorLayer from "ol/layer/Vector";
import OlFeature from "ol/Feature";
import OlSelect from "ol/interaction/Select";
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
import InteractionType from "../InteractionType";
import BaseInteraction from "./BaseInteraction";
import SelectionType from "./SelectionType";
import { EventHandlerCollection } from "../EventHandlerCollection";
import Feature from "../../../Feature/Feature";
import FeatureCollection from "../../../Feature/FeatureCollection";
import Map from "../../Map";

export default class SelectionInteraction extends BaseInteraction {

    private eventHandlers: EventHandlerCollection;

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {SelectionType} type - type
     */
    constructor(map: Map, type: SelectionType, callback: (feature: FeatureCollection) => void) {
        super();
        this.type = InteractionType.Select;
        switch(type) {
            case SelectionType.Pin:
                const olMap: OlMap = map.getMap();
                const clickHandler = (e: OlMapBrowserEvent): void => {
                    const fc: FeatureCollection = this.pin(olMap, e);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                };
                this.eventHandlers["click"].push(clickHandler);
                olMap.on("click", (e: OlMapBrowserEvent): void => {
                    const fc: FeatureCollection = this.pin(olMap, e);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                });
                break;
            default:
                break;
        }
    }

    clear(): void {
        for (let i in this.eventHandlers["click"]) {
            
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
     private pin(map: OlMap, point: OlMapBrowserEvent): FeatureCollection {
        const featureArr: Feature[] = [];
        map.forEachFeatureAtPixel(point.pixel, (feature: OlFeature, layer: OlVectorLayer): void => {
            if (layer) {
                const accentFeature = new Feature(feature, layer);
                featureArr.push(accentFeature);
            }
        });
        return new FeatureCollection(featureArr, map.getView().getProjection().getCode());
    }
}