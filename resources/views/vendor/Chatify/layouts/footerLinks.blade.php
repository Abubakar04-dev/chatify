<script src="https://js.pusher.com/7.2.0/pusher.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@3.0.3/dist/index.min.js"></script>
<script>
    // Gloabl Chatify variables from PHP to JS
    window.chatify = {
    name: "{{ config('chatify.name') }}",
    sounds: {!! json_encode(config('chatify.sounds')) !!},
    allowedImages: {!! json_encode(config('chatify.attachments.allowed_images')) !!},
    allowedFiles: {!! json_encode(config('chatify.attachments.allowed_files')) !!},
    maxUploadSize: {{ Chatify::getMaxUploadSize() }},
    pusher: {!! json_encode(config('chatify.pusher')) !!},
    pusherAuthEndpoint: '{{ route("pusher.auth") }}'
};
    window.chatify.allAllowedExtensions = chatify.allowedImages.concat(chatify.allowedFiles);
</script>
<script src="{{ asset('js/chatify/utils.js') }}"></script>
<script src="{{ asset('js/chatify/code.js') }}"></script>
<!-- 
<<script>
$(function () {
    let selectedMembers = [];
    window.groupChannel = null;
    window.isGroupChat = false;
    window.currentGroupId = null;

    // ---------------- OPEN MODAL ----------------
    $(document).on("click", "#create-group-btn", function (e) {
        e.preventDefault();
        let modal = $('.app-modal[data-name="create-group"]');
        modal.fadeIn(200);
        modal.find(".app-modal-card").css({
            display: "block",
            opacity: "1",
            visibility: "visible",
            transform: "none"
        });
    });

    // ---------------- CLOSE MODAL ----------------
    $(document).on("click", '.app-modal[data-name="create-group"] .cancel', function () {
        $('.app-modal[data-name="create-group"]').fadeOut(200);
    });

    // ---------------- SEARCH USERS ----------------
    $(document).on('keyup', '#group-user-search', function () {
        let search = $(this).val().trim();
        if (search.length < 2) {
            $('#group-search-results').html('');
            return;
        }
        $.get('/groups/users', { search }, function (users) {
            let html = '';
            if (!users.length) {
                html = `<div class="group-no-results">No users found</div>`;
            }
            users.forEach(user => {
                let avatar = user.avatar ? user.avatar : '/storage/users-avatar/avatar.png';
                html += `
                    <div class="group-user-item" data-id="${user.id}" data-name="${user.name}">
                        <div class="group-user-avatar">
                            <img src="${avatar}">
                        </div>
                        <div class="group-user-details">
                            <div class="group-user-name">${user.name}</div>
                            <div class="group-user-email">${user.email ?? ''}</div>
                        </div>
                    </div>
                `;
            });
            $('#group-search-results').html(html);
        });
    });

    // ---------------- SELECT USER ----------------
    $(document).on('click', '.group-user-item', function () {
        let id = $(this).data('id');
        let name = $(this).data('name');
        if (selectedMembers.includes(id)) return;
        selectedMembers.push(id);
        $('#selected-members').append(`
            <span class="member-chip" data-id="${id}">
                ${name}
                <span class="member-remove">×</span>
            </span>
        `);
        $('#group-user-search').val('');
        $('#group-search-results').html('');
    });

    // ---------------- REMOVE USER ----------------
    $(document).on('click', '.member-remove', function () {
        let chip = $(this).closest('.member-chip');
        let id = chip.data('id');
        selectedMembers = selectedMembers.filter(x => x != id);
        chip.remove();
    });

    // ---------------- CREATE GROUP ----------------
    $(document).on('click', '#save-group', function () {
        let groupName = $('#group_name').val().trim();
        if (!groupName) return alert('Enter group name');
        if (selectedMembers.length === 0) return alert('Select members');
        let formData = new FormData();
        formData.append('name', groupName);
        let image = $('#group_image')[0].files[0];
        if (image) formData.append('image', image);
        selectedMembers.forEach(id => {
            formData.append('members[]', id);
        });
        formData.append('_token', $('meta[name="csrf-token"]').attr('content'));
        $.ajax({
            url: '/groups/store',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                loadGroups();
                selectedMembers = [];
                $('#group_name').val('');
                $('#group_image').val('');
                $('#selected-members').html('');
                $('.app-modal[data-name="create-group"]').fadeOut(200);
            }
        });
    });

    // ---------------- LOAD GROUPS ----------------
    function loadGroups() {
        $.get('/groups/list', function (groups) {
            console.log('Groups loaded:', groups);
            
            let html = '';
            
            if (!groups || groups.length === 0) {
                html = '<div style="padding: 20px; text-align: center; color: #999; font-size: 14px;">No groups yet</div>';
                $('.listOfGroups').html(html);
                return;
            }
            
            groups.forEach(group => {
                let image = group.image ? '/storage/' + group.image : '/images/group-default.png';
                let lastMessage = group.last_message || 'No messages yet';
                let unreadCount = group.unread_count || 0;
                
                if (lastMessage.length > 35) {
                    lastMessage = lastMessage.substring(0, 35) + '...';
                }
                
                let timeDisplay = '';
                if (group.last_message_time) {
                    const past = new Date(group.last_message_time);
                    const now = new Date();
                    const diff = Math.floor((now - past) / 1000);
                    
                    if (diff < 60) timeDisplay = 'Just now';
                    else if (diff < 3600) timeDisplay = Math.floor(diff / 60) + 'm';
                    else if (diff < 86400) timeDisplay = Math.floor(diff / 3600) + 'h';
                    else if (diff < 604800) timeDisplay = Math.floor(diff / 86400) + 'd';
                    else timeDisplay = past.toLocaleDateString();
                }
                
                html += `
                    <div class="messenger-list-item group-item" data-contact="${group.id}" data-group-id="${group.id}">
                        <table width="100%">
                            <tr>
                                <td style="position: relative; width: 60px;">
                                    <div class="avatar av-m" style="background-image: url('${image}');">
                                        ${unreadCount > 0 ? `<span class="contact-item-unread">${unreadCount}</span>` : ''}
                                    </div>
                                </td>
                                <td>
                                    <p data-id="${group.id}" data-type="group">
                                        ${group.name}
                                        <span class="contact-item-time">${timeDisplay}</span>
                                    </p>
                                    <span>${lastMessage}</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                `;
            });
            
            $('.listOfGroups').html(html);
        }).fail(function(error) {
            console.error('Error loading groups:', error);
            $('.listOfGroups').html('<div style="padding: 20px; text-align: center; color: red;">Error loading groups</div>');
        });
    }
    loadGroups();

    // ---------------- CLICK GROUP ----------------
    $(document).on('click', '.group-item', function () {
        let groupId = $(this).data('group-id');
        if (!groupId) return;
        
        console.log('🔄 Switching to group:', groupId);
        
        // Remove message hint
        $('.messages').find('.message-hint').hide();
        
        // Mark messages as read
        $.ajax({
            url: '/groups/mark-as-read',
            type: 'POST',
            data: {
                _token: csrfToken,
                group_id: groupId
            },
            success: function() {
                console.log('✅ Messages marked as read');
                $('.group-item[data-group-id="' + groupId + '"] .contact-item-unread').remove();
            }
        });
        
        // Set state
        window.currentGroupId = groupId;
        window.isGroupChat = true;
        
        // Load messages with cache
        if (typeof loadGroupMessagesWithCache === 'function') {
            loadGroupMessagesWithCache(groupId);
        } else {
            loadGroupMessages(groupId);
        }
        
        // Subscribe to channel
        if (window.groupChannel) {
            window.groupChannel.unsubscribe();
            window.groupChannel = null;
        }
        window.groupChannel = pusher.subscribe('group.' + groupId);
        window.groupChannel.bind('pusher:subscription_succeeded', function() {
            console.log('✅ Subscribed to group.' + groupId);
        });
    });

    // ---------------- LOAD MESSAGES (fallback) ----------------
    function loadGroupMessages(groupId) {
        if (!groupId) return;
        
        console.log('📥 Loading messages for group:', groupId);
        
        $.get('/groups/' + groupId + '/messages', function (response) {
            $('.messages').html(response.messages_html);
            $('.user-name').text(response.group.name);
            $('.messages').find('.message-hint').hide();
            
            if (response.group.image) {
                $('.header-avatar').css('background-image', 'url(/storage/' + response.group.image + ')');
            }
            
            window.currentGroupId = groupId;
            window.isGroupChat = true;
            
            setTimeout(function() {
                scrollToBottom(messagesContainer);
            }, 100);
        }).fail(function() {
            console.error('❌ Failed to load group messages');
        });
    }

    // ---------------- SEND GROUP MESSAGE ----------------
    window.sendGroupMessage = function () {
        let text = $.trim(messageInput.val());
        if (!text || !window.currentGroupId) {
            console.log('⏭️ No message or group selected');
            return;
        }
        
        console.log('📤 Sending group message to group:', window.currentGroupId);
        
        // Show optimistic message
        $('.messages').append(`
            <div class="message-card mc-sender">
                <div class="message">
                    <div class="message-user">You</div>
                    <div class="message-text">${text}</div>
                </div>
            </div>
        `);
        messageInput.val('');
        scrollToBottom(messagesContainer);

        $.ajax({
            url: '/groups/send-message',
            type: 'POST',
            data: {
                _token: csrfToken,
                group_id: window.currentGroupId,
                message: text
            },
            success: function (response) {
                console.log('✅ Group message sent:', response);
            },
            error: function(xhr) {
                console.error('❌ Failed to send group message:', xhr);
                $('.messages .mc-sender:last').remove();
                alert('Failed to send message. Please try again.');
            }
        });
    };

    // Check for active group on page load
    let activeGroup = $('.group-item.active');
    if (activeGroup.length) {
        let groupId = activeGroup.data('group-id');
        if (groupId) {
            activeGroup.click();
        }
    }
});
</script> -->

