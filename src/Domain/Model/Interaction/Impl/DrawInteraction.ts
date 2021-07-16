import OlDraw, { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import OlVectorLayer from "ol/layer/Vector";
import OlCollection from 'ol/Collection';
import OlGeometryType from "ol/geom/GeometryType";
import OlBaseEvent from "ol/events/Event";
import BaseInteraction from "./BaseInteraction";
import LayerInterface from "../../Layer/LayerInterface";
import Feature from "../../Feature/Feature";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import { DrawCallbackFunction } from "../InteractionCallbackType";

/** DrawInteraction */
export default class DrawInteraction extends BaseInteraction {

    /**
     * @param layer - layer to draw on
     * @param geometryType - type of geometry to draw
     * @param callback - callback function to call after geometry is drawn
     */
    constructor(layer: LayerInterface, geometryType: string, callback?: DrawCallbackFunction) {
        super();
        const olLayer = <OlVectorLayer> layer.getLayer();
        const olSource = olLayer.getSource();
        this.interaction = new OlDraw({
            source: olSource,
            features: new OlCollection(),
            type: <OlGeometryType> geometryType,
        });
        this.type = InteractionType.Draw;

        this.eventHandlers = new EventHandlerCollection(olSource);
        this.eventHandlers.add(EventType.AddFeature, "DrawEventHandler", (e: OlBaseEvent): void => {
            if (typeof callback === "function") {
                const feature = new Feature((<OlDrawEvent> e).feature, layer);
                feature.setDirty(true);
                callback(feature);
            }
        });
    }

}