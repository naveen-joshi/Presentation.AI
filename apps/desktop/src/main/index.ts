import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { watch, type FSWatcher } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateHtml, parseSlides } from "@presentation-ai/renderer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let currentWatcher: FSWatcher | null = null;
let currentFilePath: string | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Presentation.AI",
    backgroundColor: "#0b0f19",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Load renderer HTML
  const htmlPath = path.join(__dirname, "../renderer/index.html");
  mainWindow.loadFile(htmlPath);

  mainWindow.on("closed", () => {
    if (currentWatcher) {
      currentWatcher.close();
      currentWatcher = null;
    }
    mainWindow = null;
  });

  setupMenu();
}

function setupMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Open Markdown File...",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            await handleOpenFileDialog();
          },
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            mainWindow?.webContents.send("menu:save");
          },
        },
        { type: "separator" },
        {
          label: "Export to PDF...",
          accelerator: "CmdOrCtrl+P",
          click: () => {
            mainWindow?.webContents.send("menu:export-pdf");
          },
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function handleOpenFileDialog() {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Open Markdown Presentation",
    properties: ["openFile"],
    filters: [
      { name: "Markdown files", extensions: ["md", "markdown", "txt"] },
      { name: "All files", extensions: ["*"] },
    ],
  });

  if (canceled || filePaths.length === 0) return null;

  const filePath = filePaths[0];
  currentFilePath = filePath;
  const content = await fs.readFile(filePath, "utf-8");

  // Watch for changes
  if (currentWatcher) currentWatcher.close();
  try {
    currentWatcher = watch(filePath, async (eventType) => {
      if (eventType === "change" && mainWindow) {
        try {
          const updated = await fs.readFile(filePath, "utf-8");
          mainWindow.webContents.send("file:changed", updated);
        } catch {}
      }
    });
  } catch {}

  mainWindow.webContents.send("file:opened", { filePath, content });
  return { filePath, content };
}

/* ─── IPC Handlers ────────────────────────────────────────────────────────── */

ipcMain.handle("dialog:open-file", async () => {
  return await handleOpenFileDialog();
});

ipcMain.handle("file:save", async (_event, { filePath, content }: { filePath: string; content: string }) => {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle("deck:render", async (_event, { markdown, options }: { markdown: string; options?: any }) => {
  try {
    const slides = parseSlides(markdown);
    const html = generateHtml(
      slides,
      options?.title || "Presentation",
      false,
      options?.theme || "nord",
      options?.size || "m",
      { head: options?.headFont, body: options?.bodyFont },
      { template: options?.template || "classic", transition: options?.transition || "slide" }
    );
    return html;
  } catch (e: any) {
    return `<html><body><h1>Render Error</h1><pre>${e?.message || e}</pre></body></html>`;
  }
});

ipcMain.handle("deck:export-pdf", async (_event, { html }: { html: string }) => {
  if (!mainWindow) return { success: false, error: "No window" };

  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Export Presentation to PDF",
    defaultPath: "presentation.pdf",
    filters: [{ name: "PDF Documents", extensions: ["pdf"] }],
  });

  if (canceled || !filePath) return { success: false };

  // Create background printing window
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: true,
      javascript: true,
    },
  });

  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  // Wait 1 second for webfonts and math/mermaid rendering
  await new Promise((r) => setTimeout(r, 1200));

  try {
    const pdfBuffer = await printWindow.webContents.printToPDF({
      printBackground: true,
      landscape: true,
      pageSize: { width: 1600000, height: 900000 }, // 16:9 aspect ratio
    });

    await fs.writeFile(filePath, pdfBuffer);
    printWindow.close();
    return { success: true, filePath };
  } catch (e: any) {
    printWindow.close();
    return { success: false, error: e?.message || "Failed to print PDF" };
  }
});

/* ─── App Lifecycle ───────────────────────────────────────────────────────── */

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
