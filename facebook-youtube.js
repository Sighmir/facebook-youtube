const fs = require("fs");

function readPosts() {
  const posts = fs.readFileSync(process.argv[2]);
  return JSON.parse(posts);
}

function readOutputFile() {
  if (!fs.existsSync(process.argv[3])) return [];
  const existingVideos = fs.readFileSync(process.argv[3]);
  return JSON.parse(existingVideos);
}

function writeOutputFile(videoIds) {
  return fs.writeFileSync(process.argv[3], JSON.stringify(videoIds, null, 4));
}

function getYoutubeIdFromPost(post) {
  let videoId = null;
  try {
    const link = post
      .replace(/\n/g, " ")
      .split(/\s+/g)
      .find(word => word.includes("youtu.be") || word.includes("youtube.com"));
    if (link) {
      if (link.length === 11) {
        videoId = link;
      } else if (link.includes("youtu.be")) {
        videoId = link
          .split("youtu.be/")[1]
          .split("&")[0]
          .split("?")[0];
      } else {
        videoId = link
          .split("v=")[1]
          .split("&")[0]
          .split("?")[0];
      }
    }
  } catch {}
  return videoId;
}

function getPostedVideos(posts) {
  const videoIds = [];
  for (const post of posts) {
    if (post.data) {
      const message = post.data.find(d => d.post);
      if (message) {
        const videoId = getYoutubeIdFromPost(message.post);
        if (videoId) {
          console.log(videoId);
          videoIds.push(videoId);
        }
      }
    }
  }
  return videoIds;
}

function logVideos(videoIds) {
  const existingVideos = readOutputFile();
  const uniqueVideos = Array.from(new Set([...videoIds, ...existingVideos]));
  writeOutputFile(uniqueVideos);
}

function verifyArguments() {
  if (!process.argv[2]) {
    console.error(
      "Missing input file, download your posts in json format from Facebook!"
    );
    process.exit();
  } else if (!process.argv[3]) {
    console.error(
      "Missing output file, please write a path to the output file!"
    );
    process.exit();
  }
}

function main() {
  verifyArguments();
  const posts = readPosts();
  const videoIds = getPostedVideos(posts);
  logVideos(videoIds);
}

if (require.main === module) {
  main();
}
