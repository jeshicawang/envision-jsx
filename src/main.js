// const data = {{{hierarchy}}};
const i = 0;

const stratify = d3.stratify()
  .id(d => d)
  .parentId(d => d.substring(0, d.lastIndexOf('.')));

const width = 1200;
const height = 960;

const svg = d3.select('#tree')
  .attr('width', width)
  .attr('height', height)

const g = svg.append('g')
  .attr('transform', 'translate(80,80)')

const tree = d3.tree()
  .size([width - 160, height - 160]);

const root = stratify(data);

update(root);

function update(root) {
  const link = g.selectAll('.link')
    .data(tree(root).descendants().slice(1), d => d.id)
    .attr('d', d => {
      return "M" + d.x + "," + d.y
        + "C" + d.x + "," + (d.y + d.parent.y) / 2
        + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
        + " " + d.parent.x + "," + d.parent.y;
    });

  link.enter().append('path')
    .attr('class', 'link')
    .attr('d', d => {
      return "M" + d.x + "," + d.y
        + "C" + d.x + "," + (d.y + d.parent.y) / 2
        + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
        + " " + d.parent.x + "," + d.parent.y;
    });

  link.exit().remove();

  const node = g.selectAll('.node')
    .data(root.descendants(), d => d.id || (d.id = ++i));

  const nodeEnter = node.enter()
    .append('g')
      .attr('class', d => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
      .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
      .on('click', click);

  nodeEnter.append('circle')
    .attr('r', 2.5);

  nodeEnter.append('text')
    .attr('dy', 3)
    .attr('y', d => d.children ? -12 : 12)
    .style('text-anchor', 'middle')
    .text(d => d.id.substring(d.id.lastIndexOf('.') + 1));

  const nodeUpdate = node
    .attr('class', d => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

  nodeUpdate.select('text')
    .attr('y', d => d.children ? -12 : 12);

  const nodeExit = node.exit()
    .remove();

}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(root);
}
