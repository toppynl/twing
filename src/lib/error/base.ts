import {Source} from "../source";

export interface TwingBaseError<Name extends string> extends Error {
    readonly messageWithLocation: string;

    appendMessage(message: string): void;
}

export class TwingBaseError<Name extends string> extends Error {
    readonly previous: any | undefined;

    line: number | undefined;
    source: Source | undefined;

    constructor(name: Name, message: string, line?: number, source?: Source, previous?: any) {
        super(message);
        
        super.name = name;
        
        let representation = message;

        Object.defineProperty(this, "source", {
            get: () => source,
            set: (value: Source) => {
                source = value;

                updateRepresentation();
            },
            enumerable: false
        });
        
        Object.defineProperty(this, "line", {
            get: () => line,
            set: (value: number) => {
                line = value;

                updateRepresentation();
            },
            enumerable: false
        });
        
        Object.defineProperty(this, "messageWithLocation", {
            get: () => representation,
            enumerable: false
        });
        
        Object.defineProperty(this, "previous", {
            get: () => previous,
            enumerable: false
        });
        
        Object.defineProperty(this, "appendMessage", {
            get: () => (value: string) => {
                message += value;
                
                updateRepresentation();
            },
            enumerable: false
        });
        
        Object.defineProperty(this, "toString", {
            get: () => () => {
                return `${name}: ${representation}`;
            },
            enumerable: false
        });

        const updateRepresentation = () => {
            representation = message;

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
                representation += ` in "${source.name}"`;
            }

            if (line !== undefined) {
                representation += ` at line ${line}`;
            }

            if (dot) {
                representation += '.';
            }

            if (questionMark) {
                representation += '?';
            }
        };

        updateRepresentation();
    }
}
