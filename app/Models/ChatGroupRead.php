<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatGroupRead extends Model
{
    protected $fillable = [
        'message_id',
        'user_id',
        'seen_at'
    ];

    protected $casts = [
        'seen_at' => 'datetime'
    ];

    public function message()
    {
        return $this->belongsTo(ChatGroupMessage::class, 'message_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}