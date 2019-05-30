// Test scaffolding methods
export function isIE() {
    if (navigator.appName == 'Microsoft Internet Explorer') {
        let ua = navigator.userAgent,
            re  = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');

        return re.test(ua);
    } else if (navigator.appName == 'Netscape') {
        let ua = navigator.userAgent,
            re  = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})');

        return re.test(ua);
    }

    return false;
}

export function isEdge() {
    return navigator.appName == 'Netscape' &&
        /Edge/.test(navigator.userAgent);
}
