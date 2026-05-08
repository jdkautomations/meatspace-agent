# Dispute Playbook

Procedure for handling disputes between the meatspace-agent, workers, and task requesters on RentAHuman.ai.

## Dispute Types

### Worker Disputes
- **Payment not received**: Worker claims task completed, no payout
- **Scope creep**: Task expanded beyond original agreement
- **Safety concern**: Worker reports unsafe conditions
- **Cancellation**: Bounty cancelled mid-task

### Requester/Agent Disputes
- **Incomplete work**: Evidence submitted doesn't match requirements
- **Late delivery**: Task completed after agreed window
- **Quality issues**: Evidence quality below standard
- **Fraud**: Suspicion of fake evidence or identity

## Dispute Resolution Flow

```
dispute.opened
    -> evidence review (both parties submit)
    -> agent assessment (policy check + manual review)
    -> decision: pay worker / refund requester / partial / investigate further
    -> resolution logged to audit trail
```

## Resolution Guidelines

| Issue | Action | Payout |
|-------|--------|--------|
| Complete work, minor quality | Accept | Full, minus 5% |
| Partial work, on time | Partial accept | Pro-rated |
| No-show, wrong location | Reject | $0 |
| Safety concern, justified | Pay + investigate | Full + bonus |
| Fraud, fake evidence | Reject + report | $0 |
| Scope creep by requester | Accept | Full + extra |

## Escalation

1. **Level 1**: Automated agent review (instant)
2. **Level 2**: Human admin review (target: 24 hours)
3. **Level 3**: Mediation between parties (target: 48 hours)
4. **Level 4**: External arbitration (for high-value disputes)

## Worker Protections

- Workers can appeal Level 1 decisions within 7 days
- Workers keep evidence even if dispute not resolved
- Workers retain reputation history independent of disputed tasks

## Requester Protections

- Requesters can request revision before disputing
- Requesters receive full evidence package for disputed tasks
- Repeat offenders flagged in audit ledger

## Integration

Disputes use RentAHuman's `update_bounty` to modify task status and `start_conversation` to communicate with parties. All dispute events written via `audit.append`.
