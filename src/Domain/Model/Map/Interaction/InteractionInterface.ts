import { Interaction as OLInteraction} from "ol/interaction"

export default interface InteractionInterface
{
    getInteraction(): OLInteraction;
}