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

            d.x0 = event.x;
            d.y0 = event.y;
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
                draggingNode = null;
            }
        }

var overCircle = function(d) {
            selectedNode = d;
        };
var outCircle = function(d) {
            selectedNode = null;
        };
