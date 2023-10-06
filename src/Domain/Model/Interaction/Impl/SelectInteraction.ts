import * as turf from "@turf/turf"
import booleanIntersects from "@turf/boolean-intersects" 
import OlBaseLayer from "ol/layer/Base";
import { Layer as OlLayer } from "ol/layer";
import VectorLayer from "ol/layer/Vector";
import OlFeature from "ol/Feature";
import { Geometry as OlGeometry, Circle as OlCircle } from "ol/geom";
import * as OlSphere from "ol/sphere";
import {DragBox as OlDragBox, Select as OlSelect } from 'ol/interaction';
import OlDraw, { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import { always as OlEventConditionAlways, shiftKeyOnly as OlEventConditionShiftKeyOnly } from "ol/events/condition"
import { GeoJSON as OlGeoJSON }  from "ol/format";
import OlCollection from 'ol/Collection';
import OlBaseEvent from "ol/events/Event";
import InteractionType from "../InteractionType";
import BaseInteraction from "./BaseInteraction";
import SelectionType from "./SelectionType";
import Feature from "../../Feature/Feature";
import { fromCircle } from 'ol/geom/Polygon';
import FeatureCollection from "../../Feature/FeatureCollection";
import Map from "../../Map/Map";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import LayerInterface from "../../Layer/LayerInterface";
import { SelectCallbackFunction } from "../InteractionCallbackType";
import SourceType from "../../Source/SourceType";
import { OlVectorLayer } from "../../Type/Type";

/** SelectInteraction */
export default class SelectInteraction extends BaseInteraction {
    private select: OlSelect;
    private layers: Set<OlLayer> = new Set();
    private features: Set<Feature> = new Set();
    private selectedFeatures: OlCollection<OlFeature<OlGeometry>>;

    /**
     * @param type - selection type
     * @param map - map object to select on
     * @param layers - layers to select on
     * @param multiple - flag indicating multiple selection
     * @param pin - flag indicating pin selection
     * @param callback - callback function to call after selection is done
     */
    constructor(type: SelectionType, map: Map, layers: LayerInterface[], multiple = false, pin = true, callback?: SelectCallbackFunction) {
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
        // (in case of SelectionType.Rectangle, SelectionType.Polygon, SelectionType.Cirle)
        this.select = new OlSelect();
        olMap.addInteraction(this.select);
        this.selectedFeatures = this.select.getFeatures();
        this.innerInteractions.push(this.select);
        switch(type) {
            case SelectionType.SingleClick:
                this.interaction = new OlSelect({
                    toggleCondition: multiple ? OlEventConditionAlways : OlEventConditionShiftKeyOnly,
                    layers: OlLayersToSelectOn.length ? OlLayersToSelectOn : null,
                    multi: pin
                });
                this.eventHandlers = new EventHandlerCollection(this.interaction);
                this.eventHandlers.add(EventType.SelectSingleFeature, "SelectSingleFeatureEventHandler", (e: OlBaseEvent): void => {
                    const selectedFeatures: OlFeature[] = e.target.getFeatures().getArray();
                    this.features.clear();
                    selectedFeatures.forEach((olFeature: OlFeature): void => {
                        const olLayer: OlLayer = e.target.getLayer(olFeature);
                        this.layers.add(olLayer);
                        const feature = new Feature(olFeature, map.getLayer(olLayer));
                        feature.setEventBus(map.getEventBus());
                        this.features.add(feature);
                    });
                    fc = new FeatureCollection(Array.from(this.features));
                    map.setSelectedFeatures(fc);
                    map.setSelectedLayers(this.layers);
                    if (typeof callback === "function") {
                        callback(fc, this.interaction);
                    }
                });
                break;
            case SelectionType.Rectangle:
                this.interaction = new OlDragBox();
                this.eventHandlers = new EventHandlerCollection(this.interaction);
                this.eventHandlers.add(EventType.SelectByBox, "SelectByBoxEventHandler", (e: OlBaseEvent): void => {
                    const extent = (<OlDragBox> this.interaction).getGeometry().getExtent();
                    this.features.clear();
                    olMap.getLayers().forEach((olLayer: OlBaseLayer): void => {
                        if (olLayer instanceof VectorLayer) {
                            if ((OlLayersToSelectOn.includes(olLayer) && OlLayersToSelectOn.length) || !OlLayersToSelectOn.length) {
                                (<OlVectorLayer> olLayer).getSource().forEachFeatureIntersectingExtent(extent, (olFeature: OlFeature) =>  {
                                    this.addToSelection(map, olLayer, olFeature);
                                });
                            }
                        }
                    });
                    fc = new FeatureCollection(Array.from(this.features));
                    map.setSelectedFeatures(fc);
                    map.setSelectedLayers(this.layers);
                    if (typeof callback === "function") {
                        callback(fc, this.interaction);
                    }
                });
                break;
            case SelectionType.Polygon:
                this.interaction = new OlDraw({
                    features: new OlCollection(),
                    type: "Polygon"
                });
                this.eventHandlers = new EventHandlerCollection(this.interaction);
                this.eventHandlers.add(EventType.DrawEnd, "SelectByPolygonEventHandler", (e: OlBaseEvent): void => {
                    const extentFeature = (<OlDrawEvent> e).feature;
                    const extentGeometryTurf = new OlGeoJSON().writeFeatureObject(extentFeature).geometry;
                    const extent = extentFeature.getGeometry().getExtent();
                    this.features.clear();
                    olMap.getLayers().forEach((olLayer: OlBaseLayer): void => {
                        if (olLayer instanceof VectorLayer) {
                            if ((OlLayersToSelectOn.includes(olLayer) && OlLayersToSelectOn.length) || !OlLayersToSelectOn.length) {
                                (<OlVectorLayer> olLayer).getSource().forEachFeatureIntersectingExtent(extent, (olFeature: OlFeature) => {
                                    const featureTurf = new OlGeoJSON().writeFeatureObject(olFeature);
                                    const featureGeometryTurf = featureTurf.geometry;
                                    if (booleanIntersects(turf.feature(extentGeometryTurf), turf.feature(featureGeometryTurf))) {
                                        this.addToSelection(map, olLayer, olFeature);
                                    }
                                });
                            }
                        }
                    });
                    fc = new FeatureCollection(Array.from(this.features));
                    map.setSelectedFeatures(fc);
                    map.setSelectedLayers(this.layers);
                    if (typeof callback === "function") {
                        callback(fc, this.interaction);
                    }
                });
                break;
                case SelectionType.Circle:
                    this.interaction = new OlDraw({
                        features: new OlCollection(),
                        type: "Circle",
                    });
                    this.eventHandlers = new EventHandlerCollection(this.interaction);

                    let drawingFeature: OlFeature;
                    let geomChangelistener: (evt: OlBaseEvent) => void;
                    let result: string;
                    let tooltipCoord: number[];

                    this.eventHandlers.add(EventType.DrawStart, "SelectByCircleStartEventHandler", (e: OlBaseEvent): void => {
                        tooltipCoord = (<any> e).coordinate;
                        drawingFeature = (<OlDrawEvent> e).feature;
                        geomChangelistener = (evt: OlBaseEvent): void => {
                            const geom: OlCircle = <OlCircle> evt.target;
                            const radius = OlSphere.getLength(fromCircle(geom)) / (2 * Math.PI);
                            result = `R = ${radius.toFixed(2)} м.`;
                            tooltipCoord = geom.getCenter();
                            tooltip.innerHTML = result;
                            overlay.setPosition(tooltipCoord);
                        };
                        drawingFeature.getGeometry().on("change", geomChangelistener);
                        const tooltip: HTMLElement = document.createElement("div");
                        tooltip.className = "tooltip tooltip-static";
                        const overlay = map.createMeasureOverlay(tooltip, tooltipCoord, [0, 0]);
                    });
                    
                    this.eventHandlers.add(EventType.DrawEnd, "SelectByCircleEndEventHandler", (e: OlBaseEvent): void => {
                        drawingFeature.getGeometry().un("change", geomChangelistener);
                        map.clearMeasureOverlays();

                        const circleFeature = new OlFeature(fromCircle((<any> e).feature.getGeometry()));
                        const extentGeometryTurf = new OlGeoJSON().writeFeatureObject(circleFeature).geometry;
                        const extent = circleFeature.getGeometry().getExtent();
                        this.features.clear();
                        olMap.getLayers().forEach((olLayer: OlBaseLayer): void => {
                            if (olLayer instanceof VectorLayer) {
                                if ((OlLayersToSelectOn.includes(olLayer) && OlLayersToSelectOn.length) || !OlLayersToSelectOn.length) {
                                    (<OlVectorLayer> olLayer).getSource().forEachFeatureIntersectingExtent(extent, (olFeature: OlFeature) => {
                                        const featureTurf = new OlGeoJSON().writeFeatureObject(olFeature);
                                        const featureGeometryTurf = featureTurf.geometry;
                                        if (booleanIntersects(turf.feature(extentGeometryTurf), turf.feature(featureGeometryTurf))) {
                                            this.addToSelection(map, olLayer, olFeature);
                                        }
                                    });
                                }
                            }
                        });
                        fc = new FeatureCollection(Array.from(this.features));
                        map.setSelectedFeatures(fc);
                        map.setSelectedLayers(this.layers);
                        if (typeof callback === "function") {
                            callback(fc, this.interaction);
                        }
                    });
                    break;
            default:
                break;
        }
    }

    addToSelection(map: Map, olLayer: OlLayer, olFeature: OlFeature): void {
        const feature = new Feature(olFeature, map.getLayer(olLayer));
        feature.setEventBus(map.getEventBus());
        this.features.add(feature);
        this.layers.add(olLayer);
        this.selectedFeatures.push(olFeature); // just to highlight the selection
        olFeature.setStyle(olFeature.getStyle());
    }

}