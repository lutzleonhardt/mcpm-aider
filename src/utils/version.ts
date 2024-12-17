import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packagePath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

export const version: string = packageJson.version;
