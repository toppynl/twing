import {runTest} from "../../TestBase";

runTest({
    description: '"for" tag with a condition and a nested for loop access',
    templates: {
        'index.twig': '{% for x in [1] if x > 0 %}{% for y in [1] %}{{ loop.last }}{% endfor %}{% endfor %}'
    },
    expectation: '1'
});
