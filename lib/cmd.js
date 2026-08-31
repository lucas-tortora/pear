'use strict'
const { flag, command, arg, rest } = require('paparam')

const definition = [
  flag('-v', 'Print version').hint(
    "Prints two identities together: the platform's own pear:// key (shown as a full fork.length.key verlink when fork/length are known, otherwise the bare key) plus the npm package SemVer beneath it. Running from a dev checkout shows a source Path line instead of Key, and drops the Fork/Length lines."
  ),
  flag('--log-level|-L <level>', 'Verbosity to log at — 0=off, 1=error, 2=info, or 3=trace').hint(
    'Case-insensitive. Accepts the full word (info), the 3-letter form (INF), or the number (2). trace is most verbose, off disables logging.'
  ),
  // Internal: boot.js dispatches on this token (getBootType) and cli.js spawns the
  // sidecar daemon with it. Not user-facing — `pear sidecar` is the equivalent for
  // humans — so hidden rather than hinted: hiding keeps it out of both --help and the
  // --menu command picker, where every listed flag reads as user-facing.
  flag('--sidecar', 'Internal. Boot this process as the sidecar').hide(),
  flag('--dht-bootstrap <nodes>').hide(),
  flag('--menu', 'Interactive command picker').hide()
]

module.exports = {
  definition,
  command: (argv) =>
    command('pear', ...definition, arg('[cmd]'), rest('rest')).parse(argv, {
      // Used only for bootstrap flag extraction. Defer unknown flags and other CLI errors to the main parser.
      bails: false
    })
}
