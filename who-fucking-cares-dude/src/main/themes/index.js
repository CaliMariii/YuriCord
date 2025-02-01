/* eslint-disable simple-header/header */
/*!
 * BetterDiscord addon meta parser
 * Copyright 2023 BetterDiscord contributors
 * Copyright 2023 Vendicated and Yuricord contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const splitRegex = /[^\S\r\n]*?\r?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/;
const escapedAtRegex = /^\\@/;
function makeHeader(fileName, opts = {}) {
    return {
        fileName,
        name: opts.name ?? fileName.replace(/\.css$/i, ""),
        author: opts.author ?? "Unknown Author",
        description: opts.description ?? "A Discord Theme.",
        version: opts.version,
        license: opts.license,
        source: opts.source,
        website: opts.website,
        invite: opts.invite
    };
}
export function stripBOM(fileContent) {
    if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
    }
    return fileContent;
}
export function getThemeInfo(css, fileName) {
    if (!css)
        return makeHeader(fileName);
    const block = css.split("/**", 2)?.[1]?.split("*/", 1)?.[0];
    if (!block)
        return makeHeader(fileName);
    const header = {};
    let field = "";
    let accum = "";
    for (const line of block.split(splitRegex)) {
        if (line.length === 0)
            continue;
        if (line.charAt(0) === "@" && line.charAt(1) !== " ") {
            header[field] = accum.trim();
            const l = line.indexOf(" ");
            field = line.substring(1, l);
            accum = line.substring(l + 1);
        }
        else {
            accum += " " + line.replace("\\n", "\n").replace(escapedAtRegex, "@");
        }
    }
    header[field] = accum.trim();
    delete header[""];
    return makeHeader(fileName, header);
}
