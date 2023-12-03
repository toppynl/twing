import {runTest} from "../../TestBase";

runTest({
    description: '"if" tag on hash',
    templates: {
        "index.twig": `
{% if {} %}true{% else %}false{% endif %}
{% if {0: 1} %}true{% else %}false{% endif %}
`
    },
    expectation: `
falsetrue`
});