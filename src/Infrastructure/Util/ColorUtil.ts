/** ColorUtil */
export default class ColorUtil {

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
     * Increments color by increment value
     * @param color - color to increment
     * @param increment - increment value
     * @return incremented color
     */
    public static incrementColor(color: string, increment: number): string {
        color = ColorUtil.normalizeColor(color);
        const colorHex = color.split("#")[1];
        let r = parseInt(colorHex.substring(0, 2), 16) + increment;
        let g = parseInt(colorHex.substring(2, 4), 16) + increment;;
        let b = parseInt(colorHex.substring(4), 16) + increment;
        r = r > 255 ? 255: r;
        g = g > 255 ? 255: g;
        b = b > 255 ? 255: b;
        let hexR = r.toString(16);
        let hexG = g.toString(16);
        let hexB = b.toString(16);
        hexR = hexR.length < 2 ? "0" + hexR: hexR;
        hexG = hexG.length < 2 ? "0" + hexG: hexG;
        hexB = hexB.length < 2 ? "0" + hexB: hexB;
        return "#" + hexR + hexG + hexB;
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
