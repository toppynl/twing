import {runTest} from "../../TestBase";

runTest({
    description: '"has every" operator',
    templates: {
        "index.twig": `
{{ ([0, 2, 4] has every v => 0 == v % 2) ? 'Every' : 'Not every' }} items are even in array
{{ ({ a: 0, b: 2, c: 4 } has every v => v % 2 == 0) ? 'Every' : 'Not every' }} items are even in object
{{ ({ a: 0, b: 1, c: 2 } has every v => v % 2 == 0) ? 'Every' : 'Not every' }} items are even in object
{{ ({ a: 0, b: 2, c: 4 } has every (v, k) => k < "d")? 'Every' : 'Not every' }} keys are before "d" in object
{{ ({ a: 0, b: 2, c: 4 } has every (v, k) => k > "b")? 'Every' : 'Not every' }} keys are after "b" in object
{{ (5 has every v => v == 4 and v == "foo") ? 'Every' : 'Not every' }} v is equal to both 4 and "foo" in 5
{{ 5 has every null ? '5 has' : '5 has not' }} every null whatever it means
`
    },
    environmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    synchronousEnvironmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    expectation: `
Every items are even in array
Every items are even in object
Not every items are even in object
Every keys are before "d" in object
Not every keys are after "b" in object
Every v is equal to both 4 and "foo" in 5
5 has every null whatever it means
`
});
