#!/usr/bin/env node
import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { ChatOpenAI } from '@langchain/openai';
import ora from 'ora';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getProjectContext } from './readProject.js';
import { HumanMessage,SystemMessage } from '@langchain/core/messages';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const program = new Command();
const llm = new ChatOpenAI({ 
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY
});

program
    .name('glitool')
    .description('A CLI tool for glitool')
    .version('1.0.0');  

program
    .command('hello')
    .description('say hello')
    .argument('<name>', 'name to greet')
    .option('-s, --shout', 'shout it')
    .action((name,option)=>{
        const msg = `Hello, ${name}!`;
        console.log(option.shout ? msg.toUpperCase() : msg);
    })

if (process.argv.length === 2){
    
    const projectContext = getProjectContext(process.cwd());

    while(true){
        const userInput = await input({message: 'Ask Something: '});

        if(userInput.trim() === '/exit'){
            console.log('Bye!');
            process.exit(0);
        }

        const spinner = ora('Thinking...').start();
        const response = await llm.invoke([
            new SystemMessage(`You are a helpful assistant for software developers. Here is the context of the current project:\n\n${projectContext}`),
            new HumanMessage(userInput)
        ]);
        spinner.stop();
        console.log(response.content);
        console.log(); // empty line between responses
    }
}
program.parse(); 