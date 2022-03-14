import { Interaction as OlInteraction } from "ol/interaction";
import InteractionInterface from "../InteractionInterface";
import InteractionType from "../InteractionType";
import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import Map from "../../Map/Map";

/** BaseInteraction */
export default abstract class BaseInteraction implements InteractionInterface
{
    protected interaction: OlInteraction;
    protected type: InteractionType;
    protected eventHandlers: EventHandlerCollection;
    protected innerInteractions: OlInteraction[] = [];

    /**
     * Returns OpenLayers' interaction object
     * @return interaction object
     */
    public getInteraction(): OlInteraction {
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
     * Returns all OL inner interactions
     */
    public getInnerInteractions(): OlInteraction[] {
        return this.innerInteractions;
    }

    /**
     * Removes all OL inner interactions
     * @param map - map
     */
    public removeInnerInteractions(map: Map): void {
        if (this.innerInteractions && this.innerInteractions.length) {
            const olMap = map.getMap();
            this.innerInteractions.forEach((innerInteraction: OlInteraction): void => {
                olMap.removeInteraction(innerInteraction);
            });
            this.innerInteractions = [];
        }
    }
}