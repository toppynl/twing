import {runTest} from "../TestBase";

runTest({
    description: 'No error is thrown when a allowed filter is used',
    templates: {
        "index.twig": `
{{ 5|upper }}
`
    },
    environmentOptions: {
        sandboxed: true
    },
    sandboxSecurityPolicyFilters: [
        'upper'
    ],
    trimmedExpectation: '5'
});

runTest({
    description: 'An error is thrown when a non-allowed filter is used',
    templates: {
        "index.twig": `
{{ 5|upper }}
`
    },
    environmentOptions: {
        sandboxed: true
    },
    expectedErrorMessage: 'TwingSandboxSecurityError: Filter "upper" is not allowed in "index.twig" at line 2.'
});
