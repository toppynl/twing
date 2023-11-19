import {runTest} from "../../TestBase";

runTest({
    description: '"replace" filter with null',
    templates: {
        "index.twig": `{{ "foo"|replace(null) }}`
    },
    trimmedExpectation: 'foo'
})
