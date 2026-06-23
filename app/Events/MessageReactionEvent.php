<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageReactionEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messageId;
    public $reactions;
    public $type;

    public function __construct($messageId, $reactions, $type)
    {
        $this->messageId = $messageId;
        $this->reactions = $reactions;
        $this->type = $type;
    }

    public function broadcastOn()
    {
        if ($this->type === 'private') {
            // For private messages, broadcast to both participants
            $message = \App\Models\ChMessage::find($this->messageId);
            if ($message) {
                return [
                    new Channel('private-chatify.' . $message->from_id),
                    new Channel('private-chatify.' . $message->to_id),
                ];
            }
            return new Channel('private-chatify');
        } else {
            // For group messages, broadcast to the group channel
            $message = \App\Models\ChatGroupMessage::find($this->messageId);
            if ($message) {
                return new Channel('group.' . $message->group_id);
            }
        }
        return new Channel('private-chatify');
    }

    public function broadcastWith()
    {
        return [
            'message_id' => $this->messageId,
            'reactions' => $this->reactions->map(function ($reaction) {
                return [
                    'id' => $reaction->id,
                    'reaction' => $reaction->reaction,
                    'user_id' => $reaction->user_id,
                    'user' => [
                        'id' => $reaction->user->id,
                        'name' => $reaction->user->name
                    ]
                ];
            }),
            'type' => $this->type
        ];
    }
}
