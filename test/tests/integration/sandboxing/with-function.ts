import {runTest} from "../TestBase";

runTest({
    description: 'No error is thrown when a allowed function is used',
    templates: {
        "index.twig": `
{{ dump(5) }}
`
    },
    sandboxed: true,
    sandboxSecurityPolicyFunctions: [
        'dump'
    ],
    trimmedExpectation: 'int(5)'
});

runTest({
    description: 'An error is thrown when a non-allowed function is used',
    templates: {
        "index.twig": `
{{ dump(5) }}
`
    }, 
    sandboxed: true,
    expectedErrorMessage: 'TwingSandboxSecurityError: Function "dump" is not allowed in "index.twig" at line 2, column 4.'
});
