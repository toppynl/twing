import {runTest} from "../TestBase";

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
    expectedErrorMessage: 'TwingRuntimeError: Unknown function "unknownAtParseTime" in "index.twig" at line 1, column 4.'
});
