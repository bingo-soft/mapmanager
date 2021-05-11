import { Extent as OlExtent } from "ol/extent"
import OlSource from "ol/source/Source"
import SourceType from "./SourceType"

export default interface SourceInterface
{
    /**
     * Returns Openlayers' source instance
     *
     * @function getSource
     * @memberof SourceInterface
     * @return {Object} type of source
     */
    getSource(): OlSource;
    
    /**
     * Returns type of source
     *
     * @function getType
     * @memberof SourceInterface
     * @return {String} type of source
     */
    getType(): SourceType;
    
    /**
     * Returns extent of source
     *
     * @function getExtent
     * @memberof SourceInterface
     * @return {Array} extent of source
     */
    getExtent(): OlExtent;
    
    /**
     * Returns code of source's projection
     *
     * @function getProjectionCode
     * @memberof SourceInterface
     * @return {String} extent of source
     */
    getProjectionCode(): string;
}