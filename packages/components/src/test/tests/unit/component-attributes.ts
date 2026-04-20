import tape from "tape";
import {ComponentAttributes} from "../../../main/lib";

tape('ComponentAttributes', ({test}) => {
    test('.all() returns a plain object', ({deepEqual, end}) => {
        const attrs = new ComponentAttributes({class: 'btn', id: 'x'});

        deepEqual(attrs.all(), {class: 'btn', id: 'x'});
        end();
    });

    test('.has() and .count()', ({equal, end}) => {
        const attrs = new ComponentAttributes({class: 'btn', id: 'x'});

        equal(attrs.has('class'), true);
        equal(attrs.has('missing'), false);
        equal(attrs.count(), 2);
        end();
    });

    test('.only() keeps listed keys', ({deepEqual, end}) => {
        const attrs = new ComponentAttributes({class: 'btn', id: 'x', foo: 'y'});

        deepEqual(attrs.only('class', 'foo').all(), {class: 'btn', foo: 'y'});
        end();
    });

    test('.without() removes listed keys', ({deepEqual, end}) => {
        const attrs = new ComponentAttributes({class: 'btn', id: 'x', foo: 'y'});

        deepEqual(attrs.without('id').all(), {class: 'btn', foo: 'y'});
        end();
    });

    test('toString() renders scalar attributes with leading space', ({equal, end}) => {
        const attrs = new ComponentAttributes({class: 'btn', id: 'x'});

        equal(attrs.toString(), ' class="btn" id="x"');
        end();
    });

    test('toString() skips false and renders true as bare name', ({equal, end}) => {
        const attrs = new ComponentAttributes({disabled: true, hidden: false, id: 'x'});

        equal(attrs.toString(), ' disabled id="x"');
        end();
    });

    test('toString() converts aria-* true to "true"', ({equal, end}) => {
        const attrs = new ComponentAttributes({'aria-expanded': true});

        equal(attrs.toString(), ' aria-expanded="true"');
        end();
    });

    test('toString() skips nested namespace keys', ({equal, end}) => {
        const attrs = new ComponentAttributes({'header:class': 'hdr', class: 'btn'});

        equal(attrs.toString(), ' class="btn"');
        end();
    });

    test('toString() keeps alpine (x-on:click) syntax', ({equal, end}) => {
        const attrs = new ComponentAttributes({'x-on:click': 'submit'});

        equal(attrs.toString(), ' x-on:click="submit"');
        end();
    });

    test('toString() escapes values needing escape', ({equal, end}) => {
        const attrs = new ComponentAttributes({title: 'He said "hi"'});

        equal(attrs.toString(), ' title="He said &quot;hi&quot;"');
        end();
    });

    test('.render() returns value and hides it from toString', ({equal, end}) => {
        const attrs = new ComponentAttributes({class: 'btn', id: 'x'});

        equal(attrs.render('class'), 'btn');
        equal(attrs.toString(), ' id="x"');
        end();
    });

    test('.defaults() prepends class/data-controller/data-action', ({deepEqual, end}) => {
        const attrs = new ComponentAttributes({class: 'extra', 'data-controller': 'two', id: 'x'});

        deepEqual(
            attrs.defaults({class: 'base', 'data-controller': 'one'}).all(),
            {class: 'base extra', 'data-controller': 'one two', id: 'x'}
        );
        end();
    });

    test('.defaults() does not overwrite existing', ({deepEqual, end}) => {
        const attrs = new ComponentAttributes({id: 'x'});

        deepEqual(
            attrs.defaults({id: 'y', name: 'n'}).all(),
            {id: 'x', name: 'n'}
        );
        end();
    });

    test('.nested() extracts namespaced keys', ({deepEqual, end}) => {
        const attrs = new ComponentAttributes({'header:class': 'hdr', 'footer:id': 'f', id: 'x'});

        deepEqual(attrs.nested('header').all(), {class: 'hdr'});
        end();
    });

    test('is iterable', ({deepEqual, end}) => {
        const attrs = new ComponentAttributes({a: '1', b: '2'});

        deepEqual([...attrs], [['a', '1'], ['b', '2']]);
        end();
    });

    test('render() with aria-* boolean true', ({equal, end}) => {
        const attrs = new ComponentAttributes({'aria-expanded': true});

        equal(attrs.render('aria-expanded'), 'true');
        end();
    });
});
