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
    context: {
        foo: {
            bar: () => {
                return 'foo.bar';
            }
        }
    },
    trimmedExpectation: `
OK
OK
OK
`
});
