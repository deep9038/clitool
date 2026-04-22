import {tool} from "@langchain/core/tools";
import fs from 'fs';
import path from 'path';
import {z} from 'zod';


export const writeFileTool = tool(
    async ({filePath,content})=>{
        const fullPath = path.resolve(process.cwd(),filePath);
        fs.mkdirSync(path.dirname(fullPath),{recursive:true});
        fs.writeFileSync(fullPath,content,'utf-8');
        return `File Written: ${fullPath}`
    },
    {
        name:'writeFile',
        description:'Create or overwrite a file with the given content. Use this to write code.',
        schema: z.object({
            filePath: z.string().describe('relative path to the file'),
            content: z.string().describe('full content to write to the file')
        })
    }
);
