const en = {
  brand: () => "praxis",

  actions: {
    create: () => "Create",
    delete: () => "Delete",
    edit: () => "Edit",
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

  navigation: {
    users: () => "Users",
    groups: () => "Groups",
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
    joinedWithData: (date: string) => `Joined ${date}`,
    following: (size: number) => `${size} Following`,
    followers: (size: number) => `${size} Followers`,
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
        support: () => "Why do you support this motion? (optional)",
        block: () => "Why are you blocking this motion? (optional)",
      },
      supportOrBlock: () => "Vote to support or block",
    },
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
    members: (size: number) => `${size} Members`,
    requests: (size: number) => `${size} Requests`,
    memberRequests: (size: number) => `${size} Member Requests`,
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

  images: {
    couldNotRender: () => "Data could not render.",
  },

  items: {
    notFound: (itemType: string) => `${itemType} not found.`,
  },
};

export default en;
