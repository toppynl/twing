import {runTest} from "../TestBase";

runTest({
    description: 'Auto-escaping on name',
    templates: {
        "index.twig": '{{ foo }}'
    },
    context: Promise.resolve({
        foo: '<br/>'
    }),
    expectation: '&lt;br/&gt;'
});
