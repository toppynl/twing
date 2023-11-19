import {runTest} from "../../TestBase";

runTest({
    description: '"source" function with a missing templates',
    templates: {
        "index.twig": '{{ source("foo") }}'
    },
    expectedErrorMessage: 'TwingRuntimeError: Unable to find template "foo" in "index.twig" at line 1.'
});

runTest({
    description: '"source" function with a missing templates and ignoreMissing set to true',
    templates: {
        "index.twig": '{{ source("foo", true) }}'
    },
    trimmedExpectation: ''
});
