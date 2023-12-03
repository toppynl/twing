import TestBase from "../../TestBase";

export default class extends TestBase {
    getDescription() {
        return '"sort" filter with arrow parameter';
    }

    getTemplates() {
        return {
            'index.twig': `{{ [5, 3, 4]|sort((a, b) => b <=> a)|join() }}`
        };
    }

    getExpected() {
        return `543`;
    }
}
