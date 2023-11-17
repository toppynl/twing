const phpStripTags = require('locutus/php/strings/strip_tags');

export const striptags = (input: string, allowedTags: string): Promise<string> => {
    return Promise.resolve(phpStripTags(input, allowedTags));
};
