# MapManager

MapManager is a JavaScript and TypeScript library, which simplifies usage of OpenLayers in GIS projects

## Dependencies

MapManager depends on [OpenLayers](https://github.com/openlayers/openlayers) and [ol-ext](https://viglino.github.io/ol-ext) libraries

## Examples

### Basic map creation, OSM is used as a base layer

index.html

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title></title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <div id="map"></div>
        <script src="index.ts"></script>
    </body>
</html>
```

style.css

```css
body, html {
    margin: 0;
    padding: 0;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 12px;
    height: 100%;
    min-height: 100%;
    width: 100%;
    background-color: #f9f9f9;
}

#map {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #eee;
    z-index: 1;
}
```

index.ts

```js
import MapManager from "../../src/MapManager";
import Map from "../../src/Domain/Model/Map/Map";
import BaseLayer from "../../src/Domain/Model/Map/BaseLayer";

/* Create and initialize map */
const optsMap = { 
    base_layer: BaseLayer.OSM,
    declared_coordinate_system_id: 3857,
    center: {
        x: 44.008741,
        y: 56.319241,
        declared_coordinate_system_id: 4326
    }, 
    zoom: 13
}
const map: Map = MapManager.createMap("map", optsMap);
```

Explore [examples](examples/) to learn how to use the library
