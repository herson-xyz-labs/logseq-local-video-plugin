import "@logseq/libs";
import type { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

let modifiedVideo: HTMLVideoElement | null = null; // Store reference to modified video

async function getCurrentVideoElement() {
  // Get the active block (the block where the command is triggered)
  const activeBlock = await logseq.Editor.getCurrentBlock();
  if (!activeBlock) {
    console.warn("No active block found.");
    return null;
  }

  // Traverse upwards to find the nearest ancestor with a video
  let currentBlock: BlockEntity | null = activeBlock;
  let videoBlock: BlockEntity | null = null; // Explicitly set type

  while (currentBlock?.parent?.id) {
    const parentBlock = await logseq.Editor.getBlock(currentBlock.parent.id);
    if (!parentBlock) break;

    // Check if the parent block contains a video
    const parentBlockElement = parent.document.querySelector(
      `[blockid="${parentBlock.uuid}"]`
    );

    if (parentBlockElement && parentBlockElement.querySelector("video")) {
      videoBlock = parentBlock; // Now correctly typed
      break;
    }

    // Move up the hierarchy
    currentBlock = parentBlock;
  }

  if (!videoBlock) {
    console.warn("No video-containing ancestor block found.");
    return null;
  }

  // Find the video element in the closest ancestor block with a video
  const videoBlockElement = parent.document.querySelector(
    `[blockid="${videoBlock.uuid}"]`
  );

  if (!videoBlockElement) {
    console.warn("No corresponding video block element found in the DOM.");
    return null;
  }

  const video = videoBlockElement.querySelector("video");
  if (!video) {
    console.warn("No video element found in the identified ancestor block.");
    return null;
  }

  return video;
}

////////////////////////////////////////////////////////////
/// Timestamp Functions
////////////////////////////////////////////////////////////  

async function getCurrentVideoTime() {
  const video = await getCurrentVideoElement();
  if (!video) return 0;

  console.log("Scoped Video Found:", video);
  return Math.floor(video.currentTime);
}

async function insertTimestamp() {
  const timestamp = await getCurrentVideoTime();
  
  if (timestamp === 0) {
    console.log("Timestamp is 0, skipping insertion.");
    return;
  }

  // Convert seconds to hh:mm:ss
  const formattedTimestamp = new Date(timestamp * 1000)
    .toISOString()
    .slice(11, 19);

  console.log("Formatted Timestamp:", formattedTimestamp);

  logseq.Editor.insertAtEditingCursor(` [[${formattedTimestamp}]] `)
    .then(() => console.log("Inserted timestamp successfully"))
    .catch(console.error);
}

////////////////////////////////////////////////////////////
/// UI Functions
////////////////////////////////////////////////////////////  

async function openBlockInRightSidebar() {
  const activeBlock = await logseq.Editor.getCurrentBlock();
  
  if (!activeBlock) {
    console.warn("No active block found.");
    return null;
  }

  console.log("Active Block:", activeBlock.id);

  await logseq.Editor.openInRightSidebar(activeBlock.id);
  
  return activeBlock;
}

async function enterVideoNotes() {
  const activeBlock = await openBlockInRightSidebar();
  if (!activeBlock) return;

  const video = await getCurrentVideoElement();
  if (!video) {
    console.warn("No video found in current block.");
    return;
  }

  // Apply styles only if video exists
  video.style.position = "fixed";
  video.style.top = "0";
  video.style.left = "0";
  video.style.width = "70vw";  // Adjust this as needed
  video.style.height = "100vh";
  video.style.background = "black";
  video.style.zIndex = "1000";
}

async function exitVideoNotes() {
  console.log("resetVideoProperties() called");
  
  const video = await getCurrentVideoElement();

  if (video) {
    console.log("Reverting video styles...");
    video.style.position = "static";  
    video.style.top = "auto";
    video.style.left = "auto";
    video.style.width = "100%";  
    video.style.height = "auto"; 
    video.style.background = "transparent"; 
    video.style.zIndex = "auto"; 
  } else {
    console.warn("No video element found to reset.");
  }
}

const main = () => {
  logseq.App.registerCommand(
    "insert-timestamp",
    {
      key: "insert-timestamp",
      label: "Insert Video Timestamp",
      desc: "Inserts a timestamp from the currently playing local video",
      keybinding: {
        binding: "mod+alt+t",
      },
      palette: true,
    },
    insertTimestamp
);

logseq.App.registerCommand(
  "enter-video-notes",
  {
    key: "enter-video-notes",
    label: "Opens the current block in the sidebar and resizes the video",
    desc: "Enter video notes",
    keybinding: {
      binding: "mod+alt+v",
    },
    palette: true,
  },
  enterVideoNotes
);

logseq.App.registerCommand(
  "exit-video-notes",
  {
    key: "exit-video-notes",
    label: "Restores the video to its original size",
    desc: "Enter video notes",
    keybinding: {
      binding: "mod+alt+x",
    },
    palette: true,
  },
  exitVideoNotes
);

};

logseq.ready(main).catch(console.error);
