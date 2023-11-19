import {runTest} from "../../TestBase";

runTest({
    description: `attribute call supports being the operand of a defined test`,
    templates: {
        "index.twig": `
{{ foo.bar is defined ? 'OK' : 'KO' }}
{{ null.bar is defined ? 'KO' : 'OK' }}
`
    },
    context: Promise.resolve({
        foo: new (class {
            get bar() {
                return 'foo.bar';
            }
        })
    }),
    trimmedExpectation: `
OK
OK
`
});
