import {runTest} from "../TestBase";

runTest({
   description: 'Comparison of something to an array',
   templates: {
       "index.twig": `
{{ [] == true ? 1 : 0 }}
{{ [] == false ? 1 : 0 }}
{{ [] == null ? 1 : 0 }}
{{ [] == [] ? 1 : 0 }}
{{ ["foo"] == true ? 1 : 0 }}
{{ ["foo"] == "foo" ? 1 : 0 }}
{{ ["foo"] == [] ? 1 : 0 }}
{{ ["foo"] == ["bar"] ? 1 : 0 }}
{{ ["foo"] == ["foo"] ? 1 : 0 }}
{{ array == true ? 1 : 0 }}
{{ array == "" ? 1 : 0 }}
`
   },
    trimmedExpectation: `
0
1
1
1
1
0
0
0
1
0
0
`,
    context:{
        array: []
    }
});
