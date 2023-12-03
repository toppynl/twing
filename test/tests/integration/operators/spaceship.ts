import {runTest} from "../TestBase";

runTest({
    description: '"spaceship" operator',
    templates: {
        "index.twig": `
{% set nullVar = null %}
{% set emptyArray = [] %}

{{ false <=> 0 }}
{{ false <=> '' }}
{{ false <=> '0' }}
{{ false <=> nullVar }}
{{ false <=> emptyArray }}

1
{{ 1 <=> true }}
{{ 1 <=> '1' }}

0
{{ 0 <=> false }}
{{ 0 <=> '0' }}
{{ 0 <=> null }}

-1
{{ -1 <=> true }}
{{ -1 <=> '-1' }}

"1"
{{ '1' <=> true }}
{{ '1' <=> 1 }}

"0"
{{ '0' <=> false }}
{{ '0' <=> 0 }}

"-1"
{{ '-1' <=> true }}
{{ '-1' <=> -1 }}

null
{{ nullVar <=> false }}
{{ nullVar <=> 0 }}
{{ nullVar <=> emptyArray }}
{{ nullVar <=> '' }}

[]
{{ emptyArray <=> false }}
{{ emptyArray <=> nullVar }}

"php"
{{ 'php' <=> true }}
{{ 'php' <=> 0 }}

""
{{ '' <=> false }}
{{ '' <=> 0 }}
{{ '' <=> nullVar }}

{{ 1 <=> 2 }}
`
    },
    expectation: `

0
0
0
0
0

1
0
0

0
0
0
0

-1
0
0

"1"
0
0

"0"
0
0

"-1"
0
0

null
0
0
0
0

[]
0
0

"php"
0
0

""
0
0
0

-1
`
});
