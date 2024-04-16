import {runTest} from "../TestBase";
import {createFilter} from "../../../../main/lib/filter";

runTest({
    description: 'deprecated filter',
    additionalFilters: [
        createFilter('foo', (operand) => {
            return Promise.resolve(operand);
        }, [], {
            deprecated: true
        })
    ],
    templates: {
        'index.twig': '{{ 5|foo() }}'
    },
    expectedDeprecationMessages: [
        'Filter "foo" is deprecated in "index.twig" at line 1.'
    ]
});

runTest({
    description: 'deprecated filter with alternative',
    additionalFilters: [
        createFilter('foo', (operand) => {
            return Promise.resolve(operand);
        }, [], {
            deprecated: true,
            alternative: 'bar'
        })
    ],
    templates: {
        'index.twig': '{{ 5|foo() }}'
    },
    expectedDeprecationMessages: [
        'Filter "foo" is deprecated. Use "bar" instead in "index.twig" at line 1.'
    ]
});

runTest({
    description: 'deprecated filter with alternative and version',
    additionalFilters: [
        createFilter('foo', (operand) => {
            return Promise.resolve(operand);
        }, [], {
            deprecated: 'x.y.z',
            alternative: 'bar'
        })
    ],
    templates: {
        'index.twig': '{{ 5|foo() }}'
    },
    expectedDeprecationMessages: [
        'Filter "foo" is deprecated since version x.y.z. Use "bar" instead in "index.twig" at line 1.'
    ]
});
