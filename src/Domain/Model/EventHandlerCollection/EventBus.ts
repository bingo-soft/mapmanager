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
    }

    dispatch(event: EventInterface): void
    {
        if (Object.prototype.hasOwnProperty.call(this.executors, event.type)) {
            this.executors[event.type].forEach(executor => {
                executor(event);
            })
        }
    }
}