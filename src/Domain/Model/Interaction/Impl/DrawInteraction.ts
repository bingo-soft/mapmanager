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
    private drawingFeature: OlFeature;

    /**
     * @param layer - layer to draw on
     * @param geometryType - type of geometry to draw. One of 'Point', 'LineString', 'LinearRing', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection', or 'Circle'.
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
        let radiusContainerCoord: number[];
        const drawEventHandlers = new EventHandlerCollection(this.interaction);
        drawEventHandlers.add(EventType.DrawStart, "DrawStartEventHandler", (e: OlBaseEvent): void => {
            radiusContainerCoord = (<any> e).coordinate;
            this.drawingFeature = (<OlDrawEvent> e).feature;
            const geometry = this.drawingFeature.getGeometry();
            if (geometry.getType() === "Circle") {
                geomChangelistener = geometry.on("change", (evt: OlBaseEvent): void => {
                    const geom: OlCircle = evt.target;
                    radiusContainerCoord = geom.getCenter();
                    const radius = OlSphere.getLength(fromCircle(geom)) / (2 * Math.PI);
                    (<HTMLInputElement> radiusContainer.children[1]).value = radius.toFixed(2);
                    this.overlay.setPosition(radiusContainerCoord);
                });
                const radiusContainer = this.createRadiusInput();
                this.overlay = new OlOverlay({
                    element: radiusContainer,
                    offset: radiusContainerCoord,
                    position: [0, -7],
                    positioning: "bottom-center"
                });
                this.olMap.addOverlay(this.overlay);
            }
        });
        drawEventHandlers.add(EventType.DrawEnd, "DrawEndEventHandler", (e: OlBaseEvent): void => {
            if ((<OlDrawEvent> e).feature.getGeometry().getType() === "Circle") {
                this.olMap.removeOverlay(this.overlay);
                OlObservable.unByKey(geomChangelistener);
            }
        });
    }

    public getDrawingFeature(): OlFeature {
        return this.drawingFeature;
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
     * Creates and returns HTML container with radius input
     * @return HTML container with radius input
     */
    private createRadiusInput(): HTMLElement {
        const container = document.createElement("div");
        container.style.border = "1px solid #ccc";
        container.style.backgroundColor = "#fff";
        container.style.padding = "5px";
        const span1 = document.createElement("span");
        span1.innerHTML = "R = ";
        container.appendChild(span1);
        const input = document.createElement("input");
        input.style.border = "1px solid #ccc";
        input.type = "text";
        input.style.width = "100px";
        input.addEventListener("keyup", (e: KeyboardEvent): void => {
            if (e.key === "Enter") {
                let radius = parseFloat(input.value);
                if (isNaN(radius)) {
                    return;
                }
                const center = (<OlCircle> this.drawingFeature.getGeometry()).getCenter();
                const circle = new OlCircle(center, radius);
                const resolutionFactor = this.getResolutionFactor();
                radius = (circle.getRadius() / OlProj.METERS_PER_UNIT.m) * resolutionFactor;
                circle.setRadius(radius);
                const featureToAdd = new OlFeature(circle);
                this.layer.addFeatures([featureToAdd]);
                this.abortDrawing();
            }
        });
        container.appendChild(input);
        const span2 = document.createElement("span");
        span2.innerHTML = " м.";
        container.appendChild(span2);
        return container;
    }

    /**
     * Returns resolution factor for map
     * @return resolution factor
     */
    private getResolutionFactor(): number {
        const view = this.olMap.getView();
        const resolutionAtEquator = view.getResolution();
        const center = view.getCenter();
        const pointResolution = OlProj.getPointResolution(view.getProjection(), resolutionAtEquator, center);
        return resolutionAtEquator / pointResolution;
    }

}