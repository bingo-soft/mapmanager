import OlLayer from "ol/layer/Layer";
import { Source as OlSource } from "ol/source";
import SourceType from "../Source/SourceType";
import {Style as OlStyle} from "ol/style";
import OlFeature from "ol/Feature";
import SourceInterface from "../Source/SourceInterface";
import { StyleType } from "../Style/StyleType";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import StyleFunction from "../Style/StyleFunctionType";

/** @interface LayerInterface */
export default interface LayerInterface
{
    getLayer(): OlLayer;
    getEventHandlers(): EventHandlerCollection; 
    getType(): SourceType;
    setType(type: SourceType): void;
    getSRS(): string;
    getSource(): OlSource;
    setSource(source: SourceInterface): void;
    setLoader(loader: () => Promise<string>): void;
    setUrl(url: string): void;
    setZIndex(zIndex: number): void;
    setOpacity(opacity: number): void;
    setStyle(style: StyleFunction): void;
}