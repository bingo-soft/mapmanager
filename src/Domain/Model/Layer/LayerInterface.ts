import OlLayer from "ol/layer/Layer"
import SourceType from "../Source/SourceType"
import LayerType from "./LayerType"
import SourceInterface from "../Source/SourceInterface"

export default interface LayerInterface
{
    getLayer(): OlLayer;

    getType(): SourceType;

    getSource(): SourceInterface;

    setSource(source: SourceInterface): void;

    setLoader(loader: () => Promise<string>, opts?: unknown): void;

    setUrl(url: string): void;

    setZIndex(index: number): void;

    setOpacity(opacity: number): void;

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    setStyle(style): void;
}