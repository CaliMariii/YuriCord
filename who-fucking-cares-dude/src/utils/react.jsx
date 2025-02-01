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
import { React, useEffect, useMemo, useReducer, useState } from "@webpack/common";
import { checkIntersecting } from "./misc";
export * from "./lazyReact";
export const NoopComponent = () => null;
/**
 * Check if an element is on screen
 * @param intersectOnly If `true`, will only update the state when the element comes into view
 * @returns [refCallback, isIntersecting]
 */
export const useIntersection = (intersectOnly = false) => {
    const observerRef = React.useRef(null);
    const [isIntersecting, setIntersecting] = useState(false);
    const refCallback = (element) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        if (!element)
            return;
        if (checkIntersecting(element)) {
            setIntersecting(true);
            if (intersectOnly)
                return;
        }
        observerRef.current = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (entry.target !== element)
                    continue;
                if (entry.isIntersecting && intersectOnly) {
                    setIntersecting(true);
                    observerRef.current?.disconnect();
                    observerRef.current = null;
                }
                else {
                    setIntersecting(entry.isIntersecting);
                }
            }
        });
        observerRef.current.observe(element);
    };
    return [refCallback, isIntersecting];
};
export function useAwaiter(factory, providedOpts) {
    const opts = Object.assign({
        fallbackValue: null,
        deps: [],
        onError: null,
    }, providedOpts);
    const [state, setState] = useState({
        value: opts.fallbackValue,
        error: null,
        pending: true
    });
    useEffect(() => {
        let isAlive = true;
        if (!state.pending)
            setState({ ...state, pending: true });
        factory()
            .then(value => {
            if (!isAlive)
                return;
            setState({ value, error: null, pending: false });
            opts.onSuccess?.(value);
        })
            .catch(error => {
            if (!isAlive)
                return;
            setState({ value: null, error, pending: false });
            opts.onError?.(error);
        });
        return () => void (isAlive = false);
    }, opts.deps);
    return [state.value, state.error, state.pending];
}
export function useForceUpdater(withDep) {
    const r = useReducer(x => x + 1, 0);
    return withDep ? r : r[1];
}
export function useTimer({ interval = 1000, deps = [] }) {
    const [time, setTime] = useState(0);
    const start = useMemo(() => Date.now(), deps);
    useEffect(() => {
        const intervalId = setInterval(() => setTime(Date.now() - start), interval);
        return () => {
            setTime(0);
            clearInterval(intervalId);
        };
    }, deps);
    return time;
}
