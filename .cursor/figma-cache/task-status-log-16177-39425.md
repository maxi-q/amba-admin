# Статус задания

- Figma: https://www.figma.com/design/bAbFX4C4FHvWQ1whR5p3jn/Senler-%E2%80%93-Layouts?node-id=16170-37140
- File key: `bAbFX4C4FHvWQ1whR5p3jn`
- Screen section: `16170:37140`
- Implemented modal node: `16177:39425`
- Implementation: `src/pages/(list_integration)/creativetasks/components/SubmissionStatusLogDialog.tsx`
- Local preview: `task-status-log-preview.html`

## Design summary

Centered 358 px dialog with a compact header, a chronological event timeline, optional reviewer comments, and an active review step with publication links and the existing accept/reject actions.

## Data mapping

- History: `submission.events[]`
- Date: `event.createdAt`
- Event label/icon: `event.type` and `event.actorType`
- Historical comment: `event.payload.reviewComment` or `event.payload.comment`
- Current publication links: `submission.items[].publicationUrl`
- Current review step: `submission.status`

`event.payload` is intentionally handled defensively because the OpenAPI schema exposes it as an untyped object.
