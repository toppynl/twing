import {runTest} from "../../TestBase";

runTest({
    description: 'The spread operator spreads hashes',
    templates: {
        "index.twig": `
{% set twigHash = {
    "favoriteColor": "orange"
} %}
{% for key, value in { firstName: 'Ryan', lastName: 'Weaver', favoriteFood: 'popcorn', ...{favoriteFood: 'pizza', sport: 'running'} } %}
    {{ key }}: {{ value }}
{% endfor %}

{% for key, value in { firstName: 'Ryan', ...twigHash} %}
    {{ key }}: {{ value }}
{% endfor %}

{% for key, value in { firstName: 'Ryan', ...jsMap} %}
    {{ key }}: {{ value }}
{% endfor %}

{# multiple spreads #}
{% for key, value in { firstName: 'Ryan', ...jsMap, lastName: 'Weaver', ...twigHash} %}
    {{ key }}: {{ value }}
{% endfor %}
`
    },
    context: Promise.resolve({
        jsMap: new Map([['favoriteShoes', 'barefoot']]) 
    }),
    environmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    expectation: `
    firstName: Ryan
    lastName: Weaver
    favoriteFood: pizza
    sport: running

    firstName: Ryan
    favoriteColor: orange

    firstName: Ryan
    favoriteShoes: barefoot

    firstName: Ryan
    favoriteShoes: barefoot
    lastName: Weaver
    favoriteColor: orange
`
})