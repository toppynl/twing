import {runTest} from "../../TestBase";

runTest({
    description: 'Twing supports the ternary operator',
    templates: {
        'index.twig': `
{{ 1 ? 'YES' : 'NO' }}
{{ 0 ? 'YES' : 'NO' }}
{{ 0 ? 'YES' : (1 ? 'YES1' : 'NO1') }}
{{ 0 ? 'YES' : (0 ? 'YES1' : 'NO1') }}
{{ 1 == 1 ? 'foo<br />':'' }}
{{ foo ~ (bar ? ('-' ~ bar) : '') }}`
    },
    trimmedExpectation: `
YES
NO
YES1
NO1
foo<br />
foo-bar
`,
    context: Promise.resolve({
        foo: 'foo',
        bar: 'bar'
    })
})
