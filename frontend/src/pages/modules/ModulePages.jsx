import { useEffect, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { FilterBar } from "../../components/ui/FilterBar";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { useConnectivity } from "../../context/ConnectivityContext";
import { offlineDb } from "../../services/offline-db";
import { getBreadcrumbs } from "../../utils/breadcrumbs";

function PageScaffold({ eyebrow, title, description, actionLabel, filters, searchPlaceholder, children }) {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader
        actions={actionLabel ? <Button size="lg" type="button">{actionLabel}</Button> : null}
        breadcrumbs={getBreadcrumbs(location.pathname)}
        description={description}
        eyebrow={eyebrow}
        title={title}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar className="w-full lg:max-w-md" placeholder={searchPlaceholder} />
        <FilterBar filters={filters} />
      </div>
      {children}
    </div>
  );
}

export function RegisterPatientPage() {
  const navigate = useNavigate();
  const { isOnline, queueMutation } = useConnectivity();
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "female",
    phone: "",
    bloodGroup: "",
    village: "",
    district: "",
    state: "Tamil Nadu",
    pinCode: "",
    guardianName: "",
    emergencyContact: "",
    occupation: "",
    insurance: "",
    disability: "",
    medicalHistory: "",
    chronicDiseases: "",
    allergies: "",
    currentMedications: "",
    heightCm: "",
    weightKg: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  useEffect(() => {
    offlineDb.get("draftForms", "patient-registration").then((draft) => {
      if (draft) {
        setFormState((current) => ({ ...current, ...draft }));
      }
    });
  }, []);

  useEffect(() => {
    offlineDb.set("draftForms", "patient-registration", formState);
  }, [formState]);

  async function runDuplicateCheck() {
    const hasEnoughInput = formState.firstName && (formState.phone || formState.dateOfBirth || formState.village);

    if (!isOnline || !hasEnoughInput) {
      setDuplicateMatches([]);
      return [];
    }

    setCheckingDuplicates(true);

    try {
      const response = await api.post("/patients/duplicate-check", {
        firstName: formState.firstName,
        lastName: formState.lastName,
        dateOfBirth: formState.dateOfBirth,
        phone: formState.phone,
        village: formState.village,
        guardianName: formState.guardianName,
        gender: formState.gender,
      });
      setDuplicateMatches(response.data.data);
      return response.data.data;
    } catch {
      setDuplicateMatches([]);
      return [];
    } finally {
      setCheckingDuplicates(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    const payload = {
      firstName: formState.firstName,
      lastName: formState.lastName,
      dateOfBirth: formState.dateOfBirth,
      gender: formState.gender,
      phone: formState.phone,
      bloodGroup: formState.bloodGroup,
      guardianName: formState.guardianName,
      emergencyContact: formState.emergencyContact,
      occupation: formState.occupation,
      insurance: formState.insurance,
      disability: formState.disability,
      address: {
        village: formState.village,
        district: formState.district,
        state: formState.state,
        pinCode: formState.pinCode,
      },
      medicalFlags: {
        medicalHistory: formState.medicalHistory ? formState.medicalHistory.split(",").map((item) => item.trim()).filter(Boolean) : [],
        chronicDiseases: formState.chronicDiseases ? formState.chronicDiseases.split(",").map((item) => item.trim()).filter(Boolean) : [],
        allergies: formState.allergies ? formState.allergies.split(",").map((item) => item.trim()).filter(Boolean) : [],
        currentMedications: formState.currentMedications ? formState.currentMedications.split(",").map((item) => item.trim()).filter(Boolean) : [],
      },
      vitals: {
        heightCm: formState.heightCm ? Number(formState.heightCm) : undefined,
        weightKg: formState.weightKg ? Number(formState.weightKg) : undefined,
      },
    };

    try {
      if (!isOnline) {
        await queueMutation({ method: "post", url: "/patients", body: payload });
        setErrorMessage("Saved offline. This registration will synchronize when connection returns.");
        return;
      }

      const matches = await runDuplicateCheck();
      if (matches.some((item) => item.matchPercentage >= 70)) {
        setErrorMessage("Possible duplicate patient found. Review the suggested matches below before creating a new record.");
        return;
      }

      const response = await api.post("/patients", payload);

      await offlineDb.set("draftForms", "patient-registration", null);
      navigate(`/patients/${response.data.data.patientId}`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to register patient");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={getBreadcrumbs("/patients/register")}
        description="This registration form is now connected to the secured patient creation API."
        eyebrow="Registration"
        title="Register patient"
      />

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input label="First name" onChange={(event) => setFormState((current) => ({ ...current, firstName: event.target.value }))} value={formState.firstName} />
          <Input label="Last name" onBlur={runDuplicateCheck} onChange={(event) => setFormState((current) => ({ ...current, lastName: event.target.value }))} value={formState.lastName} />
          <Input label="Date of birth" onBlur={runDuplicateCheck} onChange={(event) => setFormState((current) => ({ ...current, dateOfBirth: event.target.value }))} type="date" value={formState.dateOfBirth} />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--color-foreground)]">Gender</span>
            <select className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-4 py-3 text-sm" onChange={(event) => setFormState((current) => ({ ...current, gender: event.target.value }))} value={formState.gender}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <Input label="Phone" onBlur={runDuplicateCheck} onChange={(event) => setFormState((current) => ({ ...current, phone: event.target.value }))} value={formState.phone} />
          <Input label="Blood group" onChange={(event) => setFormState((current) => ({ ...current, bloodGroup: event.target.value }))} value={formState.bloodGroup} />
          <Input label="Village" onBlur={runDuplicateCheck} onChange={(event) => setFormState((current) => ({ ...current, village: event.target.value }))} value={formState.village} />
          <Input label="District" onChange={(event) => setFormState((current) => ({ ...current, district: event.target.value }))} value={formState.district} />
          <Input label="PIN code" onChange={(event) => setFormState((current) => ({ ...current, pinCode: event.target.value }))} value={formState.pinCode} />
          <Input label="Guardian" onChange={(event) => setFormState((current) => ({ ...current, guardianName: event.target.value }))} value={formState.guardianName} />
          <Input label="Emergency contact" onChange={(event) => setFormState((current) => ({ ...current, emergencyContact: event.target.value }))} value={formState.emergencyContact} />
          <Input label="Occupation" onChange={(event) => setFormState((current) => ({ ...current, occupation: event.target.value }))} value={formState.occupation} />
          <Input label="Insurance" onChange={(event) => setFormState((current) => ({ ...current, insurance: event.target.value }))} value={formState.insurance} />
          <Input label="Disability" onChange={(event) => setFormState((current) => ({ ...current, disability: event.target.value }))} value={formState.disability} />
          <Input label="Height (cm)" onChange={(event) => setFormState((current) => ({ ...current, heightCm: event.target.value }))} type="number" value={formState.heightCm} />
          <Input label="Weight (kg)" onChange={(event) => setFormState((current) => ({ ...current, weightKg: event.target.value }))} type="number" value={formState.weightKg} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Input hint="Comma separated" label="Medical history" onChange={(event) => setFormState((current) => ({ ...current, medicalHistory: event.target.value }))} value={formState.medicalHistory} />
          <Input hint="Comma separated" label="Chronic diseases" onChange={(event) => setFormState((current) => ({ ...current, chronicDiseases: event.target.value }))} value={formState.chronicDiseases} />
          <Input hint="Comma separated" label="Allergies" onChange={(event) => setFormState((current) => ({ ...current, allergies: event.target.value }))} value={formState.allergies} />
          <Input hint="Comma separated" label="Current medications" onChange={(event) => setFormState((current) => ({ ...current, currentMedications: event.target.value }))} value={formState.currentMedications} />
        </section>

        {checkingDuplicates ? <p className="text-sm text-[var(--color-foreground-muted)]">Checking for similar patient records...</p> : null}
        {duplicateMatches.length ? (
          <div className="rounded-[1.6rem] border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="mt-1 text-amber-400" size={18} />
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Possible duplicate records found</p>
                {duplicateMatches.map((match) => (
                  <div className="rounded-[1.2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3" key={match.patientId}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-foreground)]">{match.fullName}</p>
                        <p className="text-xs text-[var(--color-foreground-muted)]">Match {match.matchPercentage}% | {match.matchingFields.join(", ") || "manual review needed"}</p>
                      </div>
                      <Link to={`/patients/${match.patientId}`}>
                        <Button size="sm" type="button" variant="secondary">Open patient</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
        {errorMessage ? <p className="text-sm text-[var(--color-danger)]">{errorMessage}</p> : null}

        <div className="flex gap-3">
          <Button size="lg" type="submit">{saving ? "Saving..." : "Create patient record"}</Button>
          <Link to="/patients">
            <Button size="lg" type="button" variant="secondary">Back to patient list</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export function VisitHistoryPage() {
  return (
    <PageScaffold
      description="Clinical history timeline, filters, and longitudinal review scaffolding for reception and doctors."
      eyebrow="Visit History"
      filters={["This Week", "Doctor", "Chronic Cases"]}
      searchPlaceholder="Search by visit ID, diagnosis, or patient..."
      title="Visit history"
    >
      <EmptyState
        description="Patient-level visit timelines are now live inside each patient profile. This global page remains ready for broader search and filtering."
        title="Visit timeline workspace ready"
      />
    </PageScaffold>
  );
}

export function CalendarPage() {
  return (
    <PageScaffold actionLabel="New slot" description="Calendar-first operational view for patient booking and clinician block management." eyebrow="Calendar" filters={["Day", "Week", "Month"]} searchPlaceholder="Search for calendar events..." title="Appointment calendar">
      <Card>
        <CardHeader eyebrow="Calendar Canvas" title="Scheduling grid placeholder" />
        <CardContent>
          <EmptyState description="This visual placeholder stands in for the premium calendar surface that will be connected next." title="Calendar layout staged" />
        </CardContent>
      </Card>
    </PageScaffold>
  );
}
