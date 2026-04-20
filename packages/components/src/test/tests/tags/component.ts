import {runCase} from "../harness";

runCase({
    description: '{% component %} renders a simple component',
    templates: {
        'index.twig': `{% component 'Button' %}{% endcomponent %}`,
        'components/Button.html.twig': `<button>x</button>`
    },
    expectation: '<button>x</button>'
});

runCase({
    description: '{% component %} with passes scalar variables',
    templates: {
        'index.twig': `{% component 'Heading' with {level: 2} %}{% endcomponent %}`,
        'components/Heading.html.twig': `{% props level = 1 %}<h{{ level }}>hi</h{{ level }}>`
    },
    expectation: '<h2>hi</h2>'
});

runCase({
    description: '{% component %} default block body overrides parent',
    templates: {
        'index.twig': `{% component 'Card' %}{% block content %}custom{% endblock %}{% endcomponent %}`,
        'components/Card.html.twig': `<div>{% block content %}default{% endblock %}</div>`
    },
    expectation: '<div>custom</div>'
});

runCase({
    description: '{% component %} with + props + attributes bag',
    templates: {
        'index.twig': `{% component 'Button' with {title: 'ok', class: 'btn primary'} %}{% endcomponent %}`,
        'components/Button.html.twig': `{% props title %}<button{{ attributes }}>{{ title }}</button>`
    },
    expectation: '<button class="btn primary">ok</button>'
});

runCase({
    description: '{% component %} only keeps with-variables',
    templates: {
        'index.twig': `{% set outer = 'visible' %}{% component 'C' with {x: 1} only %}{% endcomponent %}`,
        'components/C.html.twig': `{% props x %}{{ x }}/{{ outer ?? 'no-outer' }}`
    },
    expectation: '1/no-outer'
});

runCase({
    description: '{% component %} without "only" inherits parent context',
    templates: {
        'index.twig': `{% set greeting = 'hello' %}{% component 'C' %}{% endcomponent %}`,
        'components/C.html.twig': `{{ greeting }}`
    },
    expectation: 'hello'
});
