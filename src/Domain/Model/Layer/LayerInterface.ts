import OlLayer from "ol/layer/Layer"
import { Source as OlSource } from "ol/source"
import SourceType from "../Source/SourceType"
import SourceInterface from "../Source/SourceInterface"
import { StyleType } from "../Style/StyleType"

export default interface LayerInterface
{
    getLayer(): OlLayer;

    getType(): SourceType;

    setType(type: SourceType): void;

    getSource(): OlSource;

    setSource(source: SourceInterface): void;

    setLoader(loader: () => Promise<string>, opts?: unknown): void;

    setUrl(url: string): void;

    setZIndex(zIndex: number): void;

    setOpacity(opacity: number): void;

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    setStyle(style: StyleType): void;
}