import express, {Request, Response} from 'express';
import { Users, Guilds } from '../../models/index';
import { UserDataType, GuildDataType } from '../../utils/types';
import mapGenerator from '../../utils/mapGenerator';
import  { JwtPayload } from 'jsonwebtoken';

const router = express.Router();

const tokenMerge = async (userData: any, guildData: any) => {
    try {
        const mergedMap = new Map();

        const merge = (data: any) => {
            for (const entry of data) {
                const { day, dayName, tokens, count } = entry;

                if (!mergedMap.has(day)) {
                    // If the day doesn't exist in the map, add it
                    mergedMap.set(day, { day, dayName, tokens, count });
                } else {
                    // If the day exists, update the total and count
                    const existingDay = mergedMap.get(day);
                    existingDay.tokens[0].total += tokens[0].total;
                    existingDay.count += count;
                }
            }
        };

        merge(userData.userTokenArr);
        merge(guildData.guildTokenArr);

        const mergedArr = Array.from(mergedMap.values());
        return mergedArr;
    } catch (err) {
        console.error(err);
    }
};

router.get('/', async (req: Request, res: Response) => {
    try {
        const id = (req.user as JwtPayload).id;

        const user: UserDataType | null = await Users.findOne({ user_id: id }).populate('content');

        if(!user) {
            return res.status(200).send('No user found');
        }

        const userTokenArr = await mapGenerator(user.content);

        const userGuildData = user.guilds;
        let userGuild;

        let guildTokenArr: any[] = [];
        
        for (const i of userGuildData) {
            const guild: GuildDataType | null = await Guilds.findOne({ guild_id: i }).populate('content');
            userGuild = guild;

            if (guild) {
                const tokenMap = await mapGenerator(guild.content);
                guildTokenArr.push(tokenMap);
            }
        }

    //    const merge = await tokenMerge(userTokenArr, guildTokenArr);

        return res.status(200).json({ user, userGuild});
    } catch (error) {
        console.error('Error fetching and processing data:', error);
    }
});


router.get('/users', async (req: Request, res: Response) => {
    try {
        const id = (req.user as JwtPayload).id;

        const user: UserDataType | null = await Users.findOne({ user_id: id }).populate('content');

        if(!user) {
            return res.status(200).send('No user found');
        }

        const tokenArr = await mapGenerator(user.content);
        
        res.status(200).json({ credit: user.credit, tokenArr });
    } catch (error) {
        console.error('Error fetching and processing data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/guilds', async (req: Request, res: Response) => {
    try {        
        const id = req.headers.guild_id as string;        

        const guild: GuildDataType | null = await Guilds.findOne({ guild_id: id }).populate('content');

        if (!guild) {
            return res.status(200).send({ guild_name: 'No guild found' });
        }

        const tokenArr = await mapGenerator(guild.content);
        
        res.status(200).json({credit: guild.credit, guild_name: guild.guild_name, tokenArr });
    } catch (error) {
        console.error('Error fetching and processing data:', error);
        res.status(500).send('Internal Server Error');
    }
});


export default router;