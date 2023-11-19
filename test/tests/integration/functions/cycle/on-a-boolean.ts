import {runTest} from "../../TestBase";

runTest({
    description: '"cycle" function on a boolean',
    templates: {
        "index.twig": '{{ cycle(true, 1) }}'
    },
    trimmedExpectation: '1'
});
