import type { GraphNode } from '../lib/supabase';

export interface PositionedGraphNode extends GraphNode {
  position: { x: number; y: number };
}

/**
 * Calculate hierarchical layout for graph nodes
 * Places nodes in concentric circles based on their degree
 * @param nodes - Array of graph nodes
 * @returns Nodes with calculated positions
 */
export function calculateHierarchicalLayout(nodes: GraphNode[]): PositionedGraphNode[] {
  const centerX = 400; // Center of canvas
  const centerY = 400;

  const selfNode = nodes.find(n => n.type === 'self');
  const firstDegree = nodes.filter(n => n.degree === 1);
  const secondDegree = nodes.filter(n => n.degree === 2);

  const positioned: PositionedGraphNode[] = [];

  // Self node at center
  if (selfNode) {
    positioned.push({
      ...selfNode,
      position: { x: centerX, y: centerY },
    });
  }

  // First degree friends in inner circle (radius 200px)
  const radius1 = 200;
  firstDegree.forEach((node, i) => {
    const angle = (i / firstDegree.length) * 2 * Math.PI;
    positioned.push({
      ...node,
      position: {
        x: centerX + radius1 * Math.cos(angle),
        y: centerY + radius1 * Math.sin(angle),
      },
    });
  });

  // Second degree friends in outer circle (radius 400px)
  const radius2 = 400;
  secondDegree.forEach((node, i) => {
    const angle = (i / secondDegree.length) * 2 * Math.PI;
    positioned.push({
      ...node,
      position: {
        x: centerX + radius2 * Math.cos(angle),
        y: centerY + radius2 * Math.sin(angle),
      },
    });
  });

  console.log(`📐 Layout calculated: ${positioned.length} nodes positioned`);
  console.log(`  - Center: 1 node`);
  console.log(`  - Inner circle (${radius1}px): ${firstDegree.length} nodes`);
  console.log(`  - Outer circle (${radius2}px): ${secondDegree.length} nodes`);

  return positioned;
}

