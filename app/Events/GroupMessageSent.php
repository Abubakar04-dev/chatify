<?php

namespace App\Events;

use App\Models\ChatGroupMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(ChatGroupMessage $message)
    {
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new Channel('group.' . $this->message->group_id);
    }

    public function broadcastWith()
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'group_id' => $this->message->group_id, // 🔥 ADD THIS LINE
                'message' => $this->message->message,
                'attachment' => $this->message->attachment,
                'attachment_type' => $this->message->attachment_type,
                'sender_id' => $this->message->sender_id,
                'sender' => $this->message->sender ? [
                    'id' => $this->message->sender->id,
                    'name' => $this->message->sender->name,
                    'avatar' => $this->message->sender->avatar ?? null,
                ] : null,
                'created_at' => $this->message->created_at->toDateTimeString()
            ]
        ];
    }
}
