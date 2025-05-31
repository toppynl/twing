import {runTest} from "../../TestBase";

runTest({
    description: `method call on a Map subclass`,
    templates: {
        "index.twig": `
{{ foo.bar() }}
`
    },
    context: {
        foo: new (class extends Map {
            bar() {
                return 'foo.bar';
            }
        })
    },
    trimmedExpectation: `
foo.bar
`
});
