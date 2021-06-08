import OlTransform, { TransformEvent as OlTransformEvent } from "ol-ext/interaction/Transform";
import {shiftKeyOnly as OlEventConditionShiftKeyOnly} from "ol/events/condition"
import OlMap from "ol/Map";
import OlFeature from "ol/Feature";
import OlBaseEvent from "ol/events/Event";
import { Layer as OlLayer } from "ol/layer";
import BaseInteraction from "./BaseInteraction";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import FeatureCollection from "../../Feature/FeatureCollection";
import { TransformCallbackFunction } from "../InteractionCallbackType";
import LayerInterface from "../../Layer/LayerInterface";


/** @class TransformInteraction */
export default class TransformInteraction extends BaseInteraction {

    private callback: TransformCallbackFunction;
    private static readonly ROTATE_CURSOR = "url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXAgMAAACdRDwzAAAAAXNSR0IArs4c6QAAAAlQTFRF////////AAAAjvTD7AAAAAF0Uk5TAEDm2GYAAAABYktHRACIBR1IAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH2wwSEgUFmXJDjQAAAEZJREFUCNdjYMAOuCCk6goQpbp0GpRSAFKcqdNmQKgIILUoNAxIMUWFhoKosNDQBKDgVAilCqcaQBogFFNoGNjsqSgUTgAAM3ES8k912EAAAAAASUVORK5CYII=\') 5 5, auto";

    /**
     * @constructor
     * @memberof TransformInteraction
     * @param {Object} source - target layer for interaction
     * @param {Function} callback - callback function after geometry is transformed
     */
    constructor(source: LayerInterface, callback?: TransformCallbackFunction) { 
        super();
        this.handler = this.handler.bind(this);
        const optsTransform: unknown = {
            enableRotatedTransform: false,
            addCondition: OlEventConditionShiftKeyOnly,
            layers: [source.getLayer()],
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
        this.eventHandlers.add(EventType.ScaleFeature, "ScaleEventFeatureHandler", this.handler);
    }

    private handler(e: OlBaseEvent): void {
        if (typeof this.callback === "function") {
            const olMap: OlMap = this.interaction.getMap(); 
            const srs: string = olMap.getView().getProjection().getCode();
            const transformedFeatures: OlFeature[] = (<OlTransformEvent> e).features.getArray();
            const fc: FeatureCollection = new FeatureCollection(transformedFeatures, srs);
            fc.setDirty(true);
            this.callback(fc);
        }
    }

}