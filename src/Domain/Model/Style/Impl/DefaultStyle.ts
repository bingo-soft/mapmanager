import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style";
import GeometryType from 'ol/geom/GeometryType'

export const DefaultStyle = {
    [GeometryType.POINT]: new Style({
        image: new CircleStyle({
            radius: 5,
            fill: new Fill({color: "red"}),
            stroke: new Stroke({color: "red", width: 1}),
        }),
    }),
    [GeometryType.LINE_STRING]: new Style({
        stroke: new Stroke({
            color: "green",
            width: 2,
        }),
    }),
    [GeometryType.MULTI_LINE_STRING]: new Style({
        stroke: new Stroke({
            color: "green",
            width: 1,
        }),
    }),
    [GeometryType.MULTI_POINT]: new Style({
        image: new CircleStyle({
            radius: 5,
            fill: null,
            stroke: new Stroke({color: "red", width: 1}),
        }),
    }),
    [GeometryType.MULTI_POLYGON]: new Style({
        stroke: new Stroke({
            color: "yellow",
            width: 1,
        }),
        fill: new Fill({
            color: "rgba(0, 0, 255, 0.3)",
        }),
    }),
    [GeometryType.POLYGON]: new Style({
        stroke: new Stroke({
            color: "blue",
            lineDash: [4],
            width: 3,
        }),
        fill: new Fill({
            color: "rgba(255, 255, 0, 0.3)",
        }),
    }),
    [GeometryType.GEOMETRY_COLLECTION]: new Style({
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
    [GeometryType.CIRCLE]: new Style({
        stroke: new Stroke({
            color: "red",
            width: 2,
        }),
        fill: new Fill({
            color: "rgba(255,0,0,0.2)",
        }),
    })
}