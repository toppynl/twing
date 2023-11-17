import {runTest} from "../TestBase";

runTest({
    description: 'No error is thrown when a allowed property is accessed',
    templates: {
        "index.twig": `
{{ foo.bar }}
`
    },
    environmentOptions: {
        sandboxed: true
    },
    sandboxSecurityPolicyProperties: new Map([
        [Object, ['bar']]
    ]),
    context: Promise.resolve({
        foo: {
            bar: 5
        }
    }),
    expectation: `5`
});

runTest({
    description: 'An error is thrown when a non-allowed property is accessed',
    templates: {
        "index.twig": `
{{ foo.bar }}
`
    },
    environmentOptions: {
        sandboxed: true
    },
    context: Promise.resolve({
        foo: {
            bar: 5
        }
    }),
    sandboxSecurityPolicyProperties: new Map([
        [Map, ['bar']]
    ]),
    expectedErrorMessage: 'TwingSandboxSecurityError: Calling "bar" property on an instance of Object is not allowed in "index.twig" at line 2.'
});
