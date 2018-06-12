import frontMatter from 'front-matter';
import catchLanguageCode from './catch-language-code';
import MarkdownIt from './jsx-friendly-markdown-it';
import formatModule from './formatters/module';
import html2jsx from './html2jsx/html-to-jsx';

const IMPLICIT_REACT_IMPORTS = {
  React: 'react'
};

const DEFAULT_CONFIGURATION = {
  implicitlyImportReact: true,
  passElementProps: false,
  markdownItPlugins: []
};

export default (source, config) => {

  config = Object.assign({}, DEFAULT_CONFIGURATION, config);

  const invalidStatics = ['propTypes'];

  // Pull out imports & front-matter
  const { body: markdown, attributes: { imports: customImports, ...statics } } = frontMatter(source);

  // Import React and PropTypes unless we've been asked otherwise
  const imports = config.implicitlyImportReact
    ? { ...IMPLICIT_REACT_IMPORTS, ...customImports }
    : customImports;

  // Disallow passing `defaultProps` if we're passing our own
  if (config.passElementProps) {
    invalidStatics.push('defaultProps');
  }

  // Check for invalid statics
  Object.keys(statics).map((attribute) => {
    if (invalidStatics.indexOf(attribute) !== -1) {
      throw new Error(
        `You can't supply a \`${attribute}\` static! That name is reserved.`
      );
    }
  });

  const markdownExamples = [];
  let renderer = new MarkdownIt()
    .enable(['smartquotes'])
    .set({
      // We need explicit line breaks
      breaks: true,
      typographer: config.typographer,
      highlight(code, languageHint) {
        return catchLanguageCode(code, languageHint, markdownExamples, config.language);
      }
    });

  // Load MarkdownIt plugins
  if (config.markdownItPlugins && Array.isArray(config.markdownItPlugins)) {
    renderer = config.markdownItPlugins
      .reduce(
        (markdownRenderer, pluginDefinition) => {

          if (!Array.isArray(pluginDefinition)) {
            pluginDefinition = [pluginDefinition];
          }

          if (typeof pluginDefinition[0] === 'string') {
            pluginDefinition[0] = require(pluginDefinition[0]);
          }

          return markdownRenderer.use(...pluginDefinition);
        },
        renderer
      );
  }

  const html = renderer.render(markdown);
  statics.exampleCodes = markdownExamples;
  const jsx = html2jsx(html);

  return formatModule(imports, statics, jsx, config);
};
