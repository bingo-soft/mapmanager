import EventInterface from './EventInterface'

export default interface EventSubscriberInterface
{
    handle(event: EventInterface): void;
}