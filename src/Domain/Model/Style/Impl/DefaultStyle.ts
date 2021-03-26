import {Circle as OlCircleStyle, Fill as OlFill, Stroke as OlStroke, Text as OlTextStyle, Style as OlStyle} from "ol/style";
//import OlGeometryType from "ol/geom/GeometryType";
import { StyleType } from "../StyleType";

export const DefaultStyle: StyleType = {
    ["Point"]: new OlStyle({
        image: new OlCircleStyle({
            radius: 5,
            fill: new OlFill({color: "green"}),
            stroke: new OlStroke({color: "green", width: 1}),
        }),
    }),
    ["MultiPoint"]: null/* new OlStyle({
        image: new OlCircleStyle({
            radius: 5,
            fill: null,
            stroke: new OlStroke({color: "red", width: 1}),
        }),
    }) */,
    ["LineString"]: new OlStyle({
        stroke: new OlStroke({
            color: "green",
            width: 2,
        }),
    }),
    ["MultiLineString"]: null /* new OlStyle({
        stroke: new OlStroke({
            color: "green",
            width: 1,
        }),
    }) */,
    ["Polygon"]: new OlStyle({
        stroke: new OlStroke({
            color: "blue",
            //lineDash: [4],
            width: 1,
        }),
        fill: new OlFill({
            color: "rgba(255, 255, 0, 0.3)",
        }),
    }),
    ["MultiPolygon"]: null, /* new OlStyle({
        stroke: new OlStroke({
            color: "yellow",
            width: 1,
        }),
        fill: new OlFill({
            color: "rgba(0, 0, 255, 0.3)",
        }),
    }),
    [OlGeometryType.CIRCLE]: null new OlStyle({
        stroke: new OlStroke({
            color: "red",
            width: 2,
        }),
        fill: new OlFill({
            color: "rgba(255,0,0,0.2)",
        }),
    }), */
    ["GeometryCollection"]: new OlStyle({
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
    ["Text"]: new OlTextStyle({
        stroke: new OlStroke({
            color: "rgba(255, 255, 255, 0)",
            width: 1
        }),
        fill: new OlFill({
            color: "rgb(0, 0, 0)",
        }),
        font: "10px Arial"
    })


}