'use strict'
const { flag, command, arg, rest } = require('paparam')

const definition = [
  flag('-v', 'Print version'),
  flag('--log-level|-L <level>', 'Level to log at. 0,1,2,3 (OFF,ERR,INF,TRC)').hint(
    'Case-insensitive. Accepts the full word (info), the 3-letter form (INF), or the number (2). trace is most verbose, off disables logging.'
  ),
  // Internal: boot.js dispatches on this token (getBootType) and cli.js spawns the
  // sidecar daemon with it. Not user-facing — `pear sidecar` is the equivalent for
  // humans — so hidden rather than hinted: hiding keeps it out of both --help and,
  // once wired, the interactive menu, where every listed flag reads as user-facing.
  flag('--sidecar', 'Internal. Boot this process as the sidecar').hide(),
  flag('--dht-bootstrap <nodes>').hide()
]

module.exports = {
  definition,
  command: (argv) =>
    command('pear', ...definition, arg('[cmd]'), rest('rest')).parse(argv, {
      // Used only for bootstrap flag extraction. Defer unknown flags and other CLI errors to the main parser.
      bails: false
    })
}
