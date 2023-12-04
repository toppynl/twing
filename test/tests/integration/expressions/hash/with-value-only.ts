import {runTest} from "../../TestBase";

runTest({
   description: 'Hash key can be omitted if it is the same as the variable name',
   templates: {
       "index.twig": `
{% set foo = "foo" %}
{% set hash = { foo, bar: "bar" } %}
{{ hash|join }}
`
   },
    expectation: `
foobar
`
});