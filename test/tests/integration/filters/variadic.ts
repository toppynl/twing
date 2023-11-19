import {runTest} from "../TestBase";
import {createFilter} from "../../../../src/lib/filter";

runTest({
    description: 'variadic filter',
    templates: {
        'index.twig': `
{{ "5"|variadic() }}
{{ "5"|variadic(1) }}
{{ "5"|variadic(1,2) }}
{{ "5"|variadic(1,foo = 2) }}
`
    },
    additionalFilters: [
        createFilter('variadic', (operand: string, ...values: Array<number>) => {
            return Promise.resolve(`${operand}=>${values.join(',')}`);
        }, [], {
            is_variadic: true
        })
    ],
    trimmedExpectation: `
5=>
5=>1
5=>1,2
5=>1,2
`,
    environmentOptions: {
        autoEscapingStrategy: null
    }
});
