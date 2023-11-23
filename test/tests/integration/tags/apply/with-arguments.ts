import {runTest} from "../../TestBase";
import {createFilter} from "../../../../../src/lib/filter";

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
        createFilter('append', (operand: any, index: number) => {
            return Promise.resolve(`${operand} ${index}`);
        }, [{
            name: 'index'
        }])
    ]
})
