import {runTest} from "../TestBase";
import {createFilter} from "../../../../src/lib/filter";

runTest({
    description: 'filter with duplicated arguments',
    templates: {
        'index.twig': `
{{ "5"|foo(1,foo=2) }}
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
    expectedErrorMessage: 'TwingRuntimeError: Argument "foo" is defined twice for filter "foo" in "index.twig" at line 2, column 8.'
});
