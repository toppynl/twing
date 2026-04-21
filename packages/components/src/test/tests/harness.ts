import tape, {Test} from "tape";
import {
    createArrayLoader,
    createEnvironment,
    createSynchronousArrayLoader,
    createSynchronousEnvironment
} from "@toppynl/twing";
import {createHtmlExtraExtension, createSynchronousHtmlExtraExtension} from "@toppynl/twing-html-extra";
import {
    createComponentsExtension,
    createSynchronousComponentsExtension,
    wrapLoaderWithPreLexer,
    wrapSynchronousLoaderWithPreLexer
} from "../../main/lib";

export type HarnessCase = {
    description: string;
    template?: string;
    templates?: Record<string, string>;
    mainTemplate?: string;
    expectation?: string;
    trimmedExpectation?: string;
    context?: Record<string, unknown>;
    expectedErrorMessage?: string;
    preLex?: boolean;
};

export const runCase = ({
    description,
    template,
    templates,
    mainTemplate = 'index.twig',
    expectation,
    trimmedExpectation,
    context,
    expectedErrorMessage,
    preLex
}: HarnessCase) => {
    const resolvedTemplates = templates ?? (template !== undefined ? {[mainTemplate]: template} : {});

    tape(description, ({test}) => {
        test('asynchronously', async ({fail, equal, end}: Test) => {
            let loader = createArrayLoader(resolvedTemplates);

            if (preLex) {
                loader = wrapLoaderWithPreLexer(loader);
            }

            const environment = createEnvironment(loader);
            environment.addExtension(createHtmlExtraExtension());
            environment.addExtension(createComponentsExtension());

            try {
                const actual = await environment.render(mainTemplate, context || {});

                if (expectedErrorMessage) {
                    fail(`${description}: should throw`);
                } else if (expectation !== undefined) {
                    equal(actual, expectation, `${description}: renders as expected`);
                } else if (trimmedExpectation !== undefined) {
                    equal(actual.trim(), trimmedExpectation.trim(), `${description}: trimmed`);
                }
            } catch (error: any) {
                if (expectedErrorMessage) {
                    equal(`${error.name}: ${error.message}`, expectedErrorMessage, `${description}: throws`);
                } else {
                    fail(`${description}: threw unexpected error: ${error.message}`);
                }
            }

            end();
        });

        test('synchronously', ({fail, equal, end}: Test) => {
            let loader = createSynchronousArrayLoader(resolvedTemplates);

            if (preLex) {
                loader = wrapSynchronousLoaderWithPreLexer(loader);
            }

            const environment = createSynchronousEnvironment(loader);
            environment.addExtension(createSynchronousHtmlExtraExtension());
            environment.addExtension(createSynchronousComponentsExtension());

            try {
                const actual = environment.render(mainTemplate, context || {});

                if (expectedErrorMessage) {
                    fail(`${description}: should throw`);
                } else if (expectation !== undefined) {
                    equal(actual, expectation, `${description}: renders as expected`);
                } else if (trimmedExpectation !== undefined) {
                    equal(actual.trim(), trimmedExpectation.trim(), `${description}: trimmed`);
                }
            } catch (error: any) {
                if (expectedErrorMessage) {
                    equal(`${error.name}: ${error.message}`, expectedErrorMessage, `${description}: throws`);
                } else {
                    fail(`${description}: threw unexpected error: ${error.message}`);
                }
            }

            end();
        });
    });
};
