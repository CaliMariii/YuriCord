/*
 * Yuricord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
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
import { filters, findModuleId, mapMangledModuleLazy, proxyLazyWebpack, wreq } from "@webpack";
import { LazyComponent } from "./react";
export const Modals = mapMangledModuleLazy(':"thin")', {
    ModalRoot: filters.componentByCode('.MODAL,"aria-labelledby":'),
    ModalHeader: filters.componentByCode(",id:"),
    ModalContent: filters.componentByCode(".content,"),
    ModalFooter: filters.componentByCode(".footer,"),
    ModalCloseButton: filters.componentByCode(".close]:")
});
export const ModalRoot = LazyComponent(() => Modals.ModalRoot);
export const ModalHeader = LazyComponent(() => Modals.ModalHeader);
export const ModalContent = LazyComponent(() => Modals.ModalContent);
export const ModalFooter = LazyComponent(() => Modals.ModalFooter);
export const ModalCloseButton = LazyComponent(() => Modals.ModalCloseButton);
export const openMediaModal = proxyLazyWebpack(() => {
    const mediaModalKeyModuleId = findModuleId('"Zoomed Media Modal"');
    if (mediaModalKeyModuleId == null)
        return;
    const openMediaModalModule = wreq(findModuleId(mediaModalKeyModuleId, "modalKey:"));
    return Object.values(openMediaModalModule).find(v => String(v).includes("modalKey:"));
});
export const ModalAPI = mapMangledModuleLazy(".modalKey?", {
    openModalLazy: filters.byCode(".modalKey?"),
    openModal: filters.byCode(",instant:"),
    closeModal: filters.byCode(".onCloseCallback()"),
    closeAllModals: filters.byCode(".getState();for")
});
export const { openModalLazy, openModal, closeModal, closeAllModals } = ModalAPI;
