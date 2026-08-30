// Desktop Renderer Controller
(function () {
  const editor = document.getElementById("editor");
  const previewFrame = document.getElementById("previewFrame");
  const openBtn = document.getElementById("openBtn");
  const saveBtn = document.getElementById("saveBtn");
  const pdfBtn = document.getElementById("pdfBtn");
  const presentBtn = document.getElementById("presentBtn");
  const themeSelect = document.getElementById("themeSelect");
  const filePathLabel = document.getElementById("filePathLabel");

  let currentFilePath = null;
  let renderDebounce = null;
  let currentHtml = "";

  const defaultContent = `# Offline Presentations
with Presentation.AI Desktop

---

## Fast & Local
- Works without internet
- Auto-reloads on file save
- Exports vector PDFs

---

## 30+ Themes Built-in
Choose your favorite palette from the top menu!
`;

  editor.value = defaultContent;
  updatePreview();

  // 1. Debounced Render
  function updatePreview() {
    clearTimeout(renderDebounce);
    renderDebounce = setTimeout(async () => {
      if (!window.desktopApi) return;
      const md = editor.value;
      const theme = themeSelect.value;

      try {
        const html = await window.desktopApi.renderPresentation(md, {
          theme,
          template: "classic",
          transition: "slide",
          size: "m",
        });

        currentHtml = html;
        const doc = previewFrame.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      } catch (e) {
        console.error("Render error", e);
      }
    }, 250);
  }

  editor.addEventListener("input", updatePreview);
  themeSelect.addEventListener("change", updatePreview);

  // 2. Open File
  openBtn.addEventListener("click", async () => {
    if (!window.desktopApi) return;
    const res = await window.desktopApi.openFileDialog();
    if (res) {
      currentFilePath = res.filePath;
      filePathLabel.textContent = `· ${res.filePath.split(/[\\/]/).pop()}`;
      editor.value = res.content;
      updatePreview();
    }
  });

  // 3. Save File
  saveBtn.addEventListener("click", async () => {
    if (!window.desktopApi || !currentFilePath) return;
    await window.desktopApi.saveFile(currentFilePath, editor.value);
    saveBtn.textContent = "✓ Saved";
    setTimeout(() => (saveBtn.textContent = "Save"), 1500);
  });

  // 4. Export PDF
  pdfBtn.addEventListener("click", async () => {
    if (!window.desktopApi || !currentHtml) return;
    pdfBtn.textContent = "Exporting...";
    const res = await window.desktopApi.exportPdf(currentHtml);
    if (res.success) {
      pdfBtn.textContent = "✓ Exported";
    } else {
      pdfBtn.textContent = "Export Failed";
    }
    setTimeout(() => (pdfBtn.textContent = "Export PDF"), 2000);
  });

  // 5. Present Fullscreen
  presentBtn.addEventListener("click", () => {
    if (previewFrame.requestFullscreen) {
      previewFrame.requestFullscreen();
    }
  });

  // 6. Listen for external file changes (watch)
  if (window.desktopApi && window.desktopApi.onFileChanged) {
    window.desktopApi.onFileChanged((newContent) => {
      editor.value = newContent;
      updatePreview();
    });
  }
})();
