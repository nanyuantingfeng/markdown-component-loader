/**************************************************
 * Created by nanyuantingfeng on 2018/6/12 13:45.
 **************************************************/
var htmlParser = require('parse5');
var convertAttr = require('./attr-converter');
var styleParser = require('./style-parser');

function renderNode(node, key) {
  if (node.nodeName === '#text') {
    return node.value;
  }

  if (node.nodeName === '#comment') {
    return node.value;
  }

  var attr = node.attrs.reduce((result, attr) => {
    var name = convertAttr(attr.name);
    result[name] = name === 'style' ? styleParser(attr.value) : attr.value;
    return result;
  }, { key: key });

  if (node.childNodes.length === 0) {
    return toJSX(node.tagName, attr);
  }

  if (node.nodeName === 'script') {
    attr.dangerouslySetInnerHTML = { __html: node.childNodes[0].value };
    return toJSX('script', attr);
  }

  var children = node.childNodes.map(renderNode);
  return toJSX(node.tagName, attr, children);
}

function fix(value) {

  switch (typeof value) {
    case 'number':
    case 'boolean':
      return `{${value}}`;
    case 'string':
      return `"${value}"`;
    default:
      return `{${JSON.stringify(value)}}`;
  }
}

function toJSX(tagName, attr, children) {

  var keys = Object.keys(attr);
  var ax = keys.map(key => `${key}=${fix(attr[key])}`).join(' ');

  if (!children) {
    return `<${tagName} ${ax}/>`;
  }

  return `<${tagName} ${ax}>${children.join('')}</${tagName}>`;
}

function html2jsx(html) {
  html = html.trim();

  var htmlAST = htmlParser.parseFragment(html);

  if (htmlAST.childNodes.length === 0) {
    return null;
  }

  var result = htmlAST.childNodes.map(renderNode);

  return result.join('\n');
}

module.exports = html2jsx;
