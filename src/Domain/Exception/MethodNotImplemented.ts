/** @class MethodNotImplemented */
export default class MethodNotImplemented extends Error
{
    /**
     * @constructor
     * @memberof MethodNotImplemented
     */
    constructor() {
        super("method_not_implemented");
        this.name = "MethodNotImplemented";
        this.stack = (<any> new Error()).stack;
    }
}