/** @class InteractionNotSupported */
export default class InteractionNotSupported extends Error
{
    /**
     * @constructor
     * @memberof InteractionNotSupported
     * @param {String} interaction - interaction name
     */
    constructor(interaction: string) {
        super(`Interaction '${interaction}' is not supported`);
        this.name = "InteractionNotSupported";
        this.stack = (<any> new Error()).stack;
    }
}