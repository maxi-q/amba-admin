# Спринты: пустое состояние и инструкция — Figma `17111:32143`

- Source: `bAbFX4C4FHvWQ1whR5p3jn`, section `17111:32143`.
- Empty state: `17010:73715`.
- Sprint list: `17111:31643`.
- Instructions dialog: `17111:31850`.
- Reference screenshots:
  - `sprints-empty-instructions-17010-73715.png`
  - `sprints-list-instructions-17111-31643.png`
  - `sprints-instructions-dialog-17111-31850.png`

## Implementation

- The empty list renders the four-step guide and `Создать первый спринт` action.
- A non-empty list renders `Инструкция` next to `Добавить`.
- Both page and dialog reuse `SprintInstructions` so wording, spacing and illustrations stay aligned.
- The four 88×88 illustrations and header icons are downloaded directly from the corresponding Figma layers into `src/assets/sprint-instructions/`.
- Product wording uses `компания` according to the repository terminology rule.
