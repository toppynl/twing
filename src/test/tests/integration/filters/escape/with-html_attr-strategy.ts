import {runTest} from "../../TestBase";
import {codepointToUtf8} from "../../../../helpers/string";

const owaspTestCases: Array<[value: string, expectation: boolean]> = [];
const immune = [',', '.', '-', '_'];

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
        description: `"escape" filter with "html_attr" strategy on OWASP Recommend character "${value}"`,
        templates: {
            "index.twig": `{{ value|escape("html_attr") == value ? "true" : "false" }}`
        },
        trimmedExpectation: `${expectation}`,
        context: Promise.resolve({
            value
        })
    });
}

const specialCharacters: { [k: string]: string } = {
    '\'': '&#x27;',
    /* Characters beyond ASCII value 255 to unicode escape */
    'Ā': '&#x0100;',
    '😀': '&#x1F600;',
    /* Immune chars excluded */
    ',': ',',
    '.': '.',
    '-': '-',
    '_': '_',
    /* Basic alnums excluded */
    'a': 'a',
    'A': 'A',
    'z': 'z',
    'Z': 'Z',
    '0': '0',
    '9': '9',
    /* Basic control characters and null */
    "\r": '&#x0D;',
    "\n": '&#x0A;',
    "\t": '&#x09;',
    "\0": '&#xFFFD;', // should use Unicode replacement char
    /* Encode chars as named entities where possible */
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    /* Encode spaces for quoteless attribute protection */
    ' ': '&#x20;',
};

for (const key in specialCharacters) {
    let value = specialCharacters[key];
    
    runTest({
        description: `"escape" filter with "html_attr" strategy on special character "${value}"`,
        templates: {
            "index.twig": `{{ key|escape("html_attr") }}`
        },
        trimmedExpectation: `${value}`,
        context: Promise.resolve({
            key
        })
    });
}

runTest({
    description: `"escape" filter with "html_attr" strategy on string consisting of digits`,
    templates: {
        "index.twig": `{{ "123"|escape("html_attr") }}`
    },
    trimmedExpectation: `123`
});

runTest({
    description: `"escape" filter with "html_attr" strategy on empty string`,
    templates: {
        "index.twig": `{{ ""|escape("html_attr") }}`
    },
    trimmedExpectation: ``
});
