import {runTest} from "../TestBase";

for (const value of ['true', 'false', 'null', 'none']) {
    runTest({
        description: `An error is throw when an assignment targets the "${value}" primitive`,
        templates: {
            "index.twig": `{% set ${value} = 5 %}`
        },
        expectedErrorMessage: `TwingParsingError: You cannot assign a value to "${value}" in "index.twig" at line 1, column 8.`
    });
}
