import EventInterface from './EventInterface'
import EventType from './EventType'

export default class EventBus
{
    private executors: {[key: string]: any[]} = {};

    subscribe(type: EventType, executor: (event: EventInterface) => void)
    {
        if (!Object.prototype.hasOwnProperty.call(this.executors, type)) {
            this.executors[type] = [];
        }
        this.executors[type].push(executor);
        console.log("call EventBus subscribe", executor, this.executors);
    }

    dispatch(event: EventInterface): void
    {
        console.log("dispatch", this.executors, event.type, Object.prototype.hasOwnProperty.call(this.executors, event.type));
        if (!Object.prototype.hasOwnProperty.call(this.executors, event.type)) {
            this.executors[event.type].forEach(executor => {
                console.log("call executor", event);
                executor(event);
            })
        }
    }
}