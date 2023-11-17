import {runTest} from "../TestBase";

runTest({
   description: 'Comparison of something to an array',
   templates: {
       "index.twig": `
{{ null == null ? 1 : 0 }}
`
   },
    expectation: `
1
`
});
