import OlTransform, { TransformEvent as OlTransformEvent } from "ol-ext/interaction/Transform";
import {shiftKeyOnly as OlEventConditionShiftKeyOnly} from "ol/events/condition"
import OlFeature from "ol/Feature";
import OlBaseEvent from "ol/events/Event";
import BaseInteraction from "./BaseInteraction";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import FeatureCollection from "../../Feature/FeatureCollection";
import { TransformCallbackFunction } from "../InteractionCallbackType";
import LayerInterface from "../../Layer/LayerInterface";
import SourceChangedEvent from "../../Source/SourceChangedEvent";


/** TransformInteraction */
export default class TransformInteraction extends BaseInteraction {

    private layer: LayerInterface;
    private callback: TransformCallbackFunction;
    private static readonly ROTATE_CURSOR = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXAgMAAACdRDwzAAAAAXNSR0IArs4c6QAAAAlQTFRF////////AAAAjvTD7AAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2wwSEgUFmXJDjQAAAEZJREFUCNdjYMAOuCCk6goQpbp0GpRSAFKcqdNmQKgIILUoNAxIMUWFhoKosNDQBKDgVAilCqcaQBogFFNoGNjsqSgUTgAAM3ES8k912EAAAAAASUVORK5CYII=') 5 5, auto";

    /**
     * @param layer - target layer for interaction
     * @param callback - callback function after geometry is transformed
     */
    constructor(layer: LayerInterface, callback?: TransformCallbackFunction) { 
        super();
        this.layer = layer;
        this.handler = this.handler.bind(this);
        const optsTransform: unknown = {
            enableRotatedTransform: false,
            addCondition: OlEventConditionShiftKeyOnly,
            layers: [layer.getLayer()],
            hitTolerance: 2,
            translateFeature: false,
            scale: true,
            rotate: true,
            translate: true,
            stretch: true,
            keepAspectRatio: false
        };
        this.callback = callback;
        this.interaction = new OlTransform(optsTransform);
        (<OlTransform> this.interaction).Cursors["rotate"] = TransformInteraction.ROTATE_CURSOR;
        this.type = InteractionType.Transform;
        this.eventHandlers = new EventHandlerCollection(this.interaction);
        this.eventHandlers.add(EventType.RotateFeature, "RotateFeatureEventHandler", this.handler);
        this.eventHandlers.add(EventType.TranslateFeature, "TranslateFeatureEventHandler", this.handler);
        this.eventHandlers.add(EventType.ScaleFeature, "ScaleFeatureEventHandler", this.handler);
    }

    /**
     * A handler for events
     * @param e - event
     */
    private handler(e: OlBaseEvent): void {
        const eventBus = this.layer.getEventBus();
        const transformedFeatures: OlFeature[] = (<OlTransformEvent> e).features.getArray();
        const fc = new FeatureCollection(transformedFeatures);
        this.layer.setDirtyFeatures(fc, true);        
        if (typeof this.callback === "function") {                      
            this.callback(fc);
        }
        if (eventBus) {
            eventBus.dispatch(new SourceChangedEvent());
        }
    }

}