import {runTest} from "../TestBase";

runTest({
    description: 'A parse error is thrown when an included template can\'t be parsed',
    templates: {
        "index.twig": '{{ include("unparseable.twig") }}',
        "unparseable.twig": '{{ }'
    },
    expectedErrorMessage: 'TwingParsingError: Unexpected "}" in "unparseable.twig" at line 1, column 4.'
});
