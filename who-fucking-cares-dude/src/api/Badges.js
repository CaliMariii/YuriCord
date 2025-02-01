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
import ErrorBoundary from "@components/ErrorBoundary";
import Plugins from "~plugins";
const Badges = new Set();
/**
 * Register a new badge with the Badges API
 * @param badge The badge to register
 */
export function addProfileBadge(badge) {
    badge.component &&= ErrorBoundary.wrap(badge.component, { noop: true });
    Badges.add(badge);
}
/**
 * Unregister a badge from the Badges API
 * @param badge The badge to remove
 */
export function removeProfileBadge(badge) {
    return Badges.delete(badge);
}
/**
 * Inject badges into the profile badges array.
 * You probably don't need to use this.
 */
export function _getBadges(args) {
    const badges = [];
    for (const badge of Badges) {
        if (!badge.shouldShow || badge.shouldShow(args)) {
            const b = badge.getBadges
                ? badge.getBadges(args).map(b => {
                    b.component &&= ErrorBoundary.wrap(b.component, { noop: true });
                    return b;
                })
                : [{ ...badge, ...args }];
            badge.position === 0 /* BadgePosition.START */
                ? badges.unshift(...b)
                : badges.push(...b);
        }
    }
    const donorBadges = Plugins.BadgeAPI.getDonorBadges(args.userId);
    if (donorBadges)
        badges.unshift(...donorBadges);
    return badges;
}
