import {runTest} from "../../TestBase";

runTest({
   description: 'Twing supports hash notation',
    templates: {
        'index.twig': `
{{ {0: 1, 'foo': 'bar'}|join(',') }}
{{ {0: 1, 'foo': 'bar', (1 + 2): 1}|keys|join(',') }}
`
    },
    expectation: `1,bar
0,foo,3
`
});
