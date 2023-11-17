import {runTest} from "../TestBase";

runTest({
    description: 'Source map it not emitted when disabled',
    templates: {
        'index.twig': `{{ 5 }}
{{ 5 }}{{ 5 }}`
    },
    context: Promise.resolve({}),
    expectedSourceMapMappings: [],
    expectation: `5
55`,
    environmentOptions: {
        emitsSourceMap: false
    }
});
