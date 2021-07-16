import { Interaction as OLInteraction } from "ol/interaction";
import InteractionInterface from "../InteractionInterface";
import InteractionType from "../InteractionType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";

/** BaseInteraction */
export default abstract class BaseInteraction implements InteractionInterface
{
    protected interaction: OLInteraction;
    protected type: InteractionType;
    protected eventHandlers: EventHandlerCollection;

    /**
     * Returns OpenLayers' interaction object
     * @return interaction object
     */
    public getInteraction(): OLInteraction {
        return this.interaction;
    }

    /**
     * Returns interaction type
     * @return interaction type
     */
    public  getType(): InteractionType {
        return this.type;
    }

    /**
     * Returns collection of event handlers for the interaction
     * @return collection of event handlers
     */
    public getEventHandlers(): EventHandlerCollection {
        return this.eventHandlers;
    }

    /**
     * Sets or unsets interaction active
     * @param active - activity flag
     */
    public setActive(active: boolean): void {
        this.interaction.setActive(active);
    }
}