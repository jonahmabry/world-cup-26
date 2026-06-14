## ADDED Requirements

### Requirement: Indicate provisional (live) rows
The group tables UI SHALL visually indicate any standings row whose result is provisional (reflects an
in-progress match), so users understand that the row is live and subject to change before full time.

#### Scenario: Live row indicator
- **WHEN** a standings row is returned with `provisional: true`
- **THEN** the UI SHALL display a visible LIVE indicator on that row, distinct from the existing
  qualification color coding and the tied-pending-ranking indicator

#### Scenario: Settled row has no live indicator
- **WHEN** a standings row is returned with `provisional: false`
- **THEN** the UI SHALL NOT display the LIVE indicator on that row
