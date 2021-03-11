import OlLayer from "ol/layer/Layer";
import LayerInterface from "./LayerInterface"
import SourceType from "../Source/SourceType"
import LayerType from "./LayerType"
import SourceInterface from "../Source/SourceInterface"
import MethodNotImplemented from "../../Exception/MethodNotImplemented"

export default abstract class BaseLayer implements LayerInterface
{
    protected layer: OlLayer;

    getLayer(): OlLayer {
        return this.layer;
    }

    public abstract getType(): SourceType;

    public abstract getSource(): SourceInterface;

    public abstract setSource(source: SourceInterface): void;    

    public setLoader(loader: () => Promise<string>, opts?: unknown): void {
        console.log(loader);
        console.log(opts);
        throw new MethodNotImplemented();
    }

    public setUrl(url: string): void {
        console.log(url);
        throw new MethodNotImplemented();
    }

    public setZIndex(index: number): void {
        this.layer.setZIndex(index);
    }

    public setOpacity(opacity: number): void { 
        this.layer.setOpacity(opacity);
    }

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - style
     */
    public setStyle(style: unknown): void { 
        console.log(style);
        throw new MethodNotImplemented();
    }

}