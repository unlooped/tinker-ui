'use strict';

var events = require('./../../lib/events'),
	config = require('./../../lib/config'),
	Cell = require('./../cell'),
	markupEditor = require('./../editors/markup'),
	styleEditor = require('./../editors/style'),
	behaviourEditor = require('./../editors/behaviour'),
	result = require('./../result');

var regions = {}, curLayout = null, body, cells,
	widths = [], heights = [];

/**
 * Build up the base layout
 */
function build(){
	var data = {urls: config.urls};
	$(document.body).adopt(
		new Element('div', {html: slab.load('layout')(data)}).getChildren()
	);
	body = $('body');
	cells = [
		new Cell(body),
		new Cell(body),
		new Cell(body),
		new Cell(body)
	];

	$$('.rgn').forEach(function(el){
		regions[el.get('data-name')] = el;
	});

	$$(cells.map(function(cell){
		return cell.getOuter();
	})).set('morph', {duration: 150});

	if (!config.layouts.length) {
		console.warn('No layouts found!');
	}

	addToRegion(new Element('span.icn42.icn-logo'), 'tl');

	activate(0, false);
	events.emit('layout.build');

	markupEditor.init(cells[0].getInner());
	styleEditor.init(cells[1].getInner());
	behaviourEditor.init(cells[2].getInner());
	result.init(cells[3].getInner());

	events.emit('tinker.load');
}

/**
 * Recalculate col/row sizes
 */
function recalc(){
	var l = config.layouts[curLayout], i = 0, percent,
		bSize = body.getSize(), opWidth = bSize.x/100, opHeight = bSize.y/100,
		width, height, consumed = 0;

	widths = [];
	heights = [];

	for (; i < l.cols.length; i++){
		if (l.cols[i+1]) {
			percent = l.cols[i+1] - l.cols[i];
			width = Math.round(percent * opWidth);
			widths.push(width);
			consumed += width;
		} else {
			widths.push(bSize.x - consumed);
		}
	}

	i = 0;
	consumed = 0;
	for (; i < l.rows.length; i++){
		if (l.rows[i+1]) {
			percent = l.rows[i+1] - l.rows[i];
			height = Math.round(percent * opHeight);
			heights.push(height);
			consumed += height;
		} else {
			heights.push(bSize.y - consumed);
		}
	}
}

/**
 * Reflow the cells
 * @param {Boolean} animate Whether the reflow should be animated
 */
function reflow(animate){
	animate = animate === false ? false : true;
	var i = 0, c, coords, styles;
	for (; i < config.layouts[curLayout].cells.length; i++){
		c = config.layouts[curLayout].cells[i];
		coords = cellCoords(c);
		styles = {
			top: coords.y1,
			left: coords.x1,
			width: coords.x2 - coords.x1,
			height: coords.y2 - coords.y1
		};
		if (animate) {
			cells[i].getOuter().morph(styles);
		} else {
			cells[i].getOuter().setStyles(styles);
		}
	}
}

/**
 * Calculate intersections between elements and creates handles
 */
function createHandles(){
	var layout = config.layouts[curLayout], i = 0, c, coords;

	for (; i < layout.cells.length; i++){
		c = layout.cells[i];
		if (c[0] > 0 && c[0] < layout.cols.length){
			coords = cellCoords(c);
			new Element('div.handle.handle-vert').setStyles({
				top: coords.y1,
				left: coords.x1,
				height: coords.y2 - coords.y1
			}).inject(body);
		}
		if (c[1] > 0 && c[1] < layout.rows.length){
			coords = cellCoords(c);
			new Element('div.handle.handle-horz').setStyles({
				top: coords.y1,
				left: coords.x1,
				width: coords.x2 - coords.x1
			}).inject(body);
		}
	}
}

/**
 * Calculate coords of a cell
 * @param {Object} spec Specification of how the cell should look
 * @return {Object} Coordinates
 */
function cellCoords(spec){
	var i = 0, j = 0, x1 = 0, y1 = 0, x2 = 0, y2 = 0;

	for (; i < spec[0]; i++){
		x1 += widths[i];
	}
	for (; j < spec[2]; i++, j++){
		x2 += widths[i];
	}
	x2 += x1;

	i = 0;
	j = 0;
	for (; i < spec[1]; i++){
		y1 += heights[i];
	}
	for (; j < spec[3]; i++, j++){
		y2 += heights[i];
	}
	y2 += y1;

	return {x1: x1, y1: y1, x2: x2, y2: y2};
}

/**
 * Handle window resizes
 */
function resize(){
	recalc();
	reflow(false);
}

/**
 * Add a node to a region
 * @param {Element} el Node to add
 * @param {String} pos Region to add the node to
 */
function addToRegion(el, pos){
	if (typeOf(el) !== 'element' || typeOf(pos) !== 'string') {
		return;
	}
	if (!regions[pos]){
		console.warn('Invalid region: ', pos);
		return;
	}

	el.inject(regions[pos]);
}

/**
 * Activate a layout by index
 * @param {Number} index Layout to activate
 * @param {Bool} animate Whether the transition should be animated
 */
function activate(index, animate){
	if (!config.layouts[index]) {
		return;
	}

	curLayout = index;
	recalc();
	reflow(animate);
	createHandles();
}

events.on('layout.init', build);
window.addEvent('resize', resize);

module.exports = {
	addToRegion: addToRegion
};

