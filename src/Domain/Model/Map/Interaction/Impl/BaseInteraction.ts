import { Interaction as OLInteraction} from "ol/interaction"
import InteractionInterface from "../InteractionInterface"
import InteractionType from "../InteractionType";
import MethodNotImplemented from "../../../../Exception/MethodNotImplemented"

export default abstract class BaseInteraction implements InteractionInterface
{
    protected interaction: OLInteraction;
    protected type: InteractionType;

    /* getInteraction(): OLInteraction {
        throw new MethodNotImplemented(); 
    } */

    getInteraction(): OLInteraction {
        return this.interaction;
    }

    getType(): InteractionType {
        return this.type;
    }
}