import OlLayer from "ol/layer/Layer";
import LayerInterface from "./LayerInterface"
import LayerType from "./LayerType"
import SourceInterface from "../Source/SourceInterface"
import MethodNotImplemented from "../Exception/MethodNotImplemented"
import { ApiRequest } from '../Util/Http/ApiRequest'

export default abstract class BaseLayer implements LayerInterface
{
    protected layer: OlLayer;

    getLayer(): OlLayer {
        return this.layer;
    }

    public abstract getType(): LayerType;

    public abstract setSource(source: SourceInterface): void;    

    public setRequest(request: ApiRequest): void {
        throw new MethodNotImplemented();
    }

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - style
     */
    public setStyle(style): void {
        throw new MethodNotImplemented();
    }

}