import { Style as OlStyle, Text as OlTextStyle } from "ol/style";
export type StyleType = {
    "Point": OlStyle,
    "MultiPoint": OlStyle,
    "LineString": OlStyle,
    "MultiLineString": OlStyle,
    "Polygon": OlStyle,
    "MultiPolygon": OlStyle,
    //"Circle": OlStyle,
    "GeometryCollection": OlStyle,
    "Text": OlTextStyle
    /* {
        "Point": OlStyle,
        "MultiPoint": OlStyle,
        "LineString": OlStyle,
        "MultiLineString": OlStyle,
        "Polygon": OlStyle,
        "MultiPolygon": OlStyle,
        "Circle": OlStyle
    } */
}