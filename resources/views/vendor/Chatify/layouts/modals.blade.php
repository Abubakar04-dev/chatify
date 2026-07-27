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
            <form id="update-settings" action="{{ route('avatar.update') }}" enctype="multipart/form-data"
                method="POST">
                @csrf
                {{-- <div class="app-modal-header">Update your profile settings</div> --}}
                <div class="app-modal-body">
                    {{-- Update profile avatar --}}
                    <div class="avatar av-l upload-avatar-preview chatify-d-flex"
                        style="background-image: url('{{ Chatify::getUserWithAvatar(Auth::user())->avatar }}');"></div>
                    <p class="upload-avatar-details"></p>
                    <label class="app-btn a-btn-primary update" style="background-color:{{ $messengerColor }}">
                        Upload New
                        <input class="upload-avatar chatify-d-none" accept="image/*" name="avatar" type="file" />
                    </label>

                    {{-- Profile Settings Link --}}
                    <div style="text-align: center; margin-top: 10px;">
                        <a href="{{ route('profile.edit') }}"
                            style="color: {{ $messengerColor }}; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                            <i class="fas fa-user-cog"></i> Profile Settings
                        </a>

                        {{-- ✅ BELL ICON - Notification Settings --}}
                        <div
                            style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e9ecef;">
                            <a href="#" id="notification-bell-modal"
                                style="color: {{ $messengerColor }}; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;">
                                <i class="fas fa-bell" style="font-size: 16px;"></i>
                                Notification Settings
                                <span id="notification-status-dot-modal"
                                    style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#fdcb6e;margin-left:5px;"></span>
                            </a>
                        </div>
                    </div>

                    {{-- Dark/Light Mode  --}}
                    <p class="divider"></p>
                    <p class="app-modal-header">Dark Mode <span
                            class="
                        {{ Auth::user()->dark_mode > 0 ? 'fas' : 'far' }} fa-moon dark-mode-switch"
                            data-mode="{{ Auth::user()->dark_mode > 0 ? 1 : 0 }}"></span></p>
                    {{-- change messenger color  --}}
                    <p class="divider"></p>
                    {{-- <p class="app-modal-header">Change {{ config('chatify.name') }} Color</p> --}}
                    <div class="update-messengerColor">
                        @foreach (config('chatify.colors') as $color)
                            <span style="background-color: {{ $color }}" data-color="{{ $color }}"
                                class="color-btn"></span>
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

                <input type="text" id="group_name" class="group-input" placeholder="Group Name">

                <br><br>

                {{-- 🔥 ADD GROUP TYPE DROPDOWN --}}
                <select id="group_type" class="group-input"
                    style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; margin-bottom:10px;">
                    <option value="private">Private Group</option>
                    @if (auth()->user()->isSuperAdmin() || auth()->user()->isAdmin() || auth()->user()->isManager())
                        <option value="public">Public Group (All Users)</option>
                    @endif
                </select>

                <br>

                <input type="file" id="group_image" accept="image/*">

                <p class="divider"></p>

                {{-- 🔥 MEMBER SEARCH - HIDDEN FOR PUBLIC GROUPS --}}
                <div id="member-selection-area">
                    <input type="text" id="group-user-search" class="group-input" placeholder="Search members">

                    <div id="group-search-results" class="group-results"></div>

                    <div id="selected-members" class="selected-members"></div>
                </div>

                {{-- 🔥 INFO MESSAGE FOR PUBLIC GROUPS --}}
                <div id="public-group-info"
                    style="display:none; padding:10px; background:#e8f5e9; border-radius:6px; margin-top:10px; color:#2e7d32; font-size:13px;">
                    <i class="fas fa-info-circle"></i> All users will be automatically added to this public group.
                </div>

                <div class="app-modal-footer">
                    <a href="javascript:void(0)" class="app-btn cancel">
                        Cancel
                    </a>

                    <a href="javascript:void(0)" id="save-group" class="app-btn a-btn-success">
                        Create
                    </a>
                </div>

            </div>
        </div>
    </div>
