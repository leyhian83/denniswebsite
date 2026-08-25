# Media folders

Drop your media files here. The prototype reads image/video paths from the JSON
data files — it never hard-codes imports in React components.

## Properties

```
public/media/properties/<property-slug>/
    cover.jpg          ← first entry in the property's `photos` (used as the card image)
    living-room.jpg
    bedroom.jpg
    walkthrough.mp4    ← optional local video (set `videos` in properties.json)
```

Each `<property-slug>` folder must match the `slug` field of the property in
`src/data/properties.json`.

## Projects

```
public/media/projects/<project-slug>/
    cover.jpg
    site-plan.jpg
    floor-plan-a.jpg   ← optional floor plans (set `floorPlans` in projects.json)
```

## Profile

```
public/media/profile/
    avatar.jpg         ← set `profilePhoto` in src/data/profile.json
```

## Notes

- If a referenced image does not exist yet, the site renders a neutral branded
  placeholder automatically — you can ship without images and add them later.
- YouTube videos can be used instead of local files via the `videos` array:
  `{ "type": "youtube", "url": "https://www.youtube.com/watch?v=..." }`.
