import {runTest} from "../TestBase";

runTest({
    description: 'An error is throw when a block does not start with a tag name',
    templates: {
        "index.twig": '{% 5 %}'
    },
    expectedErrorMessage: 'TwingParsingError: A block must start with a tag name in "index.twig" at line 1, column 4.'
});
