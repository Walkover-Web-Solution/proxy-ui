interface KeyValue {
    [key: string]: string | number;
}
interface Rules {
    exceptions: KeyValue;
    rules: KeyValue;
}

export const hasTld = (rules: Rules, value: string) => {
    // All TLDs are at the root of the Trie.
    return rules.rules[value] !== undefined;
};

export const extractTldFromHost = (hostname: string): string => {
    const lastDotIndex = hostname.lastIndexOf('.');
    if (lastDotIndex === -1) {
        return null;
    }

    return hostname.substr(lastDotIndex + 1);
};

export const extractDomainWithSuffix = (hostname: string, publicSuffix: string): string => {
    // Locate the index of the last '.' in the part of the `hostname` preceding
    // the public suffix.
    //
    // examples:
    //   1. not.evil.co.uk  => evil.co.uk
    //         ^    ^
    //         |    | start of public suffix
    //         | index of the last dot
    //
    //   2. example.co.uk   => example.co.uk
    //     ^       ^
    //     |       | start of public suffix
    //     |
    //     | (-1) no dot found before the public suffix
    const publicSuffixIndex = hostname.length - publicSuffix.length - 2;
    const lastDotBeforeSuffixIndex = hostname.lastIndexOf('.', publicSuffixIndex);

    // No '.' found, then `hostname` is the general domain (no sub-domain)
    if (lastDotBeforeSuffixIndex === -1) {
        return hostname;
    }

    // Extract the part between the last '.'
    return hostname.substr(lastDotBeforeSuffixIndex + 1);
};

export const suffixLookup = (rules, hostname): string | null => {
    const parts = hostname.split('.');

    // Look for a match in rules
    const publicSuffixIndex = lookupInTrie(parts, rules.rules, parts.length - 1);

    if (publicSuffixIndex === null) {
        return null;
    }

    // Look for exceptions
    const exceptionIndex = lookupInTrie(parts, rules.exceptions, parts.length - 1);

    if (exceptionIndex !== null) {
        return parts.slice(exceptionIndex + 1).join('.');
    }

    return parts.slice(publicSuffixIndex).join('.');
};

// recursively check in provided rule and adjust index.
export const lookupInTrie = (parts, trie, index: number): number => {
    let part: any;
    let nextNode: any;
    let publicSuffixIndex = null;

    // We have a match!
    if (trie?.$ !== undefined) {
        publicSuffixIndex = index + 1;
    }

    // No more `parts` to look for
    if (index === -1) {
        return publicSuffixIndex;
    }

    // eslint-disable-next-line prefer-const
    part = parts[index];

    // Check branch corresponding to next part of hostname
    nextNode = trie[part];
    if (nextNode !== undefined) {
        publicSuffixIndex = minIndex(publicSuffixIndex, lookupInTrie(parts, nextNode, index - 1));
    }

    // Check wildcard branch
    nextNode = trie['*'];
    if (nextNode !== undefined) {
        publicSuffixIndex = minIndex(publicSuffixIndex, lookupInTrie(parts, nextNode, index - 1));
    }

    return publicSuffixIndex;
};

export const minIndex = (a, b) => {
    if (a === null) {
        return b;
    } else if (b === null) {
        return a;
    }

    return a < b ? a : b;
};
