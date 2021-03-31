import { Interaction as OLInteraction} from "ol/interaction"
import OlDraw, { DrawEvent as OlDrawEvent } from "ol/interaction/Draw"
import OlVectorLayer from "ol/layer/Vector"
import OlCollection from 'ol/Collection'
import OlGeometryType from "ol/geom/GeometryType"
import { EventsKey as OlEventsKey } from "ol/events"
import { VectorSourceEvent as OlVectorSourceEvent} from "ol/source/Vector";
import BaseInteraction from "./BaseInteraction"
import LayerInterface from "../../../Layer/LayerInterface"
import Feature from "../../../Feature/Feature";

export default class DrawInteraction extends BaseInteraction {
    private interaction: OLInteraction;

    constructor(layer: LayerInterface, geometryType: string, callback: (feature: Feature) => void) {
        super();
        
        const source = (<OlVectorLayer>layer.getLayer()).getSource();

        this.interaction = new OlDraw({
            source: source,
            features: new OlCollection(),
            type: <OlGeometryType>geometryType,
        });

        const listener: OlEventsKey = source.on("addfeature", (e: OlVectorSourceEvent) => { 
            if (typeof callback === "function") {
                callback(new Feature(e.feature));
                e.target.un("addfeature", listener);
            }
        });

    }

    getInteraction(): OLInteraction
    {
        return this.interaction;
    }

}