import { contextBridge, ipcRenderer } from "electron";

export interface DesktopApi {
  openFileDialog: () => Promise<{ filePath: string; content: string } | null>;
  saveFile: (filePath: string, content: string) => Promise<boolean>;
  renderPresentation: (
    markdown: string,
    options?: {
      theme?: string;
      template?: string;
      transition?: string;
      size?: string;
    }
  ) => Promise<string>;
  exportPdf: (html: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  onFileChanged: (callback: (content: string) => void) => () => void;
}

const api: DesktopApi = {
  openFileDialog: () => ipcRenderer.invoke("dialog:open-file"),
  saveFile: (filePath, content) => ipcRenderer.invoke("file:save", { filePath, content }),
  renderPresentation: (markdown, options) =>
    ipcRenderer.invoke("deck:render", { markdown, options }),
  exportPdf: (html) => ipcRenderer.invoke("deck:export-pdf", { html }),
  onFileChanged: (callback) => {
    const handler = (_event: any, content: string) => callback(content);
    ipcRenderer.on("file:changed", handler);
    return () => {
      ipcRenderer.removeListener("file:changed", handler);
    };
  },
};

contextBridge.exposeInMainWorld("desktopApi", api);
