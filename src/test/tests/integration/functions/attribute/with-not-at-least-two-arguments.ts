import {runTest} from "../../TestBase";

runTest({
    description: '"attribute" function called with one argument',
    templates: {
        "index.twig": '{{ attribute(a) }}'
    },
    expectedErrorMessage: 'TwingParsingError: The "attribute" function takes at least two arguments (the variable and the attributes) in "index.twig" at line 1, column 4.'
});
