import {runTest} from "../TestBase";
import {createFunction} from "../../../../src/lib";

runTest({
    description: "Source map supports custom function",
    additionalFunctions: [
        createFunction('foo', () => Promise.resolve('foo'), [])
    ],
    templates: {
        "index.twig": `{{ foo() }}`
    },
    expectation: 'foo',
    expectedSourceMapMappings: [
        {source: 'index.twig', generatedLine: 1, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'print'}
    ]
});
