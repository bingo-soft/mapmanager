import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source"
import LayerInterface from "./LayerInterface"
import SourceType from "../Source/SourceType"
import SourceInterface from "../Source/SourceInterface"
import { StyleType } from "../Style/StyleType"
import MethodNotImplemented from "../../Exception/MethodNotImplemented"

export default abstract class BaseLayer implements LayerInterface
{
    protected layer: OlLayer;
    protected srs: string;

    public getLayer(): OlLayer {
        return this.layer;
    }

    public abstract getType(): SourceType;

    public setType(type: SourceType): void {
        console.log(type);
        throw new MethodNotImplemented();
    }

    public getSRS(): string {
        return this.srs;
    }

    public abstract getSource(): OlSource;

    public abstract setSource(source: SourceInterface): void;    

    public setLoader(loader: () => Promise<string>/* , opts?: unknown */): void {
        console.log(loader);
        //console.log(opts);
        throw new MethodNotImplemented();
    }

    public setUrl(url: string): void {
        console.log(url);
        throw new MethodNotImplemented();
    }

    public setZIndex(zIndex: number): void {
        this.layer.setZIndex(zIndex);
    }

    public setOpacity(opacity: number): void { 
        this.layer.setOpacity(opacity / 100);
    }

    /**
     * @param {Object<import("ol/geom/GeometryType.js").default, Array<Style>>} style - style
     */
    public setStyle(style: StyleType): void { 
        console.log(style);
        throw new MethodNotImplemented();
    }

}