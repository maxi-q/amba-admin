# Sprint place modal — 16464:70723

- Source: https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=16464-70723
- Checked: 2026-10-08
- Scope: modal «Место» on sprint reward step.
- Figma header: 44 px high, 16 px horizontal padding, 10 px vertical padding.
- Content box starts directly after the header and has 6 px vertical padding.
- Implementation: restored the missing 10 px bottom padding by using `h-11 px-4 py-2.5` on `DialogHeader`; behavior and the rest of the modal are unchanged.
- Screenshot from `get_design_context` was used as the visual reference; no new assets are required.
