# Safety Policy

Build the policy layer first, not last. This document defines the minimum safety rules enforced by the meatspace-agent before any task is published on RentAHuman.ai.

## Absolute Prohibitions (Hard Blocks)

The following task types are **always rejected** by the policy gate:

### Illegal / Deceptive Work
- No surveillance, covert, or stalking tasks
- No impersonation or credential misuse
- No fraud, scam facilitation, or deceptive practices

### Trespass / Unauthorized Access
- No tasks requiring entry to private property without authorization
- No bypassing security, locks, or access controls

### Minors
- No tasks involving humans under 18
- No tasks in or near schools, daycares, or child-focused venues

### Sensitive Data Collection
- No collecting PII (SSN, DOB, financial data) unless explicitly lawful
- No capturing private documents, contracts, or personal correspondence
- No medical record access or health data collection

### High-Risk Physical Labor
- No heavy lifting, hazardous materials, or dangerous environments
- No tasks at heights, in water, or involving machinery
- No animal handling or pest control

### Medical / Legal / Emergency
- No medical tasks, pharmacy work, or health assessments
- No legal document filing, court appearances, or legal representation
- No emergency response, 911 tasks, or urgent interventions
- No financial transactions requiring personal funds

## Conditional Restrictions (Require Review)

The following require **human admin review** before publishing:

- Tasks over $100 budget
- Tasks requiring overnight or late-night hours
- Tasks in high-crime zones
- Tasks involving alcohol, tobacco, or cannabis
- Tasks at financial institutions or government buildings

## Required Safeguards

Every published task MUST include:

1. **Clear Scope**: Specific, bounded instructions
2. **Time Window**: Defined start/end times (no open-ended tasks)
3. **Location**: Exact address or geofence boundary
4. **Evidence Plan**: What proof will be collected
5. **Payment Terms**: Agreed budget before work begins

## Worker Protection Rules

- Workers can decline any task without penalty
- Workers can report unsafe conditions in real-time
- Workers are never asked to use personal funds
- Workers have access to support and dispute resolution

## Audit Trail

- Every task decision is logged with policy gate results
- Every blocked task is recorded with rejection reason
- Every admin override is flagged and reviewed
- Full audit trail maintained per [Audit Ledger](../src/types/audit.ts)

## Enforcement

Policy checks run at two points:
1. **Pre-publish**: Every bounty post is evaluated before posting to RentAHuman
2. **Post-assignment**: Worker-submitted evidence is verified against policy

See [Policy YAMLs](../policies/) for machine-readable rule definitions.
