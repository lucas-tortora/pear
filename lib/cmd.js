'use strict'
const { flag, command, arg, rest } = require('paparam')

const definition = [
  flag('-v', 'Print version'),
  flag(
    '--log-level|-L <level>',
    'Verbosity to log at — off, error, info, or trace (also accepts 0-3)'
  ),
  // Internal: boot.js dispatches on this token (getBootType) and cli.js spawns the sidecar
  // daemon with it. Hidden so it stays out of `pear help`, and out of the interactive
  // command menu once --menu lands. `pear sidecar` is the user-facing equivalent.
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
