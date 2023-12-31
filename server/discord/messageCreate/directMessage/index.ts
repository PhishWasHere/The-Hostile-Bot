import {chatCompletion} from '../../../config/gpt/';
import { Users, Content } from '../../../models/';
import { Message } from 'discord.js';
import { UserData } from '../../../utils/types';
import itemCounter from '../../../utils/itemCount';

export const newUser = async (msg: Message, msgContent: any) => {
    try {
        const userData = new Users({
            user_id: msg.author.id,
            username: msg.author.username,
            avatar: msg.author.avatarURL(),
        });

        await userData.save();

        const completion = await chatCompletion(msgContent);

        const { prompt_tokens, completion_tokens, total_tokens } = completion.data.usage;
        const gptRes = completion.data.choices[0].message.content;

        const contentData = await Content.create({
            user: userData._id,
            global_name: msg.author.username,
            message: msgContent,
            message_id: msg.author.id,
            created_timestamp: msg.createdTimestamp,
            gpt_response: gptRes,
            tokens: [
                {
                    prompt: prompt_tokens,
                    completion: completion_tokens,
                    total: total_tokens,
                },
            ],
        });

        await Users.findOneAndUpdate(
            { user_id: userData.user_id },
            {$addToSet: {content: contentData._id},
        });

        return gptRes;
    } catch (err) {
        console.error(`Server error: `, err);
    }
};

export const existingUser = async (msg: Message, msgContent: string, userData: UserData) => {
    try {
        const maxCount = process.env.MAX_COUNT ? parseInt(process.env.MAX_COUNT) : 10;

        const messages = userData.content
        .slice(Math.max(userData.content.length - maxCount, 0))
        .map((message: any) => message.message); // gets last 10 messages from user
       
        const user = userData.content
            .map((message: any) => message.global_name); 
                
        const gpt_Responses = userData.content
            .slice(Math.max(userData.content.length - maxCount, 0))
            .map((message: any) => message.gpt_response);// get last 10 responses from user

        const prompts = messages.map((message) => { // create prompts array
            return {
                role: 'user',
                content: `${user}: ${message}`
            };
        });

        const responses = gpt_Responses.map((response) => {
            return {
                role: 'assistant',
                content: response
            };
        });        
        
        const completion = await chatCompletion(msgContent, prompts, responses); // send prompts and responses to gpt
        const {prompt_tokens, completion_tokens, total_tokens} =  completion.data.usage;
        const gptRes = completion.data.choices[0].message.content; // get gpt response

        const contentData = await Content.create({
            user: userData._id,
            global_name: msg.author.username,
            message: msgContent,
            message_id: msg.author.id,
            created_timestamp: msg.createdTimestamp,
            gpt_response: gptRes,
            tokens: [
                {
                    prompt: prompt_tokens,
                    completion: completion_tokens,
                    total: total_tokens,
                },
            ],
        });

        await Users.findOneAndUpdate(
            { user_id: userData.user_id },
            {$addToSet: {content: contentData._id},
        });
        
        await itemCounter({user_id: userData._id}); // item counter removes excess items from db

        return gptRes;

    } catch (err) {
        console.error(err);
    }
}

// function cannot remove more than 1 item, so cant lower maxCount without db reset