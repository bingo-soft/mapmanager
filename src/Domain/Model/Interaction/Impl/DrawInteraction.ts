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

export default class DrawInteraction extends BaseInteraction {

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

        this.eventHandlers = new EventHandlerCollection(olSource/* layer.getSource() */);
        this.eventHandlers.add(EventType.AddFeature, "DrawEventHanler", (e: OlBaseEvent): void => {
            if (typeof callback === "function") {
                callback(new Feature((<OlVectorSourceEvent> e).feature, olLayer));
            }
        })
    }
   

}