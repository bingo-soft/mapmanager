import EventInterface from '../EventHandlerCollection/EventInterface'
import EventType from '../EventHandlerCollection/EventType'

export default class SourceChangedEvent implements EventInterface
{
    type = EventType.SourceChange 
}