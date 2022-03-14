import { Interaction as OLInteraction } from "ol/interaction";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import Map from "../Map/Map";
import InteractionType from "./InteractionType";

/** InteractionInterface */
export default interface InteractionInterface {
    
    /**
     * Returns OpenLayers' interaction object
     * @return interaction object
     */
    getInteraction(): OLInteraction;
    
    /**
     * Returns interaction type
     * @return interaction type
     */
    getType(): InteractionType;
    
    /**
     * Returns collection of event handlers for the interaction
     * @return collection of event hadlers
     */
    getEventHandlers(): EventHandlerCollection;

    /**
     * Sets or unsets interaction active
     * @param active - activity flag
     */
    setActive(active: boolean): void;

    /**
     * Returns all OL inner interactions
     */
    getInnerInteractions(): OLInteraction[];

    /**
     * Removes all OL inner interactions
     */
    removeInnerInteractions(map: Map): void;
}