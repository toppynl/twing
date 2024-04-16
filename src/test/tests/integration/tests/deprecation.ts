import {runTest} from "../TestBase";
import {createTest} from "../../../../main/lib/test";

runTest({
    description: 'deprecated test',
    additionalTests: [
        createTest('foo', () => {
            return Promise.resolve(true);
        }, [], {
            deprecated: true
        })
    ],
    templates: {
        'index.twig': '{{ 5 is foo }}'
    },
    expectedDeprecationMessages: [
        'Test "foo" is deprecated in "index.twig" at line 1.'
    ]
});

runTest({
    description: 'deprecated test with alternative',
    additionalTests: [
        createTest('foo', () => {
            return Promise.resolve(true);
        }, [], {
            deprecated: true,
            alternative: 'bar'
        })
    ],
    templates: {
        'index.twig': '{{ 5 is foo }}'
    },
    expectedDeprecationMessages: [
        'Test "foo" is deprecated. Use "bar" instead in "index.twig" at line 1.'
    ]
});

runTest({
    description: 'deprecated test with alternative and version',
    additionalTests: [
        createTest('foo', () => {
            return Promise.resolve(true);
        }, [], {
            deprecated: 'x.y.z',
            alternative: 'bar'
        })
    ],
    templates: {
        'index.twig': '{{ 5 is foo }}'
    },
    expectedDeprecationMessages: [
        'Test "foo" is deprecated since version x.y.z. Use "bar" instead in "index.twig" at line 1.'
    ]
});
