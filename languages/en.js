const language = {
  time_format: "MMMM Do YYYY, h:mm:ss a",
  select_a_lang: "Select a language",
  the_current_weather:
    "The current weather: **${weather}** ${currentTemp} \u00B0C in ${targetCity} (${countryName})",
  feels_like: "Feels like:",
  humidity: "Humidity:",
  wind_speed: "Wind:",
  pressure: "Pressure:",
  visibility: "Visibility:",
  local_time: "Local time:",
  sunrise: "Sunrise:",
  sunset: "Sunset:",
  uv_index: "UV Index:",
  precip: "Precip:",
  moon_phase: "Moon phase:",
  illumination: "Illumination:",
  full_moon: "Full Moon",
  waning_gibbous: "Waning Gibbous",
  last_quarter: "Last Quarter",
  waning_crescent: "Waning Crescent",
  new_moon: "New Moon",
  waxing_crescent: "Waxing Crescent",
  first_quarter: "First Quarter",
  waxing_gibbous: "Waxing Gibbous",
  lavalink_not_connected: "Lavalink node is not connected.",
  searching: ":mag_right: **Searching...**",
  error_while_searching: "There was an error while searching.",
  no_result: "No results were found.",
  added_to_queue: "Added to queue",
  added_by: "Added by",
  duration: "Duration",
  LIVE: `\`LIVE 🔴 \``,
  position_in_queue: "Position in queue",
  playlist_to_queue: "Playlist added to queue",
  enqueued: "Enqueued",
  songs: "songs",
  playlist_duration: "Playlist duration",
  playback_error: "Playback error!",
  failed_to_load: "Failed to load track: ",
  something_went_wrong: "Oops! something went wrong but it's not your fault!",
  track_error: "Track error!",
  track_has_error: "Track has an error",
  disconnected_from: "Disconnected from",
  no_descriptions: "No Descriptions",
  could_not_load_track: "Could not load track.\n**ERR:**",
  queue_ended: "The queue has ended",
  footer_que_ended: "Queue ended",
  disconnected: "Disconnected!",
  disc_due_to_inac: "The player has been disconnected due to inactivity.",
  now_playing: "Now playing",
  requested_by: "Requested by",
  you_must_be_in: "You must be in a voice channel to use this command!",
  you_must_same:
    "You must be in the same voice channel as me to use this command!",
  not_enough_permission:
    "I don't have enough permission to join your voice channel!",
  no_player: "**There is no player to control in this server.**",
  you_must_be_action: "You must be in a voice channel to use this action!",
  you_must_be_same:
    "You must be in the same voice channel as me to use this action!",
  successfully_stopped: "⏹️ | **Successfully stopped the player**",
  no_previous: "There is no previous song played",
  no_song: "There is no song playing right now.",
  nothing_after: "There is nothing after",
  in_the_queue: "in the queue.",
  unknown_option: "**Unknown controller option**",
  resumed_song: "The current song has been resumed.",
  resumed: "Resumed!",
  paused_title: "Paused!",
  song_paused:
    "The current song has been paused because theres no one in the voice channel.",
  playing: "Playing",
  nothing_play24: "There's nothing to play 24/7.",
  mod_two_four: "**24/7 mode is**",
  ON: "ON",
  OFF: "OFF",
  the_bot_will: "The bot will",
  now: "now",
  no_longer: "no longer",
  the_bot_will2: "stay connected to the voice channel 24/7.",
  nothing_to_play: "There's nothing playing in the queue",
  autopause_is: "**Auto Pause is**",
  the_player_will: "The player will",
  automatically: "now be automatically",
  no_longer_be: "no longer be",
  the_player_will2: "paused when everyone leaves the voice channel.",
  auto_que_is: "**Auto Queue is**",
  auto_que1: "Related music will",
  auto_que2: "added to the queue.",
  auto_que_option1: "now be automatically",
  auto_qu2_option2: "no longer be",
  error: "❌ | Error!",
  kilometerperhour: "km/h",
  deleting: "Deleting",
  deleting2: "messages younger than 14 days.",
  deleted: "Deleted",
  bot_messages: "bot messages",
  clear_que1: "**Invalid, Not enough track to be cleared.**",
  clear_que2: "✅ | **Cleared the queue!**",
  nothing_is_playing: "Nothing is playing right now.",
  enabled: "enabled",
  disabled: "disabled",
  loop_has_been: "Loop has been",
  no_music_playing: "There is no music playing.",
  loop_queue_is_now: "Loop queue is now",
  isnt_in_channel: "The bot isn't in a channel",
  nothing_playing: "There's nothing playing",
  fetching_ping: "Fetching ping...",
  API_latency: "API Latency",
  Bot_latency: "Bot Latency",
  current_volume: ":loud_sound: | Current volume",
  set_volume: ":loud_sound: | Successfully set volume to",
  radio_connecting: ":radio: **Connecting...**",
  no_title: "No Title",
  not_enough_songs: "There are not enough songs in the queue.",
  shuffled: "🔀 | **Successfully shuffled the queue.**",
  already_paused: "Current playing track is already paused!",
  paused: "⏸ | **Paused!**",
  iam_not_in_a_channel: "I'm not in a channel",
  bye_bye: ":wave: | **Bye Bye!**`",
  already_resumed: "Current track is already resumed",
  resumed_completed: "⏯ **Resumed!**",
  not_playing_anything: "I'm not playing anything",
  replay: "Replay",
  nothing_to_skip: "There is nothing to skip",
  skip1: "There is nothing after",
  skip2: "in the queue.",
  skipped: "✅ | **Skipped!**",
  invalid_position: "Invalid position!",
  skipped_to: "✅ | Skipped to position ",
  no_songs_in_queue: "There are no songs in the queue",
  volume: "Volume",
  total_tracks: "Total Tracks",
  queued_tracks: "Queued Tracks",
  total_tracks_duration: "Total Tracks Duration",
  page: "Page",
  track_duration: "Track Duration",
  queue1: "Only",
  queue2: "can use this button",
  reading_text: ":speaking_head:  **Reading...**",
  no_previous_songs: "There are no previous songs for this session",
  no_previous_songs2: "There is no previous song in the queue",
  previous_song: "⏮ | Previous song:",
  searching_error: "An error occured while searching for the song",
  no_results_for: "No results found for",
  select_a_song: "Select a song",
  choose_a_track1: "Here are some of the results I found for",
  choose_a_track2: "Please select one within `60 seconds.`",
  no_track_selected: "No track selected. You took too long to select a track.",
  uploader: "Author:",
  no_music_right_now: "There is no music playing right now.",
  saved1: "Saved",
  saved2: "to your DM.",
  track_author: "Track Author",
  saved_track: "Saved track",
  requested_guild: "Requested Guild",
  check_your_dm:
    "Please check your **DMs**. If you didn't receive any message from me please make sure your **DMs** are open.",
  filter_now_active: "filter is now active!",
  no_filter: "Filters has been cleared!",
  invalid_filters: "❌ | Invalid filter!",
  choose_a_song: "Choose a song",
  lyrics1: "Here are some of the results I found for",
  lyrics2: "Please choose a song to display lyrics within `30 seconds`.",
  tips: "Tips",
  source: "Source",
  lyrics_provided: "Lyrics provided by Genius",
  not_authorized:
    "**Unfortunately we're not authorized to show these lyrics.**",
  resricted_lyrics: "Lyrics is restricted by MusixMatch.",
  truncated_lyrics: "\nTruncated, the lyrics were too long.",
  no_track_lyrics: "No song is selected. You took too long to select a track.",
  no_result_for1: "No results found for",
  no_result_for2: "\nMake sure you typed in your search correctly.",
  lyrics_error: "An unknown error has occured, please check your console.",
  lyrics_tips:
    "Here is some tips to get your song lyrics correctly \n\n\
    1. Try to add the artist's name in front of the song name.\n\
    2. Try to search the lyrics manually by providing the song query using your keyboard.\n\
    3. Avoid searching lyrics in languages other than English.",
  lyrics_tips_title: "Lyrics Tips",
  invalid_track_number: ":x: | **Invalid track number**",
  invalid_position_number: ":x: | **Invalid position number**",
  moved_position: ":white_check_mark: | **Moved track**",
  no_song_remove: "There are no songs to remove.",
  queue_size: "Current queue has only **{number}** track.",
  removed_track: "**{number}** song has been removed from the queue.",
  seek_msg1: "has been",
  seek_msg2: "rewound",
  seek_msg3: "seeked",
  seek_msg4: "to",
  unable_to_seek:
    "Unable to seek current playing track. This may be due to exceeding track duration or an incorrect time format. Please check and try again.",
  cant_use_in_this_channel:
    "You can only use this command in the <#%channel%> channel!",
  time_is_up: "Time is up! Please rerun this command!",
  please_wait_between: "Please wait 5 seconds between commands!",
  left_alone_in_channel:
    "Left because there is no one left in the voice channel.",
  please_wait_button:
    "Someone recently issued a command on the player. Please wait a moment!",
  flags: "Flags",
  what_flag1: "Lets see how many flags you can figure out. What flag is this?",
  what_flag2: "What flag is this?",
  flags_wrong: "You got it wrong. It was",
  guessed_flags: "Guessed flags:",
  flags_time_is_up: "Your minute is up. The last flag was:",
  wordgame_title: "Word chain game scoreboard",
  wordgame_description:
    "Send the first word! The others must send the words starting with the last letter of the previous word. If someone has already sent one word, someone else must send the next word.",
  total_correct_word: "Total correct words:",
  current_chain: "Current chain:",
  last_correct_word: "Last correct word:",
  longest_word: "Longest word:",
  longest_word_author: "Longest Word Author:",
  not_enough_char: "The word you entered does not contain enough characters.",
  already_used_word: "This word has already been used once in this game.",
  not_your_turn: "Now someone else need to send a word",
  badword1:
    "Your word does not start with **${prev_letter}**. The chain is over.",
  badword2: "You typed a wrong word. The chain is over.",
  wordgame_over:
    "**You have reached the end of the game. A new round begins.**",
  server_details: "server details.",
  server_identifier: "Identifier:",
  number_of_member: "Number of member:",
  number_of_bots: "Number of bots:",
  owner_of_the_server: "Server owner:",
  server_creation_date: "Creation date:",
  failed_to_check_word1: "Server could not check the word. Please resend!",
  failed_to_check_word2:
    "Server has not sent a reply. Please send the word again!",
  failed_to_check_word3:
    "An error occurred during the check. Please resend the word later!",
  or_separator: "or",
  logos: "Logos",
  what_logo1:
    "Lets see how many logos you can figure out  in 60 sec. What does this logo represent?",
  what_logo2: "What does this logo represent?",
  logos_wrong: "You guessed wrong. The correct answer is:",
  guessed_logos: "Guessed logos:",
  logos_time_is_up: "Your time is up. The last logo was:",
  trivia_already_started: "A Trivia game has already in progress.",
  no_trivia_game: "No Trivia game in progress.",
  you_cant_stop_trivia:
    "Only the administrator or the person who started the game can stop the game.",
  trivia_stopped: "You have successfully stopped the Trivia game.",
  picture_failed:
    "An error has occurred. If you have entered a user you must have an avatar on Discord.",
  cant_use_it_here: "You cant use this command in this channel.",
  bad_word_on_image: "Please don't use words like that!",
  no_response_question: "There was no valid response to the request.",
  invalid_link: "You have provided an invalid or inaccessible link.",
  unsafe_picture: "The image is not safe.",
  safe_picture: "The image is safe.",
  detected_elements: "Identified element(s):",
  not_nsfw_channel: "This command can only be used on an NSFW channel!",
  indentfied_ages: "Recognised ages:",
  indentfied_emotions: "Recognised emotions:",
  years: "years",
  exposed_anus: "exposed anus",
  exposed_armpits: "exposed armpits",
  covered_belly: "covered belly",
  exposed_belly: "exposed belly",
  covered_buttocks: "covered buttocks",
  exposed_buttocks: "exposed buttocks",
  face_f: "female face",
  face_m: "male face",
  covered_feet: "covered feet",
  exposed_feet: "exposed feet",
  covered_breast_f: "covered female breast",
  exposed_breast_f: "exposed female breast",
  covered_genitalia_f: "covered female genitalia",
  exposed_genitalia_f: "exposed female genitalia",
  exposed_breast_m: "exposed male breast",
  exposed_genitalia_m: "exposed male genitalia",
  failed_to_check: "I could not check the picture.",
  bad_image: "You have submitted an inappropriate picture.",
  not_paused: "The player is not stopped.",
  same_position: "You specified the same position.",
  indentfied_logos: "Identified logo(s) and brand(s):",
  cant_play_in_afk: "You cannot start playback on the AFK channel.",
  none: "none",
  tts_title: "Reading text",
  unexpected_happen: "An unexpected thing happened. Please try again.",
  dont_post_invite: "Please do not send invitations to other servers!",
  reaction_role_add:
    "I gave you the ``{role}`` role on the ``{guild}`` server.",
  reaction_role_remove:
    "I took away you the ``{role}`` role on the ``{guild}`` server.",
  short_days: "d",
  short_hours: "h",
  short_minutes: "m",
  temp_name: "Temporary name",
  temp_channel_control_panel: "Hangcsatorna irányítópult",
  temp_channel_control_panel_description:
    "The first person to connect to the voice channel will be the room owner.  You can control your channel from here by pressing the buttons. If someone does not have permission to join, find the user and right click on them and select **Applications** then **Permit**. If the owner leaves the channel you can take their place.",
  temp_channel_hide: "Hide",
  temp_channel_unhide: "Unhide",
  temp_channel_lock: "Lock",
  temp_channel_unlock: "Unlock",
  temp_channel_kick: "Kick",
  temp_channel_ban: "Ban",
  temp_channel_claim: "Claim",
  temp_channel_rename: "Rename",
  temp_channel_limit: "Userlimit",
  temp_channel_permit: "Permit",
  temp_channel_permit_description: "Right click>Applications>Permit",
  temp_channel_not_tempchannel: "This voice channel is not temporarily.",
  temp_cahnnel_not_yours: "You don't own this voice channel!",
  temp_channel_owner_still_here:
    "The owner of the voice channel is still here.",
  temp_channel_successful_claim:
    "You have successfully taken ownership of the audio channel!",
  temp_channel_your_are_the_owner:
    "**You** are the owner of the voice channel.",
  temp_channel_rename_label: "What do I rename your channel to?",
  temp_channel_rename_title: "Rename",
  temp_channel_not_appropriate: "You have entered a inappropriate name.",
  temp_channel_change_limit:
    "Audio channel names can only be changed 2 times every 10 minutes on Discord.",
  temp_channel_successful_rename: "You have successfully set the name to ",
  temp_channel_limit_label: "Userlimit for the channel.",
  temp_channel_limit_title: "Maximum user",
  temp_channel_limit_not_number: "You have not entered a number.",
  temp_channel_limit_bad_number: "Enter a number between 0 and 100!",
  temp_channel_successful_limit: "You have successfully set the user limit to ",
  temp_channel_successful_hide: "You have successfully hid your channel!",
  temp_channel_successful_unhide:
    "You have successfully made your channel visible!",
  temp_channel_successful_lock: "You have successfully locked your channel!",
  temp_channel_successful_unlock:
    "You have successfully unlocked your channel!",
  temp_channel_no_appropriate_target: "I couldn't find a suitable target!",
  temp_channel_select_somebody: "Select someone",
  temp_channel_select_somebody_description:
    "Please select a target within `30 seconds`!",
  temp_channel_successful_kick:
    "You have successfully kicked {target} from your channel!",
  temp_channel_successful_ban:
    "You have successfully banned {target} from your channel!",
  temp_channel_you_didnt_select: "You didn't pick your target in time.",
  temp_channel_successful_permit:
    "You have successfully gave permission to {target} to join your channel!",
  play_nsfw_channel: "You can only request such content from NSFW channels.",
  poll_description:
    "*To vote, react using the correspoding emoji.\nThe voting will end **{relative}**.\nPoll creator and administrators can end the poll **forcefully** by reacting to {forceEndPollEmoji} emoji.\nYou can only select {limit} option(s) in this poll.*\n\n",
  poll_created_by: "Poll created by",
  poll_title: "Poll -",
  pool_over_description: "*Time is up! The result of the poll was:*",
  pool_vote: "vote(s)",
  automod_links_bad_link: "Please don't send links like this!",
  automod_url_shortener: "Please do not use url shorteners!",
  no_input_image: "You didn't provide a picture.",
  temp_channel_numbered: ". channel",
  temp_channel_usernane: "'s room",
  warnMessage: "{@user}, Please stop spamming.",
  muteMessage: "**{user_tag}** has been muted for spamming.",
  kickMessage: "**{user_tag}** has been kicked for spamming.",
  banMessage: "**{user_tag}** has been banned for spamming.",
  warnTitle: "User have been warned.",
  kickTitle: "User have been kicked.",
  muteTitle: "User have been muted.",
  banTitle: "User have been banned.",
  log_channel_create: ":house: Channel created: {c}",
  responsible_moderator: "Responsible moderator:",
  reason: "Reason:",
  log_temporary_channel_created: ":house: Created a new temporary channel: {c}",
  log_channel_deleted: ":house: Channel deleted: {c}",
  overrides: "Overrides:",
  log_channel_updated: ":writing_hand: Channel updated: {c}",
  old_name: "Old name:",
  new_name: "New name:",
  age_restricted_channel: "Age-restricted channel:",
  slow_mode: "Slow mode:",
  message_per_sec: "{s} message every 1 second.",
  previous_topic: "Old topic:",
  new_topic: "New topic:",
  log_emoji_create: "{u} Created a new emote.",
  emoji_title: "Emoji:",
  emoji_identifier: "Identifier:",
  emoji_deleted: "{u} removed a emote.",
  emoji_changed: "{u} changed a emote.",
  old_identifier: "Old identifier:",
  new_indentifier: "New identifier:",
  no_reason_given: "*No reason*",
  log_user_banned: ":hammer: {u} got banned.",
  log_ban_removed: "{u} revoked a ban.",
  log_guild_member_add: "{u} joined the {s} server.",
  account_created: ":timer: Account created:",
  inviter: ":link: Inviter:",
  log_member_kicked: ":boot: {u} got kicked.",
  log_user_left: ":wave: {u} left the server.",
  log_nickname_changed: "{i} change his nickname.",
  log_nickname_removed: "{u} deleted his nickname.",
  old_nickname: "Old nickname:",
  new_nickname: "New nickname:",
  log_user_timed_out: ":x: {u} got timed out.",
  expire: "Expire:",
  log_member_updated: ":writing_hand: {u} updated.",
  roles: "Roles:",
  log_invite_created: ":link: {u} created a invitation: {i}",
  valid_until: ":timer:Valid:",
  forever: "Forever",
  max_usages: ":door:Max usage:",
  infinite: "Infinite",
  log_invite_removed: ":link: {u} Deleted a invitation: {i}`",
  responsible_user: "Responsible user:",
  content_of_message: "Message:",
  log_message_removed:
    ":wastebasket: Message sent by {u} has been deleted here: {c}.",
  log_message_updated:
    ":pencil2: {u} Message sent by {u} has been edited here: {c}. [Jump to message]({url})",
  old_message: "Old message:",
  new_message: "New message:",
  log_role_created1: ":writing_hand: {u} created a role.",
  log_role_crated2: ":writing_hand: A new role created on the server.",
  name_title: "Name:",
  log_role_deleted1: "🗑️ {u} deleted a role.",
  log_role_deleted2: "🗑️ A role has been deleted on the server.",
  log_role_changed: "`:writing_hand: {r} role changed.",
  mentionable: "Mentionable:",
  color: "Color:",
  separately_visible: "Display role seperately:",
  rights: "Rights:",
  log_voice_join: "{u} is connected to the {c} voice channel.",
  log_disconnected1: "{u} got disconnected",
  log_disconnected2: "from {c}",
  log_a: "a",
  from_channel: "voicechannel.",
  log_left_channel: "{u} left",
  log_user_moved: "{u} moved",
  temporary_channel: "Temporary channel",
  log_changed_channel: "{u} chagned channel",
  log_voice_state_update: "Voice state has been updated: {u}.",
  server_mute: ":microphone2: Server mute:",
  server_deafen: ":speaker: Server deafen:",
  invalid_data: "Invalid data!",
  user_online: ":green_circle: Online",
  user_dnd: ":red_circle: Bussy",
  user_away: ":yellow_circle: Away",
  user_offline1: ":black_circle: Offline",
  user_offline2: ":white_circle: Offline",
  command_profile: "{u}'s details on the server.",
  user_joined: ":bust_in_silhouette: Joined:",
  status: "Status:",
  active_punishments: "Active punishments:",
  mute: "Mute",
  deafen: "Deafen",
  timeout: "Timeout",
  highest_role: "Highest role:",
  minecraft_failed: "An error occurred while retrieving the data.",
  minecraft_more_players: "And {n} more players",
  minecraft_more_plugins: "And {n} more plugins",
  minecraft_status: "status:",
  type: "Type:",
  population: "Population:",
  version: "Version:",
  players: "Players:",
  plugins: "Plugins:",
  server_offline: "❌ | This server is offline.",
  game_mode: "Game mode:",
  server_id: "Server id:",
  edition: "Edition:",
  nickname: ":busts_in_silhouette:Nickname:",
  giveaway: "🎉🎉 **GIVEAWAY** 🎉🎉",
  giveaway_ended: "🎉🎉 **GIVEAWAY ENDED** 🎉🎉",
  giveaway_title: "{this.prize}",
  giveaway_drawing: "Drawing: {timestamp}",
  giveaway_dropMessage: "Be the first to react with 🎉 !",
  giveaway_inviteToParticipate: "React with 🎉 to participate!",
  giveaway_winMessage:
    "Congratulations, {winners}! You won **{this.prize}**!\n{this.messageURL}",
  giveaway_embedFooter: "{this.winnerCount} winner(s)",
  giveaway_noWinner: "Giveaway cancelled, no valid participations.",
  giveaway_hostedBy: "Hosted by: {this.hostedBy}",
  giveaway_winners: "Winner(s):",
  giveaway_endedAt: "Ended at",
  giveaway_paused: "⚠️ **THIS GIVEAWAY IS PAUSED !** ⚠️",
  giveaway_infinite: "`NEVER`",
  rating: "Rating:",
  original_title: "Original title:",
  release_date: "Release date:",
  trap_channel_kick:
    "**⚠️!WARNING!⚠️**\nIf you send a message on this channel you will be kicked!",
  trap_channel_ban:
    "**⚠️!WARNING!⚠️**\nIf you send a message on this channel you will be banned!",
  viewers_title: "Viewers:",
  twitch_live_message: "{u} has started a broadcast on Twitch.",
  game_title: "Game:",
  username_title: "Name:",
  youtube_video_message: "{u} uploaded a video to Youtube.",
  no_description: "No description",
  select_a_movie: "Select a movie",
  error_title: "Error",
  warning_title: "Warning",
  youtube_newvideo: "{u} uploaded a new video to Youtube.",
  youtube_stream: "{u} started a stream on Youtube.",
  youtube_newupcoming: "{u} uploaded an upcoming video to Youtube.",
  repeat_song: "The bot will repeat this song.",
  repeat_queue: "The bot will repeat this queue.",
  repeat_off: "You switched off the repeat mode.",
};
module.exports = language;
