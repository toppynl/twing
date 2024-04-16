import * as tape from 'tape';
import {iconv} from "../../../../../../main/lib/helpers/iconv";

tape('iconv', ({test}) => {
    test('is non destructive', ({same, end}) => {
        same(iconv('ISO-8859-1', 'UTF-8', iconv('UTF-8', 'ISO-8859-1', Buffer.from('Äé'))).toString(), 'Äé');

        end();
    });
});
