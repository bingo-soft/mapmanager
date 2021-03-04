import OlLayer from "ol/layer/Layer";
import LayerInterface from "./LayerInterface"
import LayerType from "./LayerType"
import SourceInterface from "../Source/SourceInterface"
//import { ProjectionOptions } from "../Source/ProjectionOptions"
import MethodNotImplemented from "../../Exception/MethodNotImplemented"

export default abstract class BaseLayer implements LayerInterface
{
    protected layer: OlLayer;

    getLayer(): OlLayer {
        return this.layer;
    }

    public abstract getType(): LayerType;

    public abstract setSource(source: SourceInterface): void;    

    public setLoader(loader: () => Promise<string>, opts?: unknown): void {
        console.log(loader);
        console.log(opts);
        throw new MethodNotImplemented();
    }

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - style
     */
    public setStyle(style: unknown): void { 
        console.log(style);
        throw new MethodNotImplemented();
    }

}