<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatGroupMember extends Model
{
    protected $fillable = [
        'group_id',
        'user_id',
        'is_admin',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function group()
    {
        return $this->belongsTo(ChatGroup::class);
    }
}