/**
 * Phase 3 configurator exclusivity smoke (pure logic).
 * Run: node scripts/phase3-configurator-unit.mjs
 */

function getOptionGroupKey(optionId) {
  const match = optionId.match(/^(.*)-\d+$/);
  return match?.[1] ?? optionId;
}

function getOptionBaseName(name) {
  return name
    .replace(/\s*[（(][^）)]*[）)]\s*$/u, '')
    .trim()
    .toLowerCase();
}

function optionConflictsWith(candidate, selected) {
  if (candidate.id === selected.id) return false;
  return (
    getOptionGroupKey(candidate.id) === getOptionGroupKey(selected.id) ||
    getOptionBaseName(candidate.name) === getOptionBaseName(selected.name)
  );
}

function toggleExclusiveOption(currentIds, optionId, catalogOptions) {
  if (currentIds.includes(optionId)) {
    return currentIds.filter((id) => id !== optionId);
  }

  const selected = catalogOptions.find((option) => option.id === optionId);
  if (!selected) {
    return [...currentIds, optionId];
  }

  const byId = new Map(catalogOptions.map((option) => [option.id, option]));

  return [
    ...currentIds.filter((id) => {
      const existing = byId.get(id);
      return !existing || !optionConflictsWith(existing, selected);
    }),
    optionId,
  ];
}

function calculateConfiguratorTotal(basePrice, bodyColor, interiorColor, options) {
  return (
    basePrice +
    (bodyColor?.price ?? 0) +
    (interiorColor?.price ?? 0) +
    options.reduce((sum, option) => sum + (option.price ?? 0), 0)
  );
}

function assertEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg}\n expected ${e}\n actual   ${a}`);
}

const catalog = [
  { id: 'mirror-001', name: 'Door mirror cover (Red)', price: 100 },
  { id: 'cover-002', name: 'Door mirror cover (Carbon fiber look)', price: 200 },
  { id: 'roof-001', name: 'Roof rails', price: 300 },
];

const afterRed = toggleExclusiveOption([], 'mirror-001', catalog);
assertEqual(afterRed, ['mirror-001'], 'select red mirror');

const afterCarbon = toggleExclusiveOption(afterRed, 'cover-002', catalog);
assertEqual(afterCarbon, ['cover-002'], 'carbon replaces red by base name');

const withRoof = toggleExclusiveOption(afterCarbon, 'roof-001', catalog);
assertEqual(withRoof, ['cover-002', 'roof-001'], 'roof can coexist');

const total = calculateConfiguratorTotal(
  10000,
  { price: 500 },
  { price: 0 },
  catalog.filter((o) => withRoof.includes(o.id)),
);
assertEqual(total, 11000, 'pricing total');

console.log('\nPhase 3 configurator unit OK\n');
console.log('✓ exclusive options by base name');
console.log('✓ exclusive options keep unrelated options');
console.log('✓ pricing total');
