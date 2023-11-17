import {runTest} from "../TestBase";
import {createFilter} from "../../../../src/lib/filter";

runTest({
    description: 'Auto-escaping on unsafe filter',
    templates: {
        "index.twig": '{{ foo|unsafe }}'
    },
    context: Promise.resolve({
        foo: '<br/>'
    }),
    expectation: '&lt;br/&gt;',
    additionalFilters: [
        createFilter('unsafe', (value) => Promise.resolve(value), [], {
            is_safe: []
        })
    ]
});
