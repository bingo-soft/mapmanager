import { Interaction as OLInteraction } from "ol/interaction";
import InteractionInterface from "../InteractionInterface";
import InteractionType from "../InteractionType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";

/** @class BaseInteraction */
export default abstract class BaseInteraction implements InteractionInterface
{
    protected interaction: OLInteraction;
    protected type: InteractionType;
    protected eventHandlers: EventHandlerCollection;

    /**
     * Returns OpenLayers' interaction object
     *
     * @function getInteraction
     * @memberof BaseInteraction
     * @return {Object} interaction object
     */
    public getInteraction(): OLInteraction {
        return this.interaction;
    }

    /**
     * Returns interaction type
     *
     * @function getType
     * @memberof BaseInteraction
     * @return {Object} interaction type
     */
    public  getType(): InteractionType {
        return this.type;
    }

    /**
     * Returns collection of event hadтlers for the interaction
     *
     * @function getEventHandlers
     * @memberof BaseInteraction
     * @return {Object} collection of event hadlers
     */
    public getEventHandlers(): EventHandlerCollection {
        return this.eventHandlers;
    }

    /**
     * Sets or unsets interaction active
     *
     * @function setActive
     * @memberof BaseInteraction
     * @param {Boolean} active - activity flag
     */
    public setActive(active: boolean): void {
        this.interaction.setActive(active);
    }
}