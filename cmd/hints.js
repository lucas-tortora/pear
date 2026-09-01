'use strict'

// Long-form CLI help text, kept out of cmd/index.js and lib/cmd.js so those
// files' paparam declarations stay short. Each entry is applied via paparam's
// own .hint() on the matching flag()/arg()/rest()/command() call — see
// cmd/index.js and lib/cmd.js.
//
// Shape: { since?, until?, text } per entry, keyed by command path (nested
// for subcommands). A command's own .hint() — not one of its flags/args —
// lives under a `$` key. since/until are real fields here, not a sentence
// to parse out of the hint text itself.

const VANITY_TEXT =
  'Found by generating keys until one starts with what you asked for. More than 4 characters can take a very long time.'

const CONFIG_TEXT = 'Needs a multisig field with publicKeys, quorum and namespace.'

const NO_TTY_TEXT =
  'In the interactive form this appears as an unchecked "tty" box; checking it passes --no-tty and turns off the live UI.'

const STATS_INTERVAL_TEXT =
  'Defaults to 500 milliseconds with the live UI on, or 3000 milliseconds under --no-tty.'

const SOURCE_LINK_TEXT = 'The original (non-multisig) versioned link, not the multisig link.'

const LOG_LEVEL_TEXT =
  'Case-insensitive. Accepts the full word (info), the 3-letter form (INF), or the number (2). trace is most verbose, off disables logging.'

