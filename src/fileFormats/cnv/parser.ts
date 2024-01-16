import {structureDefinitions} from "./types";

export type CNV = { [key: string]: any }

const splitOnce = (text: string, separator: string) => {
    const index = text.indexOf(separator);
    return [text.substring(0, index), text.substring(index + 1)];
};

export const parseCNV = (content: string) => {
    const lines = content.split('\n');
    const objects: CNV = {};

    for (const line of lines) {
        // Ignore comments and empty lines
        if (line.startsWith('#') || line.trim() === '') {
            continue;
        }

        let [key, value] = splitOnce(line, '=');
        // Check if value is empty
        if (value === '""') {
            value = '';
        }

        if (key === 'OBJECT') {
            objects[value] = {};
        } else {
            const [objectName, variable] = splitOnce(key, ':');

            if ('TYPE' in objects[objectName] && objects[objectName]['TYPE'] in structureDefinitions && variable in structureDefinitions[objects[objectName]['TYPE']]) {
                objects[objectName][variable] = structureDefinitions[objects[objectName]['TYPE']][variable](value);
            } else {
                objects[objectName][variable] = value;
            }
        }
    }

    return objects;
}
