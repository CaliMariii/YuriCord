/*
 * Yuricord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { access, readFile } from "fs/promises";
import { join, sep } from "path";
import { normalize as posixNormalize, sep as posixSep } from "path/posix";
import { createSourceFile, isArrayLiteralExpression, isCallExpression, isExportAssignment, isIdentifier, isObjectLiteralExpression, isPropertyAccessExpression, isPropertyAssignment, isSatisfiesExpression, isStringLiteral, isVariableStatement, ScriptTarget, SyntaxKind } from "typescript";
import { getPluginTarget } from "./utils.mjs";
const devs = {};
function getName(node) {
    return node.name && isIdentifier(node.name) ? node.name.text : undefined;
}
function hasName(node, name) {
    return getName(node) === name;
}
function getObjectProp(node, name) {
    const prop = node.properties.find(p => hasName(p, name));
    if (prop && isPropertyAssignment(prop))
        return prop.initializer;
    return prop;
}
function parseDevs() {
    const file = createSourceFile("constants.ts", readFileSync("src/utils/constants.ts", "utf8"), ScriptTarget.Latest);
    for (const child of file.getChildAt(0).getChildren()) {
        if (!isVariableStatement(child))
            continue;
        const devsDeclaration = child.declarationList.declarations.find(d => hasName(d, "Devs"));
        if (!devsDeclaration?.initializer || !isCallExpression(devsDeclaration.initializer))
            continue;
        const value = devsDeclaration.initializer.arguments[0];
        if (!isSatisfiesExpression(value) || !isObjectLiteralExpression(value.expression))
            throw new Error("Failed to parse devs: not an object literal");
        for (const prop of value.expression.properties) {
            const name = prop.name.text;
            const value = isPropertyAssignment(prop) ? prop.initializer : prop;
            if (!isObjectLiteralExpression(value))
                throw new Error(`Failed to parse devs: ${name} is not an object literal`);
            devs[name] = {
                name: getObjectProp(value, "name").text,
                id: getObjectProp(value, "id").text.slice(0, -1)
            };
        }
        return;
    }
    throw new Error("Could not find Devs constant");
}
async function parseFile(fileName) {
    const file = createSourceFile(fileName, await readFile(fileName, "utf8"), ScriptTarget.Latest);
    const fail = (reason) => {
        return new Error(`Invalid plugin ${fileName}, because ${reason}`);
    };
    for (const node of file.getChildAt(0).getChildren()) {
        if (!isExportAssignment(node) || !isCallExpression(node.expression))
            continue;
        const call = node.expression;
        if (!isIdentifier(call.expression) || call.expression.text !== "definePlugin")
            continue;
        const pluginObj = node.expression.arguments[0];
        if (!isObjectLiteralExpression(pluginObj))
            throw fail("no object literal passed to definePlugin");
        const data = {
            hasPatches: false,
            hasCommands: false,
            enabledByDefault: false,
            required: false,
            tags: []
        };
        for (const prop of pluginObj.properties) {
            const key = getName(prop);
            const value = isPropertyAssignment(prop) ? prop.initializer : prop;
            switch (key) {
                case "name":
                case "description":
                    if (!isStringLiteral(value))
                        throw fail(`${key} is not a string literal`);
                    data[key] = value.text;
                    break;
                case "patches":
                    data.hasPatches = true;
                    break;
                case "commands":
                    data.hasCommands = true;
                    break;
                case "authors":
                    if (!isArrayLiteralExpression(value))
                        throw fail("authors is not an array literal");
                    data.authors = value.elements.map(e => {
                        if (!isPropertyAccessExpression(e))
                            throw fail("authors array contains non-property access expressions");
                        const d = devs[getName(e)];
                        if (!d)
                            throw fail(`couldn't look up author ${getName(e)}`);
                        return d;
                    });
                    break;
                case "tags":
                    if (!isArrayLiteralExpression(value))
                        throw fail("tags is not an array literal");
                    data.tags = value.elements.map(e => {
                        if (!isStringLiteral(e))
                            throw fail("tags array contains non-string literals");
                        return e.text;
                    });
                    break;
                case "dependencies":
                    if (!isArrayLiteralExpression(value))
                        throw fail("dependencies is not an array literal");
                    const { elements } = value;
                    if (elements.some(e => !isStringLiteral(e)))
                        throw fail("dependencies array contains non-string elements");
                    data.dependencies = elements.map(e => e.text);
                    break;
                case "required":
                case "enabledByDefault":
                    data[key] = value.kind === SyntaxKind.TrueKeyword;
                    break;
            }
        }
        if (!data.name || !data.description || !data.authors)
            throw fail("name, description or authors are missing");
        const target = getPluginTarget(fileName);
        if (target) {
            if (!["web", "discordDesktop", "YuricordDesktop", "desktop", "dev"].includes(target))
                throw fail(`invalid target ${target}`);
            data.target = target;
        }
        data.filePath = posixNormalize(fileName)
            .split(sep)
            .join(posixSep)
            .replace(/\/index\.([jt]sx?)$/, "")
            .replace(/^src\/plugins\//, "");
        let readme = "";
        try {
            readme = readFileSync(join(fileName, "..", "README.md"), "utf-8");
        }
        catch { }
        return [data, readme];
    }
    throw fail("no default export called 'definePlugin' found");
}
async function getEntryPoint(dir, dirent) {
    const base = join(dir, dirent.name);
    if (!dirent.isDirectory())
        return base;
    for (const name of ["index.ts", "index.tsx"]) {
        const full = join(base, name);
        try {
            await access(full);
            return full;
        }
        catch { }
    }
    throw new Error(`${dirent.name}: Couldn't find entry point`);
}
function isPluginFile({ name }) {
    if (name === "index.ts")
        return false;
    return !name.startsWith("_") && !name.startsWith(".");
}
(async () => {
    parseDevs();
    const plugins = [];
    const readmes = {};
    await Promise.all(["src/plugins", "src/plugins/_core"].flatMap(dir => readdirSync(dir, { withFileTypes: true })
        .filter(isPluginFile)
        .map(async (dirent) => {
        const [data, readme] = await parseFile(await getEntryPoint(dir, dirent));
        plugins.push(data);
        if (readme)
            readmes[data.name] = readme;
    })));
    const data = JSON.stringify(plugins);
    if (process.argv.length > 3) {
        writeFileSync(process.argv[2], data);
        writeFileSync(process.argv[3], JSON.stringify(readmes));
    }
    else {
        console.log(data);
    }
})();
