// const data = {{{hierarchy}}};

const stratify = d3.stratify()
  .id(d => d)
  .parentId(d => d.substring(0, d.lastIndexOf('.')));

const root = stratify(data);

const width = 1600;
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

const id = (data) => data.id.substring(data.id.lastIndexOf('.') + 1)

const inTrasition = false;

update(root);

function update(root) {

  const t = d3.transition().duration(1000);

  const link = g.selectAll('.link')
    .data(tree(root).descendants().slice(1), d => d.key || (d.key = ++i))

  const linkEnter = link.enter().insert('path', 'g')
    .attr('class', 'link')
    .attr('d', d => path({ x: source.x0, y: source.y0 }));

  const linkUpdate = linkEnter.merge(link)
    .attr('class', d => d.focus ? 'link focus' : 'link')
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
      .attr('transform', d => 'translate(' + source.x0 + ',' + source.y0 + ')')
      .on('click', toggleChildren)
      .on('mouseenter', d => toggleFocus(d, true))
      .on('mouseleave', d => toggleFocus(d, false));

  const getBBox = (selection) => selection.each(function(d) { d.bbox = this.getBBox(); })
  const bboxPadding = 8;

  const nodeText = nodeEnter.append('text')
    .style('text-anchor', 'middle')
    .style("fill-opacity", 1e-6)
    .text(id)
    .call(getBBox)
    .transition(t)
    .style("fill-opacity", 1)

  nodeEnter.insert('rect', 'text')
    .attr('x', d => (d.bbox.width + (bboxPadding*2)) / -2)
    .attr('y', d => - d.bbox.height - 2)
    .attr('height', d => d.bbox.height + (bboxPadding*2))
    .attr('width', d => d.bbox.width + (bboxPadding*2))
    .attr('rx', 8)
    .attr('ry', 8)
    .style("fill-opacity", 1e-6)
    .transition(t)
    .style("fill-opacity", 1)

  const nodeUpdate = nodeEnter.merge(node)
    .transition(t)
    .attr('class', d => 'node' + ((d.children || d._children) ? ' node--internal' : ' node--leaf'))
    .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')')
    .on('start', () => inTransition = true)
    .on('end', () => inTransition = false)

  const nodeExit = node.exit();

  nodeExit.selectAll('text, rect')
    .transition(t)
    .style("fill-opacity", 1e-6);

  nodeExit.transition(t)
    .attr('transform', d => 'translate(' + source.x + ',' + source.y + ')')
    .remove();

}

function toggleFocus(d, focus) {
  if (inTransition) return;
  d.ancestors().forEach(ancestor => ancestor.focus = focus);
  g.selectAll('.link').attr('class', d => d.focus ? 'link focus' : 'link');
}

function toggleChildren(d) {
  if (!d.children && !d._children) return;
  d.ancestors().forEach(ancestor => ancestor.focus = false);
  g.selectAll('.link').attr('class', 'link');
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
