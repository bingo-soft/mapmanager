import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style";

export const mapCenterX = 4896686.91;
export const mapCenterY = 7621767.9;
export const mapZoom = 13;

export const geomStyles = {
    "point": new Style({
        image: new CircleStyle({
            radius: 5,
            fill: new Fill({color: "red"}),
            stroke: new Stroke({color: "red", width: 1}),
        }),
    }),
    "linestring": new Style({
        stroke: new Stroke({
            color: "green",
            width: 2,
        }),
    }),
    "multilinestring": new Style({
        stroke: new Stroke({
            color: "green",
            width: 1,
        }),
    }),
    "multipoint": new Style({
        image: new CircleStyle({
            radius: 5,
            fill: null,
            stroke: new Stroke({color: "red", width: 1}),
        }),
    }),
    "multipolygon": new Style({
        stroke: new Stroke({
            color: "yellow",
            width: 1,
        }),
        fill: new Fill({
            color: "rgba(0, 0, 255, 0.3)",
        }),
    }),
    "polygon": new Style({
        stroke: new Stroke({
            color: "blue",
            lineDash: [4],
            width: 3,
        }),
        fill: new Fill({
            color: "rgba(255, 255, 0, 0.3)",
        }),
    }),
    "geometrycollection": new Style({
        stroke: new Stroke({
            color: "magenta",
            width: 2,
        }),
        fill: new Fill({
            color: "magenta",
        }),
        image: new CircleStyle({
            radius: 10,
            fill: null,
            stroke: new Stroke({
                color: "magenta",
            }),
        }),
    }),
    "circle": new Style({
        stroke: new Stroke({
            color: "red",
            width: 2,
        }),
        fill: new Fill({
            color: "rgba(255,0,0,0.2)",
        }),
    }),
  };




