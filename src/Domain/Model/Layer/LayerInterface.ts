import OlLayer from "ol/layer/Layer"
import LayerType from "./LayerType"
import SourceInterface from "../Source/SourceInterface"

export default interface LayerInterface
{
    getLayer(): OlLayer;

    getType(): LayerType;

    getSource(): SourceInterface;

    setSource(source: SourceInterface): void;

    setLoader(loader: () => Promise<string>, opts?: unknown): void;

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    setStyle(style): void;
}