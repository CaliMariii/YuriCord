/*
 * Yuricord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { proxyLazy } from "@utils/lazy";
import { UserStore, zustandCreate } from "@webpack/common";
import { deleteDecoration, getUserDecoration, getUserDecorations, setUserDecoration } from "../api";
import { decorationToAsset } from "../utils/decoration";
import { useUsersDecorationsStore } from "./UsersDecorationsStore";
export const useCurrentUserDecorationsStore = proxyLazy(() => zustandCreate((set, get) => ({
    decorations: [],
    selectedDecoration: null,
    async fetch() {
        const decorations = await getUserDecorations();
        const selectedDecoration = await getUserDecoration();
        set({ decorations, selectedDecoration });
    },
    async create(newDecoration) {
        const decoration = (await setUserDecoration(newDecoration));
        set({ decorations: [...get().decorations, decoration] });
    },
    async delete(decoration) {
        const hash = typeof decoration === "object" ? decoration.hash : decoration;
        await deleteDecoration(hash);
        const { selectedDecoration, decorations } = get();
        const newState = {
            decorations: decorations.filter(d => d.hash !== hash),
            selectedDecoration: selectedDecoration?.hash === hash ? null : selectedDecoration
        };
        set(newState);
    },
    async select(decoration) {
        if (get().selectedDecoration === decoration)
            return;
        set({ selectedDecoration: decoration });
        setUserDecoration(decoration);
        useUsersDecorationsStore.getState().set(UserStore.getCurrentUser().id, decoration ? decorationToAsset(decoration) : null);
    },
    clear: () => set({ decorations: [], selectedDecoration: null })
})));
