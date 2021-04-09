import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source";
import OlFeature from "ol/Feature";
import { Style as OlStyle } from "ol/style";
import LayerInterface from "./LayerInterface";
import SourceType from "../Source/SourceType";
import SourceInterface from "../Source/SourceInterface";
import { StyleType } from "../Style/StyleType";
import MethodNotImplemented from "../../Exception/MethodNotImplemented";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../Style/StyleFunctionType";

export default abstract class AbstractLayer implements LayerInterface
{
    protected layer: OlLayer;
    protected eventHandlers: EventHandlerCollection;
    protected srs: string;

    public getLayer(): OlLayer {
        return this.layer;
    }

    public abstract getType(): SourceType;

    public setType(type: SourceType): void {
        console.log(type);
        throw new MethodNotImplemented();
    }

    public getEventHandlers(): EventHandlerCollection {
        return this.eventHandlers;
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
   /*  public setStyle(style: StyleType): void { 
        console.log(style);
        throw new MethodNotImplemented();
    } */
    public setStyle(style: StyleFunction): void { 
        throw new MethodNotImplemented();
    }

}