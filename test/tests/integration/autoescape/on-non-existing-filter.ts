import {runTest} from "../TestBase";

runTest({
    description: 'Auto-escaping on non-existing filter',
    templates: {
        "index.twig": '{{ foo|unknownAtParseTime }}'
    },
    context: Promise.resolve({
        foo: '<br/>'
    }),
    trimmedExpectation: '&lt;br/&gt;',
    parserOptions: {
        strict: false
    },
    expectedErrorMessage: 'TwingRuntimeError: Unknown filter "unknownAtParseTime" in "index.twig" at line 1, column 8.'
});
