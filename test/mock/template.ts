import {createBaseTemplate, TwingTemplate} from "../../src/lib/template";
import {MockLoader} from "./loader";
import {TwingSource} from "../../src/lib/source";
import {createMockedEnvironment} from "./environment";

export const createMockTemplate = (
    runtime?: Runtime,
    source?: TwingSource
): TwingTemplate => {
    if (!runtime) {
        runtime = createMockedEnvironment(new MockLoader());
    }

    if (!source) {
        source = new TwingSource('', 'foo.html.twig');
    }

    return Object.assign<TwingTemplate, Partial<TwingTemplate>>(createBaseTemplate(env, source, new Map(), new Map()), {
        doDisplay: () => Promise.resolve()
    });
};
