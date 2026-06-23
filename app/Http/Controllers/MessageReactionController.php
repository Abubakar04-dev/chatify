<?php

namespace App\Http\Controllers;

use App\Models\ChMessage;
use App\Models\ChatGroupMessage;
use App\Models\MessageReaction;
use App\Events\MessageReactionEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageReactionController extends Controller
{
    // Toggle reaction for private message
    public function togglePrivateReaction(Request $request)
    {
        $request->validate([
            'message_id' => 'required|exists:ch_messages,id',
            'reaction' => 'required|string|in:👍,❤️,😂,😮,😢,😡'
        ]);

        $message = ChMessage::find($request->message_id);

        // Check if user is allowed to react
        if ($message->from_id != Auth::id() && $message->to_id != Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $this->toggleReaction($request->message_id, $request->reaction, 'private');
    }

    // Toggle reaction for group message
    public function toggleGroupReaction(Request $request)
    {
        $request->validate([
            'message_id' => 'required',
            'reaction' => 'required|string|in:👍,❤️,😂,😮,😢,😡'
        ]);

        $message = ChatGroupMessage::find($request->message_id);

        // Check if user is a member of the group
        if (!$message->group->members()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $this->toggleReaction($request->message_id, $request->reaction, 'group');
    }

    // Core toggle reaction logic
    private function toggleReaction($messageId, $reaction, $type)
    {
        // Check if reaction exists
        $existing = MessageReaction::where('message_id', $messageId)
            ->where('user_id', Auth::id())
            ->where('reaction', $reaction)
            ->first();

        if ($existing) {
            // Remove reaction (toggle off)
            $existing->delete();
            $action = 'removed';
        } else {
            // Remove any other reaction from this user on this message
            MessageReaction::where('message_id', $messageId)
                ->where('user_id', Auth::id())
                ->delete();

            // Add new reaction
            MessageReaction::create([
                'message_id' => $messageId,
                'user_id' => Auth::id(),
                'reaction' => $reaction
            ]);
            $action = 'added';
        }

        $reactions = MessageReaction::where('message_id', $messageId)
            ->with('user')
            ->get();

        // Broadcast the reaction update
        broadcast(new MessageReactionEvent($messageId, $reactions, $type))->toOthers();

        return response()->json([
            'success' => true,
            'action' => $action,
            'reactions' => $reactions
        ]);
    }

    // Get reactions for a message
    public function getReactions(Request $request)
    {
        $request->validate([
            'message_id' => 'required',
            'type' => 'required|in:private,group'
        ]);

        $reactions = MessageReaction::where('message_id', $request->message_id)
            ->with('user')
            ->get();

        return response()->json([
            'success' => true,
            'reactions' => $reactions
        ]);
    }
}
