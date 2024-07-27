import {runTest} from "../../TestBase";
import {createFilter, createSynchronousFilter} from "../../../../../main/lib/filter";

runTest({
    description: '"apply" tag with filter arguments',
    templates: {
        "index.twig": `
{% apply append(18)|title %}
hangar
{%- endapply %}
`
    },
    expectation: `
Hangar 18`,
    additionalFilters: [
        createFilter('append', (_executionContext, operand: any, index: number) => {
            return Promise.resolve(`${operand} ${index}`);
        }, [{
            name: 'index'
        }])
    ],
    additionalSynchronousFilters: [
        createSynchronousFilter('append', (_executionContext, operand: any, index: number) => {
            return `${operand} ${index}`;
        }, [{
            name: 'index'
        }])
    ]
})
