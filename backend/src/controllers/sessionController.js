import Session from '../models/Session.js';
import { streamClient, chatClient } from '../lib/stream.js';

export async function createSession(req, res) {
    try {
        const { problem, difficulty } = req.body;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        if (!problem || !difficulty) {
            return res.status(400).json({ message: "Problem and difficulty are required" })
        }

        //  genrate a unique call id fro stream video
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        //  create session in db
        const session = await Session.create({ problem, difficulty, host: userId, callId })

        // create stream video room here and get the room id

        try {
            await streamClient.video.
                call("default", callId)
                .getOrCreate({
                    data: {
                        created_by_id: clerkId,
                        custom: { problem, difficulty, sessionId: session._id.toString() }
                    }
                })
        } catch (error) {
            console.log("Failed to create Stream Video room")

        }

        // chat messaging 
        try {
            const channel = chatClient.channel("messaging", callId, {
                name: `${problem} Session`,
                created_by_id: clerkId,
                members: [clerkId]
            });

            await channel.create();
        } catch (error) {
          console.log("Failed to create Stream Chat channel") 
        }

        // to do : send emails and notifications here to users

        res.status(201).json({ message: "Session created successfully", session });
    } catch (error) {
        console.log("Error in creating session", error);
        return res.status(500).json({ message: "Server error in creating  Session", error: error.message });
    }

}

export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({ status: 'active' })
            .populate('host', 'name profileImage email clerkId')
            .populate('participant', 'name profileImage email clerkId')
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ sessions });
    } catch (error) {
        console.log("Error in getActiveSessions:", error)
        return res.status(500).json({ message: "Server error in fetching active Sessions", error: error.message });

    }
}

export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user._id;

        // get sessions where user is host or participant

        const sessions = await Session.find({
            status: "completed",
            $or: [{ host: userId }, { participant: userId }],
        })
            .sort({ createdAt: -1 })
            .limit(20)
        res.status(200).json({ sessions });
    } catch (error) {
        console.log("Error in getMyRecentSessions", error);
        return res.status(500).json({ message: "Server error in fetching your recent Sessions", error: error.message });
    }
}

export async function getSessionById(req, res) {
    try {
        const { id } = req.params
        const session = await Session.findById(id)
            .populate('host', 'name email profileImage clerkId')
            .populate('participant', 'name email profileImage clerkId')

        if (!session) return res.status(404).json({ message: "Session not found" })

        res.status(200).json({ session });
    } catch (error) {
        console.log("error in getSessionById controller", error);
        return res.status(500).json({ message: "Server error in fetching Session details", error: error.message });
    }
}

export async function joinSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id
        const clerkId = req.user.clerkId

        const session = await Session.findById(id);
        if (!session) return res.status(404).json({ message: "Session not found" })
        if (session.status !== "active") return res.status(400).json({ message: "Cannot join a completed session" })
        if (session.host.toString() === userId.toString()) return res.status(400).json({ message: "Host cannot join as participant" })

        // check if session is alreday filled
        if (session.participant) {
            return res.status(409).json({ message: "Session is already full" })
        }
        session.participant = userId
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({ message: "Joined session successfully", session });
    } catch (error) {
        console.log("Error in session join controller ", error);
        return res.status(500).json({ message: "Server error in joining Session", error: error.message });
    }
}

export async function endSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);

        if (!session) return res.status(404).json({ message: "Session not found" })
        //  check for user is host or not

        if (session.host.toString() !== userId.toString()) {

            return res.status(403).json({ message: "Only host can end the session" })
        }

        // check if session is already completed
        if (session.status === "completed") {
            return res.status(400).json({ message: "Session is already completed" });
        }


        // delete stream video room and chat channel 
        const call = streamClient.video.call("default", session.callId);
        await call.delete({ hard: true });

        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete();

        session.status = "completed";
        await session.save();


        res.status(200).json({ message: "Session ended successfully", session });
    } catch (error) {
        console.log("Error in endSession controller", error);
        return res.status(500).json({ message: "Server error in ending Session", error: error.message });
    }
}