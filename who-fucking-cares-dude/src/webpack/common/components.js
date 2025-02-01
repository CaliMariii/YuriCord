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
import { LazyComponent } from "@utils/lazyReact";
import { filters, mapMangledModuleLazy, waitFor } from "@webpack";
import { waitForComponent } from "./internal";
const FormTitle = waitForComponent("FormTitle", filters.componentByCode('["defaultMargin".concat', '="h5"'));
const FormText = waitForComponent("FormText", filters.componentByCode(".SELECTABLE),", ".DISABLED:"));
const FormSection = waitForComponent("FormSection", filters.componentByCode(".titleId)&&"));
const FormDivider = waitForComponent("FormDivider", filters.componentByCode(".divider,", ",style:", '"div"', /\.divider,\i\),style:/));
export const Forms = {
    FormTitle,
    FormText,
    FormSection,
    FormDivider
};
export const Card = waitForComponent("Card", filters.componentByCode(".editable),", ".outline:"));
export const Button = waitForComponent("Button", filters.componentByCode("#{intl::A11Y_LOADING_STARTED}))),!1"));
export const Switch = waitForComponent("Switch", filters.componentByCode(".labelRow,ref:", ".disabledText"));
const Tooltips = mapMangledModuleLazy(".tooltipTop,bottom:", {
    Tooltip: filters.componentByCode("this.renderTooltip()]"),
    TooltipContainer: filters.componentByCode('="div",')
});
export const Tooltip = LazyComponent(() => Tooltips.Tooltip);
export const TooltipContainer = LazyComponent(() => Tooltips.TooltipContainer);
export const TextInput = waitForComponent("TextInput", filters.componentByCode(".error]:this.hasError()"));
export const TextArea = waitForComponent("TextArea", filters.componentByCode("this.getPaddingRight()},id:"));
export const Text = waitForComponent("Text", filters.componentByCode('case"always-white"'));
export const Heading = waitForComponent("Heading", filters.componentByCode(">6?{", "variant:"));
export const Select = waitForComponent("Select", filters.componentByCode('.selectPositionTop]:"top"===', '"Escape"==='));
export const SearchableSelect = waitForComponent("SearchableSelect", filters.componentByCode('.selectPositionTop]:"top"===', ".multi]:"));
export const Slider = waitForComponent("Slider", filters.componentByCode('"markDash".concat('));
export const Popout = waitForComponent("Popout", filters.componentByCode("ref:this.ref,preload:"));
export const Dialog = waitForComponent("Dialog", filters.componentByCode('role:"dialog",tabIndex:-1'));
export const TabBar = waitForComponent("TabBar", filters.componentByCode("ref:this.tabBarRef,className:"));
export const Paginator = waitForComponent("Paginator", filters.componentByCode('rel:"prev",children:'));
export const Clickable = waitForComponent("Clickable", filters.componentByCode("this.context?this.renderNonInteractive():"));
export const Avatar = waitForComponent("Avatar", filters.componentByCode(".size-1.375*"));
export let createScroller;
export let scrollerClasses;
waitFor(filters.byCode('="ltr",orientation:', "customTheme:", "forwardRef"), m => createScroller = m);
waitFor(["thin", "auto", "customTheme"], m => scrollerClasses = m);
export const ScrollerNone = LazyComponent(() => createScroller(scrollerClasses.none, scrollerClasses.fade, scrollerClasses.customTheme));
export const ScrollerThin = LazyComponent(() => createScroller(scrollerClasses.thin, scrollerClasses.fade, scrollerClasses.customTheme));
export const ScrollerAuto = LazyComponent(() => createScroller(scrollerClasses.auto, scrollerClasses.fade, scrollerClasses.customTheme));
const { FocusLock_ } = mapMangledModuleLazy("attachTo:null!==", {
    FocusLock_: filters.componentByCode(".containerRef")
});
export const FocusLock = LazyComponent(() => FocusLock_);
export let useToken;
waitFor(m => {
    if (typeof m !== "function") {
        return false;
    }
    const str = String(m);
    return str.includes(".resolve({theme:null") && !str.includes("useMemo");
}, m => useToken = m);
export const MaskedLink = waitForComponent("MaskedLink", filters.componentByCode("MASKED_LINK)"));
export const Timestamp = waitForComponent("Timestamp", filters.componentByCode("#{intl::MESSAGE_EDITED_TIMESTAMP_A11Y_LABEL}"));
export const Flex = waitForComponent("Flex", ["Justify", "Align", "Wrap"]);
export const OAuth2AuthorizeModal = waitForComponent("OAuth2AuthorizeModal", filters.componentByCode(".authorize),children:", ".contentBackground"));
export const Animations = mapMangledModuleLazy(".assign({colorNames:", {
    Transition: filters.componentByCode('["items","children"]', ",null,"),
    animated: filters.byProps("div", "text")
});
