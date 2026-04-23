import {runCase} from "../harness";

runCase({
    description: '<twig:Name /> renders a self-closing component',
    templates: {
        'index.twig': `<twig:Button />`,
        'components/Button.html.twig': `<button>x</button>`
    },
    expectation: '<button>x</button>',
    preLex: true
});

runCase({
    description: '<twig:Name attr="..." /> passes attributes',
    templates: {
        'index.twig': `<twig:Button label="ok" class="btn" />`,
        'components/Button.html.twig': `{% props label %}<button{{ attributes }}>{{ label }}</button>`
    },
    expectation: '<button class="btn">ok</button>',
    preLex: true
});

runCase({
    description: '<twig:Name>body</twig:Name> renders default block',
    templates: {
        'index.twig': `<twig:Card>hello</twig:Card>`,
        'components/Card.html.twig': `<div>{% block content %}default{% endblock %}</div>`
    },
    expectation: '<div>hello</div>',
    preLex: true
});

runCase({
    description: '<twig:Name><twig:block name="..">..</twig:block></twig:Name> renders named block',
    templates: {
        'index.twig': `<twig:Card><twig:block name="content">named</twig:block></twig:Card>`,
        'components/Card.html.twig': `<div>{% block content %}default{% endblock %}</div>`
    },
    expectation: '<div>named</div>',
    preLex: true
});

runCase({
    description: '<twig:Name :foo="expr" /> passes dynamic attributes',
    templates: {
        'index.twig': `{% set title = 'yo' %}<twig:Heading :text="title" />`,
        'components/Heading.html.twig': `{% props text %}<h1>{{ text }}</h1>`
    },
    expectation: '<h1>yo</h1>',
    preLex: true
});

runCase({
    description: '<twig:ns:Name /> resolves colon-namespaced components to subdirectory paths',
    templates: {
        'index.twig': `<twig:button:button label="ok" />`,
        'components/button/button.html.twig': `{% props label %}<button>{{ label }}</button>`
    },
    expectation: '<button>ok</button>',
    preLex: true
});
