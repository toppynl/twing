import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Animal {}
class Dog extends Animal {}

class Test extends TestBase {
    getDescription() {
        return '"instanceof" test';
    }

    getTemplates() {
        return {
            'index.twig': `{{ dog is instanceof(Animal) ? 'ok' : 'ko' }}
{{ dog is instanceof(Dog) ? 'ok' : 'ko' }}
{{ dog is instanceof(String) ? 'ko' : 'ok' }}`
        };
    }

    getExpected() {
        return `ok
ok
ok`;
    }

    getContext() {
        return {
            dog: new Dog(),
            Animal,
            Dog,
            String
        };
    }
}

runTest(createIntegrationTest(new Test));
