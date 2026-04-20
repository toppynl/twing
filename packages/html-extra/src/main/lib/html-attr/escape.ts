import {htmlspecialchars} from "locutus/php/strings";

const entityMap = new Map<number, string>([
    [34, "quot"],
    [38, "amp"],
    [60, "lt"],
    [62, "gt"]
]);

const escapeChar = (chr: string): string => {
    const ord = chr.charCodeAt(0);

    if ((ord <= 0x1f && chr !== "\t" && chr !== "\n" && chr !== "\r") || (ord >= 0x7f && ord <= 0x9f)) {
        return "&#xFFFD;";
    }

    const codePoint = chr.codePointAt(0)!;

    if (entityMap.has(codePoint)) {
        return `&${entityMap.get(codePoint)};`;
    }

    let hex = codePoint.toString(16).toUpperCase();

    if (hex.length === 1 || hex.length === 3) {
        hex = "0" + hex;
    }

    return `&#x${hex};`;
};

const escapeByRegex = (value: string, regex: RegExp): string => {
    return value.replace(regex, (match) => escapeChar(match));
};

export const escapeHtmlAttrRelaxed = (value: string): string => {
    return escapeByRegex(value, /[^a-zA-Z0-9,.\-_:@\[\]]/gu);
};

export const escapeHtml = (value: string): string => {
    return htmlspecialchars(value, "ENT_QUOTES");
};
