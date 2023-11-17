import {runTest} from "../../TestBase";

runTest({
    description: '"keys" filter with null',
    templates: {
        "index.twig": `{{ null|keys }}`
    },
    expectation: ''
});
