{{-- ---------------------- Image modal box ---------------------- --}}
<div id="imageModalBox" class="imageModal">
    <span class="imageModal-close">&times;</span>
    <img class="imageModal-content" id="imageModalBoxSrc">
</div>

{{-- ---------------------- Delete Modal ---------------------- --}}
<div class="app-modal" data-name="delete">
    <div class="app-modal-container">
        <div class="app-modal-card" data-name="delete" data-modal='0'>
            <div class="app-modal-header">Are you sure you want to delete this?</div>
            <div class="app-modal-body">You can not undo this action</div>
            <div class="app-modal-footer">
                <a href="javascript:void(0)" class="app-btn cancel">Cancel</a>
                <a href="javascript:void(0)" class="app-btn a-btn-danger delete">Delete</a>
            </div>
        </div>
    </div>
</div>
{{-- ---------------------- Alert Modal ---------------------- --}}
<div class="app-modal" data-name="alert">
    <div class="app-modal-container">
        <div class="app-modal-card" data-name="alert" data-modal='0'>
            <div class="app-modal-header"></div>
            <div class="app-modal-body"></div>
            <div class="app-modal-footer">
                <a href="javascript:void(0)" class="app-btn cancel">Cancel</a>
            </div>
        </div>
    </div>
</div>
{{-- ---------------------- Settings Modal ---------------------- --}}
<div class="app-modal" data-name="settings">
    <div class="app-modal-container">
        <div class="app-modal-card" data-name="settings" data-modal='0'>
            <form id="update-settings" action="{{ route('avatar.update') }}" enctype="multipart/form-data" method="POST">
                @csrf
                {{-- <div class="app-modal-header">Update your profile settings</div> --}}
                <div class="app-modal-body">
                    {{-- Update profile avatar --}}
                    <div class="avatar av-l upload-avatar-preview chatify-d-flex"
                        style="background-image: url('{{ Chatify::getUserWithAvatar(Auth::user())->avatar }}');"></div>
                    <p class="upload-avatar-details"></p>
                    <label class="app-btn a-btn-primary update" style="background-color:{{$messengerColor}}">
                        Upload New
                        <input class="upload-avatar chatify-d-none" accept="image/*" name="avatar" type="file" />
                    </label>
                    
                    {{-- Profile Settings Link --}}
                    <div style="text-align: center; margin-top: 10px;">
                        <a href="{{ route('profile.edit') }}" style="color: {{$messengerColor}}; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fas fa-user-cog"></i> Profile Settings
                        </a>
                    </div>
                    
                    {{-- Dark/Light Mode  --}}
                    <p class="divider"></p>
                    <p class="app-modal-header">Dark Mode <span class="
                        {{ Auth::user()->dark_mode > 0 ? 'fas' : 'far' }} fa-moon dark-mode-switch"
                            data-mode="{{ Auth::user()->dark_mode > 0 ? 1 : 0 }}"></span></p>
                    {{-- change messenger color  --}}
                    <p class="divider"></p>
                    {{-- <p class="app-modal-header">Change {{ config('chatify.name') }} Color</p> --}}
                    <div class="update-messengerColor">
                        @foreach (config('chatify.colors') as $color)
                        <span style="background-color: {{ $color}}" data-color="{{$color}}" class="color-btn"></span>
                        @if (($loop->index + 1) % 5 == 0)
                        <br />
                        @endif
                        @endforeach
                    </div>
                </div>
                <div class="app-modal-footer">
                    <a href="javascript:void(0)" class="app-btn cancel">Cancel</a>
                    <input type="submit" class="app-btn a-btn-success update" value="Save Changes" />
                </div>
            </form>
        </div>
    </div>
</div>

