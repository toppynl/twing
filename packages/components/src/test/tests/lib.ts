import tape from "tape";
import {packageName} from "../../main/lib";

tape('@toppynl/twing-components scaffold', ({equal, end}) => {
    equal(packageName, "@toppynl/twing-components", "package exports its own name");
    end();
});
