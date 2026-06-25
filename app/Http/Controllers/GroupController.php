<?php

namespace App\Http\Controllers;

use App\Events\GroupMessageSent;
use App\Models\ChatGroup;
use App\Models\ChatGroupMember;
use App\Models\ChatGroupMessage;
use App\Models\ChatGroupRead;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GroupController extends Controller
{
    public function create()
    {
        $users = User::where('id', '!=', Auth::id())->get();
        return view('groups.create', compact('users'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255',
            'members' => 'required|array',
            'image' => 'nullable|image|max:2048'
        ]);

        $image = null;

        if ($request->hasFile('image')) {
            $image = $request->file('image')
                ->store('groups', 'public');
        }

        $group = ChatGroup::create([
            'name' => $request->name,
            'image' => $image,
            'created_by' => Auth::id()
        ]);

        ChatGroupMember::create([
            'group_id' => $group->id,
            'user_id' => Auth::id(),
            'is_admin' => true
        ]);

        foreach ($request->members as $memberId) {
            ChatGroupMember::create([
                'group_id' => $group->id,
                'user_id' => $memberId,
                'is_admin' => false
            ]);
        }

        return response()->json([
            'success' => true,
            'group_id' => $group->id
        ]);
    }

    public function list()
    {
        $groups = ChatGroup::whereHas('members', function ($q) {
            $q->where('user_id', auth()->id());
        })->latest()->get();

        $groupsData = [];

        foreach ($groups as $group) {
            // Get last message
            $lastMessage = ChatGroupMessage::where('group_id', $group->id)
                ->latest()
                ->first();

            // Count unread messages
            $unreadCount = ChatGroupMessage::where('group_id', $group->id)
                ->where('sender_id', '!=', auth()->id())
                ->whereDoesntHave('reads', function ($q) {
                    $q->where('user_id', auth()->id());
                })
                ->count();

            $groupsData[] = [
                'id' => $group->id,
                'name' => $group->name,
                'image' => $group->image,
                'created_by' => $group->created_by,
                'created_at' => $group->created_at,
                'updated_at' => $group->updated_at,
                'last_message' => $lastMessage ? $lastMessage->message : null,
                'last_message_time' => $lastMessage ? $lastMessage->created_at : null,
                'unread_count' => $unreadCount,
            ];
        }

        return response()->json($groupsData);
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:chat_groups,id'
        ]);

        $messages = ChatGroupMessage::where('group_id', $request->group_id)
            ->where('sender_id', '!=', auth()->id())
            ->whereDoesntHave('reads', function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->get();

        foreach ($messages as $message) {
            ChatGroupRead::create([
                'message_id' => $message->id,
                'user_id' => auth()->id(),
                'seen_at' => now()
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function show(ChatGroup $group)
    {
        return response()->json([
            'id' => $group->id,
            'name' => $group->name
        ]);
    }



    public function messages(ChatGroup $group)
    {
        // Verify user is a member
        if (!$group->members()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 🔥 LOAD MESSAGES WITH REACTIONS IN ONE QUERY
        // $messages = ChatGroupMessage::where('group_id', $group->id)
        //     ->with('sender')
        //     ->with(['reactions' => function ($q) {
        //         $q->with('user'); // Load user data for reactions
        //     }])
        //     ->orderBy('id', 'asc')
        //     ->get();

        // 🔥 FIX: Load messages with reactions using proper relationship
        $messages = ChatGroupMessage::where('group_id', $group->id)
            ->with('sender')
            ->with(['reactions' => function ($q) {
                $q->with(['user' => function ($query) {
                    $query->select('id', 'name', 'avatar');
                }]);
            }])
            ->orderBy('id', 'asc')
            ->get();

        $html = '';
        $lastDate = null;

        if ($messages->isEmpty()) {
            $html = '<div class="message-hint" style="text-align:center;padding:40px;color:#999;">No messages yet. Say hi!</div>';
        } else {
            foreach ($messages as $msg) {
                $isMe = $msg->sender_id == auth()->id();

                // Add date divider
                $messageDate = $msg->created_at->format('Y-m-d');
                if ($lastDate != $messageDate) {
                    $lastDate = $messageDate;
                    $dateDisplay = $this->formatDateDisplay($msg->created_at);
                    $html .= '
                <div class="date-divider">
                    <span>' . $dateDisplay . '</span>
                </div>
                ';
                }

                // Build message content
                $messageContent = '';

                // Add text message
                if ($msg->message) {
                    $messageContent .= '<div class="message-text">' . e($msg->message) . '</div>';
                }

                // Add attachment
                if ($msg->attachment) {
                    $fileUrl = asset('storage/' . $msg->attachment);
                    $isImage = str_starts_with($msg->attachment_type ?? '', 'image/');

                    if ($isImage) {
                        $messageContent .= '<div class="chat-image" style="background-image: url(' . $fileUrl . '); max-width:200px; max-height:200px; background-size:cover; background-position:center; border-radius:8px; margin-top:5px; cursor:pointer;"></div>';
                    } else {
                        $fileName = basename($msg->attachment);
                        $messageContent .= '<div class="file-attachment" style="padding:6px 10px; background:#f1f2f6; border-radius:6px; margin-top:4px; display:inline-block;">';
                        $messageContent .= '<i class="fas fa-paperclip" style="font-size:12px;"></i> <a href="' . $fileUrl . '" target="_blank" style="color:#0984e3; text-decoration:none; font-size:13px;">' . $fileName . '</a>';
                        $messageContent .= '</div>';
                    }
                }

                // Add time to message
                $timeDisplay = $msg->created_at->format('h:i A');

                // 🔥 BUILD REACTIONS HTML DIRECTLY IN THE MESSAGE
                $reactionsHtml = $this->buildReactionsHtml($msg->reactions);

                $html .= '
            <div class="message-card ' . ($isMe ? 'mc-sender' : 'mc-receiver') . '" data-message-id="' . $msg->id . '">
                <div class="message">
                    <div class="message-user" style="font-size:11px; font-weight:600; color:#636e72; margin-bottom:2px; display:flex; align-items:center; justify-content:space-between;">
                        <span>' . ($isMe ? 'You' : e($msg->sender->name)) . '</span>
                        <span class="message-time" style="font-size:10px; font-weight:400; color:#b2bec3; margin-left:10px;">' . $timeDisplay . '</span>
                    </div>
                    ' . $messageContent . '
                    ' . $reactionsHtml . '
                </div>
            </div>
            ';
            }
        }

        return response()->json([
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'image' => $group->image,
            ],
            'messages_html' => $html
        ]);
    }

    // 🔥 HELPER FUNCTION: Build reactions HTML
    private function buildReactionsHtml($reactions)
    {
        if (!$reactions || $reactions->isEmpty()) {
            return '';
        }

        // Group reactions by emoji
        $grouped = [];
        foreach ($reactions as $reaction) {
            if (!isset($grouped[$reaction->reaction])) {
                $grouped[$reaction->reaction] = [];
            }
            $grouped[$reaction->reaction][] = $reaction->user_id;
        }

        $html = '<div class="message-reactions" style="display:flex; gap:3px; margin-top:4px; flex-wrap:wrap;">';
        foreach ($grouped as $emoji => $users) {
            $count = count($users);
            $hasUserReacted = in_array(auth()->id(), $users);
            $html .= '
            <span class="reaction-badge ' . ($hasUserReacted ? 'active' : '') . '" 
                  data-message-id="' . $reactions->first()->message_id . '" 
                  data-reaction="' . $emoji . '"
                  style="display:inline-flex; align-items:center; gap:2px; padding:2px 8px; background:' . ($hasUserReacted ? '#e8f5e9' : '#f1f2f6') . '; border-radius:12px; font-size:13px; cursor:pointer; border:' . ($hasUserReacted ? '1px solid #4caf50' : '1px solid transparent') . '; transition:all 0.2s;">
                ' . $emoji . ' ' . $count . '
            </span>
        ';
        }
        $html .= '</div>';

        return $html;
    }

    // Helper function for date display
    function formatDateDisplay($date)
    {
        $now = now();
        $diff = $now->diffInDays($date);

        if ($diff == 0) {
            return 'Today';
        } elseif ($diff == 1) {
            return 'Yesterday';
        } elseif ($diff < 7) {
            return $date->format('l'); // Monday, Tuesday, etc.
        } else {
            return $date->format('F j, Y'); // January 15, 2024
        }
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:chat_groups,id',
            'message' => 'nullable|string',
            'attachment' => 'nullable|file|max:10240' // Max 10MB
        ]);

        $attachment = null;
        $attachment_type = null;

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachment = $file->store('group_attachments', 'public');
            $attachment_type = $file->getMimeType();
        }


        // 🔥 Make sure at least one of message or attachment is provided
        if (!$request->message && !$attachment) {
            return response()->json([
                'error' => 'Please provide a message or an attachment'
            ], 422);
        }

        $message = ChatGroupMessage::create([
            'group_id' => $request->group_id,
            'sender_id' => Auth::id(),
            'message' => $request->message,
            'attachment' => $attachment,
            'attachment_type' => $attachment_type,
        ]);

        $message->load('sender');

        broadcast(new GroupMessageSent($message))->toOthers();

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    public function users(Request $request)
    {
        $search = $request->search;

        $users = User::where('id', '!=', Auth::id())
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");  
            })
            ->select('id', 'name', 'email', 'avatar')
            ->limit(10)
            ->get();

        return response()->json($users);
    }

    // ============================================
    // GROUP MEMBERS METHODS
    // ============================================

    /**
     * Get group members
     */
    public function getMembers(ChatGroup $group)
    {
        // Verify user is a member
        if (!$group->members()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $members = $group->members()
            ->with('user')
            ->get()
            ->map(function ($member) use ($group) {
                return [
                    'id' => $member->user_id,
                    'name' => $member->user->name,
                    'avatar' => $member->user->avatar ?? null,
                    'email' => $member->user->email,
                    'is_admin' => (bool) $member->is_admin,
                    'is_creator' => $member->user_id == $group->created_by,
                ];
            });

        return response()->json([
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'image' => $group->image,
                'created_by' => $group->created_by,
            ],
            'members' => $members,
            'is_admin' => $group->members()
                ->where('user_id', auth()->id())
                ->where('is_admin', true)
                ->exists(),
            'is_creator' => $group->created_by == auth()->id(),
        ]);
    }

    /**
     * Add member to group
     */
    public function addMember(Request $request, ChatGroup $group)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Verify user is admin or creator
        $isAdmin = $group->members()
            ->where('user_id', auth()->id())
            ->where('is_admin', true)
            ->exists();

        $isCreator = $group->created_by == auth()->id();

        if (!$isAdmin && !$isCreator) {
            return response()->json(['error' => 'Unauthorized - Admin only'], 403);
        }

        // Check if user is already a member
        if ($group->members()->where('user_id', $request->user_id)->exists()) {
            return response()->json(['error' => 'User is already a member'], 422);
        }

        // Add member
        ChatGroupMember::create([
            'group_id' => $group->id,
            'user_id' => $request->user_id,
            'is_admin' => false,
        ]);

        $user = User::find($request->user_id);

        return response()->json([
            'success' => true,
            'message' => 'Member added successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar ?? null,
                'email' => $user->email,
                'is_admin' => false,
            ],
        ]);
    }

    /**
     * Remove member from group
     */
    public function removeMember(Request $request, ChatGroup $group)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Can't remove yourself (use leave group for that)
        if ($request->user_id == auth()->id()) {
            return response()->json(['error' => 'Use leave group to remove yourself'], 422);
        }

        // Can't remove the creator
        if ($group->created_by == $request->user_id) {
            return response()->json(['error' => 'Cannot remove group creator'], 422);
        }

        // Verify user is admin or creator
        $isCreator = $group->created_by == auth()->id();
        $isAdmin = $group->members()
            ->where('user_id', auth()->id())
            ->where('is_admin', true)
            ->exists();

        if (!$isAdmin && !$isCreator) {
            return response()->json(['error' => 'Unauthorized - Admin only'], 403);
        }

        // Remove member
        $group->members()->where('user_id', $request->user_id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Member removed successfully',
            'user_id' => $request->user_id,
        ]);
    }

    /**
     * Make user admin
     */
    public function makeAdmin(Request $request, ChatGroup $group)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Only creator can make admins
        if ($group->created_by != auth()->id()) {
            return response()->json(['error' => 'Only group creator can make admins'], 403);
        }

        // Can't make creator admin (already is)
        if ($group->created_by == $request->user_id) {
            return response()->json(['error' => 'Creator is already admin'], 422);
        }

        $member = $group->members()->where('user_id', $request->user_id)->first();
        if (!$member) {
            return response()->json(['error' => 'User is not a member'], 422);
        }

        $member->update(['is_admin' => true]);

        return response()->json([
            'success' => true,
            'message' => 'User is now an admin',
        ]);
    }

    /**
     * Leave group
     */
    public function leaveGroup(ChatGroup $group)
    {
        // Creator can't leave (must delete or transfer ownership)
        if ($group->created_by == auth()->id()) {
            return response()->json(['error' => 'Creator cannot leave. Delete the group or transfer ownership.'], 422);
        }

        $group->members()->where('user_id', auth()->id())->delete();

        return response()->json([
            'success' => true,
            'message' => 'You have left the group',
        ]);
    }

    /**
     * Update group name/image
     */
    public function updateGroup(Request $request, ChatGroup $group)
    {
        $request->validate([
            'name' => 'nullable|max:255',
            'image' => 'nullable|image|max:2048',
        ]);

        // Verify user is admin or creator
        $isAdmin = $group->members()
            ->where('user_id', auth()->id())
            ->where('is_admin', true)
            ->exists();

        if ($group->created_by != auth()->id() && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized - Admin only'], 403);
        }

        $data = [];

        if ($request->has('name')) {
            $data['name'] = $request->name;
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($group->image) {
                Storage::disk('public')->delete($group->image);
            }
            $data['image'] = $request->file('image')->store('groups', 'public');
        }

        $group->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Group updated successfully',
            'group' => $group,
        ]);
    }
}
