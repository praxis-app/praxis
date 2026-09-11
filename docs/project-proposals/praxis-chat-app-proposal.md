# Praxis - A Chat-based CDM App

Praxis is a chat-based collaborative decision-making (CDM) app that seamlessly blends informal discussion with structured decision-making processes. Groups can transition smoothly from casual conversation to formal proposals and voting without breaking flow or losing context. V1 targets a production ready experience combining chat, structured decision-making flows, and essential operational features (server management, notifications, search). This proposal outlines the full scope, implementation approach, and time estimates for two engineers working in parallel.

## Value proposition

Praxis bridges the gap between traditional collaborative decision-making platforms and mainstream chat apps. Unlike Loomio or OpenSlides, which can feel rigid, forum centric, or limited to specific organizational contexts, Praxis integrates structured decision-making directly into a familiar, real time chat environment. Unlike general purpose communication tools like Discord or Signal, Praxis will be purpose built to make creating proposals, voting, and deliberation seamless and actionable, without disrupting conversation flow or losing momentum. It provides a cohesive, all in one environment where communication and decision-making are fully integrated.

## Why chat-based?

- **Widespread familiarity** – With 3+ billion global chat app users, the interface pattern is already deeply familiar across cultures and demographics. This dramatically lowers barriers to adoption compared to traditional CDM tools, making participation more accessible.

- **Social decision-making** – Most decisions aren't purely analytical processes but deeply social ones. Chat interfaces excel at supporting the interpersonal dynamics, relationship building, and informal consensus building that precede formal decisions, creating a more holistic decision-making environment.

- **Real-time momentum preservation** – Traditional CDM tools often suffer from "context switching fatigue", where users have to leave their conversation flow to create proposals in separate interfaces. Chat-based approaches let decisions emerge organically from discussions, capturing momentum when engagement is highest.

- **Mobile-first design** – Chat interfaces are much better optimized for mobile, crucial for organizers who coordinate on-the-go. Traditional CDM tools often have clunky mobile experiences that can hinder participation.

- **Chat-first extensibility** – Chat interfaces can smoothly incorporate forum-like features (forum channels, threads, pinned content, slow mode) without disrupting the core experience. The inverse, adding fluid conversation to forum-based tools, typically results in awkward, bolted on chat features that users don't fully utilize.

