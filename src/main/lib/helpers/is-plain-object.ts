const _isPlainObject = require('is-plain-object');

export function isPlainObject(thing: any): thing is Record<string, any> {
    return _isPlainObject(thing);
}
