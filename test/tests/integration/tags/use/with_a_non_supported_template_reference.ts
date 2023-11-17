import {runTest} from "../../TestBase";

runTest({
    description: '"use" tag with a variable as template reference',
    templates: {
        'index.twig': '{% use foo %}'
    },
    context: Promise.resolve({
        foo: 'foo.twig'
    }),
    expectedErrorMessage: 'TwingParsingError: The template references in a "use" statement must be a string in "index.twig" at line 1, column 4.'
});
