import { chatClient } from "../lib/stream";


export async function getStreamToken(req, res) {

    try {
        // use clerkId as the user ID for Stream not the mongodb id so that it matches with clerk user
        const token = chatClient.createToken(req.user.clerkId);
        return res.status(200).json({
             token,
             userId:req.user.clerkId,
            userName:req.user.name,
            userImage:req.user.image
            }) 
    } catch (error) {
        return res.status(500).json({message:"Failed to generate Stream token", error:error.message})   
    }
}