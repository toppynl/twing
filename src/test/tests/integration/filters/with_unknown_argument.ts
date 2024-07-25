import {runTest} from "../TestBase";
import {createFilter} from "../../../../main/lib/filter";

runTest({
    description: 'filter with unknown argument',
    templates: {
        'index.twig': `
{{ "5"|foo(foo=1) }}
`
    },
    additionalFilters: [
        createFilter('foo', () => {
            return Promise.resolve('wrong');
        }, [])
    ],
    expectedErrorMessage: 'TwingRuntimeError: Unknown argument "foo" for filter "foo()" in "index.twig" at line 2, column 12.'
});

runTest({
    description: 'filter with unknown arguments',
    templates: {
        'index.twig': `
{{ "5"|foo(foo=1,bar=2) }}
`
    },
    additionalFilters: [
        createFilter('foo', () => {
            return Promise.resolve('wrong');
        }, [])
    ],
    expectedErrorMessage: 'TwingRuntimeError: Unknown arguments "foo", "bar" for filter "foo()" in "index.twig" at line 2, column 12.'
});
