import {runTest} from "../../TestBase";

const specialCharacters: { [k: string]: string } = {
    /* HTML special chars - escape without exception to percent encoding */
    '<': '%3C',
    '>': '%3E',
    '\'': '%27',
    '"': '%22',
    '&': '%26',
    /* Characters beyond ASCII value 255 to hex sequence */
    'Ā': '%C4%80',
    /* Punctuation and unreserved check */
    ',': '%2C',
    '.': '.',
    '_': '_',
    '-': '-',
    ':': '%3A',
    ';': '%3B',
    '!': '%21',
    /* Basic alnums excluded */
    'a': 'a',
    'A': 'A',
    'z': 'z',
    'Z': 'Z',
    '0': '0',
    '9': '9',
    /* Basic control characters and null */
    "\r": '%0D',
    "\n": '%0A',
    "\t": '%09',
    "\0": '%00',
    /* PHP quirks from the past */
    ' ': '%20',
    '~': '~',
    '+': '%2B',
};

for (const key in specialCharacters) {
    let value = specialCharacters[key];
    
    runTest({
        description: `"escape" filter with "url" strategy on special character "${value}"`,
        templates: {
            "index.twig": `{{ key|escape("url") }}`
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
        "index.twig": `{{ "123"|escape("url") }}`
    },
    trimmedExpectation: `123`
});

runTest({
    description: `"escape" filter with "url" strategy on empty string`,
    templates: {
        "index.twig": `{{ ""|escape("url") }}`
    },
    trimmedExpectation: ``
});
