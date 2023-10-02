import { Vector as OlVectorSource } from "ol/source";
import * as OlProj from "ol/proj";
import { GeoJSON as OlGeoJSON }  from "ol/format";
import { register as OlProjRegister } from 'ol/proj/proj4';
import OlProjection from "ol/proj/Projection";
import * as OlExtent from "ol/extent";
import * as proj4 from "proj4"
import OlVectorTileSource from "ol/source/VectorTile";
import OlVectorTile from "ol/VectorTile";
import { TileCoord as OlTilecoord } from 'ol/tilecoord';
import OlFeature from "ol/Feature";
import OlBaseEvent from "ol/events/Event";
import { ImageTile, MapBrowserEvent as OlMapBrowserEvent, Tile } from "ol";
import "../assets/style.css"
import Map from "./Domain/Model/Map/Map"
import LayerInterface from "./Domain/Model/Layer/LayerInterface"
import VectorLayer from "./Domain/Model/Layer/Impl/VectorLayer"
import TileLayer from "./Domain/Model/Layer/Impl/TileLayer"
import ImageLayer from "./Domain/Model/Layer/Impl/ImageLayer"
import VectorTileLayer from "./Domain/Model/Layer/Impl/VectorTileLayer";
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
import Units from "./Domain/Model/Feature/Units";
import StringUtil from "./Infrastructure/Util/StringUtil";
import VectorTileSourceFormat from "./Domain/Model/Source/VectorTileSourceFormat";
import FeatureClickFunction from "./Domain/Model/Layer/FeatureClickFunctionType";
import { ZoomCallbackFunction } from "./Domain/Model/Interaction/InteractionCallbackType";


/** A common class which simplifies usage of OpenLayers in GIS projects */
export default class MapManager { 

    public static eventBus = new EventBus();

    /**
     * Creates OpenLayers map object and controls.
     * @category Map
     * @param targetDOMId - id of target DOM element
     * @param opts
     * ```Options
     * Options:
     * Name                               Type           Description
     * "base_layer"                       number         Type of base layer, OSM only supported so far
     * "base_layer_use_proxy"             boolean        Whether to use proxy of kind /osm/{z}/{x}/{y}.png for base layer to avoid CORS problems
     * "declared_coordinate_system_id"    number         Map SRS Id, e.g. 3857
     * "center"                           object         Map center options
     * - "x"                              number         Map center X coordinate
     * - "y"                              number         Map center Y coordinate
     * - "declared_coordinate_system_id"  number         Map center SRS Id, e.g. 4326
     * 
     * "zoom"                             number         Map initial zoom   
     * "controls"                         array<string>  Map controls, "zoom" and "scaleline" are supported
     * ```
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
     * Refreshes layers on map
     * @category Map
     * @param map - map instance
     * @param layers - array of layers to refresh, if omitted or empty array, all map layers will be refreshed 
     */
    public static refresh(map: Map, layers?: LayerInterface[]): void {
        if (!layers) {
            layers = [];
        }
        map.refresh(layers);
    }

