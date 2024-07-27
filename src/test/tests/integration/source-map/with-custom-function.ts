import {runTest} from "../TestBase";
import {createFunction} from "../../../../main/lib";
import {createSynchronousFunction} from "../../../../main/lib/function";

runTest({
    description: "Source map supports custom function",
    additionalFunctions: [
        createFunction('foo', () => Promise.resolve('foo'), [])
    ],
    additionalSynchronousFunctions: [
        createSynchronousFunction('foo', () => 'foo', [])
    ],
    templates: {
        "index.twig": `{{ foo() }}`
    },
    expectation: 'foo',
    expectedSourceMapMappings: [
        {source: 'index.twig', generatedLine: 1, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'print'}
    ]
});
