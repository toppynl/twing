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
        context: Promise.resolve({
            value
        })
    });
}

const specialCharacters: { [k: string]: string } = {
    /* HTML special chars - escape without exception to hex */
    '<': '\\3C ',
    '>': '\\3E ',
    '\'': '\\27 ',
    '"': '\\22 ',
    '&': '\\26 ',
    /* Characters beyond ASCII value 255 to unicode escape */
    'Ā': '\\100 ',
    /* Immune chars excluded */
    ',': '\\2C ',
    '.': '\\2E ',
    '_': '\\5F ',
    /* Basic alnums excluded */
    'a': 'a',
    'A': 'A',
    'z': 'z',
    'Z': 'Z',
    '0': '0',
    '9': '9',
    /* Basic control characters and null */
    "\r": '\\D ',
    "\n": '\\A ',
    "\t": '\\9 ',
    "\0": '\\0 ',
    /* Encode spaces for quoteless attribute protection */
    ' ': '\\20 ',
};

for (const key in specialCharacters) {
    let value = specialCharacters[key];

    runTest({
        description: `"escape" filter with "css" strategy on special character "${value}"`,
        templates: {
            "index.twig": `{{ key|escape("css") }}`
        },
        trimmedExpectation: `${value}`,
        context: Promise.resolve({
            key
        })
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
