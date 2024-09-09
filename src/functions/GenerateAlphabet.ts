export default function generateAlphabets(start: string, end: string): Array<string> {
    const result = [];
    const startCode = getAlphabetCode(start.toUpperCase());
    const endCode = getAlphabetCode(end.toUpperCase());

    for (let code = startCode; code <= endCode; code++) {
        result.push(getAlphabetFromCode(code));
    }

    return result;
}

function getAlphabetCode(str: string): number {
    let code = 0;
    for (let i = 0; i < str.length; i++) {
        code = code * 26 + (str.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return code;
}

export function getAlphabetFromCode(code: number): string {
    let str = '';
    while (code > 0) {
        code--;
        str = String.fromCharCode(code % 26 + 'A'.charCodeAt(0)) + str;
        code = Math.floor(code / 26);
    }
    return str;
}
