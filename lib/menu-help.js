'use strict'

// Not wired to anything yet — there's no --menu / bare-tui-paparam integration in this
// repo yet. This is staged ahead of time so the copy is ready the day either lands:
//
//   - today's mechanism: pass this straight through as the `fieldHelp` option to
//     bare-tui-paparam's `runMenu`/`menuHelp` (keyed by paparam's camelCased flag/arg
//     name, shown via F1/ctrl+k on the focused field)
//   - future mechanism: once paparam ships `.hint()` (it doesn't exist yet — checked
//     both paparam and bare-tui-paparam source directly), each entry below can move
//     inline onto its flag()/arg() call in cmd/index.js instead of living here
//
// fieldHelp is flat and global across the whole command tree (keyed by bare field
// name, not per-command), so a name reused by two commands — vanity, logLevel — gets
// one shared note. Written generically enough to be true in every place it's reused.
//
// TODO(dev): confirm two open questions before this is wired up for real —
//   1. does .hint() (once it exists) get appended into description like .default()/
//      .choices() do today, or stay separate so it doesn't leak into --help output?
//   2. if a field ends up with both a .hint() and a fieldHelp entry, which wins?
const fieldHelp = {
  // touch --vanity, multisig link --vanity
  vanity:
    'A vanity prefix is found by generating keys until one starts with what you asked for — longer prefixes take exponentially longer.',
  // TODO(dev): confirm any practical length limit worth warning about above.

  // global --log-level, sidecar --log-level
  logLevel:
    'Case-insensitive; accepts the full word (info), the 3-letter form (INF), or its numeric level (2). trace is most verbose, off disables logging.',

  // provision <source-verlink> / <production-verlink>, multisig request <verlink>
  sourceVerlink:
    'A verlink is a Pear link with an explicit version pinned — unlike a bare link, it always resolves to the same content.',
  productionVerlink:
    'A verlink is a Pear link with an explicit version pinned — unlike a bare link, it always resolves to the same content.',
  verlink:
    'A verlink is a Pear link with an explicit version pinned — unlike a bare link, it always resolves to the same content.',
  // TODO(dev): confirm exact format/example before this goes live.

  // multisig keys get --secret
  secret:
    'The private key prints in plain text. Make sure nobody can see your screen or a terminal recording before using this.',

  // multisig keys add [private-key]
  privateKey:
    'Pasting the raw key string here instead of a file path may leave it visible in your shell history — prefer a file path where you can.',

  // multisig verify / multisig commit [...responses] — rest-arg field, keyed by
  // bare-tui-paparam's REST_KEY constant ('__rest'), not the literal arg name.
  __rest:
    'One response per signer who has run pear multisig sign — collect them all before verifying.',

  // cores --all-cores
  allCores:
    'An empty core has been allocated but never written to — usually leftover from an interrupted operation.'
}

// These two don't have a field to attach to — they're command-level context, not
// help for one specific flag/arg, so they can't be expressed as fieldHelp today.
// They need a command-level hint (`.hint()` on the command() call, once/if that's
// supported — worth confirming) rather than the field map above.
const commandLevelNotes = {
  'data dht':
    'DHT = Distributed Hash Table, the peer-discovery network Pear nodes use to find each other. This shows nodes your platform has already discovered.',
  'gc cores':
    "A core is a single append-only log inside Pear's local corestore. This clears ones no longer referenced by any project, freeing disk space.",
  'sidecar inspect':
    'Opens the sidecar to a debugger (Chrome DevTools / Node inspector protocol) — advanced use only.'
  // TODO(dev): confirm this description matches actual `pear sidecar inspect` behavior.
}

module.exports = { fieldHelp, commandLevelNotes }
