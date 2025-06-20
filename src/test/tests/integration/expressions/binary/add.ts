import {runTest} from "../../TestBase";

runTest({
    description: 'add with a string literal as left operand',
    templates: {
        'index.twig': `{{ "foo" + 5 }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: Unsupported operand type "string" in "index.twig" at line 1, column 4'
});

runTest({
    description: 'add with a string value as left operand',
    templates: {
        'index.twig': `{{ foo + 5 }}`
    },
    context: {
        foo: 'foo'
    },
    expectedErrorMessage: 'TwingRuntimeError: Unsupported operand type "string" in "index.twig" at line 1, column 4'
});

runTest({
    description: 'add with a string literal as right operand',
    templates: {
        'index.twig': `{{ 5 + "foo" }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: Unsupported operand type "string" in "index.twig" at line 1, column 8'
});

runTest({
    description: 'add with a string value as right operand',
    templates: {
        'index.twig': `{{ 5 + foo }}`
    },
    context: {
      foo: 'foo'  
    },
    expectedErrorMessage: 'TwingRuntimeError: Unsupported operand type "string" in "index.twig" at line 1, column 8'
});
