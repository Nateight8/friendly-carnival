import { StreamChat } from "stream-chat";
import { configDotenv } from "dotenv";

configDotenv();
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set");
}
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    const { id, ...userDataWithoutId } = userData;

    if (!id) {
      throw new Error("User ID is required when updating a user");
    }

    // Format user data correctly for Stream API
    // The API expects { [userId]: userData } format
    const formattedData = {
      [id]: {
        id, // Make sure id is included in the user data
        ...userDataWithoutId,
      },
    };

    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  if (!userId) {
    throw new Error("User ID is required to generate Stream token");
  }

  // Generate a token for the user
  return streamClient.createToken(userId);
};
