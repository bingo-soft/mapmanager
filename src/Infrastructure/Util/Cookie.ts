/** Cookie */
export default class Cookie {
    /**
    * Sets a cookie.
    * @param name - name of cookie.
    * @param value - value of cookie.
    * @param lifetime - lifetime of cookie in seconds.
    */
    public static set(name: string, value: string, lifetime: number): void {
        let expires = "";
        if (lifetime) {
            const date = new Date();
            date.setTime(date.getTime() + lifetime * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    }


    /**
    * Returns a cookie.
    * @param name - name of cookie to get.
    * @return value of cookie
    */
    public static get(name: string): string {
        let ret = "";
        const ca = document.cookie.split(";");
        ca.forEach(function(val) {
            const pair = val.split("=");
            if (pair[0].trim() == name) {
                ret = pair[1];
                return;
            }
        });
        return ret ? decodeURIComponent(ret) : "";
    }


    /**
    * Deletes a cookie.
    * @param name - name of cookie to delete.
    */
    public static delete(name: string): void {
        document.cookie = name + "='' ; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    }
}