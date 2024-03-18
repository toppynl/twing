import {runTest} from "../TestBase";

runTest({
    description: 'globals with include',
    templates: {
        "index.twig": `{{ include("foo") }}`,
        'foo': `{{ title }}`
    },
    environmentOptions: {
        globals: {
            title: 'foo'
        }
    },
    expectation: `foo`
});

runTest({
    description: 'globals with include, when shadowed',
    templates: {
        "index.twig": `{{ include("foo", {title: "bar"}) }}`,
        'foo': `{{ title }}`
    },
    environmentOptions: {
        globals: {
            title: 'foo'
        }
    },
    expectation: `bar`
});

runTest({
    description: 'globals with include and only',
    templates: {
        "index.twig": `{{ include("foo", {}, true) }}`,
        'foo': `{{ title }}`
    },
    environmentOptions: {
        globals: {
            title: 'foo'
        }
    },
    expectation: `foo`
});
