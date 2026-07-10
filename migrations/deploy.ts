// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

// TODO: requires the `anchor` CLI (not yet installed) to run via `anchor migrate`.

import * as anchor from "@coral-xyz/anchor";

module.exports = async function (provider: anchor.AnchorProvider) {
  anchor.setProvider(provider);

  // TODO: add deploy-time setup here once the program has real instructions
  // (e.g. initializing any global config accounts, if we end up needing one).
};
