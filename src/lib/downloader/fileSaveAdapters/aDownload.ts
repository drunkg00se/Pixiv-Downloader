// 适用于不需子目录，且浏览器扩展不支持下载Blob（firefox）的的场景

// WebKit（Safari）在 click() 之后异步才会去解引用 blob URL，
// 同步调用 revokeObjectURL 会导致下载被静默取消或产生空文件，
// 因此延迟回收（与 FileSaver.js 的做法一致）。
const REVOKE_OBJECT_URL_DELAY = 40_000;

export function aDownload(blob: Blob, path: string): void {
  // 处理带子目录的路径
  const separaterIndex = path.lastIndexOf('/');
  if (separaterIndex !== -1) path = path.slice(separaterIndex + 1);

  const dlEle = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  dlEle.href = objectUrl;
  dlEle.download = path;
  dlEle.click();

  setTimeout(() => URL.revokeObjectURL(objectUrl), REVOKE_OBJECT_URL_DELAY);
}
