// Inspired by: http://bl.ocks.org/stevenZlai/cf14ba9b6372bddd2b4661beb95fbee1

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
    
    // Remove parent link
    svg.selectAll('path.link').filter(function(d, i) {
         if (d.id == draggingNode.id) {
             return true;
         }
         return false;
    }).remove();

    let nodes = treemap(d);
    
    links = nodes.descendants().slice(1);
    svg.selectAll('path.link')
        .data(links, function(d) {
            return d.id;
        }).remove();
    svg.selectAll('g.node')
        .data(nodes, function(d) {
            return d.id;
        }).filter(function (d,i) {
            if (d.id == draggingNode.id) return false;
            return true;
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

function updateChildHeights(parent) {
    let pHeight = parent.height;

    if (parent.children) {
        parent.children.forEach(child => {
            child.height = pHeight - 1
            updateChildHeights(child);
        });
    }

    if (parent._children) {
        parent._children.forEach(child => {
            child.height = pHeight - 1
            updateChildHeights(child);
        });
    }

    while (parent.parent) {
        console.log(parent)
        if (parent.parent.height < parent.height + 1) {
            parent.parent.height = parent.height + 1;
            parent = parent.parent;
        }
        else break;
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

function moveChildren(dx, dy, node) {
    node.x0 += dx;
    node.y0 += dy;

    if (node.children) {
        node.children.forEach(child => {
            moveChildren(dx, dy, child)
        });
    }
}

dragListener = d3.drag()
        .on("start", function(event, d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
        })
        .on("drag", function(event, d) {
            if (d == root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            let dx = event.x - d.x0;
            let dy = event.y - d.y0;

            moveChildren(dx, dy, d);
            // d.x0 = event.x;
            // d.y0 = event.y;
            var node = d3.select(this);
            node.attr("transform", "translate(" + d.x0 + "," + d.y0 + ")");
            
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
                if (isAncestor(draggingNode, selectedNode) || isAncestor(selectedNode, draggingNode)) { // Cant swap node with ancestor
                    endDrag();
                    return;
                }
                
                let dragParent = draggingNode.parent;
                var index1 = dragParent.children.indexOf(draggingNode);
                let pIdx1 = dragParent.data.children.indexOf(draggingNode.data);
                let dragDepth = draggingNode.depth;

                let selectedParent = selectedNode.parent;
                var index2 = selectedParent.children.indexOf(selectedNode);
                let pIdx2 = selectedParent.data.children.indexOf(selectedNode.data);
                let selectedDepth = selectedNode.depth;

                if (index1 > -1) {
                    dragParent.children.splice(index1, 1, selectedNode);
                    selectedNode.parent = dragParent;
                    selectedNode.depth = dragDepth;
                    updateChildDepths(selectedNode);
                    updateChildHeights(selectedNode);
                    dragParent.data.children.splice(pIdx1, 1, selectedNode.data);
                }
                
                if (index2 > -1) {
                    selectedParent.children.splice(index2, 1, draggingNode);
                    draggingNode.parent = selectedParent;
                    draggingNode.depth = selectedDepth;
                    updateChildDepths(draggingNode);
                    updateChildHeights(draggingNode);
                    selectedParent.data.children.splice(pIdx2, 1, draggingNode.data);
                }
                endDrag();
            } else {
                endDrag();
            }
        });

function endDrag() {
            selectedNode = null;
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
            d3.select(domNode).attr('class', 'node');
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
            if (draggingNode !== null) {
                update(root);
                updateUserstring(concatNames(root.data, false))
                draggingNode = null;
            }
        }

var overCircle = function(d) {
            selectedNode = d;
        };
var outCircle = function(d) {
            selectedNode = null;
        };
