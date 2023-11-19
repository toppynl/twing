import {runTest} from "../TestBase";
import {createFunction} from "../../../../src/lib/function";

runTest({
    description: 'Auto-escaping on non-existing function',
    templates: {
        "index.twig": '{{ unknownAtParseTime(foo) }}'
    },
    context: Promise.resolve({
        foo: '<br/>'
    }),
    trimmedExpectation: '&lt;br/&gt;',
    parserOptions: {
        strict: false
    },
    additionalFunctionsAtCompileTime: [
        createFunction('unknownAtParseTime', (value) => Promise.resolve(value), [
            {
                name: 'value'
            }
        ])
    ]
});
