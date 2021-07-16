import OlSource from "ol/source/Source";
import { Extent as OlExtent } from "ol/extent";
import SourceInterface from "./SourceInterface";
import SourceType from "./SourceType";
import MethodNotImplemented from "../../Exception/MethodNotImplemented";

/** BaseSource */
export default abstract class BaseSource implements SourceInterface
{
    protected source: OlSource;

    /**
     * @return type of source
     */
    public getSource(): OlSource {
        return this.source;
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public abstract getType(): SourceType;

    /**
     * Returns extent of source
     * @return extent of source
     */
    public getExtent(): OlExtent {
        throw new MethodNotImplemented();
    }

    /**
     * Returns code of source's projection
     * @return extent of source
     */
    public getProjectionCode(): string {
        return this.source.getProjection().getCode();
    }
}