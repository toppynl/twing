import {runTest} from "../TestBase";

runTest({
    description: '"!==" strict inequality operator',
    templates: {
        'index.twig': `{{ 1 !== '1' ? 'ok' : 'ko' }}
{{ 1 !== 1 ? 'ko' : 'ok' }}
{{ null !== false ? 'ok' : 'ko' }}`
    },
    environmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    synchronousEnvironmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    expectation: `ok
ok
ok`
});
