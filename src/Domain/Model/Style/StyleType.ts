import { Style as OlStyle } from "ol/style";
export type StyleType = {
    "Point": OlStyle,
    "MultiPoint": OlStyle,
    "LineString": OlStyle,
    "MultiLineString": OlStyle,
    "Polygon": OlStyle,
    "MultiPolygon": OlStyle,
    "Circle": OlStyle,
    "GeometryCollection": OlStyle
}