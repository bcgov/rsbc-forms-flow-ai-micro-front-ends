# Review Menu — Assigned Task Count Badge

## Overview

The **Review** section in the sidebar displays a pill badge next to its header label showing the number of tasks currently assigned to the authenticated user. The count is pushed into the sidebar via the `ES_TASK_COUNT` pub/sub event — the nav package does not make its own API call.

```
┌──────────────────────┐
│  ▸ Review  ●5        │  ← badge visible
│  ▸ Design            │
│  ▸ Submit            │
└──────────────────────┘
```

The badge is hidden when the count is `0` or no `ES_TASK_COUNT` event has been received.

---

## How the Count Reaches the Sidebar

Any micro-frontend that knows the current user's assigned task count should publish an `ES_TASK_COUNT` event with the following payload:

```js
props.publish("ES_TASK_COUNT", { tasksCount: <integer> });
```

`Sidebar.jsx` subscribes to this event and updates the badge count accordingly. If the event is never published, the badge stays hidden (count defaults to `0`).

---

## Files Changed

| File | Change |
|---|---|
| `src/sidenav/MenuComponent.jsx` | Added optional `badgeCount` prop; renders badge in accordion header |
| `src/sidenav/Sidebar.jsx` | Added `reviewTaskCount` state and `ES_TASK_COUNT` subscriber; passes `badgeCount` to the Review `MenuComponent` |
| `src/sidenav/Sidebar.scss` | Added `.accordion-header-content` and `.accordion-header-badge` styles |

---

## Detailed Changes

### `src/sidenav/MenuComponent.jsx`

Added an optional `badgeCount` prop. When the value is greater than `0`, a pill badge is rendered inside the accordion header alongside the menu label:

```jsx
<span className="accordion-header-content">
  <span>{t(mainMenu)}</span>
  {badgeCount > 0 && (
    <span
      className="accordion-header-badge"
      data-testid={`accordion-header-badge-${eventKey}`}
      aria-label={`${badgeCount} assigned tasks`}
    >
      {badgeCount}
    </span>
  )}
</span>
```

`badgeCount` is declared in `PropTypes` as an optional `number`. All other menu items that do not pass `badgeCount` are unaffected.

---

### `src/sidenav/Sidebar.jsx`

Three additions:

**1. State**

```js
const [reviewTaskCount, setReviewTaskCount] = useState(0);
```

**2. `ES_TASK_COUNT` subscriber** (inside the existing mount-time `useEffect([], [])`)

```js
props.subscribe("ES_TASK_COUNT", (msg, data) => {
  if (data && data.tasksCount !== reviewTaskCount) {
    setReviewTaskCount(data.tasksCount);
  }
});
```

The guard (`data.tasksCount !== reviewTaskCount`) avoids a re-render when the same count is published again.

**3. Prop passed to the Review menu**

```jsx
<MenuComponent
  baseUrl={baseUrl}
  eventKey={SectionKeys.REVIEW.value}
  optionsCount="1"
  mainMenu="Review"
  badgeCount={reviewTaskCount}
  subMenu={[{ name: "Tasks", path: "task" }]}
  subscribe={props.subscribe}
/>
```

---

### `src/sidenav/Sidebar.scss`

Two new rule sets. `.accordion-header-content` makes the header label and badge sit side-by-side; `.accordion-header-badge` styles the pill:

```scss
.accordion-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacer-100);
  width: 100%;
}

.accordion-header-badge {
  min-width: 1.5rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background-color: var(--ff-danger);
  color: var(--ff-white);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-lg);
  line-height: 1.25rem;
  text-align: center;
}

.accordion-button:not(.collapsed) .accordion-header-badge,
.active-header .accordion-header-badge {
  background-color: var(--ff-danger);
  color: var(--ff-white);
}
```

The badge uses `--ff-danger` (red) in all states so it remains visually distinct regardless of whether the section is expanded or collapsed.

---

## Behaviour

| Scenario | Badge |
|---|---|
| `ES_TASK_COUNT` published with `tasksCount >= 1` | Displayed with the count |
| `ES_TASK_COUNT` published with `tasksCount === 0` | Hidden |
| `ES_TASK_COUNT` never published (e.g. task micro-frontend not loaded) | Hidden (defaults to `0`) |
| Same count published again | No re-render (guarded by inequality check) |

---

## Integration Notes

- The `ES_TASK_COUNT` event is part of the shared pub/sub contract between micro-frontends. The publisher is responsible for fetching the count from the backend (e.g. `GET /user/task/count`) and publishing updates at an appropriate frequency.
- The `tasksCount` field must be an integer. Non-numeric or missing values will leave the badge in its current state.
- Badge visibility is controlled purely by the count value — there is no role or module flag check inside the nav package itself.
