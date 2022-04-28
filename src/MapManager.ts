import { Vector as OlVectorSource } from "ol/source";
import * as OlProj from "ol/proj";
import { register as OlProjRegister } from 'ol/proj/proj4';
import OlProjection from "ol/proj/Projection";
import { Extent as OlExtent } from "ol/extent";
import * as proj4 from "proj4"
import "../assets/style.css"
import Map from "./Domain/Model/Map/Map"
import LayerInterface from "./Domain/Model/Layer/LayerInterface"
import VectorLayer from "./Domain/Model/Layer/Impl/VectorLayer"
import TileLayer from "./Domain/Model/Layer/Impl/TileLayer"
import LayerBuilder from "./Domain/Model/Layer/LayerBuilder"
import SourceType from "./Domain/Model/Source/SourceType"
import VectorLayerFeaturesLoadQuery from "./Application/Query/VectorLayerFeaturesLoadQuery"
import VectorLayerRepository from "./Infrastructure/Repository/VectorLayerRepository"
import FeatureCollection from "./Domain/Model/Feature/FeatureCollection"
import Geometry from "./Infrastructure/Util/Geometry"
import InteractionType from "./Domain/Model/Interaction/InteractionType"
import EventBus from "./Domain/Model/EventHandlerCollection/EventBus"
import EventInterface from "./Domain/Model/EventHandlerCollection/EventInterface"
import EventType from "./Domain/Model/EventHandlerCollection/EventType"
import EventHandlerCollection from "./Domain/Model/EventHandlerCollection/EventHandlerCollection"
import Feature from "./Domain/Model/Feature/Feature"
import GeometryFormat from "./Domain/Model/Feature/GeometryFormat"
import InteractionInterface from "./Domain/Model/Interaction/InteractionInterface"
import StyleBuilder from "./Domain/Model/Style/StyleBuilder"
import GeometryItem from "./Domain/Model/Feature/GeometryItem"
import { CopyStyle, CutStyle } from "./Domain/Model/Style/ClipboardStyle"
import TemporaryLayerType from "./Domain/Model/Map/TemporaryLayerType"
import { ApiRequest } from "./Infrastructure/Http/ApiRequest";
import { HttpMethod } from "./Infrastructure/Http/HttpMethod";
import ExportType from "./Domain/Model/Map/ExportType";
import MethodNotImplemented from "./Domain/Exception/MethodNotImplemented";

/** A common class which simplifies usage of OpenLayers in GIS projects */
export default class MapManager { 

    public static eventBus = new EventBus();

    /**
     * Creates OpenLayers map object and controls.
     * @category Map
     * @param targetDOMId - id of target DOM element
     * @param opts - options
     * @return map instance
     */
    public static createMap(targetDOMId: string, opts?: unknown): Map {
        const map = new Map(targetDOMId, opts);
        map.setEventBus(MapManager.eventBus);
        if (Object.prototype.hasOwnProperty.call(opts, "source_change_callback")) {
            MapManager.eventBus.subscribe(EventType.SourceChange, opts["source_change_callback"]);
        }
        return map;
    }

    public static subscribe(eventType: EventType, callback: (event: EventInterface) => void) {
        MapManager.eventBus.subscribe(eventType, callback);
    }

    /**
     * Updates map size
     * @category Map
     * @param map - map instance
     */
    public static updateSize(map: Map): void {
        map.updateSize();
    }

    /**
     * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
     * @category Map
     * @param map - map instance
     * @param opts - options
     */
    public static setCenter(map: Map, opts?: unknown): void {
        map.setCenter(opts);
    }

    /**
     * Sets zoom of the map.
     * @category Map
     * @param map - map instance
     * @param zoom - zoom value
     */
    public static setZoom(map: Map, zoom: number): void {
        map.setZoom(zoom);
    }

