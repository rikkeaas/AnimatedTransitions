var btns = d3
    .select('.container')
    .append('g')
    .attr('id', 'my-button')
    
var bbtn =btns
    .append('button')
    .attr('disabled', '')
    .attr('class', 'btn-backward')
    .text("Previous step")
    .on('click', backwardsButtonClick)

var fbtn = btns
    .append('button')
    .attr('disabled', '')
    .attr('class', 'btn-forward')
    .text("Next step")
    .on('click', forwardButtonClick)

function forwardButtonClick(event) {
    var stack=[];
    stack.push(root);
    while(stack.length !== 0){
        var d = stack.pop();
        if (d._children && (!d.children || (d.children && d.children.every((d) => !childHasHiddenChildren(d))))) {
            if (!d.children) {
                d.children = [];
            }
            tempNode = d._children[0];
            tempNode.data.concatName = " ".repeat(tempNode.data.name.length);
            console.log(tempNode)
            if (tempNode.data.invalid) {
                invalidate(tempNode);
            }
            d.children.push(tempNode)
            d._children = d._children.slice(1);
            
            if (d._children.length === 0) {
                d._children = null
            }
            update(d);
            bbtn.attr('disabled', null)
            if (!root._children && !childHasHiddenChildren(root)) {
                fbtn.attr('disabled', '')
            }
            return;
        }
        if(d.children){
            for(var i=0; i<d.children.length; i++){
                stack.push(d.children[d.children.length-i-1]);
            }
        }
    }
    fbtn.attr('disabled', '')
}

function invalidate(node) {
    if (node) {
        node.data.invalid = true;
        update(node);
        setTimeout(function () {invalidate(node.parent)}, 500)
    }
}

function backwardsButtonClick(event) {
    var stack=[];
    var d;
    stack.push(root);
    while(stack.length !== 0){
        d = stack.pop();
        
        if(d.children){
            for(var i=0; i<d.children.length; i++){
                stack.push(d.children[d.children.length-i-1]);
            }
        }
    }
    if (d.parent) {
        
        parent = d.parent;

        if (!parent._children) {
            parent._children = [];
        }

        d.data.concatName = d.data.name;

        parent._children.unshift(d);
        parent.children.pop();
        
        if (parent.children.length === 0) {
            parent.children = null
            if (!parent.parent) { // parent is root
                bbtn.attr('disabled', '')
            }
        }

        if (!parent.children || !parent.children[0].data.invalid) {
            parent.data.invalid = false;
        }

        fbtn.attr('disabled', null)
        update(parent);

        return;
    }
}

function childHasHiddenChildren(node) {
    var stack=[];
    stack.push(node);
    while(stack.length!==0){
        var d = stack.pop();
        if (d._children) {
            return true;
        }
        if(d.children){
            for(var i=0; i<d.children.length; i++){
                d.children
                stack.push(d.children[d.children.length-i-1]);
            }
        }
    }
    return false;
}

var margin = { top: 20, right: 20, bottom: 20, left: 20};
var width = 960 - margin.left - margin.right;
var height = 640 - margin.top - margin.left;

