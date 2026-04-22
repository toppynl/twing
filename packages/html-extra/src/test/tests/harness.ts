import tape, {Test} from "tape";
import {
    createArrayLoader,
    createEnvironment,
    createSynchronousArrayLoader,
    createSynchronousEnvironment
} from "@toppynl/twing";
import {createHtmlExtension, createSynchronousHtmlExtension} from "../../main/lib";

export type HarnessCase = {
    description: string;
    template: string;
    expectation?: string;
    trimmedExpectation?: string;
    context?: Record<string, unknown>;
    expectedErrorMessage?: string;
};

export const runCase = ({
    description,
    template,
    expectation,
    trimmedExpectation,
    context,
    expectedErrorMessage
}: HarnessCase) => {
    tape(description, ({test}) => {
        test('asynchronously', async ({fail, equal, end}: Test) => {
            const loader = createArrayLoader({'index.twig': template});
            const environment = createEnvironment(loader);
            environment.addExtension(createHtmlExtension());

            try {
                const actual = await environment.render('index.twig', context || {});

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
            const loader = createSynchronousArrayLoader({'index.twig': template});
            const environment = createSynchronousEnvironment(loader);
            environment.addExtension(createSynchronousHtmlExtension());

            try {
                const actual = environment.render('index.twig', context || {});

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
