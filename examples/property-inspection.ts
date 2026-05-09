/**
 * Example: Property Condition Verification via MCP Tool
 *
 * This example demonstrates how an AI agent (Claude, GPT-4, etc.)
 * would call the meatspace-agent MCP server to dispatch a real-world
 * property inspection task to RentAHuman.ai.
 *
 * Run with: npx ts-node examples/property-inspection.ts
 */

import { handleToolCall } from '../src/mcp/tools';

async function runExample() {
  console.log('=== meatspace-agent: Property Inspection Example ===\n');

  // Step 1: Safety check a task before posting
  console.log('Step 1: Running safety check...');
  const safetyResult = await handleToolCall('check_safety', {
    title: 'Exterior Property Condition Verification - 1823 Del Paso Blvd, Sacramento CA 95815',
    description: 'Photograph the exterior of the property from all four sides plus front and back yards. DO NOT enter the property.',
    category: 'property_inspection',
    location: '1823 Del Paso Blvd, Sacramento, CA 95815',
    budget: 75,
  });
  console.log('Safety result:', JSON.stringify(safetyResult, null, 2));

  if (!(safetyResult as any).approved) {
    console.log('\nTask rejected by safety gate. Exiting.');
    process.exit(1);
  }

  // Step 2: Create a property inspection task
  console.log('\nStep 2: Creating property inspection task on RentAHuman.ai...');
  const inspectionResult = await handleToolCall('create_property_inspection', {
    address: '1823 Del Paso Blvd, Sacramento, CA 95815',
    client_name: 'Sacramento Realty Group - Agent Maria Torres',
    due_date: new Date(Date.now() + 2 * 86_400_000).toISOString(), // 2 days from now
    budget_usd: 75,
    notes: 'Pay special attention to the roof line and front fence condition. Client is preparing a rental listing.',
  });
  console.log('Inspection result:', JSON.stringify(inspectionResult, null, 2));

  // Step 3: Show what the agent would tell the client
  const result = inspectionResult as any;
  if (result.success) {
    console.log('\n=== SUCCESS ===');
    console.log(`Task ID: ${result.task_id}`);
    console.log(`Status: ${result.status}`);
    console.log(`Message: ${result.message}`);
    if (result.bounty_id) {
      console.log(`Bounty ID: ${result.bounty_id}`);
    }
    if (result.assigned_worker) {
      console.log(`Assigned Worker: ${result.assigned_worker}`);
    }
    console.log('\nNext steps:');
    console.log('1. Worker will be dispatched to the property');
    console.log('2. Photos and condition form will be submitted through the task portal');
    console.log('3. You will receive a notification when evidence is ready for review');
    console.log('4. Approve the evidence to release payment to the worker');
  } else {
    console.log('\n=== TASK FAILED ===');
    console.log(`Status: ${result.status}`);
    console.log(`Message: ${result.message}`);
  }

  // Step 4: Example errand task
  console.log('\n=== Step 4: Errand Task Example ===');
  const errandResult = await handleToolCall('create_errand_task', {
    title: 'Pick up lockbox keys from property management office',
    description: 'Pick up a set of lockbox keys from Sacramento Property Management at 2400 Professional Drive, Sacramento. Drop off at 1823 Del Paso Blvd, leave in mailbox.',
    location: '2400 Professional Drive, Sacramento, CA 95825',
    due_date: new Date(Date.now() + 86_400_000).toISOString(), // tomorrow
    budget_usd: 35,
  });
  console.log('Errand result:', JSON.stringify(errandResult, null, 2));
}

runExample().catch((err) => {
  console.error('Example failed:', err);
  process.exit(1);
});
