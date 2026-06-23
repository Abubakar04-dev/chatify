<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatGroupMessage extends Model
{
    protected $fillable = [
        'group_id',
        'sender_id',
        'message',
        'attachment',
        'attachment_type',
    ];

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
}
