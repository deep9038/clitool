import fs from 'fs';
import { get } from 'http';
import path from 'path';

const SKIP_DIRS = ['node_modules', '.git', 'dist','build','.next']
const TEXT_EXTENSIONS = ['.ts', '.js', '.json', '.md', '.txt', '.tsx', '.jsx', '.css', '.html', '.env']
const MAX_FILE_SIZE = 50 * 1024; // 50kb

function getFiles(dir:string, prefix=''): string[] {

    const entries = fs.readdirSync(dir, {withFileTypes: true});

    const lines: string[] = [];

    for (const entry of entries){
        if(SKIP_DIRS.includes(entry.name)) continue;

        const fullPath = path.join(dir,entry.name);

        if(entry.isDirectory()){
            lines.push(`${prefix}${entry.name}/`);
            lines.push(...getFiles(fullPath, prefix + '  '));
        } else {
            lines.push(`${prefix}${entry.name}`);
        }
    }
    return lines;
}



function getFileContents(dir: string):string{
    const entries = fs.readdirSync(dir, {withFileTypes:true});
    let result = ''

    for (const entry of entries){
        if(SKIP_DIRS.includes(entry.name)) continue;

        const fullPath = path.join(dir,entry.name);

        if(entry.isDirectory()){
            result += getFileContents(fullPath);
        }else {
            const ext = path.extname(entry.name);
            if(!TEXT_EXTENSIONS.includes(ext)) continue;
            const stats = fs.statSync(fullPath);
            if(stats.size > MAX_FILE_SIZE) continue;
            const content = fs.readFileSync(fullPath, 'utf-8');
            result += `\n--- File: ${fullPath} ---\n${content}\n`;
        }
    }
    return result;
}

export function getProjectContext(dir:string ):string{
    const structure = getFiles(dir).join('\n');
    const contents = getFileContents(dir);
    return `Folder structure:\n${structure}\n\nFile contents:${contents}`;
}


