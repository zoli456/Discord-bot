let uploadsPlaylistId_cache = Array();
let RequestCache = Array();
// Function to get channel ID from channel name
async function getChannelIdByName(channelName) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(channelName)}&type=channel&key=${process.env.YOUTUBE_API_KEY}&maxResults=1`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const channelId = data.items[0].id.channelId;
      const channelTitle = data.items[0].snippet.channelTitle;
      return { channelId, channelTitle };
    } else {
      //console.log("No channel found with that name.");
      return null;
    }
  } catch (error) {
    //console.error("Error fetching channel ID:", error.message);
    return null;
  }
}

// Function to fetch the latest videos or streams
async function fetchLatestContent(channelId) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet&order=date&maxResults=5`,
    );
    console.log(response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        liveBroadcastContent: item.snippet.liveBroadcastContent, // live, upcoming, or none
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching latest content:", error);
    return [];
  }
}
async function getYouTubeChannelIdBySearch(query) {
  try {
    // Encode the search query to be URL-safe
    const encodedQuery = encodeURIComponent(query);

    // Perform a search on YouTube for the query
    const response = await fetch(`https://www.youtube.com/results?search_query=${encodedQuery}`);
    const pageContent = await response.text();

    // Search for the first occurrence of channelId in the page content
    const channelIdMatch = pageContent.match(/"channelId":"(UC[\w-]+)"/);

    if (channelIdMatch && channelIdMatch[1]) {
      return channelIdMatch[1];
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function listYouTubeChannelVideos(channelId) {
  if (RequestCache[channelId]) {
    return RequestCache[channelId];
  }
  let uploadsPlaylistId;
  if (!uploadsPlaylistId_cache[channelId]) {
    try {
      // Step 1: Get the Uploads playlist ID from the channel details
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`,
      );
      const channelData = await channelResponse.json();

      if (!channelData.items || channelData.items.length === 0) {
        throw new Error("Channel not found");
      }

      uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
      uploadsPlaylistId_cache[channelId] = uploadsPlaylistId;
    } catch (error) {
      return null;
    }
  } else {
    uploadsPlaylistId = uploadsPlaylistId_cache[channelId];
  }
  try {
    // Step 2: Get videos from the Uploads playlist (get video IDs only)
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=4&key=${process.env.YOUTUBE_API_KEY}`,
    );
    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error("No videos found in the playlist");
    }

    // Extract video IDs
    const videoIds = playlistData.items.map((item) => item.contentDetails.videoId);

    // Step 3: Fetch video details to check live status and upcoming status
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds.join(",")}&key=${process.env.YOUTUBE_API_KEY}`,
    );
    const videosData = await videosResponse.json();
    setTimeout(() => {
      RequestCache[channelId] = undefined;
    }, "30000");
    // Step 4: Identify live streams, upcoming streams, and regular videos
    return videosData.items.map((item) => {
      const { title, description, thumbnails, liveBroadcastContent, publishedAt } = item.snippet;
      const videoId = item.id;
      RequestCache[channelId] = {
        title,
        description,
        videoId,
        thumbnail: thumbnails.default.url,
        liveBroadcastContent,
        publishedAt,
        liveDetails: item.liveStreamingDetails,
      };
      return {
        title,
        description,
        videoId,
        thumbnail: thumbnails.default.url,
        liveBroadcastContent,
        publishedAt,
        liveDetails: item.liveStreamingDetails, // Additional live details if available
      };
    });
  } catch (error) {
    console.error("Error fetching YouTube channel videos:", error);
    return null;
  }
}

module.exports = {
  getChannelIdByName,
  fetchLatestContent,
  getYouTubeChannelIdBySearch,
  listYouTubeChannelVideos,
};
