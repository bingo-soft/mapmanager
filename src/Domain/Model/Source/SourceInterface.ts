import { Extent as OlExtent } from "ol/extent"
import OlSource from "ol/source/Source"
//import Projection from "ol/proj/Projection" 
import SourceType from "./SourceType"


export default interface SourceInterface
{
    getSource(): OlSource;

    getType(): SourceType;

    getExtent(): OlExtent;

    getProjectionCode(): string;
}