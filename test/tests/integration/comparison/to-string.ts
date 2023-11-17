import {runTest} from "../TestBase";

runTest({
   description: 'Comparison of something to a string',
   templates: {
       "index.twig": `
{{ "" == "" ? 1 : 0 }}
{{ "" == true ? 1 : 0 }}
{{ "" == false ? 1 : 0 }}
{{ "" == null ? 1 : 0 }}
{{ "" == [] ? 1 : 0 }}
{{ "" == [""] ? 1 : 0 }}
{{ "" == ["f"] ? 1 : 0 }}
{{ "" == ["foo"] ? 1 : 0 }}

{{ "f" == "f" ? 1 : 0 }}
{{ "f" == true ? 1 : 0 }}
{{ "f" == false ? 1 : 0 }}
{{ "f" == null ? 1 : 0 }}
{{ "f" == [] ? 1 : 0 }}
{{ "f" == [""] ? 1 : 0 }}
{{ "f" == ["f"] ? 1 : 0 }}
{{ "f" == ["foo"] ? 1 : 0 }}

{{ "foo" == "foo"|convert_encoding("ISO-8859-1", "UTF-8") }}
{{ "foo" == "foo"|escape }}
`
   },
    expectation: `
1
0
1
1
0
0
0
0

1
1
0
0
0
0
0
0

1
1
`
});
