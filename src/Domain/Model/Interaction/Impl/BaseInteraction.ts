import { Interaction as OLInteraction } from "ol/interaction";
import InteractionInterface from "../InteractionInterface";
import InteractionType from "../InteractionType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import Map from "../../Map/Map";

/** BaseInteraction */
export default abstract class BaseInteraction implements InteractionInterface
{
    protected interaction: OLInteraction;
    protected type: InteractionType;
    protected eventHandlers: EventHandlerCollection;
    protected innerInteractions: OLInteraction[] = [];

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
    public getType(): InteractionType {
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

    /**
     * Removes all OL inner interactions
     */
    public removeInnerInteractions(map: Map): void {
        if (this.innerInteractions && this.innerInteractions.length) {
            const olMap = map.getMap();
            this.innerInteractions.forEach((innerInteraction: OLInteraction): void => {
                olMap.removeInteraction(innerInteraction);
            });
            this.innerInteractions = [];
        }
    }
}