- **Progressive disclosure of complexity** – Chat can start simple (just discussing) then progressively reveal more structured features (polls, ranked choice, consensus, Robert's rules) as needed. This lowers the initial learning curve compared to other options (e.g. Loomio, OpenSlides) that present all features upfront.

- **Integrated voice and video capabilities** – Chat platforms typically include VoIP and video calling, with well defined UX patterns that we can leverage. This enables quick escalation from text discussions to verbal deliberation when decisions require nuanced conversation, emotional connection, or complex negotiation. For distributed organizing, the ability to seamlessly transition between text and video within the same platform eliminates tool switching friction and keeps all participants engaged regardless of their communication preferences. (Voice/video are out of scope for V1 but slated for future development.)

## Objectives

Ship a production-ready V1 that demonstrates the core value proposition: seamless integration of chat and structured decision-making within a single interface. The initial release will support small to medium sized groups with essential features for communication, proposals, and voting, establishing a foundation for future scaling, feature expansion, and security hardening.

## Scope and Feature Set (V1)

The V1 scope matches the current roadmap for the project. The feature estimates sum to roughly 8–9 months of combined engineering effort. With two engineers working in parallel and some overlap, this translates to about 5–6 months of elapsed time; some work can be parallelized, but dependencies and integration limit full overlap.

### Basic Chat Features (about 1.5 months total)

- Reply threads: Enable threaded conversations for focus and clarity (2.5 wks).
- Forum-type channels: Structured deliberation with advanced sorting, filtering, and proposal management (1.5 wks).

### Decision-Making (about 4.5 months total)

- Proposals and voting: Core feature for structured group decisions (2.5 wks).
- General proposal type, manual: Non-functional, user defined proposals (2.5 wks).
- Proposals to change settings: Server-level settings changes executed through proposals (2.0 wks).
- Proposals to change roles: Role and permission changes executed through proposals (2.0 wks).
- Proposals to plan events: Integrated decision flow for event planning (1.0 wk).
- Majority vote model: Standard majority-based voting system (2.5 wks).
- Model of consensus: Decision model requiring full or near unanimous agreement (2.0 wks).
- Consent model: A decision passes unless objections are raised (2.0 wks).
- Basic polls: Lightweight, informal decision-making or preference collection (2.5 wks).

### Auxiliary Features (about 1.5 months total)

- Demo mode (PoC): Simplified environment for showcasing functionality (1.5 wks).
- Server management: Manage and moderate multiple chat "servers" (workspaces) per instance (1.5 wks).
- Basic search: Search messages, proposals, threads, and forum posts (1.0 wk).
- Notifications: Real-time updates and push alerts (1.0 wk).

## Implementation & Tech Stack

Praxis is implemented as a monolithic application containing both backend and frontend code in the same repository, deploying them together. The backend is located in `src/`, the frontend in `view/`, and shared TypeScript types and utilities are in `common/`. Real-time updates are handled with WebSockets and Redis, while the UI stays responsive with optimistic message sending. The data model covers channels, proposals, votes, roles and permissions, all implemented with TypeORM entities.

### Backend Technologies

- **Node.js**: Provides a unified JavaScript runtime for both frontend and backend development, enabling code sharing and reducing context switching.

- **Express**: A minimal, unopinionated web framework that provides the flexibility needed for custom routing, middleware, and WebSocket integration while keeping the codebase lightweight and maintainable.

- **TypeORM**: A TypeScript-first ORM that provides type safety, migrations, and relationship management for the application's data models (channels, proposals, votes, roles, permissions, etc.).

- **PostgreSQL**: A robust relational database that handles complex queries, transactions, and relationships while providing ACID guarantees for data integrity.

- **Redis**: Used for caching and WebSocket subscription registration for pub-sub channels.

### Frontend Technologies

- **React**: A component based UI library that enables building reusable, maintainable interfaces and complex UX flows. Its ecosystem supports rapid feature development and has a massive pool of developers and resources to pull from.

- **Vite**: A fast build tool and development server that provides near-instant hot module replacement during development and optimized production builds, significantly improving developer productivity. Will help us avoid the bloat, complexity, and slow build times of tools like Next.js.

- **React Query**: Handles server state management, caching, and synchronization for API data (messages, proposals, votes), reducing boilerplate and providing built-in loading and error states.

- **shadcn/ui**: A component collection built on Tailwind and Radix primitives that gives us well designed, accessible components we can add to the project individually as needed. It combines Tailwind's utility-first approach for rapid, consistent styling with Radix's minimally styled primitives for accessible UI patterns, giving us full ownership and customization of our components.

## Security & Privacy

Authentication uses JWT tokens with 90-day expiration, bcrypt password hashing (10 salt rounds), and rate limiting on login endpoints (5 attempts per 10 minutes with automatic account locking). The authorization model is built on CASL with hierarchical roles scoped at both "server" (workspace) and instance levels, enforcing permissions through middleware that checks actions (create, read, update, delete, manage) against subjects (channels, messages, polls, roles). Channel access is controlled via membership checks and invite-based entry for private servers, with WebSocket subscriptions validated against channel membership before allowing real-time updates.

Messages and proposals are encrypted at rest using AES-256-GCM with per-channel encryption keys wrapped by a master key, ensuring that content is protected in the database. All client-server communication uses HTTPS (TLS) for encryption in transit. Access controls enforce channel-level boundaries, with a default (demo) server being public and private servers requiring explicit membership or valid invite tokens. Future hardening opportunities include end-to-end encryption, token refresh mechanisms, and enhanced audit logging.

## Hosting & Infrastructure (initial phase)

A single small VPS on DigitalOcean with 1 vCPU and 2 GB of RAM is enough for early development, demos, and pilot usage. One registered domain will be needed for the web app. PostgreSQL and Redis can share the VPS at first, with a plan to move them to managed services before broader rollout. HTTPS should use managed certificates such as Let’s Encrypt with a reverse proxy like Nginx on the VPS.

## Success Metrics

Measure success by completing the V1 roadmap and exiting a structured QA/pilot phase ready for initial rollout. Milestones include: all V1 features functionally complete, high priority QA issues triaged and fixed, and pilot team feedback incorporated into a readiness review for launch.

## Next Steps

Proceed with the initial deployment scaffolding to unblock development, keep the V1 roadmap as the guiding scope for the first six weeks, and find an additional engineer to help with the workload and accelerate delivery.
