import {runTest} from "../../TestBase";

runTest({
    description: 'The spread operator spreads arrays',
    templates: {
        "index.twig": `
{% set a = ...[1, 2] %}
`
    },
    environmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    expectedErrorMessage: `TwingParsingError: Unexpected token "spread operator" of value "..." in "index.twig" at line 2, column 12.`
})