import { Interaction as OLInteraction } from "ol/interaction";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import InteractionType from "./InteractionType";

/** @interface InteractionInterface */
export default interface InteractionInterface {
    getInteraction(): OLInteraction;
    getType(): InteractionType;
    getEventHandlers(): EventHandlerCollection;
}