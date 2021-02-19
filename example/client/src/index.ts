import MapManager from "map-component-accent2";
import AccentMap from "../../../src/map";
import LayerType from "../../../src/layer-type"
import AccentLayer from "../../../src/layer";
import AccentStyle from "../../../src/style";
import Regime from "../../../src/regime"

const geojsonObject = {"type":"FeatureCollection","features":[{"type":"Feature","id":"nn_ppm.1","geometry":{"type":"MultiPolygon","coordinates":[[[[4883416.36233908,7623033.01317983,0],[4883592.52273608,7623076.29189943,0],[4883603.56554573,7623015.22472108,0],[4883631.59365353,7623019.33578747,0],[4883648.86982253,7622916.37839851,0],[4883713.76470575,7622925.73828814,0],[4883711.48140351,7622936.04059907,0],[4883769.69005489,7622945.29115603,0],[4883857.35058643,7622396.22526009,0],[4883701.38010958,7622369.07528601,0],[4883695.10900296,7622400.76049996,0],[4883672.74808283,7622418.37297089,0],[4883520.1338332,7622393.34284616,0],[4883416.36233908,7623033.01317983,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.100000841","NAME_OBJ":"Документация по внесению изменений в проект планировки и межевания территории в границах улиц Героя Давыдова, Лубянская, Шота Руставелли","ZAKAZ":"ООО \"Нижегородгражданстрой\"","NOMER":"","DATA_DOC":"","INFO_DOC":""}},{"type":"Feature","id":"nn_ppm.2","geometry":{"type":"MultiPolygon","coordinates":[[[[4904424.6614267,7622643.48700176,0],[4904495.83544348,7622838.81992919,0],[4904600.60714532,7622817.84732888,0],[4904742.13403634,7622767.97380984,0],[4904861.14009233,7622701.38915199,0],[4904792.89571908,7622639.92946286,0],[4904765.08461762,7622616.27362626,0],[4904742.41665768,7622592.61131067,0],[4904696.05255547,7622545.28813846,0],[4904515.12864499,7622612.47104624,0],[4904424.6614267,7622643.48700176,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.16803","NAME_OBJ":"Документация по внесению изменений в проект планировки и межевания территории в границах улиц Родионова»,Казанский съезд, Лысогорская, в�","ZAKAZ":"ИЖС","NOMER":"","DATA_DOC":"","INFO_DOC":"1334 от 05.04.2017"}},{"type":"Feature","id":"nn_ppm.3","geometry":{"type":"MultiPolygon","coordinates":[[[[4872319.58065261,7620179.22453451,0],[4872198.11079358,7620171.51335453,0],[4872182.84813019,7620403.63661241,0],[4873820.11508087,7620519.53262376,0],[4873836.04368895,7620285.57616127,0],[4873347.33818003,7620251.11845523,0],[4873451.76453001,7618883.05343086,0],[4872428.25599576,7618799.91042427,0],[4872338.42539753,7620180.5353512,0],[4872319.58065261,7620179.22453451,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.19481","NAME_OBJ":"Документация по планировке территории (проект планировки территории), расположенной по Московскому шоссе, 2000 м на запад от улицы Теплична�","ZAKAZ":"ЗАО \"Интраст НН\"","NOMER":"","DATA_DOC":"","INFO_DOC":"3427 от 20.07.2017"}},{"type":"Feature","id":"nn_ppm.4","geometry":{"type":"MultiPolygon","coordinates":[[[[4895476.59351521,7611148.24222329,0],[4895419.69173528,7610758.73197173,0],[4895372.51296833,7610765.98239839,0],[4895347.70732588,7610771.60479998,0],[4895320.36329463,7610792.39734349,0],[4895324.79875819,7610829.90928591,0],[4895231.26821211,7610842.80671579,0],[4895278.4372669,7611175.60669906,0],[4895419.86720575,7611155.49128973,0],[4895476.59351521,7611148.24222329,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.19623","NAME_OBJ":"Документация по внесению изменений в документацию по планировке территории (проект застройки и межевания территории) юго-западной части �","ZAKAZ":"ООО \"СтройКА\"","NOMER":"","DATA_DOC":"","INFO_DOC":""}},{"type":"Feature","id":"nn_ppm.5","geometry":{"type":"MultiPolygon","coordinates":[[[[4898620.41546962,7622416.17431791,0],[4898603.43390126,7622281.92711888,0],[4898601.11992013,7622220.51581074,0],[4898646.32714964,7622206.02007513,0],[4898582.68898786,7622136.13515511,0],[4898529.39368382,7622199.53870479,0],[4898522.140268,7622290.28657633,0],[4898520.78703707,7622318.70139895,0],[4898557.33008753,7622325.52535057,0],[4898574.28880046,7622423.57113164,0],[4898620.41546962,7622416.17431791,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.19741","NAME_OBJ":"Документация по планировке территории в районе домов 24А, 24Б, 24В по ул. Алексеевская в Нижегородском районе города Нижнего Новгорода","ZAKAZ":"ОАО \"Теплоэнерго\"","NOMER":"","DATA_DOC":"","INFO_DOC":""}},{"type":"Feature","id":"nn_ppm.6","geometry":{"type":"MultiPolygon","coordinates":[[[[4895640.44564833,7618427.10528454,0],[4895644.05213326,7618495.51444811,0],[4896114.01824504,7618475.29073084,0],[4896326.21906586,7618466.15726407,0],[4896324.49055428,7618391.94156843,0],[4896113.9530906,7618402.76598482,0],[4895640.44564833,7618427.10528454,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.20584","NAME_OBJ":"Документация по планировке территории по пр.Гагарина, ул.Студенческая в Советском районе","ZAKAZ":"ООО \"Объектстрой\"","NOMER":"","DATA_DOC":"","INFO_DOC":"3739 от 11.08.2017"}},{"type":"Feature","id":"nn_ppm.7","geometry":{"type":"MultiPolygon","coordinates":[[[[4896031.40313302,7619184.47510024,0],[4896188.90160992,7619146.23855928,0],[4896399.30187135,7619099.67125688,0],[4896390.99817573,7618952.70217385,0],[4896260.66938498,7618957.85592217,0],[4896264.29788109,7619078.67047237,0],[4896031.34559726,7619115.42357363,0],[4895709.20686629,7619166.21277279,0],[4895695.26791598,7619070.11773769,0],[4895575.01308685,7619097.75621799,0],[4895605.25401517,7619280.08042005,0],[4895823.82438664,7619243.56684541,0],[4896003.91564567,7619191.14907312,0],[4896031.40313302,7619184.47510024,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.20581","NAME_OBJ":"Документация по планировке территории по пр.Гагарина, ул.Студенческая в Советском районе","ZAKAZ":"ООО \"Объектстрой\"","NOMER":"","DATA_DOC":"","INFO_DOC":"3739 от 11.08.2017"}},{"type":"Feature","id":"nn_ppm.8","geometry":{"type":"MultiPolygon","coordinates":[[[[4900326.00700675,7620250.09161042,0],[4900216.39710909,7620194.49527905,0],[4900119.29442114,7620392.08110011,0],[4900442.84029556,7620559.62129161,0],[4900497.67713373,7620453.3396241,0],[4900281.68041038,7620339.88408876,0],[4900326.00700675,7620250.09161042,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.16844","NAME_OBJ":"Проект планировки и межевания территории, расположенной в районе д. 18 по улице Ванеева и д. 88к1 по улице Ошарская в Советском районе","ZAKAZ":"ОАО \"Теплоэнерго\"","NOMER":"","DATA_DOC":"","INFO_DOC":"6349 от 27.12.2017"}},{"type":"Feature","id":"nn_ppm.9","geometry":{"type":"MultiPolygon","coordinates":[[[[4896942.21047131,7624185.28221777,0],[4896912.30925976,7624243.15422137,0],[4896873.25072505,7624318.7487962,0],[4896905.0182482,7624334.38971591,0],[4896925.47107985,7624344.45943463,0],[4897008.42643902,7624385.19378058,0],[4897075.3866766,7624418.37428912,0],[4897117.58820664,7624439.39057211,0],[4897179.53784712,7624284.33057088,0],[4897179.83859198,7624283.57374772,0],[4897166.68484371,7624277.80649165,0],[4897116.06715693,7624255.61227336,0],[4897100.69934285,7624249.37793524,0],[4897016.32015491,7624214.42832053,0],[4897008.9803312,7624212.19787836,0],[4896944.76925212,7624186.31373147,0],[4896942.21047131,7624185.28221777,0]]]]},"geometry_name":"the_geom","properties":{"id":"V_PORTAL_PPM.19302","NAME_OBJ":"Документация по внесению изменений в проект межевания территории в границах пл.Благовещенская,Нижневолжская наб., ул.Кожевенная, ул. Рожд�","ZAKAZ":"ИЖС","NOMER":"","DATA_DOC":"","INFO_DOC":""}}]};

const accentMap: AccentMap = MapManager.createMap("map");
MapManager.setZoom(accentMap, 14);
MapManager.setCenter(accentMap, 44.008741, 56.319241, "EPSG:4326");

MapManager.createLayerFromFeatures(accentMap, geojsonObject);

const accentLayer: AccentLayer = MapManager.createLayer(accentMap, LayerType.Vector);
//accentLayer.addFeatures(geojsonObject);
MapManager.addLayer(accentMap, accentLayer);

const btDraw: HTMLElement = document.getElementById("draw-btn");
btDraw.onclick = function() {
    btDraw.style.backgroundColor = "#bbb";
    const regime: Regime = MapManager.getRegime(accentMap);
    if (regime == Regime.None) {
        MapManager.setDrawRegime(
            accentMap,
            accentLayer,
            "LineString"/* , 
            function(geoJSON: string) {
            } */
        );
    } else {
        btDraw.style.backgroundColor = "#eee";
        MapManager.setNormalRegime(accentMap);
        const json: string = MapManager.getFeaturesAsGeoJSON(accentLayer);
        console.log(json);
    }
};

const dfp = AccentStyle.getDefaultFillPatterns();
console.log(dfp);
const ep = AccentStyle.getPatternDataURI("empty", "#ff0000");
console.log(ep);



/* mm.setZoom(14);
mm.setCenter(44.008741, 56.319241, "EPSG:4326");
res = mm.addLayer(geojsonObject);
if (res) {
    console.log("Layer has been added to map.");
} else {
    console.log("Failure adding layer.");
}
//mm.drawFeature("Point");
//mm.drawFeature("MultiLineString");
//mm.drawFeature("MultiPolygon");
//mm.drawFeature("Circle");

const dfp = AccentStyle.getDefaultFillPatterns();
console.log(dfp);
const ep = MapManager.getPatternDataURI("empty", "#ff0000");
console.log(ep); */
    

