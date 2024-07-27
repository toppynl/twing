import {runTest} from "../TestBase";

runTest({
    description: 'Exceptions thrown by methods are caught and re-thrown as logical errors',
    templates: {
        "index.twig": `
{{ foo.bar() }}
`
    },
    expectedErrorMessage: 'TwingRuntimeError: I am Error in "index.twig" at line 2, column 4',
    context: {
        foo: {
            bar: () => {
                throw new Error('I am Error');
            }
        }
    }
});
