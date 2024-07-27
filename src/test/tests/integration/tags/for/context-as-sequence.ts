import {runTest} from "../../TestBase";

runTest({
    description: '"for" tag with context as sequence',
    templates: {
        "index.twig": `{% for key, value in _context %}{{ key }}{{ value }}{% endfor %}`
    },
    expectation: `foofoo valuebarbar value_parent[object Object]`,
    context: {
        foo: 'foo value',
        bar: 'bar value'
    }
});
