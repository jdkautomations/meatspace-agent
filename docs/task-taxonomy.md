# Task Taxonomy

Structured classification of tasks the meatspace-agent can handle via RentAHuman.ai.

## Task Categories

### VERIFICATION (allowed, low-risk)

| Task | Description | Evidence Required | Max Budget |
|------|-------------|-------------------|------------|
| storefront-photo | Photo of business storefront | Photo + geotag + timestamp | $15 |
| shelf-price-check | Verify product/price on shelf | Photo + geotag + timestamp | $20 |
| parking-occupancy | Parking lot fill-rate snapshot | Photo + geotag + timestamp | $10 |
| wait-time-check | Current line length / wait estimate | Photo + text estimate | $8 |
| package-pickup | Confirm package available | Photo + geotag | $12 |
| public-notice | Verify posted sign/notice | Photo + text extract | $10 |
| door-hours | Confirm hours of operation | Photo + time check | $8 |
| local-handoff | Document/item exchange | Photo + geotag + signature | $25 |

### RESEARCH (allowed, medium-risk)

| Task | Description | Evidence Required | Max Budget |
|------|-------------|-------------------|------------|
| product-survey | Compare products across stores | Multiple photos | $30 |
| competitor-check | Service/pricing reconnaissance | Photo + notes | $25 |
| availability-scan | Stock/availability survey | Photo + text | $20 |

### PROHIBITED (blocked by policy gate)

- Any surveillance, covert, or stalking task
- Tasks requiring trespass or impersonation
- Tasks involving minors (under 18)
- Tasks collecting sensitive personal data
- Tasks requiring high-risk physical labor
- Medical, legal, or emergency-response tasks
- Any illegal, deceptive, or fraudulent task

## Task Lifecycle States

```
created -> posted -> applying -> assigned -> in_progress
       -> submitted -> verifying -> approved -> paid
       -> [disputed] -> [revised] -> [cancelled]
```
