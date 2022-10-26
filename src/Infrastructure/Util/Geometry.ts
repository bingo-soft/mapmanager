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
     * Converts pints given in text to array
     * @param text - features to convert
     * @return array of points
     */
     public static textPointsToArray(text: string): number[][] {
        text = text.replace(/^\s+|\s+$/g, '');
        const pointsTmp = text.split("\n");
        const points = [];
        pointsTmp.forEach((item, idx, array) => {
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
                points.push([xyNumeric[0], xyNumeric[1]]);
            }
        });
        return points;
    }

}