<!-- {{-- user info and avatar --}}
<div class="avatar av-l chatify-d-flex"></div>
<p class="info-name">{{ config('chatify.name') }}</p>
<div class="messenger-infoView-btns">
    <a href="#" class="danger delete-conversation">Delete Conversation</a>
</div>
{{-- shared photos --}}
<div class="messenger-infoView-shared">
    <p class="messenger-title"><span>Shared Photos</span></p>
    <div class="shared-photos-list"></div>
</div> -->

{{-- ============================================
    PRIVATE CHAT INFO (Default)
============================================ --}}
<div id="private-chat-info">
    <div class="avatar av-l chatify-d-flex" style="margin: 0 auto;"></div>
    <p class="info-name" style="text-align: center;">{{ config('chatify.name') }}</p>
    <div class="messenger-infoView-btns" style="text-align: center;">
        <a href="#" class="danger delete-conversation">Delete Conversation</a>
    </div>
    <div class="messenger-infoView-shared">
        <p class="messenger-title"><span>Shared Photos</span></p>
        <div class="shared-photos-list"></div>
    </div>
</div>
{{-- ============================================
    GROUP CHAT INFO
============================================ --}}
<div id="group-chat-info" style="display:none;">
    <div class="group-avatar-large" id="group-info-avatar" style="width:65px; height:65px; border-radius:50%; background-size:cover; background-position:center; margin:0 auto 10px; border:3px solid #e9ecef; background-image:url('/images/group-default.png');"></div>
    <p class="info-name" id="group-info-name" style="text-align:center; font-weight:600; font-size:14px; margin-bottom:2px;">Group Name</p>
    <p id="group-info-member-count" style="text-align:center; color:#b2bec3; font-size:11px; margin-bottom:12px;">0 members</p>

    <div style="display:flex; justify-content:center; gap:6px; padding:0 15px;">
        <button class="group-action-btn show-group-members" title="View Members" style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:#e8f5e9; color:#2e7d32; border:1px solid #c8e6c9; cursor:pointer; font-size:14px;">
            <i class="fas fa-users"></i>
        </button>

        <div id="group-admin-actions" style="display:none; display:flex; gap:6px;">
            <button class="group-action-btn btn-add-member-action" title="Add Member" style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:#e3f2fd; color:#1565c0; border:1px solid #bbdefb; cursor:pointer; font-size:14px;">
                <i class="fas fa-user-plus"></i>
            </button>
            <button class="group-action-btn btn-edit-group-action" title="Edit Group" style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:#fff3e0; color:#e65100; border:1px solid #ffe0b2; cursor:pointer; font-size:14px;">
                <i class="fas fa-edit"></i>
            </button>
        </div>

        <button class="group-action-btn leave-group-btn" title="Leave Group" style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:#fce4ec; color:#c62828; border:1px solid #f8bbd0; cursor:pointer; font-size:14px;">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    </div>

    <div style="display:flex; justify-content:center; gap:6px; margin-top:4px; padding:0 15px;">
        <span style="font-size:9px; color:#b2bec3; text-align:center; width:36px;">Members</span>
        <div id="admin-action-labels" style="display:none; display:flex; gap:6px;">
            <span style="font-size:9px; color:#b2bec3; text-align:center; width:36px;">Add</span>
            <span style="font-size:9px; color:#b2bec3; text-align:center; width:36px;">Edit</span>
        </div>
        <span style="font-size:9px; color:#b2bec3; text-align:center; width:36px;">Leave</span>
    </div>
</div>

{{-- ============================================
    GROUP MEMBERS SIDEBAR
============================================ --}}
<div id="group-members-sidebar-container" style="display:none; position:fixed; right:0; top:0; width:360px; height:100%; background:#fff; border-left:1px solid #e9ecef; z-index:9999; overflow-y:auto; box-shadow:-2px 0 15px rgba(0,0,0,0.1);">
    <nav style="padding:12px 18px; border-bottom:1px solid #e9ecef; display:flex; align-items:center; gap:10px; background:#fafafa; position:sticky; top:0; z-index:10;">
        <button class="close-group-members-btn" style="color:#636e72; font-size:16px; cursor:pointer; background:none; border:none;">
            <i class="fas fa-times"></i>
        </button>
        <span style="font-size:14px; font-weight:600; color:#2d3436;">Group Members</span>
        <span id="sidebar-member-count-badge" style="margin-left:auto; background:#dfe6e9; color:#2d3436; padding:1px 8px; border-radius:10px; font-size:11px; font-weight:500;">0</span>
    </nav>
    <div class="group-members-content">
        <div class="group-info-header" style="display:flex; align-items:center; padding:12px 18px; border-bottom:1px solid #f1f2f6;">
            <div id="sidebar-group-avatar" style="width:40px; height:40px; border-radius:50%; background-size:cover; background-position:center; margin-right:12px; flex-shrink:0; background-image:url('/images/group-default.png');"></div>
            <div>
                <h3 id="sidebar-group-name" style="margin:0; font-size:14px; font-weight:600; color:#2d3436;">Group Name</h3>
                <p id="sidebar-group-member-count" style="margin:1px 0 0; color:#b2bec3; font-size:11px;">0 members</p>
            </div>
        </div>
        <div id="group-members-list" style="padding:5px 0;"></div>
    </div>
