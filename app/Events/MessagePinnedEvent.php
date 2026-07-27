<?php

namespace App\Events;

use App\Models\ChatGroup;
use App\Models\ChatGroupMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessagePinnedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public $group;

    public $action;

    public function __construct(ChatGroupMessage $message, ChatGroup $group, $action)
    {
        $this->message = $message;
        $this->group = $group;
        $this->action = $action; // 'pinned' or 'unpinned'
    }

    public function broadcastOn()
    {
        return new Channel('group.'.$this->group->id);
    }

    public function broadcastWith()
    {
        return [
            'message_id' => $this->message->id,
            'group_id' => $this->group->id,
            'action' => $this->action,
            'pinned_message' => $this->message,
            'sender_name' => $this->message->sender->name ?? 'Unknown',
            'pinned_by' => $this->message->pinnedBy->name ?? 'Admin',
        ];
    }
}
