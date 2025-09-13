//Text based AI CHAT message Controller

import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";


export const textMessageController = async (req, res) => {

    try {
        const userId = req.user._id;
        const { chatId, prompt } = req.body;
        console.log("ids--", userId, chatId)

        const chat = await Chat.findOne({
            userId,
            _id:chatId
        }); console.log("chat-->", chat)
        chat.messages.push({ role: "User", content: prompt, timestamp: Date.now(), isImage: false });

        console.log("Coming...", chat)

        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [

                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false };
        console.log("reply", reply)
        res.json({ success: true, reply })

        chat.messages.push(reply);
        await chat.save();

        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

    } catch (error) {
        console.log("error in here")
        res.json({ success: false, message: error.message })
    }


}

//Image Generation message Controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;

        // console.log("data--",userId)

        //check credits

        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You don't have  enough credits to use this feature. Please buy more credits." })
        }
        const { prompt, chatId, isPublished } = req.body;

        //find chat
        const chat = await Chat.findOne({ userId, _id: chatId })

        //Push user message
        chat.messages.push({
            role: "User",
            content: prompt,
            timestamp: Date.now(),
            isImage: false




        });
        //Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        //Construct ImageKit AI generation URL

        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/QuickGPT/${Date.now()}.png?tr
=800, h-800`;

        //Trigger generation by fetching from ImageKit


        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' });


        //convert to base64


        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;


        //Upload to ImageKit Media Library


        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `QuickGPT-${Date.now()}.png`,
            folder: "QuickGPT"
        })

        const reply = {
            role: "assistant",
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        };

        res.json({ success: true, reply })
        chat.messages.push(reply);
        await chat.save();
        await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });



    } catch (error) {

        res.json({ success: false, message: error.message })
    }
}