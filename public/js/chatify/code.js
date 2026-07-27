/**
 *-------------------------------------------------------------
 * Global variables
 *-------------------------------------------------------------
 */
var messenger,
  typingTimeout,
  typingNow = 0,
  temporaryMsgId = 0,
  defaultAvatarInSettings = null,
  messengerColor,
  dark_mode,
  messages_page = 1,
  mentionTimeout,
  currentMentionQuery = '';

const messagesContainer = $(".messenger-messagingView .m-body"),
  messengerTitleDefault = $(".messenger-headTitle").text(),
  messageInputContainer = $(".messenger-sendCard"),
  messageInput = $("#message-form .m-send"),
  auth_id = $("meta[name=url]").attr("data-user"),
  url = $("meta[name=url]").attr("content"),
  messengerTheme = $("meta[name=messenger-theme]").attr("content"),
  defaultMessengerColor = $("meta[name=messenger-color]").attr("content"),
  csrfToken = $('meta[name="csrf-token"]').attr("content");

const getMessengerId = () => $("meta[name=id]").attr("content");
const setMessengerId = (id) => $("meta[name=id]").attr("content", id);


// ✅ ADD THIS - To prevent duplicate message processing
const processedMessageIds = new Set();
const processedPrivateNotifications = new Set();


/**
 *-------------------------------------------------------------
 * Pusher initialization
 *-------------------------------------------------------------
 */
Pusher.logToConsole = chatify.pusher.debug;
const pusher = new Pusher(chatify.pusher.key, {
  encrypted: chatify.pusher.options.encrypted,
  cluster: chatify.pusher.options.cluster,
  wsHost: chatify.pusher.options.host,
  wsPort: chatify.pusher.options.port,
  wssPort: chatify.pusher.options.port,
  forceTLS: chatify.pusher.options.useTLS,
  authEndpoint: chatify.pusherAuthEndpoint,
  auth: {
    headers: {
      "X-CSRF-TOKEN": csrfToken,
    },
  },
});

// ============================================
if (typeof pusher !== 'undefined') {
  pusher.bind_global(function (eventName, data) {
    console.log('🌐 ALL EVENTS:', eventName, data);
  });
}
/**
 *-------------------------------------------------------------
 * Notification Functions - ORDER MATTERS!
 *-------------------------------------------------------------
 */

// ============================================
// 1. FIRST: Bell Status Function (called by others)
// ============================================
function updateNotificationBell() {
  if (!("Notification" in window)) {
    $('#notification-status-dot').css('background', '#b2bec3');
    return;
  }

  const dot = $('#notification-status-dot');

  if (Notification.permission === "granted") {
    dot.css('background', '#00b894');
    $('#notification-bell i').css('color', '#00b894');
  } else if (Notification.permission === "denied") {
    dot.css('background', '#ff6b6b');
    $('#notification-bell i').css('color', '#ff6b6b');
  } else {
    dot.css('background', '#fdcb6e');
    $('#notification-bell i').css('color', '#fdcb6e');
  }
}

// ============================================
// 2. SECOND: Helper Functions
// ============================================
function showNotificationMessage(message) {
  let msgHtml = `
    <div id="notification-msg" style="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2d3436;color:white;padding:12px 24px;border-radius:8px;z-index:999999;font-size:14px;box-shadow:0 4px 15px rgba(0,0,0,0.2);animation:slideUp 0.3s ease;">
      ${message}
    </div>
  `;
  $('body').append(msgHtml);
  setTimeout(function () {
    $('#notification-msg').fadeOut(300, function () { $(this).remove(); });
  }, 3000);
}

function dismissAlert() {
  $('#notification-alert').remove();
}

// ============================================
// 3. THIRD: Alert Display Function
// ============================================
function showPermissionAlert() {
  let alertHtml = `
    <div id="notification-alert" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#ffffff;border-radius:12px;padding:20px 25px;box-shadow:0 10px 40px rgba(0,0,0,0.2);z-index:999999;max-width:450px;width:90%;border-left:4px solid #0984e3;animation:slideUp 0.3s ease;">
      <div style="display:flex;align-items:center;gap:15px;">
        <div style="flex-shrink:0;">
          <img src="/at-law-logo.webp" alt="Logo" style="width:45px;height:45px;border-radius:50%;">
        </div>
        <div style="flex:1;">
          <h4 style="margin:0 0 5px 0;color:#2d3436;font-size:15px;font-weight:600;">Enable Notifications</h4>
          <p style="margin:0;color:#636e72;font-size:13px;">Get notified when you receive new messages</p>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0;">
          <button onclick="allowNotifications()" style="padding:8px 18px;background:#0984e3;color:white;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;">
            Allow
          </button>
          <button onclick="dismissAlert()" style="padding:8px 14px;background:#f1f2f6;color:#2d3436;border:none;border-radius:6px;font-size:13px;cursor:pointer;">
            ✕
          </button>
        </div>
      </div>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(30px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    </style>
  `;

  $('#notification-alert').remove();
  $('body').append(alertHtml);
}

// ============================================
// 4. FOURTH: Permission Request Function
// ============================================
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    console.log("✅ Notifications already enabled");
    updateNotificationBell();
    return;
  }

  if (Notification.permission === "denied") {
    console.log("❌ Notifications denied");
    updateNotificationBell();
    return;
  }

  if (Notification.permission === "default") {
    showPermissionAlert();
  }
}

// ============================================
// 5. FIFTH: Allow Function (called from alert)
// ============================================
function allowNotifications() {
  $('#notification-alert').remove();
  Notification.requestPermission().then(function (permission) {
    if (permission === "granted") {
      showNotificationMessage("✅ Notifications enabled!");
      updateNotificationBell();
    } else {
      showNotificationMessage("❌ Notifications denied");
      updateNotificationBell();
    }
  });
}

// ============================================
// 6. SIXTH: Bell Dropdown Functions
// ============================================
function requestNotificationFromBell() {
  $('#notification-dropdown').remove();
  showPermissionAlert();
}

function disableNotifications() {
  $('#notification-dropdown').remove();
  alert('To disable notifications, please go to your browser settings and block notifications for this site.');
}
/**
 *-------------------------------------------------------------
 * Re-usable methods
 *-------------------------------------------------------------
 */
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};
function actionOnScroll(selector, callback, topScroll = false) {
  $(selector).on("scroll", function () {
    let element = $(this).get(0);
    const condition = topScroll
      ? element.scrollTop == 0
      : element.scrollTop + element.clientHeight >= element.scrollHeight;
    if (condition) {
      callback();
    }
  });
}
function routerPush(title, url) {
  $("meta[name=url]").attr("content", url);
  return window.history.pushState({}, title || document.title, url);
}
function updateSelectedContact(user_id) {
  $(document).find(".messenger-list-item").removeClass("m-list-active");
  $(document)
    .find(
      ".messenger-list-item[data-contact=" + (user_id || getMessengerId()) + "]"
    )
    .addClass("m-list-active");
}
/**
 *-------------------------------------------------------------
 * Global Templates
 *-------------------------------------------------------------
 */
// Loading svg
function loadingSVG(size = "25px", className = "", style = "") {
  return `
<svg style="${style}" class="loadingSVG ${className}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40" stroke="#ffffff">
<g fill="none" fill-rule="evenodd">
<g transform="translate(2 2)" stroke-width="3">
<circle stroke-opacity=".1" cx="18" cy="18" r="18"></circle>
<path d="M36 18c0-9.94-8.06-18-18-18" transform="rotate(349.311 18 18)">
<animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur=".8s" repeatCount="indefinite"></animateTransform>
</path>
</g>
</g>
</svg>
`;
}
function loadingWithContainer(className) {
  return `<div class="${className}" style="text-align:center;padding:15px">${loadingSVG(
    "25px",
    "",
    "margin:auto"
  )}</div>`;
}

// loading placeholder for users list item
function listItemLoading(items) {
  let template = "";
  for (let i = 0; i < items; i++) {
    template += `
<div class="loadingPlaceholder">
<div class="loadingPlaceholder-wrapper">
<div class="loadingPlaceholder-body">
<table class="loadingPlaceholder-header">
<tr>
<td style="width: 45px;"><div class="loadingPlaceholder-avatar"></div></td>
<td>
<div class="loadingPlaceholder-name"></div>
<div class="loadingPlaceholder-date"></div>
</td>
</tr>
</table>
</div>
</div>
</div>
`;
  }
  return template;
}

// loading placeholder for avatars
function avatarLoading(items) {
  let template = "";
  for (let i = 0; i < items; i++) {
    template += `
<div class="loadingPlaceholder">
<div class="loadingPlaceholder-wrapper">
<div class="loadingPlaceholder-body">
<table class="loadingPlaceholder-header">
<tr>
<td style="width: 45px;">
<div class="loadingPlaceholder-avatar" style="margin: 2px;"></div>
</td>
</tr>
</table>
</div>
</div>
</div>
`;
  }
  return template;
}

// While sending a message, show this temporary message card.
function sendTempMessageCard(message, id) {
  return `
 <div class="message-card mc-sender" data-id="${id}">
     <div class="message-card-content">
         <div class="message">
             ${message}
             <sub>
                 <span class="far fa-clock"></span>
             </sub>
         </div>
     </div>
 </div>
`;
}
// upload image preview card.
function attachmentTemplate(fileType, fileName, imgURL = null) {
  if (fileType != "image") {
    return (
      `
 <div class="attachment-preview">
     <span class="fas fa-times cancel"></span>
     <p style="padding:0px 30px;"><span class="fas fa-file"></span> ` +
      escapeHtml(fileName) +
      `</p>
 </div>
`
    );
  } else {
    return (
      `
<div class="attachment-preview">
 <span class="fas fa-times cancel"></span>
 <div class="image-file chat-image" style="background-image: url('` +
      imgURL +
      `');"></div>
 <p><span class="fas fa-file-image"></span> ` +
      escapeHtml(fileName) +
      `</p>
</div>
`
    );
  }
}

// Active Status Circle
function activeStatusCircle() {
  return `<span class="activeStatus"></span>`;
}

/**
 *-------------------------------------------------------------
 * Css Media Queries [For responsive design]
 *-------------------------------------------------------------
 */
$(window).resize(function () {
  cssMediaQueries();
});
function cssMediaQueries() {
  if (window.matchMedia("(min-width: 980px)").matches) {
    $(".messenger-listView").removeAttr("style");
  }
  if (window.matchMedia("(max-width: 980px)").matches) {
    $("body")
      .find(".messenger-list-item")
      .find("tr[data-action]")
      .attr("data-action", "1");
    $("body").find(".favorite-list-item").find("div").attr("data-action", "1");
  } else {
    $("body")
      .find(".messenger-list-item")
      .find("tr[data-action]")
      .attr("data-action", "0");
    $("body").find(".favorite-list-item").find("div").attr("data-action", "0");
  }
}

/**
 *-------------------------------------------------------------
 * App Modal
 *-------------------------------------------------------------
 */
let app_modal = function ({
  show = true,
  name,
  data = 0,
  buttons = true,
  header = null,
  body = null,
}) {
  const modal = $(".app-modal[data-name=" + name + "]");
  // header
  header ? modal.find(".app-modal-header").html(header) : "";

  // body
  body ? modal.find(".app-modal-body").html(body) : "";

  // buttons
  buttons == true
    ? modal.find(".app-modal-footer").show()
    : modal.find(".app-modal-footer").hide();

  // show / hide
  if (show == true) {
    modal.show();
    $(".app-modal-card[data-name=" + name + "]").addClass("app-show-modal");
    $(".app-modal-card[data-name=" + name + "]").attr("data-modal", data);
  } else {
    modal.hide();
    $(".app-modal-card[data-name=" + name + "]").removeClass("app-show-modal");
    $(".app-modal-card[data-name=" + name + "]").attr("data-modal", data);
  }
};

/**
 *-------------------------------------------------------------
 * Slide to bottom on [action] - e.g. [message received, sent, loaded]
 *-------------------------------------------------------------
 */
function scrollToBottom(container) {
  $(container)
    .stop()
    .animate({
      scrollTop: $(container)[0].scrollHeight,
    });
}

/**
 *-------------------------------------------------------------
 * click and drag to scroll - function
 *-------------------------------------------------------------
 */
function hScroller(scroller) {
  const slider = document.querySelector(scroller);
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener("mouseleave", () => {
    isDown = false;
  });
  slider.addEventListener("mouseup", () => {
    isDown = false;
  });
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1;
    slider.scrollLeft = scrollLeft - walk;
  });
}

/**
 *-------------------------------------------------------------
 * Disable/enable message form fields, messaging container...
 * on load info or if needed elsewhere.
 *
 * Default : true
 *-------------------------------------------------------------
 */
function disableOnLoad(disable = true) {
  if (disable) {
    // hide star button
    $(".add-to-favorite").hide();
    // hide send card
    $(".messenger-sendCard").hide();
    // add loading opacity to messages container
    messagesContainer.css("opacity", ".5");
    // disable message form fields
    messageInput.attr("readonly", "readonly");
    $("#message-form button").attr("disabled", "disabled");
    $(".upload-attachment").attr("disabled", "disabled");
  } else {
    // show star button
    if (getMessengerId() != auth_id) {
      $(".add-to-favorite").show();
    }
    // show send card
    $(".messenger-sendCard").show();
    // remove loading opacity to messages container
    messagesContainer.css("opacity", "1");
    // enable message form fields
    messageInput.removeAttr("readonly");
    $("#message-form button").removeAttr("disabled");
    $(".upload-attachment").removeAttr("disabled");
  }
}

/**
 *-------------------------------------------------------------
 * Error message card
 *-------------------------------------------------------------
 */
function errorMessageCard(id) {
  messagesContainer
    .find(".message-card[data-id=" + id + "]")
    .addClass("mc-error");
  messagesContainer
    .find(".message-card[data-id=" + id + "]")
    .find("svg.loadingSVG")
    .remove();
  messagesContainer
    .find(".message-card[data-id=" + id + "] p")
    .prepend('<span class="fas fa-exclamation-triangle"></span>');
}

/**
 *-------------------------------------------------------------
 * Fetch id data (user/group) and update the view
 *-------------------------------------------------------------
 */
function IDinfo(id) {
  // clear temporary message id
  temporaryMsgId = 0;
  // clear typing now
  typingNow = 0;
  // show loading bar
  NProgress.start();
  // disable message form
  disableOnLoad();
  if (messenger != 0) {
    // get shared photos
    getSharedPhotos(id);
    // Get info
    $.ajax({
      url: url + "/idInfo",
      method: "POST",
      data: { _token: csrfToken, id },
      dataType: "JSON",
      success: (data) => {
        if (!data?.fetch) {
          NProgress.done();
          NProgress.remove();
          return;
        }
        // avatar photo
        $(".messenger-infoView")
          .find(".avatar")
          .css("background-image", 'url("' + data.user_avatar + '")');
        $(".header-avatar").css(
          "background-image",
          'url("' + data.user_avatar + '")'
        );
        // Show shared and actions
        $(".messenger-infoView-btns .delete-conversation").show();
        $(".messenger-infoView-shared").show();
        // fetch messages
        fetchMessages(id, true);
        // focus on messaging input
        messageInput.focus();
        // update info in view
        $(".messenger-infoView .info-name").text(data.fetch.name);
        $(".m-header-messaging .user-name").text(data.fetch.name);
        // Star status
        data.favorite > 0
          ? $(".add-to-favorite").addClass("favorite")
          : $(".add-to-favorite").removeClass("favorite");
        // form reset and focus
        $("#message-form").trigger("reset");
        cancelAttachment();
        messageInput.focus();
      },
      error: () => {
        console.error("Couldn't fetch user data!");
        // remove loading bar
        NProgress.done();
        NProgress.remove();
      },
    });
  } else {
    // remove loading bar
    NProgress.done();
    NProgress.remove();
  }
}

/**
 *-------------------------------------------------------------
 * Send message function
 *-------------------------------------------------------------
 */
function sendMessage() {

  if (window.isGroupChat === true) {

    window.sendGroupMessage();

    return false;
  }
  temporaryMsgId += 1;
  let tempID = `temp_${temporaryMsgId}`;
  let hasFile = !!$(".upload-attachment").val();
  const inputValue = $.trim(messageInput.val());
  if (inputValue.length > 0 || hasFile) {
    const formData = new FormData($("#message-form")[0]);
    formData.append("id", getMessengerId());
    formData.append("temporaryMsgId", tempID);
    formData.append("_token", csrfToken);

    if (replyToMessageId) {
      formData.append('reply_to_id', replyToMessageId);
    }

    $.ajax({
      url: $("#message-form").attr("action"),
      method: "POST",
      data: formData,
      dataType: "JSON",
      processData: false,
      contentType: false,
      beforeSend: () => {
        // remove message hint
        $(".messages").find(".message-hint").hide();
        // append a temporary message card
        if (hasFile) {
          messagesContainer
            .find(".messages")
            .append(
              sendTempMessageCard(
                inputValue + "\n" + loadingSVG("28px"),
                tempID
              )
            );
        } else {
          messagesContainer
            .find(".messages")
            .append(sendTempMessageCard(inputValue, tempID));
        }
        // scroll to bottom
        scrollToBottom(messagesContainer);
        messageInput.css({ height: "42px" });
        // form reset and focus
        $("#message-form").trigger("reset");
        cancelAttachment();
        messageInput.focus();
      },
      success: (data) => {
        if (data.error > 0) {
          // message card error status
          errorMessageCard(tempID);
          console.error(data.error_msg);
        } else {
          // update contact item
          updateContactItem(getMessengerId());
          // temporary message card
          const tempMsgCardElement = messagesContainer.find(
            `.message-card[data-id=${data.tempID}]`
          );
          // add the message card coming from the server before the temp-card
          tempMsgCardElement.before(data.message);
          // then, remove the temporary message card
          tempMsgCardElement.remove();
          // scroll to bottom
          scrollToBottom(messagesContainer);
          // send contact item updates
          sendContactItemUpdates(true);
          cancelReply();
        }
      },
      error: () => {
        // message card error status
        errorMessageCard(tempID);
        // error log
        console.error(
          "Failed sending the message! Please, check your server response."
        );
      },
    });
  }
  return false;
}

/**
 *-------------------------------------------------------------
 * Fetch messages from database
 *-------------------------------------------------------------
 */
let messagesPage = 1;
let noMoreMessages = false;
let messagesLoading = false;
function setMessagesLoading(loading = false) {
  if (!loading) {
    messagesContainer.find(".messages").find(".loading-messages").remove();
    NProgress.done();
    NProgress.remove();
  } else {
    messagesContainer
      .find(".messages")
      .prepend(loadingWithContainer("loading-messages"));
  }
  messagesLoading = loading;
}
function fetchMessages(id, newFetch = false) {
  if (newFetch) {
    messagesPage = 1;
    noMoreMessages = false;
  }
  if (messenger != 0 && !noMoreMessages && !messagesLoading) {
    const messagesElement = messagesContainer.find(".messages");
    setMessagesLoading(true);
    $.ajax({
      url: url + "/fetchMessages",
      method: "POST",
      data: {
        _token: csrfToken,
        id: id,
        page: messagesPage,
      },
      dataType: "JSON",
      success: (data) => {
        setMessagesLoading(false);
        if (messagesPage == 1) {
          messagesElement.html(data.messages);
          // 🔥 ADD THIS - Load reactions for private messages
          // setTimeout(function () {
          //   loadAllMessageReactions('.messages', 'private');
          // }, 500);
          scrollToBottom(messagesContainer);
        } else {
          const lastMsg = messagesElement.find(
            messagesElement.find(".message-card")[0]
          );
          const curOffset =
            lastMsg.offset().top - messagesContainer.scrollTop();
          messagesElement.prepend(data.messages);
          // 🔥 ADD THIS - Load reactions for newly loaded messages
          setTimeout(function () {
            loadAllMessageReactions('.messages', 'private');
          }, 500);
          messagesContainer.scrollTop(lastMsg.offset().top - curOffset);
        }
        // trigger seen event
        makeSeen(true);
        // Pagination lock & messages page
        noMoreMessages = messagesPage >= data?.last_page;
        if (!noMoreMessages) messagesPage += 1;
        // Enable message form if messenger not = 0; means if data is valid
        if (messenger != 0) {
          disableOnLoad(false);
        }
      },
      error: (error) => {
        setMessagesLoading(false);
        console.error(error);
      },
    });
  }
}

/**
 *-------------------------------------------------------------
 * Cancel file attached in the message.
 *-------------------------------------------------------------
 */
function cancelAttachment() {
  $(".messenger-sendCard").find(".attachment-preview").remove();
  $(".upload-attachment").replaceWith(
    $(".upload-attachment").val("").clone(true)
  );
}

/**
 *-------------------------------------------------------------
 * Cancel updating avatar in settings
 *-------------------------------------------------------------
 */