    /**
     * Sets center of the map. Notice: in case of degree-based CRS x is longitude, y is latitude.
     * @category Map
     * @param map - map instance
     * @param opts
     * ```Options
     * Options:
     * Name                             Type           Description
     * "x"                              number         X coordinate
     * "y"                              number         Y coordinate
     * "declared_coordinate_system_id"  number         SRS of coordinates, e.g. 4326, defauts to map SRS if omitted
     * "show_marker"                    boolean        A boolean that determines whether to show a marker after centering, defauts to false if omitted
     * ```
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
    public static setZoomCallback(map: Map, callback: ZoomCallbackFunction): void {
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
     * Sets scale of the map.
     * @category Map
     * @param map - map instance
     * @param scale - scale value (e.g. 500 for 1:500)
     */
    public static setScale(map: Map, scale: number): void {
        map.setScale(scale);
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
     * Exports map
     * @category Map
     * @param map - map instance
     * @param exportType - type of export, defaults to ExportType.Printer
     * @param isDownload - parameter indicating whether the file should be downloaded by a browser, works for PNG and JPEG only, defaults to true
     * @param isBlob - parameter indicating whether the file should be returned as a Blob instead of Base64, defaults to true
     * @return in case of PNG or GeoTIFF a promise with the file information 
     */
    public static async export(map: Map, exportType: ExportType = ExportType.Printer, isDownload: boolean = true, isBlob: boolean = true): Promise<unknown> {
        return await map.export(exportType, isDownload, isBlob);
    }

    /**
     * Adds text to the map
     * @category Map
     * @param map - map instance
     * @param coordinates - coordinates in map projection
     * @param opts - options
     */
    public static addText(map: Map, coordinates: number[], opts: unknown): void {
        map.addText(coordinates, opts);
    }

    /**
     * Sets feature click callback for map
     * @category Map
     * @param map - map instance
     * @param callback - feature callback function
     */
    public static setFeatureClickCallback(map: Map, callback: FeatureClickFunction): void {
        const listener = (e: OlBaseEvent) => {
            const features = new FeatureCollection();
            const olMap = map.getMap();
            olMap.forEachFeatureAtPixel((<OlMapBrowserEvent<UIEvent>>e).pixel, (feature: OlFeature) => {
                features.add(new Feature(feature));
            });
            if (typeof callback === "function") {
                callback(features);
            }
        }
        const vtLayers = map.getLayers(SourceType.VectorTile);
        if (vtLayers.length == 0) {
            map.getEventHandlers().remove("VTFeatureClickEventHandler"); 
        } else if (vtLayers.length == 1) {
            map.getEventHandlers().add(EventType.Click, "VTFeatureClickEventHandler", listener); 
        }
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
     * @param opts
     * ```Options
     * Options:
     * Name                         Type           Description
     * "selection_type"             string         Type of selection. "singleclick", "rectangle", "polygon", "circle" are allowed
     * "layers"                     array          Array of layers to select on
     * "multiple"                   boolean        A boolean that determines if the default behaviour should add a next clicked feature to selection or select this single feature only. Actual for singleclick selection_type only
     * "pin"                        boolean        A boolean that determines if the default behaviour should select only single features or all (overlapping) features. Actual for singleclick selection_type only
     * ```
     */
    public static setSelectInteraction(map: Map, opts: unknown): InteractionInterface {
        return map.setSelectInteraction(opts["selection_type"], opts["layers"], opts["multiple"], opts["pin"], opts["select_callback"]);
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
     * Clears temporary text objects on map
     * @category Map
     * @param map - map instance
     */
     public static clearTemporaryTexts(map: Map): void {
        map.clearTemporaryLayer(TemporaryLayerType.Text);
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
            case SourceType.VectorTile:
                builder = new LayerBuilder(new VectorTileLayer(null, opts));
                builder.setSource(SourceType.VectorTile, opts);
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
            case SourceType.ImageArcGISRest:
                builder = new LayerBuilder(new ImageLayer(opts));
                builder.setSource(SourceType.ImageArcGISRest);  
                break;
            default:
                break;
        }
        if (typeof builder !== "undefined" && typeof opts !== "undefined") { 
            if (typeof opts["properties"] !== "undefined") { 
                builder.setProperties(opts["properties"]);
            }
            builder.setOptions(opts);
            if ((type == SourceType.Vector || type == SourceType.Cluster) && Object.prototype.hasOwnProperty.call(opts, "request")) {
                    builder.setLoader(async (extent: OlExtent.Extent, resolution: number, projection: OlProjection, success, failure): Promise<void> => {
                        const layer = builder.getLayer();
                        const layerSrs = "EPSG:" + layer.getSRSId().toString();
                        const mapSrs = projection.getCode();
                        if (layerSrs != mapSrs) {
                            extent = OlProj.transformExtent(extent, mapSrs, layerSrs);
                        }
                        // request params might further be changed via layer.setOptions()
                        opts["request"] = layer.getOptions()["request"] ;
                        let cqlFilter = "";
                        if (opts["request"]["cql_filter"]) {
                            cqlFilter = opts["request"]["cql_filter"] + " and ";
                        }
                        cqlFilter += "bbox(" + opts["request"]["geometry_name"] + "," + extent.join(",") + ")";
                        if (!opts["request"]["params"]) {
                            opts["request"]["params"] = {};
                        }
                        opts["request"]["params"]["cql_filter"] = cqlFilter;
                        opts["request"]["params"]["srsname"] = layerSrs;
                        const payload: ApiRequest = {
                            method: opts["request"]["method"],
                            params: opts["request"]["params"],
                            base_url: opts["request"]["base_url"],
                            headers: opts["request"]["headers"],
                            data: opts["request"]["data"],
                            axios_params: opts["request"]["axios_params"],
                            request_on_fullfilled: opts["request"]["request_on_fullfilled"],
                            response_on_fullfilled: opts["request"]["response_on_fullfilled"],
                            request_on_rejected: opts["request"]["request_on_rejected"],
                            response_on_rejected: opts["request"]["response_on_rejected"]
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

                        /* const worker = new Worker("Domain/Model/Source/Worker/VectorLoadWorker.ts");
                        /worker.onmessage = (e) => {
                            (<OlVectorSource> builder.getSource()).addFeatures(new OlGeoJSON().readFeatures(e.data, {
                                dataProjection: layerSrs,
                                featureProjection: mapSrs
                            }));
                        }
                        worker.postMessage(payload); */
                        
                        const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
                        const data = await query.execute(payload);
                        (<OlVectorSource> builder.getSource()).addFeatures(new OlGeoJSON().readFeatures(data, {
                            dataProjection: layerSrs,
                            featureProjection: mapSrs
                        }));
                    });
            }
            if (type == SourceType.VectorTile) {
                builder.setUrl(opts["request"]["base_url"]);
                const format = opts["format"] ? opts["format"] : VectorTileSourceFormat.GeoJSON;
                builder.setFormat(format);
                if (format == VectorTileSourceFormat.GeoJSON) {
                    builder.setTileUrlFunction((tileCoord: OlTilecoord) => {
                        return JSON.stringify(tileCoord);
                    });
                    builder.setTileLoadFunction((tile: OlVectorTile, url: string) => {
                        const tileCoord = JSON.parse(url);
                        const tileIndex: any = builder.getLayer().getTileIndex();
                        const data = tileIndex.getTile(
                            tileCoord[0],
                            tileCoord[1],
                            tileCoord[2]
                        );
                        const geojson = JSON.stringify({
                            type: 'FeatureCollection',
                            features: data ? data.features : [],
                        }, StringUtil.replacer);
                        const format: any = builder.getLayer().getFormat();
                        const features = format.readFeatures(geojson, {
                            extent: (<OlVectorTileSource> builder.getSource()).getTileGrid().getTileCoordExtent(tileCoord),
                            featureProjection: "EPSG:3857", /// hardcode!!!
                        });
                        tile.setFeatures(features);
                    });
                } else {
                    builder.setTileLoadFunction((tile: OlVectorTile, url: string) => {
                        tile.setLoader(async function(extent, resolution, projection) {
                            const payload = {
                                base_url: url,
                                method: opts["request"]["method"],
                                headers: opts["request"]["headers"],
                                data: opts["request"]["data"],
                                responseType: "arraybuffer",
                                axios_params: opts["request"]["axios_params"],
                                request_on_fullfilled: opts["request"]["request_on_fullfilled"],
                                response_on_fullfilled: opts["request"]["response_on_fullfilled"],
                                request_on_rejected: opts["request"]["request_on_rejected"],
                                response_on_rejected: opts["request"]["response_on_rejected"]
                            }
                            if (opts["request"]["method"].toLowerCase() == "post") {
                                if (opts["request"]["data"]) {
                                    const data = new FormData();
                                    Object.keys(opts["request"]["data"]).forEach((key: string): void => {
                                        data.append(key, JSON.stringify(opts["request"]["data"][key]));
                                    });
                                    payload["data"] = data;
                                }
                            }
                            const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
                            await query.execute(payload)
                            .then(function(data) {
                                const format = tile.getFormat();
                                const features = format.readFeatures(data, {
                                    extent: extent,
                                    featureProjection: projection
                                });
                                tile.setFeatures(<OlFeature[]> features);
                            });
                        });
                    });
                }
            }
            if ((type == SourceType.Vector || type == SourceType.VectorTile || type == SourceType.Cluster) && Object.prototype.hasOwnProperty.call(opts, "style")) {
                builder.setStyle(opts["style"]);
                if (Object.prototype.hasOwnProperty.call(opts["style"], "highlight")) {
                    builder.setVertexHighlightStyle(opts["style"]["highlight"]);
                }
            }
            if (type == SourceType.TileWMS || type == SourceType.TileArcGISRest || type == SourceType.ImageArcGISRest || type == SourceType.XYZ) { 
                builder.setParams(opts["request"]["params"]);
                builder.setUrl(opts["request"]["base_url"]);
                if (type == SourceType.TileWMS) { 
                    builder.setTileLoadFunction(async (tile: ImageTile, url: string) => {
                        /* const payload = {
                            method: opts["request"]["method"],
                            base_url: url,
                            headers: opts["request"]["headers"],
                            responseType: "blob"
                        };
                        const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
                        await query.execute(payload)
                        .then(function(data) {
                            (<HTMLImageElement> tile.getImage()).src = URL.createObjectURL(data);
                        }); */

                        (<HTMLImageElement> tile.getImage()).src = url;
                    });
                }
            }
            if (Object.prototype.hasOwnProperty.call(opts, "feature_popup_template")) {
                builder.setFeaturePopupTemplate(opts["feature_popup_template"]);
                builder.setFeaturePopupCss(opts["feature_popup_css"]);
            }
            if (Object.prototype.hasOwnProperty.call(opts, "load_callback")) {
                builder.setLoadCallback(opts["load_callback"]);
            }
        }
        return builder.build();
    }

    /**
     * Creates vector layer from GeoJSON features
     * @category Layer
     * @param geoJSON - a string representing features
     * @param opts - options
     * @return created layer instance
     */
    public static createLayerFromGeoJSON(geoJSON: string, opts?: unknown): LayerInterface {
        const layer = MapManager.createLayer(SourceType.Vector, opts);
        layer.addFeatures(Geometry.flattenGeometry(geoJSON));
        return layer;
    }

    /**
     * Adds features from GeoJSON string to vector layer
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
     * Creates vector tile layer from GeoJSON features
     * @category Layer
     * @param geoJSON - a string representing features
     * @param opts - options
     * @return created layer instance
     */
    public static createVectorTileLayerFromGeoJSON(geoJSON: string, opts?: unknown): LayerInterface {
        const layer = MapManager.createLayer(SourceType.VectorTile, opts);
        layer.setTileIndex(JSON.parse(geoJSON));
        return layer;
    }

    /**
     * Sets features from GeoJSON string to vector tile layer
     * @category Layer
     * @param layer - layer to add to
     * @param geoJSON - GeoJSON string representing features
     */
    public static setVectorTileLayerGeoJSON(layer: LayerInterface, geoJSON: string): void {
        if (layer instanceof VectorTileLayer) {
            layer.setTileIndex(JSON.parse(geoJSON));
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
        const loaderOptions = layer.getOptions()["request"];
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
     * @param sourceSrsId - SRS Id of feature geometry
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return GeoJSON representing features as single geometry
     */
    public static getFeaturesAsSingleGeometry(features: FeatureCollection, sourceSrsId: number, targetSrsId?: number): string {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        return features.getAsSingleGeometry(sourceSrsId, targetSrsId);
    }

    /**
     * Returns features as multi geometry GeoJSON
     * @category Layer
     * @param features - feature collection
     * @param sourceSrsId - SRS Id of feature geometry
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return GeoJSON representing features as multi geometry
     */
    public static getFeaturesAsMultiGeometry(features: FeatureCollection, sourceSrsId: number, targetSrsId?: number): string {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        return features.getAsMultiGeometry(sourceSrsId, targetSrsId);
    }

    /**
     * Returns features as GeometryCollection GeoJSON
     * @category Layer
     * @param features - feature collection
     * @param sourceSrsId - SRS Id of feature geometry
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return GeoJSON representing features as GeometryCollection
     */
    public static getFeaturesAsGeometryCollection(features: FeatureCollection, sourceSrsId: number, targetSrsId?: number): string {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        return features.getAsGeometryCollection(sourceSrsId, targetSrsId);
    }

    /**
     * Returns features as GeoJSON string
     * @category Layer
     * @param features - feature collection
     * @param sourceSrsId - SRS Id of features
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return text representing feature
     */
    public static getFeaturesAsFeatureCollection(features: FeatureCollection, sourceSrsId: number, targetSrsId?: number): string {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        return features.getAsFeatureCollection(sourceSrsId, targetSrsId);
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
        if (layer.getType() == SourceType.TileWMS) {
            map.fitLayer(layer, zoom);
            return;
        } else if (layer.getType() == SourceType.Vector) {
            const loaderOptions = layer.getOptions()["request"];
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
                    let extent = OlProj.transformExtent(<OlExtent.Extent> response["extent"], "EPSG:" + layer.getSRSId(), "EPSG:" + map.getSRSId());
                    extent = OlExtent.buffer(extent, 10);
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
    }

    /**
     * Returns layer properties
     * @category Layer
     * @param layer - layer
     * @return layer properties
     */
    public static getProperties(layer: LayerInterface): unknown { 
        return layer.getProperties();
    }

    /**
     * Sets layer properties
     * @category Layer
     * @param layer - property layer
     * @param properties - properties
     */
    public static setProperties(layer: LayerInterface, properties: unknown): void { 
        return layer.setProperties(properties);
    }

    /**
     * Sets layer property
     * @category Layer
     * @param layer - property layer
     * @param name - property name
     * @param value - property value
     */
    public static setProperty(layer: LayerInterface, name: string, value: unknown): void { 
        return layer.setProperty(name, value);
    }

    /**
     * Returns an array of layers where feature intersects layer's feature(s)
     * @category Feature
     * @param feature - feature
     * @return an array of intersected layers
     */
    public static getFeatureIntersectedLayers(feature: Feature): LayerInterface[] { 
        return feature.getIntersectedLayers();
    }

    /**
     * Fits map to given features extent
     * @category Feature
     * @param map - map instance
     * @param features - features
     * @param zoom - zoom after fit
     * @param showCenterMarker - whether to show a center marker after fit
     */
     public static fitFeatures(map: Map, features: FeatureCollection, zoom?: number, showCenterMarker?: boolean): void { 
        map.fitFeatures(features, zoom, showCenterMarker);
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
     * @param sourceSrsId - SRS Id of feature
     * @param targetSrsId - SRS Id of returned data, defaults to sourceSrsId if omitted
     * @return array of feature vertices' along with their ids and coordinates
     */
    public static getVertices(feature: Feature, sourceSrsId: number, targetSrsId?: number): GeometryItem[] {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        if (!feature) {
            return [];
        }
        return feature.getVertices(sourceSrsId, targetSrsId);
    }

    /**
     * Creates feature from vertices
     * @category Feature
     * @param geometryItems feature vertices' along with their ids and coordinates
     * @param sourceSrsId - SRS Id of feature representation
     * @param targetSrsId - SRS Id of returned feature, defaults to sourceSrsId if omitted
     * @return resulting feature
     */
    public static createFeatureFromVertices(geometryItems: GeometryItem[], sourceSrsId: number, targetSrsId?: number): Feature {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        try {
            const feature = new Feature();
            return feature.createFromVertices(geometryItems, sourceSrsId, targetSrsId);
        } catch(e) {
            return null;
        }
    }

    /**
     * Updates feature from vertices
     * @category Feature
     * @param geometryItems feature vertices' along with their ids and coordinates
     * @param feature - feature to set vertices to
     * @param sourceSrsId - SRS Id of feature representation
     * @param targetSrsId - SRS Id of returned feature, defaults to sourceSrsId if omitted
     * @return resulting feature
     */
    public static updateFeatureFromVertices(geometryItems: GeometryItem[], feature: Feature, sourceSrsId: number, targetSrsId?: number): Feature {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        try {
            return feature.updateFromVertices(geometryItems, sourceSrsId, targetSrsId);
        } catch(e) {
            return null;
        }
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
     * @param sourceSrsId - SRS Id of feature geometry
     * @param targetSrsId - SRS Id of returned text, defaults to sourceSrsId if omitted
     * @return text representing feature
     */
    public static getGeometryAsText(feature: Feature, format: GeometryFormat, sourceSrsId: number, targetSrsId?: number): string {
       if (!targetSrsId) {
            targetSrsId = sourceSrsId;
       }
       return feature.getGeometryAsText(format, sourceSrsId, targetSrsId);
    }

    /**
     * Updates feature from text
     * @category Feature
     * @param feature - feature
     * @param text - feature text representation
     * @param format - text format, "WKT" or "GeoJSON"
     * @param sourceSrsId - SRS Id of feature text representation
     * @param targetSrsId - SRS Id of returned feature, defaults to sourceSrsId if omitted
     * @return feature
     */
    public static updateFeatureFromText(feature: Feature, text: string, format: GeometryFormat, sourceSrsId: number, targetSrsId?: number): Feature {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        try {
            return feature.updateFromText(text, format, sourceSrsId, targetSrsId);
        } catch(e) {
            return null;
        }
    }

    /**
     * Creates feature from text
     * @category Feature
     * @param text - feature text representation
     * @param format - text format, "Text", "WKT" or "GeoJSON"
     * @param sourceSrsId - SRS Id of feature text representation
     * @param targetSrsId - SRS Id of returned feature, defaults to sourceSrsId if omitted
     * @return feature
     */
    public static createFeatureFromText(text: string, format: GeometryFormat, sourceSrsId: number, targetSrsId?: number): Feature {
        if (!targetSrsId) {
            targetSrsId = sourceSrsId;
        }
        const feature = new Feature();
        try {
            return feature.createFromText(text, format, sourceSrsId, targetSrsId);
        } catch(e) {
            return null;
        }
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
            const styleFunc = new StyleBuilder(style).build();
            features.forEach((feature: Feature): void => {
                feature.setStyle(styleFunc);
            });
        }
    }

    /**
     * Highlights vertex
     * @category Feature
     * @param map - map instance
     * @param coordinate - coordinate
     * @param srsId - SRS Id of coordinate
     * @param style - highlight style
     * @param id - vertex id
     * @param label - label for vertex
     * @return highlight feature
     */
    public static highlightVertex(map: Map, coordinate: number[], srsId: number, 
        style: unknown = null, id?: number, label?: string): Feature {
        return map.highlightVertex(coordinate, srsId, style, id, label);
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
     * Selects all features inside a given one
     * @category Feature
     * @param map - map instance
     * @param feature - given feature
     * @param layers - layers to select features on (all layers if not specified)
     */
    public static selectFeaturesInside(map: Map, feature: Feature, layers?: LayerInterface[]): void {
        map.selectFeaturesInside(feature, layers);
    }

    /**
     * Checks whether feature valid
     * @category Feature
     * @param feature - feature to validate
     * @param geometryType - geometry type of feature, if omitted then feature's own geometry type will be used
     * @return boolean indicating whether feature valid
     */
    public static isValid(feature: Feature, geometryType?: string): boolean {
        return feature.isValid(geometryType);
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
     * Returns the length of linestring or multilinestring, 
     * the perimeter of polygon or multipolygon in given units
     * @category Feature
     * @param feature - feature
     * @param units - units, "meters" or "kilometers"
     * @param srsId - srs id of projection, defaults to 3857
     * @return length of linestring or multilinestring, perimeter of polygon or multipolygon
     */
    public static getLength(feature: Feature, units: Units, srsId = 3857): number {
        return feature.getLength(units, srsId);
    }

    /**
     * Returns the area of polygon or multipolygon in given units
     * @category Feature
     * @param feature - feature
     * @param units - units, "meters" or "kilometers"
     * @param srsId - srs id of projection, defaults to 3857
     * @return area of polygon or multipolygon
     */
    public static getArea(feature: Feature, units: Units, srsId = 3857): number {
        return feature.getArea(units, srsId);
    }

    /**
     * Returns feature's geometry type
     * @category Feature
     * @param feature - feature
     * @return geometry type: Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection, Circle
     */
    public static getFeatureType(feature: Feature): string {
        return feature.getFeature().getGeometry().getType();
    }

    /**
     * Returns default styles
     * @category Style
     * @return default styles
     */
    public static getDefaultStyles(): unknown {
        return {
            "point": {
                "marker_type": "simple_point",
                "color": "#3399CC"
            },
            "polygon": {
                "color": "#3399CC",
                "background_color": "rgba(255, 255, 255, 0.4)"
            },
            "linestring": {
                "color": "#3399CC"
            },
            "label": {
            }
        };
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
            OlProj.get(code).setExtent(<OlExtent.Extent> extent);
        }
    }

    /**
     * Transforms coordinates from one projection to another one
     * @category Misc
     * @param map - map instance
     * @param coordinates - coordinates
     * @param sourceSrsId - source SRS Id (e.g. 4326)
     * @param destinationSrsId - destination SRS Id (e.g. 3857)
     * @return transformed coordinates
     */
    public static transformCoordinates(coordinates: number[], sourceSrsId: number, destinationSrsId: number): number[] {
        return OlProj.transform(coordinates, "EPSG:" + sourceSrsId.toString(), "EPSG:" + destinationSrsId.toString());
    }

    /**
     * Returns projection units
     * @category Misc
     * @param srsId - projection SRS Id (e.g. 4326)
     * @return projection units
     */
    public static getProjectionUnits(srsId: number): string {
        return OlProj.get("EPSG:" + srsId.toString()).getUnits();
    }

   /**
     * Converts points given in text to array
     * @param text - points given in text
     * @param swapCoordinates - whether to swap coordinates, defaults to false
     * @return array of points
     */
     public static textPointsToArray(text: string, swapCoordinates: boolean = false): number[][] {
        return Geometry.textPointsToArray(text, swapCoordinates);
    }

    /**
     * Converts points given in text to array
     * @param points - array of points
     * @param swapCoordinates - whether to swap coordinates, defaults to false
     * @return points given in text
     */
    public static arrayToTextPoints(points: number[][], swapCoordinates: boolean = false): string {
        return Geometry.arrayToTextPoints(points, swapCoordinates);
    }

}
