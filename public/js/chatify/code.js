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
  messages_page = 1;

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
    let senderName =
      $(".messenger-list-item[data-contact='" + data.from_id + "']")
        .find("*")
        .filter(function () {
          return $(this).children().length === 0;
        })
        .first()
        .text()
        .trim();

    new Notification(senderName || "New Message", {
      body: messageText || "Sent you a message",
      icon: "/favicon.ico",
    });
  }

  if (data.from_id == getMessengerId() && data.to_id == auth_id) {
    $(".messages").find(".message-hint").remove();
    messagesContainer.find(".messages").append(data.message);
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
clientListenChannel.bind("client-typing", function (data) {
  if (data.from_id == getMessengerId() && data.to_id == auth_id) {
    data.typing == true
      ? messagesContainer.find(".typing-indicator").show()
      : messagesContainer.find(".typing-indicator").hide();
  }
  // scroll to bottom
  scrollToBottom(messagesContainer);
});

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
function isTyping(status) {
  return clientSendChannel.trigger("client-typing", {
    from_id: auth_id, // Me
    to_id: getMessengerId(), // Messenger
    typing: status,
  });
}

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
    routerPush(document.title, `${url}/${userID}`);
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
    routerPush(document.title, `${url}/${uid}`);
  });

  // list view buttons
  $(".listView-x").on("click", function () {
    $(".messenger-listView").hide();
  });
  $(".show-listView").on("click", function () {
    routerPush(document.title, `${url}/`);
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
        triggered = isTyping(false);
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
  $("#message-form .m-send").on("keydown", () => {
    if (typingNow < 1) {
      isTyping(true);
      typingNow = 1;
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(function () {
      isTyping(false);
      typingNow = 0;
    }, 1000);
  });

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
function updateElementsDateToTimeAgo() {
  $(".message-time").each(function () {
    const time = $(this).attr("data-time");
    $(this).find(".time").text(dateStringToTimeAgo(time));
  });
  $(".contact-item-time").each(function () {
    const time = $(this).attr("data-time");
    $(this).text(dateStringToTimeAgo(time));
  });
}
setInterval(() => {
  updateElementsDateToTimeAgo();
}, 60000);

/**
 *-------------------------------------------------------------
 * GROUP CHAT - COMPLETE FIX WITH STATE MANAGEMENT
 *-------------------------------------------------------------
 */

// // Store group data
// window.groupState = {
//   currentGroupId: null,
//   isGroupChat: false,
//   messagesCache: {},
//   activeTab: 'private' // 'private' or 'group'
// };

// // Single group message handler
// $(document).ready(function () {
//   console.log('🔧 Initializing group chat handler...');

//   if (typeof pusher === 'undefined') {
//     console.error('❌ Pusher not available!');
//     return;
//   }

//   // Unbind any existing handlers
//   pusher.unbind('App\\Events\\GroupMessageSent');

//   pusher.bind('App\\Events\\GroupMessageSent', function (data) {
//     console.log('📨 Group message received!', data);

//     const messageData = data.message || data;
//     const groupId = messageData.group_id;
//     const senderId = messageData.sender_id;

//     // Skip own messages
//     if (senderId == auth_id) {
//       console.log('⏭️ Own message, skipping');
//       return;
//     }

//     // ============================================
//     // 1. UPDATE SIDEBAR - UNREAD INDICATOR (FIXED)
//     // ============================================
//     let groupItem = $(`.group-item[data-group-id="${groupId}"]`);

//     if (groupItem.length) {
//       let isCurrentGroup = (window.groupState.currentGroupId == groupId && window.groupState.isGroupChat);

//       // 🔥 Get sender name
//       let senderName = messageData.sender ? messageData.sender.name : 'Someone';
//       let lastMessageText = messageData.message || 'New message';
//       let previewText = senderName + ': ' + lastMessageText;
//       if (previewText.length > 40) {
//         previewText = previewText.substring(0, 40) + '...';
//       }

//       // 🔥 UPDATE PREVIEW
//       groupItem.find('td:last-child span').text(previewText);
//       groupItem.find('.contact-item-time').text('Just now');

//       // 🔥 UPDATE UNREAD BADGE (ONLY IF NOT VIEWING THIS GROUP)
//       if (!isCurrentGroup) {
//         let badge = groupItem.find('.contact-item-unread');
//         let avatar = groupItem.find('.avatar');

//         if (badge.length) {
//           let count = parseInt(badge.text()) + 1;
//           badge.text(count);
//           console.log('🔔 Updated badge count:', count);
//         } else if (avatar.length) {
//           // 🔥 ADD BADGE
//           avatar.append(`<span class="contact-item-unread">1</span>`);
//           console.log('🔔 Created new badge');
//         } else {
//           // Fallback - add to first td
//           groupItem.find('td:first-child').append(`<span class="contact-item-unread">1</span>`);
//         }
//       }

//       // 🔥 MOVE TO TOP
//       let parent = groupItem.parent();
//       if (parent.length) {
//         parent.prepend(groupItem);
//       }
//     } else {
//       console.warn('⚠️ Group item not found for ID:', groupId);
//     }

//     // ============================================
//     // 2. SHOW BROWSER NOTIFICATIONS
//     // ============================================
//     // Show notification when tab is hidden OR when not viewing this group
//     let shouldNotify = document.hidden ||
//       !window.groupState.isGroupChat ||
//       window.groupState.currentGroupId != groupId;

//     if (shouldNotify && Notification.permission === "granted") {
//       let groupName = groupItem.length ?
//         groupItem.find('p[data-id]').text().trim() :
//         'Group Chat';

//       // Get sender name
//       let senderName = messageData.sender ? messageData.sender.name : 'Someone';

//       // Extract message text
//       let tempDiv = document.createElement("div");
//       tempDiv.innerHTML = messageData.message;
//       let messageText = (tempDiv.textContent || tempDiv.innerText || "").trim();

//       if (messageText.length > 80) {
//         messageText = messageText.substring(0, 80) + "...";
//       }

//       // Show notification with sender name
//       new Notification(senderName + ' in ' + groupName, {
//         body: messageText || "Sent a message",
//         icon: "/favicon.ico",
//       });

//       console.log('🔔 Browser notification shown for group:', groupId);
//     }

//     // Play sound for all group messages (always)
//     if (typeof playNotificationSound === 'function') {
//       playNotificationSound("new_message", true);
//     }

//     // ============================================
//     // 3. DISPLAY MESSAGE (only if viewing this group)
//     // ============================================
//     if (!window.groupState.isGroupChat || !window.groupState.currentGroupId) {
//       console.log('⏭️ Not in group chat mode');
//       return;
//     }

//     if (groupId != window.groupState.currentGroupId) {
//       console.log('⏭️ Different group');
//       return;
//     }

//     // Check if we're actually showing group messages
//     if (window.groupState.activeTab !== 'group') {
//       console.log('⏭️ Not in group tab');
//       return;
//     }

//     if ($(`.messages [data-message-id="${messageData.id}"]`).length > 0) {
//       console.log('⏭️ Duplicate message');
//       return;
//     }


//     // Display messeg 
//     let senderName = messageData.sender ? messageData.sender.name : 'Unknown';
//     let displayName = messageData.sender ? messageData.sender.name : 'Unknown';
//     let messageContent = '';
//     let messageTime = messageData.created_at ? new Date(messageData.created_at) : new Date();
//     let timeDisplay = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//     // Add text message
//     if (messageData.message) {
//       messageContent += '<div class="message-text">' + messageData.message + '</div>';
//     }

//     // Add attachment if exists
//     if (messageData.attachment) {
//       let fileUrl = '/storage/' + messageData.attachment;
//       let isImage = messageData.attachment_type && messageData.attachment_type.startsWith('image/');

//       if (isImage) {
//         messageContent += '<div class="chat-image" style="background-image: url(' + fileUrl + '); max-width:200px; max-height:200px; background-size:cover; background-position:center; border-radius:8px; margin-top:5px; cursor:pointer;"></div>';
//       } else {
//         let fileName = messageData.attachment.split('/').pop();
//         messageContent += '<div class="file-attachment" style="padding:6px 10px; background:#f1f2f6; border-radius:6px; margin-top:4px; display:inline-block;">';
//         messageContent += '<i class="fas fa-paperclip" style="font-size:12px;"></i> <a href="' + fileUrl + '" target="_blank" style="color:#0984e3; text-decoration:none; font-size:13px;">' + fileName + '</a>';
//         messageContent += '</div>';
//       }
//     }

//     // 🔥 Check if we need to add a date divider
//     let shouldAddDivider = false;
//     let lastMessageDate = window._lastMessageDate || null;
//     let currentDate = new Date().toDateString();

//     if (lastMessageDate !== currentDate) {
//       shouldAddDivider = true;
//       window._lastMessageDate = currentDate;
//     }

//     if (shouldAddDivider) {
//       let dateDisplay = 'Today';
//       let now = new Date();
//       let msgDate = new Date(messageData.created_at);

//       if (msgDate.toDateString() === now.toDateString()) {
//         dateDisplay = 'Today';
//       } else {
//         let yesterday = new Date(now);
//         yesterday.setDate(yesterday.getDate() - 1);
//         if (msgDate.toDateString() === yesterday.toDateString()) {
//           dateDisplay = 'Yesterday';
//         } else {
//           dateDisplay = msgDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
//         }
//       }

//       $('.messages').append(`
//         <div class="date-divider">
//             <span>${dateDisplay}</span>
//         </div>
//     `);
//     }

//     $('.messages').find('.message-hint').hide();
//     $('.messages').append(`
//     <div class="message-card mc-receiver" data-message-id="${messageData.id}">
//         <div class="message">
//             <div class="message-user" style="font-size:11px; font-weight:600; color:#636e72; margin-bottom:2px; display:flex; align-items:center; justify-content:space-between;">
//                 <span>${displayName}</span>
//                 <span class="message-time" style="font-size:10px; font-weight:400; color:#b2bec3; margin-left:10px;">${timeDisplay}</span>
//             </div>
//             ${messageContent}
//         </div>
//     </div>
// `);

//     scrollToBottom(messagesContainer);
//     console.log('✅ Group message displayed!');
//   });

//   console.log('✅ Group handler ready!');
// });

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
  if (senderId == auth_id) {
    console.log('⏭️ Own message, skipping');
    return;
  }

  // ============================================
  // 1. UPDATE SIDEBAR - ALWAYS
  // ============================================
  var groupItem = $(`.group-item[data-group-id="${groupId}"]`);

  if (groupItem.length) {
    console.log('✅ Group found in sidebar');

    // 🔥 Check if we're viewing THIS group
    var isViewingThisGroup = (window.groupState.currentGroupId == groupId && window.groupState.isGroupChat);


    // Update last message preview (ALWAYS)
    var senderName = messageData.sender ? messageData.sender.name : 'Someone';
    var messageText = messageData.message || 'New message';
    var preview = senderName + ': ' + messageText;
    if (preview.length > 40) preview = preview.substring(0, 40) + '...';

    groupItem.find('td:last-child span').text(preview);
    groupItem.find('.contact-item-time').text('Just now');

    // 🔥 UPDATE UNREAD BADGE - ONLY IF NOT VIEWING THIS GROUP
    if (!isViewingThisGroup) {
      var badge = groupItem.find('.contact-item-unread');
      var avatar = groupItem.find('.avatar');

      if (badge.length) {
        var count = parseInt(badge.text()) + 1;
        badge.text(count);
      } else if (avatar.length) {
        avatar.append('<span class="contact-item-unread">1</span>');
      } else {
        // Fallback
        groupItem.find('td:first-child').append('<span class="contact-item-unread">1</span>');
      }
    } else {
      console.log('👁️ Viewing this group, not adding badge');
    }

    // Move to top (ALWAYS)
    var parent = groupItem.parent();
    if (parent.length) {
      parent.prepend(groupItem);
    }
  } else {
    // Try to reload groups
    if (typeof loadGroups === 'function') {
      loadGroups();
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
      icon: '/favicon.ico'
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
    msgHtml += '<div class="message-text">' + messageData.message + '</div>';
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
  $('.messages').append(`
        <div class="message-card mc-receiver" data-message-id="${messageData.id}">
            <div class="message">
                <div class="message-user" style="font-size:11px;font-weight:600;color:#636e72;margin-bottom:2px;display:flex;justify-content:space-between;">
                    <span>${displayName}</span>
                    <span style="font-size:10px;font-weight:400;color:#b2bec3;">${timeDisplay}</span>
                </div>
                ${msgHtml}
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

  // ============================================
  // GROUP STATE - SINGLE SOURCE OF TRUTH
  // ============================================
  // window.groupState = {
  //   isGroupChat: false,
  //   currentGroupId: null,
  //   activeTab: 'private'
  // };

  // let selectedMembers = [];
  // window.groupChannel = null;

  // // ============================================
  // // GROUP MESSAGE HANDLER
  // // ============================================
  // if (typeof pusher !== 'undefined') {
  //   pusher.unbind('App\\Events\\GroupMessageSent');

  //   pusher.bind('App\\Events\\GroupMessageSent', function (data) {
  //     console.log('📨 Group message received!', data);

  //     const messageData = data.message || data;
  //     const groupId = messageData.group_id;
  //     const senderId = messageData.sender_id;

  //     // Skip own messages
  //     if (senderId == auth_id) {
  //       console.log('⏭️ Own message, skipping');
  //       return;
  //     }

  //     // ============================================
  //     // 1. UPDATE SIDEBAR - LIVE UNREAD INDICATOR
  //     // ============================================
  //     let groupItem = $(`.group-item[data-group-id="${groupId}"]`);

  //     if (groupItem.length) {
  //       let isCurrentGroup = (window.groupState.currentGroupId == groupId && window.groupState.isGroupChat);

  //       let senderName = messageData.sender ? messageData.sender.name : 'Someone';
  //       let lastMessageText = messageData.message || 'New message';
  //       let previewText = senderName + ': ' + lastMessageText;

  //       if (previewText.length > 40) {
  //         previewText = previewText.substring(0, 40) + '...';
  //       }

  //       groupItem.find('td:last-child span').text(previewText);
  //       groupItem.find('.contact-item-time').text('Just now');

  //       if (!isCurrentGroup) {
  //         let badge = groupItem.find('.contact-item-unread');
  //         if (badge.length) {
  //           let count = parseInt(badge.text()) + 1;
  //           badge.text(count);
  //         } else {
  //           groupItem.find('.avatar').append(`<span class="contact-item-unread">1</span>`);
  //         }
  //         console.log('🔔 Unread count updated for group:', groupId);
  //       }

  //       let parent = groupItem.parent();
  //       if (parent.length) {
  //         parent.prepend(groupItem);
  //       }
  //     }

  //     // ============================================
  //     // 2. SHOW BROWSER NOTIFICATIONS
  //     // ============================================
  //     let isViewingThisGroup = (window.groupState.currentGroupId == groupId && window.groupState.isGroupChat);
  //     let shouldNotify = document.hidden || !isViewingThisGroup;

  //     if (shouldNotify && Notification.permission === "granted") {
  //       let groupName = groupItem.length ?
  //         groupItem.find('p[data-id]').text().trim() :
  //         'Group Chat';

  //       let senderName = messageData.sender ? messageData.sender.name : 'Someone';

  //       let tempDiv = document.createElement("div");
  //       tempDiv.innerHTML = messageData.message;
  //       let messageText = (tempDiv.textContent || tempDiv.innerText || "").trim();

  //       if (messageText.length > 80) {
  //         messageText = messageText.substring(0, 80) + "...";
  //       }

  //       const notification = new Notification(senderName + ' in ' + groupName, {
  //         body: messageText || "Sent a message",
  //         icon: "/favicon.ico",
  //         tag: 'group-' + groupId,
  //         requireInteraction: true
  //       });

  //       notification.onclick = function () {
  //         window.focus();
  //         let groupElement = document.querySelector(`.group-item[data-group-id="${groupId}"]`);
  //         if (groupElement) {
  //           groupElement.click();
  //         }
  //         notification.close();
  //       };

  //       console.log('🔔 Notification shown for group:', groupId);
  //     }

  //     // ============================================
  //     // 3. PLAY SOUND
  //     // ============================================
  //     if (typeof playNotificationSound === 'function') {
  //       playNotificationSound("new_message", true);
  //     }

  //     // ============================================
  //     // 4. DISPLAY MESSAGE (only if viewing this group)
  //     // ============================================
  //     if (!window.groupState.isGroupChat || !window.groupState.currentGroupId) {
  //       return;
  //     }

  //     if (groupId != window.groupState.currentGroupId) {
  //       return;
  //     }

  //     if ($(`.messages [data-message-id="${messageData.id}"]`).length > 0) {
  //       return;
  //     }

  //     let displayName = messageData.sender ? messageData.sender.name : 'Unknown';
  //     $('.messages').find('.message-hint').hide();
  //     $('.messages').append(`
  //               <div class="message-card mc-receiver" data-message-id="${messageData.id}">
  //                   <div class="message">
  //                       <div class="message-user">${displayName}</div>
  //                       <div class="message-text">${messageData.message}</div>
  //                   </div>
  //               </div>
  //           `);

  //     scrollToBottom(messagesContainer);
  //   });

  //   console.log('✅ Group message handler bound successfully!');
  // }

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

    console.log('🔄 Switching to private chat');

    window.groupState.isGroupChat = false;
    window.groupState.currentGroupId = null;
    window.groupState.activeTab = 'private';

    if (window.groupChannel) {
      window.groupChannel.unsubscribe();
      window.groupChannel = null;
    }

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
        // 🔥 SUBSCRIBE TO THE NEW GROUP CHANNEL
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
        $('.app-modal[data-name="create-group"]').fadeOut(200);
      }
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
          // Call the existing handler
          if (typeof handleGroupMessage === 'function') {
            handleGroupMessage(data);
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
      window.groupChannel.unsubscribe();
      window.groupChannel = null;
    }
    window.groupChannel = pusher.subscribe('group.' + groupId);
    window.groupChannel.bind('pusher:subscription_succeeded', function () {
      console.log('✅ Subscribed to group.' + groupId);
    });
    // 🔥 BIND GROUP REACTIONS
    bindGroupReactions(window.groupChannel);
  });



  // ============================================
  // LOAD GROUP MESSAGES
  // ============================================
  function loadGroupMessages(groupId) {
    if (!groupId) return;

    console.log('📥 Loading messages for group:', groupId);

    $('.messages').html('<div style="text-align:center;padding:40px;color:#999;">Loading messages...</div>');

    $.get('/groups/' + groupId + '/messages', function (response) {
      console.log('✅ Messages loaded for group:', groupId);

      $('.messages').empty();
      $('.messages').html(response.messages_html);

      if (response.group) {
        $('.user-name').text(response.group.name);
      }

      $('.messages').find('.message-hint').hide();

      if (response.group && response.group.image) {
        $('.header-avatar').css('background-image', 'url(/storage/' + response.group.image + ')');
      } else {
        $('.header-avatar').css('background-image', 'url(/images/group-default.png)');
      }

      console.log('📨 Messages rendered:', $('.messages .message-card').length);
      // // 🔥 ADD THIS - Load reactions for group messages
      // setTimeout(function () {
      //   loadAllMessageReactions('.messages', 'group');
      // }, 500);

      setTimeout(function () {
        scrollToBottom(messagesContainer);
      }, 200);

    }).fail(function (xhr) {
      console.error('❌ Failed to load group messages:', xhr);
      $('.messages').html('<div style="text-align:center;padding:40px;color:red;">Failed to load messages</div>');
    });
  }

  // ============================================
  // SEND GROUP MESSAGE WITH ATTACHMENT
  // ============================================
  window.sendGroupMessage = function () {
    let text = $.trim(messageInput.val());
    let currentGroupId = window.groupState.currentGroupId || window.currentGroupIdForMembers;
    let hasFile = !!$(".upload-attachment").val();

    if ((!text && !hasFile) || !currentGroupId) {
      console.log('⏭️ No message or attachment to send');
      return false;
    }

    console.log('📤 Sending group message to group:', currentGroupId);

    // Create form data for file upload
    let formData = new FormData();
    formData.append('group_id', currentGroupId);
    formData.append('message', text || '');
    formData.append('_token', csrfToken);

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
            <div class="message-text">${messageHtml}</div>
        </div>
    </div>
`);

      messageInput.val('');
      $(".upload-attachment").val('');
      $(".attachment-preview").remove();
      scrollToBottom(messagesContainer);
    }

    // In your sendGroupMessage function
    console.log('📤 AJAX sending to:', '/groups/send-message');
    console.log('📤 Data:', {
      group_id: currentGroupId,
      message: text
    });

    $.ajax({
      url: '/groups/send-message',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        console.log('✅ Group message sent:', response);
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

      if (response.is_admin || response.is_creator) {
        $('#group-admin-actions').show();
        $('#admin-action-labels').show();
      } else {
        $('#group-admin-actions').hide();
        $('#admin-action-labels').hide();
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
    let avatar = member.avatar ? '/storage/' + member.avatar : '/images/avatar.png';
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
              let avatar = user.avatar ? user.avatar : '/storage/users-avatar/avatar.png';
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
              let avatar = user.avatar ? user.avatar : '/storage/users-avatar/avatar.png';
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

  let messageCard = $(`.message-card[data-id="${messageId}"], .message-card[data-message-id="${messageId}"]`);

  if (!messageCard.length) {
    console.warn('⚠️ Message card not found:', messageId);
    return;
  }

  // Remove existing reactions container
  messageCard.find('.message-reactions').remove();

  if (!reactions || reactions.length === 0) {
    console.log('ℹ️ No reactions to display');
    return;
  }

  // Group reactions by emoji
  let grouped = {};
  reactions.forEach(function (r) {
    console.log('🔍 Individual reaction:', r);
    console.log('🔍 User data:', r.user);

    if (!grouped[r.reaction]) {
      grouped[r.reaction] = {
        users: [],
        count: 0
      };
    }

    // 🔥 FIX: Get user name from different possible sources
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

    console.log(`✅ Emoji: ${emoji}, Users: ${userNames}, Count: ${count}`);

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
if (typeof pusher !== 'undefined') {
  pusher.bind('App\\Events\\MessageReactionEvent', function (data) {
    if (data.type === 'private') {
      updateReactionsDisplay(data.message_id, data.reactions);
      console.log('✅ Private reaction received:', data);
    }
  });
}

// ============================================
// PUSHER - GROUP MESSAGE REACTIONS
// ============================================
function bindGroupReactions(channel) {
  if (!channel) return;
  channel.bind('App\\Events\\MessageReactionEvent', function (data) {
    if (data.type === 'group') {
      updateReactionsDisplay(data.message_id, data.reactions);
      console.log('✅ Group reaction received:', data);
    }
  });
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