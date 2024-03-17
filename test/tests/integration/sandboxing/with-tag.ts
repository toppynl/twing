import {runTest} from "../TestBase";

runTest({
    description: 'No error is thrown when a allowed tag is used',
    templates: {
        "index.twig": `
{% block foo %}5{% endblock %}
`
    },
    sandboxed: true,
    sandboxSecurityPolicyTags: [
        'block'
    ],
    trimmedExpectation: '5'
});

runTest({
    description: 'An error is thrown when a non-allowed tag is used',
    templates: {
        "index.twig": `
{% block foo %}5{% endblock %}
`
    },
    sandboxed: true,
    expectedErrorMessage: 'TwingSandboxSecurityError: Tag "block" is not allowed in "index.twig" at line 2, column 4.'
});
