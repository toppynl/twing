import {runTest} from "../TestBase";

runTest({
    description: 'Auto-escaping when it is not explicitly set',
    templates: {
        "index.twig": '{{ br }}'
    },
    context: Promise.resolve({
        br: '<br/>'
    }),
    expectation: '&lt;br/&gt;'
});