</div>
<style>
    /* ============================================
   GROUP CHAT STYLING - MATCHES CHATIFY
   ============================================ */

    /* ============================================
   GROUP ITEMS - SIDEBAR STYLING
   ============================================ */

    /* Group items container */
    .listOfGroups {
        padding: 0;
        margin: 0;
    }

    /* Individual group item - matches Chatify style */
    .listOfGroups .messenger-list-item {
        cursor: pointer;
        border-bottom: 1px solid #f1f2f6;
        padding: 12px 16px;
        transition: all 0.2s ease;
        background: #fff;
        position: relative;
    }

    .listOfGroups .messenger-list-item:hover {
        background-color: #f8f9fa;
    }

    .listOfGroups .messenger-list-item.m-list-active {
        background: #e8f0fe;
        border-left: 3px solid #667eea;
    }

    .listOfGroups .messenger-list-item:last-child {
        border-bottom: none;
    }

    /* Table layout */
    .listOfGroups .messenger-list-item table {
        width: 100%;
        border-collapse: collapse;
    }

    .listOfGroups .messenger-list-item td {
        padding: 4px 0;
        vertical-align: middle;
    }

    /* ============================================
   AVATAR STYLING
   ============================================ */

    .listOfGroups .messenger-list-item .avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-size: cover;
        background-position: center;
        position: relative;
        flex-shrink: 0;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: border-color 0.3s ease;
    }

    .listOfGroups .messenger-list-item:hover .avatar {
        border-color: #e9ecef;
    }

    .listOfGroups .messenger-list-item.m-list-active .avatar {
        border-color: #667eea;
    }

    /* Pinned banner - expanded state */
#pinned-message-banner {
    transition: all 0.3s ease;
    cursor: pointer;
}

#pinned-message-banner:hover {
    background: #dce6f5;
}

#pinned-message-banner.expanded {
    background: #dce6f5;
    padding: 10px 16px;
}

#pinned-message-banner .fa-chevron-right,
#pinned-message-banner .fa-chevron-down {
    transition: transform 0.3s ease;
}

/* Pinned message preview */
#pinned-message-preview {
    transition: all 0.3s ease;
}

