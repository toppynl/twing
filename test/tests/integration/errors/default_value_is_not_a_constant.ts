import {runTest} from "../TestBase";

runTest({
    description: 'An exception is thrown when a default value is not a constant',
    templates: {
        "index.twig": `
{% macro foo(a=b) %}{% endmacro %}`
    },
    expectedErrorMessage: 'TwingParsingError: A default value for an argument must be a constant (a boolean, a string, a number, or an array) in "index.twig" at line 2, column 16.'
});

runTest({
    description: 'An exception is thrown when a default value is an array that does not consist of only constants',
    templates: {
        "index.twig": `
{% macro foo(a=[b]) %}{% endmacro %}`
    },
    expectedErrorMessage: 'TwingParsingError: A default value for an argument must be a constant (a boolean, a string, a number, or an array) in "index.twig" at line 2, column 17.'
})
