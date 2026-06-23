<?php

namespace App\Models;

use Chatify\Traits\UUID;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ChMessage extends Model
{
    use UUID;

    protected $table = 'ch_messages'; // Make sure this matches your table name

    public function reactions()
    {
        return $this->hasMany(MessageReaction::class, 'message_id');
    }

    public function getReactionsGroupedAttribute()
    {
        return $this->reactions()
            ->select('reaction', DB::raw('count(*) as count'))
            ->groupBy('reaction')
            ->get()
            ->pluck('count', 'reaction')
            ->toArray();
    }

    // Check if a user has reacted with a specific emoji
    public function hasUserReaction($userId, $reaction)
    {
        return $this->reactions()
            ->where('user_id', $userId)
            ->where('reaction', $reaction)
            ->exists();
    }

    // Get user's reaction on this message
    public function getUserReaction($userId)
    {
        return $this->reactions()
            ->where('user_id', $userId)
            ->first();
    }
}
