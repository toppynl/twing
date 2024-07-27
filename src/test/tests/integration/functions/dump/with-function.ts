import {runTest} from "../../TestBase";

runTest({
    description: '"dump" function with function',
    templates: {
        "index.twig": `
{{ dump(function) }}
{{ dump(function2) }}
`
    },
    context: {
        function: () => {
        },
        function2: (value: any) => {
            return value;
        }
    },
    trimmedExpectation: `
object(Closure) (0) {}

object(Closure) (0) {}
`
});
