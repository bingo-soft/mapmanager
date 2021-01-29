import * as Coordinate from "ol/coordinate";

/**
* The MapState type. Describes center and zoom of the map.
*/
export type MapState = {
    center: Coordinate.Coordinate;
    zoom: number;
};