<div class="app-modal" data-name="create-group">
    <div class="app-modal-container">
        <div class="app-modal-card" data-name="create-group">

            <div class="app-modal-header">
                Create Group
            </div>

            <div class="app-modal-body">

                <input
                    type="text"
                    id="group_name"
                    class="group-input"
                    placeholder="Group Name">

                <br><br>

                <input
                    type="file"
                    id="group_image"
                    accept="image/*">

                <p class="divider"></p>
                <input
                    type="text"
                    id="group-user-search"
                    class="group-input"
                    placeholder="Search members">

                <div id="group-search-results" class="group-results"></div>

                <div id="selected-members" class="selected-members"></div>

                <div class="app-modal-footer">
                    <a href="javascript:void(0)"
                        class="app-btn cancel">
                        Cancel
                    </a>

                    <a href="javascript:void(0)"
                        id="save-group"
                        class="app-btn a-btn-success">
                        Create
                    </a>
                </div>

            </div>
        </div>
    </div>

    <style>
        /* ============================================
   GROUP CHAT STYLING - MATCHES CHATIFY
   ============================================ */

        /* Group items - exactly like chat items */
        .listOfGroups .messenger-list-item {
            cursor: pointer;
            border-bottom: 1px solid #e9ecef;
            padding: 10px 15px;
            transition: background-color 0.2s;
            background: #fff;
        }

        .listOfGroups .messenger-list-item:hover {
            background-color: #f8f9fa;
        }

        .listOfGroups .messenger-list-item.m-list-active {
            background-color: #e3f2fd;
        }

        .listOfGroups .messenger-list-item table {
            width: 100%;
        }

        .listOfGroups .messenger-list-item td {
            padding: 5px 0;
            vertical-align: middle;
        }

        /* Avatar styling */
        .listOfGroups .messenger-list-item .avatar {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
            position: relative;
            flex-shrink: 0;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Unread badge - matches Chatify style */
        .listOfGroups .contact-item-unread {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #ff4757;
            color: #fff;
            border-radius: 50%;
            padding: 2px 7px;
            font-size: 10px;
            font-weight: 600;
            min-width: 20px;
            height: 20px;
            text-align: center;
            line-height: 16px;
            border: 2px solid #fff;
            z-index: 1;
            box-shadow: 0 2px 4px rgba(255, 71, 87, 0.3);
        }

        /* Group name */
        .listOfGroups .messenger-list-item p {
            margin: 0;
            font-weight: 500;
            color: #2d3436;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
        }

        /* Time stamp */
        .listOfGroups .messenger-list-item p .contact-item-time {
            font-weight: 400;
            font-size: 11px;
            color: #b2bec3;
            margin-left: 8px;
            white-space: nowrap;
        }

        /* Last message preview */
        .listOfGroups .messenger-list-item span {
            font-size: 13px;
            color: #636e72;
            display: block;
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }

        /* Active state */
        .listOfGroups .messenger-list-item.m-list-active {
            background: #dfe6e9;
            border-left: 3px solid #0984e3;
        }

        .listOfGroups .messenger-list-item.m-list-active p {
            color: #0984e3;
        }

        .listOfGroups .messenger-list-item.m-list-active .contact-item-time {
            color: #0984e3 !important;
        }

        /* ============================================
   MODAL STYLING - KEEP EXISTING
   ============================================ */
        .app-modal[data-name="create-group"] .app-modal-card {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            width: 500px !important;
            max-width: 90% !important;
            background: white !important;
            position: relative !important;
            margin: 100px auto !important;
            z-index: 999999 !important;
            border-radius: 12px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
        }

        /* Modal header */
        .app-modal[data-name="create-group"] .app-modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid #e9ecef;
            font-size: 18px;
            font-weight: 600;
            color: #2d3436;
        }

        /* Modal body */
        .app-modal[data-name="create-group"] .app-modal-body {
            padding: 24px;
        }

        /* Modal footer */
        .app-modal[data-name="create-group"] .app-modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #e9ecef;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        /* Input fields */
        .group-input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #dfe6e9;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
            outline: none;
        }

        .group-input:focus {
            border-color: #0984e3;
            box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.1);
        }

        /* File input */
        #group_image {
            padding: 8px;
            border: 1px dashed #dfe6e9;
            border-radius: 8px;
            width: 100%;
        }

        /* Divider */
        .divider {
            border: none;
            border-top: 1px solid #e9ecef;
            margin: 20px 0;
        }

        /* Search results */
        .group-results {
            max-height: 250px;
            overflow-y: auto;
            border: 1px solid #dfe6e9;
            border-radius: 8px;
            margin-top: 10px;
            background: #fff;
        }

        .group-user-item {
            display: flex;
            align-items: center;
            padding: 10px 14px;
            cursor: pointer;
            border-bottom: 1px solid #f1f2f6;
            transition: background 0.2s;
        }

        .group-user-item:hover {
            background: #f8f9fa;
        }

        .group-user-item:last-child {
            border-bottom: none;
        }

        .group-user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .group-user-avatar img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }

        .group-user-details {
            flex: 1;
            min-width: 0;
        }

        .group-user-name {
            font-weight: 600;
            color: #2d3436;
            font-size: 14px;
        }

        .group-user-email {
            font-size: 12px;
            color: #b2bec3;
        }

        /* Selected members chips */
        .selected-members {
            margin-top: 15px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .member-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #dfe6e9;
            color: #2d3436;
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 13px;
            font-weight: 500;
        }

        .member-remove {
            cursor: pointer;
            color: #ff4757;
            font-weight: 700;
            font-size: 16px;
            line-height: 1;
            margin-left: 2px;
        }

        .member-remove:hover {
            color: #ff6b81;
        }

        /* No results */
        .group-no-results {
            padding: 20px;
            text-align: center;
            color: #b2bec3;
            font-size: 14px;
        }

        /* Buttons in modal */
        .app-btn {
            padding: 8px 20px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-block;
        }

        .app-btn.cancel {
            background: #f1f2f6;
            color: #2d3436;
        }

        .app-btn.cancel:hover {
            background: #dfe6e9;
        }

        .a-btn-success {
            background: #00b894;
            color: #fff;
        }

        .a-btn-success:hover {
            background: #00a381;
        }

        /* ============================================
   DATE DIVIDER
============================================ */
        .date-divider {
            text-align: center;
            padding: 15px 0;
            position: relative;
        }

        .date-divider::before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 1px;
            background: #e9ecef;
        }

        .date-divider span {
            background: #f8f9fa;
            padding: 4px 16px;
            border-radius: 12px;
            font-size: 12px;
            color: #636e72;
            font-weight: 500;
            position: relative;
            z-index: 1;
            display: inline-block;
        }

        /* Dark mode */
        .dark-mode .date-divider::before {
            background: #636e72;
        }

        .dark-mode .date-divider span {
            background: #2d3436;
            color: #b2bec3;
        }

        /* ============================================
   MESSAGE TIME
============================================ */
        .message-time {
            font-size: 10px;
            font-weight: 400;
            color: #b2bec3;
            flex-shrink: 0;
        }

        /* Message user with time */
        .message-card .message-user {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            color: #636e72 !important;
            margin-bottom: 2px !important;
        }

        /* Sender specific */
        .message-card.mc-sender .message-user span:first-child {
            color: #00b894;
        }

        /* Receiver specific */
        .message-card.mc-receiver .message-user span:first-child {
            color: #0984e3;
        }

        /* ============================================
   FORCE IMAGE DISPLAY IN GROUP CHAT
============================================ */
        .message-card .chat-image {
            display: inline-block !important;
            width: 200px !important;
            height: 200px !important;
            min-width: 100px !important;
            min-height: 100px !important;
            max-width: 200px !important;
            max-height: 200px !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            border-radius: 8px !important;
            margin-top: 5px !important;
            cursor: pointer !important;
            border: 1px solid #e9ecef !important;
            flex-shrink: 0 !important;
        }

        /* Make sure the message container shows images */
        .message-card .message {
            overflow: visible !important;
        }

        /* For sender messages */
        .message-card.mc-sender .chat-image {
            border: 1px solid #c8e6c9 !important;
            background-color: #f0faf0 !important;
        }

        /* For receiver messages */
        .message-card.mc-receiver .chat-image {
            border: 1px solid #e9ecef !important;
            background-color: #f8f9fa !important;
        }

        /* Fallback - ensure images display */
        .message-card .message-text+.chat-image,
        .message-card .chat-image {
            display: inline-block !important;
        }

        /* Reaction picker - Teams style */
        #reaction-picker .reaction-btn:hover {
            background: #f0f0f0 !important;
            transform: scale(1.15) !important;
            border-radius: 4px !important;
        }

        /* Dark mode */
        .dark-mode #reaction-picker {
            background: #2d3436 !important;
            border-color: #636e72 !important;
        }

        .dark-mode #reaction-picker .reaction-btn:hover {
            background: #1a1a2e !important;
        }

        /* ============================================
   UNREAD BADGE FOR GROUPS
============================================ */
        .group-item .contact-item-unread {
            position: absolute !important;
            top: -5px !important;
            right: -5px !important;
            background: #ff4757 !important;
            color: #fff !important;
            border-radius: 50% !important;
            padding: 2px 6px !important;
            font-size: 10px !important;
            font-weight: 600 !important;
            min-width: 18px !important;
            height: 18px !important;
            text-align: center !important;
            line-height: 14px !important;
            border: 2px solid #fff !important;
            z-index: 999 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* Make sure the avatar has position: relative */
        .group-item .avatar {
            position: relative !important;
        }

        /* Fix the time display - "NaNw ago" */
        .contact-item-time {
            font-size: 11px !important;
            color: #b2bec3 !important;
        }

        /* ============================================
   REACTION TOOLTIP
============================================ */
#reaction-tooltip {
    animation: fadeInUp 0.15s ease;
    pointer-events: auto;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

#reaction-tooltip #reaction-tooltip-users {
    scrollbar-width: thin;
    scrollbar-color: #dfe6e9 transparent;
}

#reaction-tooltip #reaction-tooltip-users::-webkit-scrollbar {
    width: 4px;
}

#reaction-tooltip #reaction-tooltip-users::-webkit-scrollbar-track {
    background: transparent;
}

#reaction-tooltip #reaction-tooltip-users::-webkit-scrollbar-thumb {
    background: #dfe6e9;
    border-radius: 10px;
}

/* Dark mode */
.dark-mode #reaction-tooltip {
    background: #2d3436;
    border-color: #636e72;
}

.dark-mode #reaction-tooltip #reaction-tooltip-users {
    color: #fff;
}

.dark-mode #reaction-tooltip #reaction-tooltip-emoji {
    color: #fff;
}

.dark-mode #reaction-tooltip #reaction-tooltip-count {
    color: #b2bec3;
}
    </style>