import {Circle as OlCircleStyle, Fill as OlFill, Stroke as OlStroke, Style as OlStyle} from "ol/style";
import OlGeometryType from "ol/geom/GeometryType";
import { StyleType as OlStyleType } from "../StyleType";

export const DefaultStyle: OlStyleType = {
    [OlGeometryType.POINT]: new OlStyle({
        image: new OlCircleStyle({
            radius: 5,
            fill: new OlFill({color: "green"}),
            stroke: new OlStroke({color: "green", width: 1}),
        }),
    }),
    [OlGeometryType.MULTI_POINT]: null/* new OlStyle({
        image: new OlCircleStyle({
            radius: 5,
            fill: null,
            stroke: new OlStroke({color: "red", width: 1}),
        }),
    }) */,
    [OlGeometryType.LINE_STRING]: new OlStyle({
        stroke: new OlStroke({
            color: "green",
            width: 2,
        }),
    }),
    [OlGeometryType.MULTI_LINE_STRING]: null /* new OlStyle({
        stroke: new OlStroke({
            color: "green",
            width: 1,
        }),
    }) */,
    [OlGeometryType.POLYGON]: new OlStyle({
        stroke: new OlStroke({
            color: "blue",
            //lineDash: [4],
            width: 1,
        }),
        fill: new OlFill({
            color: "rgba(255, 255, 0, 0.3)",
        }),
    }),
    [OlGeometryType.MULTI_POLYGON]: null /* new OlStyle({
        stroke: new OlStroke({
            color: "yellow",
            width: 1,
        }),
        fill: new OlFill({
            color: "rgba(0, 0, 255, 0.3)",
        }),
    }) */,
    [OlGeometryType.CIRCLE]: new OlStyle({
        stroke: new OlStroke({
            color: "red",
            width: 2,
        }),
        fill: new OlFill({
            color: "rgba(255,0,0,0.2)",
        }),
    }),
    [OlGeometryType.GEOMETRY_COLLECTION]: new OlStyle({
        stroke: new OlStroke({
            color: "magenta",
            width: 2,
        }),
        fill: new OlFill({
            color: "magenta",
        }),
        image: new OlCircleStyle({
            radius: 10,
            fill: null,
            stroke: new OlStroke({
                color: "magenta",
            }),
        }),
    }),
}