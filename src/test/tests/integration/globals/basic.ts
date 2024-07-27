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
    synchronousEnvironmentOptions: {
        globals: {
            foo: 'foo from globals',
            bar: 'bar from globals'
        }
    },
    context: {
        bar: 'bar from context'
    },
    expectation: `foo from globals, bar from context`
});
