import JSZip from 'jszip';

interface Compressor {
  add(id: string, name: string, data: Blob): void;
  bundle(id: string, comment?: string): Promise<Blob>;
  remove(ids: string): void;
  fileCount(id: string): number;
  unzip(data: Blob): Promise<Blob[]>;
}

function createCompressor(): Compressor {
  const zip = new JSZip();

  return {
    add(id: string, name: string, data: Blob): void {
      zip.folder(id)?.file(name, data);
    },

    bundle(id: string, comment?: string): Promise<Blob> {
      const folder = zip.folder(id);
      if (!folder) throw new TypeError('no such folder:' + id);

      return folder.generateAsync<'blob'>({ type: 'blob', comment });
    },

    remove(ids: string): void {
      zip.remove(ids);
    },

    fileCount(id: string): number {
      let count = 0;
      zip.folder(id)?.forEach(() => count++);
      return count;
    },

    async unzip(data: Blob): Promise<Blob[]> {
      const id = Math.random().toString(36);
      let folder = zip.folder(id);
      if (!folder) throw TypeError('Can not get new root folder');

      const filesPromises: Promise<Blob>[] = [];
      folder = await folder.loadAsync(data);
      folder.forEach((_, file) => {
        filesPromises.push(file.async('blob'));
      });

      const files = await Promise.all(filesPromises);
      zip.remove(id);
      return files;
    }
  };
}

export const compressor = createCompressor();
