import * as tape from "tape";
import {createParser} from "../../../helpers/parser";

tape('TwingParser::getVarName', ({same, end}) => {
    const parser = createParser();

    same(parser.getVarName(), '__internal_0');
    same(parser.getVarName(), '__internal_1');
    same(parser.getVarName(), '__internal_2');
    same(parser.getVarName('foo'), 'foo3');
    same(parser.getVarName('bar'), 'bar4');
    end();
});
