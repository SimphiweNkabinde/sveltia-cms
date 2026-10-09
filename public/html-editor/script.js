const DEFAULT_CODE = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My page</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; line-height: 1.5; }
      h1 { margin-top: 0; }
      button { padding: .5rem 1rem; border: 0; border-radius: 6px; background: #4f46e5; color: #fff; cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>Hello, world</h1>
    <p>Edit the code on the left and this page updates as you type.</p>
    <button onclick="this.textContent = 'Clicked'">Click me</button>
  </body>
  </html>`;

const preview = document.getElementById("preview");
const copyBtn = document.getElementById("copy");
const status = document.getElementById("status");
const dark = window.matchMedia("(prefers-color-scheme: dark)");

ace.config.set(
  "basePath",
  "https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.9/",
);
ace.config.set("suffix", ".min.js");

const editor = ace.edit("editor", {
  mode: "ace/mode/html",
  theme: dark.matches ? "ace/theme/tomorrow_night" : "ace/theme/chrome",
  tabSize: 2,
  useSoftTabs: true,
  showPrintMargin: false,
  highlightActiveLine: true,
  highlightSelectedWord: true,
  showFoldWidgets: true,
  displayIndentGuides: true,
  behavioursEnabled: true,
  wrap: false,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
});
editor.setValue(DEFAULT_CODE, -1);
dark.addEventListener("change", (e) =>
  editor.setTheme(e.matches ? "ace/theme/tomorrow_night" : "ace/theme/chrome"),
);

// Live preview
let timer;
function render() {
  preview.srcdoc = editor.getValue();
}
editor.session.on("change", () => {
  clearTimeout(timer);
  timer = setTimeout(render, 250);
});
render();

// Status bar
function updateStatus() {
  const p = editor.getCursorPosition();
  const sel = editor.getSelectedText().length;
  status.textContent =
    `Ln ${p.row + 1}, Col ${p.column + 1}` + (sel ? ` · ${sel} selected` : "");
}
editor.selection.on("changeCursor", updateStatus);
editor.selection.on("changeSelection", updateStatus);

// Format
const beautify = ace.require("ace/ext/beautify");
function format() {
  beautify.beautify(editor.session);
  editor.focus();
}
document.getElementById("format").addEventListener("click", format);
editor.commands.addCommand({
  name: "format",
  bindKey: { win: "Shift-Alt-F", mac: "Shift-Option-F" },
  exec: format,
});

// Wrap and font size
const wrapBtn = document.getElementById("wrap");
wrapBtn.addEventListener("click", () => {
  const on = !editor.session.getUseWrapMode();
  editor.session.setUseWrapMode(on);
  wrapBtn.textContent = "Wrap: " + (on ? "on" : "off");
});
let fontSize = 14;
function setFont(n) {
  fontSize = Math.min(24, Math.max(10, n));
  editor.setFontSize(fontSize);
}
document
  .getElementById("fontDown")
  .addEventListener("click", () => setFont(fontSize - 1));
document
  .getElementById("fontUp")
  .addEventListener("click", () => setFont(fontSize + 1));

// Copy and reset
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {}
    ta.remove();
    return ok;
  }
}
copyBtn.addEventListener("click", async () => {
  const ok = await copyText(editor.getValue());
  copyBtn.textContent = ok ? "Copied" : "Copy failed";
  setTimeout(() => (copyBtn.textContent = "Copy code"), 1500);
});
document.getElementById("reset").addEventListener("click", () => {
  editor.setValue(DEFAULT_CODE, -1);
  editor.focus();
});
