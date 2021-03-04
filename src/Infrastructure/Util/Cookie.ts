/** @class Cookie */
class Cookie {
    /**
    * Sets a cookie.
    *
    * @function set
    * @memberof Cookie
    * @param {String} name - name of cookie.
    * @param {String} value - value of cookie.
    * @param {Number} lifetime - lifetime of cookie in seconds.
    */
    public static set(name: string, value: string, lifetime: number): void {
        let expires = "";
        if (lifetime) {
            const date: Date = new Date();
            date.setTime(date.getTime() + lifetime * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    }


    /**
    * Gets a cookie.
    *
    * @function get
    * @memberof Cookie
    * @param {String} name - name of cookie to get.
    * @return {String} value of cookie
    */
    public static get(name: string): string {
        let ret = "";
        const ca: string[] = document.cookie.split(";");
        ca.forEach(function(val) {
            const pair: string[] = val.split("=");
            if (pair[0].trim() == name) {
                ret = pair[1];
                return;
            }
        });
        return ret ? decodeURIComponent(ret) : "";
    }


    /**
    * Deletes a cookie.
    *
    * @function delete
    * @memberof Cookie
    * @param {String} name - name of cookie to delete.
    */
    public static delete(name: string): void {
        document.cookie = name + "='' ; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    }
}

export default Cookie;