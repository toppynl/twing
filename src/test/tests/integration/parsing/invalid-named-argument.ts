import {runTest} from "../TestBase";

runTest({
    description: 'An error is thrown when a invalid named argument is used',
    templates: {
        "index.twig": `
{{ date(5="bar") }}`
    },
    expectedErrorMessage: 'TwingParsingError: A parameter name must be a string, "constant" given in "index.twig" at line 2, column 9.'
});
