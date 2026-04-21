import type {TwingTagHandler} from "@toppynl/twing";
import {createPropsNode, type PropDefaults} from "../node/props";

export const createPropsTagHandler = (): TwingTagHandler => {
    const tag = "props";

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const names: Array<string> = [];
                const defaults: PropDefaults = {};

                while (!stream.test("TAG_END")) {
                    const nameToken = stream.expect("NAME");
                    const propName = nameToken.value;

                    names.push(propName);

                    if (stream.nextIf("OPERATOR", "=")) {
                        defaults[propName] = parser.parseExpression(stream);
                    }

                    if (!stream.nextIf("PUNCTUATION", ",")) {
                        break;
                    }
                }

                stream.expect("TAG_END");

                return createPropsNode(names, defaults, line, column, tag);
            };
        }
    };
};
