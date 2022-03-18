import {Snap as OlSnap} from 'ol/interaction';
import { Vector as OlVectorSource } from "ol/source";
import InteractionType from "../InteractionType";
import BaseInteraction from "./BaseInteraction";
import Map from "../../Map/Map";
import LayerInterface from "../../Layer/LayerInterface";
import SourceType from "../../Source/SourceType";

/** SnapInteraction */
export default class SnapInteraction extends BaseInteraction {
    /**
     * @param map - map object to activate snap on
     * @param layers - layers to activate snap on
     * @param pixelTolerance - pixel tolerance for considering the pointer close enough to a segment or vertex for snapping
     */
    constructor(map: Map, layers: LayerInterface[], pixelTolerance?: number) {
        super();
        this.type = InteractionType.Snap;
        const olMap = map.getMap();
        const layersSnap = layers ? layers : map.getLayers();
        if (layersSnap && layersSnap.length) {
            layersSnap.forEach((layer: LayerInterface): void => {
                if (layer.getType() == SourceType.Vector) {
                    const snap = new OlSnap({
                        source: <OlVectorSource> (layer.getLayer().getSource()),
                        pixelTolerance: pixelTolerance ? pixelTolerance : 10
                    });
                    olMap.addInteraction(snap);
                    this.innerInteractions.push(snap);
                }
            });
        }
    }

}