function cancelUpdatingAvatar() {
  $(".upload-avatar-preview").css("background-image", defaultAvatarInSettings);
  $(".upload-avatar").replaceWith($(".upload-avatar").val("").clone(true));
}

/**
 *-------------------------------------------------------------
 * Pusher channels and event listening..
 *-------------------------------------------------------------
 */

// subscribe to the channel
const channelName = "private-chatify";
var channel = pusher.subscribe(`${channelName}.${auth_id}`);
var clientSendChannel;
var clientListenChannel;

function initClientChannel() {
  if (getMessengerId()) {
    clientSendChannel = pusher.subscribe(`${channelName}.${getMessengerId()}`);
    clientListenChannel = pusher.subscribe(`${channelName}.${auth_id}`);
  }
}
initClientChannel();

// Listen to messages, and append if data received
channel.bind("messaging", function (data) {


  // ✅ ADD THIS - Prevent duplicate notifications
  const notificationKey = data.id + '_' + data.from_id + '_' + data.to_id;
  if (processedPrivateNotifications.has(notificationKey)) {
    console.log('⏭️ Duplicate private notification, skipping');
    return;
  }
  processedPrivateNotifications.add(notificationKey);
  setTimeout(() => processedPrivateNotifications.delete(notificationKey), 5000);

  // Only notify when browser tab is not active
  if (
    document.hidden &&
    data.from_id != auth_id &&
    Notification.permission === "granted"
  ) {

    // Extract text from Chatify HTML
    let tempDiv = document.createElement("div");
    tempDiv.innerHTML = data.message;

    let messageText =
      (tempDiv.textContent || tempDiv.innerText || "").trim();

    // Limit preview length
    if (messageText.length > 80) {
      messageText = messageText.substring(0, 80) + "...";
    }

    // Get sender name from sidebar
    let senderName = "New Message";

    // Find the contact in sidebar
    const contactItem = $(".messenger-list-item[data-contact='" + data.from_id + "']");
    if (contactItem.length) {
      const nameEl = contactItem.find('p[data-id]');
      if (nameEl.length) {
        senderName = nameEl.text().trim();
      }
    }

    // If not found, try the header
    if (!senderName || senderName === "New Message") {
      const headerName = $(".m-header-messaging .user-name").text().trim();
      if (headerName && headerName !== "Select a chat") {
        senderName = headerName;
      }
    }

    // 🔥 Remove time from message
    let cleanMessage = (messageText || "Sent you a message").replace(/\d+\s*(seconds?|sec|minutes?|mins?|hours?|hrs?|days?|d)\s*ago/gi, '').trim();

    new Notification(senderName, {
      body: cleanMessage,
      icon: "/at-law-logo.webp",
    });
  }

  if (data.from_id == getMessengerId() && data.to_id == auth_id) {
    $(".messages").find(".message-hint").remove();

    // 🔥 ADD THIS LINE - Create a copy of the message
    let messageHtml = data.message;

    // 🔥 ADD THIS LINE - If I am the receiver, swap the class
    if (data.to_id == auth_id && data.from_id != auth_id) {
      messageHtml = messageHtml.replace(/mc-sender/g, 'mc-receiver');
      messageHtml = messageHtml.replace(/<svg class="svg-inline--fa fa-check[^>]*>.*?<\/svg>/g, '');
    }
    // ✅ CHANGE THIS - Use messageHtml instead of data.message
    messagesContainer.find(".messages").append(messageHtml);

    // ✅ THEN find that exact card by its real message id and inject the reply preview
    if (data.reply_html && data.message_id) {
      var newMessageCard = messagesContainer
        .find(".messages")
        .find('.message-card[data-id="' + data.message_id + '"]');

      if (newMessageCard.length) {
        newMessageCard.find('.message .message-text').before(data.reply_html);
      }
    }

    scrollToBottom(messagesContainer);
    makeSeen(true);

    $(".messenger-list-item[data-contact=" + getMessengerId() + "]")
      .find("tr>td>b")
      .remove();
  }

  playNotificationSound(
    "new_message",
    !(data.from_id == getMessengerId() && data.to_id == auth_id)
  );
});

// channel.bind("messaging", function (data) {

//   // Show browser notification when message comes from another user
//   if (
//     data.from_id != auth_id &&
//     Notification.permission === "granted"
//   ) {
//     new Notification("New Message", {
//       body: "You have received a new message"
//     });
//   }

//   if (data.from_id == getMessengerId() && data.to_id == auth_id) {
//     $(".messages").find(".message-hint").remove();
//     messagesContainer.find(".messages").append(data.message);
//     scrollToBottom(messagesContainer);
//     makeSeen(true);

//     $(".messenger-list-item[data-contact=" + getMessengerId() + "]")
//       .find("tr>td>b")
//       .remove();
//   }

//   playNotificationSound(
//     "new_message",
//     !(data.from_id == getMessengerId() && data.to_id == auth_id)
//   );
// });

// listen to typing indicator
// clientListenChannel.bind("client-typing", function (data) {
//   if (data.from_id == getMessengerId() && data.to_id == auth_id) {
//     data.typing == true
//       ? messagesContainer.find(".typing-indicator").show()
//       : messagesContainer.find(".typing-indicator").hide();
//   }
//   // scroll to bottom
//   scrollToBottom(messagesContainer);
// });

// listen to seen event
clientListenChannel.bind("client-seen", function (data) {
  if (data.from_id == getMessengerId() && data.to_id == auth_id) {
    if (data.seen == true) {
      $(".message-time")
        .find(".fa-check")
        .before('<span class="fas fa-check-double seen"></span> ');
      $(".message-time").find(".fa-check").remove();
    }
  }
});

// listen to contact item updates event
clientListenChannel.bind("client-contactItem", function (data) {
  if (data.to == auth_id) {
    if (data.update) {
      updateContactItem(data.from);
    } else {
      console.error("Can not update contact item!");
    }
  }
});

// listen on message delete event
clientListenChannel.bind("client-messageDelete", function (data) {
  $("body").find(`.message-card[data-id=${data.id}]`).remove();
});
// listen on delete conversation event
clientListenChannel.bind("client-deleteConversation", function (data) {
  if (data.from == getMessengerId() && data.to == auth_id) {
    $("body").find(`.messages`).html("");
    $(".messages").find(".message-hint").show();
  }
});
// -------------------------------------
// presence channel [User Active Status]
var activeStatusChannel = pusher.subscribe("presence-activeStatus");

// Joined
activeStatusChannel.bind("pusher:member_added", function (member) {
  setActiveStatus(1);
  $(".messenger-list-item[data-contact=" + member.id + "]")
    .find(".activeStatus")
    .remove();
  $(".messenger-list-item[data-contact=" + member.id + "]")
    .find(".avatar")
    .before(activeStatusCircle());
});

// Leaved
activeStatusChannel.bind("pusher:member_removed", function (member) {
  setActiveStatus(0);
  $(".messenger-list-item[data-contact=" + member.id + "]")
    .find(".activeStatus")
    .remove();
});

function handleVisibilityChange() {
  if (!document.hidden) {
    makeSeen(true);
  }
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);

/**
 *-------------------------------------------------------------
 * Trigger typing event
 *-------------------------------------------------------------
 */
// function isTyping(status) {
//   return clientSendChannel.trigger("client-typing", {
//     from_id: auth_id, // Me
//     to_id: getMessengerId(), // Messenger
//     typing: status,
//   });
// }

/**
 *-------------------------------------------------------------
 * Trigger seen event
 *-------------------------------------------------------------
 */
function makeSeen(status) {
  if (document?.hidden) {
    return;
  }
  // remove unseen counter for the user from the contacts list
  $(".messenger-list-item[data-contact=" + getMessengerId() + "]")
    .find("tr>td>b")
    .remove();
  // seen
  $.ajax({
    url: url + "/makeSeen",
    method: "POST",
    data: { _token: csrfToken, id: getMessengerId() },
    dataType: "JSON",
  });
  return clientSendChannel.trigger("client-seen", {
    from_id: auth_id, // Me
    to_id: getMessengerId(), // Messenger
    seen: status,
  });
}

/**
 *-------------------------------------------------------------
 * Trigger contact item updates
 *-------------------------------------------------------------
 */
function sendContactItemUpdates(status) {
  return clientSendChannel.trigger("client-contactItem", {
    from: auth_id, // Me
    to: getMessengerId(), // Messenger
    update: status,
  });
}

/**
 *-------------------------------------------------------------
 * Trigger message delete
 *-------------------------------------------------------------
 */
function sendMessageDeleteEvent(messageId) {
  return clientSendChannel.trigger("client-messageDelete", {
    id: messageId,
  });
}
/**
 *-------------------------------------------------------------
 * Trigger delete conversation
 *-------------------------------------------------------------
 */
function sendDeleteConversationEvent() {
  return clientSendChannel.trigger("client-deleteConversation", {
    from: auth_id,
    to: getMessengerId(),
  });
}

/**
 *-------------------------------------------------------------
 * Check internet connection using pusher states
 *-------------------------------------------------------------
 */
function checkInternet(state, selector) {
  let net_errs = 0;
  const messengerTitle = $(".messenger-headTitle");
  switch (state) {
    case "connected":
      if (net_errs < 1) {
        messengerTitle.text(messengerTitleDefault);
        selector.addClass("successBG-rgba");
        selector.find("span").hide();
        selector.slideDown("fast", function () {
          selector.find(".ic-connected").show();
        });
        setTimeout(function () {
          $(".internet-connection").slideUp("fast");
        }, 3000);
      }
      break;
    case "connecting":
      messengerTitle.text($(".ic-connecting").text());
      selector.removeClass("successBG-rgba");
      selector.find("span").hide();
      selector.slideDown("fast", function () {
        selector.find(".ic-connecting").show();
      });
      net_errs = 1;
      break;
    // Not connected
    default:
      messengerTitle.text($(".ic-noInternet").text());
      selector.removeClass("successBG-rgba");
      selector.find("span").hide();
      selector.slideDown("fast", function () {
        selector.find(".ic-noInternet").show();
      });
      net_errs = 1;
      break;
  }
}

/**
 *-------------------------------------------------------------
 * Get contacts
 *-------------------------------------------------------------
 */
let contactsPage = 1;
let contactsLoading = false;
let noMoreContacts = false;
function setContactsLoading(loading = false) {
  if (!loading) {
    $(".listOfContacts").find(".loading-contacts").remove();
  } else {
    $(".listOfContacts").append(
      `<div class="loading-contacts">${listItemLoading(4)}</div>`
    );
  }
  contactsLoading = loading;
}
function getContacts() {
  if (!contactsLoading && !noMoreContacts) {
    setContactsLoading(true);
    $.ajax({
      url: url + "/getContacts",
      method: "GET",
      data: { _token: csrfToken, page: contactsPage },
      dataType: "JSON",
      success: (data) => {
        setContactsLoading(false);
        if (contactsPage < 2) {
          $(".listOfContacts").html(data.contacts);
        } else {
          $(".listOfContacts").append(data.contacts);
        }
        updateSelectedContact();
        // update data-action required with [responsive design]
        cssMediaQueries();
        // Pagination lock & messages page
        noMoreContacts = contactsPage >= data?.last_page;
        if (!noMoreContacts) contactsPage += 1;
      },
      error: (error) => {
        setContactsLoading(false);
        console.error(error);
      },
    });
  }
}

/**
 *-------------------------------------------------------------
 * Update contact item
 *-------------------------------------------------------------
 */
function updateContactItem(user_id) {
  if (user_id != auth_id) {
    $.ajax({
      url: url + "/updateContacts",
      method: "POST",
      data: {
        _token: csrfToken,
        user_id,
      },
      dataType: "JSON",
      success: (data) => {
        $(".listOfContacts")
          .find(".messenger-list-item[data-contact=" + user_id + "]")
          .remove();
        if (data.contactItem) $(".listOfContacts").prepend(data.contactItem);
        if (user_id == getMessengerId()) updateSelectedContact(user_id);
        // show/hide message hint (empty state message)
        const totalContacts =
          $(".listOfContacts").find(".messenger-list-item")?.length || 0;
        if (totalContacts > 0) {
          $(".listOfContacts").find(".message-hint").hide();
        } else {
          $(".listOfContacts").find(".message-hint").show();
        }
        // update data-action required with [responsive design]
        cssMediaQueries();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}

/**
 *-------------------------------------------------------------
 * Star
 *-------------------------------------------------------------
 */

function star(user_id) {
  if (getMessengerId() != auth_id) {
    $.ajax({
      url: url + "/star",
      method: "POST",
      data: { _token: csrfToken, user_id: user_id },
      dataType: "JSON",
      success: (data) => {
        data.status > 0
          ? $(".add-to-favorite").addClass("favorite")
          : $(".add-to-favorite").removeClass("favorite");
      },
      error: () => {
        console.error("Server error, check your response");
      },
    });
  }
}

/**
 *-------------------------------------------------------------
 * Get favorite list
 *-------------------------------------------------------------
 */
function getFavoritesList() {
  $(".messenger-favorites").html(avatarLoading(4));
  $.ajax({
    url: url + "/favorites",
    method: "POST",
    data: { _token: csrfToken },
    dataType: "JSON",
    success: (data) => {
      if (data.count > 0) {
        $(".favorites-section").show();
        $(".messenger-favorites").html(data.favorites);
      } else {
        $(".favorites-section").hide();
      }
      // update data-action required with [responsive design]
      cssMediaQueries();
    },
    error: () => {
      console.error("Server error, check your response");
    },
  });
}

/**
 *-------------------------------------------------------------
 * Get shared photos
 *-------------------------------------------------------------
 */
function getSharedPhotos(user_id) {
  $.ajax({
    url: url + "/shared",
    method: "POST",
    data: { _token: csrfToken, user_id: user_id },
    dataType: "JSON",
    success: (data) => {
      $(".shared-photos-list").html(data.shared);
    },
    error: () => {
      console.error("Server error, check your response");
    },
  });
}

/**
 *-------------------------------------------------------------
 * Search in messenger
 *-------------------------------------------------------------
 */
let searchPage = 1;
let noMoreDataSearch = false;
let searchLoading = false;
let searchTempVal = "";
function setSearchLoading(loading = false) {
  if (!loading) {
    $(".search-records").find(".loading-search").remove();
  } else {
    $(".search-records").append(
      `<div class="loading-search">${listItemLoading(4)}</div>`
    );
  }
  searchLoading = loading;
}
function messengerSearch(input) {
  if (input != searchTempVal) {
    searchPage = 1;
    noMoreDataSearch = false;
    searchLoading = false;
  }
  searchTempVal = input;
  if (!searchLoading && !noMoreDataSearch) {
    if (searchPage < 2) {
      $(".search-records").html("");
    }
    setSearchLoading(true);
    $.ajax({
      url: url + "/search",
      method: "GET",
      data: { _token: csrfToken, input: input, page: searchPage },
      dataType: "JSON",
      success: (data) => {
        setSearchLoading(false);
        if (searchPage < 2) {
          $(".search-records").html(data.records);
        } else {
          $(".search-records").append(data.records);
        }
        // update data-action required with [responsive design]
        cssMediaQueries();
        // Pagination lock & messages page
        noMoreDataSearch = searchPage >= data?.last_page;
        if (!noMoreDataSearch) searchPage += 1;
      },
      error: (error) => {
        setSearchLoading(false);
        console.error(error);
      },
    });
  }
}

/**
 *-------------------------------------------------------------
 * Delete Conversation
 *-------------------------------------------------------------
 */
function deleteConversation(id) {
  $.ajax({
    url: url + "/deleteConversation",
    method: "POST",
    data: { _token: csrfToken, id: id },
    dataType: "JSON",
    beforeSend: () => {
      // hide delete modal
      app_modal({
        show: false,
        name: "delete",
      });
      // Show waiting alert modal
      app_modal({
        show: true,
        name: "alert",
        buttons: false,
        body: loadingSVG("32px", null, "margin:auto"),
      });
    },
    success: (data) => {
      // delete contact from the list
      $(".listOfContacts")
        .find(".messenger-list-item[data-contact=" + id + "]")
        .remove();
      // refresh info
      IDinfo(id);

      if (!data.deleted)
        return alert("Error occurred, messages can not be deleted!");

      // Hide waiting alert modal
      app_modal({
        show: false,
        name: "alert",
        buttons: true,
        body: "",
      });

      sendDeleteConversationEvent();

      // update contact list item
      sendContactItemUpdates(true);
    },
    error: () => {
      console.error("Server error, check your response");
    },
  });
}

/**
 *-------------------------------------------------------------
 * Delete Message By ID
 *-------------------------------------------------------------
 */
function deleteMessage(id) {
  $.ajax({
    url: url + "/deleteMessage",
    method: "POST",
    data: { _token: csrfToken, id: id },
    dataType: "JSON",
    beforeSend: () => {
      // hide delete modal
      app_modal({
        show: false,
        name: "delete",
      });
      // Show waiting alert modal
      app_modal({
        show: true,
        name: "alert",
        buttons: false,
        body: loadingSVG("32px", null, "margin:auto"),
      });
    },
    success: (data) => {
      $(".messages").find(`.message-card[data-id=${id}]`).remove();
      if (!data.deleted)
        console.error("Error occurred, message can not be deleted!");

      sendMessageDeleteEvent(id);

      // Hide waiting alert modal
      app_modal({
        show: false,
        name: "alert",
        buttons: true,
        body: "",
      });
    },
    error: () => {
      console.error("Server error, check your response");
    },
  });
}

/**
 *-------------------------------------------------------------
 * Update Settings
 *-------------------------------------------------------------
 */
function updateSettings() {
  const formData = new FormData($("#update-settings")[0]);
  if (messengerColor) {
    formData.append("messengerColor", messengerColor);
  }
  if (dark_mode) {
    formData.append("dark_mode", dark_mode);
  }
  $.ajax({
    url: url + "/updateSettings",
    method: "POST",
    data: formData,
    dataType: "JSON",
    processData: false,
    contentType: false,
    beforeSend: () => {
      // close settings modal
      app_modal({
        show: false,
        name: "settings",
      });
      // Show waiting alert modal
      app_modal({
        show: true,
        name: "alert",
        buttons: false,
        body: loadingSVG("32px", null, "margin:auto"),
      });
    },
    success: (data) => {
      if (data.error) {
        // Show error message in alert modal
        app_modal({
          show: true,
          name: "alert",
          buttons: true,
          body: data.msg,
        });
      } else {
        // Hide alert modal
        app_modal({
          show: false,
          name: "alert",
          buttons: true,
          body: "",
        });

        // reload the page
        location.reload(true);
      }
    },
    error: () => {
      console.error("Server error, check your response");
    },
  });
}

/**
 *-------------------------------------------------------------
 * Set Active status
 *-------------------------------------------------------------
 */
function setActiveStatus(status) {
  $.ajax({
    url: url + "/setActiveStatus",
    method: "POST",
    data: { _token: csrfToken, status: status },
    dataType: "JSON",
    success: (data) => {
      // Nothing to do
    },
    error: () => {
      console.error("Server error, check your response");
    },
  });
}

/**
 *-------------------------------------------------------------
 * On DOM ready
 *-------------------------------------------------------------
 */
$(document).ready(function () {
  // get contacts list
  getContacts();
  //  ADD CLICK HANDLER HERE (inside document ready)
  $(document).on('click', '#notification-bell-modal', function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (!("Notification" in window)) {
      alert('Your browser does not support notifications.');
      return;
    }

    // Remove existing dropdown
    $('#notification-dropdown').remove();

    let statusText = '';
    let statusColor = '';
    let actionButton = '';

    if (Notification.permission === "granted") {
      statusText = '✅ Notifications Enabled';
      statusColor = '#00b894';
      actionButton = `
                <button onclick="disableNotifications()" style="padding:8px 16px;background:#ff6b6b;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;width:100%;">
                    Disable Notifications
                </button>
            `;
    } else if (Notification.permission === "denied") {
      statusText = '❌ Notifications Blocked';
      statusColor = '#ff6b6b';
      actionButton = `
                <div style="font-size:12px;color:#636e72;padding:8px;background:#f8f9fa;border-radius:6px;">
                    Please enable in browser settings
                </div>
            `;
    } else {
      statusText = '🔔 Notifications Off';
      statusColor = '#fdcb6e';
      actionButton = `
                <button onclick="requestNotificationFromBell()" style="padding:8px 16px;background:#0984e3;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;width:100%;">
                    Enable Notifications
                </button>
            `;
    }

    let dropdownHtml = `
            <div id="notification-dropdown" style="position:fixed;top:60px;right:20px;background:white;border-radius:12px;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,0.15);z-index:999999;min-width:250px;border:1px solid #e9ecef;animation:slideDown 0.2s ease;">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    <img src="/at-law-logo.webp" alt="Logo" style="width:40px;height:40px;border-radius:50%;">
                    <div>
                        <h4 style="margin:0;font-size:14px;color:#2d3436;">Notification Settings</h4>
                        <span style="font-size:12px;color:${statusColor};font-weight:500;">${statusText}</span>
                    </div>
                </div>
                <div style="border-top:1px solid #e9ecef;padding-top:12px;">
                    ${actionButton}
                    <button onclick="$('#notification-dropdown').remove()" style="margin-top:8px;padding:6px 12px;background:transparent;color:#636e72;border:1px solid #dfe6e9;border-radius:6px;cursor:pointer;font-size:12px;width:100%;">
                        Close
                    </button>
                </div>
            </div>
            <style>
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
        `;

    $('body').append(dropdownHtml);

    // Close dropdown when clicking outside
    setTimeout(function () {
      $(document).one('click', function (e) {
        if (!$(e.target).closest('#notification-dropdown').length && !$(e.target).closest('#notification-bell').length) {
          $('#notification-dropdown').remove();
        }
      });
    }, 100);
  });


  setTimeout(function () {
    requestNotificationPermission();
  }, 2000);
  // get contacts list
  getFavoritesList();

  // Clear typing timeout
  clearTimeout(typingTimeout);

  // NProgress configurations
  NProgress.configure({ showSpinner: false, minimum: 0.7, speed: 500 });

  // make message input autosize.
  autosize($(".m-send"));

  // check if pusher has access to the channel [Internet status]
  pusher.connection.bind("state_change", function (states) {
    let selector = $(".internet-connection");
    checkInternet(states.current, selector);
    // listening for pusher:subscription_succeeded
    channel.bind("pusher:subscription_succeeded", function () {
      // On connection state change [Updating] and get [info & msgs]
      if (getMessengerId() != 0) {
        if (
          $(".messenger-list-item")
            .find("tr[data-action]")
            .attr("data-action") == "1"
        ) {
          $(".messenger-listView").hide();
        }
        IDinfo(getMessengerId());
      }
    });
  });

  // tabs on click, show/hide...
  $(".messenger-listView-tabs a").on("click", function () {
    var dataView = $(this).attr("data-view");
    $(".messenger-listView-tabs a").removeClass("active-tab");
    $(this).addClass("active-tab");
    $(".messenger-tab").hide();
    $(".messenger-tab[data-view=" + dataView + "]").show();
  });

  // set item active on click
  $("body").on("click", ".messenger-list-item", function () {
    $(".messenger-list-item").removeClass("m-list-active");
    $(this).addClass("m-list-active");
    const userID = $(this).attr("data-contact");
    // routerPush(document.title, `${url}/${userID}`);
    updateSelectedContact(userID);
  });

  // show info side button
  $(".messenger-infoView nav a , .show-infoSide").on("click", function () {
    $(".messenger-infoView").toggle();
  });

  // make favorites card dragable on click to slide.
  hScroller(".messenger-favorites");

  // click action for list item [user/group]
  $("body").on("click", ".messenger-list-item", function () {
    if ($(this).find("tr[data-action]").attr("data-action") == "1") {
      $(".messenger-listView").hide();
    }
    const dataId = $(this).find("p[data-id]").attr("data-id");
    setMessengerId(dataId);
    IDinfo(dataId);
  });

  // click action for favorite button
  $("body").on("click", ".favorite-list-item", function () {
    if ($(this).find("div").attr("data-action") == "1") {
      $(".messenger-listView").hide();
    }
    const uid = $(this).find("div.avatar").attr("data-id");
    setMessengerId(uid);
    IDinfo(uid);
    updateSelectedContact(uid);
    // routerPush(document.title, `${url}/${uid}`);
  });

  // list view buttons
  $(".listView-x").on("click", function () {
    $(".messenger-listView").hide();
  });
  $(".show-listView").on("click", function () {
    // routerPush(document.title, `${url}/`);
    $(".messenger-listView").show();
  });

  // click action for [add to favorite] button.
  $(".add-to-favorite").on("click", function () {
    star(getMessengerId());
  });

  // calling Css Media Queries
  cssMediaQueries();

  // message form on submit.
  $("#message-form").on("submit", (e) => {
    e.preventDefault();
    sendMessage();
  });

  // message input on keyup [Enter to send, Enter+Shift for new line]
  $("#message-form .m-send").on("keyup", (e) => {
    // if enter key pressed.
    if (e.which == 13 || e.keyCode == 13) {
      // if shift + enter key pressed, do nothing (new line).
      // if only enter key pressed, send message.
      if (!e.shiftKey) {
        // triggered = isTyping(false);
        sendMessage();
      }
    }
  });

  // On [upload attachment] input change, show a preview of the image/file.
  $("body").on("change", ".upload-attachment", (e) => {
    let file = e.target.files[0];
    if (!attachmentValidate(file)) return false;
    let reader = new FileReader();
    let sendCard = $(".messenger-sendCard");
    reader.readAsDataURL(file);
    reader.addEventListener("loadstart", (e) => {
      $("#message-form").before(loadingSVG());
    });
    reader.addEventListener("load", (e) => {
      $(".messenger-sendCard").find(".loadingSVG").remove();
      if (!file.type.match("image.*")) {
        // if the file not image
        sendCard.find(".attachment-preview").remove(); // older one
        sendCard.prepend(attachmentTemplate("file", file.name));
      } else {
        // if the file is an image
        sendCard.find(".attachment-preview").remove(); // older one
        sendCard.prepend(
          attachmentTemplate("image", file.name, e.target.result)
        );
      }
    });
  });

  function attachmentValidate(file) {
    const fileElement = $(".upload-attachment");
    const { name: fileName, size: fileSize } = file;
    const fileExtension = fileName.split(".").pop();
    if (
      !chatify.allAllowedExtensions.includes(
        fileExtension.toString().toLowerCase()
      )
    ) {
      alert("file type not allowed");
      fileElement.val("");
      return false;
    }
    // Validate file size.
    if (fileSize > chatify.maxUploadSize) {
      alert("File is too large!");
      return false;
    }
    return true;
  }

  // Attachment preview cancel button.
  $("body").on("click", ".attachment-preview .cancel", () => {
    cancelAttachment();
  });

  // typing indicator on [input] keyDown
  // $("#message-form .m-send").on("keydown", () => {
  //   if (typingNow < 1) {
  //     isTyping(true);
  //     typingNow = 1;
  //   }
  //   clearTimeout(typingTimeout);
  //   typingTimeout = setTimeout(function () {
  //     isTyping(false);
  //     typingNow = 0;
  //   }, 1000);
  // });

  // Image modal
  $("body").on("click", ".chat-image", function () {
    let src = $(this).css("background-image").split(/"/)[1];
    $("#imageModalBox").show();
    $("#imageModalBoxSrc").attr("src", src);
  });
  $(".imageModal-close").on("click", function () {
    $("#imageModalBox").hide();
  });

  // Search input on focus
  $(".messenger-search").on("focus", function () {
    $(".messenger-tab").hide();
    $('.messenger-tab[data-view="search"]').show();
  });
  $(".messenger-search").on("blur", function () {
    setTimeout(function () {
      $(".messenger-tab").hide();
      $('.messenger-tab[data-view="users"]').show();
    }, 200);
  });
  // Search action on keyup
  const debouncedSearch = debounce(function () {
    const value = $(".messenger-search").val();
    messengerSearch(value);
  }, 500);
  $(".messenger-search").on("keyup", function (e) {
    const value = $(this).val();
    if ($.trim(value).length > 0) {
      $(".messenger-search").trigger("focus");
      debouncedSearch();
    } else {
      $(".messenger-tab").hide();
      $('.messenger-listView-tabs a[data-view="users"]').trigger("click");
    }
  });

  // Delete Conversation button
  $(".messenger-infoView-btns .delete-conversation").on("click", function () {
    app_modal({
      name: "delete",
    });
  });
  // Delete Message Button
  $("body").on("click", ".message-card .actions .delete-btn", function () {
    app_modal({
      name: "delete",
      data: $(this).data("id"),
    });
  });
  // Delete modal [on delete button click]
  $(".app-modal[data-name=delete]")
    .find(".app-modal-footer .delete")
    .on("click", function () {
      const id = $("body")
        .find(".app-modal[data-name=delete]")
        .find(".app-modal-card")
        .attr("data-modal");
      if (id == 0) {
        deleteConversation(getMessengerId());
      } else {
        deleteMessage(id);
      }
      app_modal({
        show: false,
        name: "delete",
      });
    });
  // delete modal [cancel button]
  $(".app-modal[data-name=delete]")
    .find(".app-modal-footer .cancel")
    .on("click", function () {
      app_modal({
        show: false,
        name: "delete",
      });
    });

  // Settings button action to show settings modal
  $("body").on("click", ".settings-btn", function (e) {
    e.preventDefault();
    app_modal({
      show: true,
      name: "settings",
    });
  });

  // on submit settings' form
  $("#update-settings").on("submit", (e) => {
    e.preventDefault();
    updateSettings();
  });
  // Settings modal [cancel button]
  $(".app-modal[data-name=settings]")
    .find(".app-modal-footer .cancel")
    .on("click", function () {
      app_modal({
        show: false,
        name: "settings",
      });
      cancelUpdatingAvatar();
    });
  // upload avatar on change
  $("body").on("change", ".upload-avatar", (e) => {
    // store the original avatar
    if (defaultAvatarInSettings == null) {
      defaultAvatarInSettings = $(".upload-avatar-preview").css(
        "background-image"
      );
    }
    let file = e.target.files[0];
    if (!attachmentValidate(file)) return false;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener("loadstart", (e) => {
      $(".upload-avatar-preview").append(
        loadingSVG("42px", "upload-avatar-loading")
      );
    });
    reader.addEventListener("load", (e) => {
      $(".upload-avatar-preview").find(".loadingSVG").remove();
      if (!file.type.match("image.*")) {
        // if the file is not an image
        console.error("File you selected is not an image!");
      } else {
        // if the file is an image
        $(".upload-avatar-preview").css(
          "background-image",
          'url("' + e.target.result + '")'
        );
      }
    });
  });
  // change messenger color button
  $("body").on("click", ".update-messengerColor .color-btn", function () {
    messengerColor = $(this).attr("data-color");
    $(".update-messengerColor .color-btn").removeClass("m-color-active");
    $(this).addClass("m-color-active");
  });
  // Switch to Dark/Light mode
  $("body").on("click", ".dark-mode-switch", function () {
    if ($(this).attr("data-mode") == "0") {
      $(this).attr("data-mode", "1");
      $(this).removeClass("far");
      $(this).addClass("fas");
      dark_mode = "dark";
    } else {
      $(this).attr("data-mode", "0");
      $(this).removeClass("fas");
      $(this).addClass("far");
      dark_mode = "light";
    }
  });

  //Messages pagination
  actionOnScroll(
    ".m-body.messages-container",
    function () {
      fetchMessages(getMessengerId());
    },
    true
  );
  //Contacts pagination
  actionOnScroll(".messenger-tab.users-tab", function () {
    getContacts();
  });
  //Search pagination
  actionOnScroll(".messenger-tab.search-tab", function () {
    messengerSearch($(".messenger-search").val());
  });
});

/**
 *-------------------------------------------------------------
 * Observer on DOM changes
 *-------------------------------------------------------------
 */
let previousMessengerId = getMessengerId();
const observer = new MutationObserver(function (mutations) {
  if (getMessengerId() !== previousMessengerId) {
    previousMessengerId = getMessengerId();
    initClientChannel();
  }
});
const config = { subtree: true, childList: true };

// start listening to changes
observer.observe(document, config);

// stop listening to changes
// observer.disconnect();

/**
 *-------------------------------------------------------------
 * Resize messaging area when resize the viewport.
 * on mobile devices when the keyboard is shown, the viewport
 * height is changed, so we need to resize the messaging area
 * to fit the new height.
 *-------------------------------------------------------------
 */
var resizeTimeout;
window.visualViewport.addEventListener("resize", (e) => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    const h = e.target.height;
    if (h) {
      $(".messenger-messagingView").css({ height: h + "px" });
    }
  }, 100);
});

/**
 *-------------------------------------------------------------
 * Emoji Picker
 *-------------------------------------------------------------
 */
const emojiButton = document.querySelector(".emoji-button");

const emojiPicker = new EmojiButton({
  theme: messengerTheme,
  autoHide: false,
  position: "top-start",
});

emojiButton.addEventListener("click", (e) => {
  e.preventDefault();
  emojiPicker.togglePicker(emojiButton);
});

emojiPicker.on("emoji", (emoji) => {
  const el = messageInput[0];
  const startPos = el.selectionStart;
  const endPos = el.selectionEnd;
  const value = messageInput.val();
  const newValue =
    value.substring(0, startPos) +
    emoji +
    value.substring(endPos, value.length);
  messageInput.val(newValue);
  el.selectionStart = el.selectionEnd = startPos + emoji.length;
  el.focus();
});

/**
 *-------------------------------------------------------------
 * Notification sounds
 *-------------------------------------------------------------
 */
function playNotificationSound(soundName, condition = false) {
  if ((document.hidden || condition) && chatify.sounds.enabled) {
    const sound = new Audio(
      `/${chatify.sounds.public_path}/${chatify.sounds[soundName]}`
    );

    // 🔥 Handle the play promise to prevent the error
    const playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch(function (error) {
        // Silently fail - user hasn't interacted with the page yet
        console.log('🔇 Audio play prevented (no user interaction yet)');
      });
    }
  }
}
/**
 *-------------------------------------------------------------
 * Update and format dates to time ago.
 *-------------------------------------------------------------
 */

// ============================================
// DATE TO TIME AGO - FIXED
// ============================================
function dateStringToTimeAgo(dateString) {
  // 🔥 If no date, return "Just now"
  if (!dateString) {
    return 'Just now';
  }

  // 🔥 Parse the date
  let date = new Date(dateString);

  // 🔥 If date is invalid, try different format
  if (isNaN(date.getTime())) {
    // Try replacing space with T for ISO format
    date = new Date(dateString.replace(' ', 'T'));
    if (isNaN(date.getTime())) {
      // Still invalid, return "Just now"
      return 'Just now';
    }
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // 🔥 Check if diff is valid
  if (isNaN(diffInSeconds) || diffInSeconds < 0) {
    return 'Just now';
  }

  // 🔥 Calculate time ago
  if (diffInSeconds < 5) {
    return 'Just now';
  }

  if (diffInSeconds < 60) {
    return Math.floor(diffInSeconds) + 's';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes + 'm';
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours + 'h';
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays + 'd';
  }

  // More than a week - show date
  return date.toLocaleDateString();
}
function updateElementsDateToTimeAgo() {
  $(".message-time").each(function () {
    // 🔥 Get the data-time attribute
    const time = $(this).attr("data-time");
    console.log('🔍 Message time attribute:', time);

    if (time) {
      const result = dateStringToTimeAgo(time);
      console.log('📝 Result:', result);

      // 🔥 Only update the text, don't change the attribute
      $(this).find(".time").text(result);
    } else {
      console.log('⚠️ No data-time attribute found on:', this);
    }
  });

  $(".contact-item-time").each(function () {
    //  Get the data-time attribute
    const time = $(this).attr("data-time");

    if (time) {
      const result = dateStringToTimeAgo(time);
      //  Update the text, keep the attribute
      $(this).text(result);
    }
  });
}

// 🔥 Call immediately and then every 60 seconds
updateElementsDateToTimeAgo();
setInterval(() => {
  updateElementsDateToTimeAgo();
}, 60000);

// ============================================
// GROUP MESSAGE HANDLER - FINAL FIXED
// ============================================

// Initialize group state
if (typeof window.groupState === 'undefined') {
  window.groupState = {
    currentGroupId: null,
    isGroupChat: false
  };
}

// Global event listener
if (typeof pusher !== 'undefined') {
  pusher.bind_global(function (eventName, data) {
    console.log('🌐 GLOBAL EVENT:', eventName, data);

    if (eventName === 'App\\Events\\GroupMessageSent') {
      console.log('🎯 GROUP EVENT CAPTURED!', data);
      // ✅ ADD THIS - Check for duplicates
      const messageId = data.message?.id || data.id;
      if (messageId && processedMessageIds.has(messageId)) {
        console.log('⏭️ Duplicate message, skipping global handler');
        return;
      }
      if (messageId) {
        processedMessageIds.add(messageId);
        // Clear after 3 seconds
        setTimeout(() => processedMessageIds.delete(messageId), 3000);
      }
      handleGroupMessage(data);
    }
  });
}

// Main group message handler
function handleGroupMessage(data) {
  console.log('📨 Processing group message:', data);

  var messageData = data.message || data;
  var groupId = messageData.group_id;
  var senderId = messageData.sender_id;


  // Skip own messages
  // 🔥 For own messages - ONLY add reply preview to existing message
  if (senderId == auth_id) {
    console.log('👤 Own message - checking for reply preview');

    // Check if this is a reply message with preview
    if (messageData.reply_html) {
      console.log('📝 Own reply message - adding reply preview to existing message');

      // Find the last message card (your own message that was just sent via AJAX)
      var lastMessageCard = $('.messages .mc-sender:last');

      if (lastMessageCard.length) {
        // Remove any existing reply preview
        lastMessageCard.find('.message-reply-preview').remove();

        // 🔥 Add the reply preview at the top of the message content
        lastMessageCard.find('.message .message-text').before(messageData.reply_html);
        // OR use prepend if you want it at the very top
        // lastMessageCard.find('.message').prepend(messageData.reply_html);

        console.log('✅ Reply preview added to own message');
      }
    }

    // 🔥 STILL RETURN to prevent duplicate message
    return;
  }

  // ============================================
  // 1. UPDATE SIDEBAR - ALWAYS
  // ============================================
  console.log('🔍 Searching for group in sidebar with ID:', groupId);

  var groupItem = $(`.group-item[data-group-id="${groupId}"]`);

  console.log('🔍 Group item found:', groupItem.length > 0 ? 'YES' : 'NO');

  if (groupItem.length) {
    console.log('✅ Group found in sidebar');

    // 🔥 Check if we're viewing THIS group
    var isCurrentlyViewingThisGroup = (window.groupState.currentGroupId == groupId && window.groupState.isGroupChat);


    // Update last message preview (ALWAYS)
    var senderName = messageData.sender ? messageData.sender.name : 'Someone';
    var messageText = messageData.message || 'New message';
    var preview = senderName + ': ' + messageText;
    if (preview.length > 40) preview = preview.substring(0, 40) + '...';

    console.log('📝 Updating preview to:', preview);
    groupItem.find('td:last-child span').text(preview);
    groupItem.find('.contact-item-time').text('Just now');

    if (!isCurrentlyViewingThisGroup) {
      // ✅ NOT viewing this group - add/update badge
      console.log('🔔 NOT viewing this group, adding/updating badge');

      var badge = groupItem.find('.contact-item-unread');
      var td = groupItem.find('td:first-child');

      if (badge.length) {
        var count = parseInt(badge.text()) + 1;
        badge.text(count);
        badge.show();
        console.log('🔔 Updated unread count for group:', groupId, 'New count:', count);
      } else {
        // 🔥 ALWAYS add badge to td
        td.css('position', 'relative');
        td.append('<span class="contact-item-unread" style="position:absolute;top:-5px;right:-5px;background:#ff4757;color:white;border-radius:50%;padding:2px 6px;font-size:10px;font-weight:700;min-width:18px;text-align:center;line-height:16px;border:2px solid white;z-index:5;">1</span>');
        console.log('🔔 Added new unread badge for group:', groupId);
      }
    } else {
      console.log('👁️ Currently viewing this group, NOT adding badge');
    }

    // Move to top (ALWAYS)
    var parent = groupItem.parent();
    if (parent.length) {
      parent.prepend(groupItem);
      console.log('📌 Moved group to top of sidebar');
    }
  } else {
    console.log('⚠️ Group NOT found in sidebar! Group ID:', groupId);
    console.log('🔄 Attempting to reload groups...');

    // Try to reload groups
    if (typeof loadGroups === 'function') {
      loadGroups();
      console.log('🔄 loadGroups() function called');

      // Try again after groups are loaded
      setTimeout(function () {
        console.log('⏰ Retrying to find group after reload...');
        var groupItemReloaded = $(`.group-item[data-group-id="${groupId}"]`);

        if (groupItemReloaded.length) {
          console.log('✅ Group found AFTER reload! Group ID:', groupId);

          // Update last message preview
          var senderName = messageData.sender ? messageData.sender.name : 'Someone';
          var messageText = messageData.message || 'New message';
          var preview = senderName + ': ' + messageText;
          if (preview.length > 40) preview = preview.substring(0, 40) + '...';

          console.log('📝 Updating preview after reload to:', preview);
          groupItemReloaded.find('td:last-child span').text(preview);
          groupItemReloaded.find('.contact-item-time').text('Just now');

          // Add unread badge
          var isCurrentlyViewingThisGroup = (window.groupState.currentGroupId == groupId && window.groupState.isGroupChat);
          console.log('👁️ Currently viewing this group (after reload)?', isCurrentlyViewingThisGroup);

          if (!isCurrentlyViewingThisGroup) {
            console.log('🔔 NOT viewing this group (after reload), adding badge');

            var badge = groupItemReloaded.find('.contact-item-unread');
            var avatar = groupItemReloaded.find('.avatar');

            if (badge.length) {
              var count = parseInt(badge.text()) + 1;
              badge.text(count);
              badge.show(); // 🔥 FIX: Make sure it's visible
              console.log('🔔 Updated unread count for group (after reload):', groupId, 'New count:', count);
            } else if (avatar.length) {
              avatar.append('<span class="contact-item-unread">1</span>');
              console.log('🔔 Added new unread badge for group (after reload):', groupId);
            } else {
              groupItemReloaded.find('td:first-child').append('<span class="contact-item-unread">1</span>');
              console.log('🔔 Added badge to td:first-child (after reload) for group:', groupId);
            }
          } else {
            console.log('👁️ Currently viewing this group (after reload), NOT adding badge');
          }

          // Move to top
          var parent = groupItemReloaded.parent();
          if (parent.length) {
            parent.prepend(groupItemReloaded);
            console.log('📌 Moved group to top of sidebar (after reload)');
          }
        } else {
          console.log('❌ Group STILL NOT found after reload! Group ID:', groupId);
        }
      }, 800);
    } else {
      console.log('❌ loadGroups function is not available!');
    }
  }

  // ============================================
  // 2. BROWSER NOTIFICATIONS - ONLY WHEN TAB HIDDEN
  // ============================================
  if (document.hidden && Notification.permission === "granted") {
    var groupName = groupItem.length ? groupItem.find('p[data-id]').text().trim() : 'Group Chat';
    var senderName = messageData.sender ? messageData.sender.name : 'Someone';
    var msgText = messageData.message || 'New message';
    if (msgText.length > 80) msgText = msgText.substring(0, 80) + '...';

    new Notification(senderName + ' in ' + groupName, {
      body: msgText,
      icon: '/at-law-logo.webp'
    });
    console.log('🔔 Notification shown (tab hidden)');
  }

  // ============================================
  // 3. PLAY SOUND
  // ============================================
  if (typeof playNotificationSound === 'function') {
    playNotificationSound('new_message', true);
  }

  // ============================================
  // 4. DISPLAY MESSAGE (only if viewing this group)
  // ============================================
  if (!window.groupState.isGroupChat || window.groupState.currentGroupId != groupId) {
    console.log('⏭️ Not viewing this group, not displaying');
    return;
  }

  if ($(`.messages [data-message-id="${messageData.id}"]`).length > 0) {
    console.log('⏭️ Duplicate message');
    return;
  }

  // Build message HTML
  var displayName = messageData.sender ? messageData.sender.name : 'Unknown';
  var timeDisplay = messageData.created_at ? new Date(messageData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';


  var msgHtml = '';
  if (messageData.message) {
    var msgText = messageData.message;
    // 🔥 STEP 1: Convert URLs to clickable links
    msgText = msgText.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="message-link">$1</a>');
    // 🔥 STEP 2: Highlight @mentions
    var highlightedMsg = msgText.replace(/@([a-zA-Z0-9_\s]+?)(?=\s|$|[.,!?;:])/g, '<span class="mention-text">@$1</span>');
    msgHtml += '<div class="message-text">' + highlightedMsg + '</div>';
  }
  if (messageData.attachment) {
    var fileUrl = '/storage/' + messageData.attachment;
    var isImage = messageData.attachment_type && messageData.attachment_type.startsWith('image/');

    if (isImage) {
      msgHtml += '<div class="chat-image" style="background-image:url(' + fileUrl + ');max-width:200px;max-height:200px;background-size:cover;background-position:center;border-radius:8px;margin-top:5px;cursor:pointer;"></div>';
    } else {
      var fileName = messageData.attachment.split('/').pop();
      msgHtml += '<div class="file-attachment" style="padding:6px 10px;background:#f1f2f6;border-radius:6px;margin-top:4px;display:inline-block;"><i class="fas fa-paperclip"></i> <a href="' + fileUrl + '" target="_blank">' + fileName + '</a></div>';
    }
  }

  $('.messages').find('.message-hint').hide();
  var replyHtml = '';
  if (messageData.reply_html) {
    replyHtml = messageData.reply_html;
  } else if (messageData.reply_to_id) {
    replyHtml = `
    <div class="message-reply-preview" style="background:#f1f2f6; padding:6px 10px; border-radius:6px; margin-bottom:4px; border-left:3px solid #667eea; font-size:12px;">
        <div style="color:#636e72; font-weight:600; margin-bottom:2px;">
            <i class="fas fa-reply" style="font-size:10px; margin-right:4px;"></i>
            Replying to a message
        </div>
    </div>
    `;
  }

  // In handleGroupMessage function, find this part where messages are displayed:

  $('.messages').append(`
    <div class="message-card mc-receiver" data-message-id="${messageData.id}" data-id="${messageData.id}" data-type="group">
        <div class="message">
            <div class="message-user" style="font-size:11px;font-weight:600;color:#636e72;margin-bottom:2px;display:flex;justify-content:space-between;">
                <span>${displayName}</span>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:10px;font-weight:400;color:#b2bec3;">${timeDisplay}</span>
                    <!-- 🔥 REPLY BUTTON FOR RECEIVER -->
                    <button class="reply-btn" 
                            data-message-id="${messageData.id}" 
                            data-sender-name="${displayName}"
                            data-message-text="${messageData.message || ''}"
                            style="background:none; border:none; color:#b2bec3; cursor:pointer; font-size:12px; padding:2px 6px; border-radius:4px; transition:all 0.2s;">
                        <i class="fas fa-reply"></i>
                    </button>
                </div>
            </div>
            ${replyHtml}
            ${msgHtml}
            <div class="message-reactions" style="display:flex; gap:3px; margin-top:4px; flex-wrap:wrap;"></div>
        </div>
    </div>
`);

  scrollToBottom(messagesContainer);
  console.log('✅ Message displayed in chat');
}

console.log('✅ Group handler ready!');
// ============================================
// GROUP CHAT - COMPLETE SYSTEM
// ============================================

(function () {
  'use strict';



  let selectedMembers = [];
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
  // TOGGLE GROUP TYPE
  // ============================================
  $(document).on('change', '#group_type', function () {
    if ($(this).val() === 'public') {
      // Hide member selection for public groups
      $('#member-selection-area').hide();
      $('#public-group-info').show();
      $('#group-user-search').val('');
      $('#group-search-results').html('');
      $('#selected-members').html('');
    } else {
      // Show member selection for private groups
      $('#member-selection-area').show();
      $('#public-group-info').hide();
    }
  });


  // ============================================
  // CREATE GROUP
  // ============================================
  // $(document).on('click', '#save-group', function () {
  //   let groupName = $('#group_name').val().trim();
  //    let groupType = $('#group_type').val(); 
  //   if (!groupName) return alert('Enter group name');
  //      // For private groups, check if members are selected
  //   if (groupType === 'private' && selectedMembers.length === 0) {
  //       return alert('Select at least one member');
  //   }
  //   if (selectedMembers.length === 0) return alert('Select members');
  //   let formData = new FormData();
  //   formData.append('name', groupName);
  //    formData.append('type', groupType); // 
  //   let image = $('#group_image')[0].files[0];
  //   if (image) formData.append('image', image);
  //   selectedMembers.forEach(id => {
  //     formData.append('members[]', id);
  //   });
  //   formData.append('_token', $('meta[name="csrf-token"]').attr('content'));
  //   $.ajax({
  //     url: '/groups/store',
  //     type: 'POST',
  //     data: formData,
  //     processData: false,
  //     contentType: false,
  //     success: function (response) {
  //       loadGroups();
  //       // 🔥 SUBSCRIBE TO THE NEW GROUP CHANNEL
  //       let groupId = response.group_id;
  //       if (groupId) {
  //         console.log('📡 Subscribing to new group.' + groupId);
  //         let channel = pusher.subscribe('group.' + groupId);
  //         channel.bind('App\\Events\\GroupMessageSent', function (data) {
  //           console.log('📨 Message on new group.' + groupId, data);
  //           if (typeof handleGroupMessage === 'function') {
  //             handleGroupMessage(data);
  //           }
  //         });
  //         if (typeof window.groupChannels === 'undefined') {
  //           window.groupChannels = {};
  //         }
  //         window.groupChannels[groupId] = channel;
  //       }
  //       selectedMembers = [];
  //       $('#group_name').val('');
  //       $('#group_image').val('');
  //       $('#selected-members').html('');
  //       $('.app-modal[data-name="create-group"]').fadeOut(200);
  //     }
  //   });
  // });

  $(document).on('click', '#save-group', function () {
    let groupName = $('#group_name').val().trim();
    let groupType = $('#group_type').val(); // 🔥 Get group type

    if (!groupName) return alert('Enter group name');

    // 🔥 Only check members for PRIVATE groups
    if (groupType === 'private' && selectedMembers.length === 0) {
      return alert('Select at least one member');
    }

    // 🔥 REMOVE THIS LINE - It's causing the conflict
    // if (selectedMembers.length === 0) return alert('Select members');

    let formData = new FormData();
    formData.append('name', groupName);
    formData.append('type', groupType);

    let image = $('#group_image')[0].files[0];
    if (image) formData.append('image', image);

    // 🔥 Only add members for private groups
    if (groupType === 'private') {
      selectedMembers.forEach(id => {
        formData.append('members[]', id);
      });
    }

    formData.append('_token', $('meta[name="csrf-token"]').attr('content'));

    $.ajax({
      url: '/groups/store',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        loadGroups();

        let groupId = response.group_id;
        if (groupId) {
          console.log('📡 Subscribing to new group.' + groupId);
          let channel = pusher.subscribe('group.' + groupId);
          channel.bind('App\\Events\\GroupMessageSent', function (data) {
            console.log('📨 Message on new group.' + groupId, data);
            if (typeof handleGroupMessage === 'function') {
              handleGroupMessage(data);
            }
          });
          if (typeof window.groupChannels === 'undefined') {
            window.groupChannels = {};
          }
          window.groupChannels[groupId] = channel;
        }

        selectedMembers = [];
        $('#group_name').val('');
        $('#group_image').val('');
        $('#selected-members').html('');
        $('#group_type').val('private'); // Reset to private
        $('.app-modal[data-name="create-group"]').fadeOut(200);
      },
      error: function (xhr) {
        let error = xhr.responseJSON?.error || 'Failed to create group';
        alert('❌ ' + error);
      }
    });
  });


  // ============================================
  // PREVENT PRIVATE CHAT MESSAGES FROM LOADING IN GROUPS
  // ============================================
  var originalFetchMessages = window.fetchMessages;

  window.fetchMessages = function (id, newFetch = false) {
    if (window.groupState.isGroupChat) {
      console.log('⏭️ Skipping fetchMessages - Currently in group chat');
      return;
    }
    if (typeof originalFetchMessages === 'function') {
      return originalFetchMessages(id, newFetch);
    }
  };

  var originalIDinfo = window.IDinfo;

  window.IDinfo = function (id) {
    if (window.groupState.isGroupChat) {
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

  $(document).on('click', '.messenger-list-item:not(.group-item)', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('#pinned-message-banner').slideUp(200);
    window.pinnedMessageId = null;
    fullPinnedMessageText = '';
    fullPinnedSenderName = '';
    $('#unpin-from-banner').hide();

    console.log('🔄 Switching to private chat');

    window.groupState.isGroupChat = false;
    window.groupState.currentGroupId = null;
    window.groupState.activeTab = 'private';

    // if (window.groupChannel) {
    //   window.groupChannel.unsubscribe();
    //   window.groupChannel = null;
    // }

    enableGroupMessageInput();

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
  function enableGroupMessageInput() {
    console.log('🔓 Enabling message input');

    // Remove read-only message
    $('.read-only-message').remove();

    // Show send card
    $('.messenger-sendCard').show();
    messageInput.removeAttr('readonly');
    $('#message-form button').removeAttr('disabled');
    $('.upload-attachment').removeAttr('disabled');
    messagesContainer.css('opacity', '1');
    setTimeout(function () {
      messageInput.focus();
    }, 300);
  }

  function disableGroupMessageInput() {
    console.log('🔒 Disabling message input (read-only group)');

    // Hide send card
    $('.messenger-sendCard').hide();

    // Remove existing read-only message
    $('.read-only-message').remove();

    // Show read-only message
    $('.messenger-messagingView').append(`
        <div class="read-only-message" style="padding:20px; text-align:center; background:#f8f9fa; border-bottom:1px solid #e9ecef; color:#6c757d; font-size:14px;">
            <i class="fas fa-lock" style="margin-right:8px; color:#667eea;"></i>
            This is a public group. Only Admins and Managers can send announcements.
        </div>
    `);
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
        let avatar = user.avatar ? `/storage/users-avatar/${user.avatar}` : '/images/avatar.png';
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
  // LOAD GROUPS - WITH CHANNEL SUBSCRIPTION
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

      // 🔥 SUBSCRIBE TO ALL GROUP CHANNELS
      groups.forEach(function (group) {
        let groupId = group.id;
        console.log('📡 Subscribing to group.' + groupId);

        // Subscribe to the group channel
        let channel = pusher.subscribe('group.' + groupId);

        // 🔥 BIND THE EVENT DIRECTLY TO THIS CHANNEL
        channel.bind('App\\Events\\GroupMessageSent', function (data) {
          console.log('📨 Message on group.' + groupId, data);

          // ✅ ADD THIS - Check for duplicates
          const messageId = data.message?.id || data.id;
          if (messageId && processedMessageIds.has(messageId)) {
            console.log('⏭️ Duplicate message, skipping per-group handler');
            return;
          }
          if (messageId) {
            processedMessageIds.add(messageId);
            // Clear after 3 seconds
            setTimeout(() => processedMessageIds.delete(messageId), 3000);
          }
          // Call the existing handler
          if (typeof handleGroupMessage === 'function') {
            handleGroupMessage(data);
          }
        });

        // 🔥 ADD THIS - BIND REACTION EVENT
        channel.bind('App\\Events\\MessageReactionEvent', function (data) {
          console.log('📨 Reaction on group.' + groupId, data);
          if (data.type === 'group') {
            updateReactionsDisplay(data.message_id, data.reactions);
          }
        });

        // Store channel reference
        if (typeof window.groupChannels === 'undefined') {
          window.groupChannels = {};
        }
        window.groupChannels[groupId] = channel;
      });

      // Build HTML
      groups.forEach(function (group) {
        let image = group.image ? '/storage/' + group.image : '/images/group-default.png';
        let lastMessage = group.last_message || 'No messages yet';
        let unreadCount = group.unread_count || 0;

        if (lastMessage.length > 35) {
          lastMessage = lastMessage.substring(0, 35) + '...';
        }

        let timeDisplay = '';
        let originalTime = '';
        if (group.last_message_time) {
          originalTime = group.last_message_time;
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
                            <td style="position: relative; width: 80px;">
                              <div class="avatar av-m" style="background-image: url('${image}');"></div>
                              <!-- 🔥 BADGE IS NOW OUTSIDE THE AVATAR -->
                              ${unreadCount > 0 ? `<span class="contact-item-unread">${unreadCount}</span>` : ''}
                          </td>
                            <td>
                                <p data-id="${group.id}" data-type="group">
                                    ${group.name.replace(/\b\w/g, l => l.toUpperCase())}
                                     <span class="contact-item-time" data-time="${originalTime}">${timeDisplay}</span>
                                </p>
                                <span>${lastMessage}</span>
                            </td>
                        </tr>
                    </table>
                </div>
            `;
      });

      $('.listOfGroups').html(html);
    }).fail(function (error) {
      console.error('Error loading groups:', error);
      $('.listOfGroups').html('<div style="padding: 20px; text-align: center; color: red;">Error loading groups</div>');
    });
  }

  // Initial load
  loadGroups();

  // ============================================
  // CLICK GROUP
  // ============================================
  $(document).on('click', '.group-item', function (e) {
    e.preventDefault();
    e.stopPropagation();

    let groupId = $(this).data('group-id');
    if (!groupId) return;

    console.log('🔄 Switching to GROUP:', groupId);

    $('.messenger-list-item').removeClass('m-list-active');
    $(this).addClass('m-list-active');

    window.groupState.isGroupChat = true;
    window.groupState.currentGroupId = groupId;
    window.groupState.activeTab = 'group';


    showGroupInfo();
    loadGroupInfo(groupId);
    enableGroupMessageInput();

    $.ajax({
      url: '/groups/mark-as-read',
      type: 'POST',
      data: {
        _token: csrfToken,
        group_id: groupId
      },
      success: function () {
        console.log('✅ Messages marked as read');
        $('.group-item[data-group-id="' + groupId + '"] .contact-item-unread').remove();
      }
    });

    loadGroupMessages(groupId);

    if (window.groupChannel) {
      // Keep the existing channel, but also subscribe to the new one
      console.log('📡 Already subscribed to a group, adding new one too');
    }

    window.groupChannel = pusher.subscribe('group.' + groupId);
    // ✅ ADD THIS - Bind with duplicate check
    window.groupChannel.bind('App\\Events\\GroupMessageSent', function (data) {
      console.log('📨 Message on active group.' + groupId, data);
      // ✅ ADD THIS - Check for duplicates
      const messageId = data.message?.id || data.id;
      if (messageId && processedMessageIds.has(messageId)) {
        console.log('⏭️ Duplicate message, skipping active group handler');
        return;
      }
      if (messageId) {
        processedMessageIds.add(messageId);
        // Clear after 3 seconds
        setTimeout(() => processedMessageIds.delete(messageId), 3000);
      }
      // Call the existing handler
      if (typeof handleGroupMessage === 'function') {
        handleGroupMessage(data);
      }
    });
    // 🔥 ADD THIS - BIND REACTION EVENT
    window.groupChannel.bind('App\\Events\\MessageReactionEvent', function (data) {
      console.log('📨 Reaction on active group.' + groupId, data);
      if (data.type === 'group') {
        updateReactionsDisplay(data.message_id, data.reactions);
      }
    });
    window.groupChannel.bind('pusher:subscription_succeeded', function () {
      console.log('✅ Subscribed to group.' + groupId);
    });
    // 🔥 BIND GROUP REACTIONS
    // bindGroupReactions(window.groupChannel);
  });




  // ============================================
  // LOAD GROUP MESSAGES WITH "LOAD MORE" BUTTON - FIXED
  // ============================================

  // 🔥 Variables for pagination
  if (typeof groupMessagesPage === 'undefined') {
    var groupMessagesPage = 1;
  }
  if (typeof groupNoMoreMessages === 'undefined') {
    var groupNoMoreMessages = false;
  }
  if (typeof isLoadingMore === 'undefined') {
    var isLoadingMore = false;
  }
  if (typeof currentGroupId === 'undefined') {
    var currentGroupId = null;
  }

  function loadGroupMessages(groupId, loadMore = false) {
    if (!groupId) return;

    // If switching to a new group, reset pagination
    if (currentGroupId !== groupId) {
      currentGroupId = groupId;
      groupMessagesPage = 1;
      groupNoMoreMessages = false;
      isLoadingMore = false;
      // Remove any existing load more button
      $('#load-more-btn-container').remove();
    }

    console.log('📥 Loading messages for group:', groupId, 'Page:', groupMessagesPage, 'Load More:', loadMore);

    if (!loadMore) {
      // First load - Show loading indicator
      $('.messages').html('<div style="text-align:center;padding:40px;color:#999;">Loading messages...</div>');
    } else {
      // Loading more
      isLoadingMore = true;
      $('#load-more-btn').html('<i class="fas fa-spinner fa-spin"></i> Loading...').prop('disabled', true);
    }

    // Make AJAX request with page parameter
    $.get('/groups/' + groupId + '/messages', {
      page: groupMessagesPage
    }, function (response) {
      // 🔥 UPDATE PINNED MESSAGE BANNER
      if (response.pinned_message) {
        let pinBanner = $('#pinned-message-banner');
        let fullText = response.pinned_message.message || 'Pinned message';

        // 🔥 STORE FULL MESSAGE FOR EXPAND/COLLAPSE
        fullPinnedMessageText = fullText;
        fullPinnedSenderName = response.pinned_message.sender?.name || 'Unknown';

        // Show preview (shortened) in the banner
        let previewText = fullText.length > 60
          ? fullText.substring(0, 60) + '...'
          : fullText;

        // Update banner content
        $('#pinned-message-preview').text(previewText);
        $('#pinned-message-sender').text(fullPinnedSenderName);

        // 🔥 Store pinned message ID and group ID for unpin button
        window.pinnedMessageId = response.pinned_message.id;

        // 🔥 Reset expanded state when new message is pinned
        isPinnedExpanded = false;
        $('#pinned-message-banner .fa-chevron-down').removeClass('fa-chevron-down').addClass('fa-chevron-right');
        $('#pinned-message-banner').removeClass('expanded');
        $('#pinned-message-preview').css({
          'white-space': 'nowrap',
          'word-wrap': 'normal',
          'max-height': 'none',
          'overflow-y': 'visible',
          'display': 'inline'
        });

        // 🔥 Update unpin button with data
        $('#unpin-from-banner').data('message-id', response.pinned_message.id);
        $('#unpin-from-banner').data('group-id', groupId);

        // 🔥 Check if user is admin to show unpin button
        let isAdmin = response.is_admin || false;
        if (isAdmin) {
          $('#unpin-from-banner').show();
        } else {
          $('#unpin-from-banner').hide();
        }

        // Show the banner
        pinBanner.slideDown(200);
      } else {
        $('#pinned-message-banner').slideUp(200);
        window.pinnedMessageId = null;
        fullPinnedMessageText = '';
        fullPinnedSenderName = '';
        $('#unpin-from-banner').hide();
      }

      // Remove load more button container
      $('#load-more-btn-container').remove();

      // 🔥 Get current scroll position before adding new messages
      let oldScrollHeight = 0;
      let container = $('.m-body.messages-container')[0] || $('.messages-container')[0];
      if (loadMore && container) {
        oldScrollHeight = container.scrollHeight;
      }

      if (loadMore) {
        // 🔥 PREPEND older messages to the TOP
        $('.messages').prepend(response.messages_html);

        // 🔥 Maintain scroll position after prepending
        if (container) {
          let newScrollHeight = container.scrollHeight;
          let heightDifference = newScrollHeight - oldScrollHeight;
          if (heightDifference > 0) {
            container.scrollTop = heightDifference;
          }
        }
      } else {
        // FIRST LOAD - Replace all messages
        $('.messages').empty();
        $('.messages').html(response.messages_html);
      }

      // Update group info in header
      if (response.group) {
        $('.user-name').text(response.group.name);

        if (response.group.image) {
          $('.header-avatar').css('background-image', 'url(/storage/' + response.group.image + ')');
        } else {
          $('.header-avatar').css('background-image', 'url(/images/group-default.png)');
        }
      }

      // Hide message hint if there are messages
      if ($('.messages .message-card').length > 0) {
        $('.messages').find('.message-hint').hide();
      }

      console.log('📨 Messages rendered:', $('.messages .message-card').length);

      // Update pagination state
      if (response.has_more !== undefined) {
        groupNoMoreMessages = !response.has_more;
      } else if (response.last_page !== undefined) {
        groupNoMoreMessages = groupMessagesPage >= response.last_page;
      } else {
        groupNoMoreMessages = true;
      }

      // Increment page for next load
      if (!groupNoMoreMessages) {
        groupMessagesPage += 1;
      }

      console.log('📊 No more messages:', groupNoMoreMessages);
      console.log('📊 Next page:', groupMessagesPage);

      // 🔥 Scroll to bottom only on first load
      if (!loadMore) {
        setTimeout(function () {
          scrollToBottom(messagesContainer);
        }, 200);
      }

      isLoadingMore = false;

      // 🔥 ONLY ADD BUTTON IF THERE ARE MORE MESSAGES
      if (!groupNoMoreMessages) {
        // Check if user is scrolled to top
        let container = $('.m-body.messages-container')[0] || $('.messages-container')[0];
        if (container && container.scrollTop <= 50) {
          addLoadMoreButton(groupId);
        } else {
          // Store that we need to show button when scrolled to top
          window.showLoadMoreOnScroll = true;
        }
      }

    }).fail(function (xhr) {
      console.error('❌ Failed to load group messages:', xhr);

      if (loadMore) {
        $('#load-more-btn').html('⚠️ Failed to load').prop('disabled', false);
        setTimeout(function () {
          if ($('#load-more-btn').length) {
            $('#load-more-btn').html('Load Older Messages');
          }
        }, 3000);
      } else {
        $('.messages').html('<div style="text-align:center;padding:40px;color:red;">Failed to load messages</div>');
      }

      isLoadingMore = false;
    });
  }

  // ============================================
  // ADD "LOAD OLDER MESSAGES" BUTTON - ONLY AT TOP
  // ============================================
  function addLoadMoreButton(groupId) {
    // Remove existing button if any
    $('#load-more-btn-container').remove();

    // Check if there are any messages
    if ($('.messages .message-card').length === 0) {
      return;
    }

    // Check if no more messages
    if (groupNoMoreMessages) {
      return;
    }

    // 🔥 Get the first message (oldest) to insert button BEFORE it
    var firstMessage = $('.messages .message-card:first');

    var buttonHtml = `
        <div id="load-more-btn-container" style="text-align:center; padding:15px 0; width:100%;">
            <button id="load-more-btn" 
                    data-group-id="${groupId}" 
                    style="background:#667eea; color:white; border:none; border-radius:8px; padding:10px 25px; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.3s; box-shadow:0 2px 10px rgba(102,126,234,0.3);">
                <i class="fas fa-arrow-up"></i> Load Older Messages
            </button>
        </div>
    `;

    // 🔥 Insert button BEFORE the first message (at the top)
    if (firstMessage.length) {
      firstMessage.before(buttonHtml);
    } else {
      $('.messages').append(buttonHtml);
    }

    // Add click event
    $('#load-more-btn').on('click', function () {
      var groupId = $(this).data('group-id');
      if (groupId && !isLoadingMore) {
        console.log('🔄 Load More button clicked for group:', groupId);
        loadGroupMessages(groupId, true);
      }
    });

    // 🔥 Hide button if not at top
    checkScrollForButton();

    console.log('✅ Load More button added');
  }

  // ============================================
  // CHECK SCROLL POSITION TO SHOW/HIDE BUTTON
  // ============================================
  function checkScrollForButton() {
    var container = $('.m-body.messages-container')[0] || $('.messages-container')[0];
    if (!container) return;

    var scrollTop = container.scrollTop;
    var $buttonContainer = $('#load-more-btn-container');

    if ($buttonContainer.length) {
      // 🔥 Only show button when scrolled to top (within 50px) AND there are more messages
      if (scrollTop <= 50 && !groupNoMoreMessages) {
        $buttonContainer.show();
        console.log('✅ Load More button shown (scrolled to top)');
      } else {
        $buttonContainer.hide();
        console.log('🔽 Load More button hidden (not at top)');
      }
    }
  }

  // ============================================
  // INFINITE SCROLL - Show/hide button based on scroll
  // ============================================
  $(document).on('scroll', '.m-body.messages-container, .messages-container', function () {
    // Check if we're in a group chat
    if (!window.groupState || !window.groupState.isGroupChat) {
      return;
    }

    let groupId = window.groupState.currentGroupId;
    if (!groupId) {
      return;
    }

    let container = this;
    let scrollTop = container.scrollTop;

    // 🔥 Check if button should be shown/hidden
    let $buttonContainer = $('#load-more-btn-container');

    if ($buttonContainer.length) {
      // Show button when at top, hide when scrolled down
      if (scrollTop <= 50 && !groupNoMoreMessages) {
        $buttonContainer.show();
      } else {
        $buttonContainer.hide();
      }
    } else {
      // If button doesn't exist but there are more messages and at top, add it
      if (scrollTop <= 50 && !groupNoMoreMessages && !isLoadingMore) {
        // Check if button should exist
        if (typeof addLoadMoreButton === 'function') {
          addLoadMoreButton(groupId);
        }
      }
    }

    // 🔥 Also trigger load when at top and no button exists
    if (scrollTop <= 30 && !groupNoMoreMessages && !isLoadingMore) {
      // If no button exists, add it
      if ($('#load-more-btn-container').length === 0) {
        if (typeof addLoadMoreButton === 'function') {
          addLoadMoreButton(groupId);
        }
      }
    }
  });

  // ============================================
  // ALSO CHECK ON WINDOW RESIZE
  // ============================================
  $(window).on('resize', function () {
    setTimeout(function () {
      checkScrollForButton();
    }, 300);
  });

  console.log('✅ Load More button with scroll detection initialized!');



  window.sendGroupMessage = function () {
    let text = $.trim(messageInput.val());
    let currentGroupId = window.groupState.currentGroupId || window.currentGroupIdForMembers;
    let hasFile = !!$(".upload-attachment").val();

    if ((!text && !hasFile) || !currentGroupId) {
      console.log('⏭️ No message or attachment to send');
      return false;
    }

    console.log('📤 Sending group message to group:', currentGroupId);
    // 🔥🔥🔥 ADD THIS - CLEAR MENTIONS BEFORE SENDING


    // Create form data
    let formData = new FormData();
    formData.append('group_id', currentGroupId);
    formData.append('message', text || '');
    formData.append('_token', csrfToken);

    // 🔥 THIS IS THE IMPORTANT PART - Add reply ID if replying
    if (replyToMessageId) {
      formData.append('reply_to_id', replyToMessageId);
    }

    // 🔥🔥🔥 ADD THIS - SEND MENTIONED USER IDs TO BACKEND
    if (window.mentionedUsers && window.mentionedUsers.length > 0) {
      // Send user IDs as JSON
      const userIds = window.mentionedUsers.map(function (u) { return u.id; });
      formData.append('mentioned_user_ids', JSON.stringify(userIds));
      console.log('📤 Mentioned user IDs:', userIds);
    }

    // 🔥🔥🔥 ADD THIS - SEND @ALL FLAG
    if (window.mentionAll) {
      formData.append('mention_all', 'true');
      console.log('📤 @all mentioned');
    }

    // Add file if exists
    let fileInput = $(".upload-attachment")[0];
    let filePreviewHtml = '';

    if (fileInput && fileInput.files && fileInput.files[0]) {
      formData.append('attachment', fileInput.files[0]);
      let fileName = fileInput.files[0].name;
      let fileType = fileInput.files[0].type;

      if (fileType.startsWith('image/')) {
        let reader = new FileReader();
        reader.onload = function (e) {
          filePreviewHtml = '<div class="chat-image" style="background-image: url(' + e.target.result + '); width:200px; height:200px; background-size:cover; background-position:center; border-radius:8px; margin-top:5px;"></div>';
          appendMessageWithPreview(text, filePreviewHtml);
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        filePreviewHtml = '<div class="file-attachment" style="padding:8px 12px; background:#f1f2f6; border-radius:6px; margin-top:5px; display:inline-block;"><i class="fas fa-paperclip"></i> ' + fileName + '</div>';
        appendMessageWithPreview(text, filePreviewHtml);
      }
    } else {
      appendMessageWithPreview(text, '');
    }

    function appendMessageWithPreview(messageText, previewHtml) {
      let messageHtml = messageText || '';
      if (previewHtml) {
        messageHtml += previewHtml;
      }

      let now = new Date();
      let timeDisplay = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Check for date divider
      let shouldAddDivider = false;
      let lastMessageDate = window._lastMessageDate || null;
      let currentDate = now.toDateString();

      if (lastMessageDate !== currentDate) {
        shouldAddDivider = true;
        window._lastMessageDate = currentDate;
      }

      if (shouldAddDivider) {
        $('.messages').append(`
            <div class="date-divider">
                <span>Today</span>
            </div>
        `);
      }

      $('.messages').append(`
        <div class="message-card mc-sender">
            <div class="message">
                <div class="message-user" style="font-size:11px; font-weight:600; color:#636e72; margin-bottom:2px; display:flex; align-items:center; justify-content:space-between;">
                    <span>You</span>
                    <span class="message-time" style="font-size:10px; font-weight:400; color:#b2bec3; margin-left:10px;">${timeDisplay}</span>
                </div>
               <div class="message-text">${messageText.replace(/@([a-zA-Z0-9_\s]+?)(?=\s|$|[.,!?;:])/g, '<span class="mention-text">@$1</span>')}</div>
            </div>
        </div>
    `);

      messageInput.val('');
      $(".upload-attachment").val('');
      $(".attachment-preview").remove();
      scrollToBottom(messagesContainer);
    }

    // Send the message
    $.ajax({
      url: '/groups/send-message',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        console.log('✅ Group message sent:', response);
        window.mentionedUsers = [];
        window.mentionAll = false;

        // 🔥 Replace the temporary message with the real one from server
        if (response.message) {
          // Remove the temporary message (the last one)
          var tempMessage = $('.messages .mc-sender:last');

          if (tempMessage.length) {
            // Get the real message data
            var realMsg = response.message;
            var timeDisplay = new Date(realMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Build reply HTML if any
            var replyHtml = '';
            if (realMsg.reply_to_id && replyToMessageText) {
              replyHtml = `
                <div class="message-reply-preview" style="background:rgba(102,126,234,0.15); padding:6px 10px; border-radius:6px; margin-bottom:4px; border-left:3px solid #764ba2; font-size:12px;">
                    <div style="color:#636e72; font-weight:600; margin-bottom:2px;">
                        <i class="fas fa-reply" style="font-size:10px; margin-right:4px;"></i>
                        Replying to ${replyToMessageSender || 'a message'}
                    </div>
                    <div style="color:#2d3436; word-wrap:break-word; font-size:13px;">
                        ${replyToMessageText || ''}
                    </div>
                </div>
                `;
            }

            // Build message content
            var msgHtml = realMsg.message || '';
            if (realMsg.attachment) {
              var fileUrl = '/storage/' + realMsg.attachment;
              var isImage = realMsg.attachment_type && realMsg.attachment_type.startsWith('image/');

              if (isImage) {
                msgHtml += '<div class="chat-image" style="background-image:url(' + fileUrl + ');max-width:200px;max-height:200px;background-size:cover;background-position:center;border-radius:8px;margin-top:5px;cursor:pointer;"></div>';
              } else {
                var fileName = realMsg.attachment.split('/').pop();
                msgHtml += '<div class="file-attachment" style="padding:6px 10px;background:#f1f2f6;border-radius:6px;margin-top:4px;display:inline-block;"><i class="fas fa-paperclip"></i> <a href="' + fileUrl + '" target="_blank">' + fileName + '</a></div>';
              }
            }

            // 🔥 REPLACE the temporary message with the real one
            tempMessage.replaceWith(`
                <div class="message-card mc-sender" data-message-id="${realMsg.id}" data-id="${realMsg.id}">
                    <div class="message">
                        <div class="message-user" style="font-size:11px; font-weight:600; color:#636e72; margin-bottom:2px; display:flex; align-items:center; justify-content:space-between;">
                            <span>You</span>
                            <span class="message-time" style="font-size:10px; font-weight:400; color:#b2bec3; margin-left:10px;">${timeDisplay}</span>
                        </div>
                        ${replyHtml}
                       <div class="message-text">${(realMsg.message || '').replace(/@([a-zA-Z0-9_\s]+?)(?=\s|$|[.,!?;:])/g, '<span class="mention-text">@$1</span>')}</div>
                    </div>
                </div>
            `);

            console.log('✅ Temporary message replaced with real ID:', realMsg.id);
            scrollToBottom(messagesContainer);
          }
        }

        // Clear the reply after sending
        cancelReply();
      },
      error: function (xhr) {
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

  window.sendMessage = function () {
    if (window.groupState.isGroupChat && window.groupState.currentGroupId) {
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
  setTimeout(function () {
    let activeGroup = $('.group-item.active');
    if (activeGroup.length) {
      let groupId = activeGroup.data('group-id');
      if (groupId) {
        console.log('🔄 Auto-loading active group:', groupId);
        activeGroup.click();
      }
    }
  }, 1000);

  // ============================================
  // EXPOSE FUNCTIONS GLOBALLY
  // ============================================
  window.loadGroups = loadGroups;
  window.loadGroupMessages = loadGroupMessages;
  window.enableGroupMessageInput = enableGroupMessageInput;
  window.clearGroupState = function () {
    window.groupState.isGroupChat = false;
    window.groupState.currentGroupId = null;
    window.groupState.activeTab = 'private';
    if (window.groupChannel) {
      window.groupChannel.unsubscribe();
      window.groupChannel = null;
    }
  };

  console.log('✅ Group chat system initialized!');
})();



////////////////////////  group side bar ///////////////////////////////////////////////

// ============================================
// GROUP MEMBERS FUNCTIONALITY - FIXED
// ============================================

// ============================================
// SHOW/HIDE GROUP INFO
// ============================================
function showGroupInfo() {
  $('#private-chat-info').hide();
  $('#group-chat-info').show();
  console.log('✅ Showing group info');
}

function showPrivateInfo() {
  $('#private-chat-info').show();
  $('#group-chat-info').hide();
  console.log('✅ Showing private info');
}

// ============================================
// LOAD GROUP INFO
// ============================================
function loadGroupInfo(groupId) {
  if (!groupId) return;
  console.log('📥 Loading group info for ID:', groupId);

  $.get('/groups/' + groupId + '/members')
    .done(function (response) {
      console.log('📋 Group info loaded:', response);
      let group = response.group;
      let image = group.image ? '/storage/' + group.image : '/images/group-default.png';

      $('#group-info-avatar').css('background-image', 'url(' + image + ')');
      $('#group-info-name').text(group.name);
      $('#group-info-member-count').text(response.members.length + ' members');

      // ============================================
      //  ADD THIS BACK - PUBLIC GROUP CHECK
      // ============================================

      // ✅ Check if group type exists, default to 'private'
      let groupType = group.type || 'private';
      console.log('🔍 Group Type:', groupType);

      //  CHECK IF USER CAN SEND MESSAGES
      let isPublic = groupType === 'public';
      let canSend = true;

      if (isPublic) {
        // Only Super Admin, Admin, Manager can send in public groups
        canSend = window.currentUser.isSuperAdmin ||
          window.currentUser.isAdmin ||
          window.currentUser.isManager;

      }

      // messenger-list-item SHOW OR HIDE SEND CARD
      if (canSend) {
        showSendCard();
      } else {
        hideSendCard();
      }


      if (response.is_admin || response.is_creator) {
        $('#group-admin-actions').show();
        $('#admin-action-labels').show();
        $('.show-group-members').show();
      } else {
        $('#group-admin-actions').hide();
        $('#admin-action-labels').hide();
        $('.show-group-members').hide();
      }

      $('#sidebar-group-avatar').css('background-image', 'url(' + image + ')');
      $('#sidebar-group-name').text(group.name);
      $('#sidebar-group-member-count').text(response.members.length + ' members');
      $('#sidebar-member-count-badge').text(response.members.length);

      window.currentGroupIdForMembers = groupId;
      renderMembersList(response.members, response.is_admin, response.is_creator);
    })
    .fail(function (error) {
      console.error('❌ Failed to load group info:', error);
    });
}

// ============================================
// SHOW SEND CARD
// ============================================
function showSendCard() {
  console.log('🔓 Showing send card');

  // Remove read-only message
  $('.read-only-message').remove();

  // Show the send card
  $('.messenger-sendCard').show();
  messageInput.removeAttr('readonly');
  $('#message-form button').removeAttr('disabled');
  $('.upload-attachment').removeAttr('disabled');
  messagesContainer.css('opacity', '1');
  setTimeout(function () {
    messageInput.focus();
  }, 300);
}

// ============================================
// HIDE SEND CARD - FOR PUBLIC GROUPS
// ============================================
function hideSendCard() {
  console.log('🔒 Hiding send card (read-only group)');

  // Hide the send card
  $('.messenger-sendCard').hide();

  // Remove existing read-only message
  $('.read-only-message').remove();

  // Show read-only message
  $('.messenger-messagingView').append(`
        <div class="read-only-message" style="padding:20px; text-align:center; background:#f8f9fa; border-bottom:1px solid #e9ecef; color:#6c757d; font-size:14px;">
            <i class="fas fa-lock" style="margin-right:8px; color:#667eea;"></i>
            This is a public group. Only Admins and Managers can send announcements.
        </div>
    `);
}



// ============================================
// RENDER MEMBERS LIST
// ============================================
function renderMembersList(members, isAdmin, isCreator) {
  let html = '';
  if (!members || members.length === 0) {
    html = '<div style="padding:20px;text-align:center;color:#b2bec3;font-size:13px;">No members found</div>';
    $('#group-members-list').html(html);
    return;
  }

  members.forEach(member => {
    let avatar = member.avatar ? '/storage/users-avatar/' + member.avatar : '/images/avatar.png';
    let isCurrentUser = member.id == auth_id;
    let isCreatorUser = member.is_creator;
    let isAdminUser = member.is_admin;
    let canRemove = (isAdmin || isCreator) && !isCreatorUser && !isCurrentUser;
    let canMakeAdmin = isCreator && !isCreatorUser && !isAdminUser && !isCurrentUser;

    html += `
            <div class="member-item" data-user-id="${member.id}">
                <div class="member-avatar" style="background-image: url('${avatar}');"></div>
                <div class="member-info">
                    <div class="member-name">
                        ${member.name}
                        ${isCreatorUser ? '<span class="member-badge creator">Creator</span>' : ''}
                        ${isAdminUser ? '<span class="member-badge admin">Admin</span>' : ''}
                        ${isCurrentUser ? '<span class="member-badge you">You</span>' : ''}
                    </div>
                    <div class="member-email">${member.email || ''}</div>
                </div>
                <div class="member-actions">
                    ${canMakeAdmin ? `<button class="member-action-btn make-admin" data-user-id="${member.id}">Make Admin</button>` : ''}
                    ${canRemove ? `<button class="member-action-btn remove" data-user-id="${member.id}">Remove</button>` : ''}
                </div>
            </div>
        `;
  });
  $('#group-members-list').html(html);
}

// ============================================
// SWITCH BETWEEN PRIVATE AND GROUP INFO
// ============================================
$(document).on('click', '.group-item', function () {
  let groupId = $(this).data('group-id');
  console.log('🔄 Group clicked, ID:', groupId);
  if (!groupId) return;
  showGroupInfo();
  loadGroupInfo(groupId);
});

$(document).on('click', '.messenger-list-item:not(.group-item)', function () {
  console.log('🔄 Private chat clicked');
  showPrivateInfo();
});

// ============================================
// OPEN/CLOSE MEMBERS SIDEBAR
// ============================================
$(document).on('click', '.show-group-members', function (e) {
  e.preventDefault();
  e.stopPropagation();
  console.log('👥 View Members clicked');
  let groupId = window.groupState.currentGroupId || window.currentGroupIdForMembers;
  if (groupId) {
    $('#group-members-sidebar-container').show();
    loadGroupInfo(groupId);
  } else {
    console.warn('⚠️ No group ID found');
  }
});

$(document).on('click', '.close-group-members-btn', function () {
  console.log('❌ Closing members sidebar');
  $('#group-members-sidebar-container').hide();
});

// ============================================
// ADD MEMBER MODAL - FIXED
// ============================================
let selectedUserIdForAdd = null;
let currentGroupMembers = [];
let isAddingMember = false;

// Open Add Member Modal
$(document).on('click', '.btn-add-member-action', function (e) {
  e.preventDefault();
  e.stopPropagation();
  console.log('➕ Add Member clicked');

  // Reset everything
  selectedUserIdForAdd = null;
  isAddingMember = false;
  $('#add-member-search').val('');
  $('#add-member-results').html('');
  $('#selected-member-info').hide();
  $('#confirm-add-member').prop('disabled', false).text('Add');

  // Get current group members to filter them out
  let groupId = window.currentGroupIdForMembers || window.groupState.currentGroupId;
  if (groupId) {
    $.get('/groups/' + groupId + '/members')
      .done(function (response) {
        currentGroupMembers = response.members.map(m => m.id);
        console.log('👥 Current members:', currentGroupMembers);
      });
  }

  $('#add-member-modal-overlay').fadeIn(200);
});

// Close Add Member Modal
$(document).on('click', '.close-add-member-modal', function () {
  if (!isAddingMember) {
    $('#add-member-modal-overlay').fadeOut(200);
    // Reset selection
    selectedUserIdForAdd = null;
    $('#selected-member-info').hide();
    $('#add-member-results').html('');
    $('#add-member-search').val('');
  }
});

// Close modal when clicking outside
$(document).on('click', function (e) {
  if ($('#add-member-modal-overlay').is(':visible') && !isAddingMember) {
    if (!$(e.target).closest('#add-member-modal-overlay > div').length &&
      !$(e.target).closest('.btn-add-member-action').length) {
      $('#add-member-modal-overlay').fadeOut(200);
      // Reset selection
      selectedUserIdForAdd = null;
      $('#selected-member-info').hide();
      $('#add-member-results').html('');
      $('#add-member-search').val('');
    }
  }
});

// Search users for adding - FILTER OUT EXISTING MEMBERS
let addMemberSearchTimeout;
$(document).on('keyup', '#add-member-search', function () {
  clearTimeout(addMemberSearchTimeout);
  let search = $(this).val().trim();
  if (search.length < 2) {
    $('#add-member-results').html('');
    return;
  }

  addMemberSearchTimeout = setTimeout(function () {
    console.log('🔍 Searching for:', search);

    $.get('/groups/users', { search: search })
      .done(function (users) {
        let html = '';

        if (!users || users.length === 0) {
          html = '<div style="padding:15px;text-align:center;color:#b2bec3;">No users found</div>';
        } else {
          let hasAvailableUsers = false;

          users.forEach(user => {
            // Check if user is already in the group
            if (currentGroupMembers.includes(user.id)) {
              // Show "already in group" message for this user
              let avatar = user.avatar ? '/storage/users-avatar/' + user.avatar : '/storage/users-avatar/avatar.png';
              html += `
                                <div class="group-user-item already-member" style="opacity:0.6; cursor:not-allowed;">
                                    <div class="group-user-avatar">
                                        <img src="${avatar}">
                                    </div>
                                    <div class="group-user-details">
                                        <div class="group-user-name">${user.name} <span style="color:#ff4757; font-size:10px; margin-left:8px;">(Already in group)</span></div>
                                        <div class="group-user-email">${user.email || ''}</div>
                                    </div>
                                </div>
                            `;
            } else {
              // Show available user (clickable)
              hasAvailableUsers = true;
              let avatar = user.avatar ? '/storage/users-avatar/' + user.avatar : '/storage/users-avatar/avatar.png';
              html += `
                                <div class="group-user-item add-member-item" data-id="${user.id}" data-name="${user.name}" data-avatar="${avatar}">
                                    <div class="group-user-avatar">
                                        <img src="${avatar}">
                                    </div>
                                    <div class="group-user-details">
                                        <div class="group-user-name">${user.name}</div>
                                        <div class="group-user-email">${user.email || ''}</div>
                                    </div>
                                </div>
                            `;
            }
          });

          if (!hasAvailableUsers) {
            // If all users are already in the group, show a message
            html = '<div style="padding:15px;text-align:center;color:#b2bec3;">All users are already in this group</div>';
          }
        }
        $('#add-member-results').html(html);
      })
      .fail(function (error) {
        console.error('❌ Search failed:', error);
        $('#add-member-results').html('<div style="padding:15px;text-align:center;color:red;">Error searching users</div>');
      });
  }, 300);
});

// Select user to add - MODAL STAYS OPEN
$(document).on('click', '.add-member-item', function (e) {
  e.preventDefault();
  e.stopPropagation();

  let id = $(this).data('id');
  let name = $(this).data('name');
  let avatar = $(this).data('avatar');

  // Don't do anything if it's already a member
  if (currentGroupMembers.includes(id)) {
    return;
  }

  selectedUserIdForAdd = id;

  // Show selected user
  $('#selected-member-name').html(
    '<img src="' + avatar + '" style="width:24px;height:24px;border-radius:50%;margin-right:8px;"> ' + name
  );
  $('#selected-member-info').show();

  // Hide search results
  $('#add-member-results').html('');

  // Clear search input
  $('#add-member-search').val('');

  console.log('✅ User selected:', name, '(ID:', id + ')');
});

// Confirm add member - ONLY CLOSE AFTER SUCCESS
$(document).on('click', '#confirm-add-member', function () {
  if (!selectedUserIdForAdd || !window.currentGroupIdForMembers) {
    alert('Please select a user first');
    return;
  }

  let userName = $('#selected-member-name').text().trim();
  console.log('✅ Confirming add member:', userName);

  isAddingMember = true;
  $(this).prop('disabled', true).text('Adding...');

  $.ajax({
    url: '/groups/' + window.currentGroupIdForMembers + '/add-member',
    type: 'POST',
    data: {
      _token: csrfToken,
      user_id: selectedUserIdForAdd
    },
    success: function (response) {
      if (response.success) {
        alert('✅ ' + userName + ' added successfully!');

        // Close modal ONLY on success
        $('#add-member-modal-overlay').fadeOut(200);

        // Refresh data
        loadGroupInfo(window.currentGroupIdForMembers);
        loadGroups();

        // Reset selection
        selectedUserIdForAdd = null;
        currentGroupMembers = [];
        isAddingMember = false;
        $('#selected-member-info').hide();
        $('#add-member-results').html('');
        $('#add-member-search').val('');
        $('#confirm-add-member').prop('disabled', false).text('Add');
      }
    },
    error: function (xhr) {
      let error = xhr.responseJSON?.error || 'Failed to add member';
      alert('❌ ' + error);
      isAddingMember = false;
      $('#confirm-add-member').prop('disabled', false).text('Add');
    }
  });
});

// ============================================
// REMOVE MEMBER
// ============================================
$(document).on('click', '.member-action-btn.remove', function () {
  let userId = $(this).data('user-id');
  let userName = $(this).closest('.member-item').find('.member-name').clone().children().remove().end().text().trim();
  if (!confirm('Remove "' + userName + '" from this group?')) return;
  console.log('🗑️ Removing member:', userId);
  $.ajax({
    url: '/groups/' + window.currentGroupIdForMembers + '/remove-member',
    type: 'POST',
    data: { _token: csrfToken, user_id: userId },
    success: function (response) {
      if (response.success) {
        alert('✅ Member removed successfully');
        loadGroupInfo(window.currentGroupIdForMembers);
        loadGroups();
      }
    },
    error: function (xhr) {
      let error = xhr.responseJSON?.error || 'Failed to remove member';
      alert('❌ ' + error);
    }
  });
});

// ============================================
// MAKE ADMIN
// ============================================
$(document).on('click', '.member-action-btn.make-admin', function () {
  let userId = $(this).data('user-id');
  let userName = $(this).closest('.member-item').find('.member-name').clone().children().remove().end().text().trim();
  if (!confirm('Make "' + userName + '" an admin?')) return;
  console.log('👑 Making admin:', userId);
  $.ajax({
    url: '/groups/' + window.currentGroupIdForMembers + '/make-admin',
    type: 'POST',
    data: { _token: csrfToken, user_id: userId },
    success: function (response) {
      if (response.success) {
        alert('✅ User is now an admin');
        loadGroupInfo(window.currentGroupIdForMembers);
      }
    },
    error: function (xhr) {
      let error = xhr.responseJSON?.error || 'Failed to make admin';
      alert('❌ ' + error);
    }
  });
});

// ============================================
// EDIT GROUP MODAL
// ============================================
$(document).on('click', '.btn-edit-group-action', function (e) {
  e.preventDefault();
  e.stopPropagation();
  console.log('✏️ Edit Group clicked');
  let groupName = $('#group-info-name').text();
  $('#edit-group-name-input').val(groupName);
  $('#edit-group-image-input').val('');
  $('#edit-group-modal-overlay').fadeIn(200);
});

$(document).on('click', '.close-edit-group-modal', function () {
  $('#edit-group-modal-overlay').fadeOut(200);
});

$(document).on('click', function (e) {
  if ($('#edit-group-modal-overlay').is(':visible')) {
    if (!$(e.target).closest('#edit-group-modal-overlay > div').length &&
      !$(e.target).closest('.btn-edit-group-action').length) {
      $('#edit-group-modal-overlay').fadeOut(200);
    }
  }
});

$(document).on('click', '#confirm-edit-group', function () {
  let name = $('#edit-group-name-input').val().trim();
  let image = $('#edit-group-image-input')[0].files[0];
  if (!name) {
    alert('Please enter a group name');
    return;
  }
  console.log('💾 Saving group:', name);
  $(this).prop('disabled', true).text('Saving...');
  let formData = new FormData();
  formData.append('name', name);
  if (image) formData.append('image', image);
  formData.append('_token', csrfToken);
  $.ajax({
    url: '/groups/' + window.currentGroupIdForMembers + '/update',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      if (response.success) {
        alert('✅ Group updated successfully');
        $('#edit-group-modal-overlay').fadeOut(200);
        loadGroupInfo(window.currentGroupIdForMembers);
        loadGroups();
        $('.user-name').text(response.group.name);
      }
    },
    error: function (xhr) {
      let error = xhr.responseJSON?.error || 'Failed to update group';
      alert('❌ ' + error);
    },
    complete: function () {
      $('#confirm-edit-group').prop('disabled', false).text('Save');
    }
  });
});

// ============================================
// LEAVE GROUP
// ============================================
$(document).on('click', '.leave-group-btn', function (e) {
  e.preventDefault();
  let groupName = $('#group-info-name').text();
  if (!confirm('Are you sure you want to leave "' + groupName + '"?')) return;
  console.log('🚪 Leaving group:', window.currentGroupIdForMembers);
  $(this).css('opacity', '0.6').find('i').addClass('fa-spin');
  $.ajax({
    url: '/groups/' + window.currentGroupIdForMembers + '/leave',
    type: 'POST',
    data: { _token: csrfToken },
    success: function (response) {
      if (response.success) {
        alert('✅ You have left the group');
        $('#group-members-sidebar-container').hide();
        loadGroups();
        $('.messages').html('<p class="message-hint center-el"><span>Select a chat to start messaging</span></p>');
        $('.user-name').text('Select a chat');
        $('.header-avatar').css('background-image', 'url(/images/avatar.png)');
        window.groupState.isGroupChat = false;
        window.groupState.currentGroupId = null;
        showPrivateInfo();
        $('.messenger-list-item').removeClass('m-list-active');
        if (window.groupChannel) {
          window.groupChannel.unsubscribe();
          window.groupChannel = null;
        }
      }
    },
    error: function (xhr) {
      let error = xhr.responseJSON?.error || 'Failed to leave group';
      alert('❌ ' + error);
    },
    complete: function () {
      $('.leave-group-btn').css('opacity', '1').find('i').removeClass('fa-spin');
    }
  });
});

// ============================================
// OVERRIDE IDinfo FOR GROUPS
// ============================================
var originalIDinfo = window.IDinfo;
window.IDinfo = function (id) {
  if (window.groupState.isGroupChat && window.groupState.currentGroupId) {
    console.log('⏭️ In group chat, skipping private info');
    return;
  }
  if (typeof originalIDinfo === 'function') {
    return originalIDinfo(id);
  }
};

console.log('✅ Group members functionality initialized!');
// ============================================
// MESSAGE REACTIONS - CLICK TO SHOW (Teams Style)
// ============================================

let currentReactionMessageId = null;
let currentReactionMessageType = null;
let pickerVisible = false;

console.log('🔧 Initializing message reactions...');

// ============================================
// SHOW REACTION PICKER ON CLICK
// ============================================
$(document).on('click', '.message-card', function (e) {
  // Don't show on user name, time, or existing reactions
  if ($(e.target).closest('.message-user, .message-time, .message-reactions, .reaction-badge, .actions, .delete-btn').length) {
    return;
  }

  // Don't show on your own messages
  let isOwnMessage = $(this).hasClass('mc-sender');
  if (isOwnMessage) {
    return;
  }

  let messageId = $(this).data('id') || $(this).data('message-id');

  // Better group detection
  let isGroup = false;
  if ($(this).closest('.group-chat-messages').length > 0) {
    isGroup = true;
  } else if (window.isGroupChat === true) {
    isGroup = true;
  } else if (window.groupState && window.groupState.isGroupChat === true) {
    isGroup = true;
  } else if ($(this).data('type') === 'group') {
    isGroup = true;
  }

  if (!messageId) {
    console.warn('⚠️ No message ID found');
    return;
  }

  // If clicking the same message, toggle picker off
  if (currentReactionMessageId === messageId && $('#reaction-picker').is(':visible')) {
    $('#reaction-picker').fadeOut(150);
    pickerVisible = false;
    currentReactionMessageId = null;
    return;
  }

  showReactionPicker(this, messageId, isGroup);
});

// ============================================
// SHOW REACTION PICKER - BELOW MESSAGE
// ============================================
function showReactionPicker(element, messageId, isGroup) {
  let rect = element.getBoundingClientRect();
  let picker = $('#reaction-picker');

  // Position BELOW the message
  let top = rect.bottom + 6;
  let left = rect.left;

  // If not enough space below, show above
  if (top + 50 > window.innerHeight) {
    top = rect.top - 50;
  }

  // Make sure it's in viewport horizontally
  if (left + 200 > window.innerWidth) {
    left = window.innerWidth - 210;
  }
  if (left < 5) left = 5;

  picker.css({
    top: top + 'px',
    left: left + 'px',
    position: 'fixed',
    zIndex: 999999
  }).fadeIn(150);

  pickerVisible = true;
  currentReactionMessageId = messageId;
  currentReactionMessageType = isGroup ? 'group' : 'private';

  console.log('📌 Picker shown:', { messageId, isGroup });

  // Hide picker after 3 seconds if no interaction
  clearTimeout(window.reactionPickerTimeout);
  window.reactionPickerTimeout = setTimeout(function () {
    if (!$('#reaction-picker').is(':hover')) {
      $('#reaction-picker').fadeOut(150);
      pickerVisible = false;
      currentReactionMessageId = null;
    }
  }, 3000);
}

// ============================================
// KEEP PICKER VISIBLE WHEN HOVERING OVER IT
// ============================================
$(document).on('mouseenter', '#reaction-picker', function () {
  clearTimeout(window.reactionPickerTimeout);
  pickerVisible = true;
});

$(document).on('mouseleave', '#reaction-picker', function () {
  $('#reaction-picker').fadeOut(150);
  pickerVisible = false;
  currentReactionMessageId = null;
});

// ============================================
// HIDE PICKER WHEN CLICKING ELSEWHERE
// ============================================
$(document).on('click', function (e) {
  if (!$(e.target).closest('#reaction-picker').length && !$(e.target).closest('.message-card').length) {
    $('#reaction-picker').fadeOut(150);
    pickerVisible = false;
    currentReactionMessageId = null;
  }
});

// ============================================
// REACTION BUTTON CLICK
// ============================================
$(document).on('click', '.reaction-btn', function () {
  let reaction = $(this).data('reaction');

  if (!currentReactionMessageId) {
    console.warn('⚠️ No message selected');
    return;
  }

  let url = currentReactionMessageType === 'group'
    ? '/reactions/toggle-group'
    : '/reactions/toggle-private';

  $.ajax({
    url: url,
    type: 'POST',
    data: {
      _token: csrfToken,
      message_id: currentReactionMessageId,
      reaction: reaction
    },
    success: function (response) {
      if (response.success) {
        updateReactionsDisplay(currentReactionMessageId, response.reactions);
        $('#reaction-picker').fadeOut(150);
        pickerVisible = false;
        currentReactionMessageId = null;
        console.log('✅ Reaction added:', reaction);
      }
    },
    error: function (xhr) {
      console.error('Failed to add reaction:', xhr);
      let errorMsg = xhr.responseJSON?.message || xhr.responseJSON?.error || 'Failed to add reaction';
      alert('❌ ' + errorMsg);
    }
  });
});

// ============================================
// UPDATE REACTIONS DISPLAY - FIXED WITH USER NAMES
// ============================================
function updateReactionsDisplay(messageId, reactions) {
  console.log('🔄 Updating reactions for message:', messageId);
  console.log('📊 Reactions data:', reactions);

  // 🔥 TRY MULTIPLE WAYS TO FIND THE MESSAGE CARD
  let messageCard = $(`.message-card[data-id="${messageId}"]`);

  if (!messageCard.length) {
    messageCard = $(`.message-card[data-message-id="${messageId}"]`);
  }

  if (!messageCard.length) {
    // 🔥 Search by data-id attribute (some messages use data-id)
    messageCard = $(`.message-card`).filter(function () {
      return $(this).data('id') == messageId || $(this).data('message-id') == messageId;
    });
  }

  if (!messageCard.length) {
    // 🔥 Search by looking at the DOM (for your own messages)
    // Your own messages have mc-sender class
    messageCard = $(`.mc-sender`).filter(function () {
      // Try to find the message id in the card
      return $(this).data('id') == messageId || $(this).data('message-id') == messageId;
    });
  }

  if (!messageCard.length) {
    console.warn('⚠️ Message card not found for ID:', messageId);
    console.log('🔍 Available message cards:', $('.message-card').map(function () {
      return {
        id: $(this).data('id'),
        messageId: $(this).data('message-id'),
        class: $(this).attr('class')
      };
    }).get());
    return;
  }

  console.log('✅ Message card found for reaction:', messageId);

  // Remove existing reactions container
  messageCard.find('.message-reactions').remove();

  if (!reactions || reactions.length === 0) {
    console.log('ℹ️ No reactions to display');
    return;
  }

  // Group reactions by emoji
  let grouped = {};
  reactions.forEach(function (r) {
    if (!grouped[r.reaction]) {
      grouped[r.reaction] = {
        users: [],
        count: 0
      };
    }

    let userName = 'Unknown';
    if (r.user) {
      userName = r.user.name || 'Unknown';
    } else if (r.user_name) {
      userName = r.user_name;
    } else if (r.name) {
      userName = r.name;
    }

    grouped[r.reaction].users.push({
      id: r.user_id,
      name: userName
    });
    grouped[r.reaction].count++;
  });

  let html = '<div class="message-reactions" style="display:flex; gap:3px; margin-top:4px; flex-wrap:wrap;">';

  for (let emoji in grouped) {
    let reactionData = grouped[emoji];
    let count = reactionData.count;
    let users = reactionData.users;
    let hasUserReacted = users.some(function (u) { return u.id == auth_id; });
    let userNames = users.map(function (u) { return u.name; }).join(', ');

    html += `
            <span class="reaction-badge ${hasUserReacted ? 'active' : ''}" 
                  data-message-id="${messageId}" 
                  data-reaction="${emoji}"
                  data-users="${userNames}"
                  data-user-count="${count}"
                  style="display:inline-flex; align-items:center; gap:2px; padding:2px 8px; background:${hasUserReacted ? '#e8f5e9' : '#f1f2f6'}; border-radius:12px; font-size:13px; cursor:pointer; border:${hasUserReacted ? '1px solid #4caf50' : '1px solid transparent'}; transition:all 0.2s; position:relative;">
                ${emoji} ${count}
            </span>
        `;
  }
  html += '</div>';

  messageCard.find('.message').append(html);
  console.log('✅ Reactions updated for message:', messageId);
}

// ============================================
// CLICK ON REACTION BADGE TO TOGGLE
// ============================================
$(document).on('click', '.reaction-badge', function (e) {
  e.stopPropagation();
  let messageId = $(this).data('message-id');
  let reaction = $(this).data('reaction');
  let isGroup = $(this).closest('.group-chat-messages').length > 0 || window.isGroupChat;

  let url = isGroup ? '/reactions/toggle-group' : '/reactions/toggle-private';

  $.ajax({
    url: url,
    type: 'POST',
    data: {
      _token: csrfToken,
      message_id: messageId,
      reaction: reaction
    },
    success: function (response) {
      if (response.success) {
        updateReactionsDisplay(messageId, response.reactions);
      }
    },
    error: function (xhr) {
      console.error('Failed to toggle reaction:', xhr);
    }
  });
});

// ============================================
// LOAD EXISTING REACTIONS FOR MESSAGES
// ============================================
function loadMessageReactions(messageId, type) {
  $.ajax({
    url: '/reactions/get',
    type: 'POST',
    data: {
      _token: csrfToken,
      message_id: messageId,
      type: type
    },
    success: function (response) {
      if (response.success && response.reactions.length > 0) {
        updateReactionsDisplay(messageId, response.reactions);
      }
    },
    error: function (xhr) {
      console.error('Failed to load reactions:', xhr);
    }
  });
}

// ============================================
// LOAD REACTIONS FOR ALL MESSAGES
// ============================================
function loadAllMessageReactions(container, type) {
  $(container).find('.message-card').each(function () {
    let messageId = $(this).data('id') || $(this).data('message-id');
    if (messageId) {
      loadMessageReactions(messageId, type);
    }
  });
}

// ============================================
// PUSHER - PRIVATE MESSAGE REACTIONS
// ============================================
// if (typeof pusher !== 'undefined') {
//   pusher.bind('App\\Events\\MessageReactionEvent', function (data) {
//     if (data.type === 'private') {
//       updateReactionsDisplay(data.message_id, data.reactions);
//       console.log('✅ Private reaction received:', data);
//     }
//   });
// }

// ============================================
// PUSHER - REACTIONS (PRIVATE & GROUP) - KEEP THIS
// ============================================
if (typeof pusher !== 'undefined') {
  // Unbind any existing handlers to prevent duplicates
  pusher.unbind('App\\Events\\MessageReactionEvent');

  // Bind for ALL reactions (both private and group)
  pusher.bind('App\\Events\\MessageReactionEvent', function (data) {
    console.log('📨 Reaction event received:', data);
    console.log('📝 Type:', data.type);
    console.log('📊 Message ID:', data.message_id);
    console.log('📊 Reactions count:', data.reactions?.length || 0);

    // 🔥 FIX: Check if we have a valid message_id
    if (!data.message_id) {
      console.warn('⚠️ No message_id in reaction event');
      return;
    }

    // 🔥 FIX: Check if we have reactions data
    if (!data.reactions || data.reactions.length === 0) {
      console.log('ℹ️ No reactions in event, but that\'s okay - will update with empty state');
      // Still update to clear reactions
      updateReactionsDisplay(data.message_id, []);
      return;
    }

    // Update reactions for BOTH private and group
    if (data.type === 'private' || data.type === 'group') {
      updateReactionsDisplay(data.message_id, data.reactions);
      console.log('✅ ' + data.type + ' reaction updated');
    }
  });

  console.log('✅ Global reaction handler bound for private AND group');
}

// ============================================
// PUSHER - GROUP MESSAGE REACTIONS
// ============================================
// function bindGroupReactions(channel) {
//   if (!channel) return;
//   channel.bind('App\\Events\\MessageReactionEvent', function (data) {
//     if (data.type === 'group') {
//       updateReactionsDisplay(data.message_id, data.reactions);
//       console.log('✅ Group reaction received:', data);
//     }
//   });
// }

// ============================================
// PUSHER - GROUP MESSAGE REACTIONS (OBSOLETE - handled globally)
// ============================================
function bindGroupReactions(channel) {
  // This function is no longer needed because reactions are handled globally
  // But keep it to prevent errors if called elsewhere
  console.log('ℹ️ Reactions are now handled globally');
  return true;
}

console.log('✅ Message reactions initialized!');



// ============================================
// PASTE SCREENSHOT INTO INPUT FIELD
// ============================================

$(document).on('paste', function (e) {
  // Only handle paste if we're focused on the message input
  if (!messageInput.is(':focus')) {
    return;
  }

  var clipboardData = e.originalEvent.clipboardData || window.clipboardData;
  if (!clipboardData) return;

  var items = clipboardData.items;
  if (!items) return;

  // Check if there's an image in the clipboard
  var imageFile = null;
  var hasImage = false;

  for (var i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      hasImage = true;
      imageFile = items[i].getAsFile();
      break;
    }
  }

  // If no image found, return
  if (!hasImage || !imageFile) return;

  // Prevent default paste behavior
  e.preventDefault();

  // 🔥 Create a File object and attach it to the file input
  var fileInput = $('.upload-attachment')[0];
  if (!fileInput) return;

  // Create a new FileList containing the pasted image
  var dataTransfer = new DataTransfer();
  dataTransfer.items.add(imageFile);
  fileInput.files = dataTransfer.files;

  // 🔥 Trigger change event to show preview
  $(fileInput).trigger('change');

  console.log('📸 Screenshot pasted into input field!');
});


// ============================================
// REACTION TOOLTIP - SHOW USERS WHO REACTED
// ============================================

let tooltipTimeout;

// Show tooltip on hover
$(document).on('mouseenter', '.reaction-badge', function (e) {
  clearTimeout(tooltipTimeout);

  let emoji = $(this).data('reaction');
  let count = $(this).data('user-count') || 0;
  let users = $(this).data('users') || '';

  // Get position
  let rect = this.getBoundingClientRect();
  let tooltip = $('#reaction-tooltip');

  // Update tooltip content
  $('#reaction-tooltip-emoji').text(emoji);
  $('#reaction-tooltip-count').text(count + ' person' + (count > 1 ? 's' : ''));

  // Format user names
  let userList = users.split(', ');
  let userHtml = '';
  if (userList.length > 0) {
    userHtml = '<div style="display:flex; flex-direction:column; gap:2px;">';
    userList.forEach(function (name) {
      userHtml += '<span style="padding:2px 4px; border-radius:4px;">' + name + '</span>';
    });
    userHtml += '</div>';
  }
  $('#reaction-tooltip-users').html(userHtml);

  // Position tooltip
  let top = rect.top - 10;
  let left = rect.left + (rect.width / 2);

  // Check if tooltip fits above
  if (top - 100 < 0) {
    top = rect.bottom + 10;
  }

  // Center the tooltip horizontally
  left = left - (tooltip.outerWidth() / 2);

  // Make sure it's in viewport
  if (left < 10) left = 10;
  if (left + tooltip.outerWidth() > window.innerWidth - 10) {
    left = window.innerWidth - tooltip.outerWidth() - 10;
  }

  tooltip.css({
    top: top + 'px',
    left: left + 'px'
  }).fadeIn(200);
});

// Hide tooltip on mouse leave
$(document).on('mouseleave', '.reaction-badge', function () {
  clearTimeout(tooltipTimeout);
  tooltipTimeout = setTimeout(function () {
    $('#reaction-tooltip').fadeOut(200);
  }, 300);
});

// Keep tooltip visible when hovering over it
$(document).on('mouseenter', '#reaction-tooltip', function () {
  clearTimeout(tooltipTimeout);
});

$(document).on('mouseleave', '#reaction-tooltip', function () {
  $('#reaction-tooltip').fadeOut(200);
});

// Hide tooltip when clicking anywhere
$(document).on('click', function () {
  $('#reaction-tooltip').fadeOut(200);
});

// ============================================
// REPLY TO MESSAGE - ADD THIS AT THE BOTTOM
// ============================================

let replyToMessageId = null;
let replyToMessageSender = null;
let replyToMessageText = null;

// When someone clicks the reply button
$(document).on('click', '.reply-btn', function (e) {
  e.stopPropagation();



  let messageId = $(this).data('message-id');
  let senderName = $(this).data('sender-name');
  let messageText = $(this).data('message-text');

  // Find the message card
  let messageCard = $(`.message-card[data-message-id="${messageId}"]`);
  if (!messageCard.length) {
    messageCard = $(`.message-card[data-id="${messageId}"]`);
  }

  // Get the message text
  let textElement = messageCard.find('.message-text');
  let originalText = textElement.length ? textElement.text().trim() : '';

  // If message has attachment but no text
  if (!originalText && messageCard.find('.chat-image').length) {
    originalText = '📷 Image';
  } else if (!originalText && messageCard.find('.file-attachment').length) {
    originalText = '📎 File';
  }

  // Shorten long messages
  if (originalText.length > 60) {
    originalText = originalText.substring(0, 60) + '...';
  }

  // Store the reply info
  replyToMessageId = messageId;
  replyToMessageSender = senderName || 'Unknown';
  replyToMessageText = originalText || 'Message';

  // Show the reply preview
  showReplyPreview(replyToMessageSender, replyToMessageText);
});

// Show reply preview above the input
function showReplyPreview(sender, message) {
  $('.reply-preview-container').remove();

  // 🔥 Make sure we have valid data
  if (!sender) sender = 'Unknown';
  if (!message) message = 'Message';

  let previewHtml = `
        <div class="reply-preview-container" style="display:flex; align-items:center; justify-content:space-between; background:#f8f9fa; padding:8px 12px; border-radius:8px; margin-bottom:6px; border-left:3px solid #667eea;">
            <div style="flex:1; overflow:hidden;">
                <div style="font-size:12px; font-weight:600; color:#636e72;">
                    <i class="fas fa-reply" style="font-size:10px; margin-right:4px;"></i>
                    Replying to ${sender}
                </div>
                <div style="font-size:13px; color:#2d3436; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${message}
                </div>
            </div>
            <button class="cancel-reply-btn" style="background:none; border:none; color:#b2bec3; cursor:pointer; font-size:16px; padding:4px 8px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  $('.messenger-sendCard').prepend(previewHtml);
  messageInput.focus();
}

// Cancel reply
$(document).on('click', '.cancel-reply-btn', function () {
  cancelReply();
});

function cancelReply() {
  replyToMessageId = null;
  replyToMessageSender = null;
  replyToMessageText = null;
  $('.reply-preview-container').remove();
}

console.log('✅ Reply feature loaded!');

// ============================================
// PAGINATION / INFINITE SCROLL FOR GROUP MESSAGES
// ============================================

// 🔥 These variables are already defined earlier, but let's make sure they exist
if (typeof groupMessagesPage === 'undefined') {
  var groupMessagesPage = 1;
}
if (typeof groupNoMoreMessages === 'undefined') {
  var groupNoMoreMessages = false;
}
if (typeof isLoadingMore === 'undefined') {
  var isLoadingMore = false;
}
if (typeof currentGroupId === 'undefined') {
  var currentGroupId = null;
}

// 🔥 OVERRIDE the loadGroupMessages function with pagination support
// Find the existing function and replace it, or add this as an enhancement

// Store the original function if it exists
var originalLoadGroupMessages = window.loadGroupMessages || function () { };

// 🔥 NEW: Enhanced loadGroupMessages with pagination
window.loadGroupMessages = function (groupId, loadMore = false) {
  if (!groupId) return;

  // Prevent loading if no more messages or already loading
  if (loadMore && (groupNoMoreMessages || isLoadingMore)) {
    console.log('⏭️ No more messages or already loading');
    return;
  }

  // If switching to a new group, reset pagination
  if (currentGroupId !== groupId) {
    currentGroupId = groupId;
    groupMessagesPage = 1;
    groupNoMoreMessages = false;
    isLoadingMore = false;
  }

  console.log('📥 Loading messages for group:', groupId, 'Page:', groupMessagesPage, 'Load More:', loadMore);

  if (!loadMore) {
    // First load - Show loading indicator
    $('.messages').html('<div style="text-align:center;padding:40px;color:#999;">Loading messages...</div>');
  } else {
    // Loading more - Show loading indicator at top
    isLoadingMore = true;
    if ($('#loading-more').length === 0) {
      $('.messages').prepend('<div id="loading-more" style="text-align:center;padding:10px;color:#999;font-size:13px;">Loading older messages...</div>');
    }
  }

  // Make AJAX request with page parameter
  $.get('/groups/' + groupId + '/messages', {
    page: groupMessagesPage
  }, function (response) {
    console.log('✅ Messages loaded for group:', groupId);
    console.log('📊 Page:', response.current_page || groupMessagesPage, 'of', response.last_page || '?');
    console.log('📊 Total messages:', response.total || '?');
    console.log('📊 Has more:', response.has_more !== undefined ? response.has_more : true);

    // Remove loading indicators
    $('#loading-more').remove();

    // Get current scroll height before adding new messages
    let oldScrollHeight = 0;
    if (loadMore) {
      let container = $('.messages-container')[0] || $('.m-body.messages-container')[0];
      if (container) {
        oldScrollHeight = container.scrollHeight;
      }
    }

    if (loadMore) {
      // LOAD MORE - Prepend older messages
      $('.messages').prepend(response.messages_html);

      // Maintain scroll position
      let container = $('.messages-container')[0] || $('.m-body.messages-container')[0];
      if (container) {
        let newScrollHeight = container.scrollHeight;
        let heightDifference = newScrollHeight - oldScrollHeight;
        if (heightDifference > 0) {
          container.scrollTop = heightDifference;
        }
      }
    } else {
      // FIRST LOAD - Replace all messages
      $('.messages').empty();
      $('.messages').html(response.messages_html);
    }

    // Update group info in header
    if (response.group) {
      $('.user-name').text(response.group.name);

      if (response.group.image) {
        $('.header-avatar').css('background-image', 'url(/storage/' + response.group.image + ')');
      } else {
        $('.header-avatar').css('background-image', 'url(/images/group-default.png)');
      }
    }

    // Hide message hint if there are messages
    if ($('.messages .message-card').length > 0) {
      $('.messages').find('.message-hint').hide();
    }

    console.log('📨 Messages rendered:', $('.messages .message-card').length);

    // Update pagination state
    if (response.has_more !== undefined) {
      groupNoMoreMessages = !response.has_more;
    } else if (response.last_page !== undefined) {
      groupNoMoreMessages = groupMessagesPage >= response.last_page;
    } else {
      // Fallback: if no pagination data, assume no more messages
      groupNoMoreMessages = true;
    }

    // Increment page for next load
    if (!groupNoMoreMessages) {
      groupMessagesPage += 1;
    }

    console.log('📊 No more messages:', groupNoMoreMessages);
    console.log('📊 Next page:', groupMessagesPage);


    // Scroll to bottom only on first load
    if (!loadMore) {
      setTimeout(function () {
        // 🔥 Use Chatify's scroll function
        messagesContainer.stop().animate({
          scrollTop: messagesContainer[0].scrollHeight
        }, 300);
      }, 300);
    }

    isLoadingMore = false;

  }).fail(function (xhr) {
    console.error('❌ Failed to load group messages:', xhr);

    // Remove loading indicators
    $('#loading-more').remove();

    if (loadMore) {
      // Show error briefly at top
      $('.messages').prepend('<div style="text-align:center;padding:10px;color:red;font-size:13px;">Failed to load older messages</div>');
      setTimeout(function () {
        $('.messages').find('div:contains("Failed to load older messages")').remove();
      }, 3000);
    } else {
      $('.messages').html('<div style="text-align:center;padding:40px;color:red;">Failed to load messages</div>');
    }

    isLoadingMore = false;
  });
};

// ============================================
// INFINITE SCROLL LISTENER - FIXED
// ============================================

// 🔥 Remove any existing scroll listeners to prevent duplicates
$(document).off('scroll', '.m-body.messages-container');
$(document).off('scroll', '.messages-container');

// 🔥 Add scroll listener to the correct container
$(document).on('scroll', '.m-body.messages-container, .messages-container', function () {
  // Check if we're in a group chat
  if (!window.groupState || !window.groupState.isGroupChat) {
    return;
  }

  let groupId = window.groupState.currentGroupId;
  if (!groupId) {
    return;
  }

  // Check if scrolled to top (within 50px)
  let scrollTop = $(this).scrollTop();
  if (scrollTop <= 50) {
    if (!groupNoMoreMessages && !isLoadingMore) {
      console.log('🔄 Loading older messages (scrolled to top)... Scroll position:', scrollTop);
      window.loadGroupMessages(groupId, true);
    }
  }
});

// ============================================
// ALSO ADD SCROLL LISTENER TO THE CONTAINER DIRECTLY
// ============================================

// This ensures the listener works even if the container is dynamically loaded
$(document).ready(function () {
  // Try to attach listener after a small delay
  setTimeout(function () {
    let container = $('.m-body.messages-container');
    if (container.length) {
      container.off('scroll.pagination');
      container.on('scroll.pagination', function () {
        if (!window.groupState || !window.groupState.isGroupChat) {
          return;
        }

        let groupId = window.groupState.currentGroupId;
        if (!groupId) {
          return;
        }

        let scrollTop = $(this).scrollTop();
        if (scrollTop <= 50) {
          if (!groupNoMoreMessages && !isLoadingMore) {
            console.log('🔄 Loading older messages (direct listener)... Scroll position:', scrollTop);
            window.loadGroupMessages(groupId, true);
          }
        }
      });
      console.log('✅ Pagination scroll listener attached to:', container);
    }
  }, 2000);
});

console.log('✅ Pagination/Infinite scroll initialized!');


// ============================================
// DETECT @ IN MESSAGE INPUT
// ============================================

$(document).on('input', '#message-form .m-send', function () {
  const text = $(this).val();
  const cursorPos = this.selectionStart;

  // Find @ symbol
  const atIndex = text.lastIndexOf('@', cursorPos);
  if (atIndex !== -1) {
    const query = text.substring(atIndex + 1, cursorPos);
    // If no space after @ and not empty
    if (!query.includes(' ') && query.length >= 0) {
      currentMentionQuery = query;
      showMentionSuggestions(query);
      return;
    }
  }
  hideMentionSuggestions();
});

// ============================================
// SHOW MENTION SUGGESTIONS
// ============================================

function showMentionSuggestions(query) {
  clearTimeout(mentionTimeout);

  mentionTimeout = setTimeout(function () {
    const isGroup = window.groupState?.isGroupChat || false;
    const groupId = window.groupState?.currentGroupId;

    if (!isGroup || !groupId) {
      // 🔥 For private chat - get the other user
      const otherUserId = getMessengerId();
      if (otherUserId) {
        $.ajax({
          url: `/users/${otherUserId}`,
          type: 'GET',
          success: function (user) {
            let users = [user];
            if (query) {
              users = users.filter(function (u) {
                return u.name.toLowerCase().includes(query.toLowerCase());
              });
            }
            renderMentionSuggestions(users, query);
          },
          error: function () {
            console.error('Failed to fetch user');
          }
        });
      }
      return;
    }

    // 🔥 GET GROUP MEMBERS
    $.ajax({
      url: `/groups/${groupId}/members`,
      type: 'GET',
      success: function (response) {
        let users = response.members.map(function (member) {
          return {
            id: member.id,
            name: member.name,
            email: member.email || '',
            avatar: member.avatar || null
          };
        });

        // 🔥 FILTER by query
        if (query) {
          users = users.filter(function (user) {
            return user.name.toLowerCase().includes(query.toLowerCase()) ||
              user.email.toLowerCase().includes(query.toLowerCase());
          });
        }

        renderMentionSuggestions(users, query);
      },
      error: function () {
        console.error('Failed to fetch users');
      }
    });
  }, 300);
}

// ============================================
// RENDER MENTION SUGGESTIONS - PERFECT POSITIONING
// ============================================

function renderMentionSuggestions(users, query) {
  // Remove old suggestions
  $('#mention-suggestions').remove();

  if (!users || users.length === 0) {
    // 🔥 Only show @all in GROUP chat
    if (window.groupState?.isGroupChat) {
      showAllMentionOption();
    }
    return;
  }

  // 🔥 Get the input position
  const input = messageInput[0];
  if (!input) {
    console.warn('⚠️ Message input not found');
    return;
  }

  const rect = input.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // 🔥 Calculate available space
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;
  const dropdownHeight = Math.min(220, users.length * 45 + 50); // Estimate height



  // 🔥 Decide where to show the dropdown
  let top, maxHeight;
  const isMobile = viewportWidth < 768;

  // 🔥 If there's more space above, show above
  if (spaceAbove > spaceBelow && spaceAbove > dropdownHeight) {
    // Show ABOVE the input
    top = rect.top - dropdownHeight - 5;
    maxHeight = Math.min(220, spaceAbove - 20);
    console.log('⬆️ Showing ABOVE input');
  } else {
    // Show BELOW the input
    top = rect.bottom + 5;
    maxHeight = Math.min(220, spaceBelow - 20);
    console.log('⬇️ Showing BELOW input');
  }

  // 🔥 Ensure dropdown doesn't go off screen
  if (top < 10) {
    top = 10;
    maxHeight = viewportHeight - 20;
  }

  if (top + maxHeight > viewportHeight - 10) {
    maxHeight = viewportHeight - top - 10;
  }

  // 🔥 Horizontal positioning
  let left = rect.left;
  const dropdownWidth = isMobile ? Math.min(viewportWidth - 20, 280) : Math.min(300, viewportWidth - 20);

  if (left + dropdownWidth > viewportWidth - 10) {
    left = viewportWidth - dropdownWidth - 10;
  }
  if (left < 10) {
    left = 10;
  }

  console.log('📍 Final position:', { top, left, maxHeight, dropdownWidth });

  let html = `
        <div id="mention-suggestions" style="
            position:fixed !important;
            top:${Math.round(top)}px !important;
            left:${Math.round(left)}px !important;
            background:white !important;
            border-radius:12px !important;
            box-shadow:0 10px 40px rgba(0,0,0,0.2) !important;
            border:1px solid #e9ecef !important;
            z-index:9999999 !important;
            max-height:${Math.round(maxHeight)}px !important;
            overflow-y:auto !important;
            min-width:${isMobile ? '200' : '250'}px !important;
            max-width:${isMobile ? 'calc(100vw - 40px)' : '350px'} !important;
            width:auto !important;
            padding:5px 0 !important;
        ">
    `;

  // 🔥 ADD @ALL OPTION
  if (window.groupState?.isGroupChat) {
    html += `
            <div class="mention-user-item mention-all-item" data-user-id="all" data-user-name="all" style="
                display:flex !important;
                align-items:center !important;
                padding:10px 14px !important;
                cursor:pointer !important;
                transition:background 0.15s !important;
                border-bottom:1px solid #f1f2f6 !important;
            ">
                <div style="
                    width:32px !important;
                    height:32px !important;
                    border-radius:50% !important;
                    background:#667eea !important;
                    display:flex !important;
                    align-items:center !important;
                    justify-content:center !important;
                    margin-right:10px !important;
                    color:white !important;
                    font-size:14px !important;
                    font-weight:bold !important;
                    flex-shrink:0 !important;
                ">
                    📢
                </div>
                <div>
                    <div style="font-size:14px !important;font-weight:600 !important;color:#667eea !important;">@all</div>
                    <div style="font-size:11px !important;color:#b2bec3 !important;">Mention everyone in this group</div>
                </div>
            </div>
        `;
  }

  // 🔥 SHOW USERS
  users.forEach(function (user) {
    const avatar = user.avatar ? `/storage/users-avatar/${user.avatar}` : '/images/avatar.png';
    const highlightedName = user.name.replace(new RegExp(query, 'gi'), function (match) {
      return '<strong style="color:#667eea;">' + match + '</strong>';
    });

    html += `
            <div class="mention-user-item" data-user-id="${user.id}" data-user-name="${user.name}" style="
                display:flex !important;
                align-items:center !important;
                padding:8px 14px !important;
                cursor:pointer !important;
                transition:background 0.15s !important;
            ">
                <img src="${avatar}" style="
                    width:32px !important;
                    height:32px !important;
                    border-radius:50% !important;
                    margin-right:10px !important;
                    object-fit:cover !important;
                    flex-shrink:0 !important;
                ">
                <div style="flex:1 !important; min-width:0 !important;">
                    <div style="font-size:13px !important;font-weight:500 !important;color:#2d3436 !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;">${highlightedName}</div>
                    <div style="font-size:11px !important;color:#b2bec3 !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;">${user.email || ''}</div>
                </div>
            </div>
        `;
  });

  html += '</div>';
  $('body').append(html);

  // 🔥 Hover effect
  $('#mention-suggestions .mention-user-item').on('mouseenter', function () {
    $(this).css('background', '#f8f9fa');
  }).on('mouseleave', function () {
    $(this).css('background', 'transparent');
  });

  // 🔥 CLICK - Insert @all
  $('#mention-suggestions .mention-all-item').on('click', function () {

    insertMentionWithId('all', 'all');
  });

  // 🔥 CLICK - Insert user
  $('#mention-suggestions .mention-user-item').on('click', function () {

    const userId = $(this).data('user-id');
    const userName = $(this).data('user-name');
    console.log('userId:', userId, 'userName:', userName);
    insertMentionWithId(userId, userName);
  });
}
// ============================================
// SHOW @ALL OPTION - PERFECT POSITIONING
// ============================================

function showAllMentionOption() {


  // Remove old suggestions
  $('#mention-suggestions').remove();

  // 🔥 Get the input position
  const input = messageInput[0];
  if (!input) {
    console.warn('⚠️ Message input not found');
    return;
  }

  const rect = input.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // 🔥 Calculate available space
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;
  const dropdownHeight = 70; // @all option is shorter

  console.log('📐 @all Space calculation:', {
    spaceAbove,
    spaceBelow,
    dropdownHeight,
    viewportHeight
  });

  // 🔥 Decide where to show
  let top;
  const isMobile = viewportWidth < 768;

  if (spaceAbove > spaceBelow && spaceAbove > dropdownHeight) {
    // Show ABOVE
    top = rect.top - dropdownHeight - 5;
    console.log('⬆️ Showing @all ABOVE input');
  } else {
    // Show BELOW
    top = rect.bottom + 5;
    console.log('⬇️ Showing @all BELOW input');
  }

  // 🔥 Ensure it's visible
  if (top < 10) {
    top = 10;
  }
  if (top + dropdownHeight > viewportHeight - 10) {
    top = viewportHeight - dropdownHeight - 10;
  }

  // 🔥 Horizontal positioning
  let left = rect.left;
  const dropdownWidth = isMobile ? Math.min(viewportWidth - 20, 220) : 250;

  if (left + dropdownWidth > viewportWidth - 10) {
    left = viewportWidth - dropdownWidth - 10;
  }
  if (left < 10) {
    left = 10;
  }

  console.log('📍 @all Final position:', { top, left });

  let html = `
        <div id="mention-suggestions" style="
            position:fixed !important;
            top:${Math.round(top)}px !important;
            left:${Math.round(left)}px !important;
            background:white !important;
            border-radius:12px !important;
            box-shadow:0 10px 40px rgba(0,0,0,0.2) !important;
            border:1px solid #e9ecef !important;
            z-index:9999999 !important;
            min-width:${isMobile ? '180' : '220'}px !important;
            max-width:${isMobile ? 'calc(100vw - 40px)' : '280px'} !important;
            width:auto !important;
            padding:5px 0 !important;
        ">
            <div class="mention-all-item" style="
                display:flex !important;
                align-items:center !important;
                padding:10px 14px !important;
                cursor:pointer !important;
                transition:background 0.15s !important;
            ">
                <div style="
                    width:32px !important;
                    height:32px !important;
                    border-radius:50% !important;
                    background:#667eea !important;
                    display:flex !important;
                    align-items:center !important;
                    justify-content:center !important;
                    margin-right:10px !important;
                    color:white !important;
                    font-size:14px !important;
                    font-weight:bold !important;
                    flex-shrink:0 !important;
                ">
                    📢
                </div>
                <div>
                    <div style="font-size:14px !important;font-weight:600 !important;color:#667eea !important;">@all</div>
                    <div style="font-size:11px !important;color:#b2bec3 !important;">Mention everyone in this group</div>
                </div>
            </div>
        </div>
    `;

  $('body').append(html);

  // Hover effect
  $('#mention-suggestions .mention-all-item').on('mouseenter', function () {
    $(this).css('background', '#f8f9fa');
  }).on('mouseleave', function () {
    $(this).css('background', 'transparent');
  });

  // 🔥 CLICK
  $('#mention-suggestions .mention-all-item').on('click', function () {
    console.log('🔥🔥🔥 @all CLICKED from showAllMentionOption!');
    insertMentionWithId('all', 'all');
  });
}
// ============================================
// INSERT MENTION WITH USER ID
// ============================================
function insertMentionWithId(userId, userName) {

  // 🔥 MAKE SURE window.mentionedUsers EXISTS
  if (typeof window.mentionedUsers === 'undefined') {
    window.mentionedUsers = [];
  }

  const input = messageInput[0];
  const text = input.value;
  const cursorPos = input.selectionStart;

  const atIndex = text.lastIndexOf('@', cursorPos);
  if (atIndex === -1) {
    return;
  }

  let insertText;

  // 🔥🔥🔥 FOR @ALL
  if (userId === 'all') {
    window.mentionAll = true;  // 🔥 THIS MUST BE SET
    window.mentionedUsers = [];
    insertText = '@all ';
  } else {
    // 🔥 Add user ID to list
    window.mentionedUsers = window.mentionedUsers.filter(function (u) {
      return u.id !== userId;
    });
    window.mentionedUsers.push({
      id: userId,
      name: userName
    });
    insertText = '@' + userName + ' ';
  }

  // Insert into input
  const newText = text.substring(0, atIndex) + insertText + text.substring(cursorPos);
  messageInput.val(newText);

  const newCursorPos = atIndex + insertText.length;
  input.selectionStart = input.selectionEnd = newCursorPos;
  input.focus();

  hideMentionSuggestions();
}

// ============================================
// HIDE MENTION SUGGESTIONS - ADD THIS
// ============================================

function hideMentionSuggestions() {
  $('#mention-suggestions').remove();
  clearTimeout(mentionTimeout);
}

// ============================================
// LISTEN FOR MENTION NOTIFICATIONS - SIMPLIFIED
// ============================================

console.log('🔔 Setting up mention notifications...');
console.log('👤 User ID:', auth_id);

if (typeof pusher !== 'undefined' && typeof auth_id !== 'undefined') {
  try {
    // 🔥 SUBSCRIBE to user channel
    const userChannel = pusher.subscribe('user.' + auth_id);
    console.log('📡 Subscribed to user.' + auth_id);

    // 🔥 BIND EVENT
    userChannel.bind('App\\Events\\MentionEvent', function (data) {

      // Show browser notification
      if (Notification.permission === "granted") {
        try {
          const notification = new Notification('🔔 You were mentioned!', {
            body: data.sender_name + ' mentioned you in ' + data.group_name,
            icon: '/at-law-logo.webp',
            tag: 'mention-' + data.message_id,
            requireInteraction: true,
          });

          notification.onclick = function () {
            window.focus();
            if (data.group_id) {
              const groupElement = $('.group-item[data-group-id="' + data.group_id + '"]');
              if (groupElement.length) {
                groupElement.click();
              }
            }
            notification.close();
          };

          setTimeout(function () {
            notification.close();
          }, 10000);

          console.log('✅ Browser notification shown!');
        } catch (notifError) {
          console.error('❌ Error showing notification:', notifError);
        }
      }

      // Show in-app toast
      showMentionToast(data);
    });

    // 🔥 BIND success event
    userChannel.bind('pusher:subscription_succeeded', function () {
      console.log('✅✅✅ Successfully subscribed to user.' + auth_id + ' for mentions!');
    });

    userChannel.bind('pusher:subscription_error', function (error) {
      console.error('❌ Failed to subscribe to user channel:', error);
    });

  } catch (error) {
    console.error('❌ Error setting up mention listener:', error);
  }
} else {
  console.warn('⚠️ Pusher or auth_id not available');
}
// ============================================
// SHOW MENTION TOAST
// ============================================

function showMentionToast(data) {
  const toastId = 'mention-toast-' + Date.now();
  const isAllMention = data.is_all_mention || false;
  const icon = isAllMention ? '📢' : '🔔';
  const mentionText = isAllMention ? 'mentioned everyone' : 'mentioned you';

  // 🔥 Check if this is a private chat mention
  const isPrivate = data.message_type === 'private';

  // 🔥 For private chat, show different text
  let locationText = '';
  if (isPrivate) {
    locationText = 'in private chat';
  } else {
    locationText = 'in <strong>' + (data.group_name || 'group') + '</strong>';
  }

  const toastHtml = `
    <div id="${toastId}" style="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#2d3436;color:white;padding:12px 20px;border-radius:8px;z-index:999999;font-size:14px;box-shadow:0 4px 15px rgba(0,0,0,0.2);animation:slideUp 0.3s ease;max-width:400px;width:90%;cursor:pointer;border-left:4px solid ${isAllMention ? '#fdcb6e' : '#667eea'};">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">${icon}</span>
        <div>
          <strong style="color:${isAllMention ? '#fdcb6e' : '#667eea'};">${data.sender_name}</strong> ${mentionText} ${locationText}
          <div style="font-size:12px;color:#b2bec3;margin-top:2px;">${data.message_text || ''}</div>
        </div>
      </div>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(30px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    </style>
  `;

  $('#' + toastId).remove();
  $('body').append(toastHtml);

  // 🔥 Click to open chat
  $('#' + toastId).on('click', function () {
    if (isPrivate) {
      // For private chat, just focus the window
      window.focus();
    } else if (data.group_id) {
      // For group chat, open the group
      const groupElement = $('.group-item[data-group-id="' + data.group_id + '"]');
      if (groupElement.length) {
        groupElement.click();
      }
    }
    $(this).remove();
  });

  setTimeout(function () {
    $('#' + toastId).fadeOut(300, function () {
      $(this).remove();
    });
  }, 6000);
}


// ============================================
// PIN/UNPIN MESSAGE
// ============================================

// Pin/Unpin message button click
$(document).on('click', '.pin-message-btn', function (e) {
  e.stopPropagation();

  let messageId = $(this).data('message-id');
  let groupId = $(this).data('group-id');
  let action = $(this).data('action');

  if (!messageId || !groupId) return;

  let url = action === 'pin'
    ? `/groups/${groupId}/pin-message`
    : `/groups/${groupId}/unpin-message`;

  $.ajax({
    url: url,
    type: 'POST',
    data: {
      _token: csrfToken,
      message_id: messageId
    },
    success: function (response) {
      if (response.success) {
        // Refresh messages to show/hide pinned message
        loadGroupMessages(groupId);

        // Show notification
        showNotificationMessage(action === 'pin'
          ? '📌 Message pinned successfully!'
          : '📌 Message unpinned!'
        );
      }
    },
    error: function (xhr) {
      let error = xhr.responseJSON?.error || 'Failed to ' + action + ' message';
      alert('❌ ' + error);
    }
  });
});

// Unpin from pinned message container
$(document).on('click', '.unpin-btn', function (e) {
  e.stopPropagation();

  let messageId = $(this).data('message-id');
  let groupId = $(this).data('group-id');

  if (!messageId || !groupId) return;

  $.ajax({
    url: `/groups/${groupId}/unpin-message`,
    type: 'POST',
    data: {
      _token: csrfToken,
      message_id: messageId
    },
    success: function (response) {
      if (response.success) {
        loadGroupMessages(groupId);
        showNotificationMessage('📌 Message unpinned!');
      }
    },
    error: function (xhr) {
      let error = xhr.responseJSON?.error || 'Failed to unpin message';
      alert('❌ ' + error);
    }
  });
});
// ============================================
// CLICK PINNED BANNER → EXPAND/COLLAPSE MESSAGE
// ============================================

let isPinnedExpanded = false;
let fullPinnedMessageText = '';
let fullPinnedSenderName = '';

$(document).on('click', '#pinned-message-banner', function (e) {
  // Don't trigger if clicking on unpin button
  if ($(e.target).closest('.unpin-btn').length) {
    return;
  }

  let pinnedMessageId = window.pinnedMessageId;
  if (!pinnedMessageId) {
    showNotificationMessage('No pinned message found');
    return;
  }

  // Toggle expand/collapse
  isPinnedExpanded = !isPinnedExpanded;

  if (isPinnedExpanded) {
    expandPinnedMessage();
  } else {
    collapsePinnedMessage();
  }
});

function expandPinnedMessage() {
  let pinnedMessageId = window.pinnedMessageId;
  if (!pinnedMessageId) return;

  // Find the message card to get full text
  let messageCard = $(`.message-card[data-message-id="${pinnedMessageId}"]`);

  if (!messageCard.length) {
    // If message not loaded, try to get from stored data
    if (fullPinnedMessageText) {
      showFullPinnedMessageInBanner(fullPinnedMessageText, fullPinnedSenderName);
    } else {
      showNotificationMessage('Loading pinned message...');
      loadGroupMessages(window.groupState.currentGroupId);

      setTimeout(function () {
        let messageCard = $(`.message-card[data-message-id="${pinnedMessageId}"]`);
        if (messageCard.length) {
          let fullText = messageCard.find('.message-text').text().trim() || 'Pinned message';
          let senderName = messageCard.find('.message-user span').first().text().trim() || 'Unknown';
          fullPinnedMessageText = fullText;
          fullPinnedSenderName = senderName;
          showFullPinnedMessageInBanner(fullText, senderName);
        }
      }, 1000);
    }
    return;
  }

  // Get the full message text from the card
  let fullText = messageCard.find('.message-text').text().trim() || 'Pinned message';
  let senderName = messageCard.find('.message-user span').first().text().trim() || 'Unknown';

  // Store for later use
  fullPinnedMessageText = fullText;
  fullPinnedSenderName = senderName;

  showFullPinnedMessageInBanner(fullText, senderName);
}

function showFullPinnedMessageInBanner(fullText, senderName) {
  // Update banner to show full message
  $('#pinned-message-preview').text(fullText);
  $('#pinned-message-sender').text(senderName);

  // Change icon to indicate expanded
  $('#pinned-message-banner .fa-chevron-right').removeClass('fa-chevron-right').addClass('fa-chevron-down');

  // Add expanded class for styling
  $('#pinned-message-banner').addClass('expanded');

  // Allow full text to wrap
  $('#pinned-message-preview').css({
    'white-space': 'normal',
    'word-wrap': 'break-word',
    'max-height': '200px',
    'overflow-y': 'auto',
    'display': 'block'
  });
}

function collapsePinnedMessage() {
  // Get preview text (shortened)
  let previewText = fullPinnedMessageText.length > 60
    ? fullPinnedMessageText.substring(0, 60) + '...'
    : fullPinnedMessageText;

  // Update banner to show preview
  $('#pinned-message-preview').text(previewText);
  $('#pinned-message-sender').text(fullPinnedSenderName);

  // Change icon back
  $('#pinned-message-banner .fa-chevron-down').removeClass('fa-chevron-down').addClass('fa-chevron-right');

  // Remove expanded class
  $('#pinned-message-banner').removeClass('expanded');

  // Reset text style
  $('#pinned-message-preview').css({
    'white-space': 'nowrap',
    'word-wrap': 'normal',
    'max-height': 'none',
    'overflow-y': 'visible',
    'display': 'inline'
  });
}
$(document).on('click', '#unpin-from-banner', function (e) {
  e.stopPropagation();

  let messageId = $(this).data('message-id');
  let groupId = $(this).data('group-id');

  if (!messageId || !groupId) return;

  if (!confirm('Unpin this message?')) return;

  $.ajax({
    url: `/groups/${groupId}/unpin-message`,
    type: 'POST',
    data: {
      _token: csrfToken,
      message_id: messageId
    },
    success: function (response) {
      if (response.success) {
        loadGroupMessages(groupId);
        showNotificationMessage('📌 Message unpinned!');
      }
    },
    error: function (xhr) {
      let error = xhr.responseJSON?.error || 'Failed to unpin message';
      alert('❌ ' + error);
    }
  });
});