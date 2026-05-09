import { runSafetyCheck } from '../src/agent/safety';
import { Task } from '../src/types/task';

// Minimal valid property inspection task for testing
const baseTask: Task = {
  id: 'test-1',
  title: 'Exterior Property Condition Verification - 1234 Oak St, Sacramento CA 95815',
  description: 'Photograph the exterior of the property from all four sides plus front and back yards.',
  category: 'property_inspection',
  location: '1234 Oak St, Sacramento, CA 95815',
  budget: 75,
  requiredSkills: ['photography'],
  estimatedHours: 1,
  dueDate: new Date(Date.now() + 86_400_000), // tomorrow
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('runSafetyCheck', () => {
  test('approves a valid property inspection task', async () => {
    const result = await runSafetyCheck(baseTask);
    expect(result.approved).toBe(true);
    expect(result.flags).toHaveLength(0);
  });

  test('rejects a task that exceeds the budget cap', async () => {
    const task = { ...baseTask, budget: 600 };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('exceeds maximum');
    expect(result.flags[0]).toContain('budget_exceeds_cap');
  });

  test('rejects a task that exceeds the duration cap', async () => {
    const task = { ...baseTask, estimatedHours: 10 };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('exceeds maximum');
  });

  test('rejects a task with prohibited keyword "surveillance"', async () => {
    const task = {
      ...baseTask,
      title: 'Property surveillance task',
      description: 'Monitor and conduct surveillance on neighbors',
    };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('prohibited term');
  });

  test('rejects a property inspection requesting interior access', async () => {
    const task = {
      ...baseTask,
      description: 'Enter the property and photograph all interior rooms',
    };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('exterior-only');
  });

  test('rejects a property inspection with missing location', async () => {
    const task = { ...baseTask, location: undefined };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('missing required fields');
  });

  test('rejects a task with a past due date', async () => {
    const task = { ...baseTask, dueDate: new Date('2020-01-01') };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('past');
  });

  test('rejects a task containing the word "trespass"', async () => {
    const task = {
      ...baseTask,
      description: 'Need someone to trespass on the neighboring property',
    };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(false);
  });

  test('rejects a task about a minor', async () => {
    const task = {
      ...baseTask,
      title: 'Check if the minor is home',
      description: 'Verify that the child is at the residence',
    };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(false);
  });

  test('approves a delivery task under budget', async () => {
    const task: Task = {
      ...baseTask,
      category: 'delivery',
      title: 'Deliver package from warehouse to customer',
      description: 'Pick up package at depot and deliver to customer address',
      location: '456 Elm Ave, Sacramento, CA 95814',
      budget: 40,
    };
    const result = await runSafetyCheck(task);
    expect(result.approved).toBe(true);
  });
});
