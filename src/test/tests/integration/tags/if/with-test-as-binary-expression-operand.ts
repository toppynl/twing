import {runTest} from "../../TestBase";

runTest({
    description: '"if" tag with a test as binary expression operand',
    templates: {
        "index.twig": `
{% if a is defined and b %}true{% else %}false{% endif %}
`
    },
    expectation: `
true`,
    context: Promise.resolve({
        a: true,
        b: true
    })
});
