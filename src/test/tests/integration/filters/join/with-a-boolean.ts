import {runTest} from "../../TestBase";

runTest({
    description: '"join" filter with a boolean',
    templates: {
        "index.twig": `{{ [true]|join }}{{ [false]|join }}`
    },
    trimmedExpectation: '1'
});
