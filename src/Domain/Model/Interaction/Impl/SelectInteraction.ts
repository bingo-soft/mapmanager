import { Interaction as OLInteraction} from "ol/interaction";
import OlMap from "ol/Map";
import OlBaseLayer from "ol/layer/Base";
import { Layer as OlLayer } from "ol/layer";
import OlVectorLayer from "ol/layer/Vector";
import OlSource from "ol/source/Source";
import OlFeature from "ol/Feature";
import {DragBox as OlDragBox, Select as OlSelect} from 'ol/interaction';
import OlBaseEvent from "ol/events/Event";
import { MapBrowserEvent as OlMapBrowserEvent } from "ol";
import InteractionType from "../InteractionType";
import BaseInteraction from "./BaseInteraction";
import SelectionType from "./SelectionType";
import Feature from "../../Feature/Feature";
import FeatureCollection from "../../Feature/FeatureCollection";
import Map from "../../Map/Map";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import LayerInterface from "../../Layer/LayerInterface";



export default class SelectInteraction extends BaseInteraction {

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {SelectionType} type - type
     */
    constructor(type: SelectionType, map: Map, layers: LayerInterface[], callback: (feature: FeatureCollection) => void) {
        super();
        const olMap: OlMap = map.getMap();
        this.type = InteractionType.Select;
        let fc: FeatureCollection;
        const OlLayersToSelectOn: OlLayer[] = [];
        if (layers) {
            layers.forEach((value: LayerInterface): void => {
                OlLayersToSelectOn.push(value.getLayer());
            });
        }
        switch(type) {
/*             case SelectionType.Pin:
                this.eventHandlers = new EventHandlerCollection(olMap);
                this.eventHandlers.add(EventType.Click, "PinEventHanler", (e: OlBaseEvent): void => {
                    fc = this.pin(olMap, e);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                });
                break; */
            case SelectionType.SingleClick:
                this.interaction = new OlSelect({
                    layers: OlLayersToSelectOn.length ? OlLayersToSelectOn : null,
                    multi: true
                });
                this.eventHandlers = new EventHandlerCollection(this.interaction);
                this.eventHandlers.add(EventType.SelectSingleFeature, "SelectSingleFeatureEventHanler", (e: OlBaseEvent): void => {
                    const selectedFeatures: OlFeature[] = e.target.getFeatures().getArray();
                    const features: Feature[] = [];
                    selectedFeatures.forEach((feature: OlFeature): void => {
                        //features.push(new Feature(feature, e.target.getLayer(feature).getSource()));
                        features.push(new Feature(feature, e.target.getLayer(feature)));
                    });
                    const srs: string = olMap.getView().getProjection().getCode();
                    fc = new FeatureCollection(features, srs);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                });
                break;
            case SelectionType.Rectangle:
                // selected features are added to the feature overlay of a Select interaction for highlighting only
                const select = new OlSelect();
                olMap.addInteraction(select);
                const selectedFeatures = select.getFeatures();

                this.interaction = new OlDragBox();
                this.eventHandlers = new EventHandlerCollection(this.interaction);
                this.eventHandlers.add(EventType.SelectByBox, "SelectByBoxEventHanler", (e: OlBaseEvent): void => {
                    var extent = (<OlDragBox> this.interaction).getGeometry().getExtent();
                    const features: Feature[] = [];
                    olMap.getLayers().forEach((olLayer: OlBaseLayer): void => {
                        if (olLayer instanceof OlVectorLayer) {
                            if ((OlLayersToSelectOn.includes(olLayer) && OlLayersToSelectOn.length) || !OlLayersToSelectOn.length) {
                                (<OlVectorLayer> olLayer).getSource().forEachFeatureIntersectingExtent(extent, function (olFeature) {
                                    //const feature: Feature = new Feature(olFeature, olLayer.getSource()); 
                                    const feature: Feature = new Feature(olFeature, olLayer); 
                                    features.push(feature);
                                    selectedFeatures.push(olFeature); // just to highlight the selection
                                });
                            }
                        }
                    });
                    fc = new FeatureCollection(features, olMap.getView().getProjection().getCode());
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                });
                break;
            default:
                break;
        }
    }

    /**
     * Returns FeatureCollection of features below clicked map point 
     *
     * @function pin
     * @memberof Map
     * @param {Object} point - clicked point on map
     * @return {Object} FeatureCollection 
     */     
     /* private pin(map: OlMap, point: OlBaseEvent): FeatureCollection {
        const featureArr: Feature[] = [];
        map.forEachFeatureAtPixel((<OlMapBrowserEvent> point).pixel, (feature: OlFeature, layer: OlVectorLayer): void => {
            if (layer) {
                const accentFeature = new Feature(feature, layer.getSource());
                featureArr.push(accentFeature);
            }
        });
        return new FeatureCollection(featureArr, map.getView().getProjection().getCode());
    } */
}