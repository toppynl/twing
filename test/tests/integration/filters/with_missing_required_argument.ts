import {runTest} from "../TestBase";
import {createFilter} from "../../../../src/lib/filter";

runTest({
    description: 'filter with missing required arguments',
    templates: {
        'index.twig': `
{{ "5"|foo() }}
`
    },
    additionalFilters: [
        createFilter('foo', () => {
            return Promise.resolve('wrong');
        }, [
            {
                name: 'foo'
            }
        ])
    ],
    expectedErrorMessage: 'TwingCompilationError: Value for argument "foo" is required for filter "foo" in "index.twig" at line 2.'
});
