import {runTest} from "../TestBase";

runTest({
    description: '"keys" filter',
    templates: {
        'index.twig': `{{ {0: "a", "1": "b"}|keys }}`
    },
    expectation: `0,1`
});
