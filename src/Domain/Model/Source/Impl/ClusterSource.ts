import { Cluster as OlClusterSource, Vector as OlVectorSource } from "ol/source";
import OlFeature from "ol/Feature";
import { getCenter, Extent as OlExtent } from "ol/extent";
import {Point as OlPoint, MultiPoint as OlMultiPoint, LineString as OlLineString, MultiLineString as OlMultiLineString, 
    Polygon as OlPolygon, MultiPolygon as OlMultiPolygon/* , GeometryCollection as OlGeometryCollection */} from "ol/geom"

import BaseSource from "../BaseSource";
import SourceType from "../SourceType";
import VectorSource from "./VectorSource";

/** ClusterSource */
export default class ClusterSource extends BaseSource {
    
    constructor(distance?: number) {
        super();
        const vectorSource = new VectorSource();
        this.source = new OlClusterSource({
            distance: distance || 20,
            //minDistance: 10,
            source: <OlVectorSource> vectorSource.getSource(),
            geometryFunction: function(feature: OlFeature): OlPoint {
                const geometry = feature.getGeometry();
                if (geometry instanceof OlPoint) {
                    return <OlPoint> geometry;
                } else if (geometry instanceof OlMultiPoint) {
                    return (<OlMultiPoint> geometry).getPoint(0);
                } else if (geometry instanceof OlLineString) {
                    return new OlPoint((<OlLineString> geometry).getCoordinateAt(0.5));
                } else if (geometry instanceof OlMultiLineString) {
                    return new OlPoint((<OlMultiLineString> geometry).getLineString(0).getCoordinateAt(0.5));
                } else if (geometry instanceof OlPolygon) {
                    return (<OlPolygon> geometry).getInteriorPoint();
                } else if (geometry instanceof OlMultiPolygon) {
                    return (<OlMultiPolygon> geometry).getInteriorPoints().getPoint(0);
                } else {
                    return new OlPoint(getCenter(feature.getGeometry().getExtent()));
                }
                /* if (geometry instanceof OlPoint) {
                    return <OlPoint> geometry;
                }
                return null; */
            }
        });
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public getType(): SourceType {
        return SourceType.Cluster;
    }

    /**
     * Returns extent of source
     * @return {Array} extent of source
     */
    public getExtent(): OlExtent {
        return (<OlClusterSource> this.source).getExtent();
    }

}