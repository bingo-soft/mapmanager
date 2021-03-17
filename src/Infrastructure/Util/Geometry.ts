/** @class Geometry */
export default class Geometry { 
    /**
     * Flattens geometry from GeometryCollection to FeatureCollection
     *
     * @function flattenGeometry
     * @memberof Geometry
     * @static
     * @param {String} features - features to flatten
     * @return {String} flattened features
     */
    public static flattenGeometry(features: string): string {
        const objFeatures: unknown = JSON.parse(features);  
        if (objFeatures["type"] !== "undefined" && objFeatures["type"] == "GeometryCollection") {
            const featureCollection: unknown = { type: "FeatureCollection", features: [] };
            const geometries: unknown[] = objFeatures["geometries"];
            geometries.forEach(el => {
                featureCollection["features"].push({ "type": "Feature", "geometry": el });
            });
            return JSON.stringify(featureCollection);
        }
        return features;
    }
}