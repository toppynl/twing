import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions} from "../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"trim" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ "  I like Twig.  "|trim }}
{{ text|trim }}
{{ "  foo/"|trim("/") }}
{{ "xxxI like Twig.xxx"|trim(character_mask="x", side="left") }}
{{ "xxxI like Twig.xxx"|trim(side="right", character_mask="x") }}
{{ "xxxI like Twig.xxx"|trim("x", "right") }}
{{ "/  foo/"|trim("/", "left") }}
{{ "/  foo/"|trim(character_mask="/", side="left") }}
{{ "  do nothing.  "|trim("", "right") }}`
        };
    }

    getExpected() {
        return `
I like Twig.
If you have some &lt;strong&gt;HTML&lt;/strong&gt; it will be escaped.
  foo
I like Twig.xxx
xxxI like Twig.
xxxI like Twig.
  foo/
  foo/
  do nothing.
`;
    }

    getContext() {
        return {
            text: '  If you have some <strong>HTML</strong> it will be escaped.  ',
        }
    }
    
    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            escapingStrategy: 'html'
        }
    }
}

runTest(createIntegrationTest(new Test()));
