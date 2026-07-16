<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ChatGroupMessage extends Model
{
    protected $fillable = [
        'group_id',
        'sender_id',
        'message',
        'attachment',
        'attachment_type',
        'reply_to_id',
    ];


    
    // 🔥 RELATIONSHIP: Get the message being replied to
    public function replyTo()
    {
        return $this->belongsTo(ChatGroupMessage::class, 'reply_to_id')
            ->with('sender');
    }

    // 🔥 RELATIONSHIP: Get replies to this message
    public function replies()
    {
        return $this->hasMany(ChatGroupMessage::class, 'reply_to_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function group()
    {
        return $this->belongsTo(ChatGroup::class);
    }

    // 🔥 ADD THIS RELATIONSHIP
    public function reads()
    {
        return $this->hasMany(ChatGroupRead::class, 'message_id');
    }

    // Check if message is read by a user
    public function isReadBy($userId)
    {
        return $this->reads()->where('user_id', $userId)->exists();
    }


    // 🔥 ADD REACTIONS RELATIONSHIP
    public function reactions()
    {
        return $this->hasMany(MessageReaction::class, 'message_id');
    }

    // Check if message is read by a user
    // public function isReadBy($userId)
    // {
    //     return $this->reads()->where('user_id', $userId)->exists();
    // }

    // 🔥 ADD HELPER METHODS FOR REACTIONS
    public function getReactionsGroupedAttribute()
    {
        return $this->reactions()
            ->select('reaction', DB::raw('count(*) as count'))
            ->groupBy('reaction')
            ->get()
            ->pluck('count', 'reaction')
            ->toArray();
    }

    public function hasUserReaction($userId, $reaction)
    {
        return $this->reactions()
            ->where('user_id', $userId)
            ->where('reaction', $reaction)
            ->exists();
    }

    public function getUserReaction($userId)
    {
        return $this->reactions()
            ->where('user_id', $userId)
            ->first();
    }
}
