import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiHome, FiSearch } from "react-icons/fi";
import { appNavigation } from "../../config/navigation";
import { filterNavigationForRole } from "../../config/navigation";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../ui/Input";

function routeMatches(target, pathname) {
  if (target === "/") {
    return pathname === "/";
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

function groupMatches(group, pathname) {
  return group.children?.some((child) => routeMatches(child.to, pathname));
}

export function Sidebar({ isCompact, isMobileOpen, onCloseMobile, onToggleCompact }) {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [openGroup, setOpenGroup] = useState("navigation.patientCare");
  const expandedWidth = i18n.language === "ta" ? 316 : 292;

  const routes = useMemo(
    () => [{ labelKey: "navigation.dashboard", to: "/" }, ...filterNavigationForRole(appNavigation, user?.role).flatMap((group) => group.children || [])],
    [user?.role],
  );

  const activeRouteKey = useMemo(() => {
    const match = routes.find((route) => routeMatches(route.to, location.pathname));
    return match ? `${match.labelKey}:${match.to}` : "";
  }, [location.pathname, routes]);

  useEffect(() => {
    const activeGroup = filterNavigationForRole(appNavigation, user?.role).find((item) => item.children && groupMatches(item, location.pathname));
    if (activeGroup) {
      setOpenGroup(activeGroup.labelKey);
    }
  }, [location.pathname, user?.role]);

  const filteredNavigation = useMemo(() => {
    if (!query.trim()) {
      return filterNavigationForRole(appNavigation, user?.role);
    }

    const lowered = query.toLowerCase();
    return filterNavigationForRole(appNavigation, user?.role)
      .map((item) => {
        const translatedGroup = t(item.labelKey).toLowerCase();
        const children = item.children.filter((child) => t(child.labelKey).toLowerCase().includes(lowered));
        if (translatedGroup.includes(lowered) || children.length) {
          return { ...item, children };
        }
        return null;
      })
      .filter(Boolean);
  }, [query, t, user?.role]);

  return (
    <aside
      className={`fixed left-3 top-3 z-40 h-[calc(100vh-1.5rem)] ${isCompact ? "w-[76px]" : `w-[${expandedWidth}px]`} ${isMobileOpen ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"} transition-transform duration-200 ease-out lg:static`}
      style={!isCompact ? { width: expandedWidth } : undefined}
    >
      <motion.div
        animate={{ width: isCompact ? 76 : expandedWidth }}
        className="sidebar-shell relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] shadow-[var(--shadow-soft)]"
        style={{ borderColor: "var(--sidebar-border)" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button
          aria-label={isCompact ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-8 z-10 hidden h-8 w-8 items-center justify-center rounded-full border bg-[var(--color-surface)] text-[var(--sidebar-text-secondary)] shadow-[var(--shadow-quiet)] lg:flex"
          onClick={onToggleCompact}
          style={{ borderColor: "var(--sidebar-border)" }}
          type="button"
        >
          {isCompact ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>

        <div className="border-b px-4 pb-4 pt-5" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="grid min-h-[48px] grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--gradient-brand)] text-base font-bold text-white">
              RH
            </div>
            {!isCompact ? (
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  initial={{ opacity: 0, x: -8 }}
                  key="expanded-brand"
                  transition={{ duration: 0.15 }}
                >
                  <p className="text-sm font-semibold text-[var(--sidebar-text)]">RHMS</p>
                  <p className="text-xs text-[var(--sidebar-text-secondary)]">{t("intro.title")}</p>
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>

          {!isCompact ? (
            <div className="mt-4">
              <Input
                icon={FiSearch}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.search")}
                type="search"
                value={query}
              />
            </div>
          ) : null}
        </div>

        <div className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          <nav aria-label="Primary navigation" className="space-y-4">
            <NavLink
              aria-label={t("navigation.dashboard")}
              className={({ isActive }) =>
                `relative grid min-h-[48px] grid-cols-[40px_minmax(0,1fr)_24px] items-center gap-3 rounded-xl px-3 py-2 transition ${
                  isActive
                    ? "border text-[var(--sidebar-active-text)] shadow-[var(--sidebar-active-shadow)]"
                    : "text-[var(--sidebar-text)] hover:translate-x-[2px] hover:bg-[var(--color-surface-hover)]"
                }`
              }
              onClick={onCloseMobile}
              style={({ isActive }) =>
                isActive
                  ? { borderColor: "var(--sidebar-active-border)", background: "var(--sidebar-active-bg)" }
                  : undefined
              }
              title={t("navigation.dashboard")}
              to="/"
            >
              {activeRouteKey === "navigation.dashboard:/" ? <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[var(--color-primary)]" /> : null}
              <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${activeRouteKey === "navigation.dashboard:/" ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "bg-[var(--color-bg-subtle)] text-[var(--sidebar-icon)]"}`}>
                <FiHome size={20} />
              </span>
              {!isCompact ? <span className="min-w-0 text-[14px] font-semibold">{t("navigation.dashboard")}</span> : null}
              {!isCompact ? <span /> : null}
            </NavLink>

            {filteredNavigation.map((group) => {
              const GroupIcon = group.icon;
              const groupIsOpen = openGroup === group.labelKey;

              return (
                <section key={group.labelKey}>
                  {!isCompact ? (
                    <p className="px-3 pb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--sidebar-text-secondary)]">
                      {t(group.labelKey)}
                    </p>
                  ) : null}

                  <div className="space-y-1">
                    <button
                      aria-expanded={groupIsOpen}
                      className={`grid min-h-[48px] w-full grid-cols-[40px_minmax(0,1fr)_24px] items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                        groupIsOpen ? "bg-[var(--sidebar-group-bg)] text-[var(--sidebar-text)]" : "text-[var(--sidebar-text)] hover:translate-x-[2px] hover:bg-[var(--color-surface-hover)]"
                      }`}
                      onClick={() => setOpenGroup((current) => (current === group.labelKey ? "" : group.labelKey))}
                      title={t(group.labelKey)}
                      type="button"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-bg-subtle)] text-[var(--sidebar-icon)]">
                        <GroupIcon size={20} />
                      </span>
                      {!isCompact ? <span className="min-w-0 text-[14px] font-semibold">{t(group.labelKey)}</span> : null}
                      {!isCompact ? <FiChevronDown className={`justify-self-end text-[var(--sidebar-text-secondary)] transition ${groupIsOpen ? "rotate-180" : ""}`} size={16} /> : null}
                    </button>

                    {!isCompact && groupIsOpen ? (
                      <div className="space-y-1 rounded-[18px] p-2" style={{ background: "var(--sidebar-group-bg)" }}>
                        {group.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isActive = activeRouteKey === `${child.labelKey}:${child.to}`;

                          return (
                            <NavLink
                              aria-current={isActive ? "page" : undefined}
                              className={`relative grid min-h-[48px] grid-cols-[40px_minmax(0,1fr)_24px] items-center gap-3 overflow-hidden rounded-xl px-3 py-2 text-left transition ${
                                isActive
                                  ? "border text-[var(--sidebar-active-text)] shadow-[var(--sidebar-active-shadow)]"
                                  : "text-[var(--sidebar-text-secondary)] hover:translate-x-[2px] hover:bg-[var(--color-surface-hover)] hover:text-[var(--sidebar-text)]"
                              }`}
                              key={child.to}
                              onClick={onCloseMobile}
                              style={isActive ? { borderColor: "var(--sidebar-active-border)", background: "var(--sidebar-active-bg)" } : undefined}
                              title={t(child.labelKey)}
                              to={child.to}
                            >
                              {isActive ? <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[var(--color-primary)]" /> : null}
                              <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${isActive ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "bg-[var(--color-bg-subtle)] text-[var(--sidebar-icon-muted)]"}`}>
                                <ChildIcon size={18} />
                              </span>
                              <span className="min-w-0 whitespace-normal text-[14px] font-medium leading-5">{t(child.labelKey)}</span>
                              <span />
                            </NavLink>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </nav>
        </div>

        <div className="border-t px-4 py-4" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="grid min-h-[48px] grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-xl px-3 py-2" style={{ background: "var(--sidebar-group-bg)" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--color-success-bg)] text-[var(--color-success)]">
              <FiChevronRight size={18} />
            </div>
            {!isCompact ? (
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-[var(--sidebar-text)]">{t("common.sessionReady")}</p>
                <p className="truncate text-xs text-[var(--sidebar-text-secondary)]">{t("common.focusedNavigation")}</p>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
