import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('TravelGraph State Schema & Default Initialization Contract', () => {
  const stateFile = fs.readFileSync(path.resolve('src/lib/agents/state.ts'), 'utf8');
  assert.ok(stateFile.includes('export interface TravelGraphState'));
  assert.ok(stateFile.includes('export function createInitialState'));
});

test('Autonomous C-Suite Agency State Contract & Guardrails', () => {
  const agencyFile = fs.readFileSync(path.resolve('src/lib/agents/agencyState.ts'), 'utf8');
  assert.ok(agencyFile.includes('export interface AgencyState'));
  assert.ok(agencyFile.includes('targetROI: 3.0'));
  assert.ok(agencyFile.includes('targetDiscount: 40'));
});

test('Multi-Agent DAG Node Definitions Present', () => {
  const requiredNodes = [
    'src/lib/agents/c-suite/cfo.ts',
    'src/lib/agents/c-suite/market_researcher.ts',
    'src/lib/agents/c-suite/brand_strategist.ts',
    'src/lib/agents/execution/deal_hunter.ts',
    'src/lib/agents/execution/dispatcher.ts',
    'src/lib/agents/graph.ts',
  ];
  for (const relPath of requiredNodes) {
    assert.ok(fs.existsSync(path.resolve(relPath)), `Missing agent module: ${relPath}`);
  }
});
