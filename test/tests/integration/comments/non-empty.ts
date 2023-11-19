import {runTest} from "../TestBase";

runTest({
    description: "Empty comment",
    templates: {
        "index.twig": '{# I am Comment #}'
    },
    expectation: ''
});
