import { useState } from "react";
import sha1 from "sha1";
import hexDecConv from "hex2dec";
import { Node } from "../utils";
import Xarrow from "react-xarrows";

export default function Home() {
  const [nodes, setNodes] = useState([]);
  const [newNodeVal, setNewNodeVal] = useState("");
  const [newKeyVal, setNewKeyVal] = useState("");
  const [showKeys, setShowKeys] = useState([]);

  const getId = (str) => {
    const digest = sha1(str);
    return hexDecConv.hexToDec(`0x${digest}`);
  };
  const addNode = () => {
    const id = getId(newNodeVal);
    const nodeAlreadyPresent = nodes.find((node) => node.id === id);
    if (!nodeAlreadyPresent) makeNewNodeAndStabilize(id);
    else alert("Node already present");
  };

  const makeNewNodeAndStabilize = (id) => {
    let predecessor = null;
    const tempNodes = [...nodes];
    const keysForNewNode = [];
    for (const tempNode of tempNodes) {
      if (parseInt(tempNode.id) > parseInt(id)) {
        tempNode.keys = tempNode.keys.filter((key) => {
          if (parseInt(key) > parseInt(id)) {
            return true;
          } else {
            keysForNewNode.push(key);
            return false;
          }
        });
        break;
      }
      predecessor = tempNode;
    }
    const newNode = new Node(id, keysForNewNode);
    tempNodes.push(newNode);
    tempNodes = tempNodes.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    if (!predecessor && tempNodes.length > 0) {
      predecessor = tempNodes[tempNodes.length - 1];
      predecessor.calculateFingerTable(tempNodes);
    }
    tempNodes.forEach((tempNode) => tempNode.calculateFingerTable(tempNodes));
    console.log(tempNodes);
    setNodes(tempNodes);
  };

  const removeNode = (id) => {
    const tempNodes = [...nodes];
    const index = tempNodes.findIndex((tempNode) => tempNode.id === id);
    if (index < 0) {
      alert("No node found");
      return;
    }
    let predecessor = null;
    let successor = null;
    if (tempNodes.length > 1) {
      if (index === 0) predecessor = tempNodes[tempNodes.length - 1];
      else predecessor = tempNodes[1];
      if (index + 1 < tempNodes.length) successor = tempNodes[index + 1];
      else if (index - 1 >= 0) successor = tempNodes[index - 1];
    }
    const removedNode = tempNodes.splice(index, 1);

    if (predecessor) predecessor.calculateFingerTable(tempNodes);
    if (successor) successor.keys.push(...removedNode[0].keys);
    tempNodes.forEach((tempNode) => tempNode.calculateFingerTable(tempNodes));
    setNodes(tempNodes);
  };

  const addKey = () => {
    const id = getId(newKeyVal);
    const tempNodes = [...nodes];
    let possibleNode = -1;
    tempNodes.forEach((tempNode, i) => {
      if (parseInt(tempNode.id) > parseInt(id)) {
        return;
      }
      possibleNode = i;
    });
    if (possibleNode >= 0) {
      tempNodes[possibleNode].keys.push(id);
      setNodes(tempNodes);
    }
  };

  const changeNodeKeysDisplay = (index, val) => {
    const temp = [...showKeys];
    temp[index] = val;
    setShowKeys(temp);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        <input
          placeholder="IP address:port"
          value={newNodeVal}
          onChange={(e) => setNewNodeVal(e.currentTarget.value)}
        />
        <button onClick={addNode}>Make new node</button>
        <input
          placeholder="Resource name"
          value={newKeyVal}
          onChange={(e) => setNewKeyVal(e.currentTarget.value)}
        />
        <button onClick={addKey}>Make new resource</button>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 50,
          marginLeft: "5vw",
          width: "90vw",
          height: "80vh",
        }}
      >
        {nodes.map((node, i) => {
          const mult = 10 * Math.ceil(nodes.length / 6);
          const x = (Math.cos(i) + 1) * (120 + nodes.length * mult);
          const y = (Math.sin(i) + 1) * (120 + nodes.length * mult);
          const alreadyIncluded = {};
          return (
            <button
              className={node.id}
              id={node.id}
              key={i}
              onMouseEnter={() => {
                changeNodeKeysDisplay(i, true);
              }}
              onMouseLeave={() => {
                changeNodeKeysDisplay(i, false);
              }}
              style={{
                padding: 20,
                height: 120,
                width: 120,
                position: "absolute",
                top: y,
                left: x,
                borderRadius: "50%",
                backgroundColor: "white",
                textAlign: "left",
                wordWrap: "break-word",
              }}
              onClick={() => removeNode(node.id)}
            >
              {node.id}
              {showKeys[i] && (
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    wordWrap: "break-word",
                    height: 100,
                    width: 100,
                  }}
                >
                  {node.keys.map((key) => {
                    return (
                      <div
                        style={{
                          borderBottomWidth: 2,
                          backgroundColor: "rgb(200,200,200)",
                          padding: 10,
                        }}
                        key={key}
                      >
                        {key}
                      </div>
                    );
                  })}
                </div>
              )}
              {showKeys[i] &&
                node.fingerTable.map((fingerNode) => {
                  const key = `${fingerNode.id}-${node.id}`;
                  for (
                    const i = 0;
                    i < Object.keys(alreadyIncluded).length;
                    i++
                  ) {
                    if (key === Object.keys(alreadyIncluded)[i]) return;
                  }
                  alreadyIncluded[key] = key;
                  return (
                    <Xarrow
                      end={fingerNode.id}
                      start={node.id}
                      key={key}
                      strokeWidth={2}
                      color="black"
                      curveness={0.5}
                    />
                  );
                })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
