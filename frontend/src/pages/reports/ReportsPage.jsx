import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

function toQueryString(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
    } else if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });
  return search.toString();
}

async function downloadExport(params) {
  const query = toQueryString(params);
  const response = await fetch(`${API_BASE_URL}/reports/export?${query}`, {
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("rhms-access-token")}`,
    },
  });
  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition") || "";
  const filenameMatch = contentDisposition.match(/filename="(.+)"/);
  const filename = filenameMatch ? filenameMatch[1] : "rhms-report";
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [preview, setPreview] = useState(null);
  const [builder, setBuilder] = useState({
    module: "patients",
    fields: ["patientId", "gender", "age", "createdAt", "village"],
    preset: "this_month",
    comparison: "none",
    village: "",
    department: "",
    sortingField: "",
    sortingDirection: "desc",
    chartType: "table",
    exportFormat: "pdf",
    reportTitle: "RHMS Analytics Report",
  });
  const [saveForm, setSaveForm] = useState({ reportName: "", description: "", visibility: "private" });

  async function loadReportMeta() {
    const [templatesResponse, savedResponse] = await Promise.all([
      api.get("/reports/templates"),
      api.get("/reports/saved"),
    ]);
    setTemplates(templatesResponse.data.data);
    setSavedReports(savedResponse.data.data);
  }

  useEffect(() => {
    loadReportMeta();
  }, []);

  const availableFields = useMemo(() => {
    const byModule = {
      patients: ["patientId", "fullName", "gender", "age", "bloodGroup", "status", "createdAt", "village"],
      visits: ["visitId", "patientId", "doctorName", "diagnosis", "visitStatus", "visitDate", "followUpDate"],
      appointments: ["appointmentNumber", "patientId", "doctorName", "department", "appointmentDate", "status", "priority", "bookingSource"],
      queue: ["displayToken", "patientId", "doctorName", "department", "status", "priority", "estimatedWaitMinutes"],
      prescriptions: ["prescriptionNumber", "patientId", "doctorName", "status", "issuedAt", "dispensedAt"],
      pharmacy_stock: ["medicineName", "batchNumber", "availableQuantity", "expiryDate", "status", "supplierName"],
      lab_requests: ["requestNumber", "patientId", "doctorName", "priority", "status", "requestedAt", "completedAt"],
      lab_results: ["testName", "patientId", "criticalFlag", "verifiedAt", "doctorReviewedAt"],
      vaccinations: ["certificateNumber", "patientId", "vaccineName", "doseNumber", "administeredDate", "nextDoseDate", "village"],
      follow_ups: ["visitId", "patientId", "doctorName", "followUpDate", "visitStatus"],
      audit_logs: ["createdAt", "actorId", "actorRole", "action", "resourceType", "resourceId", "ipAddress"],
    };
    return byModule[builder.module] || [];
  }, [builder.module]);

  async function handlePreview() {
    const response = await api.get(`/reports/preview?${toQueryString(builder)}`);
    setPreview(response.data.data);
  }

  async function handleSavePreset() {
    await api.post("/reports/saved", {
      reportName: saveForm.reportName,
      description: saveForm.description,
      visibility: saveForm.visibility,
      module: builder.module,
      filters: builder,
      columns: builder.fields,
      grouping: "",
      sorting: { field: builder.sortingField, direction: builder.sortingDirection },
      chartType: builder.chartType,
      exportFormat: builder.exportFormat,
    });
    setSaveForm({ reportName: "", description: "", visibility: "private" });
    await loadReportMeta();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description="Template reports, saved presets, custom report preview, and PDF/XLSX/CSV exports now run from real backend report services."
        eyebrow="Reports"
        title="Reporting workspace"
      />

      <Tabs
        items={[
          { label: "Templates", value: "templates" },
          { label: "Builder", value: "builder" },
          { label: "Saved", value: "saved" },
          { label: "Preview", value: "preview" },
        ]}
        onChange={setActiveTab}
        value={activeTab}
      />

      {activeTab === "templates" ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader eyebrow={template.module.replaceAll("_", " ")} title={template.label} />
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {template.columns.map((column) => (
                    <Badge key={column} tone="neutral">{column}</Badge>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    setBuilder((current) => ({ ...current, module: template.module, fields: template.columns }));
                    setActiveTab("builder");
                  }}
                  size="lg"
                  type="button"
                >
                  Use template
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {activeTab === "builder" ? (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader eyebrow="Custom Builder" title="Build a role-controlled report" />
            <CardContent className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Module</span>
                <select
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                  onChange={(event) => setBuilder((current) => ({ ...current, module: event.target.value, fields: [] }))}
                  value={builder.module}
                >
                  <option value="patients">Patients</option>
                  <option value="visits">Visits</option>
                  <option value="appointments">Appointments</option>
                  <option value="queue">Queue</option>
                  <option value="prescriptions">Prescriptions</option>
                  <option value="pharmacy_stock">Pharmacy stock</option>
                  <option value="lab_requests">Lab requests</option>
                  <option value="lab_results">Lab results</option>
                  <option value="vaccinations">Vaccinations</option>
                  <option value="follow_ups">Follow-ups</option>
                  <option value="audit_logs">Audit logs</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Preset</span>
                <select
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                  onChange={(event) => setBuilder((current) => ({ ...current, preset: event.target.value }))}
                  value={builder.preset}
                >
                  <option value="today">Today</option>
                  <option value="this_week">This week</option>
                  <option value="this_month">This month</option>
                  <option value="last_month">Last month</option>
                  <option value="this_year">This year</option>
                </select>
              </label>
              <Input label="Village filter" onChange={(event) => setBuilder((current) => ({ ...current, village: event.target.value }))} value={builder.village} />
              <Input label="Department filter" onChange={(event) => setBuilder((current) => ({ ...current, department: event.target.value }))} value={builder.department} />
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Columns</span>
                <div className="flex flex-wrap gap-2 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-3">
                  {availableFields.map((field) => {
                    const active = builder.fields.includes(field);
                    return (
                      <button
                        className={`rounded-full px-3 py-2 text-sm ${active ? "bg-[var(--color-brand)] text-white" : "bg-[var(--color-surface-elevated)] text-[var(--color-foreground)]"}`}
                        key={field}
                        onClick={() =>
                          setBuilder((current) => ({
                            ...current,
                            fields: active ? current.fields.filter((item) => item !== field) : [...current.fields, field],
                          }))
                        }
                        type="button"
                      >
                        {field}
                      </button>
                    );
                  })}
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Export format</span>
                <select
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                  onChange={(event) => setBuilder((current) => ({ ...current, exportFormat: event.target.value }))}
                  value={builder.exportFormat}
                >
                  <option value="pdf">PDF</option>
                  <option value="xlsx">XLSX</option>
                  <option value="csv">CSV</option>
                </select>
              </label>
              <Input label="Report title" onChange={(event) => setBuilder((current) => ({ ...current, reportTitle: event.target.value }))} value={builder.reportTitle} />
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button onClick={handlePreview} size="lg" type="button">Preview report</Button>
                <Button onClick={() => downloadExport(builder)} size="lg" type="button" variant="secondary">Export now</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader eyebrow="Save Preset" title="Saved report configuration" />
            <CardContent className="space-y-4">
              <Input label="Report name" onChange={(event) => setSaveForm((current) => ({ ...current, reportName: event.target.value }))} value={saveForm.reportName} />
              <Input label="Description" onChange={(event) => setSaveForm((current) => ({ ...current, description: event.target.value }))} value={saveForm.description} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Visibility</span>
                <select
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm"
                  onChange={(event) => setSaveForm((current) => ({ ...current, visibility: event.target.value }))}
                  value={saveForm.visibility}
                >
                  <option value="private">Private</option>
                  <option value="role">Role</option>
                  <option value="organization">Organization</option>
                </select>
              </label>
              <Button onClick={handleSavePreset} size="lg" type="button">Save preset</Button>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {activeTab === "saved" ? (
        <Card>
          <CardHeader eyebrow="Presets" title="Saved reports" />
          <CardContent>
            <DataTable
              columns={[
                { key: "reportName", label: "Report" },
                { key: "module", label: "Module" },
                { key: "visibility", label: "Visibility", render: (value) => <Badge tone="info">{value}</Badge> },
                { key: "updatedAt", label: "Updated", render: (value) => new Date(value).toLocaleString("en-IN") },
                {
                  key: "actions",
                  label: "Actions",
                  render: (_value, row) => (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          setBuilder({
                            ...row.filters,
                            module: row.module,
                            fields: row.columns,
                            exportFormat: row.exportFormat,
                            chartType: row.chartType,
                            sortingField: row.sorting?.field || "",
                            sortingDirection: row.sorting?.direction || "desc",
                            reportTitle: row.reportName,
                          });
                          setActiveTab("builder");
                        }}
                        size="sm"
                        type="button"
                      >
                        Load
                      </Button>
                      <Button
                        onClick={async () => {
                          await api.delete(`/reports/saved/${row._id}`);
                          await loadReportMeta();
                        }}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              rows={savedReports}
            />
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "preview" ? (
        <Card>
          <CardHeader eyebrow="Preview" title={builder.reportTitle} />
          <CardContent className="space-y-4">
            {preview ? (
              <>
                <Badge tone="success">{preview.module}</Badge>
                <DataTable columns={preview.columns.map((column) => ({ key: column, label: column }))} rows={preview.rows} />
              </>
            ) : (
              <p className="text-sm text-[var(--color-foreground-muted)]">Generate a preview from the custom builder to inspect rows before exporting.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