<!-- <script>
$(function () {
    let selectedMembers = [];
    window.groupChannel = null;
    
    // Initialize group state
    window.groupState = {
        isGroupChat: false,
        currentGroupId: null,
        activeTab: 'private'
    };

    // ============================================
    // GROUP TYPING INDICATOR
    // ============================================
    function sendGroupTyping(status) {
        if (!window.groupState || !window.groupState.currentGroupId) return;
        if (window.groupChannel) {
            window.groupChannel.trigger('client-typing', {
                from_id: auth_id,
                group_id: window.groupState.currentGroupId,
                typing: status,
                from_name: $('.user-name').text() || 'Someone'
            });
        }
    }

    // Override typing for groups
    var originalIsTyping = window.isTyping;
    window.isTyping = function(status) {
        if (window.groupState && window.groupState.isGroupChat && window.groupState.currentGroupId) {
            return sendGroupTyping(status);
        }
        if (typeof originalIsTyping === 'function') {
            return originalIsTyping(status);
        }
        return false;
    };

    // Listen for group typing events
    if (typeof pusher !== 'undefined') {
        pusher.bind('client-typing', function(data) {
            // Check if this is a group typing event
            if (data.group_id && data.from_id != auth_id) {
                if (window.groupState && window.groupState.isGroupChat && 
                    window.groupState.currentGroupId == data.group_id) {
                    
                    let senderName = data.from_name || 'Someone';
                    
                    if (data.typing) {
                        if ($('.typing-indicator').length) {
                            $('.typing-indicator').html(`<span>${senderName} is typing...</span>`).show();
                        } else {
                            $('.messages').append(`<div class="typing-indicator"><span>${senderName} is typing...</span></div>`);
                        }
                    } else {
                        $('.typing-indicator').hide();
                    }
                    scrollToBottom(messagesContainer);
                }
            }
        });
    }

    // ============================================
    // PREVENT PRIVATE CHAT MESSAGES FROM LOADING IN GROUPS
    // ============================================
    var originalFetchMessages = window.fetchMessages;
    
    window.fetchMessages = function(id, newFetch = false) {
        if (window.isGroupChat || (window.groupState && window.groupState.isGroupChat)) {
            console.log('⏭️ Skipping fetchMessages - Currently in group chat');
            return;
        }
        if (typeof originalFetchMessages === 'function') {
            return originalFetchMessages(id, newFetch);
        }
    };
    
    var originalIDinfo = window.IDinfo;
    
    window.IDinfo = function(id) {
        if (window.isGroupChat || (window.groupState && window.groupState.isGroupChat)) {
            console.log('⏭️ Skipping IDinfo - Currently in group chat');
            return;
        }
        if (typeof originalIDinfo === 'function') {
            return originalIDinfo(id);
        }
    };

    // ============================================
    // OVERRIDE: Private chat click handler
    // ============================================
    $(document).off('click', '.messenger-list-item');
    
    $(document).on('click', '.messenger-list-item:not(.group-item)', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔄 Switching to private chat');
        
        // Clear group state
        window.groupState.isGroupChat = false;
        window.groupState.currentGroupId = null;
        window.groupState.activeTab = 'private';
        window.isGroupChat = false;
        window.currentGroupId = null;
        
        // Unsubscribe from group channel
        if (window.groupChannel) {
            window.groupChannel.unsubscribe();
            window.groupChannel = null;
        }
        
        // Enable message input
        enableMessageInput();
        
        // Get user ID
        const userId = $(this).find('p[data-id]').attr('data-id') || $(this).attr('data-contact');
        if (userId) {
            setMessengerId(userId);
            if (typeof originalIDinfo === 'function') {
                originalIDinfo(userId);
            }
        }
    });

    // ============================================
    // ENABLE MESSAGE INPUT
    // ============================================
    function enableMessageInput() {
        console.log('🔓 Enabling message input');
        $('.messenger-sendCard').show();
        messageInput.removeAttr('readonly');
        $('#message-form button').removeAttr('disabled');
        $('.upload-attachment').removeAttr('disabled');
        messagesContainer.css('opacity', '1');
        setTimeout(function() {
            messageInput.focus();
        }, 300);
    }

    // ============================================
    // OPEN MODAL
    // ============================================
    $(document).on("click", "#create-group-btn", function (e) {
        e.preventDefault();
        let modal = $('.app-modal[data-name="create-group"]');
        modal.fadeIn(200);
        modal.find(".app-modal-card").css({
            display: "block",
            opacity: "1",
            visibility: "visible",
            transform: "none"
        });
    });

    // ============================================
    // CLOSE MODAL
    // ============================================
    $(document).on("click", '.app-modal[data-name="create-group"] .cancel', function () {
        $('.app-modal[data-name="create-group"]').fadeOut(200);
    });

    // ============================================
    // SEARCH USERS
    // ============================================
    $(document).on('keyup', '#group-user-search', function () {
        let search = $(this).val().trim();
        if (search.length < 2) {
            $('#group-search-results').html('');
            return;
        }
        $.get('/groups/users', { search }, function (users) {
            let html = '';
            if (!users.length) {
                html = `<div class="group-no-results">No users found</div>`;
            }
            users.forEach(user => {
                let avatar = user.avatar ? user.avatar : '/storage/users-avatar/avatar.png';
                html += `
                    <div class="group-user-item" data-id="${user.id}" data-name="${user.name}">
                        <div class="group-user-avatar">
                            <img src="${avatar}">
                        </div>
                        <div class="group-user-details">
                            <div class="group-user-name">${user.name}</div>
                            <div class="group-user-email">${user.email ?? ''}</div>
                        </div>
                    </div>
                `;
            });
            $('#group-search-results').html(html);
        });
    });

    // ============================================
    // SELECT USER
    // ============================================
    $(document).on('click', '.group-user-item', function () {
        let id = $(this).data('id');
        let name = $(this).data('name');
        if (selectedMembers.includes(id)) return;
        selectedMembers.push(id);
        $('#selected-members').append(`
            <span class="member-chip" data-id="${id}">
                ${name}
                <span class="member-remove">×</span>
            </span>
        `);
        $('#group-user-search').val('');
        $('#group-search-results').html('');
    });

    // ============================================
    // REMOVE USER
    // ============================================
    $(document).on('click', '.member-remove', function () {
        let chip = $(this).closest('.member-chip');
        let id = chip.data('id');
        selectedMembers = selectedMembers.filter(x => x != id);
        chip.remove();
    });

    // ============================================
    // CREATE GROUP
    // ============================================
    $(document).on('click', '#save-group', function () {
        let groupName = $('#group_name').val().trim();
        if (!groupName) return alert('Enter group name');
        if (selectedMembers.length === 0) return alert('Select members');
        let formData = new FormData();
        formData.append('name', groupName);
        let image = $('#group_image')[0].files[0];
        if (image) formData.append('image', image);
        selectedMembers.forEach(id => {
            formData.append('members[]', id);
        });
        formData.append('_token', $('meta[name="csrf-token"]').attr('content'));
        $.ajax({
            url: '/groups/store',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                loadGroups();
                selectedMembers = [];
                $('#group_name').val('');
                $('#group_image').val('');
                $('#selected-members').html('');
                $('.app-modal[data-name="create-group"]').fadeOut(200);
            }
        });
    });

    // ============================================
    // LOAD GROUPS
    // ============================================
    function loadGroups() {
        $.get('/groups/list', function (groups) {
            console.log('Groups loaded:', groups);
            
            let html = '';
            
            if (!groups || groups.length === 0) {
                html = '<div style="padding: 20px; text-align: center; color: #999; font-size: 14px;">No groups yet</div>';
                $('.listOfGroups').html(html);
                return;
            }
            
            groups.forEach(group => {
                let image = group.image ? '/storage/' + group.image : '/images/group-default.png';
                let lastMessage = group.last_message || 'No messages yet';
                let unreadCount = group.unread_count || 0;
                
                if (lastMessage.length > 35) {
                    lastMessage = lastMessage.substring(0, 35) + '...';
                }
                
                let timeDisplay = '';
                if (group.last_message_time) {
                    const past = new Date(group.last_message_time);
                    const now = new Date();
                    const diff = Math.floor((now - past) / 1000);
                    
                    if (diff < 60) timeDisplay = 'Just now';
                    else if (diff < 3600) timeDisplay = Math.floor(diff / 60) + 'm';
                    else if (diff < 86400) timeDisplay = Math.floor(diff / 3600) + 'h';
                    else if (diff < 604800) timeDisplay = Math.floor(diff / 86400) + 'd';
                    else timeDisplay = past.toLocaleDateString();
                }
                
                html += `
                    <div class="messenger-list-item group-item" data-contact="${group.id}" data-group-id="${group.id}">
                        <table width="100%">
                            <tr>
                                <td style="position: relative; width: 60px;">
                                    <div class="avatar av-m" style="background-image: url('${image}');">
                                        ${unreadCount > 0 ? `<span class="contact-item-unread">${unreadCount}</span>` : ''}
                                    </div>
                                </td>
                                <td>
                                    <p data-id="${group.id}" data-type="group">
                                        ${group.name}
                                        <span class="contact-item-time">${timeDisplay}</span>
                                    </p>
                                    <span>${lastMessage}</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                `;
            });
            
            $('.listOfGroups').html(html);
        }).fail(function(error) {
            console.error('Error loading groups:', error);
            $('.listOfGroups').html('<div style="padding: 20px; text-align: center; color: red;">Error loading groups</div>');
        });
    }
    loadGroups();

    // ============================================
    // CLICK GROUP - WITH MESSAGE INPUT ENABLED
    // ============================================
    $(document).on('click', '.group-item', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        let groupId = $(this).data('group-id');
        if (!groupId) return;
        
        console.log('🔄 Switching to GROUP:', groupId);
        
        // Remove active class from all items
        $('.messenger-list-item').removeClass('m-list-active');
        $(this).addClass('m-list-active');
        
        // Set state
        window.groupState.isGroupChat = true;
        window.groupState.currentGroupId = groupId;
        window.groupState.activeTab = 'group';
        window.isGroupChat = true;
        window.currentGroupId = groupId;
        
        // ENABLE MESSAGE INPUT
        enableMessageInput();
        
        // Mark messages as read
        $.ajax({
            url: '/groups/mark-as-read',
            type: 'POST',
            data: {
                _token: csrfToken,
                group_id: groupId
            },
            success: function() {
                console.log('✅ Messages marked as read');
                $('.group-item[data-group-id="' + groupId + '"] .contact-item-unread').remove();
            }
        });
        
        // Load messages
        loadGroupMessages(groupId);
        
        // Subscribe to channel
        if (window.groupChannel) {
            window.groupChannel.unsubscribe();
            window.groupChannel = null;
        }
        window.groupChannel = pusher.subscribe('group.' + groupId);
        window.groupChannel.bind('pusher:subscription_succeeded', function() {
            console.log('✅ Subscribed to group.' + groupId);
        });
    });

    // ============================================
    // LOAD GROUP MESSAGES
    // ============================================
    function loadGroupMessages(groupId) {
        if (!groupId) return;
        
        console.log('📥 Loading messages for group:', groupId);
        
        // Show loading
        $('.messages').html('<div style="text-align:center;padding:40px;color:#999;">Loading messages...</div>');
        
        $.get('/groups/' + groupId + '/messages', function (response) {
            console.log('✅ Messages loaded for group:', groupId);
            
            // Clear messages container and set new HTML
            $('.messages').empty();
            $('.messages').html(response.messages_html);
            
            // Update header
            if (response.group) {
                $('.user-name').text(response.group.name);
            }
            
            // Hide message hint if it exists
            $('.messages').find('.message-hint').hide();
            
            // Update avatar
            if (response.group && response.group.image) {
                $('.header-avatar').css('background-image', 'url(/storage/' + response.group.image + ')');
            } else {
                $('.header-avatar').css('background-image', 'url(/images/group-default.png)');
            }
            
            console.log('📨 Messages rendered:', $('.messages .message-card').length);
            
            // Scroll to bottom
            setTimeout(function() {
                scrollToBottom(messagesContainer);
            }, 200);
            
        }).fail(function(xhr) {
            console.error('❌ Failed to load group messages:', xhr);
            $('.messages').html('<div style="text-align:center;padding:40px;color:red;">Failed to load messages</div>');
        });
    }

    // ============================================
    // SEND GROUP MESSAGE
    // ============================================
    window.sendGroupMessage = function () {
        let text = $.trim(messageInput.val());
        let currentGroupId = window.currentGroupId || (window.groupState && window.groupState.currentGroupId);
        
        if (!text || !currentGroupId) {
            console.log('⏭️ No message or group selected');
            return false;
        }
        
        console.log('📤 Sending group message to group:', currentGroupId);
        
        // Show optimistic message
        $('.messages').append(`
            <div class="message-card mc-sender">
                <div class="message">
                    <div class="message-user">You</div>
                    <div class="message-text">${text}</div>
                </div>
            </div>
        `);
        messageInput.val('');
        scrollToBottom(messagesContainer);

        $.ajax({
            url: '/groups/send-message',
            type: 'POST',
            data: {
                _token: csrfToken,
                group_id: currentGroupId,
                message: text
            },
            success: function (response) {
                console.log('✅ Group message sent:', response);
            },
            error: function(xhr) {
                console.error('❌ Failed to send group message:', xhr);
                $('.messages .mc-sender:last').remove();
                alert('Failed to send message. Please try again.');
            }
        });
        
        return false;
    };

    // ============================================
    // OVERRIDE SEND MESSAGE
    // ============================================
    var originalSendMessage = window.sendMessage;
    
    window.sendMessage = function() {
        var isGroup = window.isGroupChat || (window.groupState && window.groupState.isGroupChat);
        var currentGroupId = window.currentGroupId || (window.groupState && window.groupState.currentGroupId);
        
        if (isGroup && currentGroupId) {
            return window.sendGroupMessage();
        }
        
        if (typeof originalSendMessage === 'function') {
            return originalSendMessage();
        }
        
        return false;
    };

    // ============================================
    // CHECK FOR ACTIVE GROUP ON PAGE LOAD
    // ============================================
    setTimeout(function() {
        let activeGroup = $('.group-item.active');
        if (activeGroup.length) {
            let groupId = activeGroup.data('group-id');
            if (groupId) {
                console.log('🔄 Auto-loading active group:', groupId);
                activeGroup.click();
            }
        }
    }, 1000);
    
    console.log('✅ Group chat system initialized!');
});
</script> -->