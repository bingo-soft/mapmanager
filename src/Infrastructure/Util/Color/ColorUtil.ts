import UniqueColorsArray from "./UniqueColors"

/** ColorUtil */
export default class ColorUtil {
    private isIncrementMode: boolean;
    //private uniquePaintType: UniquePaintType;
    private uniqueColor: string;
    private uniqueColorIncrement: number;
    private uniqueColors: Map<string, string>;
    private uniqueColorArrayIndex: number;

    /**
     * @param startColor - start color for painting. If not set, painting via built-in array of colors is used
     * @param increment - color increment. If not set, painting via built-in array of colors is used
     */
    constructor(startColor?: string, increment?: number) {
        this.uniqueColors = new Map();
        this.uniqueColorArrayIndex = 0;
        if (startColor && increment) {
            this.uniqueColor = startColor; 
            this.uniqueColorIncrement = increment;
            this.isIncrementMode = true;
        } else {
            this.uniqueColor = UniqueColorsArray[0];
            this.isIncrementMode = false;
        }
    }

    /**
     * Returns unique color by data value
     * @param data - data
     * @param color - color to increment
     * @param increment - increment value
     * @return incremented color
     */
    public getUniqueColor(data: string): string {
        const color = this.uniqueColors.get(data);
        if (color) {
            this.uniqueColor = color;
        } else {
            if (this.isIncrementMode) {
                this.uniqueColor = ColorUtil.normalizeColor(this.uniqueColor);
                const colorHex = this.uniqueColor.split("#")[1];
                let r = parseInt(colorHex.substring(0, 2), 16) + this.uniqueColorIncrement;
                let g = parseInt(colorHex.substring(2, 4), 16) + this.uniqueColorIncrement;
                let b = parseInt(colorHex.substring(4), 16) + this.uniqueColorIncrement;
                r = r > 255 ? 255: r;
                g = g > 255 ? 255: g;
                b = b > 255 ? 255: b;
                let hexR = r.toString(16);
                let hexG = g.toString(16);
                let hexB = b.toString(16);
                hexR = hexR.length < 2 ? "0" + hexR: hexR;
                hexG = hexG.length < 2 ? "0" + hexG: hexG;
                hexB = hexB.length < 2 ? "0" + hexB: hexB;
                this.uniqueColor = "#" + hexR + hexG + hexB;
            } else {
                this.uniqueColor = UniqueColorsArray[this.uniqueColorArrayIndex];
                this.uniqueColorArrayIndex < UniqueColorsArray.length-1 ? this.uniqueColorArrayIndex++ : this.uniqueColorArrayIndex = 0;
            }
            this.uniqueColors.set(data, this.uniqueColor);
        }
        return this.uniqueColor;
    }

    /**
     * Applies opacity to hex color code
     * @param color - hex color code
     * @param opacity - opacity value from 1 to 100
     * @return hex code representing color and opacity
     */
    public static applyOpacity(color: string, opacity: number): string {
        color = ColorUtil.normalizeColor(color);
        if (opacity < 0) {
            opacity = 0;   
        }
        if (opacity > 100) {
            opacity = 100;
        }
        opacity = Math.round(opacity * 2.55);
        return color + opacity.toString(16).toUpperCase().padStart(2, "0");
    }

    /**
     * Makes normalized color in full HTML notation, e.q. #ABCDEF
     * @param color - color
     * @return normalized color
     */
    private static normalizeColor(color: string): string {
        if (color.substring(0, 1) != "#") {
            color = "#" + color;
        }
        if (color.length == 4) { // short color like #333
            color += color.substring(1);
        }
        return color;
    }
    
}
