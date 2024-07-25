import {runTest} from "../../TestBase";

runTest({
    description: '"escape" filter on a boolean',
    templates: {
        "index.twig": '{{ true|escape }}'
    },
    trimmedExpectation: '1'
});