    /**
     * Sets zoom callback function for the map.
     * @category Map
     * @param map - map instance
     * @param callback - callback function to set
     */
    public static setZoomCallback(map: Map, callback: (zoom: number) => void): void {
        map.setZoomCallback(callback);
    }

    /**
     * Unsets zoom callback function for the map.
     * @category Map
     * @param map - map instance
     */
    public static unsetZoomCallback(map: Map): void {
        map.unsetZoomCallback();
    }

    /**
     * Sets cursor of the map.
     * @category Map
     * @param map - map instance
     * @param cursor - cursor type
     */
    public static setCursor(map: Map, cursor: string): void {
        map.setCursor(cursor);
    }

    /**
     * Transforms coordinates from map projection to given one
     * @category Map
     * @param map - map instance
     * @param coordinates - coordinates
     * @param srsId - SRS Id (e.g. 4326)
     */
    public static transformCoordinates(map: Map, coordinates: number[], srsId: number): number[] {
        return map.transformCoordinatesFrom(coordinates, srsId);
    }

    /**
     * Exports map
     * @category Map
     * @param map - map instance
     * @param exportType - type of export, defaults to ExportType.Printer
     */
    public static async export(map: Map, exportType: ExportType = ExportType.Printer): Promise<unknown> {
        return await map.export(exportType);
    }
   
    /**
     * Returns current map interaction type
     * @category Interaction
     * @param map - map instance
     * @return current map interaction type
     */
    public static getInteractionType(map: Map): InteractionType {
        return map.getInteractionType();
    }

    /**
     * Sets map normal interaction
     * @category Interaction
     * @param map - map instance
     */
    public static setNormalInteraction(map: Map): void {
        map.setNormalInteraction();
    }

    /**
     * Sets map draw interaction
     * @category Interaction
     * @param map - map instance
     * @param layer - layer instance
     * @param opts - options
     */
    public static setDrawInteraction(map: Map, layer: LayerInterface, opts: unknown): void {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        map.setDrawInteraction(layer, opts["geometry_type"], opts["draw_callback"]);
    }

    /**
     * Sets map selection interaction
     * @category Interaction
     * @param map - map instance
     * @param opts - options
     */
    public static setSelectInteraction(map: Map, opts: unknown): InteractionInterface {
        return map.setSelectInteraction(opts["selection_type"], opts["layers"], opts["multiple"], opts["select_callback"]);
    }

    /**
     * Sets map snap interaction
     * @category Interaction
     * @param map - map instance
     * @param opts - options
     */
    public static setSnapInteraction(map: Map, opts: unknown): InteractionInterface {
        return map.setSnapInteraction(opts["layers"], opts["pixelTolerance"]);
    }

    /**
     * Sets zoom interaction
     * @category Interaction
     * @param map - map instance
     * @param opts - options
     */
    public static setZoomInteraction(map: Map, opts: unknown): void {
        map.setZoomInteraction(opts["zoom_type"]);
    }

    /**
     * Sets map modify interaction
     * @category Interaction
     * @param map - map instance
     * @param opts - options
     */
    public static setModifyInteraction(map: Map, opts: unknown): void {
        map.setModifyInteraction(opts["source"], opts["modify_callback"]);
    }

    /**
     * Sets map transform interaction
     * @category Interaction
     * @param map - map instance
     * @param opts - options
     */
    public static setTransformInteraction(map: Map, opts: unknown): void {
        map.setTransformInteraction(opts["source"], opts["transform_callback"]);
    }

    /**
     * Sets map measure interaction
     * @category Interaction
     * @category Measure
     * @param map - map instance
     * @param opts - options
     */
    public static setMeasureInteraction(map: Map, opts: unknown): void { 
       map.setMeasureInteraction(opts["measure_type"], opts["measure_popup_settings"], opts["measure_callback"]);
    }

