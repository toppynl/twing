import {runTest} from "../../TestBase";
import {iconv} from "../../../../../main/lib/helpers/iconv";

runTest({
    description: '"random" function with buffer as values',
    templates: {
        "index.twig": `
{% set random1 = random(buffer) %}
{{ random1 == "Ä" or random1 == "é" }}
{{ random(emptyBuffer) == "" }}
`
    },
    context: {
        buffer: Buffer.from('Äé').toString(),
        emptyBuffer: Buffer.from('').toString()
    },
    trimmedExpectation: `
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
    context: {
        buffer: iconv('UTF-8', 'ISO-8859-1', Buffer.from('Äé')).toString(),
    },
    environmentOptions: {
        charset: 'ISO-8859-1'
    },
    synchronousEnvironmentOptions: {
        charset: 'ISO-8859-1'
    },
    trimmedExpectation: `
1
`
});
