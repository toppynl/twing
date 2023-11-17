import {runTest} from "../TestBase";

runTest({
    description: 'Nodes containing only a BOM are bypassed',
    templates: {
        "index.twig": `{% extends "partial.twig" %}${String.fromCharCode(0xEF, 0xBB, 0xBF)}`,
        'partial.twig': `
{% block content %}
Content
{% endblock %}
`
    },
    expectation: 'Content'
});

runTest({
    description: 'Nodes containing only a BOM and whitespace characters are bypassed',
    templates: {
        "index.twig": `{% extends "partial.twig" %}${String.fromCharCode(0xEF, 0xBB, 0xBF)}${String.fromCharCode(0x0A, 0x20)}`,
        'partial.twig': `
{% block content %}
Content
{% endblock %}
`
    },
    expectation: 'Content'
});