    /**
     * Sets map get coordinates by click or pointer move interaction
     * @category Interaction
     * @param map - map instance
     * @param opts
     * ```Options
     * Options:
     * Name                             Type                           Description
     * "type"                           string                         Interaction type ("click" or "pointermove")
     * "map_coordinates_callback"       function(number[], string)     Callback function returning coordinates and map projection code
     * "declared_coordinate_system_id"  integer                        SRS Id to return coordinates in
     * ```
     */
    public static setMapCoordinatesInteraction(map: Map, opts: unknown): void {
        map.setMapCoordinatesInteraction(opts["type"], opts["map_coordinates_callback"], opts["declared_coordinate_system_id"]);
    }

    /**
     * Clears interactions
     * @category Interaction
     * @param map - map instance
     * @param types - types of interaction to clear, all if not set
     */ 
    public static clearInteractions(map: Map, types?: InteractionType[]): void {
        map.clearInteractions(types);
    }

    /**
     * Clears measure result on map
     * @category Measure
     * @param map - map instance
     */
    public static clearMeasureResult(map: Map): void {
        map.clearTemporaryLayer(TemporaryLayerType.Measure);
        map.clearMeasureOverlays();
        map.setNormalInteraction();
    }
    
    /**
     * Clears center markers on map
     * @category Map
     * @param map - map instance
     */
    public static clearCenterMarkers(map: Map): void {
        map.clearTemporaryLayer(TemporaryLayerType.CenterMarker);
    }

