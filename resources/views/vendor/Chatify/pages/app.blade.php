@include('Chatify::layouts.headLinks')
<div class="messenger">
    {{-- ----------------------Users/Groups lists side---------------------- --}}
    <div class="messenger-listView {{ !!$id ? 'conversation-active' : '' }}">
        {{-- Header and search bar --}}
        <div class="m-header">
            <nav>
                <a href="#"><i class="fas fa-inbox"></i> <span class="messenger-headTitle">MESSAGES</span> </a>
                {{-- header buttons --}}
                <nav class="m-header-right">
                    <a href="#" id="create-group-btn" title="Create Group">
                        <i class="fas fa-users"></i>
                    </a>
                    <a href="#"><i class="fas fa-cog settings-btn"></i></a>
                    <a href="#" class="listView-x"><i class="fas fa-times"></i></a>
                </nav>
            </nav>
            {{-- Search input --}}
            <input type="text" class="messenger-search" placeholder="Search" />
            {{-- Tabs --}}
            {{-- <div class="messenger-listView-tabs">
                <a href="#" class="active-tab" data-view="users">
                    <span class="far fa-user"></span> Contacts</a>
            </div> --}}
        </div>
        {{-- tabs and lists --}}
        <div class="m-body contacts-container">
            {{-- Lists [Users/Group] --}}
            {{-- ---------------- [ User Tab ] ---------------- --}}
            <div class="show messenger-tab users-tab app-scroll" data-view="users">
                {{-- Favorites --}}
                <div class="favorites-section">
                    <p class="messenger-title"><span>Favorites</span></p>
                    <div class="messenger-favorites app-scroll-hidden"></div>
                </div>
                {{-- Saved Messages --}}
                <p class="messenger-title"><span>Your Space</span></p>
                {!! view('Chatify::layouts.listItem', ['get' => 'saved']) !!}
                <!-- groups  -->
                <p class="messenger-title"><span>Groups</span></p>
                <div class="listOfGroups"></div>
                {{-- Contact --}}
                <p class="messenger-title"><span>All Messages</span></p>
                <div class="listOfContacts" style="width: 100%;height: calc(100% - 272px);position: relative;"></div>
            </div>
            {{-- ---------------- [ Search Tab ] ---------------- --}}
            <div class="messenger-tab search-tab app-scroll" data-view="search">
                {{-- items --}}
                <p class="messenger-title"><span>Search</span></p>
                <div class="search-records">
                    <p class="message-hint center-el"><span>Type to search..</span></p>
                </div>
            </div>
        </div>
    </div>

    {{-- ----------------------Messaging side---------------------- --}}
    <div class="messenger-messagingView">
        {{-- header title [conversation name] amd buttons --}}
        <div class="m-header m-header-messaging">
            <nav class="chatify-d-flex chatify-justify-content-between chatify-align-items-center">
                {{-- header back button, avatar and user name --}}
                <div class="chatify-d-flex chatify-justify-content-between chatify-align-items-center">
                    <a href="#" class="show-listView"><i class="fas fa-arrow-left"></i></a>
                    <div class="avatar av-s header-avatar" style="margin: 0px 10px; margin-top: -5px; margin-bottom: -5px;">
                    </div>
                    <a href="#" class="user-name">{{ config('chatify.name') }}</a>
                </div>
                {{-- header buttons --}}
                <nav class="m-header-right">
                    <a href="#" class="add-to-favorite"><i class="fas fa-star"></i></a>
                    <a href="/"><i class="fas fa-home"></i></a>
                    <a href="#" class="show-infoSide"><i class="fas fa-info-circle"></i></a>
                    {{-- ✅ ADD BELL ICON HERE --}}
                    <a href="#" id="notification-bell" title="Notification Settings" style="position:relative;">
                        <i class="fas fa-bell"></i>
                        <span id="notification-status-dot" style="position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;border:2px solid #fff;display:inline-block;"></span>
                    </a>
                </nav>

            </nav>
            {{-- Internet connection --}}
            <div class="internet-connection">
                <span class="ic-connected">Connected</span>
                <span class="ic-connecting">Connecting...</span>
                <span class="ic-noInternet">No internet access</span>
            </div>
        </div>

        {{-- Messaging area --}}
        <div class="m-body messages-container app-scroll">
            <div class="messages">
                <p class="message-hint center-el"><span>Please select a chat to start messaging</span></p>
            </div>
            {{-- Typing indicator --}}
            <div class="typing-indicator">
                <div class="message-card typing">
                    <div class="message">
                        <span class="typing-dots">
                            <span class="dot dot-1"></span>
                            <span class="dot dot-2"></span>
                            <span class="dot dot-3"></span>
                        </span>
                    </div>
                </div>
            </div>

        </div>
        {{-- Send Message Form --}}
        @include('Chatify::layouts.sendForm')
    </div>
    {{-- ---------------------- Info side ---------------------- --}}
    <div class="messenger-infoView app-scroll">
        {{-- nav actions --}}
        <nav>
            <p>User Details</p>
            <a href="#"><i class="fas fa-times"></i></a>
        </nav>
        {!! view('Chatify::layouts.info')->render() !!}
    </div>
</div>
<!-- ============================================
    REACTION PICKER - TEAMS STYLE
============================================ -->
<div id="reaction-picker" style="display:none; position:fixed; background:#fff; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,0.12); padding:4px 6px; z-index:999999; border:1px solid #e9ecef;">
    <div style="display:flex; gap:2px;">
        <button class="reaction-btn" data-reaction="👍" style="font-size:18px; border:none; background:transparent; cursor:pointer; padding:2px 5px; border-radius:4px; transition:all 0.15s; line-height:1;">👍</button>
        <button class="reaction-btn" data-reaction="❤️" style="font-size:18px; border:none; background:transparent; cursor:pointer; padding:2px 5px; border-radius:4px; transition:all 0.15s; line-height:1;">❤️</button>
        <button class="reaction-btn" data-reaction="😂" style="font-size:18px; border:none; background:transparent; cursor:pointer; padding:2px 5px; border-radius:4px; transition:all 0.15s; line-height:1;">😂</button>
        <button class="reaction-btn" data-reaction="😮" style="font-size:18px; border:none; background:transparent; cursor:pointer; padding:2px 5px; border-radius:4px; transition:all 0.15s; line-height:1;">😮</button>
        <button class="reaction-btn" data-reaction="😢" style="font-size:18px; border:none; background:transparent; cursor:pointer; padding:2px 5px; border-radius:4px; transition:all 0.15s; line-height:1;">😢</button>
        <button class="reaction-btn" data-reaction="😡" style="font-size:18px; border:none; background:transparent; cursor:pointer; padding:2px 5px; border-radius:4px; transition:all 0.15s; line-height:1;">😡</button>
    </div>
</div>
<!-- ============================================
    REACTION TOOLTIP
============================================ -->
<div id="reaction-tooltip" style="display:none; position:fixed; background:#fff; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.15); padding:8px 12px; z-index:999999; border:1px solid #e9ecef; max-width:250px; min-width:120px;">
    <div style="font-size:12px; color:#636e72; margin-bottom:4px; font-weight:500;">
        <span id="reaction-tooltip-emoji"></span>
        <span id="reaction-tooltip-count"></span>
    </div>
    <div id="reaction-tooltip-users" style="font-size:13px; color:#2d3436; max-height:100px; overflow-y:auto;">
        <!-- User names will be inserted here -->
    </div>
</div>



@include('Chatify::layouts.modals')
@include('Chatify::layouts.footerLinks')