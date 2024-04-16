import {runTest} from "../TestBase";
import {createFunction} from "../../../../main/lib/function";

runTest({
    description: 'deprecated function',
    additionalFunctions: [
        createFunction('foo', () => {
            return Promise.resolve('');
        }, [], {
            deprecated: true,
        })
    ],
    templates: {
        'index.twig': '{{ foo() }}'
    },
    expectedDeprecationMessages: [
        'Function "foo" is deprecated in "index.twig" at line 1.'
    ]
});

runTest({
    description: 'deprecated function with alternative',
    additionalFunctions: [
        createFunction('foo', () => {
            return Promise.resolve('');
        }, [], {
            deprecated: true,
            alternative: 'bar'
        })
    ],
    templates: {
        'index.twig': '{{ foo() }}'
    },
    expectedDeprecationMessages: [
        'Function "foo" is deprecated. Use "bar" instead in "index.twig" at line 1.'
    ]
});

runTest({
    description: 'deprecated function with alternative and version',
    additionalFunctions: [
        createFunction('foo', () => {
            return Promise.resolve('');
        }, [], {
            deprecated: 'x.y.z',
            alternative: 'bar'
        })
    ],
    templates: {
        'index.twig': '{{ foo() }}'
    },
    expectedDeprecationMessages: [
        'Function "foo" is deprecated since version x.y.z. Use "bar" instead in "index.twig" at line 1.'
    ]
});
