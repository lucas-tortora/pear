'use strict'
const paparam = require('paparam')
const { header, footer, command, flag, arg, summary, description, bail, rest, validate } = paparam
const { usage, print } = require('../lib/terminal.js')
const { cmdArgs } = require('../argv')
const errors = require('pear-errors')
const { definition } = require('../lib/cmd')
const { UPGRADE, PEAR_DEV_ROOT } = require('../constants.js')

const commands = {
  touch: require('./touch'),
  stage: require('./stage'),
  build: require('pear-build'),
  seed: require('./seed'),
  provision: require('./provision'),
  multisig: require('./multisig'),
  info: require('./info'),
  dump: require('./dump'),
  install: require('pear-install/cmd').runner,
  data: require('./data'),
  changelog: require('./changelog'),
  sidecar: require('./sidecar'),
  gc: require('./gc'),
  cores: require('./cores'),
  versions: require('./versions')
}

module.exports = async (ipc, argv = cmdArgs) => {
  await ipc.ready()

  Bare.prependListener('exit', () => {
    ipc.close()
  })

  const touch = command(
    'touch',
    summary('Generate a project link'),
    description`Create a new randomly generated Pear link`,
    flag('--json', 'Newline delimited JSON output'),
    flag('--vanity <vanity>', 'Generate a vanity link with this prefix'),
    commands.touch
  )

  const seed = command(
    'seed',
    summary('Seed or reseed a project'),
    description`
      Specify a link to seed a project.
    `,
    arg('<link>', 'Pear link to seed'),
    flag(
      '--no-tty',
      'Disable the live terminal UI and print plain log lines instead (interactive UI is on by default)'
    ),
    flag(
      '--until-sync <key>',
      'Exit once the peer with this public key has fully synced (repeat the flag to wait on more than one peer)'
    ).multiple(),
    flag(
      '--stats-interval <ms>',
      'How often to refresh the live stats display, in milliseconds (defaults to 500ms, or 3000ms with --no-tty)'
    ),
    flag('--json', 'Newline delimited JSON output'),
    commands.seed
  )

  const build = command('build', require('pear-build/package.json').command, (cmd) => {
    if (!cmd.flags.package) return console.log(build.help())
    return commands.build(cmd.flags).done()
  })

  const stage = command(
    'stage',
    summary('Sync disk changes into project'),
    description`
      Stage local changes to a project link and print a diff plus the resulting project link.
    `,
    arg('<link>', 'Pear link to stage'),
    arg('[dir=.]', 'Project directory to stage from (defaults to the current directory)'),
    flag('--dry-run|-d', 'Preview without writing any changes'),
    flag('--ignore <paths>', 'Comma-separated path ignore list'),
    flag('--purge', 'Remove ignored files if present in previous stage'),
    flag('--only <paths>', 'Only stage these comma-separated paths'),
    // TODO(dev): "version length" is internal terminology, unexplained anywhere in the help
    // text. Confirm exact meaning before rewriting further — see the pear --menu help-text
    // audit for context.
    flag('--truncate <n>', 'Advanced. Truncate to version length n'),
    flag('--json', 'Newline delimited JSON output'),
    commands.stage
  )

  const provision = command(
    'provision',
    summary('Block-sync source & production'),
    description`
      Synchronize blocks from a source link to a pre-production target link, so the target can later be multisig'd against a production link. Use pear touch to generate the target link first.
    `,
    arg('<source-verlink>', 'Versioned source link'),
    arg('<target-link>', 'Target link to sync to'),
    arg('<production-verlink>', 'Versioned link to sync against'),
    flag('--dry-run|-d', 'Preview without writing any changes'),
    flag('--json', 'Newline delimited JSON output'),
    commands.provision
  )

  const multisig = command(
    'multisig',
    summary('Production signing coordination'),
    description`
      Quorum-based cryptographic cosigning for production releases

      Gather enough signatures to approve a release to synchronize
      onto a production link

      Example - 2/3 must sign to approve
      pear.json: {
        "multisig": {
          "publicKeys": ["<pubkey1>", "<pubkey2>", "<pubkey3>"],
          "namespace": "my-org/my-app",
          "quorum": 2
        }
      }
    `,
    command(
      'keys',
      summary('Manage signing keys'),
      command(
        'get',
        summary('Get signing key, initializing if needed'),
        description`
          Idempotent — creates a public/private keypair if one doesn't already exist, then always prints the public key.
        `,
        arg(
          '[name=default]',
          'Key identifier, used to name the public/private key files on disk (defaults to "default")'
        ),
        flag(
          '--secret',
          'Also print the private key (sensitive — avoid sharing your terminal output)'
        ),
        flag('--json', 'Newline delimited JSON output'),
        commands.multisig
      ),
      command(
        'paths',
        summary('Print paths to public & private key files'),
        arg(
          '[name=default]',
          'Key identifier, used to name the public/private key files on disk (defaults to "default")'
        ),
        flag('--json', 'Newline delimited JSON output'),
        commands.multisig
      ),
      command(
        'list',
        summary('List signing keys'),
        description`
          Output all names and public keys
        `,
        flag('--json', 'Newline delimited JSON output'),
        commands.multisig
      ),
      command(
        'add',
        summary('Add signing keys'),
        description`
          Import a signing keypair or add a known public key
        `,
        arg(
          '<name>',
          "Name to file this key under (a new identifier — this isn't an existing file)"
        ),
        arg('<public-key>', 'Public key — a path to a key file, or the key string itself'),
        arg(
          '[private-key]',
          'Private key — a path to a key file, or the key string itself (optional; omit to add a public key only)'
        ),
        flag('--json', 'Newline delimited JSON output'),
        commands.multisig
      ),
      command(
        'remove',
        summary('Remove signing keys'),
        arg('<name>', 'Name of the key to remove'),
        flag('--json', 'Newline delimited JSON output'),
        commands.multisig
      ),
      (cmd) => console.log(cmd.command.help())
    ),
    command(
      'link',
      summary('Print project multisig link'),
      description`
        The multisig link is derived from the publicKeys, quorum, and namespace fields in your project's pear.json. See pear.json for the full example.
      `,
      flag('--config [./pear.json]', "Path to the project's pear.json (defaults to ./pear.json)"),
      flag('--vanity <vanity>', 'Generate a vanity link with this prefix'),
      flag('--json', 'Newline delimited JSON output'),
      commands.multisig
    ),
    command(
      'request',
      summary('Create a multisig request'),
      description`
        Create a signing request to synchronize a versioned source link onto the project's multisig link (the one printed by pear multisig link).
      `,
      flag('--force', 'Skip sanity checks'),
      flag('--config [./pear.json]', "Path to the project's pear.json (defaults to ./pear.json)"),
      flag('--peer-update-timeout <ms>', 'How long to wait for peers to update, in milliseconds'),
      flag('--json', 'Newline delimited JSON output'),
      arg('<verlink>', 'Versioned source link to sign off'),
      commands.multisig
    ),
    command(
      'sign',
      summary('Sign a multisig request'),
      description`
        Sign a multisig request using a local signing key. The key's public counterpart must be listed in the multisig.publicKeys field of the pear.json at the source link supplied to pear multisig request.
      `,
      arg('<request>', 'As returned by pear multisig request'),
      arg('[name=default]', 'Local key to sign with, by name (defaults to "default")'),
      flag('--json', 'Newline delimited JSON output'),
      commands.multisig
    ),
    command(
      'verify',
      summary('Verify multisig request & responses'),
      description('Verify inputs and perform a commit dry run'),
      flag('--force-dangerous', 'Advanced. Careful, this may break the core').hide(),
      flag('--config [./pear.json]', "Path to the project's pear.json (defaults to ./pear.json)"),
      flag('--peer-update-timeout <ms>', 'How long to wait for peers to update, in milliseconds'),
      flag('--json', 'Newline delimited JSON output'),
      arg('<source-link>', 'Source Pear link'),
      arg('<request>', 'Signing request'),
      rest('[...responses]', 'Signing responses'),
      commands.multisig
    ),
    command(
      'commit',
      summary('Commit multisig to go live'),
      description('Apply signatures to allow sync from source drive to multisig drive'),
      flag('--config [./pear.json]', "Path to the project's pear.json (defaults to ./pear.json)"),
      flag('--force-dangerous', 'Advanced. Careful, this may break the core').hide(),
      flag('--peer-update-timeout <ms>', 'How long to wait for peers to update, in milliseconds'),
      flag('--json', 'Newline delimited JSON output'),
      arg('<source-link>', 'Source Pear link'),
      arg('<request>', 'Signing request'),
      rest('[...responses]', 'Signing responses'),
      commands.multisig
    ),
    (cmd) => console.log(cmd.command.help())
  )

  const info = command(
    'info',
    summary('View project information'),
    description`
      View information about a project. Supply a link to inspect a specific project, or omit it to view platform information.
    `,
    arg('[link]', 'Project to view info for'),
    arg('[dir=.]', 'Project directory path (defaults to the current directory)'),
    flag('--changelog', 'View changelog only').hide(),
    flag('--full-changelog', 'Full record of changes').hide(),
    flag('--changelog-max <n>', 'Maximum changelog entries').hide(),
    flag('--metadata', 'View metadata only'),
    flag('--manifest', 'View app manifest only'),
    flag('--multisig', 'View multisig info only'),
    flag('--key', 'View key only'),
    flag('--json', 'Newline delimited JSON output'),
    commands.info
  )

  const dump = command(
    'dump',
    summary('Synchronize files from a link to a directory'),
    arg('<link>', 'Link to dump from. May be file:, pear: or dir'),
    arg('<dir>', 'Directory path to dump to. Use - for output-only'),
    flag('--dry-run|-d', 'Preview without writing any changes'),
    // TODO(dev): "version length" is internal terminology, unexplained anywhere in the help
    // text. Confirm exact meaning before rewriting further — see the pear --menu help-text
    // audit for context.
    flag('--checkout <n>', 'Dump from specified checkout, n is version length'),
    flag('--only <paths>', 'Only dump these comma-separated paths (implies --no-prune)'),
    flag('--force|-f', 'Force overwrite existing files'),
    flag('--list', 'List paths at link. Sets <dir> to -'),
    flag(
      '--no-prune',
      'Keep existing files at the destination that no longer exist at the source (pruning is on by default)'
    ),
    flag('--json', 'Newline delimited JSON output'),
    validate((cmd) => {
      if (cmd.flags.list) cmd.args.dir = '-'
      return true
    }),
    validate('<dir> is required', (cmd) => !!cmd.args.dir), // TODO fix in paparam
    commands.dump
  )

  const install = command(
    'install',
    arg('<link>', 'Pear link origin to install from'),
    require('pear-install/package.json').command,
    commands.install
  )

  const data = command(
    'data',
    summary('Explore platform database'),
    command('dht', summary('DHT known-nodes cache'), commands.data),
    command('multisig', summary('Multisig records'), commands.data),
    flag('--json', 'Newline delimited JSON output'),
    (cmd) => {
      console.log(cmd.command.help())
    }
  )

  const changelog = command(
    'changelog',
    summary('View project changelog'),
    description`
      View a project's changelog. Supply a link to inspect a specific project, or omit it to view Pear's own changelog.
    `,
    arg('[link]', 'Project to view changelog of'),
    flag('--max|-m <n=10>', 'Maximum number of entries to show (defaults to 10)'),
    flag(
      '--of <semver=^*>',
      'Only show entries matching this semver range (defaults to the latest major version)'
    ),
    flag('--full', 'Show entire changelog'),
    flag('--json', 'Newline delimited JSON output'),
    commands.changelog
  )

  const sidecar = command(
    'sidecar',
    command('shutdown', commands.sidecar, summary('Shutdown running sidecar')),
    command('inspect', commands.sidecar, summary('Enable running sidecar inspector')),
    summary('Advanced. Run sidecar in terminal'),
    description`
      The sidecar is a local IPC server that brokers corestore access for every running Pear app. Running pear sidecar shuts down any existing sidecar and takes over as the new one, staying attached to this terminal.
    `,
    command('shutdown', commands.sidecar, summary('Shutdown running sidecar')),
    flag(
      '--log-level <level>',
      'Verbosity to log at — off, error, info, or trace (also accepts 0-3)'
    ),
    flag('--dht-bootstrap <nodes>').hide(),
    commands.sidecar
  )

  const gc = command(
    'gc',
    summary('Advanced. Clear dangling resources'),
    command(
      'cores',
      summary('Clear unused corestore cores'),
      arg('[link]', 'Only clear cores belonging to this link (omit to clear all unused cores)'),
      commands.gc
    ),
    flag('--json', 'Newline delimited JSON output'),
    () => {
      console.log(gc.help())
    }
  )

  const cores = command(
    'cores',
    summary('List platform cores'),
    description`Every core currently tracked in the platform's corestore, whether or not it's in active use.`,
    flag('--all-cores', 'List all cores, including empty cores'),
    flag('--json', 'Newline delimited JSON output'),
    commands.cores
  )

  const versions = command(
    'versions',
    summary('View dependency versions'),
    flag('--modules|-m', 'Include module versions'),
    flag('--json', 'Newline delimited JSON output'),
    commands.versions
  )

  const help = command(
    'help',
    arg('[command]', 'Command to show help for (omit to show the full overview)'),
    summary('View help for command'),
    (h) => {
      if (h.args.command) console.log(cmd.help(h.args.command))
      else console.log(cmd.overview({ full: true }))
    }
  )

  const cmd = command(
    'pear',
    ...definition,
    header(usage.header),
    touch,
    seed,
    stage,
    build,
    provision,
    multisig,
    info,
    dump,
    install,
    data,
    changelog,
    sidecar,
    gc,
    cores,
    versions,
    help,
    footer(usage.footer),
    bail(function explain(bail = {}) {
      if (!bail.reason && bail.err) {
        const known = errors.known()
        if (known.includes(bail.err.code) === false) {
          print(
            errors.ERR_UNKNOWN(
              'Unknown [ code: ' + (bail.err.code || '(none)') + ' ] ' + bail.err.stack
            ),
            false
          )
          Bare.exit(1)
        }
      }
      const messageUsage = (bail) => bail.err.message
      const messageOnly = (bail) => bail.err.message
      const opFail = (cmd) => cmd.err.info.message
      const codemap = new Map([
        ['UNKNOWN_FLAG', (bail) => 'Unrecognized Flag: --' + bail.flag.name],
        [
          'UNKNOWN_ARG',
          (bail) =>
            'Unrecognized Argument at index ' + bail.arg.index + ' with value ' + bail.arg.value
        ],
        ['MISSING_ARG', (bail) => bail.arg.value],
        ['INVALID', messageUsage],
        ['ERR_INVALID_INPUT', messageUsage],
        ['ERR_LEGACY', messageOnly],
        ['ERR_INVALID_TEMPLATE', messageOnly],
        ['ERR_DIR_NONEMPTY', messageOnly],
        ['ERR_OPERATION_FAILED', opFail]
      ])
      const nouse = [messageOnly, opFail]
      const code = codemap.has(bail.err?.code) ? bail.err.code : bail.reason
      const ref = codemap.get(code)
      const reason = codemap.has(code) ? (codemap.get(code)(bail) ?? bail.reason) : bail.reason
      Bare.exitCode = 1

      print(reason, false)

      if (nouse.some((fn) => fn === ref) || codemap.has(code) === false) return

      print('\n' + bail.command.usage())
    }),
    pear
  )

  async function pear({ flags }) {
    if (flags.v) {
      const pkg = require('../package.json')
      const { version } = pkg
      const devRoot = PEAR_DEV_ROOT
      const vinfo = await ipc.versions()
      const key = vinfo?.platform?.key || UPGRADE
      const fork = devRoot ? null : (vinfo?.platform?.fork ?? null)
      const length = devRoot ? null : (vinfo?.platform?.length ?? null)
      const hasVersioned = fork !== null && length !== null
      const versionedKey = hasVersioned ? `pear://${fork}.${length}.${stripPearPrefix(key)}` : key
      if (flags.json) {
        console.log(
          JSON.stringify({ key, version, path: devRoot, fork: fork, length, versionedKey })
        )
        return
      }
      console.log(versionedKey + ' / v' + version + '\n')

      if (devRoot) console.log('Path=' + devRoot)
      else console.log('Key=' + key)
      console.log('SemVer=' + version)
      if (fork !== null) console.log('Fork=' + fork)
      if (length !== null) console.log('Length=' + length)
      return
    }
    console.log(cmd.overview())
  }

  function stripPearPrefix(link) {
    if (typeof link !== 'string') return ''
    return link.startsWith('pear://') ? link.slice('pear://'.length) : link
  }

  const shell = require('../lib/cmd').command(argv)
  const cmdIx = shell?.indices.args.cmd ?? -1
  if (cmdIx > -1) argv = argv.slice(cmdIx)

  if (argv[0] === 'run') {
    const message =
      'pear run has been removed.\nUse the pear-runtime module instead: https://www.npmjs.com/package/pear-runtime'
    print(message, false)
    Bare.exitCode = 1
    ipc.close()
    return null
  }

  const program = cmd.parse(argv)

  if (program === null) {
    ipc.close()
    return null
  }

  if (program.running) {
    program.running.finally(() => {
      ipc.close()
    })
  }

  return program
}
