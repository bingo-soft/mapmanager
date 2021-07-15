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
import { ModifyCallbackFunction } from "../InteractionCallbackType";
import Feature from "../../Feature/Feature";

/** @class ModifyInteraction */
export default class ModifyInteraction extends BaseInteraction {

    /**
     * @constructor
     * @memberof ModifyInteraction
     * @param {Object} source - layer or features to modify
     * @param {Function} callback - callback function to call after geometry is modified
     */
    constructor(source: LayerInterface | FeatureCollection, callback?: ModifyCallbackFunction) {
        super();
        const opts: unknown = {};
        if (source instanceof FeatureCollection) {
            const olFeatures: OlFeature[] = [];
            source.getFeatures().forEach((feature: Feature): void => {
                olFeatures.push(feature.getFeature());
            });
            opts["features"] = new Collection(olFeatures);
        } else {
            opts["source"] = source.getSource();            
        }
        this.interaction = new OlModify(opts);
        this.type = InteractionType.Modify;
        this.eventHandlers = new EventHandlerCollection(this.interaction);
        this.eventHandlers.add(EventType.ModifyFeature, "ModifyEventHandler", (e: OlBaseEvent): void => {
            if (typeof callback === "function") {
                const modifiedFeatures = (<OlModifyEvent> e).features.getArray();
                const fc = new FeatureCollection(modifiedFeatures);
                fc.setDirty(true);
                callback(fc);
            }
        });
    }

}