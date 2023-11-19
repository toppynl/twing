import {runTest} from "../TestBase";

runTest({
    description: '"print" node source map',
    templates: {
        'index.twig': `{{ 5 }}
{{ 5 }}{{ 5 }}`
    },
    context: Promise.resolve({}),
    expectedSourceMapMappings: [{
        source: 'index.twig',
        generatedLine: 1,
        generatedColumn: 0,
        originalLine: 1,
        originalColumn: 0,
        name: 'print'
    }, {
        source: 'index.twig',
        generatedLine: 1,
        generatedColumn: 1,
        originalLine: 1,
        originalColumn: 7,
        name: 'text'
    }, {
        source: 'index.twig',
        generatedLine: 2,
        generatedColumn: 0,
        originalLine: 2,
        originalColumn: 0,
        name: 'print'
    }, {
        source: 'index.twig',
        generatedLine: 2,
        generatedColumn: 1,
        originalLine: 2,
        originalColumn: 7,
        name: 'print'
    }],
    trimmedExpectation: `5
55`
});
