class Cookie {
    public static set(name: string, value: string, exp: number): void {
        let expires = "";
        if (exp) {
            const date: Date = new Date();
            date.setTime(date.getTime() + exp);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

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

    public static delete(name: string): void {
        document.cookie = name + "='' ; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    }
}

export default Cookie;
