/** Display */
export default class Display {

    /**
     * Returns screen DPI
     * @return screen DPI
     */
    public static calcScreenDPI() {
        const el = document.createElement('div');
        el.setAttribute("style", "width: 1in;");
        document.body.appendChild(el);
        const dpi = el.offsetWidth;
        document.body.removeChild(el);
        return dpi;
    }

    
}
