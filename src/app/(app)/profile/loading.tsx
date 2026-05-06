/**
 * Loading state for the bare `/profile` route. The page itself just redirects
 * to `/profile/<my-username>`, but during the transition Next.js needs a
 * skeleton to render — and without this file, the closest match is the
 * generic feed-shaped (app) skeleton, which flashes a layout that looks
 * nothing like a profile. Re-export the [username] skeleton so both paths
 * land on the same shape.
 */
export { default } from "./[username]/loading";
