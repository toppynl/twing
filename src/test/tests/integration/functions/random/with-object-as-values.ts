import {runTest} from "../../TestBase";

runTest({
    description: '"random" function with array as values',
    templates: {
        "index.twig": `
{% set random1 = random({1: 1, 2: 2}) %}
{{ random1 == 1 or random1 == 2 }}
`
    },
    trimmedExpectation: `
1
`
});

runTest({
    description: '"random" function with array as values',
    templates: {
        "index.twig": `
{% set random1 = random(foo) %}
{{ random1 == foo }}
`
    },
    context: {
       foo: new (class {}) 
    },
    trimmedExpectation: `
1
`
});
