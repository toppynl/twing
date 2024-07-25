import {runTest} from "../../TestBase";

runTest({
    description: '"join" filter with a non traversable',
    templates: {
        "index.twig": `{{ 5|join }}`
    },
    trimmedExpectation: ''
});
