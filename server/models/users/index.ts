import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
    {
        global_name: { type: String, required: true },
        message: { type: String, required: true},
        message_id: { type: String, required: true },
        created_timestamp: { type: Number, required: true },
        gpt_response: { type: String, required: true, default: null },
        tokens: [ 
        {
            prompt: { type: Number, required: true },
            completion: { type: Number, required: true },
            total: { type: Number, required: true },
        },
        ],
    },
    {
        expires: '7d', //ttl 1month
    }
);

const userSchema = new mongoose.Schema(
    { 
        user_id: { type: String, required: true },
        username: { type: String, required: true },
        content: [contentSchema],
        created_at: { type: Date, default: Date.now },
        credit: { type: Number, required: true, default: 0 }, //credit to use persistent data
        eula: { type: Boolean, required: true, default: false }, //eula agreement to use persistent data
    },
);

const Users = mongoose.model('Users', userSchema);

export default Users;