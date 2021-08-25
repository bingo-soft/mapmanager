/** ColorUtil */
export default class ColorUtil {

    /**
     * Applies opacity to hex color code
     * @param color - hex color code
     * @param opacity - opacity value from 1 to 100
     * @return hex code representing color and opacity
     */
    public static applyOpacity(color: string, opacity: number): string {
        if (color.length == 4) { // short color like #333
            color += color.substring(1);
        }
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
     * Converts html color to integer value
     * @param color - hex color code
     * @return integer color value
     */
     public static htmlColorToInt(color: string): number {
        if (color.length == 4) { // short color like #333
            color += color.substring(1);
        }
        return parseInt(color.substr(1, 6), 16);
    }
    
}
