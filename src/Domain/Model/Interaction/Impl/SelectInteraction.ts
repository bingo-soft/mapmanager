import * as turf from "@turf/turf"
import OlBaseLayer from "ol/layer/Base";
import { Layer as OlLayer } from "ol/layer";
import OlVectorLayer from "ol/layer/Vector";
import OlFeature from "ol/Feature";
import { Geometry as OlGeometry } from "ol/geom";
import {DragBox as OlDragBox, Select as OlSelect, Draw as OlDraw} from 'ol/interaction';
import { always as OlEventConditionAlways, shiftKeyOnly as OlEventConditionShiftKeyOnly } from "ol/events/condition"
import { GeoJSON as OlGeoJSON }  from "ol/format";
import OlCollection from 'ol/Collection';
import OlGeometryType from "ol/geom/GeometryType";
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
import SourceType from "../../Source/SourceType";

/** SelectInteraction */
export default class SelectInteraction extends BaseInteraction {
    private select: OlSelect;
    private selectedFeatures: OlCollection<OlFeature<OlGeometry>>;


    /**
     * @param type - selection type
     * @param map - map object to select on
     * @param layers - layers to select on
     * @param multiple - flag indicating multiple selection
     * @param callback - callback function to call after selection is done
     */
    constructor(type: SelectionType, map: Map, layers: LayerInterface[], multiple = false, callback?: SelectCallbackFunction) {
        super();
        const olMap = map.getMap(); 
        this.type = InteractionType.Select;
        let fc: FeatureCollection;
        const OlLayersToSelectOn: OlLayer[] = [];
        if (layers) {
            layers.forEach((layer: LayerInterface): void => {
                if (layer.getType() == SourceType.Vector) {
                    OlLayersToSelectOn.push(layer.getLayer());
                }
            });
        }
        // selected features are added to the feature overlay of a Select interaction for highlighting only 
        // (in case of SelectionType.Rectangle or SelectionType.Polygon)
        this.select = new OlSelect();
        olMap.addInteraction(this.select);
        this.selectedFeatures = this.select.getFeatures();
        this.innerInteractions.push(this.select);
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
                    selectedFeatures.forEach((olFeature: OlFeature): void => {
                        const olLayer: OlLayer = e.target.getLayer(olFeature);
                        layers.add(olLayer);
                        const feature = new Feature(olFeature, map.getLayer(olLayer));
                        feature.setEventBus(map.getEventBus());
                        features.push(feature);
                    });
                    fc = new FeatureCollection(features);
                    map.setSelectedFeatures(fc);
                    map.setSelectedLayers(layers);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                });
                break;
            case SelectionType.Rectangle:
                this.interaction = new OlDragBox();
                this.eventHandlers = new EventHandlerCollection(this.interaction);
                this.eventHandlers.add(EventType.SelectByBox, "SelectByBoxEventHandler", (e: OlBaseEvent): void => {
                    const extent = (<OlDragBox> this.interaction).getGeometry().getExtent();
                    const features: Feature[] = [];
                    const layers: Set<OlLayer> = new Set();
                    olMap.getLayers().forEach((olLayer: OlBaseLayer): void => {
                        if (olLayer instanceof OlVectorLayer) {
                            if ((OlLayersToSelectOn.includes(olLayer) && OlLayersToSelectOn.length) || !OlLayersToSelectOn.length) {
                                (<OlVectorLayer> olLayer).getSource().forEachFeatureIntersectingExtent(extent, (olFeature: OlFeature) =>  {
                                    const feature = new Feature(olFeature, map.getLayer(olLayer));
                                    feature.setEventBus(map.getEventBus());
                                    features.push(feature);
                                    layers.add(olLayer);
                                    this.selectedFeatures.push(olFeature); // just to highlight the selection
                                });
                            }
                        }
                    });
                    fc = new FeatureCollection(features);
                    map.setSelectedFeatures(fc);
                    map.setSelectedLayers(layers);
                    if (typeof callback === "function") {
                        callback(fc);
                    }
                });
                break;
                case SelectionType.Polygon:
                    this.interaction = new OlDraw({
                        features: new OlCollection(),
                        type: OlGeometryType.POLYGON,
                    });
                    this.eventHandlers = new EventHandlerCollection(this.interaction);
                    this.eventHandlers.add(EventType.DrawEnd, "SelectByPolygonEventHandler", (e: OlBaseEvent): void => {
                        const extentFeature = (<any> e).feature;
                        const extentGeometryTurf = new OlGeoJSON().writeFeatureObject(extentFeature).geometry;
                        const extent = extentFeature.getGeometry().getExtent();
                        const features: Feature[] = [];
                        const layers: Set<OlLayer> = new Set();
                        olMap.getLayers().forEach((olLayer: OlBaseLayer): void => {
                            if (olLayer instanceof OlVectorLayer) {
                                if ((OlLayersToSelectOn.includes(olLayer) && OlLayersToSelectOn.length) || !OlLayersToSelectOn.length) {
                                    (<OlVectorLayer> olLayer).getSource().forEachFeatureIntersectingExtent(extent, (olFeature: OlFeature) => {
                                        const featureGeometryTurf = new OlGeoJSON().writeFeatureObject(olFeature).geometry;
                                        if (turf.booleanContains(turf.feature(extentGeometryTurf), turf.feature(featureGeometryTurf))) {
                                            const feature = new Feature(olFeature, map.getLayer(olLayer));
                                            feature.setEventBus(map.getEventBus());
                                            features.push(feature);
                                            layers.add(olLayer);
                                            this.selectedFeatures.push(olFeature); // just to highlight the selection
                                        }
                                    });
                                }
                            }
                        });
                        fc = new FeatureCollection(features);
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

}