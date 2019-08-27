/*
* @adonisjs/cli
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { join } from 'path'
import * as semver from 'semver'

/**
 * Returns a boolean telling if current Node.js version satisfies
 * the minimum required Node version.
 */
export function satisfiesNodeVersion (): boolean {
  const version = process.version
  const parsedVersion = semver.parse(version)
  return !!(parsedVersion && parsedVersion.major >= 10)
}

/**
 * Returns AdonisJs core version
 */
export function getAdonisCoreVersion (cwd: string): string | null {
  try {
    const pkgPath = require.resolve('@adonisjs/core/package.json', {
      paths: [cwd],
    })
    return require(pkgPath).version
  } catch (error) {
    return null
  }
}

/**
 * Returns AdonisJs core version
 */
export function getCliVersion (): string | null {
  try {
    return require(join(__dirname, '..', '..', '..', 'package.json')).version
  } catch (error) {
    return null
  }
}

/**
 * Returns the env variables to be set inside the child
 * processes.
 */
export function getChildProcessEnvVariables (): { [key: string]: string } {
  return {
    FORCE_COLOR: 'true',
    ADONIS_CLI: 'true',
    ADONIS_CLI_VERSION: getCliVersion() || 'NA',
  }
}