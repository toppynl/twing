import {runTest} from "../../TestBase";

runTest({
    description: '"merge" filter with named arguments',
    templates: {
        "index.twig": `{{ {"foo": 1}|merge(source = {"bar": 1})|keys|join }}`
    },
    expectation: 'foobar'
});
