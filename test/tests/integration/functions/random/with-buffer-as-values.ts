import {runTest} from "../../TestBase";
import {iconv} from "../../../../../src/lib/helpers/iconv";

runTest({
    description: '"random" function with buffer as values',
    templates: {
        "index.twig": `
{% set random1 = random(buffer) %}
{{ random1 == "Ä" or random1 == "é" }}
{{ random(emptyBuffer) == "" }}
`
    },
    context: Promise.resolve({
        buffer: Buffer.from('Äé'),
        emptyBuffer: Buffer.from('')
    }),
    expectation: `
1
1
`
});

runTest({
    description: '"random" function with buffer as values against a non UTF-8 runtime',
    templates: {
        "index.twig": `
{% set random1 = random(buffer) %}
{{ random1 == "Ä"|convert_encoding('ISO-8859-1', 'UTF-8') or random1 == "é"|convert_encoding('ISO-8859-1', 'UTF-8') }}
`
    },
    context: Promise.resolve({
        buffer: iconv('UTF-8', 'ISO-8859-1', Buffer.from('Äé')),
    }),
    environmentOptions: {
        charset: 'ISO-8859-1'
    },
    expectation: `
1
`
});