    /**
     * Creates new layer
     * @category Layer
     * @param type - layer's source type
     * @param opts
     * ```Options
     * Options:
     * Name                         Type           Description
     * "request"                    object         HTTP Request options
     * - "method"                   string         HTTP Method of the request
     * - "base_url"                 string         Request URL
     * - "headers"                  string         Request headers
     * - "geometry_name"            string         Geometry field name for WFS request BBox CQL Filter
     * - "axios_params"             string         Additional params to send along with the axios request
     * 
     * "min_zoom"                   number         Minimum zoom to display the layer on map
     * "max_zoom"                   number         Maximum zoom to display the layer on map
     * "feature_popup_template"     string         Template of the popup window over features, feature attribute names go in double curly braces
     * "feature_popup_css"          string         CSS of the popup window over features
     * "style"                      object         Featuire styling options
     * - "point"                    object         Options for point style
     * - "linestring"               object         Options for linestring style
     * - "polygon"                  object         Options for polygon style
     * - "label"                    object         Options for label style
     * - "unique_values":           object         Unique feature attribute value painting options
     * - - "field"                  string         Feature attribute to get unique values from
     * - - "start_color"            string         HTML color to start painting from 
     * - - "increment_color"        number         Value to increment the color by
     * "load_callback"              function       Function to call after the layer has been loaded, the layer goes as a parameter
     * "source_change_callback"     function       Function to call on layer's source modification
     * ```
     * @return created layer instance
     */
    public static createLayer(type: SourceType, opts?: unknown): LayerInterface { 
        let builder: LayerBuilder;
        switch (type) {
            case SourceType.Vector:
                builder = new LayerBuilder(new VectorLayer(null, opts));
                builder.setSource(SourceType.Vector);
                break;
            case SourceType.Cluster:
                builder = new LayerBuilder(new VectorLayer(null, opts));
                builder.setSource(SourceType.Cluster, opts);
                break;
            case SourceType.TileWMS:
                builder = new LayerBuilder(new TileLayer(opts));
                builder.setSource(SourceType.TileWMS); 
                break;
            case SourceType.XYZ:
                builder = new LayerBuilder(new TileLayer(opts));
                builder.setSource(SourceType.XYZ); 
                break;
            case SourceType.TileArcGISRest:
                builder = new LayerBuilder(new TileLayer(opts));
                builder.setSource(SourceType.TileArcGISRest);  
                break;
            default:
                break;
        }
        if (typeof builder !== "undefined" && typeof opts !== "undefined") { 
            if (typeof opts["properties"] !== "undefined") { 
                builder.setProperties(opts["properties"]);
            }
            if ((type == SourceType.Vector || type == SourceType.Cluster) && Object.prototype.hasOwnProperty.call(opts, "request")) {
                    if (opts["request"]) {
                        builder.setLoaderOptions(opts["request"]);
                    }
                    builder.setLoader(async (extent: OlExtent, resolution: number, projection: OlProjection): Promise<string> => {
                        const layerSrs = "EPSG:" + builder.getLayer().getSRSId().toString();
                        const mapSrs = projection.getCode();
                        if (layerSrs != mapSrs) {
                            extent = OlProj.transformExtent(extent, mapSrs, layerSrs);
                        }
                        let cqlFilter = "";
                        if (opts["request"]["cql_filter"]) {
                            cqlFilter = opts["request"]["cql_filter"] + " and ";
                        }
                        // TODO: opts["request"]["geometry_name"] => opts["request"]["data"]["field"]
                        cqlFilter += "bbox(" + opts["request"]["geometry_name"] + "," + extent.join(",") + ")";
                        const payload: ApiRequest = {
                            method: opts["request"]["method"],
                            params: opts["request"]["params"],
                            base_url: opts["request"]["base_url"] + "&srsname=" + layerSrs + "&cql_filter=" + cqlFilter,
                            headers: opts["request"]["headers"],
                            data: opts["request"]["data"],
                            axios_params: opts["request"]["axios_params"]
                        };
                        if (payload["data"]) {
                            payload["data"]["cql_filter"] = cqlFilter;
                            payload["data"]["native_coordinate_system_id"] = opts["srs_handling"]["native_coordinate_system_id"];
                            payload["data"]["declared_coordinate_system_id"] = opts["srs_handling"]["declared_coordinate_system_id"];
                            payload["data"]["srs_handling_type"] = opts["srs_handling"]["srs_handling_type"];
                        } else {
                            payload["data"] = { 
                                "cql_filter": cqlFilter,
                                "native_coordinate_system_id": opts["srs_handling"]["native_coordinate_system_id"],
                                "declared_coordinate_system_id": opts["srs_handling"]["declared_coordinate_system_id"],
                                "srs_handling_type": opts["srs_handling"]["srs_handling_type"]
                            };
                        }
                        const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
                        return await query.execute(payload);
                    });
            }
            if ((type == SourceType.Vector || type == SourceType.Cluster) && Object.prototype.hasOwnProperty.call(opts, "style")) {
                builder.setStyle(opts["style"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "url")) { 
                builder.setUrl(opts["url"]);
                builder.setLoaderOptions({"base_url": opts["url"]});
            }
            if (type == SourceType.TileWMS && Object.prototype.hasOwnProperty.call(opts, "params")) { 
                builder.setParams(opts["params"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "feature_popup_template")) {
                builder.setFeaturePopupTemplate(opts["feature_popup_template"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "feature_popup_css")) {
                builder.setFeaturePopupCss(opts["feature_popup_css"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "load_callback")) {
                builder.setLoadCallback(opts["load_callback"]);
            }
        }
        return builder.build();
    }

    /**
     * Creates layer from GeoJSON features
     * @category Layer
     * @param geoJSON - a string representing features
     * @param opts - options
     * @return created layer instance
     */
    public static createLayerFromGeoJSON(geoJSON: string, opts?: unknown): LayerInterface {
        const layer = <VectorLayer> this.createLayer(SourceType.Vector, opts);
        //MapManager.addToLayerFromGeoJSON(layer, geoJSON);
        geoJSON = Geometry.flattenGeometry(geoJSON);
        layer.addFeatures(geoJSON);
        return layer;
    }

    /**
     * Adds features from GeoJSON string to layer
     * @category Layer
     * @param layer - layer to add to
     * @param geoJSON - GeoJSON string representing features
     */
    public static addToLayerFromGeoJSON(layer: LayerInterface, geoJSON: string): void {
        if (layer instanceof VectorLayer) {
            layer.addFeatures(Geometry.flattenGeometry(geoJSON));
        } else {
            throw new MethodNotImplemented();
        }
    }

    /**
     * Returns features of the layer as FeatureCollection
     * @category Layer
     * @param layer - layer instance
     * @return feature collection 
     */
    public static getFeatures(layer: LayerInterface): FeatureCollection {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        return (<VectorLayer> layer).getFeatures();
    }

    /**
     * Returns total feature count of the layer (not only bounded by bbox or cql filter)
     * @category Layer
     * @param layer - layer instance
     * @return a promise with feature count
     */
    public static async getFeatureCountTotal(layer: LayerInterface): Promise<number> {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        const loaderOptions = layer.getLoaderOptions();
        if (!loaderOptions || !loaderOptions["base_url"]) {
            return Promise.resolve((<OlVectorSource> layer.getLayer().getSource()).getFeatures().length);
        }
        let url = loaderOptions["base_url"];
        let data: unknown;
        const isStandartWFS = url.toString().toLowerCase().includes("service=wfs");
        if (!isStandartWFS) {
            url += "/count";
            data = loaderOptions["data"];
        }
        const payload: ApiRequest = {
            method: HttpMethod.POST,
            base_url: url,
            data: data,
            axios_params: {
                hideNotification: true
            }        
        };
        const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
        const response = await query.execute(payload);
        return Promise.resolve(isStandartWFS ? response["features"].length : response["count"]);
    }

    /**
     * Returns features as single geometry GeoJSON
     * @category Feature
     * @param features - feature collection
     * @param srsId - SRS Id of returned features
     * @return GeoJSON representing features as single geometry
     */
    public static getFeaturesAsSingleGeometry(features: FeatureCollection, srsId: number): string {
        return features.getAsSingleGeometry(srsId);
    }

    /**
     * Returns features as multi geometry GeoJSON
     * @category Layer
     * @param features - feature collection
     * @param srsId - SRS Id of returned features
     * @return GeoJSON representing features as multi geometry
     */
    public static getFeaturesAsMultiGeometry(features: FeatureCollection, srsId: number): string {
        return features.getAsMultiGeometry(srsId);
    }

    /**
     * Returns features as GeometryCollection GeoJSON
     * @category Layer
     * @param features - feature collection
     * @param srsId - SRS Id of returned features
     * @return GeoJSON representing features as GeometryCollection
     */
    public static getFeaturesAsGeometryCollection(features: FeatureCollection, srsId: number): string {
        return features.getAsGeometryCollection(srsId);
    }
    
    /**
     * Adds features to map
     * @category Feature
     * @param map - map instance
     * @param layer - layer to add to
     * @param features - features to add
     */
    public static addFeatures(map: Map, layer: LayerInterface, features: FeatureCollection): void {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        map.addFeatures(layer, features);
    }

    /**
     * Removes features from map
     * @category Feature
     * @param map - map instance
     * @param features - features to remove
     */
    public static removeFeatures(map: Map, features: FeatureCollection): void {
        map.removeFeatures(features);
    }

    /**
     * Adds layer to the map.
     * @category Layer
     * @param map - map instance
     * @param layer - layer instance
     */
    public static addLayer(map: Map, layer: LayerInterface): void {
        map.addLayer(layer);
    }

    /**
     * Removes layer from the map.
     * @category Layer
     * @param map - map instance
     * @param layer - layer instance
     */
    public static removeLayer(map: Map, layer: LayerInterface): void {
        map.removeLayer(layer);
    }

     /**
     * Returns map layers.
     * @category Layer
     * @param map - map instance
     * @param type - type
     * @return map layers
     */
    public static getLayers(map: Map, type?: SourceType): LayerInterface[] {
        return map.getLayers(type);
    }

    /**
     * Returns active layer of the map.
     * @category Layer
     * @param map - map instance
     * @return active layer instance
     */
    public static getActiveLayer(map: Map): LayerInterface | null {
        return map.getActiveLayer();
    }

    /**
     * Sets active layer for the map.
     * @category Layer
     * @param map - map instance
     * @param layer - layer instance
     */
    public static setActiveLayer(map: Map, layer: LayerInterface | null): void {
        map.setActiveLayer(layer);
    }

    /**
     * Fits map to all layer's features extent
     * @category Layer
     * @param map - map instance
     * @param layer - layer instance
     * @param zoom - zoom after fit
     */
    public static async fitLayer(map: Map, layer: LayerInterface, zoom?: number): Promise<void> {
        if (layer.getType() != SourceType.Vector) {
            //throw new MethodNotImplemented();
            return;
        }
        const loaderOptions = layer.getLoaderOptions();
        // layer was created via createLayerFromGeoJSON() so it has no loaderOptions
        if (!loaderOptions || !loaderOptions["base_url"]) {
            map.fitLayer(layer, zoom);
            return;
        }
        let url = loaderOptions["base_url"];
        const isStandartWFS = url.toLowerCase().includes("service=wfs");
        // layer is a WFS layer so it has a "service=wfs" substring in base_url
        if (isStandartWFS) {
            map.fitLayer(layer, zoom);
        } else { 
            url += "/extent";
            const data = loaderOptions["data"];
            const payload: ApiRequest = {
                method: HttpMethod.POST,
                base_url: url,
                data: data,
                axios_params: {
                    hideNotification: true
                }        
            };
            const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
            const response = await query.execute(payload);
            if (response["extent"] && response["extent"].length == 4) {
                let extent = OlProj.transformExtent(<OlExtent> response["extent"], "EPSG:" + layer.getSRSId(), "EPSG:" + map.getSRSId());
                //extent = OlExtent.buffer(extent, 10);
                if (!extent.includes(NaN)) {
                    const olView = map.getMap().getView();
                    olView.fit(extent);
                    if (typeof zoom !== "undefined") {
                        olView.setZoom(zoom);
                    }
                }
            }
        }
    }

    /**
     * Fits map to given features extent
     * @category Feature
     * @param map - map instance
     * @param features - features
     * @param zoom - zoom after fit
     */
    public static fitFeatures(map: Map, features: FeatureCollection, zoom?: number): void { 
        map.fitFeatures(features, zoom);
    }

    /**
     * Sets zIndex of layer
     * @category Layer
     * @param layer - layer instance
     * @param zIndex - zIndex to set
     */
    public static setZIndex(layer: LayerInterface, zIndex: number): void {
        layer.setZIndex(zIndex);
    }

    /**
     * Sets opacity of layer
     * @category Layer
     * @param layer - layer instance
     * @param opacity - opacity to set (from 0 to 100)
     */
    public static setOpacity(layer: LayerInterface, opacity: number): void { 
        layer.setOpacity(opacity);
    }

    /**
     * Return layer's SRS Id
     * @category Layer
     * @param layer - layer instance
     * @return SRS Id
     */
    public static getSRSId(layer: LayerInterface): number { 
        return layer.getSRSId();
    }

    /**
     * Returns map's selected features
     * @category Feature
     * @param map - map instance
     * @return selected features
     */
    public static getSelectedFeatures(map: Map): FeatureCollection { 
        return map.getSelectedFeatures();
    }

    /**
     * Clears map's selection
     * @category Interaction
     * @param map - map instance
     */
    public static clearSelection(map: Map): void { 
        map.clearSelectedFeatures();
    }

    /**
     * Sets an event handler on map
     * @category Event Handler
     * @param map - map instance
     * @param eventType - event type
     * @param handlerId - handler id
     * @param callback - callback function to call when an event is triggered
     */
    public static setEventHandler(map: Map, eventType: EventType, handlerId: string, callback: (data: unknown) => void): void {
        map.setEventHandler(eventType, handlerId, callback);
    }

    /**
     * Returns map's event handlers
     * @category Event Handler
     * @param map - map instance
     * @return event handlers collection
     */
    public static getEventHandlers(map: Map): EventHandlerCollection {
        return map.getEventHandlers();
    }

    /**
     * Returns map's dirty (added or modified) features
     * @category Feature
     * @param layer - layer instance
     * @return dirty features
     */
    public static getDirtyFeatures(layer: LayerInterface): FeatureCollection {
        return layer.getDirtyFeatures();
    }

    /**
     * Returns map's removed features
     * @category Feature
     * @param layer - layer instance
     * @return removed features
     */
    public static getRemovedFeatures(layer: LayerInterface): FeatureCollection {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        return layer.getRemovedFeatures();
    }

    /**
     * @param map - map instance
     * @category Layer
     * @return dirty layers
     */
    public static getDirtyLayers(map: Map): LayerInterface[] {
        return map.getDirtyLayers();
    }

    /**
     * @param layer - layer to clear
     */
    public static clearDirtyFeatures(layer: LayerInterface): void {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        layer.clearDirtyFeatures();
    }

    /**
     * Returns feature vertices' coordinates along with their indices
     * @category Feature
     * @param feature - feature
     * @param srsId - SRS Id to return vertices in, defaults to feature's layer SRS Id
     * @return array of feature vertices' along with their ids and coordinates
     */
    public static getVertices(feature: Feature, srsId?: number): GeometryItem[] {
        return feature.getVertices(srsId);
    }

    /**
     * Creates feature from vertices
     * @category Feature
     * @param geometryItems feature vertices' along with their ids and coordinates
     * @param layer - layer to put feature to
     * @param srsId - SRS Id of geometry items, defaults to layer SRS Id
     * @return resulting feature
     */
    public static createFeatureFromVertices(geometryItems: GeometryItem[], layer: LayerInterface, srsId?: number): Feature {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        return layer.createFeatureFromVertices(geometryItems, srsId);
    }

    /**
     * Updates feature from vertices
     * @category Feature
     * @param geometryItems feature vertices' along with their ids and coordinates
     * @param feature - feature to set vertices to
     * @param srsId - SRS Id of geometry items, defaults to feature's layer SRS Id
     * @return resulting feature
     */
    public static updateFeatureFromVertices(geometryItems: GeometryItem[], feature: Feature, srsId?: number): Feature {
        return feature.updateFromVertices(geometryItems, srsId);
    }

    /**
     * Highlights feature
     * @category Feature
     * @param feature - feature to highlight
     */
    public static highlightFeature(feature: Feature): void {
        feature.highlight();
    }

    /**
     * Unhighlights feature
     * @category Feature
     * @param feature - feature to unhighlight
     */
    public static unhighlightFeature(feature: Feature): void {
        feature.unhighlight();
    }

    /**
     * Returns feature geometry as text
     * @category Feature
     * @param feature - feature
     * @param format - format to return in
     * @param srsId - SRS Id of returned feature text representation
     * @return text representing feature
     */
    public static getGeometryAsText(feature: Feature, format: GeometryFormat, srsId: number): string {
       return feature.getGeometryAsText(format, srsId);
    }

    /**
     * Updates feature geometry from text
     * @category Feature
     * @param feature - feature
     * @param text - feature text representation
     * @param format - format of feature text representation
     * @param srsId - SRS Id of feature text representation
     */
    public static updateGeometryFromText(feature: Feature, text: string, format: GeometryFormat, srsId: number): void {
        feature.updateGeometryFromText(text, format, srsId);
    }

    /**
     * Creates feature geometry from text
     * @category Feature
     * @param layer - layer to put a feature into
     * @param text - feature text representation
     * @param format - format of feature text representation
     * @param srsId - SRS Id of feature text representation
     */
    public static createGeometryFromText(layer: LayerInterface, text: string, format: GeometryFormat, srsId: number): Feature {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        const feature = new Feature();
        return feature.createGeometryFromText(layer, text, format, srsId);
    }

    /**
     * Copies features into clipboard
     * @category Feature
     * @category Clipboard
     * @param map - map instance
     * @param features - features to cut
     */
    public static copyFeatures(map: Map, features: FeatureCollection): void {
        MapManager.setStyle(features, CopyStyle);
        map.copyToClipBoard(features);
    }

    /**
     * Cuts features into clipboard
     * @category Feature
     * @category Clipboard
     * @param map - map instance
     * @param features - features to cut
     */
    public static cutFeatures(map: Map, features: FeatureCollection): void {
        MapManager.setStyle(features, CutStyle);
        map.cutToClipBoard(features);
    }

    /**
     * Pastes features from clipboard
     * @category Feature
     * @category Clipboard
     * @param map - map instance
     * @param map - layer instance to paste to
     */
    public static pasteFeatures(map: Map, layer: LayerInterface): void {
        if (layer.getType() != SourceType.Vector) {
            throw new MethodNotImplemented();
        }
        map.pasteFromClipboard(layer);
    }

    /**
     * Sets style of features 
     * @category Feature
     * @param features - features
     * @param style - style
     */
    public static setStyle(features: FeatureCollection, style: unknown): void {
        if (features && features.getLength()) {
            const styleFunc = new StyleBuilder(style).build(false);
            features.forEach((feature: Feature): void => {
                feature.setStyle(styleFunc);
            });
        }
    }

    /**
     * Highlights vertex
     * @category Feature
     * @param coordinate - coordinate
     * @param srsId - SRS Id of coordinate
     */
     public static highlightVertex(map: Map, coordinate: number[], srsId: number): void {
        map.highlightVertex(coordinate, srsId);
    }

    /**
     * Clears vertex highlight
     * @category Feature
     * @param map - map instance
     */
    public static clearVertexHighlight(map: Map): void {
        map.clearVertexHighlight();
    }

    /**
     * Checks whether feature collection valid
     * @category Feature
     * @param features - feature collection to validate
     * @return boolean indicating whether all features in collection valid
     */
    public static isValid(features: FeatureCollection): boolean {
        return features.getFeatures().filter(feature => !feature.isValid()).length == 0;
    }

    /**
     * Converts line to polygon
     * @category Feature
     * @param feature - feature representing a line
     * @return feature representing a polygon
     */
    public static lineToPolygon(feature: Feature): Feature {
        return feature.lineToPolygon();
    }

    /**
     * Converts polygon to line
     * @category Feature
     * @param feature - feature representing a polygon
     * @return feature representing a line
     */
    public static polygonToLine(feature: Feature): Feature {
        return feature.polygonToLine();
    }

    /**
     * Creates feature collection from GeoJSON features
     * @category Feature
     * @param geoJSON - a string representing features
     * @param sourceSRSId - SRS Id of input GeoJSON
     * @param destinationSrsId - SRS Id of resulting features 
     * @return feature collection
     */
    public static createFeatureCollectionFromGeoJSON(geoJSON: string, sourceSRSId: number, destinationSrsId?: number): FeatureCollection {
        return FeatureCollection.createFromGeoJSON(Geometry.flattenGeometry(geoJSON), sourceSRSId, destinationSrsId);
    }

    /**
     * Registers a new projection
     * @category Misc
     * @param code - projection EPSG:XXXX code
     * @param definition - projection definition in Proj4 format
     * @param extent - projection extent
     */
    public static addProjection(code: string, definition: string, extent?: number[]): void {
        proj4.default.defs(code, definition);
        OlProjRegister(proj4.default);
        if (extent && extent.length == 4) {
            OlProj.get(code).setExtent(<OlExtent> extent);
        }
    }

}
