'use strict'

/*
 * adonis-cli
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const path = require('path')
const ace = require('adonis-ace')
const fs = require('fs-extra')
const Chalk = require('chalk')
const exec = require('child_process').exec
const pify = require('pify')
const steps = require('../src/Commands/New/steps')
const NewCommand = require('../src/Commands/New')

const chalk = new Chalk.constructor({ enabled: false })

test.group('New | Command', (group) => {
  group.before(() => {
    this.removeDir = function (dir) {
      if (process.platform === 'win32') {
        return Promise.resolve()
      }
      return fs.remove(dir)
    }
  })
  group.beforeEach(() => {
    ace.commands = {}
  })

  test('set default blueprint to app-slim', async (assert) => {
    const newCommand = new NewCommand()
    assert.equal(newCommand._getBluePrint({}), 'adonisjs/adonis-slim-app')
  })

  test('update blueprint when --api-only flag is defined', async (assert) => {
    const newCommand = new NewCommand()
    assert.equal(newCommand._getBluePrint({ apiOnly: true }), 'adonisjs/adonis-api-app')
  })

  test('update blueprint when --full-stack flag is defined', async (assert) => {
    const newCommand = new NewCommand()
    assert.equal(newCommand._getBluePrint({ fullStack: true }), 'adonisjs/adonis-app')
  })

  test('give priority to api-only over full-stack', async (assert) => {
    const newCommand = new NewCommand()
    assert.equal(newCommand._getBluePrint({ fullStack: true, apiOnly: true }), 'adonisjs/adonis-api-app')
  })

  test('give priority to blueprint over everything', async (assert) => {
    const newCommand = new NewCommand()
    assert.equal(newCommand._getBluePrint({ fullStack: true, apiOnly: true, 'blueprint': 'adonuxt' }), 'adonuxt')
  })
})

test.group('New | Steps | Verify Existing App', () => {
  test('throw error when app dir exists and not empty', async (assert) => {
    const appPath = path.join(__dirname, './yardstick')
    await fs.ensureFile(path.join(appPath, 'package.json'))
    assert.plan(1)
    try {
      await steps.verifyExistingApp(appPath, chalk, function () {})
    } catch ({ message }) {
      assert.include(message, 'Cannot override contents of yardstick')
      await this.removeDir(appPath)
    }
  })

  test('work fine with directory exists but is empty', async (assert) => {
    const appPath = path.join(__dirname, './yardstick')
    await fs.ensureDir(appPath)
    await steps.verifyExistingApp(appPath, chalk, function () {})
    await this.removeDir(appPath)
  })

  test('ignore when directory doesn\'t exists', async (assert) => {
    const appPath = path.join(__dirname, './yardstick')
    await steps.verifyExistingApp(appPath, chalk, function () {})
  })
})

test.group('New | Steps | clone', () => {
  test('throw error when cannot clone repo', async (assert) => {
    const appPath = path.join(__dirname, './yardstick')
    assert.plan(1)
    try {
      await steps.clone('adonisjs/foo-app', appPath, chalk, function () {})
    } catch ({ message }) {
      assert.isDefined(message)
    }
  }).timeout(0)

  test('clone repo when it exists', async (assert) => {
    const appPath = path.join(__dirname, './yardstick')
    await steps.clone('adonisjs/adonis-app', appPath, chalk, function () {})
    await fs.pathExists(appPath)
    await this.removeDir(appPath)
  }).timeout(0)

  test('clone repo with specific branch', async (assert) => {
    const appPath = path.join(__dirname, './yardstick')
    await steps.clone('adonisjs/adonis-app', appPath, chalk, function () {}, 'develop')
    await fs.pathExists(appPath)
    process.chdir(appPath)
    const branch = await pify(exec)('git branch')
    assert.equal(branch.replace('*', '').trim(), 'develop')
    await this.removeDir(appPath)
    process.chdir(__dirname)
  }).timeout(0)
})

test.group('New | Steps | copy env file', () => {
  test('Copy env.example to .env', async (assert) => {
    const appPath = path.join(__dirname, './yardstick')
    await fs.ensureFile(path.join(appPath, '.env.example'))
    process.chdir(appPath)
    await steps.copyEnvFile(appPath, fs.copy.bind(fs), chalk, function () {})
    await fs.pathExists(path.join(appPath, '.env'))
    await this.removeDir(appPath)
    process.chdir(__dirname)
  }).timeout(0)
})