import OlSource from "ol/source/Source";
import { Extent as olExtent } from "ol/extent"
import Projection from "ol/proj/Projection" 
import SourceInterface from "./SourceInterface"
import SourceType from "./SourceType"
import MethodNotImplemented from "../../Exception/MethodNotImplemented"

export default abstract class BaseSource implements SourceInterface
{
    protected source: OlSource;

    public getSource(): OlSource  {
        return this.source;
    }

    public abstract getType(): SourceType;

    public getExtent(): olExtent {
        throw new MethodNotImplemented();
    }

    public getProjection(): Projection  {
        return this.source.getProjection();
    }
}