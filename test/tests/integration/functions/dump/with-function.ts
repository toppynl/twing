import {runTest} from "../../TestBase";

runTest({
    description: '"dump" function with function',
    templates: {
        "index.twig": `
{{ dump(function) }}
{{ dump(function2) }}
`
    },
    context: Promise.resolve({
        function: () => {
        },
        function2: (value: any) => {
            return value;
        }
    }),
    expectation: `
object(Closure) (0) {}

object(Closure) (0) {}
`
});
