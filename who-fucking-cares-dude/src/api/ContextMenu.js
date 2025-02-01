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
import { Logger } from "@utils/Logger";
import { Menu, React } from "@webpack/common";
const ContextMenuLogger = new Logger("ContextMenu");
export const navPatches = new Map();
export const globalPatches = new Set();
/**
 * Add a context menu patch
 * @param navId The navId(s) for the context menu(s) to patch
 * @param patch The patch to be applied
 */
export function addContextMenuPatch(navId, patch) {
    if (!Array.isArray(navId))
        navId = [navId];
    for (const id of navId) {
        let contextMenuPatches = navPatches.get(id);
        if (!contextMenuPatches) {
            contextMenuPatches = new Set();
            navPatches.set(id, contextMenuPatches);
        }
        contextMenuPatches.add(patch);
    }
}
/**
 * Add a global context menu patch that fires the patch for all context menus
 * @param patch The patch to be applied
 */
export function addGlobalContextMenuPatch(patch) {
    globalPatches.add(patch);
}
/**
 * Remove a context menu patch
 * @param navId The navId(s) for the context menu(s) to remove the patch
 * @param patch The patch to be removed
 * @returns Whether the patch was successfully removed from the context menu(s)
 */
export function removeContextMenuPatch(navId, patch) {
    const navIds = Array.isArray(navId) ? navId : [navId];
    const results = navIds.map(id => navPatches.get(id)?.delete(patch) ?? false);
    return (Array.isArray(navId) ? results : results[0]);
}
/**
 * Remove a global context menu patch
 * @param patch The patch to be removed
 * @returns Whether the patch was successfully removed
 */
export function removeGlobalContextMenuPatch(patch) {
    return globalPatches.delete(patch);
}
/**
 * A helper function for finding the children array of a group nested inside a context menu based on the id(s) of its children
 * @param id The id of the child. If an array is specified, all ids will be tried
 * @param children The context menu children
 * @param matchSubstring Whether to check if the id is a substring of the child id
 */
export function findGroupChildrenByChildId(id, children, matchSubstring = false) {
    for (const child of children) {
        if (child == null)
            continue;
        if (Array.isArray(child)) {
            const found = findGroupChildrenByChildId(id, child, matchSubstring);
            if (found !== null)
                return found;
        }
        if ((Array.isArray(id) && id.some(id => matchSubstring ? child.props?.id?.includes(id) : child.props?.id === id))
            || (matchSubstring ? child.props?.id?.includes(id) : child.props?.id === id))
            return children;
        let nextChildren = child.props?.children;
        if (nextChildren) {
            if (!Array.isArray(nextChildren)) {
                nextChildren = [nextChildren];
                child.props.children = nextChildren;
            }
            const found = findGroupChildrenByChildId(id, nextChildren, matchSubstring);
            if (found !== null)
                return found;
        }
    }
    return null;
}
export function _usePatchContextMenu(props) {
    props = {
        ...props,
        children: cloneMenuChildren(props.children),
    };
    props.contextMenuAPIArguments ??= [];
    const contextMenuPatches = navPatches.get(props.navId);
    if (!Array.isArray(props.children))
        props.children = [props.children];
    if (contextMenuPatches) {
        for (const patch of contextMenuPatches) {
            try {
                patch(props.children, ...props.contextMenuAPIArguments);
            }
            catch (err) {
                ContextMenuLogger.error(`Patch for ${props.navId} errored,`, err);
            }
        }
    }
    for (const patch of globalPatches) {
        try {
            patch(props.navId, props.children, ...props.contextMenuAPIArguments);
        }
        catch (err) {
            ContextMenuLogger.error("Global patch errored,", err);
        }
    }
    return props;
}
function cloneMenuChildren(obj) {
    if (Array.isArray(obj)) {
        return obj.map(cloneMenuChildren);
    }
    if (React.isValidElement(obj)) {
        obj = React.cloneElement(obj);
        if (obj?.props?.children &&
            (obj.type !== Menu.MenuControlItem || obj.type === Menu.MenuControlItem && obj.props.control != null)) {
            obj.props.children = cloneMenuChildren(obj.props.children);
        }
    }
    return obj;
}
