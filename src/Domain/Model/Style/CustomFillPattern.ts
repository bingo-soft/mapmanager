import OlStyleFill from 'ol/style/Fill'
import {asString as olColorAsString} from 'ol/color'

/** CustomFillPattern */
export default class CustomFillPattern extends OlStyleFill {

    private canvas: HTMLCanvasElement;

    constructor(options) {
        super();
        options = options || {};
        this.canvas = document.createElement('canvas');
        const c = this.canvas.getContext('2d');

        this.canvas.width = 39;
        this.canvas.height = 39;

        if (options.fill) {
            c.fillStyle = olColorAsString(options.fill.getColor());
            c.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        c.strokeStyle = olColorAsString(options.color || "#000");
        c.lineWidth = options.size || 1;
        let pattern;
        //const canvas = document.createElement("canvas");
        //const ctx = canvas.getContext("2d");
        switch (options.pattern) {
            case "hatch_dash_dot":
                this.createHatchDashDotPattern(c);
                pattern = c.createPattern(this.canvas, "repeat");
                this.setColor(pattern);
                break;
            case "image":
                const image = new Image();
                image.src = options.imageFile;
                image.onload = () => {
                    this.canvas.width = image.width;
                    this.canvas.height = image.height;
                    pattern = c.createPattern(image, "repeat");
                    this.setColor(pattern);
                };
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

    public getImage() {
        return this.canvas;
    }

    private createHatchDashDotPattern(context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.moveTo(0, 19);
        context.lineTo(12, 7);
        context.moveTo(15, 4);
        context.lineTo(14, 3);
        context.moveTo(0, 39);
        context.lineTo(39, 0);
        context.moveTo(19, 38);
        context.lineTo(31, 26);
        context.moveTo(34, 24);
        context.lineTo(35, 23);
        context.stroke();
    }
}