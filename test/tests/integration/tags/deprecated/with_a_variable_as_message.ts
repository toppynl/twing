import {runTest} from "../../TestBase";

runTest({
    description: '"deprecated" tag with a variable as message',
    templates: {
        'index.twig': '{% deprecated foo %}'
    },
    context: Promise.resolve({
        foo: 'bar'
    }),
    expectedDeprecationMessages: [
        'bar ("index.twig" at line 1)'
    ]
});
