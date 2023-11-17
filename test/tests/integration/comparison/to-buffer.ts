import {runTest} from "../TestBase";

runTest({
   description: 'Comparison of something to a buffer',
   templates: {
       "index.twig": `
{{ "foo"|convert_encoding("ISO-8859-1", "UTF-8") == "foo" }}
`
   },
    expectation: `
1
`
});
