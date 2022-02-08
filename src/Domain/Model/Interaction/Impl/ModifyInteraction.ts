import OlModify, { ModifyEvent as OlModifyEvent } from "ol/interaction/Modify";
import OlFeature from "ol/Feature";
import OlBaseEvent from "ol/events/Event";
import Collection from 'ol/Collection';
import BaseInteraction from "./BaseInteraction";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventBus from "../../EventHandlerCollection/EventBus";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import FeatureCollection from "../../Feature/FeatureCollection";
import LayerInterface from "../../Layer/LayerInterface";
import { ModifyCallbackFunction } from "../InteractionCallbackType";
import SourceChangedEvent from "../../Source/SourceChangedEvent";

/** @class ModifyInteraction */
export default class ModifyInteraction extends BaseInteraction {

    private layer: LayerInterface;

    /**
     * @param source - target layer for interaction
     * @param callback - callback function to call after geometry is modified
     */
    constructor(source: LayerInterface, callback?: ModifyCallbackFunction) {
        super();
        const opts: unknown = {};
        this.layer = source;
        opts["source"] = source.getSource();
        const eventBus = source.getEventBus(); 
        this.interaction = new OlModify(opts);
        this.type = InteractionType.Modify;
        this.eventHandlers = new EventHandlerCollection(this.interaction);
        this.eventHandlers.add(EventType.ModifyFeature, "ModifyEventHandler", (e: OlBaseEvent): void => {
            const modifiedFeatures = (<OlModifyEvent> e).features.getArray();
            const fc = new FeatureCollection(modifiedFeatures);
            this.layer.setDirtyFeatures(fc);
            if (typeof callback === "function") {               
                callback(fc);
            } 
            if (eventBus) {
                eventBus.dispatch(new SourceChangedEvent());
            }
        });
    }

}