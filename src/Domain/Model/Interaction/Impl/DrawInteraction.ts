import OlDraw, { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import OlVectorLayer from "ol/layer/Vector";
import OlCollection from 'ol/Collection';
import OlGeometryType from "ol/geom/GeometryType";
import OlBaseEvent from "ol/events/Event";
import BaseInteraction from "./BaseInteraction";
import LayerInterface from "../../Layer/LayerInterface";
import Feature from "../../Feature/Feature";
import FeatureCollection from "../../Feature/FeatureCollection";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import { DrawCallbackFunction } from "../InteractionCallbackType";
import SourceChangedEvent from "../../Source/SourceChangedEvent";

/** DrawInteraction */
export default class DrawInteraction extends BaseInteraction {

    private layer: LayerInterface;

    /**
     * @param layer - layer to draw on
     * @param geometryType - type of geometry to draw
     * @param callback - callback function to call after geometry is drawn
     */
    constructor(layer: LayerInterface, geometryType: string, callback?: DrawCallbackFunction) {
        super();
        this.layer = layer;
        const olLayer = <OlVectorLayer> layer.getLayer();
        const olSource = olLayer.getSource();
        const eventBus = layer.getEventBus();

        this.interaction = new OlDraw({
            source: olSource,
            features: new OlCollection(),
            type: <OlGeometryType> geometryType,
        });
        this.type = InteractionType.Draw;

        this.eventHandlers = new EventHandlerCollection(olSource);
        this.eventHandlers.add(EventType.AddFeature, "DrawEventHandler", (e: OlBaseEvent): void => {
            const feature = new Feature((<OlDrawEvent> e).feature, layer);
            this.layer.setDirtyFeatures(new FeatureCollection([feature]), true);
            this.layer.setIdleFeatures(new FeatureCollection([feature]), true);
            if (typeof callback === "function") {                            
                callback(feature);
            }
            if (eventBus) {
                eventBus.dispatch(new SourceChangedEvent()); 
            }
        });
    }

    /**
     * Stops drawing without adding the feature currently being drawn to the target layer
     */
    public abortDrawing(): void {
        (<OlDraw> this.interaction).abortDrawing();
    }

    /**
     * Removes last point of the feature currently being drawn
     */
    public removeLastPoint(): void {
        (<OlDraw> this.interaction).removeLastPoint();
    }

}