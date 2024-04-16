import {runTest} from "../../TestBase";

runTest({
    description: '"keys" filter with null',
    templates: {
        "index.twig": `{{ null|keys }}
{{ null|keys|join }}`
    },
    trimmedExpectation: 'Array'
});
