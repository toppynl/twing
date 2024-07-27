import {runTest} from "../TestBase";
import {createFilter, createSynchronousFilter} from "../../../../main/lib/filter";

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
    additionalSynchronousFilters: [
        createSynchronousFilter('foo', () => {
            return 'wrong';
        }, [
            {
                name: 'foo'
            }
        ])
    ],
    expectedErrorMessage: 'TwingRuntimeError: Value for argument "foo" is required for filter "foo" in "index.twig" at line 2, column 8.'
});
