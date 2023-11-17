import type {TwingMarkup} from "../../../markup";
import {createMarkup} from "../../../markup";

const phpNl2br = require('locutus/php/strings/nl2br');

export const nl2br = (...args: Array<any>): Promise<TwingMarkup> => {
    return Promise.resolve(createMarkup(phpNl2br(...args)));
};
