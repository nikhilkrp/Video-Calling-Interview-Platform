import { chatClient, streamClient } from "../lib/stream.js";


export async function getStreamToken(req, res) {

    try {

        if (!req.user || !req.user.clerkId) {
            return res.status(401).json({ message: "Authentication required" });
        }
        // use clerkId as the user ID for Stream not the mongodb id so that it matches with clerk user
        const token = streamClient.createToken(req.user.clerkId);
        return res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            userImage: req.user.image
        })
    } catch (error) {
        console.log("Error on getStreamToken controller");
        return res.status(500).json({ message: "Failed to generate Stream token", error: error.message })
    }
}