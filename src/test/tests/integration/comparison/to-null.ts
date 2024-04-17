import {runTest} from "../TestBase";

runTest({
   description: 'Comparison of something to null',
   templates: {
       "index.twig": `
{{ null == null ? 1 : 0 }}
`
   },
    trimmedExpectation: `
1
`
});
