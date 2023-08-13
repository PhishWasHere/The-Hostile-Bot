import { newGuild, existingGuild } from "./guilds";
import { newUser, existingUser } from "./directMessage";
import {Users, Guilds} from '../../models';
import { Message } from "discord.js";

export const handleDm = async (msg: Message, msgContent: string) => {
    const userData = await Users.findOne({ user_id: msg.author.id });

    if (!userData) {
        const gptRes = await newUser(msg, msgContent);
        msg.reply(gptRes);
    } else {
        const gptRes = await existingUser(msg, msgContent, userData);
        msg.reply(gptRes);
    }
};

export const handleGuild = async (msg: Message, msgContent: string) => {
    const guildData = await Guilds.findOne({ guild_id: msg.guildId });

    if (!guildData) {
        const gptRes = await newGuild(msg, msgContent);
        msg.reply(gptRes);
    } else {
        const gptResponse = await existingGuild(msg, msgContent, guildData);
        msg.reply(gptResponse);
    }
};