import {runCase} from "../harness";
import {ComponentAttributes} from "../../../main/lib";

runCase({
    description: '{% props %} assigns defaults when props missing',
    template: `{% props title = 'hello', count = 3 %}{{ title }}/{{ count }}`,
    expectation: 'hello/3'
});

runCase({
    description: '{% props %} uses provided props over defaults',
    template: `{% props title = 'hello' %}{{ title }}`,
    context: {title: 'actual'},
    expectation: 'actual'
});

runCase({
    description: '{% props %} required prop throws when missing',
    template: `{% props title %}{{ title }}`,
    expectedErrorMessage: 'TwingRuntimeError: title should be defined for component index.twig in "index.twig" at line 1, column 4.'
});

runCase({
    description: '{% props %} removes listed keys from attributes bag',
    template: `{% props title %}{{ title }}|{{ attributes.count }}`,
    context: {
        title: 'x',
        attributes: new ComponentAttributes({title: 'x', class: 'btn'})
    },
    expectation: 'x|1'
});

runCase({
    description: '{% props %} attribute keys are removed from context',
    template: `{% props %}{{ foo is defined ? 'yes' : 'no' }}`,
    context: {
        foo: 'x',
        attributes: new ComponentAttributes({foo: 'x'})
    },
    expectation: 'no'
});

runCase({
    description: '{% props %} supports complex default expression',
    template: `{% props items = [1, 2, 3] %}{{ items|join(",") }}`,
    expectation: '1,2,3'
});

runCase({
    description: '{% props %} comma-separated list',
    template: `{% props title = 'T', count = 1 %}{{ title }}/{{ count }}`,
    expectation: 'T/1'
});
