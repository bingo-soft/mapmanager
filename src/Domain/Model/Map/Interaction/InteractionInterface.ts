import { Interaction as OLInteraction} from "ol/interaction";
import InteractionType from "./InteractionType";

export default interface InteractionInterface {
    getInteraction(): OLInteraction;
    getType(): InteractionType;
}