var duration = 1000;
var root;
var treemap;
var svg = d3
    .select('.container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.left)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

function createTree(treeData) {
    svg.selectAll('*').remove(); // Removing previous tree if it exists

    var i = 0;
    treemap = d3.tree().size([height, width]);
    root = d3.hierarchy(treeData, function(d) {
        return d.children;
    });

    root.x0 = width/2 + margin.left;
    root.y0 = 0;
    root.x = root.x0;
    var treeData = treemap(root);

    // nodes 
    var nodes = treeData.descendants(); // Collapsing the tree to the initial state
    nodes.forEach(d => {
        d._children = d.children;
        d.children = null;
    });

    if (root._children || childHasHiddenChildren(root)) {
        fbtn.attr('disabled', null);
    }
    bbtn.attr('disabled', '');
    update(root);
}

function update(source) {
    var treeData = treemap(root);

    function fullName(d) {
        let n = d.data.name;
        n += (d._children && d.children) ? concatNames(d.children[0].data, false) : "";
        if (d._children && d.children) {
            n += concatNames(d._children[0].data, false);
        }
        else if (d._children && !d.children) {
            n += concatNames(d._children[0].data, false) + " " + concatNames(d._children[1].data, false);
        }
        return n.length;
    }

    // nodes 
    var nodes = treeData.descendants();
    nodes.forEach(d => {
        d.y = d.depth * 120;
    });
    var node = svg.selectAll('g.node').data(nodes, function(d) {
        return d.id || (d.id = ++ i);
    });

    var nodeEnter = node
        .enter()
        .append('g')
        .call(dragListener)
        .attr('class', 'node')
        .attr('transform', function(d) {
            return "translate(" + (source.x0) + ", " + source.y0 + ")";
        })
        //.on('click', click);
    
    nodeEnter
        .append('rect')
        .attr('class', 'node')
        .attr('height', 0)
        .attr('width', 0)
        .style('opacity', '0')
        //.style('stroke','white')
        .style('fill', 'while');
    
    var nodeText = nodeEnter
        .append('g')


    nodeText
        .append('text')
        .attr('class', 'mainName')
        .attr('dy', '.35em')
        .attr('dx', function (d) {
            return -3*fullName(d)
        })
        .attr('text-anchor', 'end') 
        //.text(function (d) {return d.data.name})
        
    nodeText
        .append('text')
        .attr('class', 'expandedChild')
        .attr('dy', '.35em')
        .attr('dx', '0')
        .attr('text-anchor', 'middle') 
        // .text(function (d) {
        //     if (d._children && d.children) {
        //         return d.children[0].name;
        //     }
        // })
        
    nodeText
        .append('text')
        .attr('class', 'nonExpandedChild')
        .attr('dy', '.35em')
        .attr('dx', function (d) {
            return 3*fullName(d)
        })
        .attr('text-anchor', 'start') 
        // .text(function (d) {
        //     if (d._children && d.children) {
        //         return d._children[0].name;
        //     }
        //     if (d._children && !d.children) {
        //         return d._children[0].name + " " + d._children[1].name;
        //     }
        // })
    
        //function(d) {
            //if (d._children) {
            //    return concatNames(d.data, false);
            //}
           // return d.data.name;
        //});


    var nodeUpdate = nodeEnter.merge(node);
    
    nodeUpdate 
        .transition()
        .duration(duration)
        .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')'
        });
    
    
    nodeUpdate
        .select('rect.node')
        .attr('x', -35)
        .attr('y', -15)
        .attr('height', 30)
        .attr('width', 70)
        .attr('rx', 10)
        .attr('ry', 10)
        .style('stroke', function(d) {
            if (d.data.invalid) return '#fc4a1a'
            return d._children || (d.children && d.children.some(c => childHasHiddenChildren(c))) ? 'white' : '#f7b734';
        })
        .transition()
        .duration(duration)
        .style('opacity', '1' )
        
        .attr('cursor', 'pointer')
    
    nodeUpdate
        .select('text.mainName') 
        .text(function (d) {
            if (d.data.invalid) return "Invalid"
            return d.data.name
        })
        .attr('dx', function (d) {
            return -3*fullName(d)
        })
    
    nodeUpdate
        .select('text.expandedChild')
        .text(function (d) {
            if (d._children && d.children) {
                //console.log("-".repeat(concatNames(d.children[0].data, false).length))
                return "-".repeat(concatNames(d.children[0].data, false).length);
            }
        })
    
    nodeUpdate
        .select('text.nonExpandedChild')
        .text(function (d) {
            if (d._children && d.children) {
                return concatNames(d._children[0].data, false);
            }
            if (d._children && !d.children) {
                return concatNames(d._children[0].data, false) + " " + concatNames(d._children[1].data, false);
            }
        })
        .attr('dx', function (d) {
            return 3*fullName(d)
        })


    nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr('transform', function (d) {
            return 'translate(' + source.x + ',' + source.y + ')';
        })
        .remove();
    
    nodeExit.select('rect').attr('height', 0).attr('width', 0);
    nodeExit.select('text').style('fill-opacity', 0);
    
    // Links
    function diagonal(s,d) {
        path = `M ${s.x} ${s.y}
                C ${(s.x + d.x)/2} ${s.y}
                  ${(s.x + d.x)/2} ${d.y}
                  ${d.x} ${d.y}`;
        return path;
    };

    var links = treeData.descendants().slice(1);
    var link = svg.selectAll('path.link').data(links, function(d) {
        return d.id;
    });

    var linkEnter = link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', function(d) {
            var o = {x: source.x0, y: source.y0}
            return diagonal(o, o);
        });
    
    var linkUpdate = linkEnter.merge(link);
    linkUpdate 
        .transition()
        .duration(duration)
        .attr('d', function(d) {
            return diagonal(d, d.parent);
        });
    
    var linkExit = link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal(o, o);
        })
        .remove();
    
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // function click(event, d) {
    //     if (d.children) {
    //         d._children = d.children;
    //         d.children = null;
    //     } else {
    //         d.children = d._children;
    //         d._children = null;
    //     }
    //     update(d);
    // };
}
