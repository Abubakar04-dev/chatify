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
        return new Channel('group.'.$this->message->group_id);
    }

    public function broadcastWith()
    {
        // 🔥 LOAD THE REPLY DATA
        $replyHtml = '';
        if ($this->message->replyTo) {
            $senderName = $this->message->replyTo->sender ? $this->message->replyTo->sender->name : 'Unknown';
            $messageText = $this->message->replyTo->message ?? '';

            // If message has attachment
            if (! $messageText && $this->message->replyTo->attachment) {
                $messageText = '📎 Attachment';
            }

            // Shorten long messages
            if (strlen($messageText) > 60) {
                $messageText = substr($messageText, 0, 60).'...';
            }

            $replyHtml = '
            <div class="message-reply-preview" style="background:#f1f2f6; padding:6px 10px; border-radius:6px; margin-bottom:4px; border-left:3px solid #667eea; font-size:12px;">
                <div style="color:#636e72; font-weight:600; margin-bottom:2px;">
                    <i class="fas fa-reply" style="font-size:10px; margin-right:4px;"></i>
                    '.$senderName.'
                </div>
                <div style="color:#2d3436; word-wrap:break-word; font-size:13px;">
                    '.$messageText.'
                </div>
            </div>
            ';
        }

        return [
            'message' => [
                'id' => $this->message->id,
                'group_id' => $this->message->group_id,
                'message' => $this->message->message,
                'attachment' => $this->message->attachment,
                'attachment_type' => $this->message->attachment_type,
                'sender_id' => $this->message->sender_id,
                'sender' => $this->message->sender ? [
                    'id' => $this->message->sender->id,
                    'name' => $this->message->sender->name,
                    'avatar' => $this->message->sender->avatar ?? null,
                ] : null,
                'reply_to_id' => $this->message->reply_to_id, // 🔥 ADD THIS LINE
                'reply_html' => $replyHtml, // 🔥 ADD THIS LINE
                'created_at' => $this->message->created_at->toDateTimeString(),
            ],
        ];
    }
}