#pinned-message-banner.expanded #pinned-message-preview {
    white-space: normal !important;
    word-wrap: break-word;
    max-height: 200px;
    overflow-y: auto;
}

    /* ============================================
   UNREAD BADGE - MATCHES CHATIFY STYLE
   ============================================ */

    /* .listOfGroups .contact-item-unread {
        position: absolute;
        top: -6px;
        right: -6px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        color: #fff;
        border-radius: 50%;
        padding: 2px 7px;
        font-size: 10px;
        font-weight: 700;
        min-width: 20px;
        height: 20px;
        text-align: center;
        line-height: 16px;
        border: 2px solid #fff;
        z-index: 2;
        box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
        animation: badgePop 0.3s ease;
    } */

    /* Badge pop animation */
    @keyframes badgePop {
        0% {
            transform: scale(0);
            opacity: 0;
        }

        60% {
            transform: scale(1.2);
        }

        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    /* Badge pulse when new message arrives */
    @keyframes badgePulse {

        0%,
        100% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.1);
        }
    }

    .listOfGroups .contact-item-unread.pulse {
        animation: badgePulse 0.5s ease 2;
    }

    /* ============================================
   GROUP NAME & CONTENT
   ============================================ */

    .listOfGroups .messenger-list-item p {
        margin: 0;
        font-weight: 600;
        color: #2d3436;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        line-height: 1.3;
    }

    .listOfGroups .messenger-list-item p .contact-item-time {
        font-weight: 400;
        font-size: 11px;
        color: #b2bec3;
        margin-left: 8px;
        white-space: nowrap;
    }

    /* Last message preview */
    .listOfGroups .messenger-list-item td:last-child>span {
        font-size: 13px;
        color: #636e72;
        display: block;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 180px;
        padding-right: 5px;
    }

    /* ============================================
   ACTIVE STATE
   ============================================ */

    .listOfGroups .messenger-list-item.m-list-active {
        background: #e8f0fe;
        border-left: 3px solid #667eea;
    }

    .listOfGroups .messenger-list-item.m-list-active p {
        color: #2d3436;
    }

    .listOfGroups .messenger-list-item.m-list-active p .contact-item-time {
        color: #667eea !important;
    }

    .listOfGroups .messenger-list-item.m-list-active td:last-child>span {
        color: #2d3436;
    }

    /* ============================================
   FIRST MESSAGE HINT (Empty state)
   ============================================ */

    .listOfGroups .message-hint {
        text-align: center;
        padding: 40px 20px;
        color: #b2bec3;
        font-size: 14px;
    }

    .listOfGroups .message-hint span {
        color: #636e72;
    }

    /* ============================================
   RESPONSIVE ADJUSTMENTS
   ============================================ */

    @media (max-width: 768px) {
        .listOfGroups .messenger-list-item {
            padding: 10px 12px;
        }

        .listOfGroups .messenger-list-item .avatar {
            width: 40px;
            height: 40px;
        }

        .listOfGroups .messenger-list-item td:last-child>span {
            max-width: 120px;
        }
    }

    @media (max-width: 480px) {
        .listOfGroups .messenger-list-item .avatar {
            width: 36px;
            height: 36px;
        }

        .listOfGroups .messenger-list-item p {
            font-size: 13px;
        }

        .listOfGroups .messenger-list-item td:last-child>span {
            max-width: 80px;
            font-size: 12px;
        }

        .listOfGroups .contact-item-unread {
            min-width: 18px;
            height: 18px;
            font-size: 9px;
            line-height: 14px;
            padding: 1px 5px;
            top: -4px;
            right: -4px;
        }
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
   UNREAD BADGE FOR GROUPS - TEAMS STYLE (Right Side)
   ============================================ */

    /* Container for avatar + badge */
    .group-item td:first-child {
        position: relative !important;
        width: 55px !important;
        vertical-align: middle !important;
    }

    .group-item .avatar {
        width: 42px !important;
        height: 42px !important;
        border-radius: 50% !important;
        background-size: cover !important;
        background-position: center !important;
        flex-shrink: 0 !important;
        border: 2px solid #fff !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
    }

    /* 🔥 BADGE - ON THE RIGHT SIDE (LIKE TEAMS) */
    .group-item .contact-item-unread {
        position: absolute !important;
        left: 261px !important;
        top: 83% !important;
        transform: translateY(-50%) !important;
        background: linear-gradient(135deg, #ff6b6b, #ee5a24) !important;
        color: #fff !important;
        border-radius: 50% !important;
        /* 🔥 This makes it perfectly round */
        padding: 0px 0px !important;
        /* 🔥 Remove padding, use min-width & height */
        font-size: 11px !important;
        font-weight: 700 !important;
        min-width: 20px !important;
        /* 🔥 Minimum size for 1-2 digits */
        height: 20px !important;
        /* 🔥 Same as min-width for perfect circle */
        text-align: center !important;
        line-height: 20px !important;
        /* 🔥 Match height for vertical centering */
        border: 2px solid #fff !important;
        z-index: 10 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 2px 10px rgba(255, 71, 87, 0.3) !important;
        animation: badgeAppear 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
    }

    /* Badge appear animation */
    @keyframes badgeAppear {
        0% {
            transform: translateY(-50%) scale(0) rotate(-20deg);
            opacity: 0;
        }

        60% {
            transform: translateY(-50%) scale(1.3) rotate(5deg);
        }

        100% {
            transform: translateY(-50%) scale(1) rotate(0deg);
            opacity: 1;
        }
    }

    /* Badge pulse when new message arrives */
    @keyframes badgePulse {

        0%,
        100% {
            transform: translateY(-50%) scale(1);
        }

        50% {
            transform: translateY(-50%) scale(1.15);
            box-shadow: 0 2px 15px rgba(255, 71, 87, 0.5);
        }
    }

    .group-item .contact-item-unread.pulse {
        animation: badgePulse 0.5s ease 2 !important;
    }

    /* ============================================
   GROUP ITEM LAYOUT
   ============================================ */

    .group-item table {
        width: 100% !important;
        border-collapse: collapse !important;
    }

    .group-item table td {
        padding: 4px 0 !important;
        vertical-align: middle !important;
    }

    /* Second td should have position relative for badge */
    .group-item table td:last-child {
        position: relative !important;
        padding-right: 35px !important;
        /* Space for badge */
    }

    /* ============================================
   TIME DISPLAY - FIX "NaNw ago"
   ============================================ */

    .contact-item-time {
        font-size: 11px !important;
        color: #b2bec3 !important;
        font-weight: 400 !important;
        white-space: nowrap !important;
    }

    .contact-item-time:empty {
        display: none !important;
    }

    /* ============================================
   RESPONSIVE ADJUSTMENTS
   ============================================ */

    @media (max-width: 480px) {
        .group-item .avatar {
            width: 36px !important;
            height: 36px !important;
        }

        .group-item td:first-child {
            width: 45px !important;
        }

        .group-item table td:last-child {
            padding-right: 30px !important;
        }

        .group-item .contact-item-unread {
            min-width: 18px !important;
            height: 18px !important;
            font-size: 9px !important;
            line-height: 14px !important;
            padding: 1px 5px !important;
            right: -5px !important;
            border-width: 2px !important;
        }
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



    .mention-text {
        color: #ea6666;
        font-weight: 600;
    }
</style>
