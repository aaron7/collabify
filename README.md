# Collabify

Collabify let's you host one-off collaborative sessions for your markdown :rocket:

<p align="center">
  <img width="838" src="https://github.com/user-attachments/assets/4f5b0cfb-afe2-4fee-8212-710eb9bf2efb" />
</p>

- **Launch from web:** https://collabify.it/new

- **Launch from [CLI](https://github.com/aaron7/collabify-cli)** which automatically syncs back when the session ends:

  ```sh
  brew tap aaron7/collabify
  brew install aaron7/collabify/cli

  collabify ./my-notes.md
  ```

<!-- TOC start -->

## Table of contents

- [Motivation](#motivation)
- [Why build on CodeMirror and not another toolkit?](#why-build-on-codemirror-and-not-another-toolkit)
- [Live preview CodeMirror 6 extensions](#live-preview-codemirror-6-extensions)
- [What's next?](#whats-next)
- [Security](#security)
- [Development](#development)
- [Contributions](#contributions)

<!-- TOC end -->

## Motivation

My co-workers and I wished we could collaboratively edit Markdown just like a Google Doc. Unfortunately tools which support components like code blocks (e.g. Notion) are not always available to use. And tools like Google Docs or Microsoft Word are not the best for certain types of meeting notes or documentation. We often resorted to starting a VSCode live share session, which is only great for engineers and is quite heavy-weight for editing a document.

I use Obsidian daily and love the live preview. Collabify is a quick project to bring a (simplified) Obsidian-like editor to the web for quick collaborative Markdown sessions. It's not designed to replace your favourite Markdown editor, but to make collaboration simple when you need it. It's built on top of [CodeMirror](https://codemirror.net/), with some extensions to create a live preview effect (see [Why build on CodeMirror and not another toolkit?](#why-build-on-codemirror-and-not-another-toolkit)). It uses [Yjs](https://yjs.dev/) for collaboration. And it uses WebRTC for peer-to-peer communication, with a STUN and TURN server available to use for NAT traversal.

I've aimed to ensure sessions are private, with end-to-end encryption and a shared key that never touches a server, and zero analytics and accounts. The build is statically served via CloudFlare pages, and a simple signalling server is used to connect peers over WebRTC. Please see [Security](#security) for more information.

## Why build on CodeMirror and not another toolkit?

I first looked at toolkits like [ProseMirror](https://prosemirror.net/) and [Lexical](https://lexical.dev/) which have markdown support, including frameworks like [TipTap](https://tiptap.dev/) and [Milkdown](https://milkdown.dev/) which are built on top of ProseMirror. ProseMirror and Lexical are excellent, but I realised they had some drawbacks for an editor which loads and saves back Markdown files. Not surprisingly, Obsidian also builds on top of CodeMirror.

I would still recommend using something like ProseMirror for most WYSIWYG editors, including where Markdown support is required. The following drawbacks are only for applications which load and save back Markdown files which may be edited by other tools, where you may have engineers who find WYSIWYG editors can sometimes get in the way, or where you need to sync in real time with another editor that only has a text state.

### The state: Plain text vs AST

The first drawback is related to how toolkits like ProseMirror use an Abstract Syntax Tree (AST) for their state. When loading a Markdown file, they build an AST where information can be lost. For example, there are several ways to represent lists in Markdown (`*` , `-`, `+`) and in most toolkits this kind of information is dropped. When saving the file, converting back from an AST, all lists may then use a different syntax. It would be unexpected to load a markdown file, make no changes, and have the saved file be reformatted because of the AST conversion. It's possible to extend the AST to support this, but it adds significant complexity.

Although it has many of it's own drawbacks, keeping a plain text state simplifies this problem. The markdown is only modified by a user's action, with any visual helpers or live preview infered from the plain text state.

### Syncing with other editors or visual modes

Another benefit of keeping a plain text state is that it's simple to allow a collaborator to disable visual rendering if they prefer to edit plain text, while keeping live cursors. It's also easier to sync with editors that also use a plain text state like VSCode and Obsidian, making it possible for collaborative editing across web and any local editor (on the what's next list). With an AST state, mapping live cursors and selections to the equivalent plain text Markdown is a complex problem.

### WYSIWYG blocks sometimes get in the way

It should be possible to type and edit markdown syntax without the editor getting in the way. Using toolkits like ProseMirror for editing Markdown work well, but can frustrate some users. A common example is typing `# Title`, then trying to change it to `## Title` using the keyboard but the editor gets in the way because it created a block which absorbed the Markdown syntax. Handling triple backtick codeblocks are also a common issue. An editor should ideally not surprise a user who's editing Markdown via their keyboard. However, auto-completations are still useful.

## Live preview CodeMirror 6 extensions

For this project, I created some CodeMirror 6 extensions to achieve the live preview effect. It gives the best of both worlds. When you are editing something, it shows the syntax, but hides it otherwise. The exception is for tables which are best rendered as a table component (on the what's next list).

If you are interested in using these extensions in your CodeMirror-based project, please reach out and I can prioritise making them published packages outside Collabify. There are bound to be many improvements and bug fixes we can share.

## What's next?

Through using Collabify in some meetings, good ideas to work on next include:

- [ ] Editor plugins. To make the workflow as smooth as possible, being able to launch from your favourite editor and sync back automatically is essential.
  - [ ] VSCode - We should be able to re-use the `collabify-cli` binary
  - [ ] Obsidian - Will require reimplementing some of the logic in `collabify-cli`
- [ ] Visual table editor (there's a prototype)
- [ ] Mermaid diagram rendering with a friendly collaborative experience
- [ ] Helpful user tracking
  - [ ] Clicking a user to follow their position
  - [ ] Visual indicator of where a user is in a document
- [ ] Math blocks
- [ ] Heading outline sidebar
- [ ] Support uploading images and saving these locally when exporting or syncing back.
- [ ] Workflow improvements e.g. starting from a template `collabify -t templates/kickoff.md 2024-01-01-kickoff.md`

## Security

**Disclaimer:** I'm a product engineer with professional experience, however I'm not an expert in security. No web application is perfectly secure. I've aimed to follow best practices and have designed the app to have zero trust in any server it communicates with.

### Trust of the build hosted at https://collabify.it

The single-page application (SPA) has been designed to have zero trust in any server it communicates with. But like with any web app, the third party dependencies and the infrastructure serving the specific JS build at https://collabify.it requires trust. For third party dependencies, I've tried to only use packages where it makes sense and have setup Renovate. If the infrastructure or JS build is a concern, you can serve your own build on GitHub Pages.

https://collabify.it currently serves builds directly from the `main` branch via CloudFlare Pages.

If I am no longer actively maintaining https://collabify.it, I plan to update the `README.md` and add a popup message to https://collabify.it with notice.

### Shared secret

The SPA generates a random room ID and shared secret for each document. These are stored in your browser's local storage. Anyone with access to your browser will be able to access the shared secret, however the shared secret is only useful when there is a active session. When sharing the invite URL with others, these only appear in the URL fragment (after the `#`) which browsers never pass to the web server and only use locally. This allows sharing the secret without it touching any server.

### Signalling server

A simple signalling server is used to connect peers at `signaling.collabify.it`, with a secondary server at `signaling2.collabify.it` (I'm testing a more scalable setup for fun :smile:). It is given the room ID but never the shared secret or other data. Document data is shared over WebRTC with end-to-end encrypted payloads. An untrusted signalling server should not be able to perform a man in the middle attack.

### STUN and TURN

A STUN and TURN server is used for difficult NAT traversal situations. I host a server at `turn.collabify.it`, with a fallback using TLS on port 443 to get through most corporate setups. The WebRTC payloads are encrypted using a key derived from the shared secret. If a TURN server is used, it terminates the TLS connection but cannot decrypt the WebRTC payloads.

**Note:** I've rate limited the TURN server bandwidth per connection so it's only useful for text collaboration (and not video :sweat_smile:). Collabify doesn't use accounts, so it's not possible to fully restrict usage of the TURN server. In the future I would like to setup CloudFlare's TURN service with short-term credentials, or at least setup short-term credentials for `turn.collabify.it`. This doesn't have any security implications for users of Collabify, but if you are a developer, please don't use this TURN server for your own application. Thank you :slightly_smiling_face:

### IndexedDB

IndexedDB is used to store the document state locally to allow easy session recovery. This is currently not cleared after a session. Making this optional (and/or expire) is on the TODO list.

## Development

- `pnpm install`
- `pnpm --filter app dev` for development.
- `pnpm -r test` to run all tests.
- `pnpm -r build` for all production builds.

## Contributions

If anyone would like to help, contributions are welcome. Feel free to reach out to me to say hi :wave:
