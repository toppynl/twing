export type ErrorLocation = {
    line: number;
    column: number;
};

export interface TwingBaseError<Name extends string> extends Error {
    readonly name: Name;
    readonly previous: any | undefined;
    readonly rootMessage: string;
    location: ErrorLocation | undefined;
    source: string | undefined;
    
    appendMessage(message: string): void;
}

export const createBaseError = <Name extends string>(
    name: Name, message: string, location?: ErrorLocation, source?: string, previous?: any
): TwingBaseError<Name> => {
    const baseError = Error(message);

    baseError.name = name;

    const error = Object.create(baseError, {
        location: {
            get: () => location,
            set: (value: ErrorLocation) => {
                location = value;

                updateRepresentation();
            }
        },
        source: {
            get: () => source,
            set: (value: string) => {
                source = value;

                updateRepresentation();
            }
        },
        previous: {
            value: previous
        },
        rootMessage: {
            value: message
        },
        appendMessage: {
            value: (value: string) => {
                message += value;

                updateRepresentation();
            }
        }
    });

    const updateRepresentation = () => {
        let representation = message;

        let dot = false;

        if (representation.slice(-1) === '.') {
            representation = representation.slice(0, -1);
            dot = true;
        }

        let questionMark = false;

        if (representation.slice(-1) === '?') {
            representation = representation.slice(0, -1);
            questionMark = true;
        }

        if (source) {
            representation += ` in "${source}"`;
        }

        if (location !== undefined) {
            const {line, column} = location;
            
            representation += ` at line ${line}, column ${column}`;
        }

        if (dot) {
            representation += '.';
        }

        if (questionMark) {
            representation += '?';
        }
        
        baseError.message = representation;
    };

    updateRepresentation();

    Error.captureStackTrace(error, createBaseError);

    return error;
}
