import {runTest} from "../../TestBase";

runTest({
    description: '"is defined" test on an object without toString() method',
    templates: {
        "index.twig": '{{ foo is empty ? "OK" : "KO" }}'
    },
    context: Promise.resolve({
        foo: {}
    }),
    trimmedExpectation: 'OK'
});
