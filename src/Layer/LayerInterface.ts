import OlLayer from "ol/layer/Layer"
import LayerType from "./LayerType"
import SourceInterface from "../Source/SourceInterface"
import { ApiRequest } from '../Util/Http/ApiRequest'

export default interface LayerInterface
{
    getLayer(): OlLayer;

    getType(): LayerType;

    setSource(source: SourceInterface): void;

    setRequest(request: ApiRequest): void;

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - Style
     */
    setStyle(style): void;
}