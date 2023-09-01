import express, {Request, Response} from 'express';
import { Users, Guilds } from '../../models/index';
import { UserDataType, GuildDataType, ExistingEntyyType } from '../../utils/types';
import dayjs from 'dayjs';
import  { JwtPayload } from 'jsonwebtoken';

const router = express.Router();

router.get('/users', async (req: Request, res: Response) => {
    try {
        const id = (req.user as JwtPayload).id;

        const user: UserDataType | null = await Users.findOne({ user_id: id }).populate('content');

        if(!user) {
            return res.status(200).send('No user found');
        }
        const tokenMap = new Map(); // create a map to store the data
        
        user.content.forEach((content) => {
            const date = dayjs(content.created_timestamp); // get the date from the content
            const day = date.day(); // get the day of the week
            const dayName = date.format('dddd'); // get the name of the day of the week
    
            const tokens = content.tokens;
            const totalTokens = tokens.reduce((acc, token) => acc + token.total, 0); // get the total tokens for the day
    
            if (tokenMap.has(day)) {
                const existingEntry = tokenMap.get(day) as ExistingEntyyType; // get the existing entry
                existingEntry.tokens[0].total += totalTokens; // add the total tokens to the existing entry
                existingEntry.count += 1; // increment the count
            } else {
                tokenMap.set(day, { day, dayName, tokens: [{ total: totalTokens }], count: 1 }); // create a new entry
            }
        });
        
        const tokenArr = [...tokenMap.values()]; // convert the map to an array
        
        res.status(200).json( tokenArr );
    } catch (error) {
        console.error('Error fetching and processing data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/guilds', async (req, res) => {
    try {        
        const id = req.headers.guild_id as string;        

        const guild: GuildDataType | null = await Guilds.findOne({ guild_id: id }). populate('content');

        if (!guild) {
            return res.status(200).send({ guild_name: 'No guild found' });
        }

        const tokenMap = new Map();

        guild.content.forEach(content => {
            // return guild.content
            const date = dayjs(content.author[0].created_timestamp);
            const day = date.day();
            const dayName = date.format('dddd');
    
            const tokens = content.tokens;
            const totalTokens = tokens.reduce((acc, token) => acc + token.total, 0);
    
            if (tokenMap.has(day)) {
                const existingEntry = tokenMap.get(day);
                existingEntry.tokens[0].total += totalTokens;
                existingEntry.count += 1; 
            } else {
                tokenMap.set(day, { day, dayName, tokens: [{ total: totalTokens }], count: 1 });
            }
        });
    
        const tokenArr = [...tokenMap.values()];
        
        res.status(200).json({ guild_name: guild.guild_name, tokenArr });
    } catch (error) {
        console.error('Error fetching and processing data:', error);
        res.status(500).send('Internal Server Error');
    }
});


export default router;