import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import PageFallback from "../components/PageFallback";
import Sidebar from "../components/Sidebar";
import { scrollToTop, useScrollLock } from "../components/SmoothScroll";
import Toast from "../components/Toast";
import TopBar from "../components/TopBar";
import { Empty, btnPrimary, ease } from "../components/UI";

/* Every page is its own chunk: the browser only downloads a page when it is opened.
   The loaders are kept in one object so the chunks can also be warmed up once the app is idle. */
const loaders = {
  overview: () => import("../components/Overview"),
  users: () => import("../components/Users"),
  groups: () => import("../components/Groups"),
  groupManagement: () => import("../components/GroupManagement"),
  projects: () => import("../components/Projects"),
  employees: () => import("../components/Employees"),
  materials: () => import("../components/Materials"),
  help: () => import("../components/Help"),
};

const Overview = lazy(loaders.overview);
const Users = lazy(loaders.users);
const Groups = lazy(loaders.groups);
const GroupManagement = lazy(loaders.groupManagement);
const Projects = lazy(loaders.projects);
const Employees = lazy(loaders.employees);
const Materials = lazy(loaders.materials);
const Help = lazy(loaders.help);

function NotFound() {
  const navigate = useNavigate();
  return (
    <Empty title="Page not found" text="This address does not match a page in the dashboard.">
      <button onClick={() => navigate("/dashboard")} className={btnPrimary}>Go to dashboard</button>
    </Empty>
  );
}

/* Shell: sidebar + top bar stay put, only the page inside <main> changes with the URL. */
export default function AdminPage() {
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  useScrollLock(drawer);

  // each new page starts at the top
  useEffect(() => { scrollToTop(); }, [location.pathname]);

  // once the first page is on screen, fetch the other pages in the background
  useEffect(() => {
    const warm = () => Object.values(loaders).forEach((load) => load());
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen gap-4 p-3 sm:p-4">
        <motion.aside
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease }}
          className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-[260px] shrink-0 lg:block xl:w-[300px]"
        >
          <Sidebar />
        </motion.aside>

        <AnimatePresence>
          {drawer && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setDrawer(false)}
                className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                key="drawer"
                initial={{ x: "-105%" }} animate={{ x: 0 }} exit={{ x: "-105%" }}
                transition={{ duration: 0.45, ease }}
                className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] p-3 lg:hidden"
              >
                <Sidebar slide={false} onSelect={() => setDrawer(false)} onClose={() => setDrawer(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <TopBar onMenu={() => setDrawer(true)} />

          <main className="flex-1 rounded-[2rem] bg-panel p-3 sm:p-5 xl:p-6">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} exit={{ opacity: 0, y: -10, transition: { duration: 0.18 } }}>
                <Suspense fallback={<PageFallback />}>
                  <Routes location={location}>
                    <Route path="dashboard" element={<Overview />} />
                    <Route path="users" element={<Users />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="groups/:groupId" element={<GroupManagement />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="materials" element={<Materials />} />
                    <Route path="employees" element={<Employees />} />
                    <Route path="help" element={<Help />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Toast />
    </MotionConfig>
  );
}
