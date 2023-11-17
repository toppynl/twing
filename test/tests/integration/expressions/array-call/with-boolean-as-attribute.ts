import {runTest} from "../../TestBase";

for (const testCase of [['true', '1'], ['false', '0']]) {
    runTest({
        description: `Considers ${testCase[0]} as analogous to ${testCase[1]}`,
        templates: {
            "index.twig": `{{ foo[${testCase[0]}] }}`
        },
        context: Promise.resolve({
            foo: {
                0: '0',
                1: '1'
            }
        }),
        expectation: `${testCase[1]}`
    });
}
