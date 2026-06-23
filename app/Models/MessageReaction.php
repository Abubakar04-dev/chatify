<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MessageReaction extends Model
{
    protected $fillable = [
        'message_id',
        'user_id',
        'reaction'
    ];

    // For private messages (Chatify)
    public function privateMessage()
    {
        return $this->belongsTo(ChMessage::class, 'message_id');
    }

    // For group messages
    public function groupMessage()
    {
        return $this->belongsTo(ChatGroupMessage::class, 'message_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
