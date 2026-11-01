import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Dialog } from "./Dialog";
import { Input } from "./Input";
import { flattenNavigation } from "../../config/navigation";

export function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState([]);
  const { isAuthenticated, user } = useAuth();
  const commands = useMemo(() => flattenNavigation(undefined, user?.role), [user?.role]);
  const { t } = useTranslation();

  const filteredCommands = useMemo(
    () =>
      commands.filter((command) =>
        t(command.labelKey).toLowerCase().includes(query.toLowerCase()),
      ),
    [commands, query, t],
  );

  useEffect(() => {
    if (!open || !isAuthenticated || query.trim().length < 2) {
      setRemoteResults([]);
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await api.get("/operations/search", {
          params: { q: query.trim() },
        });
        const sections = response.data.data || {};
        const items = Object.entries(sections).flatMap(([section, entries]) =>
          entries.map((entry) => ({ ...entry, section })),
        );
        setRemoteResults(items);
      } catch {
        setRemoteResults([]);
      }
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [isAuthenticated, open, query]);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onClose((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <Dialog open={open} onClose={() => onClose(false)} title={t("common.search")}>
      <Input
        autoFocus
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("header.searchPlaceholder")}
        type="search"
        value={query}
      />
      <div className="mt-4 space-y-2">
        {filteredCommands.map((command) => (
          <Link
            key={command.to}
            className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-foreground)] transition hover:bg-[var(--color-surface-hover)]"
            onClick={() => onClose(false)}
            to={command.to}
          >
            <span>{t(command.labelKey)}</span>
            <span className="text-[var(--color-foreground-muted)]">{t("common.open")}</span>
          </Link>
        ))}
        {remoteResults.map((result) => (
          <Link
            key={`${result.section}-${result.id}`}
            className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-foreground)] transition hover:bg-[var(--color-surface-hover)]"
            onClick={() => onClose(false)}
            to={result.route}
          >
            <div>
              <p>{result.title}</p>
              <p className="text-xs text-[var(--color-foreground-muted)]">{result.section} | {result.subtitle}</p>
            </div>
            <span className="text-[var(--color-foreground-muted)]">{t("common.jump")}</span>
          </Link>
        ))}
        {!filteredCommands.length && !remoteResults.length ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-6 text-sm text-[var(--color-foreground-muted)]">
            {t("common.noResults")}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
