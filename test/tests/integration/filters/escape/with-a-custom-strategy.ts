import {runTest} from "../../TestBase";

runTest({
    description: '"escape" filter with a custom strategy',
    templates: {
        "index.twig": '{{ "foo"|escape("custom") }}'
    },
    expectation: 'custom foo'
});