module.exports = {
  root: {
    v: {
      text: "Prints two identities together: the platform's own pear:// key (shown as a full fork.length.key verlink when fork/length are known, otherwise the bare key) plus the npm package SemVer beneath it. Running from a dev checkout shows a source Path line instead of Key, and drops the Fork/Length lines."
    },
    logLevel: { text: LOG_LEVEL_TEXT }
  },

  touch: {
    vanity: { since: '3.1.0', text: VANITY_TEXT }
  },

  seed: {
    link: {
      text: 'Accepts a versioned verlink too, but only the key is used — seed always replicates the full/latest history, never pinned to that version.'
    },
    noTty: { text: NO_TTY_TEXT },
    untilSync: {
      since: '3.2.0',
      text: "A peer's public key (z32). The live view lists Seeding, Drive Key, Drive Length, Discovery Key, Content Key, Firewalled, NAT Type, Whoami and Network, then an unlabelled log below — the key to use here is the one printed after each peer join or peer sync line."
    },
    statsInterval: { text: STATS_INTERVAL_TEXT }
  },

  stage: {
    link: {
      text: 'If you pass a versioned verlink, only its key is used — staging always targets the current head, ignoring the version segment.'
    },
    dir: {
      text: 'Defaults to the directory you run the command from. If it has no package.json, Pear searches upward through parent directories for one.'
    },
    dryRun: {
      text: 'Does not guard --truncate: if --truncate is also given, the drive is truncated for real before any dry-run check runs.'
    },
    ignore: {
      text: "Supports glob patterns (*, **) and a leading ! to un-ignore. Adds to — doesn't replace — any ignore list already set in pear.json."
    },
    purge: {
      text: "Also switches on automatically if the project's pear.json sets stage.purge."
    },
    only: {
      text: "Matches by exact path/directory prefix, not glob patterns like --ignore. Adds to — doesn't replace — any stage.only list in pear.json."
    },
    truncate: {
      text: 'n is the length segment of a verlink (pear://<fork>.<length>.<key>).'
    }
  },

  provision: {
    sourceVerlink: {
      text: 'Must carry a version — pear://<fork>.<length>.<key>. A bare link is rejected, because it always resolves to the latest content instead of pinning one.'
    },
    targetLink: {
      text: 'Unlike source-verlink and production-verlink, this is a bare link with no version — pear touch generates one this way, since a fresh target has no history yet to pin a version to.'
    },
    productionVerlink: {
      text: 'Must carry a version — pear://<fork>.<length>.<key>. A bare link is rejected, because it always resolves to the latest content instead of pinning one.'
    },
    dryRun: {
      text: 'Downloads and diffs against a temporary local drive instead of the real target — nothing reaches the target link itself, and no swarm announce happens for it. The temporary drive is deleted afterward.'
    }
  },

  multisig: {
    keysGet: {
      name: { text: 'Must match ^[\\w-]+$ — letters, numbers, hyphens, underscores only.' },
      secret: {
        text: 'Prints the private key in plain text. Make sure nobody can see your screen or a terminal recording before using this.'
      }
    },
    keysPaths: {
      name: {
        text: 'Prints the path unconditionally — it never checks that a key by this name was actually created.'
      }
    },
    keysAdd: {
      name: { text: 'Fails if a key already exists under this name.' },
      publicKey: {
        text: "Must be z32-encoded (the same format pear multisig keys get prints), whether given as a literal string or a file's contents."
      },
      privateKey: {
        text: 'Pasting the raw key string here instead of a file path may leave it visible in your shell history — prefer a file path where you can.'
      }
    },
    keysRemove: {
      name: {
        text: 'Permanently deletes both the public key file and (if present) the private key file — no confirmation prompt, no backup.'
      }
    },
    link: {
      config: { text: CONFIG_TEXT },
      vanity: { since: '3.1.0', text: VANITY_TEXT }
    },
    request: {
      force: {
        text: "Skips verifying that the source drive's db and blobs cores are reachable and fully seeded at the requested version — omit it and this step can block or fail if the source isn't well seeded."
      },
      config: { text: CONFIG_TEXT },
      peerUpdateTimeout: {
        text: 'Defaults to 5000 milliseconds. Only matters when --force is not set — it bounds the checks that --force skips entirely.'
      },
      verlink: {
        text: 'A verlink pins an exact version — pear://<fork>.<length>.<key> — unlike a bare link, which always resolves to the latest content.'
      }
    },
    sign: {
      request: {
        text: "Must be the z32-encoded request string, unmodified — it's decoded and structurally validated before signing, so a truncated or edited request is rejected immediately."
      },
      name: {
        text: "Selects the encrypted private key file created by pear multisig keys get <name>. You'll be prompted for the exact password used when that key was generated — there's no recovery if you forget it."
      }
    },
    verify: {
      config: { text: CONFIG_TEXT },
      peerUpdateTimeout: {
        text: 'Defaults to 5000 milliseconds. verify always runs as a dry-run, so it never reaches the separate unbounded post-commit seeding wait.'
      },
      sourceLink: { text: SOURCE_LINK_TEXT },
      request: {
        text: "Must be the z32-encoded request string, unmodified — it's decoded and structurally validated before verifying, so a truncated or edited request is rejected immediately."
      },
      responses: {
        text: 'One response per signer who has run pear multisig sign — collect them all before verifying.'
      }
    },
    commit: {
      config: { text: CONFIG_TEXT },
      peerUpdateTimeout: {
        text: 'Defaults to 5000 milliseconds, and bounds only the checks that run before the commit. The wait for remote seeders afterwards takes no timeout at all and can block indefinitely — on any commit, not just the first. Ctrl-C is the only way out.'
      },
      sourceLink: { text: SOURCE_LINK_TEXT },
      request: {
        text: "Must be the z32-encoded request string, unmodified — it's decoded and structurally validated before committing, so a truncated or edited request is rejected immediately."
      },
      responses: {
        text: 'One response per signer who has run pear multisig sign — collect them all before committing.'
      }
    }
  },

  info: {
    link: {
      text: 'Must be a pear:// link with a drive key — file: URLs and local directory paths (which dump accepts) are rejected.'
    },
    dir: {
      text: 'Currently has no effect on the output — info never reads this value; it only inspects the given link, or platform info when none is given.'
    },
    metadata: {
      text: '--metadata selects sections along with --key and --multisig; whichever you name, only those print, and metadata prints between them. --manifest is different: it prints the manifest and stops, so pairing it with --metadata gives you the manifest and nothing else.'
    },
    manifest: {
      text: 'Not a section selector like --key, --metadata and --multisig — it prints the manifest and stops there. Pair it with --key and the key still prints first; pair it with --metadata or --multisig and you get the manifest alone.'
    },
    multisig: {
      text: '--multisig selects sections along with --key and --metadata; whichever you name, only those print, and multisig prints last. --manifest is different: it prints the manifest and stops, so pairing it with --multisig gives you the manifest and nothing else.'
    },
    key: {
      text: '--key selects sections along with --metadata and --multisig; whichever you name, only those print, and the key prints first. --manifest is different: it prints the manifest and stops, but the key still appears above it.'
    }
  },

  dump: {
    link: { text: 'A pear:// link, a file: URL, or a plain local directory path.' },
    dir: { text: 'Use - instead of a path to print to stdout rather than writing files.' },
    dryRun: {
      text: 'No effect when <dir> is - or --list is set — those modes only read and print, so there is nothing being written to skip.'
    },
    checkout: {
      text: 'n is the length segment of a verlink (pear://<fork>.<length>.<key>).'
    },
    only: {
      text: 'Passing this alone still deletes matched files in <dir> that no longer exist at <link> — add --no-prune too if you want to filter without removing anything.'
    },
    force: {
      text: 'Only matters if <dir> already has files in it — an empty or not-yet-created <dir> never needs this.'
    },
    list: {
      text: '<dir> is ignored when this is set — it always prints instead of writing.'
    },
    noPrune: {
      text: 'Pruning is on unless you set this, so a plain dump deletes anything in <dir> that is not at <link>. No effect when <dir> is - or --list is set — those modes only read and print, so nothing is ever deleted either way.'
    }
  },

  install: {
    link: {
      text: 'Must be a bare pear:// origin link with no path segment — a link pointing at a sub-path inside the drive is rejected.'
    }
  },

  data: {
    dht: {
      text: 'Lists nodes this platform has already discovered. Distributed Hash Table, the peer-discovery network Pear nodes use to find each other.'
    }
  },

  changelog: {
    link: {
      text: 'Must be a pear:// link that resolves to a real drive key — a local directory path or file: URL is rejected here, unlike pear dump.'
    },
    max: {
      text: 'Must be a whole number. Also ignored when --full is set, which shows every matching entry regardless of this limit.'
    },
    of: {
      text: 'Accepts npm-style semver range syntax — e.g. ^2.0.0, ~1.4.0, 1.x.x, *, or multiple ranges joined with ||.'
    },
    full: {
      text: "Also changes what 'entire' means: with no --of override, every version in the file is included, not just the latest major."
    }
  },

  sidecar: {
    inspect: {
      text: 'Opens the sidecar for remote debugging via Chrome DevTools. The inspector key it prints must be kept secret.'
    },
    logLevel: { text: LOG_LEVEL_TEXT }
  },

  gc: {
    cores: {
      $: {
        text: "A core is a single append-only log in Pear's local corestore. This deletes the blocks one core has stored on disk, freeing that space; the core itself stays in the corestore."
      },
      linkOrName: {
        since: '3.3.0',
        text: "Clears this link's core, then its content core if the first one cleared. A core you can write to, or one the local corestore has never seen, is skipped rather than treated as an error — the output says which."
      },
      force: {
        since: '3.3.0',
        text: 'Skips the typed CLEAR confirmation prompt that otherwise appears once, up front, if any resolved core is writable. There is no non-interactive escape from that prompt — a piped or redirected stdin sends it into an infinite loop instead of an error — so this flag is mandatory for unattended use.'
      }
    }
  },

  cores: {
    allCores: {
      since: '3.2.0',
      text: 'An empty core has been allocated but never written to.'
    }
  },

  blindRelay: {
    start: {
      noTty: { text: NO_TTY_TEXT },
      statsInterval: { text: STATS_INTERVAL_TEXT }
    }
  },

  versions: {
    modules: {
      text: "Lists every package in Pear's own bundled dependencies (bare-*, hypercore-*, corestore, etc.) — not the dependencies of your own project."
    }
  },

  help: {
    command: {
      text: 'Only a single top-level command name, e.g. multisig — not a subcommand path. For a subcommand, run its own --help directly (pear multisig keys get --help) or pear help multisig for the subcommand list.'
    }
  }
}
