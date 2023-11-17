import {runTest} from "../TestBase";

runTest({
   description: 'Comparison of something to a buffer',
   templates: {
       "index.twig": `
{{ "foo"|escape == "foo" }}
`
   },
    expectation: `
1
`
});
