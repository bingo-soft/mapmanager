import { Extent as OlExtent } from "ol/extent"
import OlSource from "ol/source/Source"
import SourceType from "./SourceType"

/** SourceInterface */
export default interface SourceInterface
{
    /**
     * Returns Openlayers' source instance
     * @return type of source
     */
    getSource(): OlSource;
    
    /**
     * Returns type of source
     * @return type of source
     */
    getType(): SourceType;
    
    /**
     * Returns extent of source
     * @return extent of source
     */
    getExtent(): OlExtent;
    
    /**
     * Returns code of source's projection
     * @return extent of source
     */
    getProjectionCode(): string;
}