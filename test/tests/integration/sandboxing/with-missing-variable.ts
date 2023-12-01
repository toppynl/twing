import {runTest} from "../TestBase";

runTest({
    description: '"sandbox" tag with missing variable',
    templates: {
        "index.twig": `{{ foo }}`
    },
    environmentOptions: {
        sandboxed: true,
        strictVariables: false
    },
    expectation: ''
});

runTest({
    description: '"sandbox" tag with missing variable',
    templates: {
        "index.twig": `{{ foo.bar() }}`
    },
    environmentOptions: {
        sandboxed: true,
        strictVariables: false
    },
    expectation: ''
});