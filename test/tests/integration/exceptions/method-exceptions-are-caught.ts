import {runTest} from "../TestBase";

runTest({
    description: 'Exceptions thrown by methods are caught and re-thrown as logical errors',
    templates: {
        "index.twig": `
{{ foo.bar() }}
`
    },
    expectedErrorMessage: 'TwingRuntimeError: An exception has been thrown during the rendering of a template ("I am Error") in "index.twig" at line 2.',
    context: Promise.resolve({
        foo: {
            bar: () => {
                throw new Error('I am Error');
            }
        }
    })
});
