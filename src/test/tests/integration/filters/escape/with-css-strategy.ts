import {runTest} from "../../TestBase";
import {codepointToUtf8} from "../../../../helpers/string";

const owaspTestCases: Array<[value: string, expectation: boolean]> = [];

for (let chr = 0; chr < 0xFF; ++chr) {
    const literal = codepointToUtf8(chr);
    
    if (chr >= 0x30 && chr <= 0x39
        || chr >= 0x41 && chr <= 0x5A
        || chr >= 0x61 && chr <= 0x7A) {

        owaspTestCases.push([literal, true]);
    } else {
        owaspTestCases.push([literal, false]);
    }
}

for (const [value, expectation] of owaspTestCases) {
    runTest({
        description: `"escape" filter with "css" strategy on OWASP recommend character "${value}"`,
        templates: {
            "index.twig": `{{ value|escape("css") == value ? "true" : "false" }}`
        },
        trimmedExpectation: `${expectation}`,
        context: {
            value
        }
    });
}

const specialCharacters: { [k: string]: string } = {
    /* HTML special chars - escape without exception to hex */
    '<': '\\u003C',
    '>': '\\u003E',
    '\'': '\\u0027',
    '"': '\\u0022',
    '&': '\\u0026',
    /* Characters beyond ASCII value 255 to unicode escape */
    'Ā': '\\u0100',
    /* Immune chars excluded */
    ',': '\\u002C',
    '.': '\\u002E',
    '_': '\\u005F',
    /* Basic alnums excluded */
    'a': 'a',
    'A': 'A',
    'z': 'z',
    'Z': 'Z',
    '0': '0',
    '9': '9',
    /* Basic control characters and null */
    "\r": '\\u000D',
    "\n": '\\u000A',
    "\t": '\\u0009',
    "\0": '\\u0000',
    /* Encode spaces for quoteless attribute protection */
    ' ': '\\u0020',
};

for (const key in specialCharacters) {
    let value = specialCharacters[key];

    runTest({
        description: `"escape" filter with "css" strategy on special character "${key}"`,
        templates: {
            "index.twig": `{{ key|escape("css") }}`
        },
        trimmedExpectation: `${value}`,
        context: {
            key
        }
    });
}

runTest({
    description: `"escape" filter with "url" strategy on string consisting of digits`,
    templates: {
        "index.twig": `{{ "123"|escape("css") }}`
    },
    trimmedExpectation: `123`
});

runTest({
    description: `"escape" filter with "url" strategy on empty string`,
    templates: {
        "index.twig": `{{ ""|escape("css") }}`
    },
    trimmedExpectation: ``
});
