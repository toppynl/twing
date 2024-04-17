import {runTest} from "../../TestBase";

runTest({
    description: '"sort" filter with arrow parameter',
    templates: {
        "index.twig": `{{ [5, 4]|sort((a, b) => a <=> b)|join() }}`
    },
    expectation: '45'
})
