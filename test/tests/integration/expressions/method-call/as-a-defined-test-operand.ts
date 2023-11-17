import {runTest} from "../../TestBase";

runTest({
    description: `method call supports being the operand of a defined test`,
    templates: {
        "index.twig": `
{{ foo.bar() is defined ? 'OK' : 'KO' }}
{{ foo.unknown() is defined ? 'KO' : 'OK' }}
{{ null.bar() is defined ? 'KO' : 'OK' }}
`
    },
    context: Promise.resolve({
        foo: {
            bar: () => {
                return 'foo.bar';
            }
        }
    }),
    expectation: `
OK
OK
OK
`
});
