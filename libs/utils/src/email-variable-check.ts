import {
    CONTENT_BETWEEEN_HASH_TAG_REGEX,
    ALPHANUMERIC_WITH_DASH_CAPS_AND_STARTS_WITH_ALPHABET_REGEX,
} from '@proxy/regex';

/**
 * Checks Variables contains only alphanumeric, dashes, underscores and and must start withalphabet only
 *
 * @param value string
 * @returns string[]
 */
export function getInvalidEmailVariables(value: string): string[] {
    if (value) {
        const matches = value?.match(new RegExp(CONTENT_BETWEEEN_HASH_TAG_REGEX, 'gm'));
        if (matches?.length) {
            return matches.filter(
                (value) =>
                    !value
                        .replace(CONTENT_BETWEEEN_HASH_TAG_REGEX, '$1')
                        .match(ALPHANUMERIC_WITH_DASH_CAPS_AND_STARTS_WITH_ALPHABET_REGEX)
            );
        }
    }
    return [];
}

/**
 * Checks Variables min length
 *
 * @param value string
 * @returns boolean
 */
export function minVariableLengthCheck(value: string): boolean {
    if (value && value?.match(new RegExp(CONTENT_BETWEEEN_HASH_TAG_REGEX, 'gm'))?.find((value) => value === '####')) {
        return false;
    }
    return true;
}

/**
 * Checks Variables max length
 *
 * @param value string
 * @returns string[]
 */
export function maxVariableLengthCheck(value: string): string[] {
    if (value) {
        const matches = value?.match(new RegExp(CONTENT_BETWEEEN_HASH_TAG_REGEX, 'gm'));
        if (matches?.length) {
            return matches.filter((value) => value.replace(CONTENT_BETWEEEN_HASH_TAG_REGEX, '$1').length > 32);
        }
    }
    return [];
}
