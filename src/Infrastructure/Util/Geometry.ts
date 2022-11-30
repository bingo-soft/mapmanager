/** Geometry */
export default class Geometry { 
    /**
     * Flattens geometry from GeometryCollection to FeatureCollection
     * @param features - features to flatten
     * @return flattened features
     */
    public static flattenGeometry(features: string): string {
        const objFeatures: unknown = JSON.parse(features);
        if (objFeatures["type"] !== "undefined" && objFeatures["type"] == "GeometryCollection") {
            const featureCollection: unknown = { type: "FeatureCollection", features: [] };
            objFeatures["geometries"].forEach((el: unknown): void => {
                featureCollection["features"].push({ "type": "Feature", "geometry": el });
            });
            return JSON.stringify(featureCollection);
        }
        return features;
    }

    /**
     * Converts points given in text to array
     * @param text - points given in text
     * @param swapCoordinates - whether to swap coordinates, defaults to false
     * @return array of points
     */
    public static textPointsToArray(text: string, swapCoordinates: boolean = false): number[][] {
        text = text.replace(/^\s+|\s+$/g, '');
        const pointsTmp = text.split("\n");
        const points = [];
        pointsTmp.forEach((item: string, idx: number, array: string[]) => {
            item = item.replace(/^\s+|\s+$/g, '');
            if (item == "") {
                if (idx != 0 && idx != array.length-1) {
                    points.push([]);
                }
            } else {
                let xy = item.split(" ");
                xy = xy.filter(word => word != " " && word != "");
                const xyNumeric = []
                xyNumeric[0] = parseFloat(xy[0].replace(/^\s+|\s+$/g, ''));
                xyNumeric[1] = parseFloat(xy[1].replace(/^\s+|\s+$/g, ''));
                if (swapCoordinates) {
                    points.push([xyNumeric[1], xyNumeric[0]]);
                } else {
                    points.push([xyNumeric[0], xyNumeric[1]]);   
                }
            }
        });
        return points;
    }

    /**
     * Converts points given in text to array
     * @param points - array of points
     * @param swapCoordinates - whether to swap coordinates, defaults to false
     * @return points given in text
     */
    public static arrayToTextPoints(points: number[][], swapCoordinates: boolean = false): string {
        let ret = '';
        points.forEach((point: number[], index: number, arr: number[][]) => {
            if (point.length) {
                if (swapCoordinates) {
                    [point[0], point[1]] = [point[1], point[0]];
                }
                ret += point.join(" ");
            }
            if (index != arr.length-1) {
                ret += "\n";
            }
        });
        return ret;
    }
}