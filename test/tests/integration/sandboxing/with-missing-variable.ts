import {runTest} from "../TestBase";

runTest({
    description: '"sandbox" tag with missing variable',
    templates: {
        "index.twig": `{{ foo }}`
    },
    sandboxed: true,
    strict: false,
    expectation: ''
});

runTest({
    description: '"sandbox" tag with missing variable',
    templates: {
        "index.twig": `{{ foo.bar() }}`
    },
    sandboxed: true,
    strict: false,
    expectation: ''
});
