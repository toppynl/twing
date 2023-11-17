import {runTest} from "../TestBase";

runTest({
    description: 'Auto-escaping when it is disabled',
    templates: {
        "index.twig": '{{ br }}'
    },
    context: Promise.resolve({
        br: '<br/>'
    }),
    expectation: '<br/>',
    environmentOptions: {
        autoEscapingStrategy: null     
    }
});
