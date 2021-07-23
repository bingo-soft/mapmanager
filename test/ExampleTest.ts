/**
 * @jest-environment jsdom
 */

import MapManager from "../src/MapManager";
import Map from "../src/Domain/Model/Map/Map";
import BaseLayer from "../src/Domain/Model/Map/BaseLayer";

test("Map created", () => {
    window.URL.createObjectURL = function() {};
    
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
    expect(typeof map !== "undefined" && map !== null).toBeTruthy();
})
