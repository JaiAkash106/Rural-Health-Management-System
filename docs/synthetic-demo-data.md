# Synthetic Demo Dataset

Run this only for the public academic demonstration environment. All seeded people, contact details, clinical records, stock, and operational activity are fictional.

```bash
npm run seed:demo
```

The command is idempotent: rerunning it keeps the existing `RHMS-DEMO` records and creates any records that are missing. It creates a demonstration organization and PHC, role accounts, 12 fictional patients, households, visits, appointments, live queue entries, pharmacy stock and dispensing records, laboratory requests/results, vaccination records, follow-up tasks, referral/consent data, alerts, notifications, outreach planning, operations handover, device/integration status, reports, and audit events.

Do not run this command in an environment containing real patient or clinical data.
