// features/homepage-sections/HomepageSectionsManagement.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { ROLE_PERMISSIONS } from "./constants";
import {
  useHomepageSectionQuery,
  useHomepageSectionsQuery,
} from "./hooks/useHomepageSections";
import { useHomepageSectionForm } from "./hooks/useHomepageSectionForm";
import {
  useDeleteHomepageSection,
  useReorderHomepageSections,
  useToggleHomepageSectionStatus,
} from "./hooks/useHomepageSectionMutations";
import { HomepageSectionTable } from "./components/HomepageSectionTable";
import { HomepageSectionFormModal } from "./components/HomepageSectionFormModal";
import { DeleteHomepageSectionDialog } from "./components/DeleteHomepageSectionDialog";
import { SectionProductsEditor } from "./components/SectionProductsEditor";
import type {
  HomepageSectionManagementRole,
  HomepageSectionSummary,
} from "./types";

type HomepageSectionsManagementProps = {
  title?: string;
  description?: string;
  /** Controls which management actions are available. Defaults to "admin". */
  role?: HomepageSectionManagementRole;
};

export function HomepageSectionsManagement({
  title = "Homepage",
  description = "Control which sections render on the storefront homepage.",
  role = "admin",
}: HomepageSectionsManagementProps) {
  const permissions = ROLE_PERMISSIONS[role];
  const { data, isLoading } = useHomepageSectionsQuery();
  const formState = useHomepageSectionForm();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const toggleStatus = useToggleHomepageSectionStatus();
  const reorderSections = useReorderHomepageSections();
  const deleteSection = useDeleteHomepageSection();

  // Already sorted by the API (sortOrder, then createdAt) — the same order the
  // homepage renders in, so the table is a faithful preview.
  const sections = useMemo(() => data?.data ?? [], [data]);
  const sectionTypes = useMemo(() => data?.sectionTypes ?? [], [data]);
  const statusCounts = data?.statusCounts;

  // The list only carries product IDs; the editor needs them populated.
  const { data: openSection, isLoading: sectionLoading } =
    useHomepageSectionQuery(selectedId);

  // A section type is a single system slot, so a type already in use is not
  // offered again.
  const creatableTypes = useMemo(() => {
    const used = new Set(sections.map((s) => s.sectionType));
    return sectionTypes.filter((type) => !used.has(type.key));
  }, [sections, sectionTypes]);

  const handleMove = useCallback(
    (section: HomepageSectionSummary, direction: -1 | 1) => {
      const index = sections.findIndex((s) => s._id === section._id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= sections.length) return;

      const next = [...sections];
      [next[index], next[target]] = [next[target], next[index]];

      // Send the whole list with compacted positions so sortOrder stays
      // gap-free no matter what the values were before.
      reorderSections.mutate(
        next.map((s, sortOrder) => ({ id: s._id, sortOrder })),
      );
    },
    [sections, reorderSections],
  );

  const handleToggleStatus = useCallback(
    (section: HomepageSectionSummary) => {
      toggleStatus.mutate({
        id: section._id,
        status: section.status === "active" ? "inactive" : "active",
      });
    },
    [toggleStatus],
  );

  const handleConfirmDelete = useCallback(
    (id: string) => {
      deleteSection.mutate(id, {
        onSuccess: () => {
          if (selectedId === id) setSelectedId(null);
          setConfirmDeleteId(null);
        },
        onError: () => setConfirmDeleteId(null),
      });
    },
    [deleteSection, selectedId],
  );

  const pendingDelete =
    permissions.canDelete && confirmDeleteId
      ? sections.find((s) => s._id === confirmDeleteId) ?? null
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
          <p className="text-xs text-slate-400">
            {statusCounts && statusCounts.total > 0
              ? `${statusCounts.total} section${statusCounts.total === 1 ? "" : "s"} · ${statusCounts.active} live on the homepage`
              : description}
          </p>
        </div>
        {permissions.canCreate && (
          <button
            type="button"
            onClick={() => formState.startCreate()}
            disabled={creatableTypes.length === 0}
            className="shrink-0 rounded-lg bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white disabled:opacity-40"
            title={
              creatableTypes.length === 0
                ? "Every released section type already exists"
                : undefined
            }
          >
            New section
          </button>
        )}
      </div>

      {!permissions.canEditDetails && (
        <p className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
          Section titles, slugs, status and order are managed by an
          administrator. You can open a section and curate the products inside
          it.
        </p>
      )}

      <HomepageSectionTable
        sections={sections}
        sectionTypes={sectionTypes}
        loading={isLoading}
        selectedId={selectedId}
        onSelect={(section) =>
          setSelectedId((current) =>
            current === section._id ? null : section._id,
          )
        }
        onEdit={formState.startEdit}
        onDelete={setConfirmDeleteId}
        onToggleStatus={handleToggleStatus}
        onMove={handleMove}
        canEditDetails={permissions.canEditDetails}
        canDelete={permissions.canDelete}
        canToggleStatus={permissions.canToggleStatus}
        canReorder={permissions.canReorderSections}
        reordering={reorderSections.isPending}
        togglingId={
          toggleStatus.isPending ? toggleStatus.variables?.id ?? null : null
        }
      />

      {selectedId &&
        (sectionLoading || !openSection ? (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 py-10 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Loading section…
          </p>
        ) : (
          <SectionProductsEditor
            key={`${openSection._id}:${openSection.updatedAt}`}
            section={openSection}
            canManageProducts={permissions.canManageProducts}
            onClose={() => setSelectedId(null)}
          />
        ))}

      <HomepageSectionFormModal
        formState={formState}
        availableTypes={creatableTypes}
      />

      <DeleteHomepageSectionDialog
        section={pendingDelete}
        deleting={deleteSection.isPending}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
