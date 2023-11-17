import {runTest} from "../../TestBase";

runTest({
    description: '"block" tag with a different endblock name',
    templates: {
        'index.twig': `
{% block foo %}{% endblock bar %}`
    },
    expectedErrorMessage: 'TwingParsingError: Expected endblock for block "foo" (but "bar" given) in "index.twig" at line 2, column 28.'
});
