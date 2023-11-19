import {runTest} from "../../../TestBase";
import {createFunction} from "../../../../../../src/lib/function";

const callable = () => Promise.resolve('<br/>');

runTest({
    description: '"autoescape" tag honors functions safety',
    templates: {
        "index.twig": `
css
{% autoescape "css" %}
    {{ cssSafe() }}
    {{ htmlSafe() }}
    {{ cssAndHtmlSafe() }}
    {{ unsafe() }}
{% endautoescape %}
html
{% autoescape "html" %}
    {{ cssSafe() }}
    {{ htmlSafe() }}
    {{ cssAndHtmlSafe() }}
    {{ unsafe() }}
{% endautoescape %}
false
{% autoescape false %}
    {{ cssSafe() }}
    {{ htmlSafe() }}
    {{ cssAndHtmlSafe() }}
    {{ unsafe() }}
{% endautoescape %}
`
    },
    additionalFunctions: [
        createFunction('cssSafe', callable, [], {
            is_safe: ['css']
        }),
        createFunction('htmlSafe', callable, [], {
            is_safe: ['html']
        }),
        createFunction('cssAndHtmlSafe', callable, [], {
            is_safe: ['css', 'html']
        }),
        createFunction('unsafe', callable, [], {
            is_safe: []
        })
    ],
    trimmedExpectation: `
css
    <br/>
    \\3C br\\2F \\3E 
    <br/>
    \\3C br\\2F \\3E 
html
    &lt;br/&gt;
    <br/>
    <br/>
    &lt;br/&gt;
false
    <br/>
    <br/>
    <br/>
    <br/>
`
})
