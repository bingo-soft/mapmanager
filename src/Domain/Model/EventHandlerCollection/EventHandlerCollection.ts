import OlBaseObject from "ol/Object";
import EventType from "./EventType";
import Handler from "./HandlerType";

type K = string;
type V = { type: string, handler: Handler };

/** EventHandlerCollection */
export default class EventHandlerCollection { 
    private target: OlBaseObject;
    private handlers: Map<K, V> = new Map<K, V>();

    /**
     * @param target - handler target
     */
    constructor(target: OlBaseObject) {
        this.target = target;
    }

    /**
     * Returns size of collection
     * @return collection size
     */
    public getSize(): number {
        return this.handlers.size;
    }
 
    /**
     * Adds an event handler
     * @param type - event type
     * @param id - id of handler
     * @param handler - handler
     */
    public add(type: EventType, id: string, handler: Handler): void {
        this.target.on(type, handler);
        this.handlers.set(id, { type, handler });
    }

    /**
     * Removes an event handler
     * @param id - id of handler
     */
    public remove(id: string): void {
        const type = this.handlers.get(id).type;
        const handler = this.handlers.get(id).handler;
        this.target.un(type, handler);
        this.handlers.delete(id);
    }

    /**
     * Clears all event handlers
     */
    public clear(): void {
        this.handlers.forEach(el => {
            this.target.un(el.type, el.handler); 
        });
        this.handlers.clear();
    }

    /**
     * Iterates the collection
     * @param callbackfn - callback function to call for each element
     */
    public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
        if (typeof callbackfn !== "function") {
            throw new TypeError();
        }
        this.handlers.forEach((value, key, map) => {
            callbackfn.call(thisArg, value, key, map);
        });
    }		

}