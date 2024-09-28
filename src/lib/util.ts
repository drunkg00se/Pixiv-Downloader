export function sleep(delay: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
}

export function replaceInvalidChar(str: string): string {
  if (typeof str !== 'string') throw new TypeError('expect string but got ' + typeof str);
  if (!str) return '';
  return str
    .replace(/\p{C}/gu, '')
    .replace(/\\/g, '＼')
    .replace(/\//g, '／')
    .replace(/:/g, '：')
    .replace(/\*/g, '＊')
    .replace(/\?/g, '？')
    .replace(/\|/g, '｜')
    .replace(/"/g, '＂')
    .replace(/</g, '﹤')
    .replace(/>/g, '﹥')
    .replace(/~/g, '～')
    .trim()
    .replace(/^\.|\.$/g, '．'); //头尾'.'
}

export function unescapeHtml(str: string): string {
  if (typeof str !== 'string') throw new TypeError('expect string but got ' + typeof str);
  if (!str) return '';
  const el = document.createElement('p');
  el.innerHTML = str;
  return el.innerText;
}

export function stringToFragment(string: string): DocumentFragment {
  const renderer = document.createElement('template');
  renderer.innerHTML = string;
  return renderer.content;
}

export function generateCsv(sheetData: string[][]): Blob {
  const sheetStr = sheetData
    .map((row) => {
      return row
        .map((cell) => {
          return '"' + cell.replace(/"/g, '""') + '"';
        })
        .join(',');
    })
    .join('\r\n');
  return new Blob(['\ufeff' + sheetStr], { type: 'text/csv' });
}

export function evalScript(script: string) {
  const el = document.createElement('script');
  el.text = script;
  document.head.appendChild(el).parentNode!.removeChild(el);
}

export function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
}

export async function addStyleToShadow(shadowRoot: ShadowRoot) {
  if (import.meta.env.DEV) {
    const modalStyle = (await import('./components/app.tailwind.css?inline')).default;
    const style = new CSSStyleSheet();
    style.replaceSync(modalStyle);
    shadowRoot.adoptedStyleSheets = [style];
  } else {
    shadowRoot.adoptedStyleSheets = [(window as any)._pdlShadowStyle];
  }
}

export function getElementText(el: HTMLElement): string {
  el.normalize();

  if (el.childNodes.length === 0) return '';

  const blockNode = [
    'ADDRESS',
    'ARTICLE',
    'ASIDE',
    'BLOCKQUOTE',
    'DD',
    'DIV',
    'DL',
    'DT',
    'FIELDSET',
    'FIGCAPTION',
    'FIGURE',
    'FOOTER',
    'FORM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HEADER',
    'HR',
    'LI',
    'MAIN',
    'NAV',
    'OL',
    'P',
    'PRE',
    'SECTION',
    'TABLE',
    'UL'
  ];

  let str = '';

  for (let i = 0; i < el.childNodes.length; i++) {
    const node = el.childNodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue;
      val?.trim() && (str += val);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.nodeName === 'BR') {
        str += '\n';
        continue;
      }

      if (!blockNode.includes(node.nodeName)) {
        const childText = getElementText(node as HTMLElement);
        childText && (str += childText);
      } else {
        const childText = getElementText(node as HTMLElement);

        if (childText) {
          str ? (str += '\n' + childText) : (str += childText);
        }
      }
    }
  }

  return str;
}

export function aDownload(blob: Blob, filename: string) {
  const el = document.createElement('a');
  el.href = URL.createObjectURL(blob);
  el.download = filename;
  el.click();
  URL.revokeObjectURL(el.href);
}
