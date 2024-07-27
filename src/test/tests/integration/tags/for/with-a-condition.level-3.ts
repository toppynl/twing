import {runTest} from "../../TestBase";

runTest({
    description: '"if" tag with a condition when targeting specification level 3',
    templates: {
        "index.twig": `
{% for i in 1..5 if i is odd -%}
    {{ loop.index }}.{{ i }}{{ foo.bar }}
{% endfor %}
`
    },
    environmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    synchronousEnvironmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    expectedErrorMessage: `TwingParsingError: Unexpected token "name" of value "if" ("end of statement block" expected) in "index.twig" at line 2, column 18.`
});
