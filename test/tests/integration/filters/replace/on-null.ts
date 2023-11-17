import {runTest} from "../../TestBase";

runTest({
    description: '"replace" filter on null',
    templates: {
        "index.twig": `{{ null|replace([]) }}`
    },
    expectation: ''
})
