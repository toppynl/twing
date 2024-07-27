import {runTest} from "../../TestBase";

runTest({
   description: 'Hash key can be omitted if it is the same as the variable name',
   templates: {
       "index.twig": `
{% set foo = "fooValue" %}
{% set hash = { foo, bar: "barValue" } %}
{{ hash|join }}
`
   },
    expectation: `
fooValuebarValue
`
});
