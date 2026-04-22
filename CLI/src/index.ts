#!/usr/bin/env node
import { Command } from 'commander';
import { input } from '@inquirer/prompts';
import { ChatOpenAI } from '@langchain/openai';
import ora from 'ora';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { BaseMessage, HumanMessage,SystemMessage, ToolMessage } from '@langchain/core/messages';
import { readProjectTool, writeFileTool } from './tools/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const program = new Command();
const llm = new ChatOpenAI({ 
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY
});

const llmWithTools = llm.bindTools([readProjectTool,writeFileTool]);

const messages: BaseMessage[] =  [
    new SystemMessage('You are a helpful assistant for software developers.'),
]

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
    

    while(true){

        const userInput = await input({message: 'Ask Something: '});

        if(userInput.trim() === '/exit'){
            console.log('Bye!');
            process.exit(0);
        }


        messages.push(new HumanMessage(userInput));
        const spinner = ora('Thinking...').start();
        while(true){
            const response = await llmWithTools.invoke(messages);
            messages.push(response);

            if(response.tool_calls && response.tool_calls.length > 0){
                for(const toolCall of response.tool_calls){
                    console.log('Invoking tool:', toolCall.name);
                    spinner.text = `Running tool: ${toolCall.name}...`;
                    try{

                        let result;

                        if(toolCall.name === 'readProject') result = await readProjectTool.invoke(toolCall);
                        if(toolCall.name === 'writeFile') result = await writeFileTool.invoke(toolCall);
                        messages.push(new ToolMessage({
                            tool_call_id: toolCall.id ?? '',
                            content:  typeof result === 'string' ? result : JSON.stringify(result)
                        }));
                    } catch (error) {
                        spinner.stop();
                        console.error('Tool error:',error);
                        break
                    }
                }
            }else {
                spinner.stop();  
                console.log('\nAssistant:', response.content,'\n');
                break;
            }
        }
    }
}
program.parse(); 