import {runTest} from "../TestBase";

runTest({
    description: "Supports custom node visitors",
    templates: {
        "index.twig": `foo`
    },
    trimmedExpectation: `foo visited`,
    additionalNodeVisitors: [
        {
            enterNode: (node) => {
                return node;
            },
            leaveNode: (node) => {
                if (node.is("text")) {
                    node.attributes.data = `${node.attributes.data} visited`;
                }
                
                return node;
            }
        }
    ]
});
