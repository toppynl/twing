import {runTest} from "../TestBase";

runTest({
    description: 'No error is thrown when a allowed method is accessed',
    templates: {
        "index.twig": `
{{ foo.bar() }}
`
    },
    environmentOptions: {
        sandboxed: true
    },
    sandboxSecurityPolicyMethods: new Map([
        [Object, ['bar']]
    ]),
    context: Promise.resolve({
        foo: {
            bar: () => 5
        }
    }),
    trimmedExpectation: `5`
});

runTest({
    description: 'An error is thrown when a non-allowed method is accessed',
    templates: {
        "index.twig": `
{{ foo.bar() }}
`
    },
    environmentOptions: {
        sandboxed: true
    },
    context: Promise.resolve({
        foo: {
            bar: () => 5
        }
    }),
    sandboxSecurityPolicyMethods: new Map([
        [Map, ['bar']]
    ]),
    expectedErrorMessage: 'TwingSandboxSecurityError: Calling "bar" method on an instance of Object is not allowed in "index.twig" at line 2, column 4.'
});
