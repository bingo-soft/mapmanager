import { Interaction as OLInteraction} from "ol/interaction"
import InteractionInterface from "../InteractionInterface"
import MethodNotImplemented from "../../../../Exception/MethodNotImplemented"

export default abstract class BaseInteraction implements InteractionInterface
{
    getInteraction(): OLInteraction
    {
        throw new MethodNotImplemented(); 
    }
}