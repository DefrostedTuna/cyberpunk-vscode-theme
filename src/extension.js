let path = require('path')
let fs = require('fs')
let vscode = require('vscode')

/**
 * Activate the Cyberpunk extension.
 * 
 * @param {Object} context 
 * 
 * @returns {Void}
 */
function activate(context) {
  let config = getConfigValues()

  let commandEnableGlow = vscode.commands.registerCommand('cyberpunk.enableGlow', enableGlow)
  let commandDisableGlow = vscode.commands.registerCommand('cyberpunk.disableGlow', disableGlow)
}

/**
 * Deactivate the Cyberpunk extension.
 *
 * @returns {Void}
 */
function deactivate() {
  // Don't remove the theme when editor is restarted!
}

/**
 * Fetches the config values from VSCode.
 *
 * @returns {Object}
 */
function getConfigValues() {
  let config = vscode.workspace.getConfiguration('cyberpunk')

  // Enable Glow
  let disableGlow = (config && config.disableGlow) ? !! config.disableGlow : false

  // Intensity
  let intensity = 0.5 // Default
  let configIntensity = parseFloat(config.intensity)
  if (! isNaN(configIntensity) && configIntensity > 1) {
    intensity = 1
  } else if (isNaN(configIntensity) || (! isNaN(configIntensity) && configIntensity < 0)) {
    disableGlow = true
  } else if (! isNaN(configIntensity)) {
    intensity = configIntensity
  }

  // Radiance
  let radance = 3 // Default
  let configRadiance = parseInt(config.radiance)
  if (! isNaN(configRadiance) && configRadiance > 4) {
    radiance = 4
  } else if (isNaN(configRadiance) || (! isNaN(configRadiance) && configRadiance < 0)) {
    radiance = 0
  } else if (! isNaN(configRadiance)) {
    radiance = configRadiance
  }

  return {
    disableGlow,
    intensity,
    radiance
  }
}

/**
 * Enables the glow effect for the theme.
 *
 * @returns {Void}
 */
function enableGlow() {
  let config = getConfigValues()
  let intensityHex = Math.floor(config.intensity * 255).toString(16).toUpperCase()

  let isWin = /^win/.test(process.platform) // Check if the platform has 'win' present in the string.
  let appDir = path.dirname(require.main.filename)
  let base = appDir + (isWin ? "\\vs\\code" : "/vs/code")
  let htmlFile = templateFile = base

  if (isWin) {
    htmlFile += '\\electron-browser\\workbench\\workbench.html'
    templateFile += '\\electron-browser\\workbench\\cyberpunk.js'
  } else {
    htmlFile += '/electron-browser/workbench/workbench.html'
    templateFile += '/electron-browser/workbench/cyberpunk.js'
  }

  try {
    // Get the template and write any changes to the system so that the HTML can pick up the JS file.
    let glowInjection = fs.readFileSync(__dirname + '/js/glow-injection.js', 'utf-8')
      .replace(/\[INTENSITY\]/g, intensityHex)
      .replace(/\[RADIANCE\]/g, config.radiance)

    let htmlContent = fs.readFileSync(htmlFile, 'utf-8')
    fs.writeFileSync(templateFile, glowInjection, 'utf-8')

    if (! htmlContent.includes('cyberpunk.js') && ! config.disableGlow) {
      // Place the script at the very bottom of the file.
      let updatedHtmlContent = htmlContent.replace(/\<\/html\>/g, `<script src="cyberpunk.js"></script>\n</html>`)
      fs.writeFileSync(htmlFile, updatedHtmlContent, 'utf-8')

      vscode.window.showInformationMessage('Glow effect has been enabled. Please reload VSCode to see the changes.', { title: "Reload VSCode" })
      .then(function(msg) {
        vscode.commands.executeCommand("workbench.action.reloadWindow")
      })
    } else if (config.disableGlow) {
      vscode.window.showInformationMessage('Glow effect is disabled via user configuration.')
      disableGlow(true)
    } else {
      vscode.window.showInformationMessage('Glow effect is already active. To see any recent changes, please reload VSCode.', { title: "Reload VSCode" })
      .then(function(msg) {
        vscode.commands.executeCommand("workbench.action.reloadWindow")
      })
    }
  } catch (e) {
    if (/ENOENT|EACCES|EPERM/.test(e.code)) {
      vscode.window.showInformationMessage('You must run VSCode with admin priviliges in order to enable the glow effect.')
      return
    } else {
      vscode.window.showErrorMessage('Something went wrong. Please check the console for more information.')
      console.log(e)
      return
    }
  }
}

/**
 * Disabls the glow effect fr the theme.
 *
 * @param {Boolean} [hideUserMessage = false]
 */
function disableGlow(hideUserMessage = false) {
  let isWin = /^win/.test(process.platform) // Check if the platform has 'win' present in the string.
  let appDir = path.dirname(require.main.filename)
  let base = appDir + (isWin ? "\\vs\\code" : "/vs/code")
  let htmlFile = templateFile = base

  if (isWin) {
    htmlFile += '\\electron-browser\\workbench\\workbench.html'
    templateFile += '\\electron-browser\\workbench\\cyberpunk.js'
  } else {
    htmlFile += '/electron-browser/workbench/workbench.html'
    templateFile += '/electron-browser/workbench/cyberpunk.js'
  }

  let htmlContent = fs.readFileSync(htmlFile, 'utf-8')

  if (htmlContent.includes('cyberpunk.js')) {
    // Remove the tag and content
    htmlContent = htmlContent.replace(/<script src="cyberpunk.js"><\/script>/gm, '')
    fs.writeFileSync(htmlFile, htmlContent, 'utf-8')

    if (! hideUserMessage) {
      vscode.window.showInformationMessage('Glow effect disabled. Please reload VSCode for the changes to take effect.', { title: "Reload VSCode" })
        .then(function(msg) {
          vscode.commands.executeCommand("workbench.action.reloadWindow")
        })
    }
  } else {
    if (! hideUserMessage) {
      vscode.window.showInformationMessage('Glow effect already disabled.')
    }
  }
}

module.exports = { 
  activate,
  deactivate
}