import OlBaseObject from 'ol/Object';
import EventType from "./EventType";
import Handler from "./HandlerType";

type K = string;
type V = { type: string, handler: Handler };

/** @class EventHandlerCollection */
export default class EventHandlerCollection { 
    private target: OlBaseObject;
    private handlers: Map<K, V> = new Map<K, V>();

    /**
     * @constructor
     * @memberof EventHandlerCollection
     * @param {Object} target - handlers target
     */
    constructor(target: OlBaseObject) {
        this.target = target;
    }

    /**
     * Returns size of collection
     *
     * @function getSize
     * @memberof EventHandlerCollection
     * @return {Number} collection size
     */
    public getSize(): number {
        return this.handlers.size;
    }
 
    /**
     * Adds an event handler
     *
     * @function add
     * @memberof EventHandlerCollection
     * @param {String} type - event type
     * @param {String} id - id of handler
     * @param {Function} handler - handler
     */
    public add(type: EventType, id: string, handler: Handler): void {
        this.target.on(type, handler);
        this.handlers.set(id, { type, handler });
    }

    /**
     * Removes an event handler
     *
     * @function remove
     * @memberof EventHandlerCollection
     * @param {String} id - id of handler
     */
    public remove(id: string): void {
        const type: string = this.handlers.get(id).type;
        const handler: Handler = this.handlers.get(id).handler;
        this.target.un(type, handler);
        this.handlers.delete(id);
    }

    /**
     * Clears all event handlers
     *
     * @function clear
     * @memberof EventHandlerCollection
     */
    public clear(): void {
        this.handlers.forEach(el => {
            this.target.un(el.type, el.handler); 
        });
        this.handlers.clear();
    }

    public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
        if (typeof callbackfn !== "function") {
            throw new TypeError();
        }
        this.handlers.forEach((value, key, map) => {
            callbackfn.call(thisArg, value, key, map);
        });
    }		

}