import {runTest} from "../../TestBase";

runTest({
    description: '"has every" operator',
    templates: {
        "index.twig": `
{{ ([0, 2, 4] has some v => 0 == v % 2) ? 'Some' : 'No' }} items are even in array
{{ ({ a: 0, b: 2, c: 4 } has some v => v % 2 == 0) ? 'Some' : 'No' }} items are even in object
{{ ({ a: 0, b: 1, c: 2 } has some v => v % 2 == 0) ? 'Some' : 'No' }} items are even in object
{{ ({ a: 1, b: 3, c: 5 } has some v => v % 2 == 0) ? 'Some' : 'No' }} items are even in object
{{ ({ a: 0, b: 2, c: 4 } has some (v, k) => k < "d")? 'Some' : 'No' }} keys are before "d" in object
{{ ({ a: 0, b: 2, c: 4 } has some (v, k) => k > "b")? 'Some' : 'No' }} keys are after "b" in object
{{ ({ a: 0, b: 2, c: 4 } has some (v, k) => k > "c")? 'Some' : 'No' }} keys are after "c" in object
{{ (5 has some v => v == 4 and v == "foo") ? 'Some' : 'No' }} v is equal to both 4 and "foo" in 5
{{ 5 has some null ? '5 has' : '5 has not' }} some null whatever it means
`
    },
    environmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    expectation: `
Some items are even in array
Some items are even in object
Some items are even in object
No items are even in object
Some keys are before "d" in object
Some keys are after "b" in object
No keys are after "c" in object
No v is equal to both 4 and "foo" in 5
5 has not some null whatever it means
`
});
