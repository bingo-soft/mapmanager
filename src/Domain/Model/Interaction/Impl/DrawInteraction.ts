import OlMap from "ol/Map";
import OlDraw, { DrawEvent as OlDrawEvent } from "ol/interaction/Draw";
import * as OlProj from "ol/proj";
import { fromCircle } from 'ol/geom/Polygon';
import OlFeature from "ol/Feature";
import OlCollection from 'ol/Collection';
import OlBaseEvent from "ol/events/Event";
import * as OlSphere from "ol/sphere";
import { Type as OlGeometryType } from "ol/geom/Geometry";
import { EventsKey as OlEventsKey } from "ol/events";
import { Circle as OlCircle } from "ol/geom";
import * as OlObservable from "ol/Observable";
import OlOverlay from "ol/Overlay";
import BaseInteraction from "./BaseInteraction";
import LayerInterface from "../../Layer/LayerInterface";
import Feature from "../../Feature/Feature";
import FeatureCollection from "../../Feature/FeatureCollection";
import InteractionType from "../InteractionType";
import EventType from "../../EventHandlerCollection/EventType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import { DrawCallbackFunction } from "../InteractionCallbackType";
import SourceChangedEvent from "../../Source/SourceChangedEvent";
import { OlVectorLayer } from "../../Type/Type";

/** DrawInteraction */
export default class DrawInteraction extends BaseInteraction {

    private olMap: OlMap;
    private layer: LayerInterface;
    private overlay: OlOverlay;
    //private drawEventHandlers: EventHandlerCollection;

    /**
     * @param layer - layer to draw on
     * @param geometryType - type of geometry to draw
     * @param callback - callback function to call after geometry is drawn
     */
    constructor(layer: LayerInterface, geometryType: string, callback?: DrawCallbackFunction) {
        super();
        this.olMap = layer.getMap().getMap()
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
            this.layer.setDirtyFeatures(new FeatureCollection([feature]));
            //this.layer.setIdleFeatures(new FeatureCollection([feature]), true);
            if (typeof callback === "function") {
                callback(feature);
            }
            if (eventBus) {
                eventBus.dispatch(new SourceChangedEvent()); 
            }
        });
        let geomChangelistener: OlEventsKey;
        let tooltipCoord: number[];
        let tooltip: HTMLElement;
        let result: string;
        const drawEventHandlers = new EventHandlerCollection(this.interaction);
        drawEventHandlers.add(EventType.DrawStart, "DrawStartEventHandler", (e: OlBaseEvent): void => {
            tooltipCoord = (<any> e).coordinate;
            const feature = (<OlDrawEvent> e).feature;
            //const resolutionFactor = this.getResolutionFactor();
            geomChangelistener = feature.getGeometry().on("change", (evt: OlBaseEvent): void => {
                const geom: OlFeature = evt.target;
                if (geom instanceof OlCircle) {
                    //const radius = (geom.getRadius() / OlProj.METERS_PER_UNIT.m) * resolutionFactor;
                    const radius = OlSphere.getLength(fromCircle(geom)) / (2 * Math.PI);
                    result = `R = ${radius.toFixed(2)} м.`;
                    tooltipCoord = geom.getCenter();
                    //tooltipCoord = geom.getLastCoordinate();
                    tooltip.innerHTML = result;
                }
                this.overlay.setPosition(tooltipCoord);
            });
            tooltip = document.createElement("div");
            tooltip.className = "tooltip tooltip-static";
            this.overlay = new OlOverlay({
                element: tooltip,
                offset: tooltipCoord,
                position: [0, -7],
                positioning: "bottom-center"
            });
            this.olMap.addOverlay(this.overlay);
        })
        drawEventHandlers.add(EventType.DrawEnd, "DrawEndEventHandler", (e: OlBaseEvent): void => {
            this.olMap.removeOverlay(this.overlay);
            OlObservable.unByKey(geomChangelistener);
        });
    }

    /**
     * Stops drawing without adding the feature currently being drawn to the target layer
     */
    public abortDrawing(): void {
        this.olMap.removeOverlay(this.overlay);
        (<OlDraw> this.interaction).abortDrawing();
    }

    /**
     * Removes last point of the feature currently being drawn
     */
    public removeLastPoint(): void {
        (<OlDraw> this.interaction).removeLastPoint();
    }

    /**
     * Returns resolution factor for map
     * @return resolution factor
     */
    /* private getResolutionFactor(): number {
        const view = this.olMap.getView();
        const resolutionAtEquator = view.getResolution();
        const center = view.getCenter();
        const pointResolution = OlProj.getPointResolution(view.getProjection(), resolutionAtEquator, center);
        return resolutionAtEquator / pointResolution;
    } */

}