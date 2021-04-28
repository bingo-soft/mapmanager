import OlTransform, { TransformEvent as OlTransformEvent } from "ol-ext/interaction/Transform";
import {shiftKeyOnly as OlEventConditionShiftKeyOnly} from "ol/events/condition"
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
import { TransformCallbackFunction } from "../InteractionCallbackType";


/** @class TransformInteraction */
export default class TransformInteraction extends BaseInteraction {

    private callback: TransformCallbackFunction;
    private static readonly ROTATE_CURSOR = "url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXAgMAAACdRDwzAAAAAXNSR0IArs4c6QAAAAlQTFRF////////AAAAjvTD7AAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2wwSEgUFmXJDjQAAAEZJREFUCNdjYMAOuCCk6goQpbp0GpRSAFKcqdNmQKgIILUoNAxIMUWFhoKosNDQBKDgVAilCqcaQBogFFNoGNjsqSgUTgAAM3ES8k912EAAAAAASUVORK5CYII=\') 5 5, auto";

    /**
     * @constructor
     * @memberof TransformInteraction
     * @param {Function} callback - callback function (features: FeatureCollection): void to call after feature is modified
     */
    constructor(callback?: TransformCallbackFunction) {
        super();
        this.handler = this.handler.bind(this);
        const opts: unknown = {
            enableRotatedTransform: false,
            addCondition: OlEventConditionShiftKeyOnly,
            // layers: [vector],
            hitTolerance: 2,
            translateFeature: false,
            scale: true,
            rotate: true,
            keepAspectRatio: false,
            translate: true,
            stretch: true
        };
        this.callback = callback;
        this.interaction = new OlTransform(opts);
        (<OlTransform> this.interaction).Cursors["rotate"] = TransformInteraction.ROTATE_CURSOR;
        this.type = InteractionType.Transform;
        this.eventHandlers = new EventHandlerCollection(this.interaction);
        this.eventHandlers.add(EventType.RotateFeature, "RotateFeatureEventHanler", this.handler);
        this.eventHandlers.add(EventType.TranslateFeature, "TranslateFeatureEventHanler", this.handler);
        this.eventHandlers.add(EventType.ScaleFeature, "ScaleEventFeatureHanler", this.handler);
    }

    private handler(e: OlBaseEvent): void {
        if (typeof this.callback === "function") {
            const olMap: OlMap = this.interaction.getMap(); 
            const srs: string = olMap.getView().getProjection().getCode();
            const selectedFeatures: OlFeature[] = (<OlTransformEvent> e).features.getArray();
            this.callback(new FeatureCollection(selectedFeatures, srs));
        }
    }

}