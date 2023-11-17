import {runTest} from "../../TestBase";

runTest({
    description: `attribute call supports class instance getter`,
    templates: {
        "index.twig": `{{ foo.bar }}`
    },
    context: Promise.resolve({
        foo: new (class {
            get bar() {
                return 'foo.bar';
            }
        })
    }),
    expectation: 'foo.bar'
});
