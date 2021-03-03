import OlLayer from "ol/layer/Layer"
import LayerType from "./LayerType"
import SourceInterface from "../Source/SourceInterface"

export default interface LayerInterface
{
    getLayer(): OlLayer;

    getType(): LayerType;

    setSource(source: SourceInterface): void;

    setLoader(loader: Function): void;

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    setStyle(style): void;
}