export class Node {
  id;
  fingerTable;
  keys;

  constructor(id) {
    this.id = id;
    this.fingerTable = [];
    this.keys = [];
  }

  calculateFingerTable = (nodes) => {
    const tempFingerTable = [];
    if (nodes.length <= 1) return;
    for (let i = 0; i < 160; i++) {
      const fingerId = (parseInt(this.id) + Math.pow(2, i)) % Math.pow(2, 160);
      let possibleNode = null;
      for (const node of nodes) {
        if (parseInt(this.id) === parseInt(node.id)) continue;
        else if (parseInt(node.id) < fingerId) continue;
        possibleNode = node;
        break;
      }
      if (!possibleNode && parseInt(nodes[0].id) !== parseInt(this.id)) {
        possibleNode = nodes[0];
      }
      if (possibleNode) tempFingerTable.push(possibleNode);
    }
    this.fingerTable = tempFingerTable;
  };
}
