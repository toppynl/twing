import type {EscapingStrategyHandler} from "../escaping-strategy";

const phpBin2hex = require("locutus/php/strings/bin2hex");
const phpSprintf = require('locutus/php/strings/sprintf');
const strlen = require('utf8-binary-cutter').getBinarySize;

export const createJsEscapingStrategyHandler = (): EscapingStrategyHandler => {
    return (value) => {
        // escape all non-alphanumeric characters
        // into their \x or \uHHHH representations
        value = value.replace(/[^a-zA-Z0-9,._]/ug, function (matches: string) {
            let char = matches;

            /**
             * A few characters have short escape sequences in JSON and JavaScript.
             * Escape sequences supported only by JavaScript, not JSON, are ommitted.
             * \" is also supported but omitted, because the resulting string is not HTML safe.
             */
            let shortMap = new Map([
                ['\\', '\\\\'],
                ['/', '\\/'],
                ["\x08", '\\b'],
                ["\x0C", '\\f'],
                ["\x0A", '\\n'],
                ["\x0D", '\\r'],
                ["\x09", '\\t'],
            ]);

            if (shortMap.has(char)) {
                return shortMap.get(char);
            }

            // \uHHHH
            char = phpBin2hex(char).toUpperCase();

            if (strlen(char) <= 4) {
                return phpSprintf('\\u%04s', char);
            }

            return phpSprintf('\\u%04s\\u%04s', char.substr(0, 4), char.substr(4, 4));
        });

        return value;
    }
};
