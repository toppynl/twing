import {runTest} from "../TestBase";

runTest({
   description: 'Comparison of something to object',
   templates: {
       "index.twig": `
{{ foo == foo ? 1 : 0 }}
{{ foo == bar ? 1 : 0 }}
`
   },
    trimmedExpectation: `
1
0
`,
    context: Promise.resolve({
        foo: {},
        bar: {}
    })
});
