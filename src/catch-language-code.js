/**************************************************
 * Created by nanyuantingfeng on 2018/6/5 13:01.
 **************************************************/
import HighlightJS from 'highlight.js';

export default function catchLanguageCode(code, language, cache, language2 = 'jsx') {

  if (language === language2) {
    cache.push(code);
    return '<pre></pre>';
  }

  let highlightedContent;

  HighlightJS.configure({ tabReplace: '  ' });

  if (language && HighlightJS.getLanguage(language)) {
    try {
      highlightedContent = HighlightJS.highlight(language, code).value;
    } catch (err) {}
  }

  if (!highlightedContent) {
    try {
      highlightedContent = HighlightJS.highlightAuto(code).value;
    } catch (err) {}
  }

  return highlightedContent.replace(/\n/g, '<br />');
}

