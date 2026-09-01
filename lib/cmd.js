'use strict'
const { flag, command, arg, rest } = require('paparam')
const H = require('../cmd/hints.js')

const definition = [
  flag('-v', 'Print version').hint(H.root.v.text),
  flag('--log-level|-L <level>', 'Verbosity to log at — 0=off, 1=error, 2=info, or 3=trace').hint(
    H.root.logLevel.text
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
