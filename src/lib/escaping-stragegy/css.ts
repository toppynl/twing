import type {TwingEscapingStrategyHandler} from "../escaping-strategy";
const phpBin2hex = require("locutus/php/strings/bin2hex");
const phpLtrim = require('locutus/php/strings/ltrim');
const strlen = require('utf8-binary-cutter').getBinarySize;

export const createCssEscapingStrategyHandler = (): TwingEscapingStrategyHandler => {
    return (value) => {
        value = value.replace(/[^a-zA-Z0-9]/ug, (matches: string) => {
            let char = matches;

            // \xHH
            if (strlen(char) === 1) {
                let hex = phpLtrim(phpBin2hex(char).toUpperCase(), '0');

                if (strlen(hex) === 0) {
                    hex = '0';
                }

                return '\\' + hex + ' ';
            }

            // \uHHHH
            return '\\' + phpLtrim(phpBin2hex(char).toUpperCase(), '0') + ' ';
        });

        return value;
    }
};
