import { pluralize } from "../utils/items";

const en = {
  brand: () => "praxis",

  actions: {
    add: () => "Add",
    cancel: () => "Cancel",
    close: () => "Close",
    confirm: () => "Confirm",
    copy: () => "Copy",
    create: () => "Create",
    delete: () => "Delete",
    deleteItem: (itemType: string) => `Delete ${itemType}`,
    edit: () => "Edit",
    like: () => "Like",
    pickColor: () => "Pick a Color",
    save: () => "Save",
    seeMore: () => "See More",
    search: () => "Search Praxis",
    share: () => "Share",
    submit: () => "Submit",
  },

  labels: {
    all: () => "All",
  },

  states: {
    loading: () => "Loading...",
    saving: () => "Saving...",
  },

  prompts: {
    logOut: () => "Are you sure you want to log out?",
    deleteItem: (itemType: string) =>
      `Are you sure you want to delete this ${itemType}?`,
  },

  errors: {
    somethingWrong: () => "Something went wrong.",
    imageUploadError: () => "Unable to upload images.",
  },

  forms: {
    none: () => "None",
  },

  navigation: {
    events: () => "Events",
    home: () => "Home",
    invites: () => "Invites",
    menu: () => "Menu",
    preferences: () => "Preferences",
    profile: () => "Profile",
    users: () => "Users",
    groups: () => "Groups",
    roles: () => "Roles",
  },

  about: {
    labels: {
      about: () => "About",
    },
    welcomeCard: {
      welcome: () => "Welcome to Praxis",
      about: () =>
        `Praxis is an open source social networking site. Motions are the main focus and come with a wide variety of voting features, with consensus as the default. Create a group and set it to no-admin, allowing group members to create motions and democratically decide on settings, name, theme, or planning of real world events.`,
      inDev: () => "This project is still in development.",
    },
  },

  users: {
    actions: {
      editProfile: () => "Edit Profile",
      follow: () => "Follow",
      unfollow: () => "Unfollow",
      logIn: () => "Log in",
      logOut: () => "Log out",
      signUp: () => "Sign up",
      passwordConfirm: () => "Confirm password",
    },
    form: {
      bio: () => "Bio",
      coverPhoto: () => "Cover Photo",
      describeYourself: () => "Describe yourself...",
      email: () => "Email",
      name: () => "Name",
      password: () => "Password",
      profilePicture: () => "Profile Picture",
      setCoverPhoto: () => "Set a cover photo...",
    },
    joinedWithDate: (date: string) => `Joined ${date}`,
    following: () => "Following",
    followingWithSize: (size: number) => `${size} Following`,
    followersWithSize: (size: number) => `${size} Follower${pluralize(size)}`,
    errors: {
      signUp: () => "There was an error creating your account.",
      update: () => "There was an error updating your account.",
    },
    validation: {
      invalidEmail: () => "Email is invalid.",
      emailRequired: () => "Email is required.",
      emailExists: () => "Email already exists.",
      noUserWithEmail: () => "No user exists with that email.",
      passwordLength: (min: number, max: number) =>
        `Password must be between ${min} and ${max} chars.`,
      passwordRequired: () => "Password is required.",
      passwordConfirmMatch: () => "Password and Confirm Password must match.",
      wrongPassword: () => "Wrong password. Please try again.",
      nameLength: (min: number, max: number) =>
        `Name must be between ${min} and ${max} chars.`,
      nameRequired: () => "Name is required.",
    },
    permissionDenied: () => "Permission denied.",
    alreadyLoggedIn: () => "You're already signed in.",
    alreadyRegistered: () => "You have already created an account.",
  },

  posts: {
    actions: {
      post: () => "Post",
    },
    form: {
      whatsHappening: () => "What's happening?",
      postEmpty: () => "Post cannot be empty.",
      saySomething: () => "Say something...",
    },
    errors: {
      create: () => "Unable to create post.",
      update: () => "Post could not be edited.",
    },
  },

  motions: {
    actions: {
      motion: () => "Motion",
    },
    prompts: {
      noEditAfterVoting: () =>
        "Motions cannot be edited after voting has started.",
    },
    ratified: () => "Ratified",
    form: {
      makeAMotion: () => "Make a motion...",
      motionType: () => "Motion type",
      actionTypes: {
        planEvent: () => "Plan event",
        changeName: () => "Change group name",
        changeDescription: () => "Change about text",
        changeImage: () => "Change cover photo",
        changeSettings: () => "Change group settings",
        changeRules: () => "Change group rules",
        createRole: () => "Create a group role",
        changeRole: () => "Change a group role",
        assignRole: () => "Assign a group role",
        test: () => "Just a test",
      },
      motionEmpty: () => "Motion cannot be empty.",
      enterProposedSettings: () => "Enter your proposed settings below...",
      inputLabels: {
        group: () => "Group",
        member: () => "Member",
        role: () => "Role",
      },
    },
    errors: {
      create: () => "Unable to create motion.",
      update: () => "Motion could not be edited.",
    },
    tabs: {
      comments: () => "Comments",
      groupSettings: () => "Group Settings",
      motion: () => "Motion",
      votes: () => "Votes",
    },
    groups: {
      proposedAspect: (aspect: string) => `Proposed ${aspect}`,
      proposedRoleChange: () => "Proposed role changes",
      proposedRoleAssignment: () => "Proposed role assignment",
      actionFields: {
        inDev: () => "This motion type is still in development...",
        newAspect: (aspect: string) => `New group ${aspect}`,
        attachImage: () => "Attach new group image",
      },
    },
    toasts: {
      ratifiedInfo: () =>
        "This motion has been ratified and can no longer be voted on.",
      ratifiedSuccess: () => "This motion has been ratified! 🎉",
    },
  },

  votes: {
    actions: {
      agree: () => "Agree",
      block: () => "Block",
      disagree: () => "Disagree",
      reservations: () => "Reservations",
      standAside: () => "Stand Aside",
      update: () => "Update vote",
      vote: () => "Vote",
    },
    form: {
      bodyPlaceholder: {
        agreement: () => "Why do you agree with this motion?",
        disagreement: () => "Why do you disagree with this motion?",
        reservations: () => "What reservations do you have with this motion?",
        standAside: () => "Why are you delclaring a stand aside?",
        block: () => "Why are you blocking this motion?",
      },
      agreeOrDisagree: () => "Express your agreement or disagreement",
    },
    errors: {
      create: () => "Unable to cast vote.",
      update: () => "Vote could not be edited.",
    },
    votingTypes: {
      consensus: () => "Model of Consensus",
      xToPass: () => "X to Pass or Block",
      majority: () => "Majority Vote",
    },
    consensus: {
      voteTypes: {
        names: {
          agreement: () => "Agreement",
          reservations: () => "Reservations",
          standAside: () => "Stand Aside",
          block: () => "Block",
        },
        descriptions: {
          agreement: () =>
            "I support the motion and I'm willing to implement it.",
          reservations: () =>
            "I have problems with it but I'll go along with it.",
          standAside: () =>
            "I can't support this and I won't implement it but I don't want to stop it.",
          block: () =>
            "I have a fundamental disagreement with the core of the motion and I don't want it to happen.",
        },
        labels: {
          agreement: () => "Agree",
          reservations: () => "Reservations",
          standAside: () => "Stand Aside",
          block: () => "Block",
        },
      },
    },
    voteTypeLabel: {
      agreement: () => "Agree",
      disagreement: () => "Disagree",
    },
  },

  comments: {
    actions: {
      comment: () => "Comment",
    },
    form: {
      leaveAComment: () => "Leave a comment...",
    },
    errors: {
      create: () => "Unable to post comment.",
      update: () => "Unable to edit comment.",
    },
    totalComments: (total: number) => `${total} Comment${pluralize(total)}`,
  },

  groups: {
    actions: {
      approve: () => "Approve",
      cancelRequest: () => "Cancel Request",
      leave: () => "Leave",
      join: () => "Join",
      manageRoles: () => "Manage Roles",
      remove: () => "Remove",
    },
    prompts: {
      leaveGroup: () => "Are you sure you want to leave this group?",
      removeGroupMember: () =>
        "Are you sure you want to remove this member from the group?",
    },
    form: {
      name: () => "Name",
      description: () => "Description",
    },
    errors: {
      create: () => "Unable to create group.",
      update: () => "Group could not be edited.",
    },
    tabs: {
      feed: () => "Feed",
      motions: () => "Motions",
      events: () => "Events",
      about: () => "About",
    },
    breadcrumbs: {
      about: () => "About",
      editGroup: () => "Edit Group",
      groups: () => "Groups",
      groupRoles: () => "Group Roles",
    },
    joined: () => "Joined",
    members: (size: number) => `${size} Member${pluralize(size)}`,
    requests: (size: number) => `${size} Request${pluralize(size)}`,
    memberRequests: (size: number) =>
      `${size} Member Request${pluralize(size)}`,
    notFound: {
      member: () => "Member not found.",
      request: () => "Request not found.",
    },
    settings: {
      name: () => "Settings",
      nameWithGroup: () => "Group Settings",
    },
    setToNoAdmin: () =>
      "This group has been set to no-admin — All changes to the group must now be made by motions.",
    votingTypeLabels: {
      consensus: () => "Consensus",
      majority: () => "Majority Vote",
      xToPass: () => "X to Pass",
    },
  },

  settings: {
    states: {
      on: () => "On",
      off: () => "Off",
    },
    groups: {
      names: {
        noAdmin: () => "No Admin",
        votingType: () => "Voting Model",
        ratificationThreshold: () => "Ratification Threshold",
        reservationsLimit: () => "Reservations Limit",
        standAsidesLimit: () => "Stand Asides Limit",
        xToPass: () => "X to Pass",
        xToBlock: () => "X to Block",
      },
      descriptions: {
        noAdmin: () =>
          "Turn on No Admin to ensure that all changes to the group are made via motions.",
        votingType: () =>
          "Choose the type of voting model you wish to use. This will be used to determine how motions are passed.",
        ratificationThreshold: () =>
          "Set a threshold for the number of positive votes required for ratification to occur.",
        reservationsLimit: () =>
          "Set a limit for the acceptable number of reservations allowed for a motion to still be able to pass.",
        standAsidesLimit: () =>
          "Set a limit for the acceptable number of stand asides allowed for a motion to still be able to pass.",
        xToPass: () =>
          "Set a threshold for the number of positive votes required for a motion to pass.",
        xToBlock: () =>
          "Set a threshold for the number of negative votes required for a motion to be blocked.",
      },
    },
  },

  roles: {
    actions: {
      addMembers: () => "Add members",
      initializeAdminRole: () => "Initialize Admin Role",
    },
    form: {
      name: () => "Name",
      colorPickerLabel: () => "Role Color",
    },
    errors: {
      create: () => "Unable to create role.",
      update: () => "Unable to update role.",
    },
    prompts: {
      initializeAdminRoleConfirm: () =>
        "Are you sure you want to create an admin role for this server? If you did not create this server or haven't been granted permission otherwise, please hit 'Cancel'.",
    },
    tabs: {
      display: () => "Display",
      permissions: () => "Permissions",
      members: () => "Members",
    },
    breadcrumbs: {
      groupRoles: () => "Group Roles",
      roles: () => "Roles",
    },
    members: {
      prompts: {
        removeMemberConfirm: () =>
          "Are you sure you want to remove this member?",
      },
      nMembers: (size: number) => `${size} Member${pluralize(size)}`,
    },
    permissions: {
      names: {
        acceptMemberRequests: () => "Approve Member Requests",
        createEvents: () => "Create Events",
        createInvites: () => "Create Invites",
        deleteGroup: () => "Delete Group",
        editGroup: () => "Edit Group",
        kickGroupMembers: () => "Kick Members",
        manageUsers: () => "Manage Members",
        manageEvents: () => "Manage Events",
        managePosts: () => "Manage Posts",
        manageComments: () => "Manage Comments",
        manageInvites: () => "Manage Invites",
        manageRoles: () => "Manage Roles",
        manageSettings: () => "Manage Settings",
      },
      descriptions: {
        editGroup: () =>
          "Allows members to edit the group's name, description, and cover photo.",
        deleteGroup: () => "Allows members to permanently delete this group.",
        createEvents: () => "Allows members to create and plan events.",
        manageEvents: () =>
          "Allows members to remove events created by other members.",
        managePosts: () => "Allows members to delete posts by other members.",
        manageComments: () =>
          "Allows members to remove comments by other members.",
        manageRoles: () =>
          "Allows members to create new roles and edit or delete roles lower than their highest role.",
        manageGroupSettings: () =>
          "Allows members to make changes to this group's settings.",
        acceptMemberRequests: () =>
          "Allows members to view member requests and to allow new members to join the group.",
        kickGroupMembers: () =>
          "Allows members to remove other members from the group.",
        manageUsers: () =>
          "Allows members to view the full list of server members and kick other members from the server.",
        manageInvites: () =>
          "Allows members to view the full list of server invites.",
        createInvites: () =>
          "Allows members to invite new people to this server.",
      },
      states: {
        enabled: () => "Enabled",
        disabled: () => "Disabled",
      },
    },
    groupRoles: () => "Group Roles",
    serverRoles: () => "Server Roles",
    noRoles: () => "No roles have been created for this server yet.",
    noMembersOrPermissions: () =>
      "This role has no permissions enabled and no assigned members.",
  },

  invites: {
    actions: {
      generate: () => "Generate a New Link",
    },
    labels: {
      invites: () => "Invites",
      serverInvites: () => "Server Invites",
    },
    columnNames: {
      inviter: () => "INVITER",
      code: () => "CODE",
      uses: () => "USES",
      expires: () => "EXPIRES",
    },
    prompts: {
      removeInviteConfirm: () => "Are you sure you want to remove this invite?",
    },
    form: {
      expiresAtOptions: {
        oneDay: () => "1 day",
        sevenDays: () => "7 days",
        oneMonth: () => "1 month",
        never: () => "Never (default)",
      },
      maxUsesOptions: {
        noLimit: () => "No limit (default)",
        xUses: (x: number) => `${x} use${x === 1 ? "" : "s"}`,
      },
      labels: {
        expiresAt: () => "Expires after",
        maxUses: () => "Max number of uses",
      },
    },
    redeem: {
      alreadySignedUp: () => "You've already signed up.",
      expiredOrInvalid: () => "Your invite link is either expired or invalid.",
      inviteRequired: () => "You need to be invited in order to sign up.",
    },
    copiedToClipboard: () => "Copied to clipboard",
  },

  events: {
    actions: {
      create: () => "Create Event",
    },
    prompts: {
      noUpcoming: () => "No upcoming events.",
      noneThisWeek: () => "No events happening this week.",
      noneOnline: () => "No online events.",
      noPast: () => "No past events.",
    },
    form: {
      description: () => "Description",
      endsAt: () => "End Date and Time",
      externalLink: () => "External Link",
      http: () => "http://",
      includeAddress: () => "Include a place or address",
      location: () => "Location",
      name: () => "Name",
      onlineSubtext: () => "Plan a virtual event",
      startsAt: () => "Start Date and Time",
    },
    errors: {
      create: () => "Unable to create event.",
      update: () => "Event could not be updated.",
    },
    breadcrumbs: {
      editEvent: () => "Edit Event",
      event: () => "Event",
    },
    timeFrames: {
      past: () => "Past Events",
      future: () => "Upcoming Events",
    },
    attendance: {
      going: () => "Going",
      interested: () => "Interested",
    },
    online: {
      online: () => "Online",
      onlineEvent: () => "Online Event",
    },
    tabs: {
      about: () => "About",
      discussion: () => "Discussion",
      upcoming: () => "Upcoming",
      thisWeek: () => "This Week",
      past: () => "Past",
    },
    by: () => "Event by ",
    discover: () => "Discover Events",
    whatToExpect: () => "What To Expect",
  },

  images: {
    couldNotRender: () => "Data could not render.",
  },

  items: {
    notFound: (itemType: string) => `${itemType} not found.`,
  },

  pagination: {
    rowsPerPage: () => "Rows per page: ",
  },

  time: {
    now: () => "now",
    hr: () => "hr",
    min: () => "min",
    minutes: (minutes: number) => `${minutes}m`,
    hours: (hours: number) => `${hours}h`,
    days: (days: number) => `${days}d`,
    infinity: () => "∞",
  },

  development: {
    notImplemented: () => "This feature has not yet been implemented.",
  },

  middotWithSpaces: () => " · ",
};

export default en;
