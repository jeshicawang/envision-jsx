// const data = {{{hierarchy}}};

const stratify = d3.stratify()
  .id(d => d)
  .parentId(d => d.substring(0, d.lastIndexOf('.')));

const root = stratify(data);

const width = 1200;
const height = 960;
let source = { x0: width / 2 - 70, y0: 0 }
let i = 0;

const svg = d3.select('#tree')
  .attr('width', width)
  .attr('height', height)

const g = svg.append('g')
  .attr('transform', 'translate(80,80)')

const tree = d3.tree()
  .size([width - 160, height - 160]);

const path = (start, end) => {
  if (!end) end = start;
  return "M" + end.x + "," + end.y
    + "C" + end.x + "," + (end.y + start.y) / 2
    + " " + start.x + "," + (end.y + start.y) / 2
    + " " + start.x + "," + start.y;
}

update(root);

function update(root) {
  const t = d3.transition().duration(2000);

  const link = g.selectAll('.link')
    .data(tree(root).descendants().slice(1), d => d.key || (d.key = ++i))

  const linkEnter = link.enter().insert('path', 'g')
    .attr('class', 'link')
    .attr('d', d => path({ x: source.x0, y: source.y0 }));

  const linkUpdate = linkEnter.merge(link)
    .transition(t)
    .attr('d', d => path({ x: d.parent.x, y: d.parent.y }, { x: d.x, y: d.y }));

  const linkExit = link.exit()
    .transition(t)
    .attr('d', d => path({ x: source.x, y: source.y }))
    .remove();

  const node = g.selectAll('.node')
    .data(root.descendants(), d => d.key || (d.key = ++i));

  const nodeEnter = node.enter()
    .append('g')
      .attr('class', d => 'node' + ((d.children || d._children) ? ' node--internal' : ' node--leaf'))
      .attr('transform', d => 'translate(' + source.x0 + ',' + (d.children ? source.y0 + 24 : source.y0) + ')')
      .on('click', click);

  nodeEnter.append('circle')
    .attr('r', 2.5);

  nodeEnter.append('text')
    .attr('dy', 3)
    .attr('y', d => d.children ? -12 : 12)
    .style('text-anchor', 'middle')
    .text(d => d.id.substring(d.id.lastIndexOf('.') + 1));

  const nodeUpdate = nodeEnter.merge(node)
    .transition(t)
    .attr('class', d => 'node' + ((d.children || d._children) ? ' node--internal' : ' node--leaf'))
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

  nodeUpdate.select('text')
    .attr('y', d => d.children ? -12 : 12);

  const nodeExit = node.exit()
    .transition(t)
    .attr('transform', d => 'translate(' + source.x + ',' + (d.children ? source.y + 24 : source.y) + ')')
    .remove();

}

// Toggle children on click.
function click(d) {
  if (!d.children && !d._children) return;
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  source = d;
  source.x0 = d.x;
  source.y0 = d.y;
  update(root);
}
