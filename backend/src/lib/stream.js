import {StreamChat} from "stream-chat"
import {ENV} from "./env.js"
import {StreamClient} from "@stream-io/node-sdk"

const apiKey = ENV.STREAM_API_KEY
const apiSecret = ENV.STREAM_API_SECRET

if(!apiKey || !apiSecret){
    console.error("Stream API key or secret is missing.");
}
// this is for chat messaging backend operations
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);
// this is for video call backend operations
export const streamClient = new StreamClient(apiKey, apiSecret);

// create or update a user in Stream
export const upsertStreamUser = async (userData) => {
    try {
        await  chatClient.upsertUser(userData);
        console.log("Stream user upserted successfully:", userData);
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
} 

export const deleteStreamUser = async (userId) => {
    try {
        await  chatClient.deleteUser(userId, );
        console.log("Stream user deleted:", userId);
    } catch (error) {
        console.error("Error deleting Stream user:", error);
    }
} 