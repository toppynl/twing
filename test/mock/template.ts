import {AnEnvironment} from "../../src/lib/environment";
import {MockEnvironment} from "./environment";
import {TwingTemplate} from "../../src/lib/template";
import {MockLoader} from "./loader";
import {TwingSource} from "../../src/lib/source";

export class MockTemplate extends TwingTemplate {
    protected _mySource: TwingSource;

    constructor(env?: AnEnvironment, source?: TwingSource) {
        if (!env) {
            env = new MockEnvironment(new MockLoader());
        }

        super(env);

        if (!source) {
            source = new TwingSource('', 'foo.html.twig');
        }

        this._mySource = source;
    }

    get source() {
        return this._mySource;
    }

    doDisplay(): Promise<void> {
        return Promise.resolve();
    }
}
