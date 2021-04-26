import OlDraw, { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import OlVectorLayer from "ol/layer/Vector";
import OlCollection from 'ol/Collection';
import OlGeometryType from "ol/geom/GeometryType";
import OlBaseEvent from "ol/events/Event";
import { VectorSourceEvent as OlVectorSourceEvent} from "ol/source/Vector";
import BaseInteraction from "./BaseInteraction";
import LayerInterface from "../../Layer/LayerInterface";
import Feature from "../../Feature/Feature";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";

/** @class DrawInteraction */
export default class DrawInteraction extends BaseInteraction {

    /**
     * @constructor
     * @memberof DrawInteraction
     * @param {Object} layer - layer to draw on
     * @param {String} geometryType - type of geometry to draw
     * @param {Function} callback - callback function to call after geometry is drawn
     */
    constructor(layer: LayerInterface, geometryType: string, callback: (feature: Feature) => void) {
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
        this.eventHandlers.add(EventType.AddFeature, "DrawEventHanler", (e: OlBaseEvent): void => {
            if (typeof callback === "function") {
                callback(new Feature((<OlDrawEvent> e).feature, olLayer));
            }
        });
    }

}