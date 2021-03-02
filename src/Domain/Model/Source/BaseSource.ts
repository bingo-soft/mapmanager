import OlSource from "ol/source/Source";
import SourceInterface from "./SourceInterface"
import SourceType from "./SourceType"

export default abstract class BaseSource implements SourceInterface
{
    protected source: OlSource;

    getSource(): OlSource  {
        return this.source;
    }

    public abstract getType(): SourceType;
}