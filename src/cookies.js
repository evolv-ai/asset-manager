function getCookie(name) {
    var cookieArr = document.cookie.split(";");

    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");

        if(name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }

    return null;
}

function setCookie(name, value, daysToLive, domain) {
    var cookie = name + "=" + encodeURIComponent(value);

    if(typeof daysToLive === "number") {
        cookie += "; max-age=" + (daysToLive*24*60*60) + "; path=/" + (domain ? "; domain=" + domain : "");
        document.cookie = cookie;
    }
}

export { getCookie, setCookie }
