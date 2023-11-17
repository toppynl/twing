import {runTest} from "../TestBase";

runTest({
   description: 'Comparison of something to a datetime',
   templates: {
       "index.twig": `
{% set date1 = date("2000-01-01T00:00:00") %}
{% set date2 = date("2000-01-01T00:00:00") %}
{% set date3 = date("2001-01-01T00:00:00") %}
{{ date1 == date2 ? 1 : 0 }}
{{ date1 == date3 ? 1 : 0 }}
{{ date1 == [] ? 1 : 0 }}
{{ date1 == "foo" ? 1 : 0 }}
{{ date1 == 5 ? 1 : 0 }}
{{ date1 == null ? 1 : 0 }}
{{ date1 == true ? 1 : 0 }}
{{ date1 == false ? 1 : 0 }}
{{ date1 == 0 ? 1 : 0 }}
{{ date1 == 1 ? 1 : 0 }}
{{ date1 == 1.0 ? 1 : 0 }}
{{ date1 == 2 ? 1 : 0 }}
`
   },
    expectation: `
1
0
0
0
0
0
1
0
0
1
1
0
`
});
