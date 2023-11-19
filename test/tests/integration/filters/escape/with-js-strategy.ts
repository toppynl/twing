import {runTest} from "../../TestBase";
import {codepointToUtf8} from "../../../../helpers/string";

const owaspTestCases: Array<[value: string, expectation: boolean]> = [];
const immune = [',', '.', '_'];

for (let chr = 0; chr < 0xFF; ++chr) {
    const literal = codepointToUtf8(chr);
    
    if (chr >= 0x30 && chr <= 0x39
        || chr >= 0x41 && chr <= 0x5A
        || chr >= 0x61 && chr <= 0x7A) {

        owaspTestCases.push([literal, true]);
    } else {
        owaspTestCases.push([literal, immune.includes(literal)]);
    }
}

for (const [value, expectation] of owaspTestCases) {
    runTest({
        description: `"escape" filter with "js" strategy on OWASP recommend character "${value}"`,
        templates: {
            "index.twig": `{{ value|escape("js") == value ? "true" : "false" }}`
        },
        trimmedExpectation: `${expectation}`,
        context: Promise.resolve({
            value
        }),
        environmentOptions: {
            autoEscapingStrategy: null
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
    '/': '\\/',
    /* Characters beyond ASCII value 255 to unicode escape */
    'Ā': '\\u0100',
    '😀': '\\uD83D\\uDE00',
    /* Immune chars excluded */
    ',': ',',
    '.': '.',
    '_': '_',
    /* Basic alnums excluded */
    'a': 'a',
    'A': 'A',
    'z': 'z',
    'Z': 'Z',
    '0': '0',
    '9': '9',
    /* Basic control characters and null */
    "\r": '\\r',
    "\n": '\\n',
    "\x08": '\\b',
    "\t": '\\t',
    "\x0C": '\\f',
    "\0": '\\u0000',
    /* Encode spaces for quoteless attribute protection */
    ' ': '\\u0020',
};

for (const key in specialCharacters) {
    let value = specialCharacters[key];
    
    runTest({
        description: `"escape" filter with "js" strategy on special character "${value}"`,
        templates: {
            "index.twig": `{{ key|escape("js") }}`
        },
        trimmedExpectation: `${value}`,
        context: Promise.resolve({
            key
        }),
        environmentOptions: {
            autoEscapingStrategy: null
        }
    });
}

runTest({
    description: `"escape" filter with "js" strategy on string consisting of digits`,
    templates: {
        "index.twig": `{{ "123"|escape("js") }}`
    },
    trimmedExpectation: `123`,
    environmentOptions: {
        autoEscapingStrategy: null
    }
});

runTest({
    description: `"escape" filter with "js" strategy on empty string`,
    templates: {
        "index.twig": `{{ ""|escape("js") }}`
    },
    trimmedExpectation: ``,
    environmentOptions: {
        autoEscapingStrategy: null
    }
});
