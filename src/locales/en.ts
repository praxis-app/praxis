import { pluralize } from "../utils/items";

const en = {
  brand: () => "praxis",

  actions: {
    add: () => "Add",
    close: () => "Close",
    copy: () => "Copy",
    create: () => "Create",
    delete: () => "Delete",
    deleteItem: (itemType: string) => `Delete ${itemType}`,
    edit: () => "Edit",
    pickColor: () => "Pick a Color",
    save: () => "Save",
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
    somethingWrong: () => "Something went wrong...",
    imageUploadError: () => "Unable to upload image(s)",
    posts: {
      postCreationError: () => "Unable to create post", // I don't like this message but I can't think of another
      postUpdateError: () => "Post could not be edited",
    },
    comments: {
      commentCreationError: () => "Unable to post comment",
      commentUpdateError: () => "Unable to update comment",
    },
  },

  forms: {
    none: () => "None",
  },

  navigation: {
    users: () => "Users",
    groups: () => "Groups",
    roles: () => "Roles",
  },

  about: {
    welcomeCard: {
      welcome: () => "Welcome to Praxis",
      about:
        () => `Praxis is an open source social networking site. Groups are the main
      focus and come with a wide variety of voting features. Create a group
      and set it to no-admin, allowing group members to create motions and
      democratically decide on settings, name, theme, and more.`,
      inDev: () => "This project is still in development.",
    },
  },

  users: {
    actions: {
      logIn: () => "Log in",
      logOut: () => "Log out",
      signUp: () => "Sign up",
      passwordConfirm: () => "Confirm password",
    },
    form: {
      name: () => "Name",
      email: () => "Email",
      password: () => "Password",
    },
    joinedWithDate: (date: string) => `Joined ${date}`,
    following: (size: number) => `${size} Following`,
    followers: (size: number) => `${size} Follower${pluralize(size)}`,
    validation: {
      invalidEmail: () => "Email is invalid",
      emailRequired: () => "Email is required",
      emailExists: () => "Email already exists",
      noUserWithEmail: () => "No user exists with that email",
      passwordLength: (min: number, max: number) =>
        `Password must be between ${min} and ${max} chars`,
      passwordRequired: () => "Password is required",
      passwordConfirmMatch: () => "Password and Confirm Password must match",
      wrongPassword: () => "Wrong password. Try again",
      nameLength: (min: number, max: number) =>
        `Name must be between ${min} and ${max} chars`,
      nameRequired: () => "Name is required",
    },
    permissionDenied: () => "Permission denied.",
    alreadyLoggedIn: () => "You're already signed in...",
    alreadyRegistered: () => "You have already created an account...",
  },

  posts: {
    actions: {
      post: () => "Post",
    },
    form: {
      bodyPlaceholder: () => "Post something awesome...",
      postEmpty: () => "Post cannot be empty!",
    },
  },

  motions: {
    actions: {
      motion: () => "Motion",
    },
    toActionWithRatified: (action: string, ratified: boolean) =>
      ` · Motion to ${action.replace(/-/g, " ")}${
        ratified ? " · Ratified ✓" : ""
      }`,
    form: {
      makeAMotion: () => "Make a motion...",
      motionType: () => "Motion type",
      actionTypes: {
        planEvent: () => "Plan event",
        changeName: () => "Change name",
        changeDescription: () => "Change description",
        changeImage: () => "Change group image",
        changeSettings: () => "Change group settings",
        test: () => "Just a test",
      },
    },
    tabs: {
      votes: () => "Votes",
      comments: () => "Comments",
    },
    groups: {
      proposedAspect: (aspect: string) => `Proposed ${aspect}:`,
      actionFields: {
        inDev: () => "This action type is still in development...",
        newAspect: (aspect: string) => `New group ${aspect}`,
        attachImage: () => "Attach new group image",
      },
    },
  },

  votes: {
    actions: {
      support: () => "Support",
      block: () => "Block",
      update: () => "Update vote",
    },
    form: {
      bodyPlaceholder: {
        support: () => "Why do you support this motion?",
        agreement: () => "Why do you agree with this motion?",
        reservations: () => "What reservations do you have with this motion?",
        standAside: () => "Why are you delclaring a stand aside?",
        block: () => "Why are you blocking this motion?",
      },
      supportOrBlock: () => "Vote to support or block",
      agreeOrDisagree: () => "Express your agreement or disagreement",
    },
    votingTypes: {
      consensus: () => "Model of consensus",
      xToPass: () => "X to pass or block",
      majority: () => "Majority vote",
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
          agreement: () => "Vote of agreement",
          reservations: () => "Agreement with reservations",
          standAside: () => "Vote to stand aside",
          block: () => "Vote to block",
        },
      },
    },
    voteTypeLabel: {
      support: () => "Vote of support",
      block: () => "Vote to block",
    },
    verifiedWithCheck: () => "Verified ✓",
  },

  comments: {
    actions: {
      comment: () => "Comment",
    },
    form: {
      leaveAComment: () => "Leave a comment...",
    },
  },

  groups: {
    actions: {
      cancelRequest: () => "Cancel request",
      leave: () => "Leave",
      join: () => "Join",
    },
    form: {
      name: () => "Name",
      description: () => "Description",
    },
    itemWithNameAndRatified: (
      itemType: string,
      name: string,
      ratified: boolean
    ) => `Group ${itemType} by ${name}${ratified ? " · Ratified ✓" : ""}`,
    tabs: {
      all: () => "All",
      posts: () => "Posts",
      motions: () => "Motions",
    },
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
    setToNoAdmin:
      () => `This group has been irriversibly set to no-admin — All changes to the
    group must now be made via motion ratification.`,
  },

  roles: {
    actions: {
      addMembers: () => "Add members",
      initializeAdminRole: () => "Initialize Admin Role",
    },
    form: {
      name: () => "name",
      colorPickerLabel: () => "Role Color",
    },
    prompts: {
      initializeAdminRoleConfirm: () =>
        "Are you sure you want to create an admin role for this server? If you did not create this server or haven't been granted permission otherwise, please hit 'Cancel'.",
    },
    breadcrumb: () => "Roles",
    members: {
      prompts: {
        removeMemberConfirm: () =>
          "Are you sure you want to remove this member?",
      },
      nMembers: (size: number) => `${size} Member${pluralize(size)}`,
    },
    permissions: {
      names: {
        manageItems: (itemType: string) => `Manage ${itemType}s`,
      },
      descriptions: {
        manageItems: (itemType: string) =>
          `Allows members to delete ${itemType}s by other members.`,
        manageRoles: () =>
          "Allows members to create new roles and edit or delete roles lower than their highest role.",
        manageUsers: () =>
          "Allows members to view the full list of server members and permanently delete their accounts.",
        manageInvites: () =>
          "Allows members to view the full list of server invites.",
        createInvites: () =>
          "Allows members to invite new people to this server.",
      },
    },
    serverRoles: () => "Server Roles",
    noRoles: () => "No roles have been created for this server yet.",
  },

  invites: {
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
        never: () => "Never",
      },
      maxUsesOptions: {
        noLimit: () => "No limit",
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

  images: {
    couldNotRender: () => "Data could not render.",
  },

  items: {
    notFound: (itemType: string) => `${itemType} not found.`,
  },

  time: {
    now: () => "now",
    minutes: (minutes: number) => `${minutes}m`,
    hours: (hours: number) => `${hours}h`,
    days: (days: number) => `${days}d`,
    infinity: () => "∞",
  },

  middotWithSpaces: () => " · ",
};

export default en;
