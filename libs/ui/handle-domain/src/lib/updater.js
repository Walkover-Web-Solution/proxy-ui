// for the purpose of update rules.json file(which manage public suffix name in trie).

const join = require('path').join;
const http = require('https');
const fs = require('fs');

const providerUrl = 'https://publicsuffix.org/list/effective_tld_names.dat';
const { parse } = require('./parser/public-suffix.js');

function build() {
    let req = http
        .get(providerUrl, async (res) => {
            let body = '';

            if (res.statusCode !== 200) {
                res.destroy();
                return new Error(`${providerUrl}: remote server responded with HTTP status ` + res.statusCode);
            }

            res.setEncoding('utf8');

            res.on('data', function (d) {
                body += d;
            });

            res.on('end', function () {
                const filename = 'rules.json';
                parse(body)
                    .then((res) => {
                        fs.writeFile(join(__dirname, './', filename), JSON.stringify(res), 'utf-8', () => {
                            console.log('file write successfully.');
                        });
                    })
                    .catch((err) => {
                        console.log('err', err);
                    });
            });
        })
        .on('error', (err) => {
            console.log('Error: updater.js' + err.message);
        });

    req.setTimeout(5000);
    req.on('error', (error) => console.log(error));
    req.end();
}

build();
