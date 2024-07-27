import {runTest} from "../../TestBase";

runTest({
    description: 'The spread operator spreads arrays',
    templates: {
        "index.twig": `
{% set moreNumbers = [5, 6, 7, 8] %}
{% set iterableNumbers = [6, 7, 8, 9] %}
{{ [1, 2, ...[3, 4]]|join(',') }}
{{ [1, 2, ...moreNumbers]|join(',') }}
{{ [1, 2, ...iterableNumbers]|join(',') }}
{{ [1, 2, ...iterableNumbers, 0, ...moreNumbers]|join(',') }}
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
1,2,3,4
1,2,5,6,7,8
1,2,6,7,8,9
1,2,6,7,8,9,0,5,6,7,8
`
})
