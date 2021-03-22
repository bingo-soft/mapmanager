import OlSource from "ol/source/Source";
import { Extent as OlExtent } from "ol/extent";
import SourceInterface from "./SourceInterface";
import SourceType from "./SourceType";
import MethodNotImplemented from "../../Exception/MethodNotImplemented";

export default abstract class BaseSource implements SourceInterface
{
    protected source: OlSource;

    public getSource(): OlSource {
        return this.source;
    }

    public abstract getType(): SourceType;

    public getExtent(): OlExtent {
        throw new MethodNotImplemented();
    }

    public getProjectionCode(): string {
        return this.source.getProjection().getCode();
    }
}