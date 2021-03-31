export default class InteractionNotSupported extends Error
{
    constructor(interaction: string) {
        super(`Interaction '${interaction}' is not supported`);
        this.name = "InteractionNotSupported";
        this.stack = (<any> new Error()).stack;
    }
}