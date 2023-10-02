import OlStroke from 'ol/style/Stroke'
import {asString as olColorAsString} from 'ol/color'

/** CustomFillPattern */
export default class CustomFillPattern extends OlStroke {

    private canvas: HTMLCanvasElement;

    constructor(options) {
        super();
        options = options || {};
        this.canvas = document.createElement('canvas');
        const c = this.canvas.getContext('2d');
        c.lineWidth = 1; // options.size || 1;
        /* this.canvas.width = 39;
        this.canvas.height = c.lineWidth; */
        //this.canvas.width = 30;
        //this.canvas.height = 1;
        
        //c.transform(1, 0, 0, -1, 0, this.canvas.height);
        
        

        c.strokeStyle = olColorAsString(options.color || "#000");
        
        //if (options.fill) {
            //c.fillStyle = olColorAsString(options.fill.getColor());
            //c.fillRect(0, 0, this.canvas.width, c.lineWidth);
        //}
        let pattern;
        //const canvas = document.createElement("canvas");
        //const ctx = canvas.getContext("2d");
        switch (options.pattern) { 
            case "abc":
                this.createHatchDashDotPattern(c, options.angle);
                pattern = c.createPattern(this.canvas, "repeat");
                this.setColor(pattern);
                break;
            default:
                break

        }
        
    }

    public static getPatterns() {
        const patterns = {
            "hatch_dash_dot": {}
        }
        return patterns;
    }

    /* public getImage() {
        return this.canvas;
    } */

    private createHatchDashDotPattern(ctx: CanvasRenderingContext2D, angle: number): void { console.log(angle)
        /* if (angle) {
            ctx.rotate(angle);
        } */
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 0);
        ctx.stroke();
        /* ctx.beginPath();
        ctx.rect(0, 0, 40, 40);
        ctx.stroke(); */
        /* if (angle) { console.log(angle)
            ctx.rotate(-angle);
        } */
    }
}