</div>

{{-- ============================================
    ADD MEMBER MODAL
============================================ --}}
<div id="add-member-modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10001; align-items:center; justify-content:center;">
    <div style="width:400px; max-width:90%; margin:0 auto; background:#fff; border-radius:10px; box-shadow:0 15px 40px rgba(0,0,0,0.2);">
        <div style="padding:14px 18px; border-bottom:1px solid #e9ecef; font-size:15px; font-weight:600; color:#2d3436;">Add Member</div>
        <div style="padding:18px;">
            <input type="text" id="add-member-search" placeholder="Search users..." style="width:100%; padding:8px 12px; border:1px solid #dfe6e9; border-radius:6px; font-size:13px; outline:none;">
            <div id="add-member-results" style="max-height:200px; overflow-y:auto; border:1px solid #dfe6e9; border-radius:6px; margin-top:8px;"></div>
            <div id="selected-member-info" style="display:none; margin-top:8px; padding:8px 12px; background:#f8f9fa; border-radius:6px; align-items:center; justify-content:space-between;">
                <span id="selected-member-name" style="font-weight:500; font-size:13px;"></span>
                <button id="confirm-add-member" style="padding:4px 12px; border:none; border-radius:4px; cursor:pointer; background:#00b894; color:#fff; font-size:12px;">Add</button>
            </div>
        </div>
        <div style="padding:10px 18px; border-top:1px solid #e9ecef; display:flex; justify-content:flex-end;">
            <button class="close-add-member-modal" style="padding:5px 14px; background:#f1f2f6; color:#2d3436; border-radius:4px; border:none; font-size:12px; cursor:pointer;">Cancel</button>
        </div>
    </div>
</div>

{{-- ============================================
    EDIT GROUP MODAL
============================================ --}}
<div id="edit-group-modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10001; align-items:center; justify-content:center;">
    <div style="width:400px; max-width:90%; margin:0 auto; background:#fff; border-radius:10px; box-shadow:0 15px 40px rgba(0,0,0,0.2);">
        <div style="padding:14px 18px; border-bottom:1px solid #e9ecef; font-size:15px; font-weight:600; color:#2d3436;">Edit Group</div>
        <div style="padding:18px;">
            <input type="text" id="edit-group-name-input" placeholder="Group Name" style="width:100%; padding:8px 12px; border:1px solid #dfe6e9; border-radius:6px; font-size:13px; outline:none;">
            <br><br>
            <input type="file" id="edit-group-image-input" accept="image/*" style="width:100%; font-size:12px;">
        </div>
        <div style="padding:10px 18px; border-top:1px solid #e9ecef; display:flex; justify-content:flex-end; gap:6px;">
            <button class="close-edit-group-modal" style="padding:5px 14px; background:#f1f2f6; color:#2d3436; border-radius:4px; border:none; font-size:12px; cursor:pointer;">Cancel</button>
            <button id="confirm-edit-group" style="padding:5px 14px; background:#00b894; color:#fff; border-radius:4px; border:none; font-size:12px; cursor:pointer;">Save</button>
        </div>
    </div>
</div>

<style>
    #group-chat-info .group-action-btn {
        transition: all 0.2s ease;
    }

    #group-chat-info .group-action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
    }

    #group-members-sidebar-container {
        animation: slideInRight 0.25s ease;
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
        }

        to {
            transform: translateX(0);
        }
    }

    .member-item {
        display: flex;
        align-items: center;
        padding: 7px 14px;
        border-bottom: 1px solid #f1f2f6;
    }

    .member-item .member-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-size: cover;
        background-position: center;
        margin-right: 10px;
        flex-shrink: 0;
    }

    .member-item .member-info {
        flex: 1;
    }

    .member-item .member-name {
        font-weight: 500;
        color: #2d3436;
        font-size: 12px;
    }

    .member-item .member-badge {
        font-size: 8px;
        padding: 1px 6px;
        border-radius: 8px;
        font-weight: 600;
    }

    .member-item .member-badge.creator {
        background: #fdcb6e;
        color: #2d3436;
    }

    .member-item .member-badge.admin {
        background: #0984e3;
        color: #fff;
    }

    .member-item .member-badge.you {
        background: #00b894;
        color: #fff;
    }

    .member-item .member-email {
        font-size: 10px;
        color: #b2bec3;
    }

    .member-item .member-actions {
        display: flex;
        gap: 3px;
    }

    .member-item .member-action-btn {
        padding: 2px 8px;
        font-size: 9px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }

    .member-item .member-action-btn.remove {
        background: #ff4757;
        color: #fff;
    }

    .member-item .member-action-btn.make-admin {
        background: #0984e3;
        color: #fff;
    }

    #add-member-results .group-user-item {
        display: flex;
        align-items: center;
        padding: 7px 12px;
        cursor: pointer;
        border-bottom: 1px solid #f1f2f6;
    }

    #add-member-results .group-user-item:hover {
        background: #f8f9fa;
    }

    #add-member-results .group-user-avatar img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
    }

    #add-member-results .group-user-details {
        flex: 1;
        margin-left: 10px;
    }

    #add-member-results .group-user-name {
        font-weight: 500;
        font-size: 12px;
    }

    #add-member-results .group-user-email {
        font-size: 10px;
        color: #b2bec3;
    }
</style>