import {runTest} from "../TestBase";
import {TwingNode} from "../../../../main/lib/node";

runTest({
    description: "Supports custom node visitors",
    templates: {
        "index.twig": `foo`
    },
    trimmedExpectation: `foo visited`,
    additionalNodeVisitors: [
        {
            enterNode: (node: TwingNode) => {
                return node;
            },
            leaveNode: (node: TwingNode) => {
                if (node.type === "text") {
                    node.attributes.data = `${node.attributes.data} visited`;
                }

                return node;
            }
        }
    ]
});
