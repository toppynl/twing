import {runTest} from "../TestBase";

runTest({
    description: 'globals',
    templates: {
        "index.twig": `{{ foo }}, {{ bar }}`
    },
    environmentOptions: {
        globals: {
            foo: 'foo from globals',
            bar: 'bar from globals'
        }
    },
    context: Promise.resolve({
        bar: 'bar from context'
    }),
    expectation: `foo from globals, bar from context`
});
