import {runTest} from "../../TestBase";

runTest({
    description: '"is defined" test on an array',
    templates: {
        "index.twig": '{{ [] is defined ? "OK" : "KO" }}'
    },
    trimmedExpectation: 'OK'
});
