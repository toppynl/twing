import {runTest} from "../../TestBase";
import {createFilter} from "../../../../../src/lib/filter";

runTest({
    description: '"call" expression with output buffer only',
    additionalFilters: [
        createFilter('foo', (outputBuffer, operand) => {
            return Promise.resolve(`${operand} + ${outputBuffer ? 'ok' : 'ko'}`);
        }, [], {
            needs_output_buffer: true
        })
    ],
    templates: {
        'index.twig': '{{ 5|foo() }}'
    },
    expectation: '5 + ok'
});
