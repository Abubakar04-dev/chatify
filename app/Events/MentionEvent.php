<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MentionEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $sender;
    public $groupName;
    public $message;
    public $isAllMention;

    public function __construct($userId, $sender, $groupName, $message, $isAllMention = false)
    {
        $this->userId = $userId;
        $this->sender = $sender;
        $this->groupName = $groupName;
        $this->message = $message;
        $this->isAllMention = $isAllMention;
    }

    public function broadcastOn()
    {
        // 🔥 THIS MUST BE A PUBLIC CHANNEL (not private)
        return new Channel('user.' . $this->userId);
    }

    public function broadcastWith()
    {
        return [
            'sender_name' => $this->sender->name,
            'sender_id' => $this->sender->id,
            'group_name' => $this->groupName,
            'message_text' => $this->message->message ?? 'mentioned you',
            'message_id' => $this->message->id,
            'group_id' => $this->message->group_id,
            'is_all_mention' => $this->isAllMention,
        ];
    }
}