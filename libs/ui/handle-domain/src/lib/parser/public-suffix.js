const punyCode = require('punycode');
const VALID_HOSTNAME_VALUE = 0;

async function parser(body) {
    const trie = SuffixTrie(
        (body + '')
            .split('\n')
            .map(keepOnlyRules)
            .filter(function (r) {
                return r !== null;
            })
            .map(domainBuilder)
    );

    return trie;
}

const keepOnlyRules = (row) => {
    const trimmed = row.trim();
    if (trimmed.length === 0 || trimmed.indexOf('//') === 0) {
        return null;
    }

    // TODO - Ignore leading or trailing dot

    return trimmed;
};

const domainBuilder = (row) => {
    let rule = {
        exception: false,
        source: null,
        parts: null,
    };

    // Only read line up to the first white-space
    let spaceIndex = row.indexOf(' ');
    if (spaceIndex !== -1) {
        row = row.substr(0, spaceIndex);
    }

    row = punyCode.toASCII(row);

    // Keep track of initial rule
    rule.source = row;

    // Exception
    if (row[0] === '!') {
        row = row.substr(1);
        rule.exception = true;
    }

    rule.parts = row.split('.').reverse();

    return rule;
};

const SuffixTrie = (rules) => {
    this.exceptions = Object.create(null);
    this.rules = Object.create(null);

    if (rules) {
        for (let i = 0; i < rules.length; i += 1) {
            const rule = rules[i];
            if (rule.exception) {
                insertInTrie(rule, this.exceptions);
            } else {
                insertInTrie(rule, this.rules);
            }
        }
    }

    return {
        exceptions: this.exceptions,
        rules: this.rules,
    };
};

const insertInTrie = (rule, trie) => {
    const parts = rule.parts;
    let node = trie;

    for (let i = 0; i < parts.length; i += 1) {
        const part = parts[i];
        let nextNode = node[part];
        if (nextNode === undefined) {
            nextNode = Object.create(null);
            node[part] = nextNode;
        }

        node = nextNode;
    }

    node.$ = VALID_HOSTNAME_VALUE;

    return trie;
};

module.exports = {
    parse: parser,
};
