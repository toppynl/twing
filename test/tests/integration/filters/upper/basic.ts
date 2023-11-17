import {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../src/lib/markup";

runTest({
    description: '"upper" filter',
    templates: {
        "index.twig": `
{{ "FoO"|upper }}
{{ markup|upper }}
`
    },
    expectation: `
FOO
FOO
`,
    context: Promise.resolve({
        markup: createMarkup(('FoO'), "UTF-8")
    })
});
