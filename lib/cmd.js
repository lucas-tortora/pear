'use strict'
const { flag, command, arg, rest } = require('paparam')

const definition = [
  flag('-v', 'Print version'),
  flag(
    '--log-level|-L <level>',
    'Verbosity to log at — off, error, info, or trace (also accepts 0-3)'
  ),
  // TODO(dev): confirm this description matches actual --sidecar behavior before merging —
  // "Raw boot Sidecar" is unclear outside the team. See the pear --menu help-text audit.
  flag('--sidecar', 'Start the sidecar directly, skipping normal command routing'),
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
