import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import prefix from 'postcss-prefix-selector';
import rem2px from 'postcss-rem-to-responsive-pixel';

function transformSelector(prefix, selector, prefixedSelector, file) {
  if (!file.includes('svelte') && !file.includes('tailwind')) return selector;

  return selector
    .replace('.dark body', ":host .dark [data-theme='skeleton']")
    .replace(/^(html|body|:root)$/, ":host [data-theme='skeleton']")
    .replace(/^(html|body|:root)/, ':host');
}

export default {
  plugins: [
    tailwindcss(),
    prefix({ transform: transformSelector }),
    autoprefixer(),
    // 避免网页fontsize不同导致样式问题
    rem2px({
      rootValue: 16,
      propList: ['*'],
      transformUnit: 'px',
      mediaQuery: true
    })
  ]
};
