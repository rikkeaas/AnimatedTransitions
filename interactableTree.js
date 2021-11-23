var selectedNode = null;
var draggingNode = null;

function initiateDrag(d, domNode) {
    draggingNode = d;
    d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
    d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
    d3.select(domNode).attr('class', 'node activeDrag');

    svg.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
        if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
        else return -1; // a is the hovered element, bring "a" to the front
    });
    // if nodes has children, remove the links and nodes
    // if (nodes.length > 1) {
    //     // remove link paths
    //     var treeData = treemap(root);
    //     links = treeData.descendants().slice(1);
    //     nodePaths = svg.selectAll("path.link")
    //         .data(links, function(d) {
    //             return d.id;
    //         }).remove();
    //     // remove child nodes
    //     nodesExit = svg.selectAll("g.node")
    //         .data(nodes, function(d) {
    //             return d.id;
    //         }).filter(function(d, i) {
    //             if (d.id == draggingNode.id) {
    //                 return false;
    //             }
    //             return true;
    //         }).remove();
    // }

    // remove parent link
    // parentLink = links(tree.nodes(draggingNode.parent));
    svg.selectAll('path.link').filter(function(d, i) {
         if (d.id == draggingNode.id) {
             return true;
         }
         return false;
    }).remove();

    dragStarted = null;
}
  
function updateChildDepths(parent) {
    let pDepth = parent.depth;

    if (parent.children) {
        parent.children.forEach(child => {
            child.depth = pDepth + 1
            updateChildDepths(child);
        });
    }

    if (parent._children) {
        parent._children.forEach(child => {
            child.depth = pDepth + 1
            updateChildDepths(child);
        });
    }
}

function isAncestor(node, ancestor) {
    while (node.parent) {
        node = node.parent;
        if (node == ancestor) {
            return true;
        }
    }
    return false;
}

dragListener = d3.drag()
        .on("start", function(event, d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
            //var treeData = treemap(root);
            //nodes = treeData.descendants();
        })
        .on("drag", function(event, d) {
            if (d == root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                console.log("Thhiiis", this);
                initiateDrag(d, domNode);
            }

            //let pos = d3.pointer(event, this.state.svg.node());
            d.x0 = event.x;
            d.y0 = event.y;
            var node = d3.select(this);
            node.attr("transform", "translate(" + d.x0 + "," + d.y0 + ")");
            updateTempConnector();
        }).on("end", function(event, d) {
            if (d == root) {
                return;
            }
            if (selectedNode == root) { // Can't swap root node
                endDrag();
                return;
            }

            domNode = this;
            if (selectedNode) {
                if (isAncestor(draggingNode, selectedNode) || isAncestor(selectedNode, draggingNode)) {
                    endDrag();
                    return;
                }
                //console.log(selectedNode)
                // now remove the element from the parent, and insert it into the new elements children
                var index1 = draggingNode.parent.children.indexOf(draggingNode);
                let dragParent = draggingNode.parent;
                let dragDepth = draggingNode.depth;
                var index2 = selectedNode.parent.children.indexOf(selectedNode);
                let selectedParent = selectedNode.parent;
                let selectedDepth = selectedNode.depth;

                if (index1 > -1) {
                    dragParent.children.splice(index1, 1, selectedNode);
                    selectedNode.parent = dragParent;
                    selectedNode.depth = dragDepth;
                    updateChildDepths(selectedNode);
                }
                
                if (index2 > -1) {
                    selectedParent.children.splice(index2, 1, draggingNode);
                    draggingNode.parent = selectedParent;
                    draggingNode.depth = selectedDepth;
                    updateChildDepths(draggingNode);
                }

                // if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                //     if (typeof selectedNode.children !== 'undefined') {
                //         selectedNode.children.push(draggingNode);
                //     } else {
                //         selectedNode._children.push(draggingNode);
                //     }
                // } else {
                //     selectedNode.children = [];
                //     selectedNode.children.push(draggingNode);
                // }
                // // Make sure that the node being added to is expanded so user can see added node is correctly moved
                // expand(selectedNode);
                // sortTree();
                endDrag();
            } else {
                endDrag();
            }
        });

function endDrag() {
            selectedNode = null;
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
            d3.select(domNode).attr('class', 'node');
            // now restore the mouseover event or we won't be able to drag a 2nd time
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
            updateTempConnector();
            if (draggingNode !== null) {
                update(root);
                centerNode(draggingNode);
                draggingNode = null;
            }
        }

var overCircle = function(d) {
            selectedNode = d;
            updateTempConnector();
        };
var outCircle = function(d) {
            selectedNode = null;
            updateTempConnector();
        };

var updateTempConnector = function() {
            var data = [];
            if (draggingNode !== null && selectedNode !== null) {
                // have to flip the source coordinates since we did this for the existing connectors on the original tree
                data = [{
                    source: {
                        x: selectedNode.y0,
                        y: selectedNode.x0
                    },
                    target: {
                        x: draggingNode.y0,
                        y: draggingNode.x0
                    }
                }];
            }
        };

        function centerNode(source) {
            x = -source.y0;
            y = -source.x0;
            x = x + 960 / 2;
            y = y + 960 / 2;
            d3.select('g').transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")");
        }

        function toggleChildren(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            return d;
        }
    
        // Toggle children on click.