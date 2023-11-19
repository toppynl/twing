import {runTest} from "../../TestBase";

runTest({
    description: '"url_encode" filter on non traversable',
    templates: {
        "index.twig": '{{ 5|url_encode }}'
    },
    trimmedExpectation: ''
})
