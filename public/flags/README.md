# Flag assets

These SVG flags are vendored from [`flag-icons`](https://github.com/lipis/flag-icons)
(v7.5.0, **MIT** licensed), the `flags/4x3/` set. Files are named by the code used in
`lib/flags.ts` — ISO 3166-1 alpha-2 (lowercase), plus the GB sub-region codes `gb-eng`,
`gb-sct`, `gb-wls` for the home nations.

`flag-icons` is a **devDependency only**, used solely as the source for these files;
nothing imports it at runtime. To add or refresh a flag, copy the matching
`node_modules/flag-icons/flags/4x3/<code>.svg` here.
