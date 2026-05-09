import { EvidenceItem } from '../types/evidence';
import { EvidenceSpec } from '../agent/planner';

export interface ValidationResult {
  valid: boolean;
  missingRequired: string[];
  invalidItems: Array<{ label: string; reason: string }>;
  warnings: string[];
  score: number; // 0-100 completeness score
}

/**
 * Validates that all required evidence has been submitted
 * and meets basic quality criteria.
 */
export function validateEvidence(
  items: EvidenceItem[],
  specs: EvidenceSpec[]
): ValidationResult {
  const missingRequired: string[] = [];
  const invalidItems: Array<{ label: string; reason: string }> = [];
  const warnings: string[] = [];

  const submittedMap = new Map(
    items.filter((i) => i.status === 'submitted').map((i) => [i.label, i])
  );

  for (const spec of specs) {
    const submitted = submittedMap.get(spec.label);

    if (!submitted) {
      if (spec.required) {
        missingRequired.push(spec.label);
      } else {
        warnings.push(`Optional evidence not submitted: ${spec.label}`);
      }
      continue;
    }

    // Type check
    if (submitted.type !== spec.type) {
      invalidItems.push({
        label: spec.label,
        reason: `Expected type ${spec.type}, got ${submitted.type}`,
      });
    }

    // Photo-specific validations
    if (spec.type === 'photo') {
      if (!submitted.url) {
        invalidItems.push({ label: spec.label, reason: 'No photo URL provided' });
      } else if (!isValidPhotoUrl(submitted.url)) {
        invalidItems.push({ label: spec.label, reason: 'Photo URL appears invalid' });
      }
    }

    // Geotag validation
    if (spec.type === 'geotag') {
      if (!submitted.metadata?.lat || !submitted.metadata?.lng) {
        invalidItems.push({ label: spec.label, reason: 'Geotag missing lat/lng coordinates' });
      }
    }

    // Timestamp check - evidence should be recent (within 24 hours)
    if (submitted.submittedAt) {
      const ageHours = (Date.now() - new Date(submitted.submittedAt).getTime()) / 3_600_000;
      if (ageHours > 24) {
        warnings.push(`Evidence "${spec.label}" is older than 24 hours`);
      }
    }
  }

  const totalRequired = specs.filter((s) => s.required).length;
  const submittedRequired = totalRequired - missingRequired.length;
  const score = totalRequired > 0 ? Math.round((submittedRequired / totalRequired) * 100) : 100;

  return {
    valid: missingRequired.length === 0 && invalidItems.length === 0,
    missingRequired,
    invalidItems,
    warnings,
    score,
  };
}

function isValidPhotoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  lines.push(`Evidence Validation: ${result.valid ? 'PASSED' : 'FAILED'} (score: ${result.score}/100)`);

  if (result.missingRequired.length > 0) {
    lines.push(`Missing required: ${result.missingRequired.join(', ')}`);
  }

  if (result.invalidItems.length > 0) {
    lines.push('Invalid items:');
    for (const item of result.invalidItems) {
      lines.push(`  - ${item.label}: ${item.reason}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push('Warnings:');
    for (const warning of result.warnings) {
      lines.push(`  - ${warning}`);
    }
  }

  return lines.join('\n');
}
