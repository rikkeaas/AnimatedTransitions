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
    if (nodes.length > 1) {
        // remove link paths
        var treeData = treemap(root);
        links = treeData.descendants().slice(1);
        nodePaths = svg.selectAll("path.link")
            .data(links, function(d) {
                //console.log(d)
                return d.id;
            }).remove();
        // remove child nodes
        nodesExit = svg.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id;
            }).filter(function(d, i) {
                if (d.id == draggingNode.id) {
                    return false;
                }
                return true;
            }).remove();
    }

    // remove parent link
    // parentLink = links(tree.nodes(draggingNode.parent));
    // svg.selectAll('path.link').filter(function(d, i) {
    //     if (d.id == draggingNode.id) {
    //         return true;
    //     }
    //     return false;
    // }).remove();

    dragStarted = null;
}
   
dragListener = d3.drag()
        .on("start", function(d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
            var treeData = treemap(root);
            nodes = treeData.descendants();
        })
        .on("drag", function(d) {
            if (d == root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            let pos = d3.pointer(event);
            console.log(pos);
            d.x0 = pos[0];
            d.y0 = pos[1];
            var node = d3.select(this);
            node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
            updateTempConnector();
        }).on("end", function(d) {
            if (d == root) {
                return;
            }
            domNode = this;
            if (selectedNode) {
                // now remove the element from the parent, and insert it into the new elements children
                var index = draggingNode.parent.children.indexOf(draggingNode);
                if (index > -1) {
                    draggingNode.parent.children.splice(index, 1);
                }
                if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                    if (typeof selectedNode.children !== 'undefined') {
                        selectedNode.children.push(draggingNode);
                    } else {
                        selectedNode._children.push(draggingNode);
                    }
                } else {
                    selectedNode.children = [];
                    selectedNode.children.push(draggingNode);
                }
                // Make sure that the node being added to is expanded so user can see added node is correctly moved
                expand(selectedNode);
                sortTree();
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
            var link = svg.selectAll(".templink").data(data);
    
            function diagonal(s,d) {
                path = `M ${s.x} ${s.y}
                        C ${(s.x + d.x)/2} ${s.y}
                          ${(s.x + d.x)/2} ${d.y}
                          ${d.x} ${d.y}`;
                return path;
            };

            link.enter().append("path")
                .attr("class", "templink")
                .attr("d", function(d) {
                    return diagonal(draggingNode, selectedNode)
                })
                .attr('pointer-events', 'none');
    
            //link.attr("d", d3.svg.diagonal());
    
            link.exit().remove();
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