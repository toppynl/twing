import {runTest} from "../TestBase";
import {createFilter} from "../../../../src/lib/filter";

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
    additionalFiltersAtCompileTime: [
        createFilter('unknownAtParseTime', (value) => Promise.resolve(value), [])
    ]
});
