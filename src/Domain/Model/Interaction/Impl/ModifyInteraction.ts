import OlModify, { ModifyEvent as OlModifyEvent } from "ol/interaction/Modify";
import OlMap from "ol/Map";
import OlFeature from "ol/Feature";
import OlBaseEvent from "ol/events/Event";
import Collection from 'ol/Collection';
import BaseInteraction from "./BaseInteraction";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import FeatureCollection from "../../Feature/FeatureCollection";
import LayerInterface from "../../Layer/LayerInterface";
import VectorLayer from "../../Layer/Impl/VectorLayer"

/** @class ModifyInteraction */
export default class ModifyInteraction extends BaseInteraction {

    /**
     * @constructor
     * @memberof ModifyInteraction
     * @param {Object} source - layer or features to modify
     * @param {Function} callback - callback function to call after geometry is modified
     */
    constructor(source: LayerInterface | FeatureCollection, callback: (features: FeatureCollection) => void) {
        super();
        const opts: unknown = {};
        if (source instanceof FeatureCollection) {
            opts["features"] = new Collection((<FeatureCollection> source).getFeatures());
        } else {
            opts["source"] = (<VectorLayer> source).getSource();            
        }
        this.interaction = new OlModify(opts);
        this.type = InteractionType.Modify;
        this.eventHandlers = new EventHandlerCollection(this.interaction);
        this.eventHandlers.add(EventType.ModifyFeature, "ModifyEventHanler", (e: OlBaseEvent): void => {
            if (typeof callback === "function") {
                const olMap: OlMap = this.interaction.getMap(); 
                const srs: string = olMap.getView().getProjection().getCode();
                const selectedFeatures: OlFeature[] = (<OlModifyEvent> e).features.getArray();
                callback(new FeatureCollection(selectedFeatures, srs));
            }
        });
    }

}