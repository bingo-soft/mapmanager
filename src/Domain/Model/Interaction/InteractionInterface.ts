import { Interaction as OLInteraction } from "ol/interaction";
import EventHandlerCollection from "../EventHandlerCollection/EventHandlerCollection";
import InteractionType from "./InteractionType";

/** @interface InteractionInterface */
export default interface InteractionInterface {
    
    /**
     * Returns OpenLayers' interaction object
     *
     * @function getInteraction
     * @memberof InteractionInterface
     * @return {Object} interaction object
     */
    getInteraction(): OLInteraction;
    
    /**
     * Returns interaction type
     *
     * @function getType
     * @memberof InteractionInterface
     * @return {Object} interaction type
     */
    getType(): InteractionType;
    
    /**
     * Returns collection of event handlers for the interaction
     *
     * @function getEventHandlers
     * @memberof InteractionInterface
     * @return {Object} collection of event hadlers
     */
    getEventHandlers(): EventHandlerCollection;

    /**
     * Sets or unsets interaction active
     *
     * @function setActive
     * @memberof InteractionInterface
     * @param {Boolean} active - activity flag
     */
    setActive(active: boolean): void;
}