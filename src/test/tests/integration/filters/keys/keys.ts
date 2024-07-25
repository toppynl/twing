import {runTest} from "../../TestBase";

runTest({
    description: '"keys" filter',
    templates: {
        'index.twig': `{{ {0: "a", "1": "b"}|keys }}
{{ {0: "a", "1": "b"}|keys|join(",") }}`
    },
    trimmedExpectation: `
Array
0,1`
});
