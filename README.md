# Thinkfotech Dashboard
React + Vite + Tailwind CSS v4 + Framer Motion + React Router + Lenis + lucide-react

    npm install
    npm run dev

## Structure

    src/
      main.jsx            renders <App />
      App.jsx             router: "/" -> /dashboard, everything else -> AdminPage
      pages/
        AdminPage.jsx     sidebar + top bar + all pages, lazy loaded, one route each
      components/         every component, PascalCase
        Overview, Users, Groups, GroupManagement, GroupForm,
        Projects, Employees, Materials, Help        (pages)
        Sidebar, TopBar, Toast, PageFallback, SmoothScroll, UI (shared pieces)
      data.js             seed data + option lists + nav (with each page's URL)

## Routes (the URL decides the page, so a refresh stays put)

    /dashboard   /users   /groups   /groups/:groupId   /projects   /materials   /employees   /help

Quick actions pass `{ create: true }` in the router state (`go("users", true)`) to open a create form.
Deploying: the host must send every path to `index.html` (SPA fallback).

## Data
There is no shared store. Each page keeps its own list in `useCollection(seed, "Noun")` (see `UI.jsx`),
starting from `data.js`. To use an API, load the list in a `useEffect` inside that page and call `api.setItems(...)`.

## Smooth scrolling
`SmoothScroll.jsx` starts Lenis (off when the system asks for reduced motion). Use `scrollToTop()`,
`scrollToElement(el)` and `useScrollLock(open)` from it instead of `window.scrollTo` / `scrollIntoView`.
Any element that scrolls by itself needs the `data-lenis-prevent` attribute.
