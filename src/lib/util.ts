export function sleep(delay: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
}

export function wakeableSleep(delay: number): {
  wake: () => void;
  sleep: Promise<void>;
} {
  let wake: () => void = () => void {};
  const sleep = new Promise<void>((r) => {
    setTimeout(r, delay);
    wake = r;
  });

  return {
    wake,
    sleep
  };
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
