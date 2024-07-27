import {runTest} from "../../TestBase";

runTest({
    description: '"has every" operator is not supported by Twig specification level 2',
    templates: {
        "index.twig": `
{{ [] has every v => true }}
`
    },
    environmentOptions: {
        parserOptions: {
            level: 2
        }
    },
    synchronousEnvironmentOptions: {
        parserOptions: {
            level: 2
        }
    },
    expectedErrorMessage: `TwingParsingError: Unexpected token "name" of value "has" ("end of print statement" expected) in "index.twig" at line 2, column 7.`
});
