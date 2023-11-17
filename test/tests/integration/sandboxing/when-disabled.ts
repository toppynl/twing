import {runTest} from "../TestBase";

runTest({
    description: 'Sandboxing when disabled',
    templates: {
        "index.twig": `{% do 5 %}{{ foo }}`
    },
    context: Promise.resolve({
        foo: {
            toString: () => 'foo'
        }
    }),
    expectation: `foo`
})
