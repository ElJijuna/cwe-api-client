import { CweClient } from '../dist/index.js';

const cwe = new CweClient();

cwe.on('request', (e) => {
  console.log(`  [${e.durationMs}ms] ${e.method} ${e.url}`);
});

async function test() {
  // Content version metadata
  console.log('\n--- version() ---');
  const version = await cwe.version();
  console.log('Content version:', version.ContentVersion, '— Date:', version.ContentDate);
  console.log(`Weaknesses: ${version.TotalWeaknesses}, Categories: ${version.TotalCategories}, Views: ${version.TotalViews}`);

  // Multi-ID lookup
  console.log('\n--- lookup([74, 79]) ---');
  const entries = await cwe.lookup([74, 79]);
  entries.forEach(e => console.log(`  CWE-${e.ID} (${e.Type})`));

  // Full weakness details
  console.log('\n--- weakness(79) ---');
  const weakness = await cwe.weakness(79);
  console.log('Name:', weakness.Name);
  console.log('Abstraction:', weakness.Abstraction, '— Status:', weakness.Status);
  console.log('Likelihood of exploit:', weakness.LikelihoodOfExploit);

  // Category details
  console.log('\n--- category(189) ---');
  const category = await cwe.category(189);
  console.log('Name:', category.Name, '— Status:', category.Status);
  console.log('Summary:', category.Summary);

  // View details
  console.log('\n--- view(1425) ---');
  const view = await cwe.view(1425);
  console.log('Name:', view.Name);
  console.log('Type:', view.Type, '— Status:', view.Status);
  console.log('Members:', view.Members?.length ?? 0);

  // Hierarchy: direct parents
  console.log('\n--- weakness(74).parents(1000) ---');
  const parents = await cwe.weakness(74).parents(1000);
  parents.forEach(p => console.log(`  CWE-${p.ID} (${p.Type})${p.Primary_Parent ? ' [primary]' : ''}`));

  // Hierarchy: direct children
  console.log('\n--- weakness(74).children(1000) ---');
  const children = await cwe.weakness(74).children(1000);
  children.forEach(c => console.log(`  CWE-${c.ID} (${c.Type})`));

  // Hierarchy: ancestor tree
  console.log('\n--- weakness(74).ancestors(1000) ---');
  const ancestors = await cwe.weakness(74).ancestors(1000);
  function printAncestors(nodes, indent = 0) {
    for (const node of nodes) {
      console.log(' '.repeat(indent * 2) + `CWE-${node.Data.ID} (${node.Data.Type})`);
      if (node.Parents) printAncestors(node.Parents, indent + 1);
    }
  }
  printAncestors(ancestors);

  // Hierarchy: descendant tree
  console.log('\n--- weakness(74).descendants(1000) ---');
  const descendants = await cwe.weakness(74).descendants(1000);
  function printDescendants(nodes, indent = 0) {
    for (const node of nodes) {
      console.log(' '.repeat(indent * 2) + `CWE-${node.Data.ID} (${node.Data.Type})`);
      if (node.Children) printDescendants(node.Children, indent + 1);
    }
  }
  printDescendants(descendants);
}

test().catch(console.error);
