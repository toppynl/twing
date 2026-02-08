import type {TwingSource} from "../source";

export type TwingErrorLocation = {
    line: number;
    column: number;
};

export interface TwingBaseError<Name extends string> extends Error {
    readonly name: Name;
    readonly previous: any | undefined;
    readonly rootMessage: string;
    location: TwingErrorLocation;
    source: TwingSource;
    
    appendMessage(message: string): void;
}

export const createBaseError = <Name extends string>(
    name: Name, message: string, location: TwingErrorLocation, source: TwingSource, previous?: any
): TwingBaseError<Name> => {
    const baseError = Error(message);

    baseError.name = name;

    const error = Object.create(baseError, {
        location: {
            get: () => location
        },
        source: {
            get: () => source
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

        representation += ` in "${source.name}"`;

        const {line, column} = location;

        representation += ` at line ${line}, column ${column}`;

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
