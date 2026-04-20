import tape from "tape";
import {packageName} from "../../main/lib";

tape('@toppynl/twing-html-extra scaffold', ({equal, end}) => {
    equal(packageName, "@toppynl/twing-html-extra", "package exports its own name");
    end();
});
