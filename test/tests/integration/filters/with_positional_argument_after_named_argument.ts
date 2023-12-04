import {runTest} from "../TestBase";
import {createFilter} from "../../../../src/lib/filter";

runTest({
    description: 'filter with positional argument after named argument',
    templates: {
        'index.twig': `
{{ "5"|foo(1,bar = 2,3) }}
`
    },
    additionalFilters: [
        createFilter('foo', () => {
            return Promise.resolve('wrong');
        }, [
            {
                name: 'bar'
            }
        ], {
            is_variadic: true
        })
    ],
    expectedErrorMessage: 'TwingRuntimeError: Positional arguments cannot be used after named arguments for filter "foo" in "index.twig" at line 2, column 8.'
});
