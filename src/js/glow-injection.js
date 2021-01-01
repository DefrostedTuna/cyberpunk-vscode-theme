(function () { 
  let bodyNode = document.querySelector('body')

  let init = (observer = null) => {
    let themeStyles = document.querySelector('.vscode-tokens-styles')

    if (! themeStyles) {
      return
    }

    let radiance = parseInt("[RADIANCE]")
    let colors = {
      '#FE4450': {
        textColor: '#FFFFFFF2',
        shadowColor: '#FF0011[INTENSITY]'
      },
      '#E0008E': {
        textColor: '#FFFFFFF2',
        shadowColor: '#FF00A1[INTENSITY]'
      },
      '#FCEE0A': {
        textColor: '#FFF980',
        shadowColor: '#FCEE0A[INTENSITY]'
      }
    }

    let updatedThemeStyles = themeStyles.innerText

    for (let color in colors) {
      if (! colors.hasOwnProperty(color)) {
        continue
      }

      let replace = `color: ${color};`
      let expression = new RegExp(replace, 'ig')

      if (radiance === 1) {
        updatedThemeStyles = updatedThemeStyles.replace(expression, `color: ${colors[color].textColor}; text-shadow: 0 0 1px #000, 0 0 5px ${colors[color].shadowColor};`)
      } else if (radiance === 2) {
        updatedThemeStyles = updatedThemeStyles.replace(expression, `color: ${colors[color].textColor}; text-shadow: 0 0 1px #000, 0 0 5px ${colors[color].shadowColor}, 0 0 10px ${colors[color].shadowColor};`)
      } else if (radiance === 3) {
        updatedThemeStyles = updatedThemeStyles.replace(expression, `color: ${colors[color].textColor}; text-shadow: 0 0 1px #000, 0 0 5px ${colors[color].shadowColor}, 0 0 10px ${colors[color].shadowColor}, 0 0 15px ${colors[color].shadowColor};`)
      } else if (radiance === 4) {
        updatedThemeStyles = updatedThemeStyles.replace(expression, `color: ${colors[color].textColor}; text-shadow: 0 0 1px #000, 0 0 5px ${colors[color].shadowColor}, 0 0 10px ${colors[color].shadowColor}, 0 0 15px ${colors[color].shadowColor}, 0 0 20px ${colors[color].shadowColor};`)
      } else if (radiance === 5) {
        updatedThemeStyles = updatedThemeStyles.replace(expression, `color: ${colors[color].textColor}; text-shadow: 0 0 1px #000, 0 0 5px ${colors[color].shadowColor}, 0 0 10px ${colors[color].shadowColor}, 0 0 15px ${colors[color].shadowColor}, 0 0 20px ${colors[color].shadowColor}, 0 0 25px ${colors[color].shadowColor};`)
      }
    }

    let newStyleTag = document.createElement('style')
    newStyleTag.setAttribute('id', 'cyberpunk-syle-override')
    newStyleTag.innerText = updatedThemeStyles.replace(/(\r\n|\n|\r)/gm, '')
    document.body.appendChild(newStyleTag)

    if (observer) {
      observer.disconnect()
    }
  }

  let watchForInit = function(mutations, observer) {
    for (let mutation of mutations) {
      if (mutation.type == 'attributes') {
        let tokensNode = document.querySelector('.vscode-tokens-styles')

        if (tokensNode) {
          observer.disconnect()
          observer.observe(tokensNode, { childList: true })
        }
      }

      if (mutation.type == 'childList') {
        let tokensNode = document.querySelector('.vscode-tokens-styles')
        let tokensNodeContent = document.querySelector('.vscode-tokens-styles').innerText

        if (tokensNode && tokensNodeContent) {
          init(observer)
        }
      }
    }
  }

  init()

  const observer = new MutationObserver(watchForInit);
  observer.observe(bodyNode, { attributes: true });
})()