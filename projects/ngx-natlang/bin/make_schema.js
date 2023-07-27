#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const args = process.argv.slice(2);
const tjsc = path.join('..', '..', '.bin', 'typescript-json-schema');
const fs = require('fs');

exec(`${path.resolve(__dirname, tjsc)} ${args[0]} * --required`, 
    (error, stdout, stderr) => {

    if (error) {
        console.log(`exec error ${error}`);
        return;
    }

    let raw_schema = JSON.parse(stdout)

    let file_out = `import { ChatCompletionFunctions } from 'openai';\n\n`

    Object.keys(raw_schema['definitions']).forEach(name => {
        let out = {
            name: name,
            parameters: raw_schema['definitions'][name],
        }

        file_out += (`export const ${name}Schema: ChatCompletionFunctions = ${JSON.stringify(out, null, 2)};\n\n`);
    })

    fs.writeFile(args[1], file_out, (err) => {
        if (err) {
            console.log(`Error writing to file ${args[1]}: ${err}`)
        } else {
            console.log(`Schema has been generated in ${args[1]}`)
        }
    })
})