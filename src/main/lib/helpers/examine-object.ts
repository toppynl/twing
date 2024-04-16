export const examineObject = (object: any): Array<any> => {
    let properties: Array<any> = [];

    if (object) {
        for (const property of Object.getOwnPropertyNames(object)) {
            properties.push(property);
        }

        let prototype = Object.getPrototypeOf(object);

        properties = properties.concat(examineObject(prototype));
    }

    return properties;
};
