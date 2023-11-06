import {runTest} from "../TestBase";
import {createFilter} from "../../../../src/lib/filter";

runTest({
    description: 'variadic filter',
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
    expectedErrorMessage: 'TwingCompilationError: Positional arguments cannot be used after named arguments for filter "foo" in "index.twig" at line 2.'
});
