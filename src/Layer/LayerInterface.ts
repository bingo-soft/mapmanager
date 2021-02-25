import OlLayer from "ol/layer/Layer"
import LayerType from "./LayerType"
import SourceInterface from "../Source/SourceInterface"

export default interface LayerInterface
{
    getLayer(): OlLayer;

    getType(): LayerType;

    setSource(source: SourceInterface): void;

    setUrl(baseUrl: string, params?: string[][]): void;

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    setStyle(style): void;

    addFeatures(features: ArrayBuffer|Document|Element|Object|string): void;
}