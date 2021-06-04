import OlMap from "ol/Map";
import OlBaseLayer from "ol/layer/Base";
import { Layer as OlLayer } from "ol/layer";
import OlVectorLayer from "ol/layer/Vector";
import OlFeature from "ol/Feature";
import {DragBox as OlDragBox, Select as OlSelect} from 'ol/interaction';
import { always as OlEventConditionAlways, shiftKeyOnly as OlEventConditionShiftKeyOnly } from "ol/events/condition"
import OlBaseEvent from "ol/events/Event";
import InteractionType from "../InteractionType";
import BaseInteraction from "./BaseInteraction";
import SelectionType from "./SelectionType";
import Feature from "../../Feature/Feature";
import FeatureCollection from "../../Feature/FeatureCollection";
import Map from "../../Map/Map";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import LayerInterface from "../../Layer/LayerInterface";
import { SelectCallbackFunction } from "../InteractionCallbackType";

/** @class SelectInteraction */
export default class SelectInteraction extends BaseInteraction {

    private highlightSelect: OlSelect;

    /**
     * @constructor
     * @memberof SelectInteraction
     * @param {Object} type - selection type
     * @param {Object} map - map object to select on
     * @param {Array} layers - layers to select on
     * @param {Boolean} multiple - flag indicating multiple selection
     * @param {Function} callback - callback function to call after selection is done
     */
    constructor(type: SelectionType, map: Map, layers: LayerInterface[], multiple: boolean = false, callback?: SelectCallbackFunction) {
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
            case SelectionType.SingleClick:
                this.interaction = new OlSelect({
                    toggleCondition: multiple ? OlEventConditionAlways : OlEventConditionShiftKeyOnly,
                    layers: OlLayersToSelectOn.length ? OlLayersToSelectOn : null,
                    multi: true
                });
                this.eventHandlers = new EventHandlerCollection(this.interaction);
                this.eventHandlers.add(EventType.SelectSingleFeature, "SelectSingleFeatureEventHandler", (e: OlBaseEvent): void => {
                    const selectedFeatures: OlFeature[] = e.target.getFeatures().getArray();
                    const features: Feature[] = [];
                    const layers: Set<OlLayer> = new Set();
                    selectedFeatures.forEach((feature: OlFeature): void => {
                        const layer: OlLayer = e.target.getLayer(feature);
                        layers.add(layer);
                        features.push(new Feature(feature, layer));
                    });
                    const srs: string = olMap.getView().getProjection().getCode();
                    fc = new FeatureCollection(features, srs);
                    map.setSelectedFeatures(fc);
                    map.setSelectedLayers(layers);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                });
                break;
            case SelectionType.Rectangle:
                // selected features are added to the feature overlay of a Select interaction for highlighting only
                this.highlightSelect = new OlSelect();
                olMap.addInteraction(this.highlightSelect);
                const selectedFeatures = this.highlightSelect.getFeatures();

                this.interaction = new OlDragBox();
                this.eventHandlers = new EventHandlerCollection(this.interaction);
                this.eventHandlers.add(EventType.SelectByBox, "SelectByBoxEventHandler", (e: OlBaseEvent): void => {
                    var extent = (<OlDragBox> this.interaction).getGeometry().getExtent();
                    const features: Feature[] = [];
                    const layers: Set<OlLayer> = new Set();
                    olMap.getLayers().forEach((olLayer: OlBaseLayer): void => {
                        if (olLayer instanceof OlVectorLayer) {
                            if ((OlLayersToSelectOn.includes(olLayer) && OlLayersToSelectOn.length) || !OlLayersToSelectOn.length) {
                                (<OlVectorLayer> olLayer).getSource().forEachFeatureIntersectingExtent(extent, function (olFeature) {
                                    const feature: Feature = new Feature(olFeature, olLayer); 
                                    features.push(feature);
                                    layers.add(olLayer);
                                    selectedFeatures.push(olFeature); // just to highlight the selection
                                });
                            }
                        }
                    });
                    fc = new FeatureCollection(features, olMap.getView().getProjection().getCode());
                    map.setSelectedFeatures(fc);
                    map.setSelectedLayers(layers);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                });
                break;
            default:
                break;
        }
    }

    public getHighlightSelect(): OlSelect {
        return this.highlightSelect;
    }

}