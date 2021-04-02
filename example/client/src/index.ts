import MapManager from "map-component-accent2";
import Map from "../../../src/Domain/Model/Map/Map";
import BaseLayer from "../../../src/Domain/Model/Map/BaseLayer";
import SourceType from "../../../src/Domain/Model/Source/SourceType";
import VectorLayer from "../../../src/Domain/Model/Layer/Impl/VectorLayer";
import LayerInterface from "../../../src/Domain/Model/Layer/LayerInterface";
import Feature from "../../../src/Domain/Model/Feature/Feature";
import FeatureCollection from "../../../src/Domain/Model/Feature/FeatureCollection";
import Pattern from "../../../src/Infrastructure/Util/Pattern";
import { HttpMethod } from "../../../src/Infrastructure/Http/HttpMethod";
import InteractionType from "../../../src/Domain/Model/Map/Interaction/InteractionType";


//const geojsonObject = "{\"type\":\"FeatureCollection\",\"crs\":{\"type\":\"name\",\"properties\":{\"name\":\"urn:ogc:def:crs:EPSG::4326\"}},\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[43.9959246, 56.3238061]},\"properties\":{}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[43.9930658,56.325005]},\"properties\":{}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[43.9910433,56.329966]},\"properties\":{}}]}";
//const geojsonObject = '{"type":"GeometryCollection","geometries":[{"type":"Point","coordinates":[43.9959246, 56.3238061]},{"type":"Point","coordinates":[43.9930658,56.325005]},{"type":"Point","coordinates":[43.9910433,56.329966]}]}';
const geojsonObject = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[43.91243896752929,56.32925921113059]},"properties":{"attr_123_": "Hello1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[43.918962099853516,56.33506428695259]},"properties":{"attr_123_": "Hello2"}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[43.92376861840821,56.329925412221826],[43.92806015283203,56.3157423355226]]},"properties":{"attr_123_": "Hello3"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[43.933038332763665,56.33382721368193],[43.94917450219726,56.325737669335865],[43.94934616357422,56.34029761476677],[43.933038332763665,56.33382721368193]]]},"properties":{"attr_123_": "Hello4"}},{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[43.933038332763665,56.33382721368193],[43.94917450219726,56.325737669335865],[43.94934616357422,56.34029761476677],[43.933038332763665,56.33382721368193]]]},"properties":{"attr_123_": "Hello5"}}]}';
//const geojsonObject = '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::3857"}},"features":[{"type":"Feature","geometry":{"type":"GeometryCollection","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"geometries":[{"type":"Point","coordinates":[4897285.68,7623388.9]},{"type":"Point","coordinates":[4898484.87,7623790.91]},{"type":"LineString","coordinates":[[4897817.19,7624377.45],[4898645.61,7622454.66],[4902198.11,7623264.84],[4899468.86,7624971.7]]}]},"properties":{"attr_123_": "Hello1"}},{"type":"Feature","geometry":{"type":"GeometryCollection","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"geometries":[{"type":"Point","coordinates":[4897603.92,7623148.2]},{"type":"Point","coordinates":[4898706.41,7623196.37]},{"type":"LineString","coordinates":[[4898240.55,7624142.63],[4898057.83,7621101.13]]},{"type":"Point","coordinates":[4899849.71,7623978.33]},{"type":"Polygon","coordinates":[[[4902095.24,7624145.55],[4903762.69,7622836.54],[4900630.09,7621877.02],[4902095.24,7624145.55]]]}]},"properties":{"attr_123_": "Hello2"}},{"type":"Feature","geometry":{"type":"Point","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"coordinates":[4897285.68,7623388.9]},"properties":{"attr_123_": "Hello3"}},{"type":"Feature","geometry":{"type":"Point","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"coordinates":[4897060.54,7624384.95]},"properties":{"attr_123_": "Hello4"}}]}';
//const geojsonObject = '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::3857"}},"features":[{"type":"Feature","geometry":{"type":"GeometryCollection","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"geometries":[{"type":"Point","coordinates":[4897285.68,7623388.9]},{"type":"Point","coordinates":[4898484.87,7623790.91]},{"type":"LineString","coordinates":[[4897817.19,7624377.45],[4898645.61,7622454.66],[4902198.11,7623264.84],[4899468.86,7624971.7]]}]},"properties":{}},{"type":"Feature","geometry":{"type":"GeometryCollection","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"geometries":[{"type":"Point","coordinates":[4897603.92,7623148.2]},{"type":"Point","coordinates":[4898706.41,7623196.37]},{"type":"LineString","coordinates":[[4898240.55,7624142.63],[4898057.83,7621101.13]]},{"type":"Point","coordinates":[4899849.71,7623978.33]},{"type":"Polygon","coordinates":[[[4902095.24,7624145.55],[4903762.69,7622836.54],[4900630.09,7621877.02],[4902095.24,7624145.55]]]}]},"properties":{}},{"type":"Feature","geometry":{"type":"Point","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"coordinates":[4897285.68,7623388.9]},"properties":{}},{"type":"Feature","geometry":{"type":"Point","crs":{"type":"name","properties":{"name":"EPSG:3857"}},"coordinates":[4897060.54,7624384.95]},"properties":{}}]}';
//const geojsonObject = "{\"type\":\"Point\",\"coordinates\":[43.9930658,56.325005]}";
//const geojsonObject = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"id\":\"nn_ppm.1\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4883416.36233908,7623033.01317983,0],[4883592.52273608,7623076.29189943,0],[4883603.56554573,7623015.22472108,0],[4883631.59365353,7623019.33578747,0],[4883648.86982253,7622916.37839851,0],[4883713.76470575,7622925.73828814,0],[4883711.48140351,7622936.04059907,0],[4883769.69005489,7622945.29115603,0],[4883857.35058643,7622396.22526009,0],[4883701.38010958,7622369.07528601,0],[4883695.10900296,7622400.76049996,0],[4883672.74808283,7622418.37297089,0],[4883520.1338332,7622393.34284616,0],[4883416.36233908,7623033.01317983,0]]]]},\"geometry_name\":\"the_geom\"},{\"type\":\"Feature\",\"id\":\"nn_ppm.2\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4904424.6614267,7622643.48700176,0],[4904495.83544348,7622838.81992919,0],[4904600.60714532,7622817.84732888,0],[4904742.13403634,7622767.97380984,0],[4904861.14009233,7622701.38915199,0],[4904792.89571908,7622639.92946286,0],[4904765.08461762,7622616.27362626,0],[4904742.41665768,7622592.61131067,0],[4904696.05255547,7622545.28813846,0],[4904515.12864499,7622612.47104624,0],[4904424.6614267,7622643.48700176,0]]]]},\"geometry_name\":\"the_geom\"},{\"type\":\"Feature\",\"id\":\"nn_ppm.3\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4872319.58065261,7620179.22453451,0],[4872198.11079358,7620171.51335453,0],[4872182.84813019,7620403.63661241,0],[4873820.11508087,7620519.53262376,0],[4873836.04368895,7620285.57616127,0],[4873347.33818003,7620251.11845523,0],[4873451.76453001,7618883.05343086,0],[4872428.25599576,7618799.91042427,0],[4872338.42539753,7620180.5353512,0],[4872319.58065261,7620179.22453451,0]]]]},\"geometry_name\":\"the_geom\"},{\"type\":\"Feature\",\"id\":\"nn_ppm.4\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4895476.59351521,7611148.24222329,0],[4895419.69173528,7610758.73197173,0],[4895372.51296833,7610765.98239839,0],[4895347.70732588,7610771.60479998,0],[4895320.36329463,7610792.39734349,0],[4895324.79875819,7610829.90928591,0],[4895231.26821211,7610842.80671579,0],[4895278.4372669,7611175.60669906,0],[4895419.86720575,7611155.49128973,0],[4895476.59351521,7611148.24222329,0]]]]},\"geometry_name\":\"the_geom\"},{\"type\":\"Feature\",\"id\":\"nn_ppm.5\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4898620.41546962,7622416.17431791,0],[4898603.43390126,7622281.92711888,0],[4898601.11992013,7622220.51581074,0],[4898646.32714964,7622206.02007513,0],[4898582.68898786,7622136.13515511,0],[4898529.39368382,7622199.53870479,0],[4898522.140268,7622290.28657633,0],[4898520.78703707,7622318.70139895,0],[4898557.33008753,7622325.52535057,0],[4898574.28880046,7622423.57113164,0],[4898620.41546962,7622416.17431791,0]]]]},\"geometry_name\":\"the_geom\"},{\"type\":\"Feature\",\"id\":\"nn_ppm.6\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4895640.44564833,7618427.10528454,0],[4895644.05213326,7618495.51444811,0],[4896114.01824504,7618475.29073084,0],[4896326.21906586,7618466.15726407,0],[4896324.49055428,7618391.94156843,0],[4896113.9530906,7618402.76598482,0],[4895640.44564833,7618427.10528454,0]]]]},\"geometry_name\":\"the_geom\"},{\"type\":\"Feature\",\"id\":\"nn_ppm.7\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4896031.40313302,7619184.47510024,0],[4896188.90160992,7619146.23855928,0],[4896399.30187135,7619099.67125688,0],[4896390.99817573,7618952.70217385,0],[4896260.66938498,7618957.85592217,0],[4896264.29788109,7619078.67047237,0],[4896031.34559726,7619115.42357363,0],[4895709.20686629,7619166.21277279,0],[4895695.26791598,7619070.11773769,0],[4895575.01308685,7619097.75621799,0],[4895605.25401517,7619280.08042005,0],[4895823.82438664,7619243.56684541,0],[4896003.91564567,7619191.14907312,0],[4896031.40313302,7619184.47510024,0]]]]},\"geometry_name\":\"the_geom\"},{\"type\":\"Feature\",\"id\":\"nn_ppm.8\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4900326.00700675,7620250.09161042,0],[4900216.39710909,7620194.49527905,0],[4900119.29442114,7620392.08110011,0],[4900442.84029556,7620559.62129161,0],[4900497.67713373,7620453.3396241,0],[4900281.68041038,7620339.88408876,0],[4900326.00700675,7620250.09161042,0]]]]},\"geometry_name\":\"the_geom\"},{\"type\":\"Feature\",\"id\":\"nn_ppm.9\",\"geometry\":{\"type\":\"MultiPolygon\",\"coordinates\":[[[[4896942.21047131,7624185.28221777,0],[4896912.30925976,7624243.15422137,0],[4896873.25072505,7624318.7487962,0],[4896905.0182482,7624334.38971591,0],[4896925.47107985,7624344.45943463,0],[4897008.42643902,7624385.19378058,0],[4897075.3866766,7624418.37428912,0],[4897117.58820664,7624439.39057211,0],[4897179.53784712,7624284.33057088,0],[4897179.83859198,7624283.57374772,0],[4897166.68484371,7624277.80649165,0],[4897116.06715693,7624255.61227336,0],[4897100.69934285,7624249.37793524,0],[4897016.32015491,7624214.42832053,0],[4897008.9803312,7624212.19787836,0],[4896944.76925212,7624186.31373147,0],[4896942.21047131,7624185.28221777,0]]]]},\"geometry_name\":\"the_geom\"}]}";
//const geojsonObject = "{ 'type': 'FeatureCollection', 'features': [{ 'type': 'Point', 'coordinates': [43.9930658, 56.325005] }] }";
//const geojsonObject = "{ \"type\": \"Point\", \"coordinates\": [43.9930658, 56.325005] }";
//const geojsonObject = JSON.stringify({ 'type': 'FeatureCollection', 'features': [{ 'type': 'Point', 'coordinates': [43.9930658, 56.325005] }] })



/* Create and initialize map */
const optsMap = { 
    base_layer: BaseLayer.OSM,
    declared_coordinate_system_id: 3857,
    center: {
        x: 44.008741, // 4883416.36233908,
        y: 56.319241, // 7623033.01317983,
        declared_coordinate_system_id: 4326 // 3857
    }, 
    zoom: 13
}
const map: Map = MapManager.createMap("map", optsMap);

/* Set center and zoom separately */
MapManager.setZoom(map, 13);
MapManager.setCenter(map, {x: 44.008741, y: 56.319241, declared_coordinate_system_id: 4326});

/* Put a layer consisting of simple features to the map */
const opts1 = {
    /* "properties": {
        "name": "Слой 1"
    }, */
    "srs_handling": {
        "native_coordinate_system_id": 4326,
        "declared_coordinate_system_id": 3857,
        "srs_handling_type": "reproject"
    }, 
    "style": {
        "point": {
            "marker_type":"image",
            //"marker_type":"simple_point",
            "color":"#00ff00",
            "opacity": 100,
            "size": 15,
            "rotation": 90,
            "offset":[1, 5],
            "anchor":["top", "left"],
            "icon_file": {},
            "image_path": "assets/car-icon.png"
            //"image_path": "assets/point.svg"
         },
        "linestring":{},
        "polygon":{}
    }
}
const layer1: LayerInterface = MapManager.createLayerFromGeoJSON(geojsonObject, opts1);
MapManager.setZIndex(layer1, 10);
MapManager.addLayer(map, layer1);

/* Put a layer consisting of remotely received features to the map */
const opts2 = {
    "request": {
        "method": HttpMethod.GET,
        //http://172.24.64.101:8085/mapeditor/geojson/registry/2760
        //"base_url": "http://172.24.64.101:8085/mapeditor/geojson/layer/136",
        "base_url": "layer1.json",
        //"base_url": "http://89.109.52.230:18181/geojson/layer/90",
        //"base_url": "http://172.24.64.93:8181/geojson/layer/90",
        //"base_url": "http://82.208.68.85:8085/geoserver/accent/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=accent%3Alayer_931_&outputFormat=application%2Fjson",
        //"base_url": "http://82.208.68.85:8085/geoserver/accent/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=accent%3Alayer_1686_&outputFormat=application%2Fjson",
        "headers": null,
        "data": {"field":"attr_2763_geom","native_coordinate_system_id":4326,"declared_coordinate_system_id":3857,"srs_handling_type":"reproject","filter":[],"properties":["attr_2762_","attr_2764_"]}
    },
    "load_callback": () => {
        console.log("Layer loaded");
    },
    "style": {
        "point": {
            "marker_type":"image",
            "color":"#000000",
            "opacity":100,
            "size":5,
            "rotation":0,
            "offset":[0,0],
            "anchor":["center","center"],
            "icon_file":{"guid":"37c4c933-532b-4b18-8b0d-329a225203b1","extension":"png"},
            "image_path":"assets/car-icon.png"
        },
        "linestring":{},
        "polygon":{}
    }
}
const layer2: LayerInterface = MapManager.createLayer(SourceType.Vector, opts2);
MapManager.setZIndex(layer2, 10);
MapManager.addLayer(map, layer2);
MapManager.fitLayer(map, layer2);

/* Create an empty layer to draw on */
const opts3 = {
    "srs_handling": {
        "native_coordinate_system_id": 4326,
        "declared_coordinate_system_id": 3857,
        "srs_handling_type": "reproject"
    }, 
    "style": {
        "point": {
           //"marker_type":"image",
           "marker_type":"simple_point",
           "color":"#00ff00",
           "opacity": 100,
           "size": 15,
           "rotation": 90,
           "offset":[1, 5],
           "anchor":["top", "left"],
           "icon_file": {},
           "image_path": "assets/car-icon.png"
           //"image_path": "assets/point.svg"
        },
        "linestring": {
            "color":"#DE0D0D",
            "opacity":100,
            "stroke_width":3,
            "stroke_style": {
                "guid":"78692f92-7354-4321-b8d3-64bb571e7079",
                "pattern":["5","10","15","20","25","30"]
            },
            "arrow":"end"
        },
        "polygon": {
            "color":"#0E38CF",
            "opacity":100,
            "stroke_width":2,
            "stroke_style":{
                "guid":"e3065873-891d-4777-9b1e-148e77418f1f",
                "pattern":["4","6","8","10","12","14","16","18","20","22","24","26","28","30"]
            },
            "background_color":"#FFFFFF",
            "pattern_color":"#000000",
            "pattern_stroke_width":5,
            "pattern_stroke_spacing":10,
            "pattern_stroke_rotation":0,
            "pattern_offset":0,
            "pattern_scale":1
        }
    }
}
const layer3: LayerInterface = MapManager.createLayer(SourceType.Vector, opts3);
MapManager.setZIndex(layer3, 10);
MapManager.addLayer(map, layer3);

const btDrawPoint: HTMLElement = document.getElementById("draw-btn-point");
const btDrawLine: HTMLElement = document.getElementById("draw-btn-line");
const btDrawPolygon: HTMLElement = document.getElementById("draw-btn-polygon");
btDrawPoint.onclick = onDrawClick;
btDrawLine.onclick = onDrawClick;
btDrawPolygon.onclick = onDrawClick;
function onDrawClick(e): any {
    e.target.style.backgroundColor = "#777";
    e.target.style.color = "#fff";
    let geomType: string = "Point";
    switch(e.target.id) {
        case "draw-btn-point": 
            geomType = "Point";
            break;
        case "draw-btn-line": 
            geomType = "LineString";
            break;
        case "draw-btn-polygon": 
            geomType = "Polygon";
            break;
        default:
            geomType = "Point";
    }
    const regime: InteractionType = MapManager.getInteraction(map);
    if (regime == InteractionType.Normal) {
        MapManager.setDrawInteraction(
            map, // map to draw on
            layer3, // layer to draw on
            {
                geometry_type: geomType,
                draw_callback: function(feature: Feature): void {
                    //console.log("Drawn feature: " + (<VectorLayer> accentLayer3).getFeaturesAsFeatureCollection());
                    const fc: FeatureCollection = MapManager.getFeatureCollection(<VectorLayer> layer3);
                    let geometry: string = "";
                    if (fc.isSingle()) {
                        geometry = MapManager.getFeaturesAsSingleGeometry(fc);
                    }
                    if (fc.isMixed()) {
                        geometry = MapManager.getFeaturesAsGeometryCollection(fc);
                    }
                    if (!fc.isSingle() && !fc.isMixed()) {
                        geometry = MapManager.getFeaturesAsMultiGeometry(fc);
                    }
                    console.log(geometry);
                }
            }
        );
    } else {
        e.target.style.backgroundColor = "initial";
        e.target.style.color = "initial";
        MapManager.setNormalInteraction(map);
    }
};

const btPin: HTMLElement = document.getElementById("pin-btn");
btPin.onclick = function(e: any): any {
    e.target.style.backgroundColor = "#777";
    e.target.style.color = "#fff";
    const regime: InteractionType = MapManager.getInteraction(map);
    if (regime == InteractionType.Normal) {
        MapManager.setSelectionInteraction(map, {
            "selection_type": "pin",
            "select_callback": (features: FeatureCollection) => {
                console.log(features);
            }
        })
    } else {
        e.target.style.backgroundColor = "initial";
        e.target.style.color = "initial";
        MapManager.setNormalInteraction(map);
    }
}

/* XYZ layer */
/* const opts4 = {
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
}
const layer4: LayerInterface = MapManager.createLayer(SourceType.XYZ, opts4);
console.log(layer4.getType());
MapManager.addLayer(accentMap, layer4);
MapManager.setActiveLayer(accentMap, layer4);
const activeLayer: LayerInterface = MapManager.getActiveLayer(accentMap);
MapManager.setZIndex(activeLayer, 5);
MapManager.setOpacity(activeLayer, 70); */



/* TileArcGISRest layer */
/* const opts5 = {
    url: "https://pkk.rosreestr.ru/arcgis/rest/services/PKK6/ZONES/MapServer/export?layers=show%3A5&dpi=96&transparent=true&format=png32&bboxSR=102100&imageSR=102100&f=image&ID1=Rosreestr_TerriroryZones&Name1=Территориальные%20зоны&Projection=EPSG:3857"
}
const layer5: LayerInterface = MapManager.createLayer(SourceType.TileArcGISRest, opts5);
MapManager.addLayer(accentMap, layer5);
console.log(layer5.getType()); */


/* Patterns example */
/* const dfp = Pattern.getDefaultFillPatterns();
console.log(dfp);
const ep = Pattern.getPatternDataURI("empty", "#ff0000");
console.log(ep); */

    

