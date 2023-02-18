// d3js
import * as d3Base from './d3.min';
import * as d3Sankey from './d3-sankey';
// import & build Data
import { dataGet } from './dataGet';
// highlighting flow of node selection
import {
  linksConnect,
  nodesConnect,
  highlight_flow,
  overlinks,
  outlinks,
} from './sankey-highlight';

// join d3 libraries
const d3 = {
  ...d3Base,
  ...d3Sankey,
};
// main data container
let sData;
// column name
const column = ['autores', 'periodos', 'proyectos', 'annos', 'temas'];

// build sankey chart
const createSankey = async () => {
  // load CSV file
  sData = await dataGet();
  drawSankey();
};

// append the svg object to the body of the page
const svg = d3
  .select('#dataviz')
  .append('svg')
  .attr('id', 'sankey')
  .append('g')
  .attr('id', 'sankeyBox');

// Set the sankey diagram properties
const sankey = d3.sankey().iterations(0);

let guides = svg.append('g').attr('id', 'guides');
let links = svg.append('g').attr('id', 'links');
let nodes = svg.append('g').attr('id', 'nodes');

//
// append elements of the graph
const drawSankey = () => {
  // sankey.nodeSort((a, b) => d3.ascending(a.nGroup, b.nGroup));
  // sankey.linkSort((a, b) => d3.descending(a.anno, b.anno));

  graph = sankey(sData);

  for (let i = 0; i < column.length - 1; ++i) {
    for (let j = 0; j < 4; ++j) {
      guides.append('path').attr('class', 'guide');
    }
  }
  guides = d3.selectAll('.guide');

  // add in the links
  links = links
    .selectAll('.link')
    .data(graph.links)
    .enter()
    .append('g')
    .attr('id', (d, i) => {
      d.id = `link${i + 1}`;
      return d.id;
    })
    .each((d) => {
      d.connect = linksConnect(d.id);
    })
    .on('mouseover', function () {
      d3.select(this).each((d) => {
        overlinks(d['connect']);
      });
    })
    .on('mouseout', function () {
      d3.select(this).each((d) => {
        outlinks(d['connect']);
      });
    })
    .attr('class', 'link')
    .append('path');

  // add in the nodes
  nodes = nodes
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('id', (d) => `node${d.id}`)
    .each((d) => {
      d.connect = nodesConnect(d.id);
    })
    .on('click', highlight_flow)
    .attr('class', 'node');

  // nodes by layer
  for (let i = 0; i < column.length; ++i) {
    column[i] = nodes.filter((d) => d.depth === i);
  }

  d3.selectAll([...column[2], ...column[3], ...column[4]]).each((d) => {
    let para = Math.round(
      (d3.sum(d.targetLinks, (e) => e.paraPol) / (d.targetLinks.length * 100)) * 100
    );
    d.paraPol = para;
    let lSource = d.sourceLinks;
    lSource.forEach((e) => (e.paraPol = para));
  });

  links
    .attr('class', (d) =>
      d.lColumn === 0
        ? `linkPath pp${d.idPartido} para${d.paraPol}`
        : d.lColumn === 1
        ? `linkPath pp${d.idPartido} c${d.congreso} para${d.paraPol}`
        : `linkPath t${d.idTema} para${d.paraPol}`
    )
    .append('title')
    .text((d) => `${d.id} - ${d.nombre}`);

  // add the rectangles for the nodes
  nodes
    .append('rect')
    .attr('class', (d) =>
      d.depth === 0
        ? `nRect autor para${d.paraPol}`
        : d.depth === 1
        ? `nRect pp${d.idPartido} c${d.congreso}`
        : `nRect t${d.idTema} para${d.paraPol}`
    )
    .append('title')
    .text((d) => `${d.id} - ${d.nombre}`);

  // add in the title for the nodes
  column[0]
    .append('text')
    .attr('class', 'title--nombre')
    .text((d) => d.nombre);

  column[0]
    .append('text')
    .attr('class', 'title--apellido')
    .text((d) => d.apellido);

  d3.selectAll([...column[1], ...column[2], ...column[3], ...column[4]])
    .append('text')
    .attr('class', 'title--value')
    .text((d) => d.nombre);

  column[4]
    .append('text')
    .attr('class', 'title--tema')
    .text((d) => d.nombre);
};

export { sData, column, svg, sankey, guides, links, nodes, createSankey };
