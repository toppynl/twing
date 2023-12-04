import {runTest} from "../../TestBase";

for (const testCase of [['0.1', '0'], ['1.6', '1']]) {
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
        trimmedExpectation: `${testCase[1]}`
    });
}
