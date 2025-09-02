import {runTest} from "../../TestBase";

runTest({
    description: 'defined test for undefined',
    templates: {
        'index.twig': `{{ foo is defined ? "KO" : "OK" }}
{{ bar is defined ? "KO" : "OK" }}`
    },
    context: {
        foo: undefined
    },
    expectation: `OK
OK`
});
