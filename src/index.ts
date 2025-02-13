import "@logseq/libs";

const main = () => {
  logseq.UI.showMsg("Hello, Logseq!");

  logseq.Editor.registerSlashCommand("Hello World", async () => {
    logseq.UI.showMsg("Hello from Logseq Plugin!");
  });
};

// Bootstraps the plugin when Logseq loads it
logseq.ready(main).catch(console.error);